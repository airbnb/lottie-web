function DSolidElement(data, animationItem){
    this.parent.constructor.call(this,data, animationItem);
}
createElement(DBaseElement, DSolidElement);

DSolidElement.prototype.createElements = function(){
    this.parent.createElements.call(this);

    this.layerElement.setAttribute('width',this.data.width);
    this.layerElement.setAttribute('height',this.data.height);
    var rect = document.createElementNS(svgNS,'rect');
    rect.setAttribute('width',this.data.width);
    rect.setAttribute('height',this.data.height);
    rect.setAttribute('fill',this.data.color);
    this.layerElement.appendChild(rect);
    styleUnselectableDiv(rect);

    this.maskingGroup = this.svgElem;
    this.maskedElement = rect;
};