var shapeCollection_pool = (function(){
	var ob = {
		newShapeCollection: newShapeCollection,
		release: release,
		clone: clone
	}

	var _length = 0;
	var _maxLength = 4;
	var pool = Array.apply(null,{length:_maxLength});

	var cont = 0;

	function newShapeCollection(){
		var shapeCollection;
		if(_length){
			_length -= 1;
			shapeCollection = pool[_length];
		} else {
			shapeCollection = new ShapeCollection();
		}
		return shapeCollection;
	}

	function release(shapeCollection) {
		var i, len = shapeCollection._length;
		for(i = 0; i < len; i += 1) {
			shape_pool.release(shapeCollection.shapes[i]);
		}
		shapeCollection._length = 0;

		if(_length === _maxLength) {
			pool = pooling.double(pool);
			_maxLength = _maxLength*2;
		}
		pool[_length] = shapeCollection;
		_length += 1;
	}

	function clone(shapeCollection, originCollection) {
		release(shapeCollection);
		if(_length === _maxLength) {
			pool = pooling.double(pool);
			_maxLength = _maxLength*2;
		}
		pool[_length] = shapeCollection;
		_length += 1;
	}


	return ob;
}());