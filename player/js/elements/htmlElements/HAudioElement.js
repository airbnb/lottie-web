function HAudioElement(data,parentContainer,globalData,comp, placeholder){
    this.assetData = globalData.getAssetData(data.refId);
    this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
}
createElement(HBaseElement, HAudioElement);

HAudioElement.prototype.createElements = function(){

    var assetPath = this.globalData.getAssetsPath(this.assetData);
    //var img = new Image();

    if(this.data.hasMask){

    } else {

        var parent = document.createElement('div');
        styleDiv(parent);

        var cont = document.createElementNS('http://www.w3.org/1999/xhtml','audio');
        styleDiv(cont);

        //cont.setAttribute('muted','');
        cont.setAttribute('preload','');
        cont.setAttribute('playsinline','');
        parent.appendChild(cont);

        this.audioElem = document.createElementNS('http://www.w3.org/1999/xhtml','source');
        this.audioElem.setAttribute('src',assetPath);
        cont.appendChild(this.audioElem);
        this.layerElement = parent;
        this.transformedElement = parent;
        this.baseElement = parent;
        this.innerElem = parent;
        this.renderType = 'html';
    }

    this.checkParenting();
};

HAudioElement.prototype.hide = IVideoElement.prototype.hide;
HAudioElement.prototype.renderFrame = IVideoElement.prototype.renderFrame;
HAudioElement.prototype.destroy = IVideoElement.prototype.destroy;