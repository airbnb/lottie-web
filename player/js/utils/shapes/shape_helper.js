function ShapePath(shape){
	this.c = shape ? shape.c : false;
	this._length = shape ? shape._length : 0;
	this._actualArrayLength = shape? Math.max(shape._actualArrayLength, 4) : 4;
	this.v = Array.apply(null,{length:this._actualArrayLength});
	this.o = Array.apply(null,{length:this._actualArrayLength});
	this.i = Array.apply(null,{length:this._actualArrayLength});
	if(shape) {
		var i = 0;
		while(i < this._length){
			this.v[i] = [shape.v[i][0],shape.v[i][1]];
			this.o[i] = [shape.o[i][0],shape.o[i][1]];
			this.i[i] = [shape.i[i][0],shape.i[i][1]];
			i += 1;
		}
	} 
}

ShapePath.prototype.setPathData = function(closed, len) {
	this.c = closed;
	while(len > this._actualArrayLength){
		this.doubleArrayLength();
	}
	var i = 0;
	while(i < len){
		this.v[i] = [0,0];
		this.o[i] = [0,0];
		this.i[i] = [0,0];
		i += 1;
	}
	this._length = len;
}

ShapePath.prototype.doubleArrayLength = function() {
	this.v = this.v.concat(Array.apply(null,{length:this._actualArrayLength}))
	this.i = this.i.concat(Array.apply(null,{length:this._actualArrayLength}))
	this.o = this.o.concat(Array.apply(null,{length:this._actualArrayLength}))
	this._actualArrayLength *= 2;
}

ShapePath.prototype.addPointAt = function(point, type, pos) {
	this.addXYAt(point[0],point[1],type,pos);
}

ShapePath.prototype.setTriplePointAt = function(v,o,i,pos) {
	this.setTripleAt(v[0],v[1],o[0],[1],i[0],i[1],pos);
}

ShapePath.prototype.addXYAt = function(x, y, type, pos) {
	var arr;
	this._length = Math.max(this._length, pos + 1);
	if(this._length >= this._actualArrayLength) {
		this.doubleArrayLength();
	}
	switch(type){
		case 'v':
			arr = this.v;
			break;
		case 'i':
			arr = this.i;
			break;
		case 'o':
			arr = this.o;
			break;
	}
	if(!arr[pos]){
		arr[pos] = [x,y];
	} else {
		arr[pos][0] = x;
		arr[pos][1] = y;
	}
}

ShapePath.prototype.setTripleAt = function(vX,vY,oX,oY,iX,iY,pos) {
	this.addXYAt(vX,vY,'v',pos);
	this.addXYAt(oX,oY,'o',pos);
	this.addXYAt(iX,iY,'i',pos);
}

var shape_helper = (function(){

	var _shapesLength = 0;
	var _arraysLength = 0;
	var _topArraysLength = 1024;
	var _topShapesLength = 64;
	var poolShapes = Array.apply(null,{length:_topArraysLength});
	var poolArrays = Array.apply(null,{length:_topShapesLength});

	function clone(shape, transform){
		var i, len = shape._length;
		var cloned;
		if(_shapesLength) {
			cloned = poolShapes[_shapesLength - 1];
			cloned._length = shape._length;
			_shapesLength -= 1;
		} else {
			cloned = new ShapePath(shape);
		}

		var oArr, iArr, vArr;
		
		for(i = 0; i < len; i += 1) {
			oArr = getArray();
			iArr = getArray();
			vArr = getArray();
			if(transform){
				cloned.addPointAt(transform.applyToPointArray(shape.v[i][0],shape.v[i][1],0,2,vArr),'v',i);
				cloned.addPointAt(transform.applyToPointArray(shape.o[i][0],shape.o[i][1],0,2,oArr),'o',i);
				cloned.addPointAt(transform.applyToPointArray(shape.i[i][0],shape.i[i][1],0,2,iArr),'i',i);
				//cloned.v[i] = transform.applyToPointArray(shape.v[i][0],shape.v[i][1],0,2,vArr);
				//cloned.o[i] = transform.applyToPointArray(shape.o[i][0],shape.o[i][1],0,2,oArr);
				//cloned.i[i] = transform.applyToPointArray(shape.i[i][0],shape.i[i][1],0,2,iArr);
			}else{
				oArr[0] = shape.o[i][0];
				oArr[1] = shape.o[i][1];
				iArr[0] = shape.i[i][0];
				iArr[1] = shape.i[i][1];
				vArr[0] = shape.v[i][0];
				vArr[1] = shape.v[i][1];
				cloned.addPointAt(vArr,'v',i);
				cloned.addPointAt(oArr,'o',i);
				cloned.addPointAt(iArr,'i',i);
				/*cloned.v[i] = vArr;
				cloned.o[i] = oArr;
				cloned.i[i] = iArr;*/
			}
		}
		return cloned

	}

	function doublePoolArray(array, length) {
		return array.concat(Array.apply(null,{length:length}))
	}

	function release(shape) {
		shape._length = 0;
		poolShapes[_shapesLength] = shape;
		if(_topShapesLength*3/4 < _shapesLength){
			poolShapes = doublePoolArray(poolShapes, _topShapesLength);
			_topShapesLength = poolShapes.length;
		}
		_shapesLength += 1;
		var len = shape._length, i;
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