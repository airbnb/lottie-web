import * as PIXI from 'pixi.js';
import { AnimatedGIFLoader } from '@pixi/gif';
import {
  extendPrototype,
} from '../utils/functionExtensions';
import {
  createSizedArray,
} from '../utils/helpers/arrays';
import Matrix from '../3rd_party/transformation-matrix';
import BaseRenderer from './BaseRenderer';
import PXImageElement from '../elements/pixiElements/PXImageElement';
import PXShapeElement from '../elements/pixiElements/PXShapeElement';
import NullElement from '../elements/NullElement';

PIXI.Loader.registerPlugin(AnimatedGIFLoader);

function PixiRendererBase(animationItem, config) {
  // console.log('PIXIRendererBase::constructor', animationItem, config);
  this.animationItem = animationItem;
  this.layers = null;

  this.renderConfig = {
    dpr: (config && config.dpr) || window.devicePixelRatio || 1,
    progressiveLoad: (config && config.progressiveLoad) || false,
    preserveAspectRatio: config && config.preserveAspectRatio,
    pixiApplication: config && config.pixiApplication,
  };

  this.renderedFrame = -1;
  this.globalData = {
    frameNum: -1,
    _mdf: false,
    renderConfig: this.renderConfig,
    currentGlobalAlpha: -1,
    isAssetsLoaded: false,
  };
  this.elements = [];
  this.pendingElements = [];
  this.transformMat = new Matrix();
  this.completeLayers = false;
  this.rendererType = 'pixi';
}

extendPrototype([BaseRenderer], PixiRendererBase);

PixiRendererBase.prototype.createNull = function (data) {
  return new NullElement(data, this.globalData, this);
};

PixiRendererBase.prototype.createShape = function (data) {
  console.log('Pixi create shape::', data);
  return new PXShapeElement(data, this.globalData, this);
};

PixiRendererBase.prototype.createText = function (data) {
  console.log('PixiRendererBase::createText()', data);
};

PixiRendererBase.prototype.createImage = function (data) {
  console.log('PixiRendererBase::createImage()', data);
  return new PXImageElement(data, this.globalData, this);
};

PixiRendererBase.prototype.createSolid = function (data) {
  console.log('PixiRendererBase::createSolid()', data);
};

PixiRendererBase.prototype.configAnimation = function (animData) {
  // console.log('PixiRendererBase::configAnimation() Pixi Animation', animData, this.renderConfig);
  if (!this.renderConfig.preserveAspectRatio) {
    this.renderConfig.preserveAspectRatio = 'none';
  }

  if (this.renderConfig.pixiApplication) {
    // Use existing pixi
    this.pixiApplication = this.renderConfig.pixiApplication;
  } else {
    this.pixiApplication = new PIXI.Application({
      width: animData.w,
      height: animData.h,
      resolution: this.renderConfig.dpr,
      // autoResize: true,
      // resizeTo: window,
      // backgroundAlpha: 1,
      backgroundColor: 0xFF0000,
    });
  }

  // TODO: Remove / Test square to show lottie content
  const graphics = new PIXI.Graphics();
  graphics.beginFill(0x00FF00);
  graphics.drawRect(50, 50, 100, 100);
  graphics.endFill();
  this.pixiApplication.stage.addChild(graphics);
  this.layerElement = this.pixiApplication.stage;

  this.animationItem.wrapper.appendChild(this.pixiApplication.view);
  this.canvasContext = {}; // this.pixiApp.view;
  this.data = animData;
  this.layers = animData.layers;
  this.transformCanvas = {
    w: animData.w,
    h: animData.h,
    sx: 0,
    sy: 0,
    tx: 0,
    ty: 0,
  };
  this.setupGlobalData(animData, document.body);
  this.globalData.canvasContext = this.canvasContext;
  this.globalData.pixiApplication = this.pixiApplication;
  this.globalData.progressiveLoad = this.renderConfig.progressiveLoad;
  this.globalData.transformCanvas = this.transformCanvas;
  this.elements = createSizedArray(animData.layers.length);
  this.updateContainerSize();

  // Preload the assets
  // console.log('PixiRendererBase::configAnimation()', animData, this.pixiApplication);
  const pixiLoader = PIXI.Loader.shared;
  animData.assets.forEach((asset) => {
    if (asset.u) {
      // const assetPath = `${asset.u}${asset.p}`;
      const assetPath = this.globalData.getAssetsPath(asset);
      // console.log(`PixiRendererBase::load asset, ${asset.id}, ${assetPath}`, asset);
      pixiLoader.add(asset.id, assetPath);
    }
  });

  pixiLoader.load(() => {
    // loader, resources
    // console.log('PixiLoader::Assets loaded!', loader, resources);

    this.globalData.isAssetsLoaded = true;
    this.animationItem.checkLoaded();
  });
};

