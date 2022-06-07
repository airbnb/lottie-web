/* global */
import * as PIXI from 'pixi.js';
import { BLEND_MODES } from 'pixi.js';
import { getBlendFilterArray } from '@pixi/picture';
import Matrix from '../../3rd_party/transformation-matrix';
import PXMaskElement from './PXMaskElement';
import SVGBaseElement from '../svgElements/SVGBaseElement';
import BaseRenderer from '../../renderers/BaseRenderer';
import HBaseElement from '../htmlElements/HBaseElement';
import getBlendMode from '../../utils/helpers/blendModes';

function PXBaseElement() {
}

PXBaseElement.prototype = {
  createElements: function () {},
  initRendererElement: function () {
    this.baseElement = new PIXI.Container();
    this.baseElement.renderable = false;
    this.globalData.pixiApplication.stage.addChild(this.baseElement);
    this.layerElement = this.baseElement;
  },
  createContainerElements: function () {
    this.transformedElement = this.layerElement;
    this.setBlendMode();
  },
  createContent: function () {},
  setBlendMode: function (target) {
    // console.log('PXBaseElement::setBlendMode()', this.data.nm, this.data.bm, target);
    if (this.data.bm) {
      const blendTarget = target || this.baseElement || this.layerElement;
      const blendModeValue = getBlendMode(this.data.bm);
      switch (blendModeValue) {
        case 'screen':
          blendTarget.blendMode = BLEND_MODES.NORMAL;
          break;

        case 'lighten':
          blendTarget.filters = getBlendFilterArray(BLEND_MODES.LIGHTEN);
          break;

        case 'add':
          blendTarget.blendMode = BLEND_MODES.ADD;
          break;

        case 'multiply':
          blendTarget.blendMode = BLEND_MODES.MULTIPLY;
          break;

        case 'hard-light':
          blendTarget.filters = getBlendFilterArray(BLEND_MODES.HARD_LIGHT);
          break;

        case 'soft-light':
          blendTarget.filters = getBlendFilterArray(BLEND_MODES.SOFT_LIGHT);
          break;

        case 'normal':
        default:
          blendTarget.blendMode = BLEND_MODES.NORMAL;
          break;
      }
    }
  },
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
    if (this.finalTransform._matMdf) {
      const matProps = this.finalTransform.mat.props;
      const matrix = new PIXI.Matrix(matProps[0], matProps[1], matProps[4], matProps[5], matProps[12], matProps[13]);
      this.transformedElement.transform.setFromMatrix(matrix);
      // this.transformedElement.updateTransform();
    }
    if (this.finalTransform._opMdf) {
      this.transformedElement.alpha = this.finalTransform.mProp.o.v;
    }
  },
  renderFrame: function () {
    if (this.hidden || this.data.hd) {
      return;
    }
    this.renderTransform();
    this.renderRenderable();
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
  // console.log('PXBaseElement::prepareFrame() frame:', num);
  this._mdf = false;
  this.prepareRenderableFrame(num);
  this.prepareProperties(num, this.isInRange);
  this.checkTransparency();
};

export default PXBaseElement;
