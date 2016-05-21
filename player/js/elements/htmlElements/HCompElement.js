function HCompElement(data,parentContainer,globalData,comp, placeholder){
    this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
    this.layers = data.layers;
    this.isSvg = false;
    if(this.data.tm){
        this.tm = PropertyFactory.getProp(this,this.data.tm,0,globalData.frameRate,this.dynamicProperties);
    }
    if(this.data.hasMask) {
        this.isSvg = true;
    }
}
createElement(HBaseElement, HCompElement);
extendPrototype(ExpressionComp,HCompElement);

HCompElement.prototype.getDomElement = function(){
    return this.composingElement;
};

HCompElement.prototype.getComposingElement = function(){
    return this.layerElement;
};

HCompElement.prototype.createElements = function(){
    this.layerElement = document.createElement('div');
    styleDiv(this.layerElement);
    if(this.data.ln){
        this.layerElement.setAttribute('id',this.data.ln);
    }
    this.layerElement.style.clip = 'rect(0px, '+this.data.w+'px, '+this.data.h+'px, 0px)';
    if(this.layerElement !== this.parentContainer){
        this.placeholder = null;
    }
    if(this.data.hasMask){
        var compSvg = document.createElementNS(svgNS,'svg');
        compSvg.setAttribute('width',this.data.w);
        compSvg.setAttribute('height',this.data.h);
        var g = document.createElementNS(svgNS,'g');
        compSvg.appendChild(g);
        this.layerElement.appendChild(compSvg);
        this.maskedElement = g;
        this.composingElement = g;
    }else{
        this.composingElement = this.layerElement;
    }
    this.appendNodeToParent(this.layerElement);
};

HCompElement.prototype.hide = ICompElement.prototype.hide;
HCompElement.prototype.prepareFrame = ICompElement.prototype.prepareFrame;
HCompElement.prototype.setElements = ICompElement.prototype.setElements;
HCompElement.prototype.getElements = ICompElement.prototype.getElements;
HCompElement.prototype.destroy = ICompElement.prototype.destroy;

HCompElement.prototype.renderFrame = function(parentMatrix){
    var renderParent = this._parent.renderFrame.call(this,parentMatrix);
    var i,len = this.layers.length;
    if(renderParent===false){
        this.hide();
        return;
    }

    this.hidden = false;

    for( i = 0; i < len; i+=1 ){
        this.elements[i].renderFrame();
    }
    if(this.firstFrame){
        this.firstFrame = false;
    }
};