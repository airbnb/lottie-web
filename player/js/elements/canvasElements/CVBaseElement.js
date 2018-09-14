function CVBaseElement(){
}

CVBaseElement.prototype = {
    createElements: function(){},
    initRendererElement: function(){},
    createContainerElements: function(){
        this.canvasContext = this.globalData.canvasContext;
        this.renderableEffectsManager = new CVEffects(this);
    },
    createContent: function(){},
    setBlendMode: function(){
        var globalData = this.globalData;
        if(globalData.blendMode !== this.data.bm) {
            globalData.blendMode = this.data.bm;
            var blendModeValue = this.getBlendMode();
            globalData.canvasContext.globalCompositeOperation = blendModeValue;
        }
    },
    createRenderableComponents: function(){
        this.maskManager = new CVMaskElement(this.data, this);
    },
    hideElement: function(){
        if (!this.hidden && (!this.isInRange || this.isTransparent)) {
            this.hidden = true;
        }
    },
    showElement: function(){
        if (this.isInRange && !this.isTransparent){
            this.hidden = false;
            this._isFirstFrame = true;
            this.maskManager._isFirstFrame = true;
        }
    },
    renderFrame: function() {
        if (this.hidden || this.data.hd) {
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
        if (this._isFirstFrame) {
            this._isFirstFrame = false;
        }
    },
    destroy: function(){
        this.canvasContext = null;
        this.data = null;
        this.globalData = null;
        this.maskManager.destroy();
    },
    mHelper: new Matrix()
};
CVBaseElement.prototype.hide = CVBaseElement.prototype.hideElement;
CVBaseElement.prototype.show = CVBaseElement.prototype.showElement;
