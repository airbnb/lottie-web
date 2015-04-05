function CVImageElement(data, renderer){
    this.renderer = renderer;
    this.animationItem = renderer.animationItem;
    this.assets = this.animationItem.getAssets();
    this.path = this.animationItem.getPath();
    this.parent.constructor.call(this,data, renderer);
    this.animationItem.pendingElements += 1;
}
createElement(CVBaseElement, CVImageElement);

CVImageElement.prototype.createElements = function(){
    var self = this;

    var imageLoaded = function(){
        self.animationItem.elementLoaded();
    };

    this.img = new Image();
    this.img.addEventListener('load', imageLoaded, false);
    this.img.src = this.path+this.assets[this.data.assetId].path;

    this.parent.createElements.call(this);

};

CVImageElement.prototype.draw = function(){
    this.renderer.canvasContext.save();
    var renderParent = this.parent.draw.call(this,false);
    if(renderParent===false){
        return;
    }
    var ctx = this.renderer.canvasContext;
    ctx.drawImage(this.img,0,0);
    this.renderer.canvasContext.restore();
};