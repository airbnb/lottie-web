// TODO(myxvisual): Work
/* global extendPrototype, BaseElement, TransformElement, CVBaseElement,HierarchyElement, FrameElement,
RenderableElement, SVGShapeElement, IImageElement, createTag */

function CVVideoElement(data, globalData, comp) {
  // anim.frameRate.renderedFrame
  // anim.renderer
  // data.st
  console.warn(this);
  this.assetData = globalData.getAssetData(data.refId);
  var video = createTag('video');
  video.width = this.assetData.w;
  video.height = this.assetData.h;
  video.autoplay = 'false';
  video.muted = 'true';
  this.video = video;
  this.currFrame = 0;

  this.initElement(data, globalData, comp);
}
extendPrototype([BaseElement, TransformElement, CVBaseElement, HierarchyElement, FrameElement, RenderableElement], CVVideoElement);

CVVideoElement.prototype.initElement = SVGShapeElement.prototype.initElement;

CVVideoElement.prototype.prepareFrame = function () {
  // anim.renderer.renderedFrame
  var currFrame = arguments[0];
  if (currFrame < this.currFrame) {
    this._isFirstFrame = true;
  }
  this.currFrame = currFrame;
  var res = IImageElement.prototype.prepareFrame.apply(this, arguments);
  // CVBaseElement.prototype.renderFrame.call(this);
  return res;
};

CVVideoElement.prototype.createContent = function () {
  var assetPath = this.globalData.getAssetsPath(this.assetData);
  this.video.src = assetPath;
};

CVVideoElement.prototype.renderInnerContent = function () {
  this.renderVideo();
};

CVVideoElement.prototype.renderVideo = function () {
  if (this._isFirstFrame) {
    this.video.currentTime = 0;
    this.video.play();
  }
  if (this.hidden) {
    this.video.pause();
    this.video.currentTime = 0;
  } else {
    this.canvasContext.drawImage(this.video, 0, 0);
  }
};

CVVideoElement.prototype.destroy = function () {
  this.video = null;
};
