function DImageElement(data, animationItem){
    this.animationItem = animationItem;
    this.assets = this.animationItem.getAssets();
    this.path = this.animationItem.getPath();
    this.parent.constructor.call(this,data, animationItem);
}
createElement(DBaseElement, DImageElement);

DImageElement.prototype.createElements = function(){
    console.log('innnit',this);

    var self = this;

    var imageLoaded = function(){
        self.animationItem.elementLoaded();
    };

    var img = new Image();
    img.addEventListener('load', imageLoaded, false);
    img.src = this.path+this.assets[this.data.assetId].path;
    this.mainElement = img;
    styleDiv(this.mainElement);

};