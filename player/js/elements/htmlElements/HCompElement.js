function HCompElement(data,parentContainer,globalData,comp, placeholder){
    this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
    this.layers = data.layers;
    this.supports3d = true;
    this.completeLayers = false;
    this.pendingElements = [];
    this.elements = Array.apply(null,{length:this.layers.length});
    if(this.data.tm){
        this.tm = PropertyFactory.getProp(this,this.data.tm,0,globalData.frameRate,this.dynamicProperties);
    }
    if(this.data.hasMask) {
        this.supports3d = false;
    }
    if(this.data.xt){
        this.layerElement = document.createElement('div');
    }
    this.buildAllItems();

}
createElement(HBaseElement, HCompElement);

HCompElement.prototype.createElements = function(){
    var divElement = document.createElement('div');
    styleDiv(divElement);
    if(this.data.ln){
        divElement.setAttribute('id',this.data.ln);
    }
    divElement.style.clip = 'rect(0px, '+this.data.w+'px, '+this.data.h+'px, 0px)';
    if(this.data.hasMask){
        var compSvg = document.createElementNS(svgNS,'svg');
        styleDiv(compSvg);
        compSvg.setAttribute('width',this.data.w);
        compSvg.setAttribute('height',this.data.h);
        var g = document.createElementNS(svgNS,'g');
        compSvg.appendChild(g);
        divElement.appendChild(compSvg);
        this.maskedElement = g;
        this.baseElement = divElement;
        this.layerElement = g;
        this.transformedElement = divElement;
    }else{
        this.layerElement = divElement;
        this.baseElement = this.layerElement;
        this.transformedElement = divElement;
    }
    //this.appendNodeToParent(this.layerElement);
    this.checkParenting();
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
        if(this.completeLayers || this.elements[i]){
            this.elements[i].renderFrame();
        }
    }
    if(this.firstFrame){
        this.firstFrame = false;
    }
};

HCompElement.prototype.checkLayers = BaseRenderer.prototype.checkLayers;
HCompElement.prototype.buildItem = HybridRenderer.prototype.buildItem;
HCompElement.prototype.checkPendingElements = HybridRenderer.prototype.checkPendingElements;
HCompElement.prototype.addPendingElement = HybridRenderer.prototype.addPendingElement;
HCompElement.prototype.buildAllItems = BaseRenderer.prototype.buildAllItems;
HCompElement.prototype.createItem = HybridRenderer.prototype.createItem;
HCompElement.prototype.buildElementParenting = HybridRenderer.prototype.buildElementParenting;
HCompElement.prototype.createImage = HybridRenderer.prototype.createImage;
HCompElement.prototype.createComp = HybridRenderer.prototype.createComp;
HCompElement.prototype.createSolid = HybridRenderer.prototype.createSolid;
HCompElement.prototype.createShape = HybridRenderer.prototype.createShape;
HCompElement.prototype.createText = HybridRenderer.prototype.createText;
HCompElement.prototype.createBase = HybridRenderer.prototype.createBase;
HCompElement.prototype.appendElementInPos = HybridRenderer.prototype.appendElementInPos;