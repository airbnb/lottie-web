function HCompElement(data,globalData,comp){
    this.layers = data.layers;
    this.supports3d = !data.hasMask;
    this.completeLayers = false;
    this.pendingElements = [];
    this.elements = this.layers ? Array.apply(null,{length:this.layers.length}) : [];
    this.tm = data.tm ? PropertyFactory.getProp(this,data.tm,0,globalData.frameRate,this.dynamicProperties) : {_placeholder:true};
    
    this.initElement(data,globalData,comp);
}

extendPrototype2([HybridRenderer, ICompElement, HBaseElement], HCompElement);

HCompElement.prototype.createContainerElements = function(){
    //divElement.style.clip = 'rect(0px, '+this.data.w+'px, '+this.data.h+'px, 0px)';
    if(this.data.hasMask){
        this.transformedElement = this.layerElement;
        this.svgElement.setAttribute('width',this.data.w);
        this.svgElement.setAttribute('height',this.data.h);
    }else{
        this.transformedElement = this.layerElement;

    }
    //this.appendNodeToParent(this.layerElement);
    this.effectsManager = new CVEffects(this);
    this.checkParenting();
};