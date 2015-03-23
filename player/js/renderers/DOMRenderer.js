function DOMRenderer(animationItem){
    this.animationItem = animationItem;
    this.layers = null;
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
        }else{
            console.log('NO TYPE: ',layers[i]);
        }
    }
}

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
    this.buildItems(data.layers, data.element.getType());
};

DOMRenderer.prototype.createSolid = function (data) {
    data.element = new DSolidElement(data, this.animationItem);
};

DOMRenderer.prototype.configAnimation = function(animData){
    this.animationItem.container = document.createElement('div');
    this.animationItem.container.style.width = '100%';
    this.animationItem.container.style.height = '100%';
    this.animationItem.container.style.perspective = Math.sqrt(Math.pow(animData.animation.compWidth,2)+Math.pow(animData.animation.compHeight,2))+'px';
    this.animationItem.container.style.transformOrigin = this.animationItem.container.style.mozTransformOrigin = this.animationItem.container.style.webkitTransformOrigin = this.animationItem.container.style['-webkit-transform'] = "0px 0px 0px";
    this.animationItem.container.style.transformStyle = this.animationItem.container.style.webkitTransformStyle = "preserve-3d";
    this.animationItem.wrapper.appendChild(this.animationItem.container);
    this.layers = animData.animation.layers;
};

DOMRenderer.prototype.buildStage = function (container, layers) {
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
        console.log('this.animationItem.container: ',this.animationItem.container);
        console.log('layerData.mainElement: ',layerData);
        this.animationItem.container.appendChild(layerData.element.mainElement);
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

DOMRenderer.prototype.renderFrame = function(num){
    var i, len = this.layers.length;
    for (i = 0; i < len; i++) {
        this.layers[i].element.renderFrame(num - this.layers[i].startTime);
    }
}