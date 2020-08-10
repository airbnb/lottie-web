var audioControllerFactory = (function() {

	function AudioController() {
		this.audios = [];
	}

	AudioController.prototype = {
		addAudio: function(audio) {
			this.audios.push(audio);
		},
		pause: function() {
			var i, len = this.audios.length;
			for(i = 0; i < len; i += 1) {
				this.audios[i].pause()
			}
		},
		resume: function() {
			var i, len = this.audios.length;
			for(i = 0; i < len; i += 1) {
				this.audios[i].resume()
			}
		},
		setRate: function(rateValue) {
			var i, len = this.audios.length;
			for(i = 0; i < len; i += 1) {
				this.audios[i].setRate(rateValue)
			}
		}
	}

	return function() {
		return new AudioController()
	}

}())