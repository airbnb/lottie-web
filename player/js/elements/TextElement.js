function ITextElement(data, animationItem,parentContainer,globalData){
    this.parent.constructor.call(this,data, animationItem,parentContainer,globalData);
}
createElement(SVGBaseElement, ITextElement);

ITextElement.prototype.createElements = function(){

    this.parent.createElements.call(this);
    /*this.svgElem = document.createElementNS (svgNS, "g");

    var textElement = document.createElementNS(svgNS,'text');
    textElement.textContent = this.data.textData.text;
    textElement.setAttribute('fill', this.data.textData.fillColor);
    textElement.setAttribute('x', '0');
    textElement.setAttribute('y',this.data.textData.height - (this.data.textData.fontSize-this.data.textData.height)/2);
    this.svgElem.setAttribute('width',this.data.textData.width);
    this.svgElem.setAttribute('height',this.data.textData.height);
    this.svgElem.style.transform=this.svgElem.style.webkitTransform='translate(' + this.data.textData.xOffset+"px," + this.data.textData.yOffset+"px)";
    textElement.setAttribute('font-size', this.data.textData.fontSize);
    textElement.setAttribute('font-family', "Arial, sans-serif");
    this.svgElem.appendChild(textElement);

    this.parent.createElements.call(this);

    this.anchorElement.appendChild(this.svgElem);
    this.maskedElement = textElement;*/
};
