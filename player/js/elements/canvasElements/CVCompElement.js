function CVCompElement(data,globalData){
    this.parent.constructor.call(this,data,globalData);
    this.layers = data.layers;
    if(this.data.tm){
        this.tm = PropertyFactory.getProp(this.data,this.data.tm,0,globalData.frameRate,this.dynamicProperties);
    }
}
createElement(CVBaseElement, CVCompElement);

CVCompElement.prototype.prepareFrame = function(num){
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

CVCompElement.prototype.renderFrame = function(parentMatrix){
    if(this.parent.renderFrame.call(this,parentMatrix)===false){
        return;
    }
    var i,len = this.layers.length;
    for( i = len - 1; i >= 0; i -= 1 ){
        this.elements[i].renderFrame(this.finalTransform);
    }
    if(this.data.hasMask){
        this.globalData.renderer.restore(true);
    }
    if(this.firstFrame){
        this.firstFrame = false;
    }
};

CVCompElement.prototype.setElements = function(elems){
    this.elements = elems;
};

CVCompElement.prototype.getElements = function(){
    return this.elements;
};

CVCompElement.prototype.destroy = function(){
    var i,len = this.layers.length;
    for( i = len - 1; i >= 0; i -= 1 ){
        this.elements[i].destroy();
    }
    this.layers = null;
    this.elements = null;
    this.parent.destroy.call();
};