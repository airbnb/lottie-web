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
  return res;
};

CVVideoElement.prototype.createContent = function () {
  var assetPath = this.globalData.getAssetsPath(this.assetData);
  this.video.src = assetPath;
  var sourceCanvas = createTag('canvas');
  var width = this.video.width;
  var height = this.video.height;
  Object.assign(sourceCanvas, { width: width, height: height });
  this.sourceCtx = sourceCanvas.getContext('2d');

  var maskCanvas = createTag('canvas');
  Object.assign(maskCanvas, { width: width, height: height });
  this.maskCtx = maskCanvas.getContext('2d');

  var maskedCanvas = createTag('canvas');
  Object.assign(maskedCanvas, { width: width, height: height });
  this.maskedCtx = maskedCanvas.getContext('2d');
  this.maskedCanvas = maskedCanvas;
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
    // eslint-disable-next-line no-lonely-if
    if (this._maskEl) {
      var width = this.video.width;
      var height = this.video.height;
      this.sourceCtx.drawImage(this.video, 0, 0, width, height);
      this.maskCtx.drawImage(this._maskEl.video, 0, 0, width, height);
      var sourceFrame = this.sourceCtx.getImageData(0, 0, width, height);
      var maskFrame = this.maskCtx.getImageData(0, 0, width, height);
      var l = sourceFrame.data.length / 4;

      for (var i = 0; i < l; i += 1) {
        var r = maskFrame.data[i * 4 + 0];
        var g = maskFrame.data[i * 4 + 1];
        var b = maskFrame.data[i * 4 + 2];
        var colors = r + g + b;
        sourceFrame.data[i * 4 + 3] = colors / 3;
      }
      this.maskedCtx.putImageData(sourceFrame, 0, 0);
      this.canvasContext.drawImage(this.maskedCanvas, 0, 0);
    } else if (!this._isMaskEl) {
      this.canvasContext.drawImage(this.video, 0, 0);
    }
  }
};

CVVideoElement.prototype.destroy = function () {
  this.video = null;
};
