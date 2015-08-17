var AnimationItem = function (options) {
	
	if (!options) {
		options = {};
	}

	this.element = options.element;
	this.src = options.src;
	this.data = options.data;
	this.autoplay = options.autoplay;
	this.loop = options.loop;
	this.engine = options.engine;
	this.prerender = options.prerender;

	this._init();

}

// -------------------------------------------------------------------o Public

AnimationItem.prototype.trigger = function(eventName, args){

	if (!this.callbacks){
		this.callbacks = [];
	}

	var delay = (this.callbacks.length === 0) ? true : false;
	var that = this;

	if (this.callbacks[eventName]) {
		if (delay){
			setTimeout(function(){
				for (var i = 0; i < that.callbacks[eventName].length; i++){
					that.callbacks[eventName][i](args);
				}
			}, 0);
		}
		else {
			for (var i = 0; i < this.callbacks[eventName].length; i++){
				this.callbacks[eventName][i](args);
			}
		}
	}
};

AnimationItem.prototype.addEventListener = function(eventName, callback){

	if (!this.callbacks){
		this.callbacks = [];
	}

	if (!this.callbacks[eventName]){
		this.callbacks[eventName] = [];
	}

	this.callbacks[eventName].push(callback);

};

// -------------------------------------------------------------------o Init

AnimationItem.prototype._init = function () {

	this.animationID = randomString(10);
	this.renderer = null;
	this.path = '';
	this.animationData = {};
	this.layers = [];
	this.assets = [];
	this.scaleMode = 'fit';

	this.currentFrame = 0;
	this.currentRawFrame = 0;
	this.totalFrames = 0;
	this.frameRate = 0;
	this.frameMult = 0;
	this.playSpeed = 1;
	this.playDirection = 1;
	this.pendingElements = 0;
	this.playCount = 0;
	this.renderedFrameCount = 0;

	this.isLoaded = false;
	this.isPaused = true;

	this.initParams();

	if (this.autoplay === true) {
		this.play();
	}

}

AnimationItem.prototype._initEvents = function () {



}

// -------------------------------------------------------------------o Private



// -------------------------------------------------------------------o Public

AnimationItem.prototype.play = function () {

	this._changeState(BodyMovin.PLAYING);

}

AnimationItem.prototype.pause = function () {

	this._changeState(BodyMovin.PLAYING);

}

AnimationItem.prototype.pause = function () {

	this._changeState(BodyMovin.PAUSED);

}

AnimationItem.prototype.seek = function (frame) {

	

}

AnimationItem.prototype.timeUpdate = function (frame) {

	this.trigger(BodyMovin.TIMEUPDATE);

}



// -------------------------------------------------------------------o Getters

AnimationItem.prototype.getDuration = function () {

	return this.duration;

}

AnimationItem.prototype.getCurrentFrame = function () {

	return this.currentFrame;

}

// -------------------------------------------------------------------o Setters

AnimationItem.prototype.setData = function (data) {

	this.data = data;

}

AnimationItem.prototype.initParams = function () {

    var params = {
        wrapper: this.element
    };

    var wrapperAttributes = this.element.attributes;

    params.path = this.path || this.element.getAttribute('data-animation-path') || this.element.getAttribute('data-bm-path') || '';
    params.engine = this.engine || this.element.getAttribute('data-animation-engine') || this.element.getAttribute('data-anim-engine') || this.element.getAttribute('data-bm-engine') || 'svg';
    params.loop = this.loop || this.element.getAttribute('data-animation-loop') || this.element.getAttribute('data-bm-loop') || true;
    params.name = this.name || this.element.getAttribute('data-animation-name') || this.element.getAttribute('data-bm-name') || '';
    params.path = this.src;
    params.prerender = this.prerender || this.element.getAttribute('data-animation-prerender') || this.element.getAttribute('data-bm-prerender') || true;

    this.setParams(params);

}

AnimationItem.prototype.setParams = function (params) {

	var self = this;

    if (params.context) {
        this.context = params.context;
    }

    if (params.wrapper) {
        this.wrapper = params.wrapper;
    }

    if (this.engine == 'canvas') {
    	this.renderer = new CanvasRenderer(this, params.renderer);
    }
    else {
    	this.renderer = new SVGRenderer(this, params.renderer);
    }

    if (this.data) {
        self.configAnimation(this.data);
    } else if (params.path) {

        if (params.path.substr(-4) != 'json') {
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
                if (xhr.status == 200) {
                    self.configAnimation(JSON.parse(xhr.responseText));
                } else {
                    try {
                        var response = JSON.parse(xhr.responseText);
                        self.configAnimation(response);
                    } 
                    catch(err) {

                    }
                }
            }
        };
    }

}


AnimationItem.prototype.configAnimation = function (animData) {

    this.renderer.configAnimation(animData);

    this.animationData = animData;
    this.animationData._id = this.animationID;
    this.animationData._animType = this.engine;
    this.layers = this.animationData.animation.layers;
    this.assets = this.animationData.assets;
    this.totalFrames = this.animationData.animation.totalFrames;
    this.frameRate = this.animationData.animation.frameRate;
    this.firstFrame = Math.round(this.animationData.animation.ff*this.frameRate);
    /*this.firstFrame = 38;
    this.totalFrames = 2;*/
    this.frameMult = this.animationData.animation.frameRate / 1000;
    dataManager.completeData(this.animationData);
    this.renderer.buildItems(this.animationData.animation.layers);
    this.updaFrameModifier();
    this.checkLoaded();

}

