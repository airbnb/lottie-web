function CanvasRenderer(animationItem){
    this.animationItem = animationItem;
    this.lastFrame = -1;
}

CanvasRenderer.prototype.buildItems = function(layers){
    var count = 0, i, len = layers.length;
    for (i = 0; i < len; i++) {
        if (layers[i].type == 'StillLayer') {
            count++;
            this.createImage(layers[i]);
        } else if (layers[i].type == 'PreCompLayer') {
            this.createComp(layers[i]);
        } else if (layers[i].type == 'SolidLayer') {
            this.createSolid(layers[i]);
        } else if (layers[i].type == 'ShapeLayer') {
            this.createShape(layers[i]);
        } else if (layers[i].type == 'TextLayer') {
            this.createText(layers[i]);
        }else{
            console.log('NO TYPE: ',layers[i]);
        }
    }
}

CanvasRenderer.prototype.createShape = function (data) {
    data.element = new CVShapeElement(data, this);
};

CanvasRenderer.prototype.createText = function (data) {
    data.element = new CVTextElement(data, this);
};

CanvasRenderer.prototype.createImage = function (data) {
    data.element = new CVImageElement(data, this);
};

CanvasRenderer.prototype.createComp = function (data) {
    data.element = new CVCompElement(data, this);
    this.buildItems(data.layers);
};

CanvasRenderer.prototype.createSolid = function (data) {
    data.element = new CVSolidElement(data, this);
};

CanvasRenderer.prototype.configAnimation = function(animData){
    this.animationItem.container = document.createElement('canvas');
    this.animationItem.container.style.width = '100%';
    this.animationItem.container.style.height = '100%';
    this.animationItem.container.style.transformOrigin = this.animationItem.container.style.mozTransformOrigin = this.animationItem.container.style.webkitTransformOrigin = this.animationItem.container.style['-webkit-transform'] = "0px 0px 0px";
    this.animationItem.wrapper.appendChild(this.animationItem.container);
    this.layers = animData.animation.layers;
    this.canvasContext = this.animationItem.container.getContext('2d');
    this.transformCanvas = {};
    this.transformCanvas.w = animData.animation.compWidth;
    this.transformCanvas.h = animData.animation.compHeight;
    this.updateContainerSize();
};

CanvasRenderer.prototype.updateContainerSize = function () {
    var elementWidth = this.animationItem.wrapper.offsetWidth;
    var elementHeight = this.animationItem.wrapper.offsetHeight;
    this.animationItem.container.setAttribute('width',elementWidth);
    this.animationItem.container.setAttribute('height',elementHeight);
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
};

CanvasRenderer.prototype.buildStage = function (container, layers) {
    var i, len = layers.length, layerData;
    for (i = len - 1; i >= 0; i--) {
        layerData = layers[i];
        if (layerData.parent) {
            layerData.parentHierarchy = [];
            this.buildItemHierarchy(layerData, layers, layerData.parent);
        }
        if (layerData.type == 'PreCompLayer') {
            this.buildStage(null, layerData.layers);
        }
    }
};

CanvasRenderer.prototype.buildItemHierarchy = function (threeItem, layers, parentName) {
    var i = 0, len = layers.length;
    while (i < len) {
        if (layers[i].layerName == parentName) {
            threeItem.parentHierarchy.push(layers[i]);
            if (layers[i].parent == undefined) {
            } else {
                this.buildItemHierarchy(threeItem, layers, layers[i].parent);
            }
            break;
        }
        i += 1;
    }
};

CanvasRenderer.prototype.prepareFrame = function(num){
    var i, len = this.layers.length;
    for (i = 0; i < len; i++) {
        this.layers[i].element.prepareFrame(num - this.layers[i].startTime);
    }
};

CanvasRenderer.prototype.draw = function(){
    var i, len = this.layers.length;
    for (i = len - 1; i >= 0; i-=1) {
        this.layers[i].element.draw();
    }
};

CanvasRenderer.prototype.renderFrame = function(num){
    if(this.lastFrame == num){
        return;
    }
    console.log('nummm: ',num);
    this.lastFrame = num;
    /*this.canvasContext.fillStyle= colorFlag ? colors[0] : colors[1];
    colorFlag = !colorFlag;
    this.canvasContext.fillRect(0,0,this.animationItem.container.width,this.animationItem.container.height);*/
    this.animationItem.container.width = this.animationItem.container.width;
    this.canvasContext.transform(this.transformCanvas.sx,0,0,this.transformCanvas.sy,this.transformCanvas.tx,this.transformCanvas.ty);
    this.canvasContext.beginPath();
    this.canvasContext.rect(0,0,this.transformCanvas.w,this.transformCanvas.h);
    this.canvasContext.clip();
    this.prepareFrame(num);
    this.draw();
};