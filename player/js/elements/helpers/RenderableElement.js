function RenderableElement(){

}

RenderableElement.prototype.initRenderable = function() {
	//layer's visibility related to inpoint and outpoint. Rename isVisible to isInRange
	this.isVisible = false;
	//layer's display state
	this.hidden = false;
    // If layer's transparency equals 0, it can be hidden
    this.isTransparent = false;
    // effects manager
    this.effects = new EffectsManager(this.data,this,this.dynamicProperties);
}

RenderableElement.prototype.prepareRenderableFrame = function(num) {
	this.checkLayerLimits(num);
	this.prepareMasks(num);
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
        if(this.isVisible !== true){
            this.globalData.mdf = true;
            this.isVisible = true;
            this.firstFrame = true;
            this.maskManager.firstFrame = true;
            this.show();
        }
    } else {
        if(this.isVisible !== false){
            this.globalData.mdf = true;
            this.isVisible = false;
            this.hide();
        }
    }
}

RenderableElement.prototype.prepareMasks = function() {
	if(this.isVisible) {
        this.maskManager.prepareFrame();
	}
}

RenderableElement.prototype.renderRenderable = function() {
    this.maskManager.renderFrame(this.finalTransform.mat);
    this.effectsManager.renderFrame(this.firstFrame);
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