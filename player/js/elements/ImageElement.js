function IImageElement(data,parentContainer,globalData,comp){
    this.assetData = globalData.getAssetData(data.refId);
    this.initElement(data,parentContainer,globalData,comp);
}

extendPrototype2([BaseElement,TransformElement,SVGBaseElement,HierarchyElement,FrameElement,RenderableElement], IImageElement);

IImageElement.prototype.initElement = IShapeElement.prototype.initElement;

IImageElement.prototype.createContent = function(){

    var assetPath = this.globalData.getAssetsPath(this.assetData);

    this.innerElem = document.createElementNS(svgNS,'image');
    this.innerElem.setAttribute('width',this.assetData.w+"px");
    this.innerElem.setAttribute('height',this.assetData.h+"px");
    this.innerElem.setAttribute('preserveAspectRatio','xMidYMid slice');
    this.innerElem.setAttributeNS('http://www.w3.org/1999/xlink','href',assetPath);
    
    //TODO check if this is needed. Doesn't look like it is
    //this.maskedElement = this.innerElem;
    this.layerElement.appendChild(this.innerElem);


};

IImageElement.prototype.hide = IImageElement.prototype.hideElement;
IImageElement.prototype.show = IImageElement.prototype.showElement;


IImageElement.prototype.prepareFrame = function(num) {
    this.prepareRenderableFrame(num);
    this.prepareProperties(num, this.isVisible);
};

IImageElement.prototype.renderFrame = function() {
    this.renderTransform();
    this.renderRenderable();
    this.renderElement();
    if(this.isVisible) {
        this.firstFrame = false;
    }
};

IImageElement.prototype.destroy = function(){
    this._parent.destroy.call(this._parent);
    this.innerElem =  null;
};
