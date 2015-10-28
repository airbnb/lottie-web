function ICompElement(data,parentContainer,globalData, placeholder){
    this.parent.constructor.call(this,data,parentContainer,globalData, placeholder);
    this.layers = data.layers;
    if(this.data.tm){
        this.tm = PropertyFactory.getProp(this.data,this.data.tm,0,globalData.frameRate,this.dynamicProperties);
    }
}
createElement(BaseElement, ICompElement);

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

ICompElement.prototype.renderFrame = function(num,parentMatrix){
    var renderParent = this.parent.renderFrame.call(this,num,parentMatrix);
    if(renderParent===false){
        this.hide();
        return;
    }

    this.hidden = false;
    var i,len = this.layers.length;

    var timeRemapped = num;
    if(this.tm){
        timeRemapped = Math.round(this.tm.v);
    }
    for( i = 0; i < len; i+=1 ){
        this.elements[i].prepareFrame(timeRemapped - this.layers[i].st);
    }
    for( i = 0; i < len; i+=1 ){
        if(this.data.hasMask){
            this.elements[i].renderFrame(timeRemapped - this.layers[i].st);
        }else{
            this.elements[i].renderFrame(timeRemapped - this.layers[i].st,this.finalTransform);
        }
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