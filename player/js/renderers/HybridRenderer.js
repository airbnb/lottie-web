function HybridRenderer(animationItem){
    this.animationItem = animationItem;
    this.layers = null;
    this.renderedFrame = -1;
    this.globalData = {
        frameNum: -1
    };
    this.elements = [];
    this.destroyed = false;
}

HybridRenderer.prototype.createItem = function(layer,parentContainer,comp, placeholder){
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
        case 13:
            return this.createCamera(layer,parentContainer,comp, placeholder);
        case 99:
            return this.createPlaceHolder(layer,parentContainer);
    }
    return this.createBase(layer,parentContainer,comp);
};

HybridRenderer.prototype.buildItems = function(layers,parentContainer,elements,comp, placeholder){
    var  i, len = layers.length;
    if(!elements){
        elements = this.elements;
    }
    if(!parentContainer){
        parentContainer = this.animationItem.container;
    }
    if(!comp){
        comp = this;
    }
    var elems;
    for (i = len - 1; i >= 0; i--) {
        elements[i] = this.createItem(layers[i],parentContainer,comp, placeholder);
        if (layers[i].ty === 0) {
            elems = [];
            this.buildItems(layers[i].layers,elements[i].getDomElement(),elems,elements[i], elements[i].placeholder);
            elements[i].setElements(elems);
        }
        if(layers[i].td){
            elements[i+1].setMatte(elements[i].layerId);
        }
        //NullLayer
    }
};

HybridRenderer.prototype.includeLayers = function(layers,parentContainer,elements){
    var i, len = layers.length;
    if(!elements){
        elements = this.elements;
    }
    if(!parentContainer){
        parentContainer = this.animationItem.container;
    }
    var j, jLen = elements.length, elems, placeholder;
    for(i=0;i<len;i+=1){
        j = 0;
        while(j<jLen){
            if(elements[j].data.id == layers[i].id){
                placeholder = elements[j];
                elements[j] = this.createItem(layers[i],parentContainer,this, placeholder);
                if (layers[i].ty === 0) {
                    elems = [];
                    this.buildItems(layers[i].layers,elements[j].getDomElement(),elems,elements[j], elements[i].placeholder);
                    elements[j].setElements(elems);
                }
                break;
            }
            j += 1;
        }
    }
    for(i=0;i<len;i+=1){
        if(layers[i].td){
            elements[i+1].setMatte(elements[i].layerId);
        }
    }
};

HybridRenderer.prototype.createBase = function (data,parentContainer,comp, placeholder) {
    return new SVGBaseElement(data, parentContainer,this.globalData,comp, placeholder);
};

HybridRenderer.prototype.createPlaceHolder = function (data,parentContainer) {
    return new PlaceHolderElement(data, parentContainer,this.globalData);
};

HybridRenderer.prototype.createShape = function (data,parentContainer,comp, placeholder) {
    if(comp.isSvg){
        return new IShapeElement(data, parentContainer,this.globalData,comp, placeholder);
    }
    return new HShapeElement(data, parentContainer,this.globalData,comp, placeholder);
};

HybridRenderer.prototype.createText = function (data,parentContainer,comp, placeholder) {
    if(comp.isSvg){
        return new SVGTextElement(data, parentContainer,this.globalData,comp, placeholder);
    }
    return new HTextElement(data, parentContainer,this.globalData,comp, placeholder);
};

HybridRenderer.prototype.createCamera = function (data,parentContainer,comp, placeholder) {
    return new HCameraElement(data, parentContainer,this.globalData,comp, placeholder);
};

HybridRenderer.prototype.createImage = function (data,parentContainer,comp, placeholder) {
    if(comp.isSvg){
        return new IImageElement(data, parentContainer,this.globalData,comp, placeholder);
    }
    return new HImageElement(data, parentContainer,this.globalData,comp, placeholder);
};

HybridRenderer.prototype.createComp = function (data,parentContainer,comp, placeholder) {
    if(comp.isSvg){
        return new ICompElement(data, parentContainer,this.globalData,comp, placeholder);
    }
    return new HCompElement(data, parentContainer,this.globalData,comp, placeholder);

};

HybridRenderer.prototype.createSolid = function (data,parentContainer,comp, placeholder) {
    if(comp.isSvg){
        return new ISolidElement(data, parentContainer,this.globalData,comp, placeholder);
    }
    return new HSolidElement(data, parentContainer,this.globalData,comp, placeholder);
};

