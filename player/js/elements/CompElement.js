function ICompElement(data, animationItem){
    this.parent.constructor.call(this,data, animationItem);
    this.layers = data.layers;
}
createElement(BaseElement, ICompElement);

ICompElement.prototype.createElements = function(){

    this.svgElem = document.createElementNS (svgNS, "g");
    this.parent.createElements.call(this);
};

ICompElement.prototype.getComposingElement = function(){
    return this.anchorElement;
};

ICompElement.prototype.renderFrame = function(num){
    var renderParent = this.parent.renderFrame.call(this,num);
    if(renderParent===false){
        return;
    }

    var i,len = this.layers.length;
    var timeRemapped = this.data.tm ? this.data.tm[num] < 0 ? 0 : this.data.tm[num] : num;
    for( i = 0; i < len; i+=1 ){
        this.layers[i].element.renderFrame(timeRemapped - this.layers[i].startTime);
    }
};