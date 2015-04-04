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
    this.effectsManager = null;
    this.isPaused = true;
    this.isScrolling = false;
    this.loop = true;
    this.renderer = null;
    this.animationID = randomString(10);
    this.renderedFrameCount = 0;
};

AnimationItem.prototype.setData = function (wrapper) {
    this.wrapper = wrapper;
    //this.wrapper.style.position = 'relative';
    var self = this;
    this.path = this.wrapper.attributes.getNamedItem("data-animation-path") ? this.wrapper.attributes.getNamedItem("data-animation-path").value : '';
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
    this.animationData._id = this.animationID;
    this.animationData._animType = this.animType;
    this.layers = this.animationData.animation.layers;
    this.assets = this.animationData.assets;
    this.totalFrames = this.animationData.animation.totalFrames;
    this.frameRate = this.animationData.animation.frameRate;
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
    if (this.pendingElements == 0) {
        //this.prerenderFrames();
        setTimeout(function(){
            this.prerenderFrames(0);
        }.bind(this),3000);
    }
};

AnimationItem.prototype.prerenderFrames = function(count){
    if(!count){
        count = 0;
    }
    if(this.renderedFrameCount === this.totalFrames){
        //TODO Need polyfill for ios 5.1
        this.renderer.buildStage(this.container, this.layers);
        this.gotoFrame();
        this.isLoaded = true;
    }else{
        dataManager.renderFrame(this.animationID,this.renderedFrameCount);
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
        this.currentFrame = Math.round(this.currentRawFrame*100)/100;
    }else{
        this.currentFrame = Math.floor(this.currentRawFrame);
    }
    this.renderFrame();
};

AnimationItem.prototype.renderFrame = function () {
    if(this.isLoaded === false){
        return;
    }
    dataManager.renderFrame(this.animationID,this.currentFrame);
    this.renderer.renderFrame(this.currentFrame);
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
    this.gotoFrame();
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