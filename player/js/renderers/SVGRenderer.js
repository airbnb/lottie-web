function SVGRenderer(animationItem, config){
    this.animationItem = animationItem;
    this.layers = null;
    this.renderedFrame = -1;
    this.globalData = {
        frameNum: -1
    };
    this.renderConfig = {
        preserveAspectRatio: (config && config.preserveAspectRatio) || 'xMidYMid meet',
        progressiveLoad: (config && config.progressiveLoad) || false
    };
    this.elements = [];
    this.pendingElements = [];
    this.destroyed = false;

}

extendPrototype(BaseRenderer,SVGRenderer,seekBarController);

SVGRenderer.prototype.intializePlayer = function (data) {
    return new seekBarController(this);
}

SVGRenderer.prototype.createBase = function (data) {
    return new SVGBaseElement(data, this.layerElement,this.globalData,this);
};

SVGRenderer.prototype.createShape = function (data) {
    return new IShapeElement(data, this.layerElement,this.globalData,this);
};

SVGRenderer.prototype.createText = function (data) {
    return new SVGTextElement(data, this.layerElement,this.globalData,this);

};

SVGRenderer.prototype.createImage = function (data) {
    return new IImageElement(data, this.layerElement,this.globalData,this);
};

SVGRenderer.prototype.createComp = function (data) {
    return new ICompElement(data, this.layerElement,this.globalData,this);

};

SVGRenderer.prototype.createVideo = function (data) {
    return new IVideoElement(data, this.layerElement,this.globalData,this);
};


SVGRenderer.prototype.createAudio = function (data) {
    return new IAudioElement(data, this.layerElement,this.globalData,this);
};

SVGRenderer.prototype.createSolid = function (data) {
    return new ISolidElement(data, this.layerElement,this.globalData,this);
};

