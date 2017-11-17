function RenderableElement(){

}

RenderableElement.prototype.initRenderable = function() {
	//layer's visibility related to inpoint and outpoint. Rename isVisible to isInRange
	this.isVisible = false;
	//layer's display state
	this.hidden = false;
    // If layer's transparency equals 0, it can be hidden
    this.isTransparent = false;
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
            this.elemMdf = true;
            this.globalData.mdf = true;
            this.isVisible = true;
            this.firstFrame = true;
            this.maskManager.firstFrame = true;
            this.show();
        }
    } else {
        if(this.isVisible !== false){
            this.elemMdf = true;
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
	if(this.isVisible) {
        this.maskManager.renderFrame(this.finalTransform.mat);
        this.effectsManager.renderFrame(this.firstFrame);
	}
}