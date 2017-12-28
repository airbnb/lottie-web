function CVBaseElement(data, comp, globalData){
}

CVBaseElement.prototype.createElements = function(){
    this.checkParenting();
};

CVBaseElement.prototype.initRendererElement = function(){

};
CVBaseElement.prototype.createContainerElements = function(){
    this.canvasContext = this.globalData.canvasContext;
    this.renderableEffectsManager = new CVEffects(this);
};
CVBaseElement.prototype.createContent = function(){};

CVBaseElement.prototype.setBlendMode = function(){
    var globalData = this.globalData;
    if(globalData.blendMode !== this.data.bm) {
        globalData.blendMode = this.data.bm;
        var blendModeValue = this.getBlendMode();
        globalData.canvasContext.globalCompositeOperation = blendModeValue;
    }
};

CVBaseElement.prototype.addMasks = function(){
    this.maskManager = new CVMaskElement(this.data, this, this.dynamicProperties);
};

CVBaseElement.prototype.hideElement = function(){
    if (!this.hidden && (!this.isInRange || this.isTransparent)) {
        this.hidden = true;
    }
};

CVBaseElement.prototype.showElement = function(){
    if (this.isInRange && !this.isTransparent){
        this.hidden = false;
        this.firstFrame = true;
        this.maskManager.firstFrame = true;
    }
};

CVBaseElement.prototype.renderFrame = function() {
    if (this.hidden) {
        return;
    }
    this.renderTransform();
    this.renderRenderable();
    this.setBlendMode();
    this.globalData.renderer.save();
    this.globalData.renderer.ctxTransform(this.finalTransform.mat.props);
    this.globalData.renderer.ctxOpacity(this.finalTransform.mProp.o.v);
    this.renderInnerContent();
    this.globalData.renderer.restore();
    if(this.maskManager.hasMasks) {
        this.globalData.renderer.restore(true);
    }
    if (this.firstFrame) {
        this.firstFrame = false;
    }
};

CVBaseElement.prototype.hide = CVBaseElement.prototype.hideElement;
CVBaseElement.prototype.show = CVBaseElement.prototype.showElement;

CVBaseElement.prototype.destroy = function(){
    this.canvasContext = null;
    this.data = null;
    this.globalData = null;
    this.maskManager.destroy();
};

CVBaseElement.prototype.mHelper = new Matrix();
