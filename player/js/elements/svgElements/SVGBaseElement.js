import { getLocationHref } from '../../main';
import {
  createElementID,
} from '../../utils/common';
import createNS from '../../utils/helpers/svg_elements';
import MaskElement from '../../mask';
import filtersFactory from '../../utils/filters';
import featureSupport from '../../utils/featureSupport';
import SVGEffects from './SVGEffects';

function SVGBaseElement() {
}

SVGBaseElement.prototype = {
  initRendererElement: function () {
    this.layerElement = createNS('g');
  },
  createContainerElements: function () {
    this.matteElement = createNS('g');
    this.transformedElement = this.layerElement;
    this.maskedElement = this.layerElement;
    this._sizeChanged = false;
    var layerElementParent = null;
    // If this layer acts as a mask for the following layer
    if (this.data.td) {
      this.matteMasks = {};
      var gg = createNS('g');
      gg.setAttribute('id', this.layerId);
      gg.appendChild(this.layerElement);
      layerElementParent = gg;
      this.globalData.defs.appendChild(gg);
    } else if (this.data.tt) {
      this.matteElement.appendChild(this.layerElement);
      layerElementParent = this.matteElement;
      this.baseElement = this.matteElement;
    } else {
      this.baseElement = this.layerElement;
    }
    if (this.data.ln) {
      this.layerElement.setAttribute('id', this.data.ln);
    }
    if (this.data.cl) {
      this.layerElement.setAttribute('class', this.data.cl);
    }
    // Clipping compositions to hide content that exceeds boundaries. If collapsed transformations is on, component should not be clipped
    if (this.data.ty === 0 && !this.data.hd) {
      var cp = createNS('clipPath');
      var pt = createNS('path');
      pt.setAttribute('d', 'M0,0 L' + this.data.w + ',0 L' + this.data.w + ',' + this.data.h + ' L0,' + this.data.h + 'z');
      var clipId = createElementID();
      cp.setAttribute('id', clipId);
      cp.appendChild(pt);
      this.globalData.defs.appendChild(cp);

      if (this.checkMasks()) {
        var cpGroup = createNS('g');
        cpGroup.setAttribute('clip-path', 'url(' + getLocationHref() + '#' + clipId + ')');
        cpGroup.appendChild(this.layerElement);
        this.transformedElement = cpGroup;
        if (layerElementParent) {
          layerElementParent.appendChild(this.transformedElement);
        } else {
          this.baseElement = this.transformedElement;
        }
      } else {
        this.layerElement.setAttribute('clip-path', 'url(' + getLocationHref() + '#' + clipId + ')');
      }
    }
    if (this.data.bm !== 0) {
      this.setBlendMode();
    }
  },
  renderElement: function () {
    if (this.finalTransform._matMdf) {
      this.transformedElement.setAttribute('transform', this.finalTransform.mat.to2dCSS());
    }
    if (this.finalTransform._opMdf) {
      this.transformedElement.setAttribute('opacity', this.finalTransform.mProp.o.v);
    }
  },
  destroyBaseElement: function () {
    this.layerElement = null;
    this.matteElement = null;
    this.maskManager.destroy();
  },
  getBaseElement: function () {
    if (this.data.hd) {
      return null;
    }
    return this.baseElement;
  },
  createRenderableComponents: function () {
    this.maskManager = new MaskElement(this.data, this, this.globalData);
    this.renderableEffectsManager = new SVGEffects(this);
  },
  getMatte: function (matteType) {
    // This should not be a common case. But for backward compatibility, we'll create the matte object.
    // It solves animations that have two consecutive layers marked as matte masks.
    // Which is an undefined behavior in AE.
    if (!this.matteMasks) {
      this.matteMasks = {};
    }
    if (!this.matteMasks[matteType]) {
      var id = this.layerId + '_' + matteType;
      var filId;
      var fil;
      var useElement;
      var gg;
      if (matteType === 1 || matteType === 3) {
        var masker = createNS('mask');
        masker.setAttribute('id', id);
        masker.setAttribute('mask-type', matteType === 3 ? 'luminance' : 'alpha');
        useElement = createNS('use');
        useElement.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#' + this.layerId);
        masker.appendChild(useElement);
        this.globalData.defs.appendChild(masker);
        if (!featureSupport.maskType && matteType === 1) {
          masker.setAttribute('mask-type', 'luminance');
          filId = createElementID();
          fil = filtersFactory.createFilter(filId);
          this.globalData.defs.appendChild(fil);
          fil.appendChild(filtersFactory.createAlphaToLuminanceFilter());
          gg = createNS('g');
          gg.appendChild(useElement);
          masker.appendChild(gg);
          gg.setAttribute('filter', 'url(' + getLocationHref() + '#' + filId + ')');
        }
      } else if (matteType === 2) {
        var maskGroup = createNS('mask');
        maskGroup.setAttribute('id', id);
        maskGroup.setAttribute('mask-type', 'alpha');
        var maskGrouper = createNS('g');
        maskGroup.appendChild(maskGrouper);
        filId = createElementID();
        fil = filtersFactory.createFilter(filId);
        /// /
        var feCTr = createNS('feComponentTransfer');
        feCTr.setAttribute('in', 'SourceGraphic');
        fil.appendChild(feCTr);
        var feFunc = createNS('feFuncA');
        feFunc.setAttribute('type', 'table');
        feFunc.setAttribute('tableValues', '1.0 0.0');
        feCTr.appendChild(feFunc);
        /// /
        this.globalData.defs.appendChild(fil);
        var alphaRect = createNS('rect');
        alphaRect.setAttribute('width', this.comp.data.w);
        alphaRect.setAttribute('height', this.comp.data.h);
        alphaRect.setAttribute('x', '0');
        alphaRect.setAttribute('y', '0');
        alphaRect.setAttribute('fill', '#ffffff');
        alphaRect.setAttribute('opacity', '0');
        maskGrouper.setAttribute('filter', 'url(' + getLocationHref() + '#' + filId + ')');
        maskGrouper.appendChild(alphaRect);
        useElement = createNS('use');
        useElement.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#' + this.layerId);
        maskGrouper.appendChild(useElement);
        if (!featureSupport.maskType) {
          maskGroup.setAttribute('mask-type', 'luminance');
          fil.appendChild(filtersFactory.createAlphaToLuminanceFilter());
          gg = createNS('g');
          maskGrouper.appendChild(alphaRect);
          gg.appendChild(this.layerElement);
          maskGrouper.appendChild(gg);
        }
        this.globalData.defs.appendChild(maskGroup);
      }
      this.matteMasks[matteType] = id;
    }
    return this.matteMasks[matteType];
  },
  setMatte: function (id) {
    if (!this.matteElement) {
      return;
    }
    this.matteElement.setAttribute('mask', 'url(' + getLocationHref() + '#' + id + ')');
  },
};

export default SVGBaseElement;
