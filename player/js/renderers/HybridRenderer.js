function HybridRenderer(animationItem){
    this.animationItem = animationItem;
    this.layers = null;
    this.renderedFrame = -1;
    this.globalData = {
        frameNum: -1
    };
    this.pendingElements = [];
    this.elements = [];
    this.threeDElements = [];
    this.destroyed = false;
    this.camera = null;
    this.supports3d = true;

}

extendPrototype(BaseRenderer,HybridRenderer);

HybridRenderer.prototype.buildItem = SVGRenderer.prototype.buildItem;

HybridRenderer.prototype.checkPendingElements  = function(){
    while(this.pendingElements.length){
        var element = this.pendingElements.pop();
        element.checkParenting();
    }
};

HybridRenderer.prototype.appendElementInPos = function(element, pos){
    var newElement = element.getBaseElement();
    if(!newElement){
        return;
    }
    var layer = this.layers[pos];
    if(!layer.ddd || !this.supports3d){
        var i = 0;
        var nextElement;
        while(i<pos){
            if(this.elements[i] && this.elements[i]!== true && this.elements[i].getBaseElement){
                nextElement = this.elements[i].getBaseElement();
            }
            i += 1;
        }
        if(nextElement){
            if(!layer.ddd || !this.supports3d){
                this.layerElement.insertBefore(newElement, nextElement);
            }
        } else {
            if(!layer.ddd || !this.supports3d){
                this.layerElement.appendChild(newElement);
            }
        }
    } else {
        this.addTo3dContainer(newElement,pos);
    }
};

HybridRenderer.prototype.intializePlayer = function (data) {
    return new seekBarController(this);
}

HybridRenderer.prototype.createBase = function (data) {
    return new SVGBaseElement(data, this.layerElement,this.globalData,this);
};

HybridRenderer.prototype.createShape = function (data) {
    if(!this.supports3d){
        return new IShapeElement(data, this.layerElement,this.globalData,this);
    }
    return new HShapeElement(data, this.layerElement,this.globalData,this);
};

HybridRenderer.prototype.createText = function (data) {
    if(!this.supports3d){
        return new SVGTextElement(data, this.layerElement,this.globalData,this);
    }
    return new HTextElement(data, this.layerElement,this.globalData,this);
};


HybridRenderer.prototype.createVideo = function (data) {
    //TODO: not sure what is supports3d - need to check it out
    //  if(!this.supports3d){
    //    return new IImageElement(data, this.layerElement,this.globalData,this);
    //}
    return new HVideoElement(data, this.layerElement,this.globalData,this);
};

HybridRenderer.prototype.createAudio = function (data) {
    return new HAudioElement(data, this.layerElement,this.globalData,this);
};


HybridRenderer.prototype.createCamera = function (data) {
    this.camera = new HCameraElement(data, this.layerElement,this.globalData,this);
    return this.camera;
};

HybridRenderer.prototype.createImage = function (data) {
    if(!this.supports3d){
        return new IImageElement(data, this.layerElement,this.globalData,this);
    }
    return new HImageElement(data, this.layerElement,this.globalData,this);
};

HybridRenderer.prototype.createComp = function (data) {
    if(!this.supports3d){
        return new ICompElement(data, this.layerElement,this.globalData,this);
    }
    return new HCompElement(data, this.layerElement,this.globalData,this);

};

HybridRenderer.prototype.createSolid = function (data) {
    if(!this.supports3d){
        return new ISolidElement(data, this.layerElement,this.globalData,this);
    }
    return new HSolidElement(data, this.layerElement,this.globalData,this);
};

HybridRenderer.prototype.getThreeDContainer = function(pos){
    var perspectiveElem = document.createElement('div');
    styleDiv(perspectiveElem);
    perspectiveElem.style.width = this.globalData.compSize.w+'px';
    perspectiveElem.style.height = this.globalData.compSize.h+'px';
    perspectiveElem.style.transformOrigin = perspectiveElem.style.mozTransformOrigin = perspectiveElem.style.webkitTransformOrigin = "50% 50%";
    var container = document.createElement('div');
    styleDiv(container);
    container.style.transform = container.style.webkitTransform = 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)';
    perspectiveElem.appendChild(container);
    this.resizerElem.appendChild(perspectiveElem);
    var threeDContainerData = {
        container:container,
        perspectiveElem:perspectiveElem,
        startPos: pos,
        endPos: pos
    };
    this.threeDElements.push(threeDContainerData);
    return threeDContainerData;
};

HybridRenderer.prototype.build3dContainers = function(){
    var i, len = this.layers.length;
    var lastThreeDContainerData;
    for(i=0;i<len;i+=1){
        if(this.layers[i].ddd){
            if(!lastThreeDContainerData){
                lastThreeDContainerData = this.getThreeDContainer(i);
            }
            lastThreeDContainerData.endPos = Math.max(lastThreeDContainerData.endPos,i);
        } else {
            lastThreeDContainerData = null;
        }
    }
};

HybridRenderer.prototype.addTo3dContainer = function(elem,pos){
    var i = 0, len = this.threeDElements.length;
    while(i<len){
        if(pos <= this.threeDElements[i].endPos){
            var j = this.threeDElements[i].startPos;
            var nextElement;
            while(j<pos){
                if(this.elements[j] && this.elements[j].getBaseElement){
                    nextElement = this.elements[j].getBaseElement();
                }
                j += 1;
            }
            if(nextElement){
                this.threeDElements[i].container.insertBefore(elem, nextElement);
            } else {
                this.threeDElements[i].container.appendChild(elem);
            }
            break;
        }
        i += 1;
    }
};

