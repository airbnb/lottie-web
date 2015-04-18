function ISolidElement(data, animationItem){
    this.parent.constructor.call(this,data, animationItem);
}
createElement(BaseElement, ISolidElement);

ISolidElement.prototype.createElements = function(){
    this.svgElem = document.createElementNS (svgNS, "g");
    this.parent.createElements.call(this);
    this.layerElement.appendChild(this.svgElem);

    var rect = document.createElementNS(svgNS,'rect');
    rect.setAttribute('width',this.data.width);
    rect.setAttribute('height',this.data.height);
    /*rect.setAttribute('width',1);
    rect.setAttribute('height',1);*/
    rect.setAttribute('fill',this.data.color);
    this.svgElem.appendChild(rect);
    styleUnselectableDiv(this.svgElem);
    styleUnselectableDiv(rect);

    this.maskingGroup = this.svgElem;
    this.maskedElement = rect;
};