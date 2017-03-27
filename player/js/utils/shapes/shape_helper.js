var shape_helper = (function(){

	var poolShapes = [];
	var poolArrays = [];

	function clone(shape, transform){
		var i, len = shape.v.length;
		var cloned;
		if(poolShapes.length) {
			cloned = poolShapes.pop();
			cloned.i.length = len;
			cloned.o.length = len;
			cloned.v.length = len;
		} else {
			cloned = {
				c: shape.c,
				i: Array.call({length:len}),
				o: Array.call({length:len}),
				v: Array.call({length:len})
			}
		}

		var oArr, iArr, vArr;
		
		for(i = 0; i < len; i += 1) {
			oArr = getArray();
			iArr = getArray();
			vArr = getArray();
			if(transform){
				cloned.v[i] = transform.applyToPointArray(shape.v[i][0],shape.v[i][1],0,2,oArr);
				cloned.o[i] = transform.applyToPointArray(shape.o[i][0],shape.o[i][1],0,2,iArr);
				cloned.i[i] = transform.applyToPointArray(shape.i[i][0],shape.i[i][1],0,2,vArr);
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

	function release(shape) {
		poolShapes.push(shape);
		var len = shape.v.length, i;
		for(i = 0; i < len; i += 1) {
			poolArrays.push(shape.v[i]);
			poolArrays.push(shape.i[i]);
			poolArrays.push(shape.o[i]);
		}
	}

	function releaseArray(shapes) {
		var i = 0, len = shapes.length;
		while(i<len) {
			release(shapes[i]);
			i += 1;
		}
	}

	function getArray(){
		if(poolArrays.length){
			return poolArrays.pop();
		}
		return [];
	}

	return {
		clone: clone,
		release: release,
		releaseArray: releaseArray
	}
}())