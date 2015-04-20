function DCompElement(data, animationItem){
    this.parent.constructor.call(this,data, animationItem);
    this.layers = data.layers;
}
createElement(DBaseElement, DCompElement);

DCompElement.prototype.createElements = function(){
    this.layerElement = document.createElement('div');
    this.layerElement.style.position = 'absolute';
    this.layerElement.style.top = 0;
    this.layerElement.style.left = 0;
    this.layerElement.style.backfaceVisibility  = this.layerElement.style.webkitBackfaceVisibility = 'hidden';
    this.layerElement.style.transformStyle = this.animationItem.container.style.webkitTransformStyle = "preserve-3d";
    this.layerElement.style.transformOrigin = "0 0";
    this.layerElement.setAttribute('id',this.data.layerName);


    this.maskingGroup = this.layerElement;

    this.maskedElement = this.layerElement;
    this.mainElement = this.layerElement;
};

DCompElement.prototype.getComposingElement = function(){
    return this.layerElement;
};

DCompElement.prototype.renderFrame = function(num){
    var renderParent = this.parent.renderFrame.call(this,num);
    if(renderParent===false){
        return;
    }

    var i,len = this.layers.length;
    var timeRemapped = this.data.tm ? this.data.tm[num] < 0 ? 0 : this.data.tm[num] : num;
    for( i = 0; i < len; i+=1 ){
        this.layers[i].element.prepareFrame(timeRemapped - this.layers[i].startTime);
    }
    for( i = 0; i < len; i+=1 ){
        this.layers[i].element.renderFrame(timeRemapped - this.layers[i].startTime);
    }
};