import assetManager from '../../utils/helpers/assetManager';
import getBlendMode from '../../utils/helpers/blendModes';
import Matrix from '../../3rd_party/transformation-matrix';
import CVEffects from './CVEffects';
import CVMaskElement from './CVMaskElement';
import effectTypes from '../../utils/helpers/effectTypes';

function CVBaseElement() {
}

var operationsMap = {
  1: 'source-in',
  2: 'source-out',
  3: 'source-in',
  4: 'source-out',
};

CVBaseElement.prototype = {
  createElements: function () {},
  initRendererElement: function () {},
  createContainerElements: function () {
    // If the layer is masked we will use two buffers to store each different states of the drawing
    // This solution is not ideal for several reason. But unfortunately, because of the recursive
    // nature of the render tree, it's the only simple way to make sure one inner mask doesn't override an outer mask.
    // TODO: try to reduce the size of these buffers to the size of the composition contaning the layer
    // It might be challenging because the layer most likely is transformed in some way
    if (this.data.tt >= 1) {
      this.buffers = [];
      var canvasContext = this.globalData.canvasContext;
      var bufferCanvas = assetManager.createCanvas(canvasContext.canvas.width, canvasContext.canvas.height);
      this.buffers.push(bufferCanvas);
      var bufferCanvas2 = assetManager.createCanvas(canvasContext.canvas.width, canvasContext.canvas.height);
      this.buffers.push(bufferCanvas2);
      if (this.data.tt >= 3 && !document._isProxy) {
        assetManager.loadLumaCanvas();
      }
    }
    this.canvasContext = this.globalData.canvasContext;
    this.transformCanvas = this.globalData.transformCanvas;
    this.renderableEffectsManager = new CVEffects(this);
    this.searchEffectTransforms();
  },
  createContent: function () {},
  setBlendMode: function () {
    var globalData = this.globalData;
    if (globalData.blendMode !== this.data.bm) {
      globalData.blendMode = this.data.bm;
      var blendModeValue = getBlendMode(this.data.bm);
      globalData.canvasContext.globalCompositeOperation = blendModeValue;
    }
  },
  createRenderableComponents: function () {
    this.maskManager = new CVMaskElement(this.data, this);
    this.transformEffects = this.renderableEffectsManager.getEffects(effectTypes.TRANSFORM_EFFECT);
  },
  hideElement: function () {
    if (!this.hidden && (!this.isInRange || this.isTransparent)) {
      this.hidden = true;
    }
  },
  showElement: function () {
    if (this.isInRange && !this.isTransparent) {
      this.hidden = false;
      this._isFirstFrame = true;
      this.maskManager._isFirstFrame = true;
    }
  },
  clearCanvas: function (canvasContext) {
    canvasContext.clearRect(
      this.transformCanvas.tx,
      this.transformCanvas.ty,
      this.transformCanvas.w * this.transformCanvas.sx,
      this.transformCanvas.h * this.transformCanvas.sy
    );
  },
  prepareLayer: function () {
    if (this.data.tt >= 1) {
      var buffer = this.buffers[0];
      var bufferCtx = buffer.getContext('2d');
      this.clearCanvas(bufferCtx);
      // on the first buffer we store the current state of the global drawing
      bufferCtx.drawImage(this.canvasContext.canvas, 0, 0);
      // The next four lines are to clear the canvas
      // TODO: Check if there is a way to clear the canvas without resetting the transform
      this.currentTransform = this.canvasContext.getTransform();
      this.canvasContext.setTransform(1, 0, 0, 1, 0, 0);
      this.clearCanvas(this.canvasContext);
      this.canvasContext.setTransform(this.currentTransform);
    }
  },
  exitLayer: function () {
    if (this.data.tt >= 1) {
      var buffer = this.buffers[1];
      // On the second buffer we store the current state of the global drawing
      // that only contains the content of this layer
      // (if it is a composition, it also includes the nested layers)
      var bufferCtx = buffer.getContext('2d');
      this.clearCanvas(bufferCtx);
      bufferCtx.drawImage(this.canvasContext.canvas, 0, 0);
      // We clear the canvas again
      this.canvasContext.setTransform(1, 0, 0, 1, 0, 0);
      this.clearCanvas(this.canvasContext);
      this.canvasContext.setTransform(this.currentTransform);
      // We draw the mask
      const mask = this.comp.getElementById('tp' in this.data ? this.data.tp : this.data.ind - 1);
      mask.renderFrame(true);
      // We draw the second buffer (that contains the content of this layer)
      this.canvasContext.setTransform(1, 0, 0, 1, 0, 0);

      // If the mask is a Luma matte, we need to do two extra painting operations
      // the _isProxy check is to avoid drawing a fake canvas in workers that will throw an error
      if (this.data.tt >= 3 && !document._isProxy) {
        // We copy the painted mask to a buffer that has a color matrix filter applied to it
        // that applies the rgb values to the alpha channel
        var lumaBuffer = assetManager.getLumaCanvas(this.canvasContext.canvas);
        var lumaBufferCtx = lumaBuffer.getContext('2d');
        lumaBufferCtx.drawImage(this.canvasContext.canvas, 0, 0);
        this.clearCanvas(this.canvasContext);
        // we repaint the context with the mask applied to it
        this.canvasContext.drawImage(lumaBuffer, 0, 0);
      }
      this.canvasContext.globalCompositeOperation = operationsMap[this.data.tt];
      this.canvasContext.drawImage(buffer, 0, 0);
      // We finally draw the first buffer (that contains the content of the global drawing)
      // We use destination-over to draw the global drawing below the current layer
      this.canvasContext.globalCompositeOperation = 'destination-over';
      this.canvasContext.drawImage(this.buffers[0], 0, 0);
      this.canvasContext.setTransform(this.currentTransform);
      // We reset the globalCompositeOperation to source-over, the standard type of operation
      this.canvasContext.globalCompositeOperation = 'source-over';
    }
  },
  renderFrame: function (forceRender) {
    if (this.hidden || this.data.hd) {
      return;
    }
    if (this.data.td === 1 && !forceRender) {
      return;
    }
    this.renderTransform();
    this.renderRenderable();
    this.renderLocalTransform();
    this.setBlendMode();
    var forceRealStack = this.data.ty === 0;
    this.prepareLayer();
    this.globalData.renderer.save(forceRealStack);
    this.globalData.renderer.ctxTransform(this.finalTransform.localMat.props);
    this.globalData.renderer.ctxOpacity(this.finalTransform.localOpacity);
    this.renderInnerContent();
    this.globalData.renderer.restore(forceRealStack);
    this.exitLayer();
    if (this.maskManager.hasMasks) {
      this.globalData.renderer.restore(true);
    }
    if (this._isFirstFrame) {
      this._isFirstFrame = false;
    }
  },
  destroy: function () {
    this.canvasContext = null;
    this.data = null;
    this.globalData = null;
    this.maskManager.destroy();
  },
  mHelper: new Matrix(),
};
CVBaseElement.prototype.hide = CVBaseElement.prototype.hideElement;
CVBaseElement.prototype.show = CVBaseElement.prototype.showElement;

export default CVBaseElement;
