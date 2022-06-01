import lottie from './canvas';
import AnimationItem from '../animation/AnimationItem';
import CanvasRenderer from '../renderers/CanvasRenderer';

// Monkey patch some methods to work correctly with Worker
AnimationItem.prototype.resize = function (width, height) {
  this.renderer.updateContainerSize(width, height);
};

CanvasRenderer.prototype.updateContainerSize = function (width, height) {
  this.reset();
  var elementWidth = width || this.canvasContext.canvas.width;
  var elementHeight = height || this.canvasContext.canvas.height;

  // Resize canvas
  this.canvasContext.canvas.width = elementWidth;
  this.canvasContext.canvas.height = elementHeight;

  // Transform canvas
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
      this.transformCanvas.sx = elementWidth / this.transformCanvas.w;
      this.transformCanvas.sy = elementWidth / this.transformCanvas.w;
    } else {
      this.transformCanvas.sx = elementHeight / this.transformCanvas.h;
      this.transformCanvas.sy = elementHeight / this.transformCanvas.h;
    }

    if (xPos === 'xMid' && ((animationRel < elementRel && fillType === 'meet') || (animationRel > elementRel && fillType === 'slice'))) {
      this.transformCanvas.tx = (elementWidth - this.transformCanvas.w * (elementHeight / this.transformCanvas.h)) / 2;
    } else if (xPos === 'xMax' && ((animationRel < elementRel && fillType === 'meet') || (animationRel > elementRel && fillType === 'slice'))) {
      this.transformCanvas.tx = elementWidth - this.transformCanvas.w * (elementHeight / this.transformCanvas.h);
    } else {
      this.transformCanvas.tx = 0;
    }
    if (yPos === 'YMid' && ((animationRel > elementRel && fillType === 'meet') || (animationRel < elementRel && fillType === 'slice'))) {
      this.transformCanvas.ty = (elementHeight - this.transformCanvas.h * (elementWidth / this.transformCanvas.w)) / 2;
    } else if (yPos === 'YMax' && ((animationRel > elementRel && fillType === 'meet') || (animationRel < elementRel && fillType === 'slice'))) {
      this.transformCanvas.ty = (elementHeight - this.transformCanvas.h * (elementWidth / this.transformCanvas.w));
    } else {
      this.transformCanvas.ty = 0;
    }
  } else if (this.renderConfig.preserveAspectRatio === 'none') {
    this.transformCanvas.sx = elementWidth / this.transformCanvas.w;
    this.transformCanvas.sy = elementHeight / this.transformCanvas.h;
    this.transformCanvas.tx = 0;
    this.transformCanvas.ty = 0;
  } else {
    this.transformCanvas.sx = 1;
    this.transformCanvas.sy = 1;
    this.transformCanvas.tx = 0;
    this.transformCanvas.ty = 0;
  }
  this.transformCanvas.props = [this.transformCanvas.sx, 0, 0, 0, 0, this.transformCanvas.sy, 0, 0, 0, 0, 1, 0, this.transformCanvas.tx, this.transformCanvas.ty, 0, 1];
  /* var i, len = this.elements.length;
    for(i=0;i<len;i+=1){
        if(this.elements[i] && this.elements[i].data.ty === 0){
            this.elements[i].resize(this.globalData.transformCanvas);
        }
    } */
  this.ctxTransform(this.transformCanvas.props);
  this.canvasContext.beginPath();
  this.canvasContext.rect(0, 0, this.transformCanvas.w, this.transformCanvas.h);
  this.canvasContext.closePath();
  this.canvasContext.clip();

  this.renderFrame(this.renderedFrame, true);
};

export default lottie;
