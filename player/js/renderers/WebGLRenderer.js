function WebGLRenderer(animationItem, config){
    this.animationItem = animationItem;
    this.renderConfig = {
        clearCanvas: (config && config.clearCanvas !== undefined) ? config.clearCanvas : true,
        context: (config && config.context) || null,
        progressiveLoad: (config && config.progressiveLoad) || false,
        preserveAspectRatio: (config && config.preserveAspectRatio) || 'xMidYMid meet',
        imagePreserveAspectRatio: (config && config.imagePreserveAspectRatio) || 'xMidYMid slice',
        className: (config && config.className) || ''
    };
    this.renderConfig.dpr = (config && config.dpr) || 1;
    if (this.animationItem.wrapper) {
        this.renderConfig.dpr = (config && config.dpr) || window.devicePixelRatio || 1;
    }
    this.renderedFrame = -1;
    this.globalData = {
        frameNum: -1,
        _mdf: false,
        renderConfig: this.renderConfig
    };
    this._stencilCount = 0;
    this.elements = [];
    this.pendingElements = [];
    this.transformMat = new Matrix();
    this.precompStack = [];
    this.completeLayers = false;
    this._root = true;

}
extendPrototype([BaseRenderer],WebGLRenderer);


WebGLRenderer.prototype.configAnimation = function(animData){
    if(this.animationItem.wrapper){
        this.animationItem.container = createTag('canvas');
        this.animationItem.container.style.width = '100%';
        this.animationItem.container.style.height = '100%';
        //this.animationItem.container.style.transform = 'translate3d(0,0,0)';
        //this.animationItem.container.style.webkitTransform = 'translate3d(0,0,0)';
        this.animationItem.container.style.transformOrigin = this.animationItem.container.style.mozTransformOrigin = this.animationItem.container.style.webkitTransformOrigin = this.animationItem.container.style['-webkit-transform'] = "0px 0px 0px";
        this.animationItem.wrapper.appendChild(this.animationItem.container);
        var glc = this.animationItem.container.getContext('webgl');

        // ////
        var _debug = false;
        if (_debug) {

            this.glContext = new Proxy(glc, {

                get(target, propKey, receiver) {
                    if (typeof target[propKey] === 'function') {
                        const origMethod = target[propKey];
                        return function (...args) {
                            const result = origMethod.apply(target, args);
                            console.log('==========')
                            console.log(propKey)
                            // args.forEach(arg => {
                            //     console.log(arg)
                            // })
                            // console.log('==========')
                            // console.log(propKey + JSON.stringify(args)
                            //     + ' -> ' + JSON.stringify(result));
                            return result;
                        };
                    } else {
                        console.log('GETTING: ', propKey)
                        return target[propKey]
                    }
                }
            })
        } else {
            this.glContext = glc
        }

        // 
        ////

        // Enabled blend and sets blend func to handle opacity.
        //TODO: rename to glContext
        this.glContext.enable(this.glContext.BLEND);
        this.glContext.blendFunc(this.glContext.SRC_ALPHA, this.glContext.ONE_MINUS_SRC_ALPHA);
        if(this.renderConfig.className) {
            this.animationItem.container.setAttribute('class', this.renderConfig.className);
        }
    }else{
        this.glContext = this.renderConfig.context;
    }
    this.transformCanvas = {
        w: animData.w,
        h:animData.h,
        sx:0,
        sy:0,
        tx:0,
        ty:0
    };
    this.data = animData;
    this.layers = animData.layers;
    this.setupGlobalData(animData, document.body);
    this.globalData.glContext = this.glContext;
    if (!this.camera) {
        console.log('PASO 1')
        this.camera = new WebGLCamera(null, this.globalData, this);
    }
    
    // Position buffer data
    var glContext = this.glContext;

    //General Array Buffer. Position buffer. Will be used by all layers.
    this.positionBuffer = glContext.createBuffer();
    glContext.bindBuffer(glContext.ARRAY_BUFFER, this.positionBuffer);

    var positions = [
      0, 0,
      1, 1,
      0, 1,
      0, 0,
      1, 0,
      1, 1,
    ];
    glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(positions), glContext.STATIC_DRAW);
    //
    this.globalData.positionBuffer = this.positionBuffer;
    this.globalData.renderer = this;
    this.globalData.isDashed = false;
    this.globalData.progressiveLoad = this.renderConfig.progressiveLoad;
    this.globalData.resetViewport = this.resetViewport.bind(this);
    this.globalData.globalBuffer = this.positionBuffer;
    this.elements = createSizedArray(animData.layers.length);

    this.updateContainerSize();
};

WebGLRenderer.prototype.getTransform = function() {
    return this.transformMat;
}

WebGLRenderer.prototype.getTrackMatteElement = function(element) {
    var i = 0, len = this.elements.length;
    while (i < len) {
        if(this.elements[i] === element) {
            return this.elements[i - 1];
        }
        i += 1;
    }
}

WebGLRenderer.prototype.buildItem = function(pos){
    var elements = this.elements;
    if(elements[pos] || this.layers[pos].ty == 99){
        return;
    }
    var element = this.createItem(this.layers[pos], this,this.globalData);
    elements[pos] = element;
    element.initExpressions();
    if(this.layers[pos].tt){
        element.renderableEffectsManager.pushEffect(new WTrackMatte(element, elements[pos - 1]));
    }
};

