function SVGRenderer(animationItem, config){
    this.animationItem = animationItem;
    this.layers = null;
    this.renderedFrame = -1;
    this.globalData = {
        frameNum: -1
    };
    this.renderConfig = {
        preserveAspectRatio: (config && config.preserveAspectRatio) || 'xMidYMid meet',
        progressiveLoad: (config && config.progressiveLoad) || false
    };
    this.elements = [];
    this.destroyed = false;
}

SVGRenderer.prototype.createItem = function(layer,parentContainer,comp, placeholder){
    switch(layer.ty){
        case 2:
            return this.createImage(layer,parentContainer,comp, placeholder);
        case 0:
            return this.createComp(layer,parentContainer,comp, placeholder);
        case 1:
            return this.createSolid(layer,parentContainer,comp, placeholder);
        case 4:
            return this.createShape(layer,parentContainer,comp, placeholder);
        case 5:
            return this.createText(layer,parentContainer,comp, placeholder);
        case 99:
            return this.createPlaceHolder(layer,parentContainer);
    }
    return this.createBase(layer,parentContainer,comp);
};

SVGRenderer.prototype.includeLayers = BaseRenderer.prototype.includeLayers;

SVGRenderer.prototype.createBase = function (data,parentContainer,comp, placeholder) {
    return new SVGBaseElement(data, parentContainer,this.globalData,comp, placeholder);
};

SVGRenderer.prototype.createPlaceHolder = function (data,parentContainer) {
    return new PlaceHolderElement(data, parentContainer,this.globalData);
};

SVGRenderer.prototype.createShape = function (data,parentContainer,comp, placeholder) {
    return new IShapeElement(data, parentContainer,this.globalData,comp, placeholder);
};

SVGRenderer.prototype.createText = function (data,parentContainer,comp, placeholder) {
    return new SVGTextElement(data, parentContainer,this.globalData,comp, placeholder);

};

SVGRenderer.prototype.createImage = function (data,parentContainer,comp, placeholder) {
    return new IImageElement(data, parentContainer,this.globalData,comp, placeholder);
};

SVGRenderer.prototype.createComp = function (data,parentContainer,comp, placeholder) {
    return new ICompElement(data, parentContainer,this.globalData,comp, placeholder);

};

SVGRenderer.prototype.createSolid = function (data,parentContainer,comp, placeholder) {
    return new ISolidElement(data, parentContainer,this.globalData,comp, placeholder);
};

SVGRenderer.prototype.configAnimation = function(animData){
    this.layerElement = document.createElementNS(svgNS,'svg');
    this.layerElement.setAttribute('xmlns','http://www.w3.org/2000/svg');
    this.layerElement.setAttribute('width',animData.w);
    this.layerElement.setAttribute('height',animData.h);
    this.layerElement.setAttribute('viewBox','0 0 '+animData.w+' '+animData.h);
    this.layerElement.setAttribute('preserveAspectRatio',this.renderConfig.preserveAspectRatio);
    this.layerElement.style.width = '100%';
    this.layerElement.style.height = '100%';
    this.layerElement.style.transform = 'translate3d(0,0,0)';
    this.layerElement.style.transformOrigin = this.layerElement.style.mozTransformOrigin = this.layerElement.style.webkitTransformOrigin = this.layerElement.style['-webkit-transform'] = "0px 0px 0px";
    this.animationItem.wrapper.appendChild(this.layerElement);
    //Mask animation
    var defs = document.createElementNS(svgNS, 'defs');
    this.globalData.defs = defs;
    this.layerElement.appendChild(defs);
    this.globalData.getAssetData = this.animationItem.getAssetData.bind(this.animationItem);
    this.globalData.getAssetsPath = this.animationItem.getAssetsPath.bind(this.animationItem);
    this.globalData.progressiveLoad = this.renderConfig.progressiveLoad;
    this.globalData.frameId = 0;
    this.globalData.compSize = {
        w: animData.w,
        h: animData.h
    };
    this.globalData.frameRate = animData.fr;
    var maskElement = document.createElementNS(svgNS, 'clipPath');
    var rect = document.createElementNS(svgNS,'rect');
    rect.setAttribute('width',animData.w);
    rect.setAttribute('height',animData.h);
    rect.setAttribute('x',0);
    rect.setAttribute('y',0);
    var maskId = 'animationMask_'+randomString(10);
    maskElement.setAttribute('id', maskId);
    maskElement.appendChild(rect);
    var maskedElement = document.createElementNS(svgNS,'g');
    maskedElement.setAttribute("clip-path", "url(#"+maskId+")");
    this.layerElement.appendChild(maskedElement);
    defs.appendChild(maskElement);
    this.layerElement = maskedElement;
    this.layers = animData.layers;
    this.globalData.fontManager = new FontManager();
    this.globalData.fontManager.addChars(animData.chars);
    this.globalData.fontManager.addFonts(animData.fonts,defs);
    this.elements = Array.apply(null,{length:animData.layers.length});
};

