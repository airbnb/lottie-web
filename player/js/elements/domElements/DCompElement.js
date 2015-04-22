function DCompElement(data, animationItem){
    this.layers = data.layers;
    data.threeDComp = false;
    this.parent.constructor.call(this,data, animationItem);
}
createElement(DBaseElement, DCompElement);

DCompElement.prototype.createElements = function(){
    var i = 0, len = this.layers.length;
    while(i<len){
        if(this.layers[i].threeD){
            this.data.threeDComp = true;
            break;
        }
        i+=1;
    }
    if(this.data.threeDComp){
        this.layerElement = document.createElement('div');
        this.layerElement.style.position = 'absolute';
        this.layerElement.style.top = 0;
        this.layerElement.style.left = 0;
        this.layerElement.style.backfaceVisibility  = this.layerElement.style.webkitBackfaceVisibility = 'hidden';
        this.layerElement.style.transformStyle = this.animationItem.container.style.webkitTransformStyle = "preserve-3d";
        this.layerElement.style.transformOrigin = "0 0";
        this.layerElement.setAttribute('id',this.data.layerName);
    }else{
        this.layerElement = document.createElement('canvas');
        this.layerElement.style.position = 'absolute';
        this.layerElement.style.top = 0;
        this.layerElement.style.left = 0;
        this.layerElement.style.backfaceVisibility  = this.layerElement.style.webkitBackfaceVisibility = 'hidden';
        this.layerElement.style.transformStyle = this.animationItem.container.style.webkitTransformStyle = "preserve-3d";
        this.layerElement.style.transformOrigin = "0 0";
        this.layerElement.setAttribute('width',this.data.width);
        this.layerElement.setAttribute('height',this.data.height);
        this.layerElement.setAttribute('id',this.data.layerName);

        var rendererParams = {
            clearCanvas: true,
            context: this.layerElement.getContext('2d'),
            scaleMode: 'fit'
        };
        this.renderer = new CanvasRenderer(this,rendererParams);
        this.data.compWidth = this.data.width;
        this.data.compHeight = this.data.height;
        this.renderer.configAnimation({animation:this.data});
        this.renderer.buildItems(this.data.layers);
    }


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

    var timeRemapped = this.data.tm ? this.data.tm[num] < 0 ? 0 : this.data.tm[num] : num;
    if(this.data.threeDComp){
        var i,len = this.layers.length;
        for( i = 0; i < len; i+=1 ){
            this.layers[i].element.prepareFrame(timeRemapped - this.layers[i].startTime);
        }
        for( i = 0; i < len; i+=1 ){
            this.layers[i].element.renderFrame(timeRemapped - this.layers[i].startTime);
        }
    }else{
        this.renderer.renderFrame(timeRemapped)
    }
};