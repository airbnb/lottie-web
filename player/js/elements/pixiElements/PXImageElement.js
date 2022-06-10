import * as PIXI from 'pixi.js';
import { extendPrototype } from '../../utils/functionExtensions';
import PXBaseElement from './PXBaseElement';
import BaseElement from '../BaseElement';
import TransformElement from '../helpers/TransformElement';
import HierarchyElement from '../helpers/HierarchyElement';
import FrameElement from '../helpers/FrameElement';
import RenderableElement from '../helpers/RenderableElement';
import RenderableDOMElement from '../helpers/RenderableDOMElement';
import lightenBlendFilter from './blendModes/Lighten';
import colorDodgeBlendFilter from './blendModes/ColorDodge';
import colorBurnBlendFilter from './blendModes/ColorBurn';
import linearBurnBlendFilter from './blendModes/LinearBurn';
import darkenBlendFilter from './blendModes/Darken';
import differenceBlendFilter from './blendModes/Difference';
import exclusionBlendFilter from './blendModes/Exclusion';

// TODO: Find a nicer home for custom blend modes to be included
// eslint-disable-next-line no-unused-vars
const blends = [
  lightenBlendFilter,
  colorDodgeBlendFilter,
  colorBurnBlendFilter,
  linearBurnBlendFilter,
  darkenBlendFilter,
  differenceBlendFilter,
  exclusionBlendFilter,
];

function PXImageElement(data, globalData, comp) {
  this.isAnimation = false;
  this.assetData = globalData.getAssetData(data.refId);
  this.initElement(data, globalData, comp);
}
extendPrototype(
  [
    BaseElement,
    TransformElement,
    PXBaseElement,
    HierarchyElement,
    FrameElement,
    RenderableElement,
  ],
  PXImageElement
);

PXImageElement.prototype.initElement = RenderableDOMElement.prototype.initElement;
PXImageElement.prototype.setBlendMode = PXBaseElement.prototype.setBlendMode;

PXImageElement.prototype.createContent = function () {
  // const imageAsset = this.globalData.imageLoader.getAsset(this.assetData);

  const pixiLoader = PIXI.Loader.shared;
  if (this.assetData.p.indexOf('.gif') >= 0) {
    this.isAnimation = true;
    // TODO: Sync the gif frame to the renderFrame method
    const animation = pixiLoader.resources[this.assetData.id].animation;
    // animation.autoUpdate = false;
    // animation.currentFrame = 5;
    this.img = animation.clone(); // new PIXI.Sprite(animation.texture);
  } else {
    const pixiTexture = pixiLoader.resources[this.assetData.id].texture;
    this.img = new PIXI.Sprite(pixiTexture);
  }

  var imgW = this.img.width;
  var imgH = this.img.height;
  var imgRel = imgW / imgH;
  var canvasRel = this.assetData.w / this.assetData.h;
  var widthCrop;
  var heightCrop;
  var par = this.assetData.pr || this.globalData.renderConfig.imagePreserveAspectRatio;
  if (
    (imgRel > canvasRel && par === 'xMidYMid slice')
    || (imgRel < canvasRel && par !== 'xMidYMid slice')
  ) {
    heightCrop = imgH;
    widthCrop = heightCrop * canvasRel;
  } else {
    widthCrop = imgW;
    heightCrop = widthCrop / canvasRel;
  }

  this.img.x = (imgW - widthCrop) / 2;
  this.img.y = (imgH - heightCrop) / 2;
  this.img.width = widthCrop;
  this.img.height = heightCrop;
  this.img.renderable = false;

  this.layerElement.addChild(this.img);
  this.setBlendMode(this.img);
};

PXImageElement.prototype.renderInnerContent = function () {};

PXImageElement.prototype.showInnerContent = function () {
  // console.log('PXImageElement::showInnerContent()');
  this.baseElement.renderable = true;
  this.img.renderable = true;
};

PXImageElement.prototype.hideInnerContent = function () {
  // console.log('PXImageElement::hideInnerContent()');
  this.baseElement.renderable = false;
  this.img.renderable = false;
};

PXImageElement.prototype.createContainerElements = function () {
  this.transformedElement = this.layerElement;
};

PXImageElement.prototype.destroy = function () {
  this.img = null;
};

export default PXImageElement;
