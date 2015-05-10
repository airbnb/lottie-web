function ISolidElement(data, animationItem,parentContainer){
    this.parent.constructor.call(this,data, animationItem,parentContainer);
}
createElement(BaseElement, ISolidElement);

ISolidElement.prototype.createElements = function(){
    this.parent.createElements.call(this);

    var rect = document.createElementNS(svgNS,'rect');
    rect.setAttribute('width',this.data.width);
    rect.setAttribute('height',this.data.height);
    /*rect.setAttribute('width',1);
    rect.setAttribute('height',1);*/
    rect.setAttribute('fill',this.data.color);
    this.layerElement.appendChild(rect);

    this.maskingGroup = rect;
    this.maskedElement = rect;
};