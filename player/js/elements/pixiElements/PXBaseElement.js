/* global */
import * as PIXI from 'pixi.js';
import Matrix from '../../3rd_party/transformation-matrix';
import PXMaskElement from './PXMaskElement';
import SVGBaseElement from '../svgElements/SVGBaseElement';
import BaseRenderer from '../../renderers/BaseRenderer';
import HBaseElement from '../htmlElements/HBaseElement';

function PXBaseElement() {
}

PXBaseElement.prototype = {
  createElements: function () {},
  initRendererElement: function () {
    this.baseElement = new PIXI.Container();
    this.globalData.pixiApplication.stage.addChild(this.baseElement);
    this.layerElement = this.baseElement;
  },
  createContainerElements: function () {
    this.transformedElement = this.layerElement;
  },
  createContent: function () {},
  setBlendMode: function () {},
  createRenderableComponents: function () {
    this.maskManager = new PXMaskElement(this.data, this);
  },
  hideElement: function () {
    if (!this.hidden && (!this.isInRange || this.isTransparent)) {
      this.hidden = true;
      this.hideInnerContent();
    }
  },
  showElement: function () {
    if (this.isInRange && !this.isTransparent) {
      this.hidden = false;
      this._isFirstFrame = true;
      this.maskManager._isFirstFrame = true;
      this.showInnerContent();
    }
  },
  renderElement: function () {
    if (this.finalTransform && this.finalTransform.mProp.container.data.nm === 'fxtex_pack_cut-up_gem.png') {
      console.log('PXBaseElement::renderElement', this, this.transformedElement, this.finalTransform);
      console.log('PXBaseElement::render alpha >>', this.finalTransform && this.finalTransform.mProp);

      // TODO: Somehow apply Ae parent linking / transform
      // const parentData = this.comp.layers[this.data.parent - 1];
      // console.log('parent layer', parentData);
    }
    // console.log('>> to2DCss', this.finalTransform.mat.to2dCSS());
    // console.log('>> toCss', this.finalTransform.mat.toCSS());
    // var transformedElementStyle = this.transformedElement ? this.transformedElement.style : {};

    if (this.finalTransform._matMdf) {
      const matProps = this.finalTransform.mat.props;
      const matrix = new PIXI.Matrix(matProps[0], matProps[1], matProps[4], matProps[5], matProps[12], matProps[13]);
      this.transformedElement.transform.setFromMatrix(matrix);
      // this.transformedElement.updateTransform();
    }
    if (this.finalTransform._opMdf) {
      this.transformedElement.alpha = this.finalTransform.mProp.o.v;
    }
    // if (this.finalTransform._matMdf) {
    //   var matrixValue = this.finalTransform.mat.toCSS();
    //   transformedElementStyle.transform = matrixValue;
    //   transformedElementStyle.webkitTransform = matrixValue;
    // }
    // if (this.finalTransform._opMdf) {
    //   transformedElementStyle.opacity = this.finalTransform.mProp.o.v;
    // }
  },
  renderFrame: function () {
    console.log('PXBaseElement::renderFrame', this.hidden, this.data.hd);
    // if (this.hidden || this.data.hd) {
    //   return;
    // }
    this.renderTransform();
    this.renderRenderable();
    this.setBlendMode(); // ?
    this.renderElement();
    this.renderInnerContent();
  },
  destroy: function () {},
  mHelper: new Matrix(),
};
PXBaseElement.prototype.hide = PXBaseElement.prototype.hideElement;
PXBaseElement.prototype.show = PXBaseElement.prototype.showElement;
PXBaseElement.prototype.getBaseElement = SVGBaseElement.prototype.getBaseElement;
PXBaseElement.prototype.destroyBaseElement = HBaseElement.prototype.destroy;
PXBaseElement.prototype.buildElementParenting = BaseRenderer.prototype.buildElementParenting;
PXBaseElement.prototype.prepareFrame = function (num) {
  console.log('PXBaseElement::prepareFrame() frame:', num);
  this._mdf = false;
  this.prepareRenderableFrame(num);
  this.prepareProperties(num, this.isInRange);
  // this.checkTransparency();
};
// RenderableDOMElement.prototype.prepareFrame;

export default PXBaseElement;
