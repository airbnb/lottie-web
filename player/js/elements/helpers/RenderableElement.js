function RenderableElement(){

}

RenderableElement.prototype.initRenderable = function() {
	//layer's visibility related to inpoint and outpoint. Rename isVisible to isInRange
	this.isInRange = false;
	//layer's display state
	this.hidden = false;
    // If layer's transparency equals 0, it can be hidden
    this.isTransparent = false;
}

RenderableElement.prototype.prepareRenderableFrame = function(num) {
	this.checkLayerLimits(num);
    if(this.finalTransform.mProp.o.v <= 0) {
        if(!this.isTransparent && this.globalData.renderConfig.hideOnTransparent){
            this.isTransparent = true;
            this.hide();
        }
    } else if(this.isTransparent) {
        this.isTransparent = false;
        this.show();
    }
}

/**
 * @function 
 * Initializes frame related properties.
 *
 * @param {number} num
 * current frame number in Layer's time
 * 
 */

RenderableElement.prototype.checkLayerLimits = function(num) {
	if(this.data.ip - this.data.st <= num && this.data.op - this.data.st > num)
    {
        if(this.isInRange !== true){
            this.globalData._mdf = true;
            this._mdf = true;
            this.isInRange = true;
            this.show();
        }
    } else {
        if(this.isInRange !== false){
            this.globalData._mdf = true;
            this.isInRange = false;
            this.hide();
        }
    }
}

RenderableElement.prototype.renderRenderable = function() {
    this.maskManager.renderFrame(this.finalTransform.mat);
    this.renderableEffectsManager.renderFrame(this._isFirstFrame);
}

RenderableElement.prototype.sourceRectAtTime = function(){
    return {
        top:0,
        left:0,
        width:100,
        height:100
    }
};

RenderableElement.prototype.getLayerSize = function(){
    if(this.data.ty === 5){
        return {w:this.data.textData.width,h:this.data.textData.height};
    }else{
        return {w:this.data.width,h:this.data.height};
    }
};