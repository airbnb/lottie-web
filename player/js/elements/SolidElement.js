function ISolidElement(data,parentContainer,globalData, placeholder){
    this.parent.constructor.call(this,data,parentContainer,globalData, placeholder);
}
createElement(SVGBaseElement, ISolidElement);

ISolidElement.prototype.createElements = function(){
    this.parent.createElements.call(this);

    var rect = document.createElementNS(svgNS,'rect');
    ////rect.style.width = this.data.sw;
    ////rect.style.height = this.data.sh;
    ////rect.style.fill = this.data.sc;
    rect.setAttribute('width',this.data.sw);
    rect.setAttribute('height',this.data.sh);
    rect.setAttribute('fill',this.data.sc);
    if(this.layerElement === this.parentContainer){
        this.appendNodeToParent(rect);
    }else{
        this.layerElement.appendChild(rect);
    }
    if(this.data.ln){
        this.innerElem.setAttribute('id',this.data.ln);
    }
    this.innerElem = rect;
};

ISolidElement.prototype.hide = IImageElement.prototype.hide;
ISolidElement.prototype.renderFrame = IImageElement.prototype.renderFrame;
ISolidElement.prototype.destroy = IImageElement.prototype.destroy;
