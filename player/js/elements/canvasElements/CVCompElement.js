function CVCompElement(data,globalData){
    this.parent.constructor.call(this,data,globalData);
    this.layers = data.layers;
}
createElement(CVBaseElement, CVCompElement);

CVCompElement.prototype.prepareFrame = function(num){
    var renderParent = this.parent.prepareFrame.call(this,num);
    if(renderParent===false){
        return;
    }
    var i,len = this.elements.length;
    var timeRemapped = this.data.tm ? this.data.tm[num] < 0 ? 0 : num >= this.data.tm.length ? this.data.tm[this.data.tm.length - 1] : this.data.tm[num] : num;
    for( i = 0; i < len; i+=1 ){
        this.elements[i].prepareFrame(timeRemapped - this.layers[i].startTime);
    }
};

CVCompElement.prototype.draw = function(parentMatrix){
    if(this.parent.draw.call(this,parentMatrix)===false){
        return;
    }
    var i,len = this.layers.length;
    for( i = len - 1; i >= 0; i -= 1 ){
        if(this.data.hasMask){
            this.elements[i].draw();
        }else{
            this.elements[i].draw(this.finalTransform);
        }
    }
    if(this.data.hasMask){
        this.globalData.renderer.restore(true);
    }
};

CVCompElement.prototype.setElements = function(elems){
    this.elements = elems;
};

CVCompElement.prototype.getElements = function(){
    return this.elements;
};