function ISolidElement(data,parentContainer,globalData,comp){
    this.initElement(data,parentContainer,globalData,comp);
}
extendPrototype2([BaseElement,TransformElement,SVGBaseElement,HierarchyElement,FrameElement,RenderableElement], ISolidElement);

ISolidElement.prototype.createContent = function(){

    var rect = document.createElementNS(svgNS,'rect');
    ////rect.style.width = this.data.sw;
    ////rect.style.height = this.data.sh;
    ////rect.style.fill = this.data.sc;
    rect.setAttribute('width',this.data.sw);
    rect.setAttribute('height',this.data.sh);
    rect.setAttribute('fill',this.data.sc);
    this.layerElement.appendChild(rect);
    this.innerElem = rect;
    
};

ISolidElement.prototype.initElement = IImageElement.prototype.initElement;
ISolidElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame;
ISolidElement.prototype.renderFrame = IImageElement.prototype.renderFrame;
ISolidElement.prototype.destroy = IImageElement.prototype.destroy;
ISolidElement.prototype.hide = IImageElement.prototype.hide;
ISolidElement.prototype.show = IImageElement.prototype.show;
