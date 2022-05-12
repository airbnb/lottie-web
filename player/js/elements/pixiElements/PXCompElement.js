import {
  extendPrototype,
} from '../../utils/functionExtensions';
import {
  createSizedArray,
} from '../../utils/helpers/arrays';
import PropertyFactory from '../../utils/PropertyFactory';
import PXBaseElement from './PXBaseElement';
import ICompElement from '../CompElement';
import PixiRendererBase from '../../renderers/PixiRendererBase';

function PXCompElement(data, globalData, comp) {
  console.log('PXCompElement', data, globalData, comp);
  this.renderCount = 0;
  this.completeLayers = false;
  this.layers = data.layers;
  this.pendingElements = [];
  this.elements = createSizedArray(this.layers.length);
  this.initElement(data, globalData, comp);
  // this.bg = new PIXI.Graphics();
  this.tm = data.tm ? PropertyFactory.getProp(this, data.tm, 0, globalData.frameRate, this) : { _placeholder: true };
}

extendPrototype([PixiRendererBase, ICompElement, PXBaseElement], PXCompElement);

PXCompElement.prototype.renderInnerContent = function () {
  // console.log('Render Inner Content', this.renderCount);
  this.renderCount += 1;
  // const graphics = this.bg;
  // graphics.clear();
  // graphics.beginFill(0xFF00FF);
  // graphics.drawRect(0, 0, this.data.w, this.data.h);
  // graphics.endFill();

  // console.log('Transform comp', this.finalTransform, this.transformMat);
  // const matProps = this.finalTransform.mat.props;
  // const matrix = new PIXI.Matrix(matProps[0], matProps[1], matProps[4], matProps[5], matProps[12], matProps[13]);
  // graphics.transform.setFromMatrix(matrix);

  var i;
  var len = this.layers.length;
  for (i = len - 1; i >= 0; i -= 1) {
    if (this.completeLayers || this.elements[i]) {
      this.elements[i].renderFrame();
    }
  }
};

PXCompElement.prototype.destroy = function () {
  var i;
  var len = this.layers.length;
  for (i = len - 1; i >= 0; i -= 1) {
    if (this.elements[i]) {
      this.elements[i].destroy();
    }
  }
  this.layers = null;
  this.elements = null;
};

PXCompElement.prototype.createComp = function (data) {
  return new PXCompElement(data, this.globalData, this);
};

PXCompElement.prototype.hideInnerContent = function () {
  this.baseElement.renderable = false;
};

PXCompElement.prototype.showInnerContent = function () {
  this.baseElement.renderable = true;
};

export default PXCompElement;
