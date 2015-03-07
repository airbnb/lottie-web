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
};

AnimationItem.prototype.setData = function (wrapper) {
    this.wrapper = wrapper;
    //this.wrapper.style.position = 'relative';
    var self = this;
    this.path = this.wrapper.attributes.getNamedItem("data-animation-path") ? this.wrapper.attributes.getNamedItem("data-animation-path").value : '';
    this.playerType = this.wrapper.attributes.getNamedItem("data-bm-player") ? this.wrapper.attributes.getNamedItem("data-bm-player").value : '0';
    this.animType = this.wrapper.attributes.getNamedItem("data-anim-type") ? this.wrapper.attributes.getNamedItem("data-anim-type").value : 'div';
    this.containerType = 'svg';
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
    this.container = document.createElementNS(svgNS,'svg');
    this.container.setAttribute('xmlns','http://www.w3.org/2000/svg');
    this.container.setAttribute('width',animData.animation.compWidth);
    this.container.setAttribute('height',animData.animation.compHeight);
    this.container.setAttribute('viewBox','0 0 '+animData.animation.compWidth+' '+animData.animation.compHeight);
    this.container.setAttribute('preserveAspectRatio','xMidYMid meet');
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.transformOrigin = this.container.style.mozTransformOrigin = this.container.style.webkitTransformOrigin = this.container.style['-webkit-transform'] = "0px 0px 0px";
    //this.container.style.overflow = 'hidden';
    //styleDiv(this.container);
    this.wrapper.appendChild(this.container);
    //Mask animation
    var defs = document.createElementNS(svgNS, 'defs');
    this.container.appendChild(defs);
    var maskElement = document.createElementNS(svgNS, 'clipPath');
    var rect = document.createElementNS(svgNS,'rect');
    rect.setAttribute('width',animData.animation.compWidth);
    rect.setAttribute('height',animData.animation.compHeight);
    rect.setAttribute('x',0);
    rect.setAttribute('y',0);
    maskElement.setAttribute('id', 'animationMask');
    maskElement.appendChild(rect);
    var maskedElement = document.createElementNS(svgNS,'g');
    maskedElement.setAttribute("clip-path", "url(#animationMask)");
    this.container.appendChild(maskedElement);
    defs.appendChild(maskElement);
    this.container = maskedElement;

    this.effectsManager = new EffectsManager();
    this.animationData = animData;
    this.layers = this.animationData.animation.layers;
    this.assets = this.animationData.assets;
    this.totalFrames = this.animationData.animation.totalFrames;
    this.frameRate = this.animationData.animation.frameRate;
    this.frameMult = this.animationData.animation.frameRate / 1000;
    dataManager.completeData(this.layers, this.frameRate);
    this.buildItems(this.animationData.animation.layers, this.containerType);
    this.updaFrameModifier();
    this.checkLoaded();
};

AnimationItem.prototype.buildItems = function (layers, type) {
    var count = 0, i, len = layers.length;
    for (i = 0; i < len; i++) {
        if (layers[i].type == 'StillLayer') {
            count++;
            this.createImage(layers[i], type);
        } else if (layers[i].type == 'PreCompLayer') {
            this.createComp(layers[i], type);
        } else if (layers[i].type == 'SolidLayer') {
            this.createSolid(layers[i], type);
        } else if (layers[i].type == 'ShapeLayer') {
            this.createShape(layers[i], type);
        } else if (layers[i].type == 'TextLayer') {
            this.createText(layers[i], type);
        }else{
            console.log('NO TYPE: ',layers[i]);
        }
    }
    this.pendingElements += count;
};

AnimationItem.prototype.createShape = function (data, type) {
    data.element = new IShapeElement(data, type, this);
};

AnimationItem.prototype.createText = function (data, type) {
    data.element = new ITextElement(data, type, this);
};

AnimationItem.prototype.createImage = function (data, type) {
    data.element = new IImageElement(data, type, this);
};

AnimationItem.prototype.createComp = function (data, type) {
    data.element = new ICompElement(data, type, this);
    this.buildItems(data.layers, data.element.getType());
};

AnimationItem.prototype.createSolid = function (data, type) {
    data.element = new ISolidElement(data, type, this);
};


AnimationItem.prototype.elementLoaded = function () {
    this.pendingElements--;
    this.checkLoaded();
};

AnimationItem.prototype.checkLoaded = function () {
    if (this.pendingElements == 0) {
        this.isLoaded = true;
        this.buildStage(this.container, this.layers, this.containerType);
        this.buildControls();
        this.gotoFrame();
        //TODO Need polyfill for ios 5.1
        this.dispatchEvent('bmLoaded');
    }
};

AnimationItem.prototype.buildStage = function (container, layers, parentType) {
    var i, len = layers.length, layerData;
    for (i = len - 1; i >= 0; i--) {
        layerData = layers[i];
        if (layerData.parent) {
            var mainContainer = this.buildItemHierarchy(layerData.element.getDomElement(), layerData.layerName, layerData.parent, layers, container, parentType);
            mainContainer.setAttribute("data-layer-name", layerData.layerName);
            container.appendChild(mainContainer);
            layerData.element.setMainElement(mainContainer);
        } else {
            layerData.element.getDomElement().setAttribute("data-layer-name", layerData.layerName);
            container.appendChild(layerData.element.getDomElement());
            layerData.element.setMainElement(layerData.element.getDomElement());
        }
        if (layerData.type == 'PreCompLayer') {
            this.buildStage(layerData.element.getComposingElement(), layerData.layers, layerData.element.getType());
        }
    }
};

AnimationItem.prototype.buildItemHierarchy = function (threeItem, layerName, parentName, layers, container, parentType) {
    var i = 0, len = layers.length;
    while (i < len) {
        if (layers[i].layerName == parentName) {
            if (!layers[i].relateds) {
                layers[i].relateds = [];
            }
            var div, itemCont;
            if (parentType == 'svg') {
                div = document.createElementNS(svgNS, 'g');
                itemCont = document.createElementNS(svgNS, 'g');
            } else {
                div = document.createElement('div');
                styleDiv(div);
                itemCont = document.createElement('div');
                styleDiv(itemCont);
            }
            layers[i].relateds.push({item:div, itemCont:itemCont, type:parentType});
            div.appendChild(threeItem);
            itemCont.appendChild(div);
            if (layers[i].parent == undefined) {
            } else {
                return this.buildItemHierarchy(itemCont, layerName, layers[i].parent, layers, container, parentType);
            }
            return itemCont;
        }
        i += 1;
    }
    return null;
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
        this.renderedFrames = [];
        this.currentFrame = this.currentRawFrame;
    }else{
        this.currentFrame = Math.floor(this.currentRawFrame);
    }
    this.renderFrame(this.layers);
    if(this.player){
        this.player.setProgress(this.currentFrame / this.totalFrames);
    }
};

AnimationItem.prototype.renderFrame = function (layers) {
    if(this.isLoaded === false){
        return;
    }
    if(!this.renderedFrames[this.currentFrame]){
        this.renderedFrames[this.currentFrame] = true;
        dataManager.renderFrame(this.layers,this.currentFrame);
    }
    var i, len = layers.length;
    for (i = 0; i < len; i++) {
        layers[i].element.renderFrame(this.currentFrame - layers[i].startTime);
    }
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