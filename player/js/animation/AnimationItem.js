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
    this.repeat = 'indefinite';
    this.animationData = {};
    this.layers = [];
    this.assets = [];
    this.renderedFrames = {};
    this.effectsManager = null;
    this.isPaused = true;
    this.isScrolling = false;
    this.loop = true;
    this.renderer = null;
};

AnimationItem.prototype.setData = function (wrapper) {
    this.wrapper = wrapper;
    //this.wrapper.style.position = 'relative';
    var self = this;
    this.path = this.wrapper.attributes.getNamedItem("data-animation-path") ? this.wrapper.attributes.getNamedItem("data-animation-path").value : '';
    this.playerType = this.wrapper.attributes.getNamedItem("data-bm-player") ? this.wrapper.attributes.getNamedItem("data-bm-player").value : '0';
    this.animType = this.wrapper.attributes.getNamedItem("data-anim-type") ? this.wrapper.attributes.getNamedItem("data-anim-type").value : 'div';
    switch(this.animType){
        case 'canvas':
            this.renderer = new CanvasRenderer(this);
            break;
        case 'svg':
            this.renderer = new SVGRenderer(this);
    }
    this.repeat = this.wrapper.attributes.getNamedItem("data-anim-repeat") ? this.wrapper.attributes.getNamedItem("data-anim-repeat").value : this.repeat;
    this.loop = this.wrapper.attributes.getNamedItem("data-anim-loop") ? this.wrapper.attributes.getNamedItem("data-anim-loop").value !== 'false' : this.loop;
    this.name = this.wrapper.attributes.getNamedItem("data-name") ? this.wrapper.attributes.getNamedItem("data-name").value : '';
    if(this.path == ''){
        return;
    }
    if (this.path.substr(-1, 1) != '/') {
        this.path += "/";
    }
    var xhr = new XMLHttpRequest();
    xhr.open("GET", this.path + 'data.json', true);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            self.configAnimation(JSON.parse(xhr.responseText));
        }
    };
};

AnimationItem.prototype.configAnimation = function (animData) {
    this.renderer.configAnimation(animData);

    this.effectsManager = new EffectsManager();
    this.animationData = animData;
    this.layers = this.animationData.animation.layers;
    this.assets = this.animationData.assets;
    this.totalFrames = this.animationData.animation.totalFrames;
    this.frameRate = this.animationData.animation.frameRate;
    this.frameMult = this.animationData.animation.frameRate / 1000;
    dataManager.completeData(this.layers, this.frameRate);
    this.renderer.buildItems(this.animationData.animation.layers);
    this.updaFrameModifier();
    this.checkLoaded();
};

AnimationItem.prototype.elementLoaded = function () {
    this.pendingElements--;
    this.checkLoaded();
};

AnimationItem.prototype.checkLoaded = function () {
    if (this.pendingElements == 0) {
        this.isLoaded = true;
        this.renderer.buildStage(this.container, this.layers);
        this.buildControls();
        this.gotoFrame();
        //TODO Need polyfill for ios 5.1
        this.dispatchEvent('bmLoaded');
    }
};

AnimationItem.prototype.resize = function () {
    this.renderer.updateContainerSize();
};

AnimationItem.prototype.buildControls = function () {

    if(this.playerType === '0'){
        return;
    }

    this.player = playerManager.createPlayer(this.playerType);
    this.player.buildControls(this,this.wrapper);
};

AnimationItem.prototype.gotoFrame = function () {
    if(subframeEnabled){
        //this.renderedFrames = [];
        this.currentFrame = Math.round(this.currentRawFrame*100)/100;
    }else{
        this.currentFrame = Math.floor(this.currentRawFrame);
    }
    this.renderFrame();
    if(this.player){
        this.player.setProgress(this.currentFrame / this.totalFrames);
    }
};

AnimationItem.prototype.renderFrame = function () {
    if(this.isLoaded === false){
        return;
    }
    if(!this.renderedFrames[this.currentFrame]){
        this.renderedFrames[this.currentFrame] = true;
        dataManager.renderFrame(this.layers,this.currentFrame,this.animType);
    }
    this.renderer.renderFrame(this.currentFrame);
};

AnimationItem.prototype.dispatchEvent = function(eventName){
    var event;
    if(document.createEvent){
        event = document.createEvent("CustomEvent");
        event.initCustomEvent(eventName, false, false, {});
    }else{
        event = new CustomEvent('bmPlay');
        //this.wrapper.dispatchEvent(event);
    }
    this.wrapper.dispatchEvent(event);
};

AnimationItem.prototype.play = function (name) {
    if(name && this.name != name){
        return;
    }
    if(this.isPaused === true){
        this.isPaused = false;
        this.dispatchEvent('bmPlay');
    }
};

AnimationItem.prototype.pause = function (name) {
    if(name && this.name != name){
        return;
    }
    if(this.isPaused === false){
        this.isPaused = true;
        this.dispatchEvent('bmPause');
    }
};

AnimationItem.prototype.togglePause = function (name) {
    if(name && this.name != name){
        return;
    }
    if(this.isPaused === false){
        this.play();
    }else{
        this.pause();
    }
};

AnimationItem.prototype.stop = function (name) {
    if(name && this.name != name){
        return;
    }
    this.isPaused = true;
    this.currentFrame = this.currentRawFrame = 0;
    this.dispatchEvent('bmStop');
};

AnimationItem.prototype.goToAndStop = function (pos) {
    this.isPaused = true;
    this.currentFrame = this.currentRawFrame = pos;
    this.gotoFrame();
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
        this.currentRawFrame = this.currentRawFrame % this.totalFrames;
        if(this.loop === false){
            this.goToAndStop(this.totalFrames - 1);
        }
    } else if (this.currentRawFrame < 0) {
        this.currentRawFrame = this.totalFrames + this.currentRawFrame;
    }
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