PixiRendererBase.prototype.ctxTransform = function (props) {
  // console.log('PixiRendererBase::ctxTransform()', props, this.canvasContext);
  if (props[0] === 1 && props[1] === 0 && props[4] === 0 && props[5] === 1 && props[12] === 0 && props[13] === 0) {
    return;
  }
  if (!this.renderConfig.clearCanvas) {
    // this.canvasContext.transform(props[0], props[1], props[4], props[5], props[12], props[13]);
  }
};

PixiRendererBase.prototype.destroy = function () {
  if (this.animationItem.wrapper) {
    this.animationItem.wrapper.innerText = '';
  }
  this.layerElement = null;
  var i;
  var len = this.layers ? this.layers.length : 0;
  for (i = len - 1; i >= 0; i -= 1) {
    if (this.elements[i]) {
      this.elements[i].destroy();
    }
  }
  this.globalData.pixiApplication.destroy();
  this.globalData.pixiApplication = null;
  this.elements.length = 0;
  this.animationItem.container = null;
  this.destroyed = true;
};

PixiRendererBase.prototype.updateContainerSize = function () {
  // console.log('PixiRendererBase::updateContainerSize()');
  var elementWidth;
  var elementHeight;
  if (this.animationItem.wrapper && this.animationItem.container) {
    elementWidth = this.animationItem.wrapper.offsetWidth;
    elementHeight = this.animationItem.wrapper.offsetHeight;
    this.animationItem.container.setAttribute('width', elementWidth * this.renderConfig.dpr);
    this.animationItem.container.setAttribute('height', elementHeight * this.renderConfig.dpr);
  } else {
    elementWidth = this.data.w * (this.renderConfig.dpr || 1);
    elementHeight = this.data.h * (this.renderConfig.dpr || 1);
  }

  // var ratio = this.data.w / this.data.h;
  // var w = 1;
  // var h = 1;
  // if (window.innerWidth / window.innerHeight >= ratio) {
  //   w = window.innerHeight * ratio;
  //   h = window.innerHeight;
  // } else {
  //   w = window.innerWidth;
  //   h = window.innerWidth / ratio;
  // }
  var elementRel;
  var animationRel;
  if (this.renderConfig.preserveAspectRatio.indexOf('meet') !== -1 || this.renderConfig.preserveAspectRatio.indexOf('slice') !== -1) {
    var par = this.renderConfig.preserveAspectRatio.split(' ');
    var fillType = par[1] || 'meet';
    var pos = par[0] || 'xMidYMid';
    var xPos = pos.substr(0, 4);
    var yPos = pos.substr(4);
    elementRel = elementWidth / elementHeight;
    animationRel = this.transformCanvas.w / this.transformCanvas.h;
    if ((animationRel > elementRel && fillType === 'meet') || (animationRel < elementRel && fillType === 'slice')) {
      this.transformCanvas.sx = elementWidth / (this.transformCanvas.w / this.renderConfig.dpr);
      this.transformCanvas.sy = elementWidth / (this.transformCanvas.w / this.renderConfig.dpr);
    } else {
      this.transformCanvas.sx = elementHeight / (this.transformCanvas.h / this.renderConfig.dpr);
      this.transformCanvas.sy = elementHeight / (this.transformCanvas.h / this.renderConfig.dpr);
    }

    if (xPos === 'xMid' && ((animationRel < elementRel && fillType === 'meet') || (animationRel > elementRel && fillType === 'slice'))) {
      this.transformCanvas.tx = ((elementWidth - this.transformCanvas.w * (elementHeight / this.transformCanvas.h)) / 2) * this.renderConfig.dpr;
    } else if (xPos === 'xMax' && ((animationRel < elementRel && fillType === 'meet') || (animationRel > elementRel && fillType === 'slice'))) {
      this.transformCanvas.tx = (elementWidth - this.transformCanvas.w * (elementHeight / this.transformCanvas.h)) * this.renderConfig.dpr;
    } else {
      this.transformCanvas.tx = 0;
    }
    if (yPos === 'YMid' && ((animationRel > elementRel && fillType === 'meet') || (animationRel < elementRel && fillType === 'slice'))) {
      this.transformCanvas.ty = ((elementHeight - this.transformCanvas.h * (elementWidth / this.transformCanvas.w)) / 2) * this.renderConfig.dpr;
    } else if (yPos === 'YMax' && ((animationRel > elementRel && fillType === 'meet') || (animationRel < elementRel && fillType === 'slice'))) {
      this.transformCanvas.ty = ((elementHeight - this.transformCanvas.h * (elementWidth / this.transformCanvas.w))) * this.renderConfig.dpr;
    } else {
      this.transformCanvas.ty = 0;
    }
  } else if (this.renderConfig.preserveAspectRatio === 'none') {
    this.transformCanvas.sx = elementWidth / (this.transformCanvas.w / this.renderConfig.dpr);
    this.transformCanvas.sy = elementHeight / (this.transformCanvas.h / this.renderConfig.dpr);
    this.transformCanvas.tx = 0;
    this.transformCanvas.ty = 0;
  } else {
    this.transformCanvas.sx = this.renderConfig.dpr;
    this.transformCanvas.sy = this.renderConfig.dpr;
    this.transformCanvas.tx = 0;
    this.transformCanvas.ty = 0;
  }
  this.transformCanvas.props = [this.transformCanvas.sx, 0, 0, 0, 0, this.transformCanvas.sy, 0, 0, 0, 0, 1, 0, this.transformCanvas.tx, this.transformCanvas.ty, 0, 1];
  this.pixiApplication.renderer.view.style.width = '100%'; // elementWidth + 'px';
  this.pixiApplication.renderer.view.style.height = '100%'; // elementHeight + 'px';
};

