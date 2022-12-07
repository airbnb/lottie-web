import {
  extendPrototype,
} from '../utils/functionExtensions';
import {
  getExpressionInterfaces,
} from '../utils/common';
import RenderableElement from './helpers/RenderableElement';
import BaseElement from './BaseElement';
import FrameElement from './helpers/FrameElement';

function FootageElement(data, globalData, comp) {
  this.initFrame();
  this.initRenderable();
  this.assetData = globalData.getAssetData(data.refId);
  this.footageData = globalData.imageLoader.getAsset(this.assetData);
  this.initBaseData(data, globalData, comp);
}

FootageElement.prototype.prepareFrame = function () {
};

extendPrototype([RenderableElement, BaseElement, FrameElement], FootageElement);

FootageElement.prototype.getBaseElement = function () {
  return null;
};

FootageElement.prototype.renderFrame = function () {
};

FootageElement.prototype.destroy = function () {
};

FootageElement.prototype.initExpressions = function () {
  const expressionsInterfaces = getExpressionInterfaces();
  if (!expressionsInterfaces) {
    return;
  }
  const FootageInterface = expressionsInterfaces('footage');
  this.layerInterface = FootageInterface(this);
};

FootageElement.prototype.getFootageData = function () {
  return this.footageData;
};

export default FootageElement;
