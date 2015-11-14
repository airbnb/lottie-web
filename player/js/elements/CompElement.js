function ICompElement(data,parentContainer,globalData, placeholder){
    this.parent.constructor.call(this,data,parentContainer,globalData, placeholder);
    this.layers = data.layers;
    if(this.data.tm){
        this.tm = PropertyFactory.getProp(this.data,this.data.tm,0,globalData.frameRate,this.dynamicProperties);
    }
}
createElement(SVGBaseElement, ICompElement);

ICompElement.prototype.getComposingElement = function(){
    return this.layerElement;
};

ICompElement.prototype.hide = function(){
    if(!this.hidden){
        var i,len = this.elements.length;
        for( i = 0; i < len; i+=1 ){
            this.elements[i].hide();
        }
        this.hidden = true;
    }
};

ICompElement.prototype.prepareFrame = function(num){
    this.parent.prepareFrame.call(this,num);
    if(this.isVisible===false){
        return;
    }
    var timeRemapped = num;
    if(this.tm){
        timeRemapped = this.tm.v;
        if(timeRemapped === this.data.op){
            timeRemapped = this.data.op - 1;
        }
    }
    var i,len = this.elements.length;
    for( i = 0; i < len; i+=1 ){
        this.elements[i].prepareFrame(timeRemapped - this.layers[i].st);
    }
};

ICompElement.prototype.renderFrame = function(parentMatrix){
    var renderParent = this.parent.renderFrame.call(this,parentMatrix);
    var i,len = this.layers.length;
    if(renderParent===false){
        this.hide();
        return;
    }

    this.hidden = false;

    for( i = 0; i < len; i+=1 ){
        if(this.data.hasMask){
            this.elements[i].renderFrame();
        }else{
            this.elements[i].renderFrame(this.finalTransform);
        }
    }
    if(this.firstFrame){
        this.firstFrame = false;
    }
};

ICompElement.prototype.setElements = function(elems){
    this.elements = elems;
};

ICompElement.prototype.getElements = function(){
    return this.elements;
};

ICompElement.prototype.destroy = function(){
    this.parent.destroy.call();
    var i,len = this.layers.length;
    for( i = 0; i < len; i+=1 ){
        this.elements[i].destroy();
    }
};