PixiRendererBase.prototype.buildItem = function (pos) {
  var elements = this.elements;
  if (elements[pos] || this.layers[pos].ty === 99) {
    return;
  }
  var element = this.createItem(this.layers[pos], this, this.globalData);
  elements[pos] = element;
  element.initExpressions();
  this.appendElementInPos(element, pos);
};

PixiRendererBase.prototype.checkPendingElements = function () {
  // console.log('PixiRendererBase::checkPendingElements()', this.pendingElements);
  while (this.pendingElements.length) {
    var element = this.pendingElements.pop();
    element.checkParenting();
  }
};

PixiRendererBase.prototype.renderFrame = function (num, forceRender) {
  if ((this.renderedFrame === num && this.renderConfig.clearCanvas === true && !forceRender) || this.destroyed || num === -1) {
    return;
  }
  this.renderedFrame = num;
  this.globalData.frameNum = num - this.animationItem._isFirstFrame;
  this.globalData.frameId += 1;
  this.globalData._mdf = !this.renderConfig.clearCanvas || forceRender;
  this.globalData.projectInterface.currentFrame = num;

  // console.log('--------');
  // console.log('PixiRendererBase::render frame: ', num, this.layers, this.globalData._mdf);
  var i;
  var len = this.layers.length;
  if (!this.completeLayers) {
    this.checkLayers(num);
  }
  for (i = 0; i < len; i += 1) {
    if (this.completeLayers && this.elements[i]) {
      this.elements[i].prepareFrame(num - this.layers[i].st);
    }
  }
  if (this.globalData._mdf) {
    for (i = len - 1; i >= 0; i -= 1) {
      if (this.completeLayers && this.elements[i]) {
        this.elements[i].renderFrame();
      }
    }
  }
};

PixiRendererBase.prototype.appendElementInPos = function (element, pos) {
  var newElement = element.getBaseElement();
  if (!newElement) {
    return;
  }
  var i = 0;
  var nextElement;
  while (i < pos) {
    if (this.elements[i] && this.elements[i] !== true && this.elements[i].getBaseElement()) {
      nextElement = this.elements[i].getBaseElement();
    }
    i += 1;
  }
  if (nextElement) {
    this.layerElement.addChildAt(newElement, nextElement.parent.getChildIndex(nextElement) || 0);
  } else {
    this.layerElement.addChild(newElement);
  }
};

PixiRendererBase.prototype.hide = function () {
};

PixiRendererBase.prototype.show = function () {
};

export default PixiRendererBase;
