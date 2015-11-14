function IImageElement(data,parentContainer,globalData,placeholder){
    this.assetData = globalData.getAssetData(data.refId);
    this.path = globalData.getPath();
    this.parent.constructor.call(this,data,parentContainer,globalData,placeholder);
}
createElement(SVGBaseElement, IImageElement);

IImageElement.prototype.createElements = function(){

    var self = this;

    var imageLoaded = function(){
        self.innerElem.setAttributeNS('http://www.w3.org/1999/xlink','href',self.path+self.assetData.p);
        self.maskedElement = self.innerElem;
    };

    var img = new Image();
    img.addEventListener('load', imageLoaded, false);
    img.addEventListener('error', imageLoaded, false);

    img.src = this.path+this.assetData.p;

    this.parent.createElements.call(this);

    this.innerElem = document.createElementNS(svgNS,'image');
    this.innerElem.setAttribute('width',this.assetData.w+"px");
    this.innerElem.setAttribute('height',this.assetData.h+"px");
    if(this.layerElement === this.parentContainer){
        this.appendNodeToParent(this.innerElem);
    }else{
        this.layerElement.appendChild(this.innerElem);
    }
    if(this.data.ln){
        this.innerElem.setAttribute('id',this.data.ln);
    }

};

IImageElement.prototype.hide = function(){
    if(!this.hidden){
        this.innerElem.setAttribute('visibility','hidden');
        this.hidden = true;
    }
};

IImageElement.prototype.renderFrame = function(parentMatrix){
    var renderParent = this.parent.renderFrame.call(this,parentMatrix);
    if(renderParent===false){
        this.hide();
        return;
    }
    if(this.hidden){
        this.hidden = false;
        this.innerElem.setAttribute('visibility', 'visible');
    }
    if(!this.data.hasMask){
        if(this.finalTransform.matMdf || this.firstFrame){
            this.innerElem.setAttribute('transform','matrix('+this.finalTransform.mat.props.join(',')+')');
        }
        if(this.finalTransform.opMdf || this.firstFrame){
            this.innerElem.setAttribute('opacity',this.finalTransform.opacity);
        }
    }
    if(this.firstFrame){
        this.firstFrame = false;
    }
};

IImageElement.prototype.destroy = function(){
    this.parent.destroy.call();
    this.innerElem =  null;
};