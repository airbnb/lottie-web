var bezier_length_pool = (function(){
	var ob = {
		newElement: newElement,
		release: release
	}

	var _length = 0;
	var _maxLength = 8;
	var pool = Array.apply(null,{length:_maxLength});

	function newElement(){
		var element;
		if(_length){
			_length -= 1;
			element = pool[_length];
		} else {
			element = {
                addedLength: 0,
                percents: createTypedArray('float32', defaultCurveSegments),
                lengths: createTypedArray('float32', defaultCurveSegments),
            };
		}
		return element;
	}

	function release(element) {
		if(_length === _maxLength) {
			pool = pooling.double(pool);
			_maxLength = _maxLength*2;
		}
		pool[_length] = element;
		_length += 1;
	}


	return ob;
}());