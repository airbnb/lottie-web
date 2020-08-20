function AudioElement(data,globalData,comp){
    this.initFrame();
    this.initRenderable();
    this.assetData = globalData.getAssetData(data.refId);
	this.initBaseData(data, globalData, comp);
	this._isPlaying = false;
	this._canPlay = false;
	var assetPath = this.globalData.getAssetsPath(this.assetData);
    this.audio = this.globalData.audioController.createAudio(assetPath);
    this._currentTime = 0;
    this.globalData.audioController.addAudio(this);
    this.tm = data.tm ? PropertyFactory.getProp(this, data.tm, 0, globalData.frameRate,this) : {_placeholder:true};
}

AudioElement.prototype.prepareFrame = function(num) {
    this.prepareRenderableFrame(num, true);
    this.prepareProperties(num, true);
    if (!this.tm._placeholder) {
        var timeRemapped = this.tm.v;
        this._currentTime = timeRemapped;
    } else {
        this._currentTime = num / this.data.sr;
    }
};

extendPrototype([RenderableElement,BaseElement,FrameElement], AudioElement);

AudioElement.prototype.renderFrame = function() {
	if (this.isInRange && this._canPlay) {
		if (!this._isPlaying) {
			this.audio.play();
			this.audio.seek(this._currentTime / this.globalData.frameRate);
			this._isPlaying = true;
		} else if (!this.audio.playing()
			|| Math.abs(this._currentTime / this.globalData.frameRate - this.audio.seek()) > 0.1
		) {
			this.audio.seek(this._currentTime / this.globalData.frameRate)
		}
	}
};

AudioElement.prototype.show = function() {
	// this.audio.play()
};

AudioElement.prototype.hide = function() {
	this.audio.pause();
	this._isPlaying = false;
};

AudioElement.prototype.pause = function() {
	this.audio.pause();
	this._isPlaying = false;
	this._canPlay = false;
};

AudioElement.prototype.resume = function() {
	this._canPlay = true;
};

AudioElement.prototype.setRate = function(rateValue) {
	this.audio.rate(rateValue);
};

AudioElement.prototype.volume = function(volumeValue) {
	this.audio.volume(volumeValue);
};

AudioElement.prototype.getBaseElement = function() {
	return null;
};

AudioElement.prototype.destroy = function() {
};

AudioElement.prototype.sourceRectAtTime = function() {
};

AudioElement.prototype.initExpressions = function() {
};