HybridRenderer.prototype.configAnimation = function(animData){
    var resizerElem = document.createElement('div');
    var container = document.createElement('div');
    var wrapper = this.animationItem.wrapper;
    container.style.width = animData.w+'px';
    container.style.height = animData.h+'px';
    resizerElem.style.width = animData.w+'px';
    resizerElem.style.height = animData.h+'px';
    container.style.transform = container.style.webkitTransform = 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)';
    styleDiv(container);
    this.animationItem.container = container;
    this.animationItem.resizerElem = resizerElem;
    resizerElem.appendChild(container);
    styleDiv(resizerElem);
    wrapper.appendChild(resizerElem);

    //resizerElem.style.overflow = 'hidden';
    var svg = document.createElementNS(svgNS,'svg');
    svg.setAttribute('width','1');
    svg.setAttribute('height','1');
    styleDiv(svg);
    this.animationItem.container.appendChild(svg);
    var defs = document.createElementNS(svgNS,'defs');
    svg.appendChild(defs);
    this.globalData.defs = defs;
    //Mask animation
    this.globalData.getAssetData = this.animationItem.getAssetData.bind(this.animationItem);
    this.globalData.getPath = this.animationItem.getPath.bind(this.animationItem);
    this.globalData.elementLoaded = this.animationItem.elementLoaded.bind(this.animationItem);
    this.globalData.frameId = 0;
    this.globalData.compSize = {
        w: animData.w,
        h: animData.h
    };
    this.globalData.frameRate = animData.fr;
    this.layers = animData.layers;
    this.globalData.fontManager = new FontManager();
    this.globalData.fontManager.addChars(animData.chars);
    this.globalData.fontManager.addFonts(animData.fonts,document);
    this.updateContainerSize();
};

HybridRenderer.prototype.buildStage = function (container, layers,elements) {
    var i, len = layers.length, layerData;
    if(!elements){
        elements = this.elements;
    }
    for (i = len - 1; i >= 0; i--) {
        layerData = layers[i];
        if (layerData.parent !== undefined) {
            this.buildItemParenting(layerData,elements[i],layers,layerData.parent,elements, true);
        }

        if (layerData.ty === 0) {
            this.buildStage(elements[i].getComposingElement(), layerData.layers, elements[i].getElements());
        }
    }
};
HybridRenderer.prototype.buildItemParenting = function (layerData,element,layers,parentName,elements, resetHierarchyFlag) {
    if(!layerData.parents){
        layerData.parents = [];
    }
    if(resetHierarchyFlag){
        element.resetHierarchy();
    }
    var i=0, len = layers.length;
    while(i<len){
        if(layers[i].ind == parentName){
            element.getHierarchy().push(elements[i]);
            if(layers[i].parent !== undefined){
                this.buildItemParenting(layerData,element,layers,layers[i].parent,elements, false);
            }
        }
        i += 1;
    }
};

HybridRenderer.prototype.destroy = function () {
    this.animationItem.wrapper.innerHTML = '';
    this.animationItem.container = null;
    this.globalData.defs = null;
    var i, len = this.layers.length;
    for (i = 0; i < len; i++) {
        this.elements[i].destroy();
    }
    this.elements.length = 0;
    this.destroyed = true;
};

HybridRenderer.prototype.updateContainerSize = function () {
    var elementWidth = this.animationItem.wrapper.offsetWidth;
    var elementHeight = this.animationItem.wrapper.offsetHeight;
    var elementRel = elementWidth/elementHeight;
    var animationRel = this.globalData.compSize.w/this.globalData.compSize.h;
    var sx,sy,tx,ty;
    if(animationRel>elementRel){
        sx = elementWidth/(this.globalData.compSize.w);
        sy = elementWidth/(this.globalData.compSize.w);
        tx = 0;
        ty = ((elementHeight-this.globalData.compSize.h*(elementWidth/this.globalData.compSize.w))/2);
    }else{
        sx = elementHeight/(this.globalData.compSize.h);
        sy = elementHeight/(this.globalData.compSize.h);
        tx = (elementWidth-this.globalData.compSize.w*(elementHeight/this.globalData.compSize.h))/2;
        ty = 0;
    }
    this.animationItem.resizerElem.style.transform = this.animationItem.resizerElem.style.webkitTransform = 'matrix3d(' + sx + ',0,0,0,0,'+sy+',0,0,0,0,1,0,'+tx+','+ty+',0,1)';
};

HybridRenderer.prototype.renderFrame = function(num){
    if(this.renderedFrame == num || this.destroyed){
        return;
    }
    if(num === null){
        num = this.renderedFrame;
    }else{
        this.renderedFrame = num;
    }
    //console.log('-------');
    //console.log('FRAME ',num);
    this.globalData.frameNum = num;
    this.globalData.frameId += 1;
    var i, len = this.layers.length;
    for (i = 0; i < len; i++) {
        this.elements[i].prepareFrame(num - this.layers[i].st);
    }
    for (i = 0; i < len; i++) {
        this.elements[i].renderFrame();
    }
};

extendPrototype(ExpressionComp,HybridRenderer);