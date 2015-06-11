function IImageElement(data, animationItem,parentContainer,globalData){
    this.animationItem = animationItem;
    this.assets = this.animationItem.getAssets();
    this.path = this.animationItem.getPath();
    this.parent.constructor.call(this,data, animationItem,parentContainer,globalData);
}
createElement(BaseElement, IImageElement);

IImageElement.prototype.createElements = function(){

    var self = this;

    var imageLoaded = function(){
        self.image.setAttributeNS('http://www.w3.org/1999/xlink','href',self.path+self.assets[self.data.assetId].path);
        self.maskedElement = self.image;
        self.animationItem.elementLoaded();
    };

    var img = new Image();
    img.addEventListener('load', imageLoaded, false);
    img.addEventListener('error', imageLoaded, false);
    img.src = this.path+this.assets[this.data.assetId].path;

    this.parent.createElements.call(this);

    this.image = document.createElementNS(svgNS,'image');
    this.image.setAttribute('width',this.data.width+"px");
    this.image.setAttribute('height',this.data.height+"px");
    this.layerElement.appendChild(this.image);

};

IImageElement.prototype.hide = function(){
    if(!this.hidden && !this.data.hasMask){
        this.image.setAttribute('opacity','0');
        this.hidden = true;
    }
};

IImageElement.prototype.renderFrame = function(num,parentMatrix){
    var renderParent = this.parent.renderFrame.call(this,num,parentMatrix);
    if(renderParent===false){
        this.hide();
        return;
    }
    this.hidden = false;
    if(!this.data.hasMask){
        if(!this.renderedFrames[this.globalData.frameNum]){
            this.renderedFrames[this.globalData.frameNum] = {
                tr: 'matrix('+this.finalTransform.mat.props.join(',')+')',
                o: this.finalTransform.opacity
            }
        }
        var renderedFrameData = this.renderedFrames[this.globalData.frameNum];
        if(this.lastData.tr != renderedFrameData.tr){
            this.lastData.tr = renderedFrameData.tr;
            this.image.setAttribute('transform',renderedFrameData.tr);
        }
        if(this.lastData.o !== renderedFrameData.o){
            this.lastData.o = renderedFrameData.o;
            this.image.setAttribute('opacity',renderedFrameData.o);
        }
    }
};