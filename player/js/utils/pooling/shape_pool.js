var shape_pool = (function(){
	var ob = {
		clone: clone,
		newShape: newShape,
		release: release,
		releaseArray: releaseArray
	}

	var _length = 0;
	var _maxLength = 4;
	var pool = Array.apply(null,{length:_maxLength});

	function newShape(){
		var shapePath;
		if(_length){
			_length -= 1;
			shapePath = pool[_length];
		} else {
			shapePath = new ShapePath();
		}
		return shapePath;
	}

	function release(shapePath) {
		if(_length === _maxLength) {
			pool = pooling.double(pool);
			_maxLength = _maxLength*2;
		}
		var len = shapePath._length, i;
		for(i = 0; i < len; i += 1) {
			point_pool.release(shapePath.v[i]);
			point_pool.release(shapePath.i[i]);
			point_pool.release(shapePath.o[i]);
			shapePath.v[i] = null;
			shapePath.i[i] = null;
			shapePath.o[i] = null;
		}
		shapePath._length = 0;
		shapePath.c = false;
		pool[_length] = shapePath;
		_length += 1;
	}

	function releaseArray(shapePathsCollection, length) {
		while(length--) {
			release(shapePathsCollection[length]);
		}
	}

	function clone(shape, transform) {
		var i, len = shape._length === undefined ? shape.v.length : shape._length;
		var cloned = newShape();
		cloned.setLength(len);
		cloned.c = shape.c;

		var pt;
		
		for(i = 0; i < len; i += 1) {
			if(transform){
				pt = transform.applyToPointArray(shape.v[i][0],shape.v[i][1],0,2);
				cloned.setXYAt(pt[0],pt[1],'v',i);
				point_pool.release(pt);
				pt = transform.applyToPointArray(shape.o[i][0],shape.o[i][1],0,2);
				cloned.setXYAt(pt[0],pt[1],'o',i);
				point_pool.release(pt);
				pt = transform.applyToPointArray(shape.i[i][0],shape.i[i][1],0,2);
				cloned.setXYAt(pt[0],pt[1],'i',i);
				point_pool.release(pt);
			}else{
				cloned.setTripleAt(shape.v[i][0],shape.v[i][1],shape.o[i][0],shape.o[i][1],shape.i[i][0],shape.i[i][1], i);
			}
		}
		return cloned
	}


	return ob;
}());