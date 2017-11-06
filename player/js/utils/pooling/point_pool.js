var point_pool = (function(){
	var ob = {
		newPoint: newPoint,
		release: release
	}

	var _length = 0;
	var _maxLength = 8;
	var pool = Array.apply(null,{length:_maxLength});

	function newPoint(){
		var point;
		if(_length){
			_length -= 1;
			point = pool[_length];
		} else {
			point = [0.1,0.1];
		}
		return point;
	}

	function release(point) {
		if(_length === _maxLength) {
			pool = pooling.double(pool);
			_maxLength = _maxLength*2;
		}
		pool[_length] = point;
		_length += 1;
	}


	return ob;
}());