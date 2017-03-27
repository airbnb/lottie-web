function HVideoElement(data,parentContainer,globalData,comp, placeholder){
    this.assetData = globalData.getAssetData(data.refId);
    this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
}
createElement(HBaseElement, HVideoElement);

HVideoElement.prototype.createElements = function(){

    var assetPath = this.globalData.getAssetsPath(this.assetData);

    if(this.data.hasMask){

    } else {

        var parent = document.createElement('div');
        styleDiv(parent);

        var cont = document.createElementNS('http://www.w3.org/1999/xhtml','video');
        styleDiv(cont);

        cont.setAttribute('muted','');
        cont.setAttribute('preload','');
        cont.setAttribute('playsinline','');
        cont.setAttribute('width',this.assetData.w);
        cont.setAttribute('height',this.assetData.h);
        parent.appendChild(cont);

        this.videoElem = document.createElementNS('http://www.w3.org/1999/xhtml','source');
        this.videoElem.setAttribute('src',assetPath);
        cont.appendChild(this.videoElem);
        this.layerElement = parent;
        this.transformedElement = parent;
        this.baseElement = parent;
        this.innerElem = parent;
        this.renderType = 'html';
    }

    this.checkParenting();
};

HVideoElement.prototype.hide = IVideoElement.prototype.hide;
HVideoElement.prototype.renderFrame = IVideoElement.prototype.renderFrame;
HVideoElement.prototype.destroy = IVideoElement.prototype.destroy;