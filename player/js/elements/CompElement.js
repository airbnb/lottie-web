function ICompElement(data,globalData,comp){
    this.layers = data.layers;
    this.supports3d = true;
    this.completeLayers = false;
    this.pendingElements = [];
    this.elements = this.layers ? Array.apply(null,{length:this.layers.length}) : [];
    //this.layerElement = createNS('g');
    this.initElement(data,globalData,comp);
    this.tm = data.tm ? PropertyFactory.getProp(this,data.tm,0,globalData.frameRate,this.dynamicProperties) : {_placeholder:true};
    
}

extendPrototype2([BaseElement,TransformElement,SVGRenderer,SVGBaseElement,HierarchyElement,FrameElement,RenderableElement], ICompElement);

ICompElement.prototype.initElement = function(data,globalData,comp) {
    this.initFrame();
    this.initBaseData(data, globalData, comp);
    this.initTransform(data, globalData, comp);
    this.initRenderable();
    this.initHierarchy();
    this.initRendererElement();
    this.createContainerElements();
    this.addMasks();
    if(this.data.xt || !globalData.progressiveLoad){
        this.buildAllItems();
    }
    this.hide();
};

/*ICompElement.prototype.hide = function(){
    if(!this.hidden){
        this.hideElement();
        var i,len = this.elements.length;
        for( i = 0; i < len; i+=1 ){
            if(this.elements[i]){
                this.elements[i].hide();
            }
        }
    }
};*/

ICompElement.prototype.prepareFrame = function(num){
    this.prepareRenderableFrame(num);
    this.prepareProperties(num, this.isInRange);
    if(!this.isInRange && !this.data.xt){
        return;
    }

    if (!this.tm._placeholder) {
        var timeRemapped = this.tm.v;
        if(timeRemapped === this.data.op){
            timeRemapped = this.data.op - 1;
        }
        this.renderedFrame = timeRemapped;
    } else {
        this.renderedFrame = num/this.data.sr;
    }
    var i,len = this.elements.length;
    if(!this.completeLayers){
        this.checkLayers(this.renderedFrame);
    }
    for( i = 0; i < len; i+=1 ){
        if(this.completeLayers || this.elements[i]){
            this.elements[i].prepareFrame(this.renderedFrame - this.layers[i].st);
        }
    }
};

ICompElement.prototype.renderInnerContent = function() {
    var i,len = this.layers.length;
    for( i = 0; i < len; i += 1 ){
        if(this.completeLayers || this.elements[i]){
            this.elements[i].renderFrame();
        }
    }
};

ICompElement.prototype.setElements = function(elems){
    this.elements = elems;
};

ICompElement.prototype.getElements = function(){
    return this.elements;
};

ICompElement.prototype.destroyElements = function(){
    var i,len = this.layers.length;
    for( i = 0; i < len; i+=1 ){
        if(this.elements[i]){
            this.elements[i].destroy();
        }
    }
};

ICompElement.prototype.destroy = function(){
    this.destroyElements();
    this.destroyBaseElement();
};