SVGRenderer.prototype.configAnimation = function(animData){
    this.layerElement = document.createElementNS(svgNS,'svg');
    this.layerElement.setAttribute('xmlns','http://www.w3.org/2000/svg');
    this.layerElement.setAttribute('width',animData.w);
    this.layerElement.setAttribute('height',animData.h);
    this.layerElement.setAttribute('viewBox','0 0 '+animData.w+' '+animData.h);
    this.layerElement.setAttribute('preserveAspectRatio',this.renderConfig.preserveAspectRatio);
    this.layerElement.style.width = '100%';
    this.layerElement.style.height = '100%';
    //this.layerElement.style.transform = 'translate3d(0,0,0)';
    //this.layerElement.style.transformOrigin = this.layerElement.style.mozTransformOrigin = this.layerElement.style.webkitTransformOrigin = this.layerElement.style['-webkit-transform'] = "0px 0px 0px";
    this.animationItem.wrapper.appendChild(this.layerElement);
    //Mask animation
    var defs = document.createElementNS(svgNS, 'defs');
    this.globalData.defs = defs;
    this.layerElement.appendChild(defs);
    this.globalData.getAssetData = this.animationItem.getAssetData.bind(this.animationItem);
    this.globalData.getAssetsPath = this.animationItem.getAssetsPath.bind(this.animationItem);
    this.globalData.progressiveLoad = this.renderConfig.progressiveLoad;
    this.globalData.frameId = 0;
    this.globalData.nm = animData.nm;
    this.globalData.compSize = {
        w: animData.w,
        h: animData.h
    };
    this.data = animData;
    this.globalData.frameRate = animData.fr;
    var maskElement = document.createElementNS(svgNS, 'clipPath');
    var rect = document.createElementNS(svgNS,'rect');
    rect.setAttribute('width',animData.w);
    rect.setAttribute('height',animData.h);
    rect.setAttribute('x',0);
    rect.setAttribute('y',0);

    var elementWidth = this.animationItem.wrapper.offsetWidth;
    var elementHeight = this.animationItem.wrapper.offsetHeight;
    var elementRel = elementWidth/elementHeight;
    var animationRel = this.globalData.compSize.w/this.globalData.compSize.h;

    var sx,sy,tx,ty;
    if(animationRel>elementRel){

        tx = 0;

    }else{

        tx = (elementWidth-this.globalData.compSize.w*(elementHeight/this.globalData.compSize.h))/2;

    }


    var maskId = 'animationMask_'+randomString(10);
    maskElement.setAttribute('id', maskId);
    maskElement.appendChild(rect);
    var maskedElement = document.createElementNS(svgNS,'g');
    maskedElement.setAttribute("clip-path", "url(#"+maskId+")");
    this.layerElement.appendChild(maskedElement);
    defs.appendChild(maskElement);
    this.layerElement = maskedElement;

    // g tag for play\pause on the video without the seekbar
    // click event in seekBarController file
    this.layerElement.setAttribute('id', 'animationDiv');

    this.layers = animData.layers;
    this.globalData.fontManager = new FontManager();
    this.globalData.fontManager.addChars(animData.chars);
    this.globalData.fontManager.addFonts(animData.fonts,defs);
    this.elements = Array.apply(null,{length:animData.layers.length});

    var playpausebtn_onceOnVideo = document.createElement('div');
    playpausebtn_onceOnVideo.id = 'playpausebtn_onceOnVideo';
    playpausebtn_onceOnVideo.style.width = '9%';
    playpausebtn_onceOnVideo.style.height = '20%';
    playpausebtn_onceOnVideo.style.opacity='0.5';
    playpausebtn_onceOnVideo.style.position='absolute';
    playpausebtn_onceOnVideo.style.left='45%';
    playpausebtn_onceOnVideo.style.top='40%';
    playpausebtn_onceOnVideo.style.zIndex='1';

    if(this.animationItem.autoplay) {
        playpausebtn_onceOnVideo.style.display = 'none';
    }
    this.animationItem.wrapper.appendChild(playpausebtn_onceOnVideo);


    if(this.animationItem.seekBar){
        var video_controls_bar = document.createElement('div');
        video_controls_bar.id='video_controls_bar';
        video_controls_bar.style.position = 'absolute';
        video_controls_bar.style.bottom = '0px';

        //  styleDiv_video_controls_bar(video_controls_bar);
        video_controls_bar.style.width = elementWidth - (tx*2) + 'px';
        video_controls_bar.style.left = tx + 'px';
        this.animationItem.wrapper.appendChild(video_controls_bar);

        var fullscreenBTN = document.createElement('div');
        fullscreenBTN.id = 'fullscreenBTN';
        fullscreenBTN.style.height='40px';
        fullscreenBTN.style.width='40px';
        fullscreenBTN.style.backgroundColor='#fff'
        fullscreenBTN.style.position='relative';
        fullscreenBTN.style.float='right';
        fullscreenBTN.style.opacity ='0.8';
        fullscreenBTN.style.zIndex = '2';

        // fullscreenBTN.innerHTML ='<img src=\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABYmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyI+CiAgICAgICAgIDxleGlmOlVzZXJDb21tZW50PlNjcmVlbnNob3Q8L2V4aWY6VXNlckNvbW1lbnQ+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgpuzN4uAAAB3ElEQVRYCe2UC07DMAyGCxcrnGzlZNtOBnGpI8f5kroPIaQ1UhXb+V/NHsNwrRe7ge/0vlue6PVs0RTsqMLvWuzcRWxtRTBNjaMBRbgXoHfWDGUP3mzTMZscjtovN7y7ntoPGqaZzJ90Jm/cegh/ZNbykfmowls+YiGetcJavYAPSBMWBq6OSGPSQ7/3AgrWf0dlRgYyjyzikkfWWgsoQBIgoyzaKIhD2gU9ElAIJESGhbhpCEuahvJbRgMKmgTJ2JsQhrQ8b+63BBQCCVMANaMz0lC87k8tfMAIOYJRfb9HuAXGBxTBAuAdlt5ibO3h9szWHqd9haGAAq6AqmB2wZyNM/JXed3A/7+B2x9GvLe8Wr9i+oP1GoI5G+c9BgoYNVWxHt6e2Vq5fq8wPmAF8Aqpj2CANo8i3AJjA44tVTMvyMu892dNZ6RhLMrSBixP6o6EKYBnEoa0PG/uowFJkIzRJA0JS5oVPxKQhMiwEncD4pB2QVsLSAJkVIh2GuKSB0qMaSrg3oPEHcOeh5zltXaDGZgKent7vqUOa1ngmBweDZfW3MI/bZPqm+upnWiYZjZXhkhAud49TxZxxR4t4eS15SPOJFfg2y6Y3pmT4fZowEiACIbTXdNXuIEfMJOJV9P6Ft0AAAAASUVORK5CYII=\'>';
        video_controls_bar.appendChild(fullscreenBTN);

        var mutedBTN = document.createElement('div');
        mutedBTN.id = 'mutedBTN';
        mutedBTN.style.height='40px';
        mutedBTN.style.width ='40px';
        mutedBTN.style.backgroundColor = '#fff';
        mutedBTN.style.position='relative';
        mutedBTN.style.float='right';
        mutedBTN.style.opacity='0.8';
        mutedBTN.style.zIndex ='2';
        video_controls_bar.appendChild(mutedBTN);

        var volumesliderDivWrapper = document.createElement('div');
        volumesliderDivWrapper.id = 'volumesliderDivWrapper';
        volumesliderDivWrapper.style.bottom = '50px';
        volumesliderDivWrapper.style.position = 'absolute';
        volumesliderDivWrapper.style.transform = 'rotate(270deg)';
        volumesliderDivWrapper.style.float = 'right';
        volumesliderDivWrapper.style.right = '80px';
        volumesliderDivWrapper.style.zIndex = '55';
        volumesliderDivWrapper.style.width = '1px';
        volumesliderDivWrapper.style.height = '1px';
        video_controls_bar.appendChild(volumesliderDivWrapper);

        var volumeslider = document.createElement('input');
        volumeslider.id = 'volumeslider';
        volumeslider.type = 'range';
        volumeslider.min = 0;
        volumeslider.max = 100;
        volumeslider.value = 0;
        volumeslider.step = 1;
        volumeslider.style.display = 'none';

        volumesliderDivWrapper.appendChild(volumeslider);

        var myProgress = document.createElement('div');
        myProgress.id='myProgress';
        myProgress.style.position='absolute';
        myProgress.style.width='100%';
        myProgress.style.bottom='0px';
        myProgress.style.backgroundColor='#ddd';
        myProgress.style.zIndex='1';
        // styleDiv_myProgress(myProgress);
        video_controls_bar.appendChild(myProgress);

        var playpausebtn = document.createElement('div');
        playpausebtn.id='playpausebtn';
        playpausebtn.style.position = 'relative';
        playpausebtn.style.height = '40px';
        playpausebtn.style.width = '40px';
        playpausebtn.style.backgroundRepeat = 'no-repeat';
        playpausebtn.style.zIndex = '1';
        // styleDiv_playpausebtn(playpausebtn);
        myProgress.appendChild(playpausebtn);

        var seeksliderdiv = document.createElement('div');
        seeksliderdiv.id='seekSliderDiv';
        seeksliderdiv.style.position='absolute';
        seeksliderdiv.style.zIndex='1';
        seeksliderdiv.style.top='0';
        seeksliderdiv.style.left ='40px';
        seeksliderdiv.style.height='40px';
        // seekSliderDiv.style.width='100%';
        seeksliderdiv.style.width = elementWidth - (tx*2) - 40 - 40 + 'px';

        myProgress.appendChild(seeksliderdiv);

        var seekSliderRange = document.createElement('input');
        seekSliderRange.id='seekSliderRange';
        seekSliderRange.type = 'range';
        seekSliderRange.min = 0;
        seekSliderRange.max = 100;
        seekSliderRange.value = 0;
        seekSliderRange.step = 1;
        seekSliderRange.style.position = 'relative';
        seekSliderRange.style.zIndex = '999';
        seekSliderRange.style.top = '0';
        seekSliderRange.style.backgroundColor = 'transparent';
        seekSliderRange.style.webkitAppearance = 'none';
        seekSliderRange.style.width = '98%';
        seekSliderRange.style.height = '100%';

        //styleDiv_seekSliderRange(seekSliderRange);
        seeksliderdiv.appendChild(seekSliderRange);

        var seekslider = document.createElement('div');
        seekslider.id='seekslider';
        seekslider.style.top = '0px';
        seekslider.style.position = 'absolute';
        seekslider.style.height = '100%';
        seekslider.style.backgroundColor = '#000';
        seekslider.style.opacity = '0.5';
        //styleDiv_seekslider(seekslider);
        seeksliderdiv.appendChild(seekslider);

    }
    this.intializePlayer();
};