SVGRenderer.prototype.buildElementParenting = BaseRenderer.prototype.buildElementParenting;

SVGRenderer.prototype.destroy = function () {
    this.animationItem.wrapper.innerHTML = '';
    this.layerElement = null;
    this.globalData.defs = null;
    var i, len = this.layers ? this.layers.length : 0;
    for (i = 0; i < len; i++) {
        this.elements[i].destroy();
    }
    this.elements.length = 0;
    this.destroyed = true;
};

SVGRenderer.prototype.updateContainerSize = function () {
};

SVGRenderer.prototype.buildItem  = function(pos){
    var elements = this.elements;
    if(elements[pos]){
        return;
    }
    var element = this.createItem(this.layers[pos],this.layerElement,this);
    elements[pos] = element;
    element.initExpressions();
    this.appendElementInPos(element,pos);
    if(this.layers[pos].tt){
        this.buildItem(pos - 1);
        element.setMatte(elements[pos - 1].layerId);
    }
};

SVGRenderer.prototype.renderFrame = function(num){
    if(this.renderedFrame == num || this.destroyed){
        return;
    }
    if(num === null){
        num = this.renderedFrame;
    }else{
        this.renderedFrame = num;
    }
    /*console.log('-------');
    console.log('FRAME ',num);*/
    this.globalData.frameNum = num;
    this.globalData.frameId += 1;
    this.globalData.projectInterface.currentFrame = num;
    var i, len = this.layers.length;
    for (i = len - 1; i >= 0; i--) {
        if(!this.elements[i]){
            this.checkLayer(i, num - this.layers[i].st, this.layerElement);
        }
        if(this.elements[i]){
            this.elements[i].prepareFrame(num - this.layers[i].st);
        }
    }
    for (i = len - 1; i >= 0; i--) {
        if(this.elements[i]){
            this.elements[i].renderFrame();
        }
    }
};

SVGRenderer.prototype.appendElementInPos = function(element, pos){
    var newElement = element.getBaseElement();
    if(!newElement){
        return;
    }
    var i = 0;
    var nextElement;
    while(i<pos){
        if(this.elements[i] && this.elements[i].getBaseElement()){
            nextElement = this.elements[i].getBaseElement();
        }
        i += 1;
    }
    if(nextElement){
        this.layerElement.insertBefore(newElement, nextElement);
    } else {
        this.layerElement.appendChild(newElement);
    }
}

SVGRenderer.prototype.checkLayer = BaseRenderer.prototype.checkLayer;
SVGRenderer.prototype.buildAllItems = BaseRenderer.prototype.buildAllItems;
SVGRenderer.prototype.initItems =  BaseRenderer.prototype.initItems;

SVGRenderer.prototype.hide = function(){
    this.layerElement.style.display = 'none';
};

SVGRenderer.prototype.show = function(){
    this.layerElement.style.display = 'block';
};

SVGRenderer.prototype.setProjectInterface = BaseRenderer.prototype.setProjectInterface;

SVGRenderer.prototype.searchExtraCompositions = function(assets){
    var i, len = assets.length;
    var floatingContainer = document.createElementNS(svgNS,'g');
    for(i=0;i<len;i+=1){
        if(assets[i].xt){
            var comp = this.createComp(assets[i],floatingContainer,this.globalData.comp,null);
            comp.initExpressions();
            //comp.compInterface = CompExpressionInterface(comp);
            //Expressions.addLayersInterface(comp.elements, this.globalData.projectInterface);
            this.globalData.projectInterface.registerComposition(comp);
        }
    }
};
