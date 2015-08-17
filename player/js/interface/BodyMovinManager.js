var BodyMovinManager = function (options) {
	
	if (!options) {
		options = {};
	}

	if (BodyMovinManager.instance === null) {
		BodyMovinManager.instance = this;
	}
	else {
		return BodyMovinManager.instance;
	}

	this._init();

}

// ------o Singleton

BodyMovinManager.instance = null;
BodyMovinManager.UPDATE = 'bodymovinmanager:update';

// -------------------------------------------------------------------o Public

BodyMovinManager.prototype.trigger = function(eventName, args){

	if (!this.callbacks){
		this.callbacks = [];
	}

	var delay = (this.callbacks.length === 0) ? true : false;
	var that = this;

	if (this.callbacks[eventName]) {
		if (delay){
			setTimeout(function(){
				for (var i = 0; i < that.callbacks[eventName].length; i++){
					that.callbacks[eventName][i](args);
				}
			}, 0);
		}
		else {
			for (var i = 0; i < this.callbacks[eventName].length; i++){
				this.callbacks[eventName][i](args);
			}
		}
	}
};

BodyMovinManager.prototype.addEventListener = function(eventName, callback){

	if (!this.callbacks){
		this.callbacks = [];
	}

	if (!this.callbacks[eventName]){
		this.callbacks[eventName] = [];
	}

	this.callbacks[eventName].push(callback);

};


// -------------------------------------------------------------------o Init

BodyMovinManager.prototype._init = function () {

	var that = this;

	this.initTime = Date.now();

	(tick = function() {
		that.update();
		return window.requestAnimationFrame(tick);
	})();

}

BodyMovinManager.prototype.update = function () {

	this.nowTime = Date.now();
	this.elapsedTime = this.nowTime - this.initTime;
	this.initTime = this.nowTime;

	this.trigger(BodyMovinManager.UPDATE);

}

// -------------------------------------------------------------------o Getters

BodyMovinManager.prototype.getElapsedTime = function () {

	return this.elapsedTime;

}