function IImageElement(data,parentType, animationItem){
    this.animationItem = animationItem;
    this.assets = this.animationItem.getAssets();
    this.path = this.animationItem.getPath();
    this.parent.constructor.call(this,data,parentType, animationItem);
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
    img.src = this.path+this.assets[this.data.assetId].path;

    this.svgElem = document.createElementNS(svgNS, "g");

    this.parent.createElements.call(this);

    this.image = document.createElementNS(svgNS,'image');
    this.image.setAttribute('width',this.data.width+"px");
    this.image.setAttribute('height',this.data.height+"px");
    this.svgElem.appendChild(this.image);
    this.anchorElement.appendChild(this.svgElem);
    this.maskingGroup = this.svgElem;
    styleUnselectableDiv(this.image);

};