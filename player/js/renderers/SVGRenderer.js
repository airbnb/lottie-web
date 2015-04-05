function SVGRenderer(animationItem){
    this.animationItem = animationItem;
    this.layers = null;
    this.lastFrame = -1;
}

SVGRenderer.prototype.buildItems = function(layers){
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

SVGRenderer.prototype.createShape = function (data) {
    data.element = new IShapeElement(data, this.animationItem);
};

SVGRenderer.prototype.createText = function (data) {
    data.element = new ITextElement(data, this.animationItem);
};

SVGRenderer.prototype.createImage = function (data) {
    data.element = new IImageElement(data, this.animationItem);
};

SVGRenderer.prototype.createComp = function (data) {
    data.element = new ICompElement(data, this.animationItem);
    this.buildItems(data.layers, data.element.getType());
};

SVGRenderer.prototype.createSolid = function (data) {
    data.element = new ISolidElement(data, this.animationItem);
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
    var defs = document.createElementNS(svgNS, 'defs');
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
    this.animationItem.container = maskedElement;
    this.layers = animData.animation.layers;
};

SVGRenderer.prototype.buildStage = function (container, layers) {
    var i, len = layers.length, layerData;
    for (i = len - 1; i >= 0; i--) {
        layerData = layers[i];
        if (layerData.parent) {
            var mainContainer = this.buildItemHierarchy(layerData.element.getDomElement(), layerData.layerName, layerData.parent, layers, container);
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

SVGRenderer.prototype.buildItemHierarchy = function (threeItem, layerName, parentName, layers, container) {
    var i = 0, len = layers.length;
    while (i < len) {
        if (layers[i].layerName == parentName) {
            if (!layers[i].relateds) {
                layers[i].relateds = [];
            }
            var div, itemCont;
            div = document.createElementNS(svgNS, 'g');
            itemCont = document.createElementNS(svgNS, 'g');
            layers[i].relateds.push({item:div, itemCont:itemCont});
            div.appendChild(threeItem);
            itemCont.appendChild(div);
            if (layers[i].parent == undefined) {
            } else {
                return this.buildItemHierarchy(itemCont, layerName, layers[i].parent, layers, container);
            }
            return itemCont;
        }
        i += 1;
    }
    return null;
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
        this.layers[i].element.renderFrame(num - this.layers[i].startTime);
    }
}