WebGLRenderer.prototype.calculateTransformSize = CanvasRenderer.prototype.calculateTransformSize;
WebGLRenderer.prototype.updateContainerSize = function() {
	this.calculateTransformSize();
	var scaleX = 1, scaleY = 1;
    var elementWidth,elementHeight, elementRel;
    elementWidth = this.glContext.canvas.width;
    elementHeight = this.glContext.canvas.height;
    elementRel = elementWidth / elementHeight;
    var animationRel = this.transformCanvas.w / this.transformCanvas.h;
    if(animationRel > elementRel) {
    	scaleY = (this.transformCanvas.h * this.transformCanvas.sy) / elementHeight;
    } else {
    	scaleX = (this.transformCanvas.w * this.transformCanvas.sx) / elementWidth;
    }

    this.scaleX = scaleX;
    this.scaleY = scaleY;


 //    this.transformMat.reset();
	// this.transformMat.scale(scaleX, scaleY);
	// this.transformMat.scale(1 / this.data.w, 1 / this.data.h, 1 / 1666);
	// this.transformMat.scale(2, 2);
	// this.transformMat.translate(-1, -1);
	// this.transformMat.translate(1 - scaleX, 1 - scaleY);
	// this.transformMat.scale(1, -1);
    this.resetViewport();
};

WebGLRenderer.prototype.switchBuffer = function() {
    // TODO: validate current buffer before switching to avoid unnecessary calls.
    var glContext = this.glContext;
    if (this._root) {
        this.glContext.bindFramebuffer(glContext.FRAMEBUFFER, null);
        this.resetViewport();
    } else {
        glContext.bindFramebuffer(glContext.FRAMEBUFFER, this.bufferData.framebuffer);
        glContext.viewport(0, 0, this.data.w, this.data.h);
    }
}

WebGLRenderer.prototype.resetViewport = function (data) {
    this.glContext.viewport(0, 0, this.animationItem.container.width, this.animationItem.container.height);
};

WebGLRenderer.prototype.createImage = function (data) {
    return new WImageElement(data, this.globalData, this);
};

WebGLRenderer.prototype.createSolid = function (data) {
    return new WSolidElement(data, this.globalData, this);
};

WebGLRenderer.prototype.createComp = function (data) {
    return new WCompElement(data, this.globalData, this);
};

WebGLRenderer.prototype.createNull = SVGRenderer.prototype.createNull;


WebGLRenderer.prototype.createShape = function (data) {
    return new WShapeElement(data,this.globalData,this);
};

WebGLRenderer.prototype.createCamera = function (data) {
    this.camera = new WebGLCamera(data, this.globalData, this);
    return this.camera;
};

WebGLRenderer.prototype.checkPendingElements  = function(){
    while(this.pendingElements.length){
        var element = this.pendingElements.pop();
        element.checkParenting();
    }
};

WebGLRenderer.prototype.getSize = function(){
    return this.transformCanvas;
}

WebGLRenderer.prototype.applyCameraTransformation = function(){
    this.transformMat.reset();
    this.transformMat.scale(this.scaleX, this.scaleY);
    var p = this.camera.mat.props;
    console.log(p)
    this.transformMat.transform(p[0], p[1], p[2], p[3]
        ,p[4], p[5], p[6], p[7]
        ,p[8], p[9], p[10], p[11]
        ,p[12], p[13], p[14], p[15]);

    // convert values to range [0, 1]
    this.transformMat.scale(1 / this.data.w, 1 / this.data.h, 1);
    // convert values to range [0, 2]
    this.transformMat.scale(2, 2);
    // convert values to range [-1, 1]
    this.transformMat.translate(-1, -1);
    // convert values to fit inside actual canvas
    this.transformMat.translate(1 - this.scaleX, 1 - this.scaleY);
    // invert Y axis
    this.transformMat.scale(1, -1);
}

WebGLRenderer.prototype.renderFrame = function(num){
    if((this.renderedFrame == num && this.renderConfig.clearCanvas === true) || this.destroyed || num === -1){
        return;
    }
    this.renderedFrame = num;
    this.globalData.frameNum = num - this.animationItem._isFirstFrame;
    this.globalData.frameId += 1;
    this.globalData._mdf = !this.renderConfig.clearCanvas;
    this.globalData.projectInterface.currentFrame = num;

     // console.log('--------');
     // console.log('NEW: ',num);
    var i, len = this.layers.length;
    if(!this.completeLayers){
        this.checkLayers(num);
    }

    this.camera.prepareFrame(num);
    for (i = 0; i < len; i++) {
        if(this.completeLayers || this.elements[i]){
            this.elements[i].prepareFrame(num - this.layers[i].st);
        }
    }
    if(this.globalData._mdf) {
		this.glContext.clearColor(0, 0, 0, 0);
		this.glContext.clear(this.glContext.COLOR_BUFFER_BIT | this.glContext.DEPTH_BUFFER_BIT);

        this.camera.renderFrame();
        this.applyCameraTransformation();

        // TODO: Look into rendering track mattes first
        for (i = len - 1; i >= 0; i-=1) {
            if(!this.elements[i].data.td) {
                this.elements[i].renderFrame();
            }
        }
    }
};