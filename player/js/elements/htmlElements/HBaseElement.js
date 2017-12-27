function HBaseElement(data,globalData,comp){
};

HBaseElement.prototype.checkBlendMode = function(){
};

HBaseElement.prototype.getBaseElement = SVGBaseElement.prototype.getBaseElement;

HBaseElement.prototype.initRendererElement = function(){
    this.baseElement = createTag('div');
    if(this.data.hasMask) {
        this.svgElement = createNS('svg');
        this.layerElement = createNS('g');
        this.maskedElement = this.layerElement;
        this.svgElement.appendChild(this.layerElement);
        this.baseElement.appendChild(this.svgElement);
    } else {
        this.layerElement = this.baseElement;
    }
    styleDiv(this.baseElement);
}

HBaseElement.prototype.createContainerElements = function(){
    this.effectsManager = new CVEffects(this);
    this.transformedElement = this.baseElement;
    this.maskedElement = this.layerElement;
    if (this.data.ln) {
        this.layerElement.setAttribute('id',this.data.ln);
    }
    if (this.data.bm !== 0) {
        this.setBlendMode();
    }
    this.checkParenting();
};

HBaseElement.prototype.renderElement = function() {
    if(this.finalTransform.matMdf){
        this.transformedElement.style.transform = this.transformedElement.style.webkitTransform = this.finalTransform.mat.toCSS();
    }
    if(this.finalTransform.opMdf){
        this.transformedElement.style.opacity = this.finalTransform.mProp.o.v;
    }
};

HBaseElement.prototype.renderFrame = function() {
    //If it is exported as hidden (data.hd === true) no need to render
    //If it is not visible no need to render
    if (this.data.hd || this.hidden) {
        return;
    }
    this.renderTransform();
    this.renderRenderable();
    this.renderElement();
    this.renderInnerContent();
    if (this.firstFrame) {
        this.firstFrame = false;
    }
};

HBaseElement.prototype.destroy = function(){
    this.layerElement = null;
    this.transformedElement = null;
    if(this.matteElement) {
        this.matteElement = null;
    }
    if(this.maskManager) {
        this.maskManager.destroy();
        this.maskManager = null;
    }
};

HBaseElement.prototype.getDomElement = function(){
    return this.layerElement;
};
HBaseElement.prototype.addMasks = function(){
    this.maskManager = new MaskElement(this.data, this, this.globalData, this.dynamicProperties);
};

HBaseElement.prototype.setMatte = function(){

}

HBaseElement.prototype.buildElementParenting = HybridRenderer.prototype.buildElementParenting;