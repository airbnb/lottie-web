function CVCompElement(data, globalData, comp) {
    this.transformingRenderer = globalData.renderer;
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
    this.initElement(data,this.globalData,comp);
    this.parentGlobalData = globalData;
    this.tm = data.tm ? PropertyFactory.getProp(this,data.tm,0,globalData.frameRate,this.dynamicProperties) : {_placeholder:true};
}

extendPrototype2([CanvasRenderer, BaseElement,TransformElement,CVBaseElement,HierarchyElement,FrameElement,RenderableElement], CVCompElement);
CVCompElement.prototype.prepareRootCompFrame = ICompElement.prototype.prepareFrame;
CVCompElement.prototype.initElement = ICompElement.prototype.initElement;

CVCompElement.prototype.resize = function(transformCanvas){
    this.reset();
    var maxScale = Math.max(transformCanvas.sx,transformCanvas.sy);
    this.canvas.width = this.data.w*maxScale;
    this.canvas.height = this.data.h*maxScale;
    this.transformCanvas = {
        sc:maxScale,
        w:this.data.w*maxScale,
        h:this.data.h*maxScale,
        props:[maxScale,0,0,0,0,maxScale,0,0,0,0,1,0,0,0,0,1]
    }
    this.ctxTransform(this.transformCanvas.props);
    var i,len = this.elements.length;
    for (i = 0; i < len; i += 1) {
        if (this.elements[i] && this.elements[i].data.ty === 0) {
            this.elements[i].resize(transformCanvas);
        }
    }
    this.firstFrame = true;
};

CVCompElement.prototype.prepareFrame = function(num){
    this.globalData.frameId = this.parentGlobalData.frameId;
    this.globalData.mdf = this.firstFrame;
    this.prepareRootCompFrame(num);
};

CVCompElement.prototype.renderInnerContent = function() {
    if(this.globalData.mdf){
        if(!this.data.xt) {
            this.canvasContext.clearRect(0, 0, this.data.w, this.data.h);
        }
        var i,len = this.layers.length;
        for( i = len - 1; i >= 0; i -= 1 ){
            if(this.completeLayers || this.elements[i]){
                this.elements[i].renderFrame();
            }
        }
    }
    // this.parentGlobalData.renderer.save();
    // this.parentGlobalData.renderer.ctxTransform(this.finalTransform.mat.props);
    // this.parentGlobalData.renderer.ctxOpacity(this.finalTransform.mProp.o.v);
    this.parentGlobalData.renderer.canvasContext.drawImage(this.canvas,0,0,this.data.w,this.data.h);
    // this.parentGlobalData.renderer.restore();

    /*if(this.globalData.mdf){
        this.reset();
    }*/
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
};