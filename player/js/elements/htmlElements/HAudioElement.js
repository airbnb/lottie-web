function HAudioElement(data,parentContainer,globalData,comp, placeholder){
    this.assetData = globalData.getAssetData(data.refId);
    this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
}
createElement(HBaseElement, HAudioElement);

HAudioElement.prototype.createElements = function(){

    var assetPath = this.globalData.getAssetsPath(this.assetData);

    var parent = document.createElement('div');
    styleDiv(parent);

    var cont = document.createElementNS('http://www.w3.org/1999/xhtml','audio');
    styleDiv(cont);

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

    this.checkParenting();
};



HAudioElement.prototype.hide = function(){
    if(!this.hidden){
        //we need to pause & reset audio position in case we play this video again (like in loop)
        if(this.baseElement.getElementsByTagName('audio').length !=0){
            this.baseElement.getElementsByTagName('audio')[0].pause();
            this.baseElement.getElementsByTagName('audio')[0].currentTime = 0;

        }
        // isPlaying = false;

        this.layerElement.style.display = 'none';
        this.hidden = true;
    }
};

HAudioElement.prototype.renderFrame = function(parentMatrix){
    var renderParent = this._parent.renderFrame.call(this,parentMatrix);
    if(renderParent===false){
        this.hide();
        return;
    }

    if(this.hidden){
        //play the video
        if(this.comp.comp.animationItem.isPaused === false) {
            if(this.baseElement.getElementsByTagName('audio').length !=0){
                if (this.baseElement.getElementsByTagName('audio')[0].paused) {
                    this.baseElement.getElementsByTagName('audio')[0].play();
                }
            }
        }
        this.hidden = false;
        this.layerElement.style.display = 'block';
    }
    if(this.firstFrame){

        this.firstFrame = false;
    }
};

HAudioElement.prototype.destroy = function(){
    this._parent.destroy.call();
    this.innerElem =  null;
};
