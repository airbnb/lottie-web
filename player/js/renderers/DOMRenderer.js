function DOMRenderer(animationItem){
    this.animationItem = animationItem;
    this.layers = null;
    this.camera = null;
}

DOMRenderer.prototype.buildItems = function(layers){
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
        } else{
            this.createBase(layers[i]);
            //console.log('NO TYPE: ',layers[i]);
        }
    }
};

DOMRenderer.prototype.createBase = function (data) {
    data.element = new DBaseElement(data, this);
};

DOMRenderer.prototype.createShape = function (data) {
    data.element = new DShapeElement(data, this.animationItem);
};

DOMRenderer.prototype.createText = function (data) {
    data.element = new DTextElement(data, this.animationItem);
};

DOMRenderer.prototype.createImage = function (data) {
    data.element = new DImageElement(data, this.animationItem);
};

DOMRenderer.prototype.createComp = function (data) {
    data.element = new DCompElement(data, this.animationItem);
    if(data.threeDComp){
        this.buildItems(data.layers);
    }
};

DOMRenderer.prototype.createSolid = function (data) {
    data.element = new DSolidElement(data, this.animationItem);
};

DOMRenderer.prototype.configAnimation = function(animData){
    this.layers = animData.animation.layers;
    var i = 0, len = this.layers.length;
    while(i<len){
        if(this.layers[i].type == 'CameraLayer'){
            this.camera = this.layers[i];
            break;
        }
        i += 1;
    }
    this.animationItem.wrapper.style.overflow = 'hidden';
    this.animationItem.wrapper.style.perspective = this.camera.pe+'px';
    this.animationItem.wrapper.style.transformStyle = this.animationItem.wrapper.style.webkitTransformStyle = "preserve-3d";
    this.animationItem.wrapper.style.transformOrigin = this.animationItem.wrapper.style.mozTransformOrigin = this.animationItem.wrapper.style.webkitTransformOrigin = this.animationItem.wrapper.style['-webkit-transform'] = "0 0 0";
    this.animationItem.container = document.createElement('div');
    this.animationItem.container.style.transformOrigin = this.animationItem.container.style.mozTransformOrigin = this.animationItem.container.style.webkitTransformOrigin = this.animationItem.container.style['-webkit-transform'] = "450px 275px "+this.camera.pe+"px";
    this.animationItem.container.style.transformStyle = this.animationItem.container.style.webkitTransformStyle = "preserve-3d";
    this.animationItem.container.style.transform = 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)';
    this.animationItem.container.style.position = 'absolute';
    this.animationItem.container.style.backfaceVisibility  = this.animationItem.container.style.webkitBackfaceVisibility = 'hidden';
    this.animationItem.container.style.top = 0;
    this.animationItem.container.style.left = 0;
    this.animationItem.wrapper.appendChild(this.animationItem.container);
};

DOMRenderer.prototype.buildStage = function (container, layers) {
    var i, len = layers.length, layerData;
    for (i = len - 1; i >= 0; i--) {
        layerData = layers[i];
        if (layerData.parent) {
            layerData.parentHierarchy = [];
            this.buildItemHierarchy(layerData, layers, layerData.parent);
        }
        if (layerData.type == 'PreCompLayer' && layerData.threeDComp) {
            this.buildStage(layerData.element.getComposingElement(), layerData.layers);
        }
        container.appendChild(layerData.element.mainElement);
    }
};

DOMRenderer.prototype.buildItemHierarchy = function (threeItem, layers, parentName) {
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

DOMRenderer.prototype.updateContainerSize = function () {
};

DOMRenderer.prototype.renderCamera = function(num){
    //this.camera.prepareFrame(num - this.camera.startTime);
    this.animationItem.container.style.transform = this.camera.element.currentAnimData.cameraValue;
};

DOMRenderer.prototype.renderFrame = function(num){
    var i, len = this.layers.length;
    for (i = 0; i < len; i++) {
        this.layers[i].element.prepareFrame(num - this.layers[i].startTime);
    }
    for (i = 0; i < len; i++) {
        this.layers[i].element.renderFrame(num - this.layers[i].startTime);
    }
    this.renderCamera(num);
};