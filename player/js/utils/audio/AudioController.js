var audioControllerFactory = (function() {

	function AudioController(audioFactory) {
		this.audios = [];
		this.audioFactory = audioFactory;
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
		},
		createAudio: function(assetPath) {
			if (this.audioFactory) {
				return this.audioFactory(assetPath);
			} else if (Howl) {
				return new Howl({
					src: [assetPath]
				})
			} else {
				return {
					isPlaying: false,
					play: function(){this.isPlaying = true},
					seek: function(){this.isPlaying = false},
					playing: function(){},
					rate: function(){},
				}
			}
		},
		setAudioFactory: function(audioFactory) {
			this.audioFactory = audioFactory;
		}
	}

	return function() {
		return new AudioController()
	}

}())