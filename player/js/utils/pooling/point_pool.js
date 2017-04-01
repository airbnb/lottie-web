var point_pool = (function(){
	var ob = {
		newPoint: newPoint,
		release: release
	}

	var _length = 0;
	var _topLength = 8;
	var pool = Array.apply(null,{length:_topLength});

	var cont = 0;

	function newPoint(){
		var point;
		if(_length){
			_length -= 1;
			point = pool[_length];
			point._free = false;
			//console.log('use:', point._tst, ' at:', _length);
		} else {
			point = [0.1,0.1];
			point._free = false;
			point._tst = cont++;
			//console.log('new:', point._tst);
		}
		return point;
	}

	function release(point) {
		if(_length === _topLength) {
			pool = pooling.double(pool);
			_topLength = _topLength*2;
		}
		//console.log('release:', point._tst, ' at:' , _length);
		point._free = true;
		pool[_length] = point;
		_length += 1;
	}


	return ob;
}())