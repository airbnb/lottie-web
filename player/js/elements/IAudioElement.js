function IAudioElement(data,parentContainer,globalData,comp,placeholder){
    this.assetData = globalData.getAssetData(data.refId);
    this._parent.constructor.call(this,data,parentContainer,globalData,comp,placeholder);
}
createElement(SVGBaseElement, IAudioElement);

IAudioElement.prototype.createElements = function(){

    var assetPath = this.globalData.getAssetsPath(this.assetData);
    //var img = new Image();

    if(this.data.hasMask){

    } else {

        var parent = document.createElement('div');
        styleDiv(parent);

        var cont = document.createElementNS('http://www.w3.org/1999/xhtml','audio');
        styleDiv(cont);

        //cont.setAttribute('muted','');
        // cont.setAttribute('autoplay','');
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


IAudioElement.prototype.hide = function(){
    // console.log('ddd');
    if(!this.hidden){
        //we need to pause & reset video position in case we play this video again (like in loop)
        if(this.baseElement.getElementsByTagName('video').length !=0) {
            this.baseElement.getElementsByTagName('video')[0].pause();
            this.baseElement.getElementsByTagName('video')[0].currentTime = 0;
        }

        else if(this.baseElement.getElementsByTagName('audio').length !=0){
            this.baseElement.getElementsByTagName('audio')[0].pause();
            this.baseElement.getElementsByTagName('audio')[0].currentTime = 0;

        }
        // isPlaying = false;

        this.layerElement.style.display = 'none';
        this.hidden = true;
    }
};

IAudioElement.prototype.renderFrame = function(parentMatrix){
    var renderParent = this._parent.renderFrame.call(this,parentMatrix);
    if(renderParent===false){
        this.hide();
        return;
    }

    if(this.hidden){
        //play the video
        if(this.comp.comp.animationItem.isPaused === false) {
            if(this.baseElement.getElementsByTagName('video').length !=0) {
                if (this.baseElement.getElementsByTagName('video')[0].paused) {
                    this.baseElement.getElementsByTagName('video')[0].play();
                }
            }

            else if(this.baseElement.getElementsByTagName('audio').length !=0){
                if (this.baseElement.getElementsByTagName('audio')[0].paused) {
                    this.baseElement.getElementsByTagName('audio')[0].play();
                }
            }
        }
        this.hidden = false;
        this.layerElement.style.display = 'block';
    }
    if(this.firstFrame){
        // console.log('dddd');

        this.firstFrame = false;
    }
};

IAudioElement.prototype.destroy = function(){
    this._parent.destroy.call();
    this.innerElem =  null;
};
