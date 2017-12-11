function CVSolidElement(data, globalData, comp) {
    this.initElement(data,globalData,comp);
}
extendPrototype2([BaseElement, TransformElement, CVBaseElement, HierarchyElement, FrameElement, RenderableElement], CVSolidElement);

CVSolidElement.prototype.initElement = IShapeElement.prototype.initElement;
CVSolidElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame;

CVSolidElement.prototype.renderInnerContent = function() {
    var ctx = this.canvasContext;
    ctx.fillStyle = this.data.sc;
    ctx.fillRect(0, 0, this.data.sw, this.data.sh);
    //
};

CVSolidElement.prototype.renderFrame = CVImageElement.prototype.renderFrame;