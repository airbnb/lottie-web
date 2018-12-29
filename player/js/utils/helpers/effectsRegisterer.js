var effectsRegisterer = (function(){
	var registeredEffects = {};
	var ob = {
		registerEffect: registerEffect,
		getEffect: getEffect,
	}

	function registerEffect(name, effectConstructor) {
		registeredEffects[name] = effectConstructor;
	}

	function getEffect(name) {
		return registeredEffects[name];
	}

	return ob;
}())