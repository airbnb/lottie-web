function ISolidElement(data,globalData,comp){
    this.initElement(data,globalData,comp);
}
extendPrototype([IImageElement], ISolidElement);

ISolidElement.prototype.createContent = function(){

    var rect = createNS('rect');
    ////rect.style.width = this.data.sw;
    ////rect.style.height = this.data.sh;
    ////rect.style.fill = this.data.sc;
    rect.setAttribute('width',this.data.sw);
    rect.setAttribute('height',this.data.sh);
    rect.setAttribute('fill',this.data.sc);
    this.layerElement.appendChild(rect);
};