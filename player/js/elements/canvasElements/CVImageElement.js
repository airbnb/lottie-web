function CVImageElement(data,globalData){
    this.animationItem = renderer.animationItem;
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

CVImageElement.prototype.draw = function(){
    if(this.failed){
        return;
    }
    this.canvasContext.save();
    if(this.parent.draw.call(this,false)===false){
        this.canvasContext.restore();
        return;
    }
    var ctx = this.canvasContext;
    ctx.drawImage(this.img,0,0);
    this.canvasContext.restore();
};