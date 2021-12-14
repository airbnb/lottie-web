// TODO(myxvisual): Work
/* global extendPrototype, BaseElement, TransformElement, CVBaseElement,HierarchyElement, FrameElement,
RenderableElement, SVGShapeElement, IImageElement, createTag */

function CVVideoElement(data, globalData, comp) {
    this.assetData = globalData.getAssetData(data.refId);
    this.img = globalData.imageLoader.getAsset(this.assetData);
    this.initElement(data, globalData, comp);
}
extendPrototype([BaseElement, TransformElement, CVBaseElement, HierarchyElement, FrameElement, RenderableElement], CVVideoElement);

CVVideoElement.prototype.initElement = SVGShapeElement.prototype.initElement;
CVVideoElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame;

CVVideoElement.prototype.createContent = function () {
};

CVVideoElement.prototype.renderInnerContent = function () {
    this.canvasContext.drawImage(this.img, 0, 0);
};

CVVideoElement.prototype.destroy = function () {
    this.img = null;
};