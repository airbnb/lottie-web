var point_pool = (function(){
	var ob = {
		newPoint: newPoint,
		release: release,
		getLength:function(){return _length},
		getCont:function(){return cont}
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
		} else {
			point = [0.1,0.1];
			cont++;
			//point._tst = cont++;
		}
		return point;
	}

	function release(point) {
		if(_length === _topLength) {
			pool = pooling.double(pool);
			_topLength = _topLength*2;
		}
		pool[_length] = point;
		_length += 1;
	}


	return ob;
}())