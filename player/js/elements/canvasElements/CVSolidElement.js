function CVSolidElement(data, globalData, comp) {
    this.initElement(data,globalData,comp);
}
extendPrototype2([BaseElement, TransformElement, CVBaseElement, HierarchyElement, FrameElement, RenderableElement], CVSolidElement);

CVSolidElement.prototype.initElement = IShapeElement.prototype.initElement;
CVSolidElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame;

CVSolidElement.prototype.renderElement = function(parentMatrix) {
    this.setBlendMode();
    var ctx = this.canvasContext;
    this.globalData.renderer.save();
    this.globalData.renderer.ctxTransform(this.finalTransform.mat.props);
    this.globalData.renderer.ctxOpacity(this.finalTransform.opacity);
    ctx.fillStyle = this.data.sc;
    ctx.fillRect(0, 0, this.data.sw, this.data.sh);
    this.globalData.renderer.restore();
    if(this.maskManager.hasMasks) {
        this.globalData.renderer.restore(true);
    }
    if (this.firstFrame) {
        this.firstFrame = false;
    }
};

CVSolidElement.prototype.renderFrame = function() {
    if (this.hidden) {
        return;
    }
    this.renderTransform();
    this.renderRenderable();
    this.renderElement();
    if (this.firstFrame) {
        this.firstFrame = false;
    }
};