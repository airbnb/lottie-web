function SVGRenderer(animationItem){
    this.animationItem = animationItem;
    this.layers = null;
    this.lastFrame = -1;
}

SVGRenderer.prototype.buildItems = function(layers,parentContainer){
    var count = 0, i, len = layers.length;
    for (i = len - 1; i >= 0; i--) {
        if (layers[i].type == 'StillLayer') {
            count++;
            this.createImage(layers[i],parentContainer);
        } else if (layers[i].type == 'PreCompLayer') {
            this.createComp(layers[i],parentContainer);
        } else if (layers[i].type == 'SolidLayer') {
            this.createSolid(layers[i],parentContainer);
        } else if (layers[i].type == 'ShapeLayer') {
            this.createShape(layers[i],parentContainer);
        } else if (layers[i].type == 'TextLayer') {
            this.createText(layers[i],parentContainer);
        }else{
            console.log('NO TYPE: ',layers[i]);
        }
    }
};

SVGRenderer.prototype.createShape = function (data,parentContainer) {
    data.element = new IShapeElement(data, this.animationItem,parentContainer);
};

SVGRenderer.prototype.createText = function (data,parentContainer) {
    data.element = new ITextElement(data, this.animationItem,parentContainer);
};

SVGRenderer.prototype.createImage = function (data,parentContainer) {
    data.element = new IImageElement(data, this.animationItem,parentContainer);
};

SVGRenderer.prototype.createComp = function (data,parentContainer) {
    data.element = new ICompElement(data, this.animationItem,parentContainer);
    this.buildItems(data.layers,data.element.getDomElement());
};

SVGRenderer.prototype.createSolid = function (data,parentContainer) {
    data.element = new ISolidElement(data, this.animationItem,parentContainer);
};

SVGRenderer.prototype.configAnimation = function(animData){
    this.animationItem.container = document.createElementNS(svgNS,'svg');
    this.animationItem.container.setAttribute('xmlns','http://www.w3.org/2000/svg');
    this.animationItem.container.setAttribute('width',animData.animation.compWidth);
    this.animationItem.container.setAttribute('height',animData.animation.compHeight);
    this.animationItem.container.setAttribute('viewBox','0 0 '+animData.animation.compWidth+' '+animData.animation.compHeight);
    this.animationItem.container.setAttribute('preserveAspectRatio','xMidYMid meet');
    this.animationItem.container.style.width = '100%';
    this.animationItem.container.style.height = '100%';
    this.animationItem.container.style.transformOrigin = this.animationItem.container.style.mozTransformOrigin = this.animationItem.container.style.webkitTransformOrigin = this.animationItem.container.style['-webkit-transform'] = "0px 0px 0px";
    this.animationItem.wrapper.appendChild(this.animationItem.container);
    //Mask animation
    /*var defs = document.createElementNS(svgNS, 'defs');
    this.animationItem.container.appendChild(defs);
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
    this.animationItem.container.appendChild(maskedElement);
    defs.appendChild(maskElement);
    this.animationItem.container = maskedElement;*/
    this.layers = animData.animation.layers;
};

SVGRenderer.prototype.buildStage = function (container, layers) {
    var i, len = layers.length, layerData,mainContainer;
    for (i = len - 1; i >= 0; i--) {
        layerData = layers[i];
        if (layerData.parent) {
            this.buildItemParenting(layerData,layers,layerData.parent);
            mainContainer = layerData.element.getDomElement();
            if(container != mainContainer){
                mainContainer.setAttribute("data-layer-name", layerData.layerName);
                container.appendChild(mainContainer);
            }
            layerData.element.setMainElement(mainContainer);
        } else {
            mainContainer = layerData.element.getDomElement();
            if(container != mainContainer){
                mainContainer.setAttribute("data-layer-name", layerData.layerName);
                container.appendChild(mainContainer);
            }
            layerData.element.setMainElement(mainContainer);
        }
        if (layerData.type == 'PreCompLayer') {
            this.buildStage(layerData.element.getComposingElement(), layerData.layers, layerData.element.getType());
        }
    }
};
SVGRenderer.prototype.buildItemParenting = function (layerData,layers,parentName) {
    if(!layerData.parents){
        layerData.parents = [];
    }
    var i = 0, len = layers.length;
    while(i<len){
        if (layers[i].layerName == parentName) {
            layerData.parents.push({elem:layers[i]});
            if(layers[i].parent){
                this.buildItemParenting(layerData,layers,layers[i].parent);
            }
            break;
        }
        i += 1;
    }
};

SVGRenderer.prototype.updateContainerSize = function () {
};

SVGRenderer.prototype.renderFrame = function(num){
    if(this.lastFrame == num){
        return;
    }
    this.lastFrame = num;
    var i, len = this.layers.length;
    for (i = 0; i < len; i++) {
        this.layers[i].element.prepareFrame(num - this.layers[i].startTime);
    }
    for (i = 0; i < len; i++) {
        this.layers[i].element.renderFrame(num - this.layers[i].startTime);
    }
};