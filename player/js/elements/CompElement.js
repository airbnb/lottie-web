function ICompElement(data, animationItem,parentContainer,globalData){
    this.parent.constructor.call(this,data, animationItem,parentContainer,globalData);
    this.layers = data.layers;
}
createElement(BaseElement, ICompElement);

ICompElement.prototype.getComposingElement = function(){
    return this.layerElement;
};

ICompElement.prototype.hide = function(){
    if(!this.hidden){
        var i,len = this.layers.length;
        for( i = 0; i < len; i+=1 ){
            this.layers[i].element.hide();
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
    var timeRemapped = this.data.tm ? this.data.tm[num] < 0 ? 0 : num >= this.data.tm.length ? this.data.tm[this.data.tm.length - 1] : this.data.tm[num] : num;
    for( i = 0; i < len; i+=1 ){
        this.layers[i].element.prepareFrame(timeRemapped - this.layers[i].startTime);
    }
    for( i = 0; i < len; i+=1 ){
        if(this.data.hasMask){
            this.layers[i].element.renderFrame(timeRemapped - this.layers[i].startTime);
        }else{
            this.layers[i].element.renderFrame(timeRemapped - this.layers[i].startTime,this.finalTransform);
        }
    }
};