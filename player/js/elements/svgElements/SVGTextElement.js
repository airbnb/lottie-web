import {
  extendPrototype,
} from '../../utils/functionExtensions';
import {
  createSizedArray,
} from '../../utils/helpers/arrays';
import createNS from '../../utils/helpers/svg_elements';
import BaseElement from '../BaseElement';
import TransformElement from '../helpers/TransformElement';
import SVGBaseElement from './SVGBaseElement';
import HierarchyElement from '../helpers/HierarchyElement';
import FrameElement from '../helpers/FrameElement';
import RenderableDOMElement from '../helpers/RenderableDOMElement';
import ITextElement from '../TextElement';
import SVGCompElement from './SVGCompElement'; // eslint-disable-line
import SVGShapeElement from './SVGShapeElement';

var emptyShapeData = {
  shapes: [],
};

function SVGTextLottieElement(data, globalData, comp) {
  this.textSpans = [];
  this.renderType = 'svg';
  this.initElement(data, globalData, comp);
}

extendPrototype([BaseElement, TransformElement, SVGBaseElement, HierarchyElement, FrameElement, RenderableDOMElement, ITextElement], SVGTextLottieElement);

SVGTextLottieElement.prototype.createContent = function () {
  if (this.data.singleShape && !this.globalData.fontManager.chars) {
    this.textContainer = createNS('text');
  }
};

SVGTextLottieElement.prototype.buildTextContents = function (textArray) {
  var i = 0;
  var len = textArray.length;
  var textContents = [];
  var currentTextContent = '';
  while (i < len) {
    if (textArray[i] === String.fromCharCode(13) || textArray[i] === String.fromCharCode(3)) {
      textContents.push(currentTextContent);
      currentTextContent = '';
    } else {
      currentTextContent += textArray[i];
    }
    i += 1;
  }
  textContents.push(currentTextContent);
  return textContents;
};

SVGTextLottieElement.prototype.buildShapeData = function (data, scale) {
  // data should probably be cloned to apply scale separately to each instance of a text on different layers
  // but since text internal content gets only rendered once and then it's never rerendered,
  // it's probably safe not to clone data and reuse always the same instance even if the object is mutated.
  // Avoiding cloning is preferred since cloning each character shape data is expensive
  if (data.shapes && data.shapes.length) {
    var shape = data.shapes[0];
    if (shape.it) {
      var shapeItem = shape.it[shape.it.length - 1];
      if (shapeItem.s) {
        shapeItem.s.k[0] = scale;
        shapeItem.s.k[1] = scale;
      }
    }
  }
  return data;
};

