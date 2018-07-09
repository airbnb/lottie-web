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
    this.elements = [];
    this.pendingElements = [];
    this.transformMat = new Matrix();
    this.transformStack = [this.transformMat];
    this.completeLayers = false;

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
        this.canvasContext = this.animationItem.container.getContext('webgl');
        if(this.renderConfig.className) {
            this.animationItem.container.setAttribute('class', this.renderConfig.className);
        }
    }else{
        this.canvasContext = this.renderConfig.context;
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
    this.globalData.canvasContext = this.canvasContext;
    //
    this.positionBuffer = this.canvasContext.createBuffer();
    this.canvasContext.bindBuffer(this.canvasContext.ARRAY_BUFFER, this.positionBuffer);

    var positions = [
      0, 0,
      1, 1,
      0, 1,
      0, 0,
      1, 0,
      1, 1,
    ];
    this.canvasContext.bufferData(this.canvasContext.ARRAY_BUFFER, new Float32Array(positions), this.canvasContext.STATIC_DRAW);
    //
    this.globalData.renderer = this;
    this.globalData.isDashed = false;
    this.globalData.progressiveLoad = this.renderConfig.progressiveLoad;
    this.globalData.pushTransform = this.pushTransform.bind(this);
    this.globalData.popTransform = this.popTransform.bind(this);
    this.globalData.getTransform = this.getTransform.bind(this);
    this.globalData.globalBuffer = this.positionBuffer;
    this.elements = createSizedArray(animData.layers.length);

    this.updateContainerSize();
};

WebGLRenderer.prototype.pushTransform = function(transform) {
	var currentTransform = this.transformStack[this.transformStack.length - 1];
	var newTransform = new Matrix();
	transform.clone(newTransform);
	var p = currentTransform.props;
	newTransform.transform(p[0],p[1],p[2],p[3],p[4],p[5],p[6],p[7],p[8],p[9],p[10],p[11],p[12],p[13],p[14],p[15]);
	this.transformStack.push(newTransform);
}

WebGLRenderer.prototype.popTransform = function() {
	this.transformStack.pop();
}

WebGLRenderer.prototype.getTransform = function() {
	return this.transformStack[this.transformStack.length - 1];
}

WebGLRenderer.prototype.buildItem = function(pos){
    var elements = this.elements;
    if(elements[pos] || this.layers[pos].ty == 99){
        return;
    }
    var element = this.createItem(this.layers[pos], this,this.globalData);
    elements[pos] = element;
    element.initExpressions();
    /*if(this.layers[pos].ty === 0){
        element.resize(this.globalData.transformCanvas);
    }*/
};

WebGLRenderer.prototype.calculateTransformSize = CanvasRenderer.prototype.calculateTransformSize;
WebGLRenderer.prototype.updateContainerSize = function() {
	this.calculateTransformSize();
	this.transformMat.reset();
	var scaleX = 1, scaleY = 1;
    var elementWidth,elementHeight, elementRel;
    elementWidth = this.canvasContext.canvas.width;
    elementHeight = this.canvasContext.canvas.height;
    elementRel = elementWidth / elementHeight;
    var animationRel = this.transformCanvas.w / this.transformCanvas.h;
    if(animationRel > elementRel) {
    	scaleY = (this.transformCanvas.h * this.transformCanvas.sy) / elementHeight;
    } else {
    	scaleX = (this.transformCanvas.w * this.transformCanvas.sx) / elementWidth;
    }


	this.transformMat.scale(scaleX, scaleY);
	this.transformMat.scale(1 / this.data.w, 1 / this.data.h);
	this.transformMat.scale(2, 2);
	this.transformMat.translate(-1, -1);
	this.transformMat.translate(1 - scaleX, 1 - scaleY);
	this.transformMat.scale(1, -1);
  	this.canvasContext.viewport(0, 0, this.animationItem.container.width, this.animationItem.container.height);
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

WebGLRenderer.prototype.checkPendingElements  = function(){
    while(this.pendingElements.length){
        var element = this.pendingElements.pop();
        element.checkParenting();
    }
};

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

    for (i = 0; i < len; i++) {
        if(this.completeLayers || this.elements[i]){
            this.elements[i].prepareFrame(num - this.layers[i].st);
        }
    }
    if(this.globalData._mdf) {

		this.canvasContext.clearColor(0, 0, 0, 0);
		this.canvasContext.clear(this.canvasContext.COLOR_BUFFER_BIT);

        for (i = len - 1; i >= 0; i-=1) {
            if(this.completeLayers || this.elements[i]){
                this.elements[i].renderFrame();
            }
        }
    }
};