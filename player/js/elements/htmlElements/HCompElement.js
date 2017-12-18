function HCompElement(data,globalData,comp){
    this.layers = data.layers;
    this.supports3d = !data.hasMask;
    this.completeLayers = false;
    this.pendingElements = [];
    this.elements = this.layers ? Array.apply(null,{length:this.layers.length}) : [];
    this.tm = data.tm ? PropertyFactory.getProp(this,data.tm,0,globalData.frameRate,this.dynamicProperties) : {_placeholder:true};
    console.log(this.initElement)
    this.initElement(data,globalData,comp);

}
extendPrototype2([BaseElement,TransformElement,HybridRenderer,SVGBaseElement,HierarchyElement,FrameElement,RenderableElement, ICompElement], HCompElement);

HCompElement.prototype.createContainerElements = function(){
    //divElement.style.clip = 'rect(0px, '+this.data.w+'px, '+this.data.h+'px, 0px)';
    if(this.data.hasMask){
        var compSvg = createNS('svg');
        styleDiv(compSvg);
        compSvg.setAttribute('width',this.data.w);
        compSvg.setAttribute('height',this.data.h);
        var g = createNS('g');
        compSvg.appendChild(g);
        divElement.appendChild(compSvg);
        this.maskedElement = g;
        this.baseElement = divElement;
        this.layerElement = g;
        this.transformedElement = divElement;
    }else{
        var compSvg = createNS('svg');
        this.layerElement.appendChild(compSvg);
        this.layerElement = compSvg;

    }
    //this.appendNodeToParent(this.layerElement);
    this.checkParenting();
};