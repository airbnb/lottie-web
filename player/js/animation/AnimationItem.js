var AnimationItem = function () {
    this.name = '';
    this.path = '';
    this.isLoaded = false;
    this.currentFrame = 0;
    this.currentRawFrame = 0;
    this.totalFrames = 0;
    this.frameRate = 0;
    this.frameMult = 0;
    this.playSpeed = 1;
    this.playDirection = 1;
    this.pendingElements = 0;
    this.playCount = 0;
    this.prerenderFramesFlag = true;
    this.repeat = 'indefinite';
    this.animationData = {};
    this.layers = [];
    this.assets = [];
    this.isPaused = true;
    this.isScrolling = false;
    this.autoplay = false;
    this.loop = true;
    this.renderer = null;
    this.animationID = randomString(10);
    this.renderedFrameCount = 0;
    this.scaleMode = 'fit';
    this.math = Math;
};

AnimationItem.prototype.setParams = function(params) {
    var self = this;
    if(params.context){
        this.context = params.context;
    }
    if(params.wrapper){
        this.wrapper = params.wrapper;
    }
    var animType = params.animType ? params.animType : 'canvas';
    switch(animType){
        case 'canvas':
            this.renderer = new CanvasRenderer(this, params.renderer);
            break;
        case 'svg':
            this.renderer = new SVGRenderer(this, params.renderer);
    }
    this.animType = animType;

    if(params.loop === '' || params.loop === null){
    }else if(params.loop === false){
        this.loop = false;
    }else if(params.loop === true){
        this.loop = true;
    }else{
        this.loop = parseInt(params.loop);
    }
    this.autoplay = 'autoplay' in params ? params.autoplay : true;
    this.name = params.name ? params.name :  '';
    this.prerenderFramesFlag = 'prerender' in params ? params.prerender : true;
    if(params.animationData){
        self.configAnimation(params.animationData);
    }else if(params.path){
        if(params.path.substr(-4) != 'json'){
            if (params.path.substr(-1, 1) != '/') {
                params.path += '/';
            }
            params.path += 'data.json';
        }

        var xhr = new XMLHttpRequest();
        this.path = params.path.substr(0,params.path.lastIndexOf('/')+1);
        xhr.open('GET', params.path, true);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if(xhr.status == 200){
                    self.configAnimation(JSON.parse(xhr.responseText));
                }else{
                    try{
                        var response = JSON.parse(xhr.responseText);
                        self.configAnimation(response);
                    }catch(err){
                    }
                }
            }
        };
    }
};

AnimationItem.prototype.setData = function (wrapper) {
    var params = {
        wrapper: wrapper
    };
    var wrapperAttributes = wrapper.attributes;

    params.path = wrapperAttributes.getNamedItem('data-animation-path') ? wrapperAttributes.getNamedItem('data-animation-path').value : wrapperAttributes.getNamedItem('data-bm-path') ? wrapperAttributes.getNamedItem('data-bm-path').value :  wrapperAttributes.getNamedItem('bm-path') ? wrapperAttributes.getNamedItem('bm-path').value : '';
    params.animType = wrapperAttributes.getNamedItem('data-anim-type') ? wrapperAttributes.getNamedItem('data-anim-type').value : wrapperAttributes.getNamedItem('data-bm-type') ? wrapperAttributes.getNamedItem('data-bm-type').value : wrapperAttributes.getNamedItem('bm-type') ? wrapperAttributes.getNamedItem('bm-type').value :  'canvas';

    var loop = wrapperAttributes.getNamedItem('data-anim-loop') ? wrapperAttributes.getNamedItem('data-anim-loop').value :  wrapperAttributes.getNamedItem('data-bm-loop') ? wrapperAttributes.getNamedItem('data-bm-loop').value :  wrapperAttributes.getNamedItem('bm-loop') ? wrapperAttributes.getNamedItem('bm-loop').value : '';
    if(loop === ''){
    }else if(loop === 'false'){
        params.loop = false;
    }else if(loop === 'true'){
        params.loop = true;
    }else{
        params.loop = parseInt(loop);
    }
    params.name = wrapperAttributes.getNamedItem('data-name') ? wrapperAttributes.getNamedItem('data-name').value :  wrapperAttributes.getNamedItem('data-bm-name') ? wrapperAttributes.getNamedItem('data-bm-name').value : wrapperAttributes.getNamedItem('bm-name') ? wrapperAttributes.getNamedItem('bm-name').value :  '';
    var prerender = wrapperAttributes.getNamedItem('data-anim-prerender') ? wrapperAttributes.getNamedItem('data-anim-prerender').value :  wrapperAttributes.getNamedItem('data-bm-prerender') ? wrapperAttributes.getNamedItem('data-bm-prerender').value :  wrapperAttributes.getNamedItem('bm-prerender') ? wrapperAttributes.getNamedItem('bm-prerender').value : '';

    if(prerender === 'false'){
        params.prerender = false;
    }
    this.setParams(params);
};

AnimationItem.prototype.configAnimation = function (animData) {
    this.renderer.configAnimation(animData);

    this.animationData = animData;
    this.animationData._id = this.animationID;
    this.animationData._animType = this.animType;
    this.layers = this.animationData.animation.layers;
    this.assets = this.animationData.assets;
    this.totalFrames = this.animationData.animation.totalFrames;
    this.frameRate = this.animationData.animation.frameRate;
    this.firstFrame = Math.round(this.animationData.animation.ff*this.frameRate);
    this.firstFrame = 23;
    this.totalFrames = 1;
    this.frameMult = this.animationData.animation.frameRate / 1000;
    dataManager.completeData(this.animationData);
    this.renderer.buildItems(this.animationData.animation.layers);
    this.updaFrameModifier();
    this.checkLoaded();
};

