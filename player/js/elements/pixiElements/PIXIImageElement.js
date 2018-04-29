function PIXIImageElement(data,globalData,comp){
    this.assetData = globalData.getAssetData(data.refId);
    this.initElement(data,globalData,comp);
}
extendPrototype([BaseElement, TransformElement, PIXIBaseElement, HierarchyElement, FrameElement, RenderableElement], PIXIImageElement);

PIXIImageElement.prototype.createContent = function(){
    var assetPath = this.globalData.getAssetsPath(this.assetData);
    var texture = PIXI.Texture.fromImage(assetPath);
    this.innerElem = new PIXI.Sprite(texture);
    this.layerElement.addChild(this.innerElem);

};

PIXIImageElement.prototype.initElement = function(data,globalData,comp) {
    this.initFrame();
    this.initBaseData(data, globalData, comp);
    this.initTransform(data, globalData, comp);
    this.initHierarchy();
    this.initRenderable();
    this.initRendererElement();
    this.createContainerElements();
    this.addMasks();
    this.createContent();
    this.hide();
}

PIXIImageElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame;