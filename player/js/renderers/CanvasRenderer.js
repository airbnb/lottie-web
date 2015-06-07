function CanvasRenderer(animationItem, config){
    this.animationItem = animationItem;
    this.renderConfig = config ? config : {
        clearCanvas: true,
        context: null,
        scaleMode: 'fit'
    };
    this.lastFrame = -1;
    this.globalData = {
        frameNum: -1
    }
    this.elements = [];
}

CanvasRenderer.prototype.buildItems = function(layers,elements){
    if(!elements){
        elements = this.elements;
    }
    var count = 0, i, len = layers.length;
    for (i = 0; i < len; i++) {
        if (layers[i].type == 'StillLayer') {
            count++;
            elements.push(this.createImage(layers[i]));
        } else if (layers[i].type == 'PreCompLayer') {
            elements.push(this.createComp(layers[i]));
            var elems = [];
            this.buildItems(layers[i].layers,elems);
            elements[elements.length - 1].setElements(elems);
        } else if (layers[i].type == 'SolidLayer') {
            elements.push(this.createSolid(layers[i]));
        } else if (layers[i].type == 'ShapeLayer') {
            elements.push(this.createShape(layers[i]));
        } else if (layers[i].type == 'TextLayer') {
            elements.push(this.createText(layers[i]));
        }else{
            elements.push(this.createBase(layers[i]));
            //console.log('NO TYPE: ',layers[i]);
        }
    }
};

CanvasRenderer.prototype.createBase = function (data) {
    return new CVBaseElement(data, this,this.globalData);
};

CanvasRenderer.prototype.createShape = function (data) {
    return new CVShapeElement(data, this,this.globalData);
};

CanvasRenderer.prototype.createText = function (data) {
    return new CVTextElement(data, this,this.globalData);
};

CanvasRenderer.prototype.createImage = function (data) {
    return new CVImageElement(data, this,this.globalData);
};

CanvasRenderer.prototype.createComp = function (data) {
    return new CVCompElement(data, this,this.globalData);
};

CanvasRenderer.prototype.createSolid = function (data) {
    return new CVSolidElement(data, this,this.globalData);
};

CanvasRenderer.prototype.configAnimation = function(animData){
    if(this.animationItem.wrapper){
        this.animationItem.container = document.createElement('canvas');
        this.animationItem.container.style.width = '100%';
        this.animationItem.container.style.height = '100%';
        this.animationItem.container.style.transformOrigin = this.animationItem.container.style.mozTransformOrigin = this.animationItem.container.style.webkitTransformOrigin = this.animationItem.container.style['-webkit-transform'] = "0px 0px 0px";
        this.animationItem.wrapper.appendChild(this.animationItem.container);
        this.canvasContext = this.animationItem.container.getContext('2d');
    }else{
        this.canvasContext = this.renderConfig.context;
    }
    this.layers = animData.animation.layers;
    this.transformCanvas = {};
    this.transformCanvas.w = animData.animation.compWidth;
    this.transformCanvas.h = animData.animation.compHeight;
    this.updateContainerSize();
};

CanvasRenderer.prototype.updateContainerSize = function () {
    var elementWidth,elementHeight;
    if(this.animationItem.wrapper && this.animationItem.container){
        elementWidth = this.animationItem.wrapper.offsetWidth;
        elementHeight = this.animationItem.wrapper.offsetHeight;
        this.animationItem.container.setAttribute('width',elementWidth);
        this.animationItem.container.setAttribute('height',elementHeight);
    }else{
        elementWidth = this.canvasContext.canvas.width;
        elementHeight = this.canvasContext.canvas.height;
    }
    if(this.renderConfig.scaleMode == 'fit'){
        var elementRel = elementWidth/elementHeight;
        var animationRel = this.transformCanvas.w/this.transformCanvas.h;
        if(animationRel>elementRel){
            this.transformCanvas.sx = elementWidth/this.transformCanvas.w;
            this.transformCanvas.sy = elementWidth/this.transformCanvas.w;
            this.transformCanvas.tx = 0;
            this.transformCanvas.ty = (elementHeight-this.transformCanvas.h*(elementWidth/this.transformCanvas.w))/2;
        }else{
            this.transformCanvas.sx = elementHeight/this.transformCanvas.h;
            this.transformCanvas.sy = elementHeight/this.transformCanvas.h;
            this.transformCanvas.tx = (elementWidth-this.transformCanvas.w*(elementHeight/this.transformCanvas.h))/2;
            this.transformCanvas.ty = 0;
        }
    }else{
        this.transformCanvas.sx = 1;
        this.transformCanvas.sy = 1;
        this.transformCanvas.tx = 0;
        this.transformCanvas.ty = 0;
    }
};

CanvasRenderer.prototype.buildStage = function (container, layers, elements) {
    if(!elements){
        elements = this.elements;
    }
    var i, len = layers.length, layerData;
    for (i = len - 1; i >= 0; i--) {
        layerData = layers[i];
        if (layerData.parent) {
            this.buildItemHierarchy(layerData,elements[i], layers, layerData.parent,elements);
        }
        if (layerData.type == 'PreCompLayer') {
            this.buildStage(null, layerData.layers, elements[i].getElements());
        }
    }
};

CanvasRenderer.prototype.buildItemHierarchy = function (data,element, layers, parentName,elements) {
    var i = 0, len = layers.length;
    while (i < len) {
        if (layers[i].layerName == parentName) {
            element.getHierarchy().push(elements[i]);
            if (layers[i].parent === undefined) {
            } else {
                this.buildItemHierarchy(data,element, layers, layers[i].parent,elements);
            }
            break;
        }
        i += 1;
    }
};

CanvasRenderer.prototype.prepareFrame = function(num){
    var i, len = this.elements.length;
    for (i = 0; i < len; i++) {
        this.elements[i].prepareFrame(num - this.layers[i].startTime);
    }
};

CanvasRenderer.prototype.draw = function(){
    var i, len = this.layers.length;
    for (i = len - 1; i >= 0; i-=1) {
        this.elements[i].draw();
    }
};

CanvasRenderer.prototype.renderFrame = function(num){
    if(this.lastFrame == num){
        return;
    }
    this.lastFrame = num;
    this.globalData.frameNum = num;
    if(this.renderConfig.clearCanvas === true){
        this.canvasContext.canvas.width = this.canvasContext.canvas.width;
    }else{
        this.canvasContext.save();
    }
    this.canvasContext.transform(this.transformCanvas.sx,0,0,this.transformCanvas.sy,this.transformCanvas.tx,this.transformCanvas.ty);
    this.canvasContext.beginPath();
    this.canvasContext.rect(0,0,this.transformCanvas.w,this.transformCanvas.h);
    this.canvasContext.clip();
    this.prepareFrame(num);
    this.draw();
    if(this.renderConfig.clearCanvas !== true){
        this.canvasContext.restore();
    }
};