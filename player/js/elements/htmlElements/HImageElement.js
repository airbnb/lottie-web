function HImageElement(data,parentContainer,globalData,comp, placeholder){
    this.assetData = globalData.getAssetData(data.refId);
    this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
}
createElement(HBaseElement, HImageElement);

HImageElement.prototype.createElements = function(){

    var assetPath = this.globalData.getAssetsPath(this.assetData);
    var img = new Image();

    if(this.data.hasMask){
        var parent = document.createElement('div');
        styleDiv(parent);
        var cont = document.createElementNS(svgNS,'svg');
        styleDiv(cont);
        cont.setAttribute('width',this.assetData.w);
        cont.setAttribute('height',this.assetData.h);
        parent.appendChild(cont);
        this.imageElem = document.createElementNS(svgNS,'image');
        this.imageElem.setAttribute('width',this.assetData.w+"px");
        this.imageElem.setAttribute('height',this.assetData.h+"px");
        this.imageElem.setAttributeNS('http://www.w3.org/1999/xlink','href',assetPath);
        cont.appendChild(this.imageElem);
        this.layerElement = parent;
        this.transformedElement = parent;
        this.baseElement = parent;
        this.innerElem = parent;
        this.maskedElement = this.imageElem;
    } else {
        styleDiv(img);
        this.layerElement = img;
        this.baseElement = img;
        this.innerElem = img;
        this.transformedElement = img;
    }
    img.src = assetPath;
    if(this.data.ln){
        this.innerElem.setAttribute('id',this.data.ln);
    }
    this.checkParenting();
};

HImageElement.prototype.show = HSolidElement.prototype.show;
HImageElement.prototype.hide = HSolidElement.prototype.hide;
HImageElement.prototype.renderFrame = HSolidElement.prototype.renderFrame;
HImageElement.prototype.destroy = HSolidElement.prototype.destroy;