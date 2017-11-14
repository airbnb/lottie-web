function ISolidElement(data,parentContainer,globalData,comp, placeholder){
    //this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
    this.initBaseData(data, globalData, comp);
    this.initTransform(data, globalData, comp);
    this.initHierarchy();
    this.initSvgElement(parentContainer, placeholder);
    this.createContainerElements();
    this.createSolid();
}
//createElement(SVGBaseElement, ISolidElement);

ISolidElement.prototype.createSolid = function(){

    var rect = document.createElementNS(svgNS,'rect');
    ////rect.style.width = this.data.sw;
    ////rect.style.height = this.data.sh;
    ////rect.style.fill = this.data.sc;
    rect.setAttribute('width',this.data.sw);
    rect.setAttribute('height',this.data.sh);
    rect.setAttribute('fill',this.data.sc);
    this.layerElement.appendChild(rect);
    this.innerElem = rect;
    if(this.data.ln){
        this.layerElement.setAttribute('id',this.data.ln);
    }
    if(this.data.cl){
        this.layerElement.setAttribute('class',this.data.cl);
    }
};

ISolidElement.prototype.prepareFrame = function(num) {
    this.prepareFrameData(num);
};

ISolidElement.prototype.renderFrame = function() {
    this.renderTransform();
    this.renderElement();
};

ISolidElement.prototype.destroy = IImageElement.prototype.destroy;

extendPrototype(BaseElement, ISolidElement);
extendPrototype(TransformElement, ISolidElement);
extendPrototype(SVGBaseElement, ISolidElement);
extendPrototype(HierarchyElement, ISolidElement);
extendPrototype(FrameElement, ISolidElement);