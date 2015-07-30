var AnimationItemTemp = function (options) {
	
	if (!options) {
		options = {};
	}

	this._init();

}

// -------------------------------------------------------------------o Public

AnimationItemTemp.prototype.trigger = function(eventName, args){

	var delay = (this.callbacks.length === 0) ? true : false;
	var that = this;

	if (delay){
		setTimeout(function(){
			that.callbacks[eventName](args);
		}, 0);
	}
	else {
		this.callbacks[eventName](args);
	}
};

AnimationItemTemp.prototype.addEventListener = function(eventName, callback){

	this.callbacks[eventName] = callback;

};

// -------------------------------------------------------------------o Init

AnimationItemTemp.prototype._init = function () {



}

AnimationItemTemp.prototype._initEvents = function () {



}

// -------------------------------------------------------------------o Private



// -------------------------------------------------------------------o Public

AnimationItemTemp.prototype.play = function () {

	this._changeState(BodyMovin.PLAYING);

}

AnimationItemTemp.prototype.pause = function () {

	this._changeState(BodyMovin.PLAYING);

}

AnimationItemTemp.prototype.pause = function () {

	this._changeState(BodyMovin.PAUSED);

}

AnimationItemTemp.prototype.seek = function (frame) {

	

}

AnimationItemTemp.prototype.timeUpdate = function (frame) {



	this.trigger(BodyMovin.TIMEUPDATE);

}

// -------------------------------------------------------------------o Getters

AnimationItemTemp.prototype.getDuration = function () {

	return this.duration;

}

AnimationItemTemp.prototype.getCurrentFrame = function () {

	return this.currentFrame;

}

// -------------------------------------------------------------------o Setters

AnimationItemTemp.prototype.setData = function (data) {

	this.data = data;

}
