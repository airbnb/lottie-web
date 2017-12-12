function CVCompElement(data, globalData, comp) {
    var compGlobalData = {};
    for(var s in globalData){
        if(globalData.hasOwnProperty(s)){
            compGlobalData[s] = globalData[s];
        }
    }
    compGlobalData.renderer = this;
    compGlobalData.compHeight = data.h;
    compGlobalData.compWidth = data.w;

    this.renderConfig = {
        clearCanvas: true,
        hideOnTransparent: true
    };
    compGlobalData.renderConfig = this.renderConfig;
    this.contextData = new CVContextData();
    this.completeLayers = false;
    this.transformMat = new Matrix();
    var cv = document.createElement('canvas');
    //document.body.appendChild(cv);
    compGlobalData.canvasContext = cv.getContext('2d');
    this.canvasContext = compGlobalData.canvasContext;
    cv.width = data.w;
    cv.height = data.h;
    this.canvas = cv;
    this.globalData = compGlobalData;
    this.layers = data.layers;
    this.pendingElements = [];
    this.elements = Array.apply(null,{length:this.layers.length});
    this.initElement(data,globalData,comp);
    this.parentGlobalData = this.globalData;
    this.tm = data.tm ? PropertyFactory.getProp(this,data.tm,0,globalData.frameRate,this.dynamicProperties) : {_placeholder:true};
}

extendPrototype2([BaseElement,TransformElement,CVBaseElement,HierarchyElement,FrameElement,RenderableElement], CVCompElement);

CVCompElement.prototype.initElement = ICompElement.prototype.initElement;

CVCompElement.prototype.ctxTransform = CanvasRenderer.prototype.ctxTransform;
CVCompElement.prototype.ctxOpacity = CanvasRenderer.prototype.ctxOpacity;
CVCompElement.prototype.save = CanvasRenderer.prototype.save;
CVCompElement.prototype.restore = CanvasRenderer.prototype.restore;
CVCompElement.prototype.reset =  function(){
    this.contextData.reset();
};
CVCompElement.prototype.resize = function(transformCanvas){
    var maxScale = Math.max(transformCanvas.sx,transformCanvas.sy);
    this.canvas.width = this.data.w*maxScale;
    this.canvas.height = this.data.h*maxScale;
    this.transformCanvas = {
        sc:maxScale,
        w:this.data.w*maxScale,
        h:this.data.h*maxScale,
        props:[maxScale,0,0,0,0,maxScale,0,0,0,0,1,0,0,0,0,1]
    }
    var i,len = this.elements.length;
    for( i = 0; i < len; i+=1 ){
        if(this.elements[i] && this.elements[i].data.ty === 0){
            this.elements[i].resize(transformCanvas);
        }
    }
};

CVCompElement.prototype.prepareFrame = function(num){
    this.prepareRenderableFrame(num);
    this.prepareProperties(num, this.isInRange);
    this.globalData.frameId = this.parentGlobalData.frameId;
    this.globalData.mdf = this.firstFrame;
    if(!this.isInRange && !this.data.xt){
        return;
    }

    //TODO check .sr value works
    if (!this.tm._placeholder) {
        var timeRemapped = this.tm.v;
        if(timeRemapped === this.data.op){
            timeRemapped = this.data.op - 1;
        }
        this.renderedFrame = timeRemapped;
    } else {
        this.renderedFrame = num/this.data.sr;
    }

    var i,len = this.elements.length;

    if(!this.completeLayers){
        this.checkLayers(num);
    }

    for (i = 0; i < len; i += 1 ) {
        if(this.completeLayers || this.elements[i]) {
            this.elements[i].prepareFrame(this.renderedFrame/this.data.sr - this.layers[i].st);
            if(this.elements[i].data.ty === 0 && this.elements[i].globalData.mdf){
                this.globalData.mdf = true;
            }
        }
    }
    if(this.globalData.mdf && !this.data.xt){
        this.canvasContext.clearRect(0, 0, this.data.w, this.data.h);
        this.ctxTransform(this.transformCanvas.props);
    }
};

CVCompElement.prototype.renderInnerContent = function() {
    if(this.globalData.mdf){
        var i,len = this.layers.length;
        for( i = len - 1; i >= 0; i -= 1 ){
            if(this.completeLayers || this.elements[i]){
                this.elements[i].renderFrame();
            }
        }
    }
    this.parentGlobalData.renderer.save();
    this.parentGlobalData.renderer.ctxTransform(this.finalTransform.mat.props);
    this.parentGlobalData.renderer.ctxOpacity(this.finalTransform.opacity);
    this.parentGlobalData.renderer.canvasContext.drawImage(this.canvas,0,0,this.data.w,this.data.h);
    this.parentGlobalData.renderer.restore();

    if(this.globalData.mdf){
        this.reset();
    }
};

CVCompElement.prototype.setElements = function(elems){
    this.elements = elems;
};

CVCompElement.prototype.getElements = function(){
    return this.elements;
};

CVCompElement.prototype.destroy = function(){
    var i,len = this.layers.length;
    for( i = len - 1; i >= 0; i -= 1 ){
        this.elements[i].destroy();
    }
    this.layers = null;
    this.elements = null;
    this._parent.destroy.call(this._parent);
};
CVCompElement.prototype.checkLayers = CanvasRenderer.prototype.checkLayers;
CVCompElement.prototype.buildItem = CanvasRenderer.prototype.buildItem;
CVCompElement.prototype.checkPendingElements = CanvasRenderer.prototype.checkPendingElements;
CVCompElement.prototype.addPendingElement = CanvasRenderer.prototype.addPendingElement;
CVCompElement.prototype.createContent = CanvasRenderer.prototype.buildAllItems;
CVCompElement.prototype.createItem = CanvasRenderer.prototype.createItem;
CVCompElement.prototype.createImage = CanvasRenderer.prototype.createImage;
CVCompElement.prototype.createComp = CanvasRenderer.prototype.createComp;
CVCompElement.prototype.createSolid = CanvasRenderer.prototype.createSolid;
CVCompElement.prototype.createShape = CanvasRenderer.prototype.createShape;
CVCompElement.prototype.createText = CanvasRenderer.prototype.createText;
CVCompElement.prototype.createBase = CanvasRenderer.prototype.createBase;
CVCompElement.prototype.buildElementParenting = CanvasRenderer.prototype.buildElementParenting;