SVGRenderer.prototype.destroy = function () {
    this.animationItem.wrapper.innerHTML = '';
    this.layerElement = null;
    this.globalData.defs = null;
    var i, len = this.layers ? this.layers.length : 0;
    for (i = 0; i < len; i++) {
        if(this.elements[i]){
            this.elements[i].destroy();
        }
    }
    this.elements.length = 0;
    this.destroyed = true;
    this.animationItem = null;
};

SVGRenderer.prototype.updateContainerSize = function () {
};

SVGRenderer.prototype.buildItem  = function(pos){
    var elements = this.elements;
    if(elements[pos] || this.layers[pos].ty == 99){
        return;
    }
    elements[pos] = true;
    var element = this.createItem(this.layers[pos]);

    elements[pos] = element;
    if(expressionsPlugin){
        if(this.layers[pos].ty === 0){
            this.globalData.projectInterface.registerComposition(element);
        }
        element.initExpressions();
    }
    this.appendElementInPos(element,pos);
    if(this.layers[pos].tt){
        if(!this.elements[pos - 1] || this.elements[pos - 1] === true){
            this.buildItem(pos - 1);
            this.addPendingElement(element);
        } else {
            element.setMatte(elements[pos - 1].layerId);
        }
    }
};

SVGRenderer.prototype.checkPendingElements  = function(){
    while(this.pendingElements.length){
        var element = this.pendingElements.pop();
        element.checkParenting();
        if(element.data.tt){
            var i = 0, len = this.elements.length;
            while(i<len){
                if(this.elements[i] === element){
                    element.setMatte(this.elements[i - 1].layerId);
                    break;
                }
                i += 1;
            }
        }
    }
};

