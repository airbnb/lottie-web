function HVideoElement(data,parentContainer,globalData,comp, placeholder){
    this.assetData = globalData.getAssetData(data.refId);
    this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
}
createElement(HBaseElement, HVideoElement);

HVideoElement.prototype.createElements = function(){
    // this.isMasked = this.checkMasks();
    var assetPath = this.globalData.getAssetsPath(this.assetData);

  // console.log(this.data);
    if(this.data.hasMask){
    //need to add mask support
        var parent = document.createElement('div');

        // styleDiv(parent);
        // var cont = document.createElementNS(svgNS,'svg');
        // styleDiv(cont);
        // cont.setAttribute('width',this.assetData.w);
        // cont.setAttribute('height',this.assetData.h);
        // parent.appendChild(cont);
        // this.imageElem = document.createElementNS(svgNS,'image');
        // this.imageElem.setAttribute('width',this.assetData.w+"px");
        // this.imageElem.setAttribute('height',this.assetData.h+"px");
        // this.imageElem.setAttributeNS('http://www.w3.org/1999/xlink','href',assetPath);
        // cont.appendChild(this.imageElem);
        // this.layerElement = parent;
        // this.transformedElement = parent;
        // this.baseElement = parent;
        // this.innerElem = parent;
        // this.maskedElement = this.imageElem;
        //

        // console.log('ffffff');
        styleDiv(parent);

        var cont = document.createElementNS('http://www.w3.org/1999/xhtml','video');
        styleDiv(cont);

        cont.setAttribute('muted',''); //iphone suuport - we need to mute audio to allow play/stop video from js
        cont.setAttribute('preload','');
        cont.setAttribute('playsinline',''); //for iphone support
        cont.setAttribute('width',this.assetData.w);
        cont.setAttribute('height',this.assetData.h);
        cont.setAttribute('objectfit','fill');

        parent.appendChild(cont);

        this.videoElem = document.createElementNS('http://www.w3.org/1999/xhtml','source');
        this.videoElem.setAttribute('src',assetPath);
        cont.appendChild(this.videoElem);
        this.layerElement = parent;
        this.transformedElement = parent;
        this.baseElement = parent;
        this.innerElem = parent;
        this.maskedElement = cont;

        this.renderType = 'html';
    } else {

        // var parent = document.createElement('foreignObject');
        // // x="10" y="10"
        // parent.setAttribute('x','10');
        // parent.setAttribute('y','10');
        //
        // parent.setAttribute('width','1000');
        // parent.setAttribute('height','1000');
        //
        //
        // var cont_vid = document.createElementNS('http://www.w3.org/1999/xhtml','body');
        // cont_vid.setAttribute('xmlns','http://www.w3.org/1999/xhtml');

        if(this.parentContainer.parentNode != undefined) {
            if (this.parentContainer.parentNode.nodeName == 'svg') {
                var parent = document.createElementNS(svgNS,'foreignObject');
                parent.setAttribute('width',this.assetData.w+"px");
                parent.setAttribute('height',this.assetData.h+"px");
            }
        }
        else
        {
        var parent = document.createElement('div');


        }

        styleDiv(parent);

        var cont = document.createElementNS('http://www.w3.org/1999/xhtml','video');
        styleDiv(cont);

        cont.setAttribute('muted',''); //iphone suuport - we need to mute audio to allow play/stop video from js
        cont.setAttribute('preload','');
        cont.setAttribute('playsinline',''); //for iphone support
        cont.setAttribute('width',this.assetData.w);
        cont.setAttribute('height',this.assetData.h);
        cont.setAttribute('objectfit','fill');

        // console.log(this.parentContainer.attributes);
        if (this.parentContainer.getElementsByTagName('g').item(0) != undefined){
            if (this.parentContainer.getElementsByTagName('g').item(0).attributes.item(0) != undefined) {
                cont.setAttribute('style', 'clip-path:' + this.parentContainer.getElementsByTagName('g').item(0).attributes.item(0).textContent);
            }
        }

        if (this.parentContainer.attributes.getNamedItem('clip-path') != undefined)
            cont.setAttribute('style','-webkit-mask:'+this.parentContainer.attributes.getNamedItem('clip-path').textContent);

        if (this.parentContainer.attributes.getNamedItem('data-clip-path') != undefined)
            cont.setAttribute('style','-webkit-mask:'+this.parentContainer.attributes.getNamedItem('data-clip-path').textContent);

        // if (this.parentContainer.attributes.item(0) != undefined)
        //     cont.setAttribute('style','clip-path:'+this.parentContainer.attributes.item(0).textContent);





        parent.appendChild(cont);


        this.videoElem = document.createElementNS('http://www.w3.org/1999/xhtml','source');
        this.videoElem.setAttribute('src',assetPath);
        cont.appendChild(this.videoElem);
        this.layerElement = parent;
        this.transformedElement = parent;
        this.baseElement = parent;
        this.innerElem = parent;
        this.renderType = 'html';

        // console.log(this.baseElement);

        // console.log(this.parentContainer.parentElement.getElementsByTagName('g').item(0).attributes.item(0).textContent)
        // console.log(this.parentContainer.getElementsByTagName('g').item(0).attributes.item(0).textContent)



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

HVideoElement.prototype.destroy = function(){
    this._parent.destroy.call();
    this.innerElem =  null;
};