HybridRenderer.prototype.configAnimation = function(animData){
    var resizerElem = document.createElement('div');
    resizerElem.id='animationDiv';

    var wrapper = this.animationItem.wrapper;
    resizerElem.style.width = animData.w+'px';
    resizerElem.style.height = animData.h+'px';

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
    wrapper.appendChild(playpausebtn_onceOnVideo);

    if(this.animationItem.seekBar){

        var video_controls_bar = document.createElement('div');
        video_controls_bar.id='video_controls_bar';
        video_controls_bar.style.position = 'absolute';
        video_controls_bar.style.bottom = '0px';

        // animData.w - the width of the project
        // video_controls_bar.style.width = animData.w-(tx*2);
        // animData.h - the height of the project
        // video_controls_bar.style.height = animData.h+'px';
        //styleDiv_video_controls_bar(video_controls_bar);
        wrapper.appendChild(video_controls_bar);
        this.video_controls_bar = video_controls_bar;

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
        seeksliderdiv.style.width='100%';

        this.seeksliderdiv = seeksliderdiv;
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


    this.resizerElem = resizerElem;
    styleDiv(resizerElem);
    resizerElem.style.transformStyle = resizerElem.style.webkitTransformStyle = resizerElem.style.mozTransformStyle = "flat";
    wrapper.appendChild(resizerElem);

    resizerElem.style.overflow = 'hidden';
    var svg = document.createElementNS(svgNS,'svg');
    svg.setAttribute('width','1');
    svg.setAttribute('height','1');
    styleDiv(svg);
    this.resizerElem.appendChild(svg);
    var defs = document.createElementNS(svgNS,'defs');
    svg.appendChild(defs);
    this.globalData.defs = defs;
    this.data = animData;
    //Mask animation
    this.globalData.getAssetData = this.animationItem.getAssetData.bind(this.animationItem);
    this.globalData.getAssetsPath = this.animationItem.getAssetsPath.bind(this.animationItem);
    this.globalData.elementLoaded = this.animationItem.elementLoaded.bind(this.animationItem);
    this.globalData.frameId = 0;
    this.globalData.compSize = {
        w: animData.w,
        h: animData.h
    };
    this.globalData.frameRate = animData.fr;
    this.layers = animData.layers;
    this.globalData.fontManager = new FontManager();
    this.globalData.fontManager.addChars(animData.chars);
    this.globalData.fontManager.addFonts(animData.fonts,svg);
    this.layerElement = this.resizerElem;
    this.build3dContainers();
    this.updateContainerSize();
};

HybridRenderer.prototype.destroy = function () {
    this.animationItem.wrapper.innerHTML = '';
    this.animationItem.container = null;
    this.globalData.defs = null;
    var i, len = this.layers ? this.layers.length : 0;
    for (i = 0; i < len; i++) {
        this.elements[i].destroy();
    }
    this.elements.length = 0;
    this.destroyed = true;
    this.animationItem = null;
};

HybridRenderer.prototype.updateContainerSize = function () {
    var elementWidth = this.animationItem.wrapper.offsetWidth;
    var elementHeight = this.animationItem.wrapper.offsetHeight;
    var elementRel = elementWidth/elementHeight;
    var animationRel = this.globalData.compSize.w/this.globalData.compSize.h;
    var sx,sy,tx,ty;
    if(animationRel>elementRel){
        sx = elementWidth/(this.globalData.compSize.w);
        sy = elementWidth/(this.globalData.compSize.w);
        tx = 0;
        ty = ((elementHeight-this.globalData.compSize.h*(elementWidth/this.globalData.compSize.w))/2);
    }else{
        sx = elementHeight/(this.globalData.compSize.h);
        sy = elementHeight/(this.globalData.compSize.h);
        tx = (elementWidth-this.globalData.compSize.w*(elementHeight/this.globalData.compSize.h))/2;
        ty = 0;
    }
    this.resizerElem.style.transform = this.resizerElem.style.webkitTransform = 'matrix3d(' + sx + ',0,0,0,0,'+sy+',0,0,0,0,1,0,'+tx+','+ty+',0,1)';

    if(this.animationItem.seekBar){
        this.video_controls_bar.style.width = elementWidth - (tx*2) + 'px';
        this.video_controls_bar.style.left = tx + 'px';

        this.seeksliderdiv.style.width = elementWidth - (tx*2) - 40 - 40 + 'px';
    }
};

HybridRenderer.prototype.renderFrame = SVGRenderer.prototype.renderFrame;

HybridRenderer.prototype.hide = function(){
    this.resizerElem.style.display = 'none';
};

HybridRenderer.prototype.show = function(){
    this.resizerElem.style.display = 'block';
};

HybridRenderer.prototype.initItems = function(){
    this.buildAllItems();
    if(this.camera){
        this.camera.setup();
    } else {
        var cWidth = this.globalData.compSize.w;
        var cHeight = this.globalData.compSize.h;
        var i, len = this.threeDElements.length;
        for(i=0;i<len;i+=1){
            this.threeDElements[i].perspectiveElem.style.perspective = this.threeDElements[i].perspectiveElem.style.webkitPerspective = Math.sqrt(Math.pow(cWidth,2) + Math.pow(cHeight,2)) + 'px';
        }
    }
};

HybridRenderer.prototype.searchExtraCompositions = function(assets){
    var i, len = assets.length;
    var floatingContainer = document.createElement('div');
    for(i=0;i<len;i+=1){
        if(assets[i].xt){
            var comp = this.createComp(assets[i],floatingContainer,this.globalData.comp,null);
            comp.initExpressions();
            this.globalData.projectInterface.registerComposition(comp);
        }
    }
};