SVGRenderer.prototype.renderFrame = function(num){
    if(this.renderedFrame == num || this.destroyed){
        return;
    }
    if(num === null){
        num = this.renderedFrame;
    }else{
        this.renderedFrame = num;
    }
    //clearPoints();
    /*console.log('-------');
    console.log('FRAME ',num);*/
    this.globalData.frameNum = num;
    this.globalData.frameId += 1;
    this.globalData.projectInterface.currentFrame = num;
    var i, len = this.layers.length;
    if(!this.completeLayers){
        this.checkLayers(num);
    }
    for (i = len - 1; i >= 0; i--) {
        if(this.completeLayers || this.elements[i]){
            this.elements[i].prepareFrame(num - this.layers[i].st);
        }
    }
    for (i = len - 1; i >= 0; i--) {
        if(this.completeLayers || this.elements[i]){
            this.elements[i].renderFrame();
        }
    }
};

SVGRenderer.prototype.appendElementInPos = function(element, pos){
    var newElement = element.getBaseElement();
    if(!newElement){
        return;
    }
    var i = 0;
    var nextElement;
    while(i<pos){
        if(this.elements[i] && this.elements[i]!== true && this.elements[i].getBaseElement()){
            nextElement = this.elements[i].getBaseElement();
        }
        i += 1;
    }
    if(nextElement){
        this.layerElement.insertBefore(newElement, nextElement);
    } else {
        this.layerElement.appendChild(newElement);
    }
};

SVGRenderer.prototype.hide = function(){
    this.layerElement.style.display = 'none';
};

SVGRenderer.prototype.show = function(){
    this.layerElement.style.display = 'block';
};

SVGRenderer.prototype.searchExtraCompositions = function(assets){
    var i, len = assets.length;
    var floatingContainer = document.createElementNS(svgNS,'g');
    for(i=0;i<len;i+=1){
        if(assets[i].xt){
            var comp = this.createComp(assets[i],floatingContainer,this.globalData.comp,null);
            comp.initExpressions();
            //comp.compInterface = CompExpressionInterface(comp);
            //Expressions.addLayersInterface(comp.elements, this.globalData.projectInterface);
            this.globalData.projectInterface.registerComposition(comp);
        }
    }
};
