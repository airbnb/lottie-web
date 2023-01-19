import getBlendMode from '../../utils/helpers/blendModes';
import createTag from '../../utils/helpers/html_elements';
import Matrix from '../../3rd_party/transformation-matrix';
import CVEffects from './CVEffects';
import CVMaskElement from './CVMaskElement';

function CVBaseElement() {
}

var operationsMap = {
  1: 'source-in',
  2: 'source-out',
  3: 'color',
  4: 'color',
};

CVBaseElement.prototype = {
  createElements: function () {},
  initRendererElement: function () {},
  createContainerElements: function () {
    // If the layer is masked we will use two buffers to store each different states of the drawing
    // TODO: try to reduce the size of these buffers to the size of the composition contaning the layer
    // It might be challenging because there layer most likely is transformed in some way
    if (this.data.tt >= 1) {
      this.buffers = [];
      var bufferCanvas = createTag('canvas');
      bufferCanvas.width = this.globalData.canvasContext.canvas.width;
      bufferCanvas.height = this.globalData.canvasContext.canvas.height;
      this.buffers.push(bufferCanvas);
      var bufferCanvas2 = createTag('canvas');
      bufferCanvas2.width = this.globalData.canvasContext.canvas.width;
      bufferCanvas2.height = this.globalData.canvasContext.canvas.height;
      this.buffers.push(bufferCanvas2);
    }
    this.canvasContext = this.globalData.canvasContext;
    this.renderableEffectsManager = new CVEffects(this);
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
  prepareLayer: function () {
    if (this.data.tt >= 1) {
      var buffer = this.buffers[0];
      // eslint-disable-next-line no-self-assign
      buffer.width = buffer.width;
      var bufferCtx = buffer.getContext('2d');
      // on the first buffer we store the current state of the global drawing
      bufferCtx.drawImage(this.canvasContext.canvas, 0, 0);
      // The next four lines are to clear the canvas
      // TODO: Check if there is a way to clear the canvas without resetting the transform
      this.currentTransform = this.canvasContext.getTransform();
      this.canvasContext.setTransform(1, 0, 0, 1, 0, 0);
      this.canvasContext.clearRect(0, 0, this.canvasContext.canvas.width, this.canvasContext.canvas.height);
      this.canvasContext.setTransform(this.currentTransform);
    }
  },
  exitLayer: function () {
    if (this.data.tt >= 1) {
      var buffer = this.buffers[1];
      // eslint-disable-next-line no-self-assign
      buffer.width = buffer.width;
      // On the second buffer we store the current state of the global drawing that only contains the content of this layer
      // (if it is a composition, it also includes the nested layers)
      var bufferCtx = buffer.getContext('2d');
      bufferCtx.drawImage(this.canvasContext.canvas, 0, 0);
      // We clear the canvas again
      this.canvasContext.setTransform(1, 0, 0, 1, 0, 0);
      this.canvasContext.clearRect(0, 0, this.canvasContext.canvas.width, this.canvasContext.canvas.height);
      this.canvasContext.setTransform(this.currentTransform);
      // We draw the mask
      const mask = this.comp.getElementById(this.data.tp);
      mask.renderFrame(true);
      // We draw the second buffer (that contains the content of this layer)
      this.canvasContext.setTransform(1, 0, 0, 1, 0, 0);
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
    this.setBlendMode();
    var forceRealStack = this.data.ty === 0;
    this.prepareLayer();
    this.globalData.renderer.save(forceRealStack);
    this.globalData.renderer.ctxTransform(this.finalTransform.mat.props);
    this.globalData.renderer.ctxOpacity(this.finalTransform.mProp.o.v);
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
