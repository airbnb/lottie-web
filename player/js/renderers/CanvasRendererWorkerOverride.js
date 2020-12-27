/* global CanvasRenderer, createTag, createSizedArray */

CanvasRenderer.prototype.configAnimation = function (animData) {
  if (this.animationItem.wrapper) {
    this.animationItem.container = createTag('canvas');
    var containerStyle = this.animationItem.container.style;
    containerStyle.width = '100%';
    containerStyle.height = '100%';
    var origin = '0px 0px 0px';
    containerStyle.transformOrigin = origin;
    containerStyle.mozTransformOrigin = origin;
    containerStyle.webkitTransformOrigin = origin;
    containerStyle['-webkit-transform'] = origin;
    this.animationItem.wrapper.appendChild(this.animationItem.container);
    this.canvasContext = this.animationItem.container.getContext('2d');
    if (this.renderConfig.className) {
      this.animationItem.container.setAttribute('class', this.renderConfig.className);
    }
  } else {
    this.canvasContext = this.renderConfig.context;
  }
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
  this.globalData.frameId = 0;
  this.globalData.frameRate = animData.fr;
  this.globalData.nm = animData.nm;
  this.globalData.compSize = {
    w: animData.w,
    h: animData.h,
  };
  this.globalData.canvasContext = this.canvasContext;
  this.globalData.renderer = this;
  this.globalData.isDashed = false;
  this.globalData.progressiveLoad = this.renderConfig.progressiveLoad;
  this.globalData.transformCanvas = this.transformCanvas;
  this.elements = createSizedArray(animData.layers.length);

  this.updateContainerSize();
};
