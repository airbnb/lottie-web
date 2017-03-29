function ShapeElement(shape){
	this.c = shape ? shape.c : false;
	this._length = shape ? shape._length : 0;
	this._actualArrayLength = 16;
	this.v = Array.apply(null,{length:this._actualArrayLength});
	this.o = Array.apply(null,{length:this._actualArrayLength});
	this.i = Array.apply(null,{length:this._actualArrayLength});
}

var shape_helper = (function(){

	var _shapesLength = 0;
	var _arraysLength = 0;
	var _topArraysLength = 1024;
	var _topShapesLength = 64;
	var poolShapes = Array.apply(null,{length:_topArraysLength});
	var poolArrays = Array.apply(null,{length:_topShapesLength});

	function clone(shape, transform){
		var i, len = shape.v.length;
		var cloned;
		if(_shapesLength) {
			cloned = poolShapes[_shapesLength - 1];
			_shapesLength -= 1;
			cloned.i.length = len;
			cloned.o.length = len;
			cloned.v.length = len;
		} else {
			cloned = {
				c: shape.c,
				i: Array.apply(null,{length:len}),
				o: Array.apply(null,{length:len}),
				v: Array.apply(null,{length:len})
			}
		}

		var oArr, iArr, vArr;
		
		for(i = 0; i < len; i += 1) {
			oArr = getArray();
			iArr = getArray();
			vArr = getArray();
			if(transform){
				cloned.v[i] = transform.applyToPointArray(shape.v[i][0],shape.v[i][1],0,2,vArr);
				cloned.o[i] = transform.applyToPointArray(shape.o[i][0],shape.o[i][1],0,2,oArr);
				cloned.i[i] = transform.applyToPointArray(shape.i[i][0],shape.i[i][1],0,2,iArr);
			}else{
				oArr[0] = shape.o[i][0];
				oArr[1] = shape.o[i][1];
				iArr[0] = shape.i[i][0];
				iArr[1] = shape.i[i][1];
				vArr[0] = shape.v[i][0];
				vArr[1] = shape.v[i][1];
				cloned.v[i] = vArr;
				cloned.o[i] = oArr;
				cloned.i[i] = iArr;
			}
		}
		return cloned

	}

	function doublePoolArray(array, length) {
		return array.concat(Array.apply(null,{length:length}))
	}

	function release(shape) {
		poolShapes[_shapesLength] = shape;
		if(_topShapesLength*3/4 < _shapesLength){
			poolShapes = doublePoolArray(poolShapes, _topShapesLength);
			_topShapesLength = poolShapes.length;
		}
		_shapesLength += 1;
		var len = shape.v.length, i;
		for(i = 0; i < len; i += 1) {
			poolArrays[_arraysLength] = shape.v[i];
			poolArrays[_arraysLength + 1] = shape.i[i];
			poolArrays[_arraysLength + 2] = shape.o[i];
			_arraysLength += 3;
		}
		if(_topArraysLength*3/4 < _arraysLength){
			poolArrays = doublePoolArray(poolArrays, _topArraysLength);
			_topArraysLength = poolArrays.length;
		}
	}

	function releaseArray(shapes, length) {
		var i = 0;
		while(i < length) {
			release(shapes[i]);
			i += 1;
		}
	}

	function getArray(){
		if(_arraysLength){
			_arraysLength -= 1;
			return poolArrays[_arraysLength - 1];
		}
		return [0.1,0.1];
	}

	return {
		clone: clone,
		release: release,
		releaseArray: releaseArray
	}
}())