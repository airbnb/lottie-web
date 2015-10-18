function IImageElement(data,parentContainer,globalData,placeholder){
    this.assetData = globalData.getAssetData(data.refId);
    this.path = globalData.getPath();
    this.parent.constructor.call(this,data,parentContainer,globalData,placeholder);
}
createElement(BaseElement, IImageElement);

IImageElement.prototype.createElements = function(){

    var self = this;

    var imageLoaded = function(){
        self.image.setAttributeNS('http://www.w3.org/1999/xlink','href',self.path+self.assetData.p);
        self.maskedElement = self.image;
    };

    var img = new Image();
    img.addEventListener('load', imageLoaded, false);
    img.addEventListener('error', imageLoaded, false);

    img.src = this.path+this.assetData.p;

    this.parent.createElements.call(this);

    this.image = document.createElementNS(svgNS,'image');
    this.image.setAttribute('width',this.assetData.w+"px");
    this.image.setAttribute('height',this.assetData.h+"px");
    if(this.layerElement === this.parentContainer){
        this.appendNodeToParent(this.image);
    }else{
        this.layerElement.appendChild(this.image);
    }

};

IImageElement.prototype.hide = function(){
    if(!this.hidden){
        this.image.setAttribute('visibility','hidden');
        this.hidden = true;
    }
};

IImageElement.prototype.renderFrame = function(num,parentMatrix){
    var renderParent = this.parent.renderFrame.call(this,num,parentMatrix);
    if(renderParent===false){
        this.hide();
        return;
    }
    if(this.hidden){
        this.lastData.o = -1;
        this.hidden = false;
        this.image.setAttribute('visibility', 'visible');
    }
    if(!this.data.hasMask){
        if(!this.renderedFrames[this.globalData.frameNum]){
            var tr = 'matrix('+this.finalTransform.mat.props.join(',')+')';
            if(this.lastData && this.lastData.tr === tr && this.lastData.o === this.finalTransform.opacity){
                this.renderedFrames[this.globalData.frameNum] = this.lastData;
            }else{
                this.renderedFrames[this.globalData.frameNum] = new RenderedFrame(tr,this.finalTransform.opacity);
            }
        }
        var renderedFrameData = this.renderedFrames[this.globalData.frameNum];
        if(this.lastData.tr != renderedFrameData.tr){
            this.image.setAttribute('transform',renderedFrameData.tr);
        }
        if(this.lastData.o !== renderedFrameData.o){
            this.image.setAttribute('opacity',renderedFrameData.o);
        }
        this.lastData = renderedFrameData;
    }
};

IImageElement.prototype.destroy = function(){
    this.parent.destroy.call();
    this.image =  null;
};