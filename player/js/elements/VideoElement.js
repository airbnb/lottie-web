function IVideoElement(data,parentContainer,globalData,comp,placeholder){
    this.assetData = globalData.getAssetData(data.refId);
    this._parent.constructor.call(this,data,parentContainer,globalData,comp,placeholder);
}
createElement(SVGBaseElement, IVideoElement);

IVideoElement.prototype.createElements = function(){

    var assetPath = this.globalData.getAssetsPath(this.assetData);

    this._parent.createElements.call(this);

    this.innerElem = document.createElementNS(svgNS,'foreignObject');
    this.innerElem.setAttribute('width',this.assetData.w+"px");
    this.innerElem.setAttribute('height',this.assetData.h+"px");


    var cont = document.createElementNS('http://www.w3.org/1999/xhtml','video');
    styleDiv(cont);

    cont.setAttribute('muted',''); //iphone suuport - we need to mute audio to allow play/stop video from js
    cont.setAttribute('preload','');
    cont.setAttribute('playsinline',''); //for iphone support
    cont.setAttribute('width',this.assetData.w);
    cont.setAttribute('height',this.assetData.h);
    cont.setAttribute('objectfit','fill');


    // console.log(this.parentContainer.farthestViewportElement);
    // if (this.parentContainer.getElementsByTagName('g').item(0) != undefined)
    //     cont.setAttribute('style','clip-path:'+this.parentContainer.getElementsByTagName('g').item(0).attributes.item(0).textContent);

    this.innerElem.appendChild(cont);

    this.videoElem = document.createElementNS('http://www.w3.org/1999/xhtml','source');
    this.videoElem.setAttribute('src',assetPath);
    cont.appendChild(this.videoElem);

    // this.innerElem.setAttribute('preserveAspectRatio','xMidYMid slice');
    // this.innerElem.setAttributeNS('http://www.w3.org/1999/xlink','href',assetPath);
    this.maskedElement = this.innerElem.parent;
    this.layerElement.appendChild(this.innerElem);
    //
    // this.maskedElement = cont.parent;
    // this.layerElement.appendChild(cont);

    // if(this.data.ln){
    //     this.layerElement.setAttribute('id',this.data.ln);
    // }
    // if(this.data.cl){
    //     this.layerElement.setAttribute('class',this.data.cl);
    // }



    //
    // var cont = document.createElementNS('http://www.w3.org/1999/xhtml','video');
    // styleDiv(cont);
    //
    // cont.setAttribute('muted',''); //iphone suuport - we need to mute audio to allow play/stop video from js
    // cont.setAttribute('preload','');
    // cont.setAttribute('playsinline',''); //for iphone support
    // cont.setAttribute('width',this.assetData.w);
    // cont.setAttribute('height',this.assetData.h);
    // parent.appendChild(cont);
    //
    // this.videoElem = document.createElementNS('http://www.w3.org/1999/xhtml','source');
    // this.videoElem.setAttribute('src',assetPath);
    // cont.appendChild(this.videoElem);
    // this.layerElement = parent;
    // this.transformedElement = parent;
    // this.baseElement = parent;
    // this.innerElem = parent;
    // this.maskedElement = this.videoElem;
    //


};

IVideoElement.prototype.hide = function(){
    if(!this.hidden){

        if(this.baseElement.getElementsByTagName('video').length !=0) {
            this.baseElement.getElementsByTagName('video')[0].pause();
            this.baseElement.getElementsByTagName('video')[0].currentTime = 0;
        }

        isPlaying = false;

        this.layerElement.style.display = 'none';
        this.hidden = true;
    }
};

IVideoElement.prototype.renderFrame = function(parentMatrix){
    var renderParent = this._parent.renderFrame.call(this,parentMatrix);
    if(renderParent===false){
        this.hide();
        return;
    }
    if(this.hidden){

        if (this.baseElement.parentElement.parentElement.getElementsByTagName('g').item(0) != undefined){
            if(this.baseElement.getElementsByTagName('video').length !=0) {
                // console.log(this.baseElement.parentElement.parentElement.getAttribute("style"));
                this.baseElement.getElementsByTagName('video').item(0).setAttribute('style',this.baseElement.parentElement.parentElement.getAttribute("style"));

            }
        }


        // cont.setAttribute('style','clip-path:'+this.parentContainer.getElementsByTagName('g').item(0).attributes.item(0).textContent);

        if(this.baseElement.getElementsByTagName('video').length !=0 && this.baseElement.getElementsByTagName('video')[0].currentTime == 0) {
            this.baseElement.getElementsByTagName('video')[0].play();
        }

        this.hidden = false;
        this.layerElement.style.display = 'block';
    }
    if(this.firstFrame){
        this.firstFrame = false;
    }
};

IVideoElement.prototype.destroy = function(){
    this._parent.destroy.call(this._parent);
    this.innerElem =  null;
};