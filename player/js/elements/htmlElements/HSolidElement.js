function HSolidElement(data,parentContainer,globalData,comp, placeholder){
    this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
}
createElement(HBaseElement, HSolidElement);

HSolidElement.prototype.createElements = function(){
    var parent = document.createElement('div');
    styleDiv(parent);
    var cont = document.createElementNS(svgNS,'svg');
    styleDiv(cont);
    cont.setAttribute('width',this.data.sw);
    cont.setAttribute('height',this.data.sh);
    parent.appendChild(cont);
    this.layerElement = parent;
    this.transformedElement = parent;
    //this.appendNodeToParent(parent);
    this.baseElement = parent;
    this.innerElem = parent;
    if(this.data.ln){
        this.innerElem.setAttribute('id',this.data.ln);
    }
    if(this.data.bm !== 0){
        this.setBlendMode();
    }
    var rect = document.createElementNS(svgNS,'rect');
    rect.setAttribute('width',this.data.sw);
    rect.setAttribute('height',this.data.sh);
    rect.setAttribute('fill',this.data.sc);
    cont.appendChild(rect);
    if(this.data.hasMask){
        this.maskedElement = rect;
    }
    this.checkParenting();
};



HSolidElement.prototype.hide = SVGBaseElement.prototype.hide;
HSolidElement.prototype.show = SVGBaseElement.prototype.show;
HSolidElement.prototype.renderFrame = IImageElement.prototype.renderFrame;
HSolidElement.prototype.destroy = IImageElement.prototype.destroy;