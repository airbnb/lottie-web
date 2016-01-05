function HImageElement(data,parentContainer,globalData,comp, placeholder){
    this.assetData = globalData.getAssetData(data.refId);
    this.path = globalData.getPath();
    this.parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
}
createElement(HBaseElement, HImageElement);

HImageElement.prototype.createElements = function(){

    var imageLoaded = function(){
        this.imageElem.setAttributeNS('http://www.w3.org/1999/xlink','href',this.path+this.assetData.p);
    };

    var img = new Image();

    var parent;
    if(this.data.hasMask){
        var parent = document.createElement('div');
        styleDiv(parent);
        var cont = document.createElementNS(svgNS,'svg');
        cont.setAttribute('width',this.assetData.w);
        cont.setAttribute('height',this.assetData.h);
        parent.appendChild(cont);
        this.imageElem = document.createElementNS(svgNS,'image');
        this.imageElem.setAttribute('width',this.assetData.w+"px");
        this.imageElem.setAttribute('height',this.assetData.h+"px");
        cont.appendChild(this.imageElem);
        this.layerElement = parent;
        this.parentContainer.appendChild(parent);
        this.innerElem = parent;
        this.maskedElement = this.imageElem;
        img.addEventListener('load', imageLoaded.bind(this), false);
        img.addEventListener('error', imageLoaded.bind(this), false);
    } else {
        styleDiv(img);
        this.layerElement = img;
        this.parentContainer.appendChild(img);
        this.innerElem = img;
    }
    img.src = this.path+this.assetData.p;
    if(this.data.ln){
        this.innerElem.setAttribute('id',this.data.ln);
    }
};



HImageElement.prototype.hide = HSolidElement.prototype.hide;

HImageElement.prototype.renderFrame = HSolidElement.prototype.renderFrame;

HImageElement.prototype.destroy = HSolidElement.prototype.destroy;