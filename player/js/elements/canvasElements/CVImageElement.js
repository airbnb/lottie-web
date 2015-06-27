function CVImageElement(data,globalData){
    this.animationItem = globalData.renderer.animationItem;
    this.assets = this.animationItem.getAssets();
    this.path = this.animationItem.getPath();
    this.parent.constructor.call(this,data,globalData);
    this.animationItem.pendingElements += 1;
}
createElement(CVBaseElement, CVImageElement);

CVImageElement.prototype.createElements = function(){
    var self = this;

    var imageLoaded = function(){
        self.animationItem.elementLoaded();
    };
    var imageFailed = function(){
        //console.log('imageFailed');
        self.failed = true;
        self.animationItem.elementLoaded();
    };

    this.img = new Image();
    this.img.addEventListener('load', imageLoaded, false);
    this.img.addEventListener('error', imageFailed, false);
    this.img.src = this.path+this.assets[this.data.assetId].path;

    this.parent.createElements.call(this);

};

CVImageElement.prototype.draw = function(parentMatrix){
    if(this.failed){
        return;
    }
    if(this.parent.draw.call(this,parentMatrix)===false){
        return;
    }
    var ctx = this.canvasContext;
    if(!this.data.hasMask){
        ctx.save();
        var finalMat = this.finalTransform.mat.props;
        ctx.transform(finalMat[0], finalMat[1], finalMat[2], finalMat[3], finalMat[4], finalMat[5]);
    }
    ctx.globalAlpha = ctx.globalAlpha*this.finalTransform.opacity;
    ctx.drawImage(this.img,0,0);
    ctx.restore();
};