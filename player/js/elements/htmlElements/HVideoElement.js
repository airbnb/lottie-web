function HVideoElement(data,parentContainer,globalData,comp, placeholder){
    this.assetData = globalData.getAssetData(data.refId);
    this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
}
createElement(HBaseElement, HVideoElement);

HVideoElement.prototype.createElements = function(){

    var assetPath = this.globalData.getAssetsPath(this.assetData);

    if(this.data.hasMask){
    //need to add mask support
    } else {

        var parent = document.createElement('div');
        styleDiv(parent);

        var cont = document.createElementNS('http://www.w3.org/1999/xhtml','video');
        styleDiv(cont);

        cont.setAttribute('muted',''); //iphone suuport - we need to mute audio to allow play/stop video from js
        cont.setAttribute('preload','');
        cont.setAttribute('playsinline',''); //for iphone support
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

HVideoElement.prototype.hide = function(){
    if(!this.hidden){

        //we need to pause & reset video position in case we play this video again (like in loop)

        if(this.baseElement.getElementsByTagName('video').length !=0) {
            this.baseElement.getElementsByTagName('video')[0].pause();
            this.baseElement.getElementsByTagName('video')[0].currentTime = 0;
        }

        isPlaying = false;

        this.layerElement.style.display = 'none';
        this.hidden = true;
    }
};


HVideoElement.prototype.renderFrame = function(parentMatrix){
    var renderParent = this._parent.renderFrame.call(this,parentMatrix);
    if(renderParent===false){
        this.hide();
        return;
    }

    if(this.hidden){


        if(this.baseElement.getElementsByTagName('video').length !=0) {
            this.baseElement.getElementsByTagName('video')[0].play();
        }

        this.hidden = false;
        this.layerElement.style.display = 'block';
    }
    if(this.firstFrame){
        this.firstFrame = false;
    }
};

HVideoElement.prototype.destroy = function(){
    this._parent.destroy.call();
    this.innerElem =  null;
};