function CVBaseElement(data, comp,globalData){
}

CVBaseElement.prototype.createElements = function(){
    this.checkParenting();
};

CVBaseElement.prototype.initRendererElement = function(){

};
CVBaseElement.prototype.createContainerElements = function(){
    this.canvasContext = this.globalData.canvasContext;
    this.effectsManager = new CVEffects(this);
};
CVBaseElement.prototype.createContent = function(){};

CVBaseElement.prototype.setBlendMode = function(){
    var globalData = this.data.ty === 0 ? this.parentGlobalData : this.globalData;
    if(globalData.blendMode !== this.data.bm) {
        globalData.blendMode = this.data.bm;
        var blendModeValue = this.getBlendMode();
        globalData.canvasContext.globalCompositeOperation = blendModeValue;
    }
};


CVBaseElement.prototype.renderFrame = function(parentTransform){

    //TODO this should be removed. First check why the renderer.save method is called.
    if(this.data.hasMask){
        this.globalData.renderer.save(true);
        this.maskManager.renderFrame(this.data.ty === 0?null:finalMat);
    }

};

CVBaseElement.prototype.addMasks = function(){
    this.maskManager = new CVMaskElement(this.data, this, this.globalData);
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

CVBaseElement.prototype.hide = CVBaseElement.prototype.hideElement;
CVBaseElement.prototype.show = CVBaseElement.prototype.showElement;

CVBaseElement.prototype.destroy = function(){
    this.canvasContext = null;
    this.data = null;
    this.globalData = null;
    this.maskManager.destroy();
};

CVBaseElement.prototype.mHelper = new Matrix();