AnimationItem.prototype.elementLoaded = function () {

    this.pendingElements--;
    this.checkLoaded();

}


AnimationItem.prototype.checkLoaded = function () {

    if (this.pendingElements === 0) {
        this.renderer.buildStage(this.container, this.layers);
        if (this.prerender) {
            this.prerenderFrames(0);
            dataManager.renderFrame(this.animationID,this.currentFrame + this.firstFrame);
            this.renderer.renderFrame(this.currentFrame + this.firstFrame);
        } else {
            this.isLoaded = true;
            this.gotoFrame(0);
            // autoplayed
        }
    }
};

/*AnimationItem.prototype.prerenderFrames = function (count) {

    console.log(count);

    if (!count) {
        count = 0;
    }

    if (this.renderedFrameCount === Math.floor(this.totalFrames)) {
        //TODO Need polyfill for ios 5.1
        this.isLoaded = true;
        this.gotoFrame(0);
        // autoplayed
    } else {
        dataManager.renderFrame(this.animationID, this.renderedFrameCount + this.firstFrame);
        this.renderedFrameCount += 1;

        if (count > 10) {
            setTimeout(this.prerenderFrames.bind(this),0);
        } else {
            count += 1;
            this.prerenderFrames(count);
        }
    }
};*/

AnimationItem.prototype.resize = function () {

    this.renderer.updateContainerSize();

};

AnimationItem.prototype.play = function (name) {

    if (this.isPaused === true) {
        this.isPaused = false;
    }

};

AnimationItem.prototype.pause = function (name) {

    if (this.isPaused === false) {
        this.isPaused = true;
    }

    this.trigger(BodyMovin.PAUSED);

};

AnimationItem.prototype.togglePause = function (name) {

    if (this.isPaused === true) {
        this.isPaused = false;
        this.play();
    } else {
        this.isPaused = true;
        this.pause();
    }

};

AnimationItem.prototype.stop = function (name) {

    this.isPaused = true;
    this.currentFrame = this.currentRawFrame = 0;
    this.playCount = 0;
    this.gotoFrame(0);

};

AnimationItem.prototype.goToAndStop = function (value, isFrame, name) {

    if (isFrame) {
        this.setCurrentRawFrameValue(value);
    } else {
        this.setCurrentRawFrameValue(value * this.frameModifier);
    }

    this.isPaused = true;

};


// ----------------------------------------------o Animating frames

AnimationItem.prototype.update = function (value) {

	this.currentRawFrame = this.currentRawFrame + value * this.frameModifier;
	this.currentFrame = this.currentRawFrame % this.totalFrames;

	if (this.isPaused === false && this.currentFrame > this.totalFrames - 1) {
		this.resetFrame();

		if (this.loop === false){
			this.pause();
		}
	}
	else if (this.isPaused === true) {
		return;
	}

    this.gotoFrame(this.currentRawFrame);
    //this.updateCurrentRawFrameValue(currentRawFrame);

};

/*AnimationItem.prototype.updateCurrentRawFrameValue = function(value){

    this.currentRawFrame = value;
    /*if (this.currentRawFrame >= this.totalFrames) {
        if(this.loop === false){
            this.currentRawFrame = this.totalFrames - 1;
            this.gotoFrame();
            this.pause();
            return;
        } else {
            this.playCount += 1;

            if (this.loop !== true) {
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

        if (this.playCount < 0) {
            this.playCount = 0;
        }

        if (this.loop === false) {
            this.currentRawFrame = 0;
            this.gotoFrame();
            this.pause();
            return;
        } else {
            this.currentRawFrame = this.totalFrames + this.currentRawFrame;
            this.gotoFrame();
            return;
        }
    }



    this.currentRawFrame = this.currentRawFrame % this.totalFrames;
    this.gotoFrame(this.currentRawFrame);

};*/

AnimationItem.prototype.gotoFrame = function (frame) {

	frame = this.getFrame(frame);
    this.currentFrame = frame;

	if (frame > this.totalFrames - 1) {
		this.resetFrame();
	}

    this.renderFrame();

};

AnimationItem.prototype.getFrame = function (rawFrame) {

    if (subframeEnabled){
        frame = Math.round(rawFrame * 100) / 100;
    } else {
        frame = Math.floor(rawFrame);
    }

    return frame;

};

AnimationItem.prototype.resetFrame = function (rawFrame) {

	this.currentRawFrame = 0;
	this.currentFrame = 0;

};

AnimationItem.prototype.renderFrame = function () {

    if(this.isLoaded === false){
        return;
    }

    dataManager.renderFrame(this.animationID,this.currentFrame + this.firstFrame);
    this.renderer.renderFrame(this.currentFrame + this.firstFrame);

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