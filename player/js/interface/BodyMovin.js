var BodyMovin = function (options) {
	
	if (!options) {
		options = {};
	}

	this.element = options.element || document.getElementsByClassName('bodymovin')[0];
	this.engine = options.engine || 'svg';
	this.src = options.src || this.element.getAttribute('data-bm-path');
	this.data = options.data || undefined;
	this.loop = options.loop || true;
	this.autoplay = this.autoplay || true;

	this.canPlay = false;

	this._state = BodyMovin.WAITING;

	this.callbacks = [];

	this._init();

}
 /**
 * 		Bodymovin states
 */
BodyMovin.WAITING = 'bodymoving:waiting';
BodyMovin.CANPLAY = 'bodymoving:canplay';
BodyMovin.PLAYING = 'bodymoving:playing';
BodyMovin.PAUSED = 'bodymoving:paused';
BodyMovin.ENDED = 'bodymoving:ended';
BodyMovin.TIMEUPDATE = 'bodymoving:timeupdate';



// -------------------------------------------------------------------o Trigger / Listener behavior

BodyMovin.prototype.trigger = function(eventName, args){

	var delay = (this.callbacks.length === 0) ? true : false;
	var that = this;

	if (delay){
		setTimeout(function(){
			for (var i = 0; i < this.callbacks[eventName].length; i++){
				this.callbacks[eventName][i](args);
			}
		}, 0);
	}
	else {
		for (var i = 0; i < this.callbacks[eventName].length; i++){
			this.callbacks[eventName][i](args);
		}
	}
};

BodyMovin.prototype.addEventListener = function(eventName, callback){

	if (this.callbacks[eventName]){
		this.callbacks[eventName] = [];
	}
	this.callbacks[eventName].push(callback);

};

// -------------------------------------------------------------------o Init

BodyMovin.prototype._init = function () {

	this.animationItem = new AnimationItem({
		element: this.element,
		src: this.src
	});
	
	if (this.data){
		this._canPlay();
	}

	if (this.autoplay === true && this.canPlay == true) {
		this.play();
	}

	this.bodyMovinManager = new BodyMovinManager();

	var that = this;

	this._initEvents();

}

BodyMovin.prototype._initEvents = function () {

	this.bodyMovinManager
		.addEventListener(BodyMovinManager.UPDATE, this._onUpdate.bind(this));

}


// -------------------------------------------------------------------o Private

BodyMovin.prototype._onUpdate = function (e) {

	this.render(this.bodyMovinManager.getElapsedTime());

}

// -------------------------------------------------------------------o Private

BodyMovin.prototype._canPlay = function () {

	this.canPlay = true;

	this.setData(this.data);

	this._changeState(BodyMovin.CANPLAY);

}

BodyMovin.prototype._changeState = function (state) {

	this._state = state;

	this.trigger(state);

}

// -------------------------------------------------------------------o Public

BodyMovin.prototype.play = function () {

	this._changeState(BodyMovin.PLAYING);

}

BodyMovin.prototype.pause = function () {

	this._changeState(BodyMovin.PLAYING);

}

BodyMovin.prototype.pause = function () {

	this._changeState(BodyMovin.PAUSED);

}

BodyMovin.prototype.seek = function () {



}

BodyMovin.prototype.render = function (elapsedTime) {

	this.animationItem.advanceTime(elapsedTime);

}

BodyMovin.prototype.destroy = function (elapsedTime) {

	this.element.innerHTML = '';

}

// -------------------------------------------------------------------o Getters

BodyMovin.prototype.getDuration = function () {

	return this.animationItem.getDuration();

}

BodyMovin.prototype.getCurrentFrame = function () {

	return this.animationItem.getCurrentFrame();

}

// -------------------------------------------------------------------o Setters

BodyMovin.prototype.setData = function (data) {

	this.animationItem.setData(data);

}

