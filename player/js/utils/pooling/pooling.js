var pooling = (function(){

	function double(arr){
		return arr.concat(Array.apply(null,{length:arr.length}))
	}

	return {
		double: double
	}
}());