var audioControllerFactory = (function() {

	function AudioController(audioFactory) {
		this.audios = [];
		this.audioFactory = audioFactory;
		this._volume = 1;
		this._isMuted = false;
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
					setVolume: function(){},
				}
			}
		},
		setAudioFactory: function(audioFactory) {
			this.audioFactory = audioFactory;
		},
		setVolume: function(value) {
			this._volume = value;
			this._updateVolume();
		},
		mute: function() {
			this._isMuted = true;
			this._updateVolume();
		},
		unmute: function() {
			this._isMuted = false;
			this._updateVolume();
		},
		getVolume: function(value) {
			return this._volume;
		},
		_updateVolume: function() {
			var i, len = this.audios.length;
			for(i = 0; i < len; i += 1) {
				this.audios[i].volume(this._volume * (this._isMuted ? 0 : 1))
			}
		}
	}

	return function() {
		return new AudioController()
	}

}())