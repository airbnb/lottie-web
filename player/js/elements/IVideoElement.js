function IVideoElement(data,parentContainer,globalData,comp,placeholder){
    this.assetData = globalData.getAssetData(data.refId);
    this.vidStatus = globalData.getAssetData(data.refId);//globalData.trigger;
    this._parent.constructor.call(this,data,parentContainer,globalData,comp,placeholder);
}
createElement(SVGBaseElement, IVideoElement);

IVideoElement.prototype.createElements = function(){

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

//
// IVideoElement.prototype.createElements = function(){
//
//     var assetPath = this.globalData.getAssetsPath(this.assetData);
//
//     this._parent.createElements.call(this);
//
//
//     this.forigeninnerElem = document.createElementNS('http://www.w3.org/1999/xhtml','foreignObject');
//
//     this.innerDivElem = document.createElementNS('http://www.w3.org/1999/xhtml','div');
//     this.forigeninnerElem.appendChild(this.innerDivElem);
//
//     this.innerElem = document.createElementNS('http://www.w3.org/1999/xhtml','video');
//     this.innerElem.setAttribute('width',this.assetData.w+"px");
//     this.innerElem.setAttribute('height',this.assetData.h+"px");
//     this.innerElem.setAttribute('autoplay',"autoplay");
//     this.innerElem.setAttribute('src',assetPath);
//     this.innerDivElem.appendChild(this.innerElem);
//
//     //this.videoElem = document.createElementNS('http://www.w3.org/1999/xhtml','source');
//     //this.videoElem.setAttribute('type','video/webm');
//     //this.videoElem.setAttributeNS('src',assetPath);
//     //this.videoElem.setAttribute('src',assetPath);
//     //this.innerElem.appendChild(this.videoElem);
//     //this.innerElem.setAttribute('preserveAspectRatio','xMidYMid slice');
//   //  this.innerElem.setAttributeNS('http://www.w3.org/1999/xlink','href',assetPath);
//     this.maskedElement = this.forigeninnerElem;
//     this.layerElement.appendChild(this.forigeninnerElem);
//     if(this.data.ln){
//         this.layerElement.setAttribute('id',this.data.ln);
//     }
//     if(this.data.cl){
//         this.layerElement.setAttribute('class',this.data.cl);
//     }
//
// };


IVideoElement.prototype.hide = function(){
    if(!this.hidden){

        //we need to pause & reset video position in case we play this video again (like in loop)
        // console.log(this.baseElement.getElementsByTagName('audio'))


        if(this.baseElement.getElementsByTagName('video').length !=0) {
            // console.log(this.baseElement.getElementsByTagName('video'))
            this.baseElement.getElementsByTagName('video')[0].pause();
            this.baseElement.getElementsByTagName('video')[0].currentTime = 0;
        }

        else if(this.baseElement.getElementsByTagName('audio').length !=0){
            this.baseElement.getElementsByTagName('audio')[0].pause();
            this.baseElement.getElementsByTagName('audio')[0].currentTime = 0;
        }
        isPlaying = false;

        this.layerElement.style.display = 'none';
        this.hidden = true;
    }
};

//we call this function from the video element so we can really check if the video is playing
//we need this to fix bug of async with play pause
//read this for more http://stackoverflow.com/questions/36803176/how-to-prevent-the-play-request-was-interrupted-by-a-call-to-pause-error
// function onPlaying() {
//     isPlaying = true;
//     isOnPause = false;
// }
//
// function onPause() {
//     isPlaying = false;
//     isOnPause = true;
// }

IVideoElement.prototype.renderFrame = function(parentMatrix){
    var renderParent = this._parent.renderFrame.call(this,parentMatrix);
    if(renderParent===false){
        this.hide();
        return;
    }

    // console.log('lior-2');

    if(this.hidden){
        //play the video
        // console.log("lior1")
        // console.log(this.comp.comp.comp.animationItem.isPaused )
        //  if(this.comp.comp.comp.animationItem.isPaused === false) {
        //      if(this.baseElement.getElementsByTagName('video').length !=0) {
        //          console.log('lior2');
        //          console.log(this.baseElement.getElementsByTagName('video')[0])
        //          if (this.baseElement.getElementsByTagName('video')[0].paused) {
        //              console.log('ddddd');
        //              this.baseElement.getElementsByTagName('video')[0].play();
        //          }
        //      }
        //
        //      else if(this.baseElement.getElementsByTagName('audio').length !=0){
        //          if (this.baseElement.getElementsByTagName('audio')[0].paused) {
        //              this.baseElement.getElementsByTagName('audio')[0].play();
        //          }
        //      }
        // }
        this.hidden = false;
        this.layerElement.style.display = 'block';
    }
    if(this.firstFrame){
        this.firstFrame = false;
    }
};

IVideoElement.prototype.destroy = function(){
    this._parent.destroy.call();
    this.innerElem =  null;
};