SVGTextLottieElement.prototype.buildNewText = function () {
  this.addDynamicProperty(this);
  var i;
  var len;

  var documentData = this.textProperty.currentData;
  this.renderedLetters = createSizedArray(documentData ? documentData.l.length : 0);
  if (documentData.fc) {
    this.layerElement.setAttribute('fill', this.buildColor(documentData.fc));
  } else {
    this.layerElement.setAttribute('fill', 'rgba(0,0,0,0)');
  }
  if (documentData.sc) {
    this.layerElement.setAttribute('stroke', this.buildColor(documentData.sc));
    this.layerElement.setAttribute('stroke-width', documentData.sw);
  }
  this.layerElement.setAttribute('font-size', documentData.finalSize);
  var fontData = this.globalData.fontManager.getFontByName(documentData.f);
  if (fontData.fClass) {
    this.layerElement.setAttribute('class', fontData.fClass);
  } else {
    this.layerElement.setAttribute('font-family', fontData.fFamily);
    var fWeight = documentData.fWeight;
    var fStyle = documentData.fStyle;
    this.layerElement.setAttribute('font-style', fStyle);
    this.layerElement.setAttribute('font-weight', fWeight);
  }
  this.layerElement.setAttribute('aria-label', documentData.t);

  var letters = documentData.l || [];
  var usesGlyphs = !!this.globalData.fontManager.chars;
  len = letters.length;

  var tSpan;
  var matrixHelper = this.mHelper;
  var shapeStr = '';
  var singleShape = this.data.singleShape;
  var xPos = 0;
  var yPos = 0;
  var firstLine = true;
  var trackingOffset = documentData.tr * 0.001 * documentData.finalSize;
  if (singleShape && !usesGlyphs && !documentData.sz) {
    var tElement = this.textContainer;
    var justify = 'start';
    switch (documentData.j) {
      case 1:
        justify = 'end';
        break;
      case 2:
        justify = 'middle';
        break;
      default:
        justify = 'start';
        break;
    }
    tElement.setAttribute('text-anchor', justify);
    tElement.setAttribute('letter-spacing', trackingOffset);
    var textContent = this.buildTextContents(documentData.finalText);
    len = textContent.length;
    yPos = documentData.ps ? documentData.ps[1] + documentData.ascent : 0;
    for (i = 0; i < len; i += 1) {
      tSpan = this.textSpans[i].span || createNS('tspan');
      tSpan.textContent = textContent[i];
      tSpan.setAttribute('x', 0);
      tSpan.setAttribute('y', yPos);
      tSpan.style.display = 'inherit';
      tElement.appendChild(tSpan);
      if (!this.textSpans[i]) {
        this.textSpans[i] = {
          span: null,
          glyph: null,
        };
      }
      this.textSpans[i].span = tSpan;
      yPos += documentData.finalLineHeight;
    }

    this.layerElement.appendChild(tElement);
  } else {
    var cachedSpansLength = this.textSpans.length;
    var charData;
    for (i = 0; i < len; i += 1) {
      if (!this.textSpans[i]) {
        this.textSpans[i] = {
          span: null,
          childSpan: null,
          glyph: null,
        };
      }
      if (!usesGlyphs || !singleShape || i === 0) {
        tSpan = cachedSpansLength > i ? this.textSpans[i].span : createNS(usesGlyphs ? 'g' : 'text');
        if (cachedSpansLength <= i) {
          tSpan.setAttribute('stroke-linecap', 'butt');
          tSpan.setAttribute('stroke-linejoin', 'round');
          tSpan.setAttribute('stroke-miterlimit', '4');
          this.textSpans[i].span = tSpan;
          if (usesGlyphs) {
            var childSpan = createNS('g');
            tSpan.appendChild(childSpan);
            this.textSpans[i].childSpan = childSpan;
          }
          this.textSpans[i].span = tSpan;
          this.layerElement.appendChild(tSpan);
        }
        tSpan.style.display = 'inherit';
      }

      matrixHelper.reset();
      if (singleShape) {
        if (letters[i].n) {
          xPos = -trackingOffset;
          yPos += documentData.yOffset;
          yPos += firstLine ? 1 : 0;
          firstLine = false;
        }
        this.applyTextPropertiesToMatrix(documentData, matrixHelper, letters[i].line, xPos, yPos);
        xPos += letters[i].l || 0;
        // xPos += letters[i].val === ' ' ? 0 : trackingOffset;
        xPos += trackingOffset;
      }
      if (usesGlyphs) {
        charData = this.globalData.fontManager.getCharData(
          documentData.finalText[i],
          fontData.fStyle,
          this.globalData.fontManager.getFontByName(documentData.f).fFamily
        );
        var glyphElement;
        // t === 1 means the character has been replaced with an animated shaped
        if (charData.t === 1) {
          glyphElement = new SVGCompElement(charData.data, this.globalData, this);
        } else {
          var data = emptyShapeData;
          if (charData.data && charData.data.shapes) {
            data = this.buildShapeData(charData.data, documentData.finalSize);
          }
          glyphElement = new SVGShapeElement(data, this.globalData, this);
        }
        if (this.textSpans[i].glyph) {
          var glyph = this.textSpans[i].glyph;
          this.textSpans[i].childSpan.removeChild(glyph.layerElement);
          glyph.destroy();
        }
        this.textSpans[i].glyph = glyphElement;
        glyphElement._debug = true;
        glyphElement.prepareFrame(0);
        glyphElement.renderFrame();
        this.textSpans[i].childSpan.appendChild(glyphElement.layerElement);
        // when using animated shapes, the layer will be scaled instead of replacing the internal scale
        // this might have issues with strokes and might need a different solution
        if (charData.t === 1) {
          this.textSpans[i].childSpan.setAttribute('transform', 'scale(' + documentData.finalSize / 100 + ',' + documentData.finalSize / 100 + ')');
        }
      } else {
        if (singleShape) {
          tSpan.setAttribute('transform', 'translate(' + matrixHelper.props[12] + ',' + matrixHelper.props[13] + ')');
        }
        tSpan.textContent = letters[i].val;
        tSpan.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve');
      }
      //
    }
    if (singleShape && tSpan) {
      tSpan.setAttribute('d', shapeStr);
    }
  }
  while (i < this.textSpans.length) {
    this.textSpans[i].span.style.display = 'none';
    i += 1;
  }

  this._sizeChanged = true;
};

SVGTextLottieElement.prototype.sourceRectAtTime = function () {
  this.prepareFrame(this.comp.renderedFrame - this.data.st);
  this.renderInnerContent();
  if (this._sizeChanged) {
    this._sizeChanged = false;
    var textBox = this.layerElement.getBBox();
    this.bbox = {
      top: textBox.y,
      left: textBox.x,
      width: textBox.width,
      height: textBox.height,
    };
  }
  return this.bbox;
};

SVGTextLottieElement.prototype.getValue = function () {
  var i;
  var len = this.textSpans.length;
  var glyphElement;
  this.renderedFrame = this.comp.renderedFrame;
  for (i = 0; i < len; i += 1) {
    glyphElement = this.textSpans[i].glyph;
    if (glyphElement) {
      glyphElement.prepareFrame(this.comp.renderedFrame - this.data.st);
      if (glyphElement._mdf) {
        this._mdf = true;
      }
    }
  }
};

SVGTextLottieElement.prototype.renderInnerContent = function () {
  if (!this.data.singleShape || this._mdf) {
    this.textAnimator.getMeasures(this.textProperty.currentData, this.lettersChangedFlag);
    if (this.lettersChangedFlag || this.textAnimator.lettersChangedFlag) {
      this._sizeChanged = true;
      var i;
      var len;
      var renderedLetters = this.textAnimator.renderedLetters;

      var letters = this.textProperty.currentData.l;

      len = letters.length;
      var renderedLetter;
      var textSpan;
      var glyphElement;
      for (i = 0; i < len; i += 1) {
        if (!letters[i].n) {
          renderedLetter = renderedLetters[i];
          textSpan = this.textSpans[i].span;
          glyphElement = this.textSpans[i].glyph;
          if (glyphElement) {
            glyphElement.renderFrame();
          }
          if (renderedLetter._mdf.m) {
            textSpan.setAttribute('transform', renderedLetter.m);
          }
          if (renderedLetter._mdf.o) {
            textSpan.setAttribute('opacity', renderedLetter.o);
          }
          if (renderedLetter._mdf.sw) {
            textSpan.setAttribute('stroke-width', renderedLetter.sw);
          }
          if (renderedLetter._mdf.sc) {
            textSpan.setAttribute('stroke', renderedLetter.sc);
          }
          if (renderedLetter._mdf.fc) {
            textSpan.setAttribute('fill', renderedLetter.fc);
          }
        }
      }
    }
  }
};

export default SVGTextLottieElement;