AnimationItem.prototype.elementLoaded = function () {
    this.pendingElements--;
    this.checkLoaded();
};

AnimationItem.prototype.checkLoaded = function () {
    this.renderer.buildStage(this.container, this.layers);
    if (this.pendingElements === 0) {
        if(this.prerenderFramesFlag){
            this.prerenderFrames(0);
            dataManager.renderFrame(this.animationID,this.currentFrame + this.firstFrame);
            this.renderer.renderFrame(this.currentFrame + this.firstFrame);
        }else{
            this.isLoaded = true;
            this.gotoFrame();
            if(this.autoplay){
                this.play();
            }
        }
    }
};

AnimationItem.prototype.prerenderFrames = function(count){
    if(!count){
        count = 0;
    }
    if(this.renderedFrameCount === this.totalFrames){
        //TODO Need polyfill for ios 5.1
        this.isLoaded = true;
        this.gotoFrame();
        if(this.autoplay){
            this.play();
        }
    }else{
        dataManager.renderFrame(this.animationID,this.renderedFrameCount + this.firstFrame);
        this.renderedFrameCount+=1;
        if(count > 5){
            setTimeout(this.prerenderFrames.bind(this),0);
        }else{
            count += 1;
            this.prerenderFrames(count);
        }
    }
};

AnimationItem.prototype.resize = function () {
    this.renderer.updateContainerSize();
};

AnimationItem.prototype.gotoFrame = function () {
    if(subframeEnabled){
        this.currentFrame = this.math.round(this.currentRawFrame*100)/100;
    }else{
        this.currentFrame = this.math.floor(this.currentRawFrame);
    }
    this.renderFrame();
};

AnimationItem.prototype.renderFrame = function () {
    if(this.isLoaded === false){
        return;
    }
    dataManager.renderFrame(this.animationID,this.currentFrame + this.firstFrame);
    this.renderer.renderFrame(this.currentFrame + this.firstFrame);
};

AnimationItem.prototype.play = function (name) {
    if(name && this.name != name){
        return;
    }
    if(this.isPaused === true){
        this.isPaused = false;
    }
};

AnimationItem.prototype.pause = function (name) {
    if(name && this.name != name){
        return;
    }
    if(this.isPaused === false){
        this.isPaused = true;
    }
};

AnimationItem.prototype.togglePause = function (name) {
    if(name && this.name != name){
        return;
    }
    if(this.isPaused === true){
        this.isPaused = false;
        this.play();
    }else{
        this.isPaused = true;
        this.pause();
    }
};

AnimationItem.prototype.stop = function (name) {
    if(name && this.name != name){
        return;
    }
    this.isPaused = true;
    this.currentFrame = this.currentRawFrame = 0;
    this.playCount = 0;
    this.gotoFrame();
};

AnimationItem.prototype.goToAndStop = function (value, isFrame, name) {
    if(name && this.name != name){
        return;
    }
    if(isFrame){
        this.setCurrentRawFrameValue(value);
    }else{
        this.setCurrentRawFrameValue(value * this.frameModifier);
    }
    this.isPaused = true;
};

AnimationItem.prototype.advanceTime = function (value) {
    if (this.isPaused === true || this.isScrolling === true || this.isLoaded === false) {
        return;
    }
    this.setCurrentRawFrameValue(this.currentRawFrame + value * this.frameModifier);
};

AnimationItem.prototype.updateAnimation = function (perc) {
    this.setCurrentRawFrameValue(this.totalFrames * perc);
};

AnimationItem.prototype.moveFrame = function (value, name) {
    if(name && this.name != name){
        return;
    }
    this.setCurrentRawFrameValue(this.currentRawFrame+value);
};

AnimationItem.prototype.setCurrentRawFrameValue = function(value){
    this.currentRawFrame = value;
    if (this.currentRawFrame >= this.totalFrames) {
        if(this.loop === false){
            this.currentRawFrame = this.totalFrames - 1;
            this.gotoFrame();
            this.pause();
            return;
        }else{
            this.playCount += 1;
            if(this.loop !== true){
                if(this.playCount == this.loop){
                    this.currentRawFrame = this.totalFrames - 1;
                    this.gotoFrame();
                    this.pause();
                    return;
                }
            }
        }
    } else if (this.currentRawFrame < 0) {
        this.playCount -= 1;
        if(this.playCount < 0){
            this.playCount = 0;
        }
        if(this.loop === false){
            this.currentRawFrame = 0;
            this.gotoFrame();
            this.pause();
            return;
        }else{
            this.currentRawFrame = this.totalFrames + this.currentRawFrame;
            this.gotoFrame();
            return;
        }
    }

    this.currentRawFrame = this.currentRawFrame % this.totalFrames;
    this.gotoFrame();
};

AnimationItem.prototype.setSpeed = function (val) {
    this.playSpeed = val;
    this.updaFrameModifier();
};

AnimationItem.prototype.setDirection = function (val) {
    this.playDirection = val < 0 ? -1 : 1;
    this.updaFrameModifier();
};

AnimationItem.prototype.updaFrameModifier = function () {
    this.frameModifier = this.frameMult * this.playSpeed * this.playDirection;
};

AnimationItem.prototype.getPath = function () {
    return this.path;
};

AnimationItem.prototype.getAssets = function () {
    return this.assets;
};