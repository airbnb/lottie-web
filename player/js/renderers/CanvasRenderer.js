function CanvasRenderer(animationItem){
    this.animationItem = animationItem;
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
    data.element = new CVShapeElement(data, this.animationItem);
};

CanvasRenderer.prototype.createText = function (data) {
    data.element = new CVTextElement(data, this.animationItem);
};

CanvasRenderer.prototype.createImage = function (data) {
    data.element = new CVImageElement(data, this.animationItem);
};

CanvasRenderer.prototype.createComp = function (data) {
    data.element = new CVCompElement(data, this.animationItem);
    this.buildItems(data.layers, data.element.getType());
};

CanvasRenderer.prototype.createSolid = function (data) {
    data.element = new CVSolidElement(data, this.animationItem);
};

CanvasRenderer.prototype.configAnimation = function(animData){
    this.animationItem.container = document.createElement('canvas');
    this.animationItem.container.setAttribute('width',animData.animation.compWidth);
    this.animationItem.container.setAttribute('height',animData.animation.compHeight);
    this.animationItem.container.style.width = '100%';
    this.animationItem.container.style.height = '100%';
    this.animationItem.container.style.transformOrigin = this.animationItem.container.style.mozTransformOrigin = this.animationItem.container.style.webkitTransformOrigin = this.animationItem.container.style['-webkit-transform'] = "0px 0px 0px";
    this.animationItem.wrapper.appendChild(this.animationItem.container);
    this.layers = animData.animation.layers;
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
    for (i = 0; i < len; i++) {
        this.layers[i].element.draw();
    }
};

CanvasRenderer.prototype.renderFrame = function(num){
    this.prepareFrame(num);
    this.draw();
};