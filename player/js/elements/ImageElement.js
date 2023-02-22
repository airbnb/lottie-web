import {
  extendPrototype,
} from '../utils/functionExtensions';

import createNS from '../utils/helpers/svg_elements';
import BaseElement from './BaseElement';
import TransformElement from './helpers/TransformElement';
import SVGBaseElement from './svgElements/SVGBaseElement';
import HierarchyElement from './helpers/HierarchyElement';
import FrameElement from './helpers/FrameElement';
import RenderableDOMElement from './helpers/RenderableDOMElement';

function IImageElement(data, globalData, comp) {
  this.assetData = globalData.getAssetData(data.refId);
  if (this.assetData && this.assetData.sid) {
    this.assetData = globalData.slotManager.getProp(this.assetData);
  }
  this.initElement(data, globalData, comp);
  this.sourceRect = {
    top: 0, left: 0, width: this.assetData.w, height: this.assetData.h,
  };
}

extendPrototype([BaseElement, TransformElement, SVGBaseElement, HierarchyElement, FrameElement, RenderableDOMElement], IImageElement);

IImageElement.prototype.createContent = function () {
  var assetPath = this.globalData.getAssetsPath(this.assetData);

  this.innerElem = createNS('image');
  this.innerElem.setAttribute('width', this.assetData.w + 'px');
  this.innerElem.setAttribute('height', this.assetData.h + 'px');
  this.innerElem.setAttribute('preserveAspectRatio', this.assetData.pr || this.globalData.renderConfig.imagePreserveAspectRatio);
  this.innerElem.setAttributeNS('http://www.w3.org/1999/xlink', 'href', assetPath);

  this.layerElement.appendChild(this.innerElem);
};

IImageElement.prototype.sourceRectAtTime = function () {
  return this.sourceRect;
};

export default IImageElement;
