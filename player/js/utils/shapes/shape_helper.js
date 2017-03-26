var shape_helper = (function(){

	function clone(shape, transform){
		var i, len = shape.v.length;
		var cloned = {
			c: shape.c,
			i: Array.call({length:len}),
			o: Array.call({length:len}),
			v: Array.call({length:len})
		}
		for(i = 0; i < len; i += 1) {
			cloned.v[i] = transform ? transform.applyToPointArray(shape.v[i][0],shape.v[i][1],0,2) : [shape.v[i][0],shape.v[i][1]]
			cloned.o[i] = transform ? transform.applyToPointArray(shape.o[i][0],shape.o[i][1],0,2) : [shape.o[i][0],shape.o[i][1]]
			cloned.i[i] = transform ? transform.applyToPointArray(shape.i[i][0],shape.i[i][1],0,2) : [shape.i[i][0],shape.i[i][1]]
		}
		return cloned

	}

	return {
		clone: clone
	}
}())