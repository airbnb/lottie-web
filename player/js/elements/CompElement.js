function ICompElement(data, animationItem,parentContainer,globalData){
    this.parent.constructor.call(this,data, animationItem,parentContainer,globalData);
    this.layers = data.layers;
}
createElement(BaseElement, ICompElement);

ICompElement.prototype.getComposingElement = function(){
    return this.layerElement;
};

ICompElement.prototype.renderFrame = function(num,parentMatrix){
    var renderParent = this.parent.renderFrame.call(this,num,parentMatrix);
    if(renderParent===false){
        return;
    }

    var i,len = this.layers.length;
    var timeRemapped = this.data.tm ? this.data.tm[num] < 0 ? 0 : this.data.tm[num] : num;
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