function PIXICompElement(data,parentContainer,globalData,comp, placeholder){
    this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
    this.layers = data.layers;
    this.supports3d = true;
    this.completeLayers = false;
    this.pendingElements = [];
    this.elements = Array.apply(null,{length:this.layers.length});
    if(this.data.tm){
        this.tm = PropertyFactory.getProp(this,this.data.tm,0,globalData.frameRate,this.dynamicProperties);
    }
    if(this.data.xt){
        this.layerElement = document.createElementNS(svgNS,'g');
        this.buildAllItems();
    } else if(!globalData.progressiveLoad){
        this.buildAllItems();
    }
}
createElement(PIXIBaseElement, PIXICompElement);

PIXICompElement.prototype.hide = function(){
    if(!this.hidden){
        var i,len = this.elements.length;
        for( i = 0; i < len; i+=1 ){
            if(this.elements[i]){
                this.elements[i].hide();
            }
        }
        this.hidden = true;
    }
};

PIXICompElement.prototype.prepareFrame = function(num){
    this._parent.prepareFrame.call(this,num);
    if(this.isVisible===false && !this.data.xt){
        return;
    }
    var timeRemapped = num;
    if(this.tm){
        timeRemapped = this.tm.v;
        if(timeRemapped === this.data.op){
            timeRemapped = this.data.op - 1;
        }
    }
    this.renderedFrame = timeRemapped/this.data.sr;
    var i,len = this.elements.length;
    if(!this.completeLayers){
        this.checkLayers(this.renderedFrame);
    }
    for( i = 0; i < len; i+=1 ){
        /*if(!this.elements[i]){
            this.checkLayer(i, this.renderedFrame - this.layers[i].st, this.layerElement);
        }*/
        if(this.completeLayers || this.elements[i]){
            this.elements[i].prepareFrame(timeRemapped/this.data.sr - this.layers[i].st);
        }
    }
};

PIXICompElement.prototype.renderFrame = function(parentMatrix){
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

PIXICompElement.prototype.setElements = function(elems){
    this.elements = elems;
};

PIXICompElement.prototype.getElements = function(){
    return this.elements;
};

PIXICompElement.prototype.destroy = function(){
    this._parent.destroy.call();
    var i,len = this.layers.length;
    for( i = 0; i < len; i+=1 ){
        if(this.elements[i]){
            this.elements[i].destroy();
        }
    }
};

PIXICompElement.prototype.checkLayers = PIXIRenderer.prototype.checkLayers;
PIXICompElement.prototype.buildItem = PIXIRenderer.prototype.buildItem;
PIXICompElement.prototype.buildAllItems = PIXIRenderer.prototype.buildAllItems;
PIXICompElement.prototype.buildElementParenting = PIXIRenderer.prototype.buildElementParenting;
PIXICompElement.prototype.createItem = PIXIRenderer.prototype.createItem;
PIXICompElement.prototype.createImage = PIXIRenderer.prototype.createImage;
PIXICompElement.prototype.createComp = PIXIRenderer.prototype.createComp;
PIXICompElement.prototype.createSolid = PIXIRenderer.prototype.createSolid;
PIXICompElement.prototype.createShape = PIXIRenderer.prototype.createShape;
PIXICompElement.prototype.createText = PIXIRenderer.prototype.createText;
PIXICompElement.prototype.createBase = PIXIRenderer.prototype.createBase;
PIXICompElement.prototype.appendElementInPos = PIXIRenderer.prototype.appendElementInPos;
PIXICompElement.prototype.checkPendingElements = SVGRenderer.prototype.checkPendingElements;
PIXICompElement.prototype.addPendingElement = SVGRenderer.prototype.addPendingElement;