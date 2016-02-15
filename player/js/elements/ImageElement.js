function IImageElement(data,parentContainer,globalData,comp,placeholder){
    this.assetData = globalData.getAssetData(data.refId);
    this.path = globalData.getPath();
    this.parent.constructor.call(this,data,parentContainer,globalData,comp,placeholder);
}
createElement(SVGBaseElement, IImageElement);

IImageElement.prototype.createElements = function(){

    var self = this;

    var imageLoaded = function(){
        var cv = document.createElement('canvas');
        cv.width = self.assetData.w;
        cv.height = self.assetData.h;
        var ctx = cv.getContext('2d');
        ctx.drawImage(img,self.assetData.x,self.assetData.y,self.assetData.w,self.assetData.h,0,0,self.assetData.w,self.assetData.h);
        var dataUri = cv.toDataURL();
        self.innerElem.setAttributeNS('http://www.w3.org/1999/xlink','href',dataUri);
        //self.innerElem.setAttributeNS('http://www.w3.org/1999/xlink','href',self.path+self.assetData.p);
        self.maskedElement = self.innerElem;
        ImageManager.unregisterImage(imgLoader);
    };

    var imgLoader = ImageManager.getImage(this.path+this.assetData.p);
    var img = imgLoader.elem;
    if(imgLoader.loaded) {
        imageLoaded();
    } else {
        img.addEventListener('load', imageLoaded, false);
        img.addEventListener('error', imageLoaded, false);
    }

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
            this.innerElem.setAttribute('transform',this.finalTransform.mat.to2dCSS());
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