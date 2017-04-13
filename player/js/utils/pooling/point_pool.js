var point_pool = (function(){
	var ob = {
		newPoint: newPoint,
		release: release
		/*,getLength:function(){return _length}
		,getCont:function(){return cont}*/
	}

	var _length = 0;
	var _maxLength = 8;
	var pool = Array.apply(null,{length:_maxLength});

	//var cont = 0;

	function newPoint(){
		//window.bm_newPoint = window.bm_newPoint ? window.bm_newPoint + 1 : 1;
		var point;
		if(_length){
			_length -= 1;
			point = pool[_length];
			//window.bm_reuse = window.bm_reuse ? window.bm_reuse + 1 : 1;
		} else {
			point = [0.1,0.1];
			//cont++;
			//console.log('new');
			//window.bm_new = window.bm_new ? window.bm_new + 1 : 1;
			//point._tst = cont++;
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
		//window.bm_release = window.bm_release ? window.bm_release + 1 : 1;
		//console.log('release');
	}


	return ob;
}());