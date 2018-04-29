function PIXISolidElement(data,globalData,comp){
    this.initElement(data,globalData,comp);
}
extendPrototype([BaseElement, TransformElement, PIXIBaseElement, HierarchyElement, FrameElement, RenderableElement], PIXISolidElement);

PIXISolidElement.prototype.createContent = function(){
    var graphics = new PIXI.Graphics();
    graphics.beginFill(this.data.sc.replace('#','0x'));
    graphics.drawRect(0, 0, this.data.sw, this.data.sh);
    this.layerElement.addChild(graphics);
};

PIXISolidElement.prototype.initElement = function(data,globalData,comp) {
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