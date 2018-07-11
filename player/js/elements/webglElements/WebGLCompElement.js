function WCompElement(data, globalData, comp) {
    this.completeLayers = false;
    this.layers = data.layers;
    this.pendingElements = [];
    this.elements = createSizedArray(this.layers.length);
    this.initElement(data, globalData, comp);
    this.tm = data.tm ? PropertyFactory.getProp(this,data.tm,0,globalData.frameRate, this) : {_placeholder:true};
}

extendPrototype([WebGLRenderer, ICompElement, WebGLBaseElement], WCompElement);

WCompElement.prototype.initRendererElement = function() {
    this.createFramebuffers(this.globalData.canvasContext, this.data.w, this.data.h);
}


WCompElement.prototype.renderInnerContent = function() {
    this.globalData.pushTransform(this.finalTransform.mat);

    var i,len = this.layers.length;
    for( i = len - 1; i >= 0; i -= 1 ){
        if(this.completeLayers || this.elements[i]){
            this.elements[i].renderFrame();
        }
    }
    this.globalData.popTransform();
};

WCompElement.prototype.destroy = function(){
    var i,len = this.layers.length;
    for( i = len - 1; i >= 0; i -= 1 ){
        if(this.elements[i]) {
            this.elements[i].destroy();
        }
    }
    this.layers = null;
    this.elements = null;
};