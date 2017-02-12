function CVImageElement(data, comp,globalData){
    this.assetData = globalData.getAssetData(data.refId);
    this._parent.constructor.call(this,data, comp,globalData);
    this.globalData.addPendingElement();
}
createElement(CVBaseElement, CVImageElement);

CVImageElement.prototype.createElements = function(){
    var imageLoaded = function(){
        this.globalData.elementLoaded();
        if(this.assetData.w !== this.img.width || this.assetData.h !== this.img.height){
            var canvas = document.createElement('canvas');
            canvas.width = this.assetData.w;
            canvas.height = this.assetData.h;
            var ctx = canvas.getContext('2d');

            var imgW = this.img.width;
            var imgH = this.img.height;
            var imgRel = imgW / imgH;
            var canvasRel = this.assetData.w/this.assetData.h;
            var widthCrop, heightCrop;
            if(imgRel>canvasRel){
                heightCrop = imgH;
                widthCrop = heightCrop*canvasRel;
            } else {
                widthCrop = imgW;
                heightCrop = widthCrop/canvasRel;
            }
            ctx.drawImage(this.img,(imgW-widthCrop)/2,(imgH-heightCrop)/2,widthCrop,heightCrop,0,0,this.assetData.w,this.assetData.h);
            this.img = canvas;
        }
    }.bind(this);
    var imageFailed = function(){
        this.failed = true;
        this.globalData.elementLoaded();
    }.bind(this);

    this.img = new Image();
    this.img.addEventListener('load', imageLoaded, false);
    this.img.addEventListener('error', imageFailed, false);
    var assetPath = this.globalData.getAssetsPath(this.assetData);
    this.img.src = assetPath;

    this._parent.createElements.call(this);

};

CVImageElement.prototype.renderFrame = function(parentMatrix){
    if(this.failed){
        return;
    }
    if(this._parent.renderFrame.call(this,parentMatrix)===false){
        return;
    }
    var ctx = this.canvasContext;
    this.globalData.renderer.save();
    var finalMat = this.finalTransform.mat.props;
    this.globalData.renderer.ctxTransform(finalMat);
    this.globalData.renderer.ctxOpacity(this.finalTransform.opacity);
    ctx.drawImage(this.img,0,0);
    this.globalData.renderer.restore(this.data.hasMask);
    if(this.firstFrame){
        this.firstFrame = false;
    }
};

CVImageElement.prototype.destroy = function(){
    this.img = null;
    this._parent.destroy.call(this._parent);
};