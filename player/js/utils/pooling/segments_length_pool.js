var segments_length_pool = (function(){
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
			element = {lengths: [], totalLength: 0};
		}
		return element;
	}

	function release(element) {
		if(_length === _maxLength) {
			pool = pooling.double(pool);
			_maxLength = _maxLength*2;
		}
		var i, len = element.lengths.length;
		for(i=0;i<len;i+=1) {
			bezier_length_pool.release(element.lengths[i]);
		}
		element.lengths.length = 0;
		pool[_length] = element;
		_length += 1;
	}


	return ob;
}());