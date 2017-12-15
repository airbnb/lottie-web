function HSolidElement(data,globalData,comp){
    this.initElement(data,globalData,comp);
}
extendPrototype2([BaseElement,TransformElement,HBaseElement,HierarchyElement,FrameElement,RenderableElement], HSolidElement);

HSolidElement.prototype.createContent = function(){
    var rect;
    if(this.data.hasMask){
        rect = createNS('rect');
        rect.setAttribute('width',this.data.sw);
        rect.setAttribute('height',this.data.sh);
        rect.setAttribute('fill',this.data.sc);
        this.baseElement.setAttribute('width',this.data.sw);
        this.baseElement.setAttribute('height',this.data.sh);
    } else {
        rect = document.createElement('div');
        rect.style.width = this.data.sw + 'px';
        rect.style.height = this.data.sh + 'px';
        rect.style.backgroundColor = this.data.sc;
    }
    this.layerElement.appendChild(rect);
};

HSolidElement.prototype.hide = SVGBaseElement.prototype.hide;
HSolidElement.prototype.show = SVGBaseElement.prototype.show;
HSolidElement.prototype.renderFrame = IImageElement.prototype.renderFrame;
HSolidElement.prototype.destroy = IImageElement.prototype.destroy;
HSolidElement.prototype.renderInnerContent = IImageElement.prototype.renderInnerContent;
HSolidElement.prototype.initElement = IShapeElement.prototype.initElement;
HSolidElement.prototype.prepareFrame = IShapeElement.prototype.prepareFrame;