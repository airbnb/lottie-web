function CVCompElement(data, animationItem){
    this.parent.constructor.call(this,data, animationItem);
    this.layers = data.layers;
}
createElement(CVBaseElement, CVCompElement);

CVCompElement.prototype.createElements = function(){

    this.svgElem = document.createElementNS (svgNS, "g");
    this.parent.createElements.call(this);
};

CVCompElement.prototype.getComposingElement = function(){
    return this.anchorElement;
};

CVCompElement.prototype.renderFrame = function(num){
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

CVCompElement.prototype.prepareFrame = function(num){
    this.parent.renderFrame.call(this,num);

    var i,len = this.layers.length;
    var timeRemapped = this.data.tm ? this.data.tm[num] < 0 ? 0 : this.data.tm[num] : num;
    for( i = 0; i < len; i+=1 ){
        this.layers[i].element.prepareFrame(timeRemapped - this.layers[i].startTime);
    }
};

CVCompElement.prototype.draw = function(){
    var i,len = this.layers.length;
    for( i = len - 1; i >= 0; i -= 1 ){
        this.layers[i].element.draw();
    }
};