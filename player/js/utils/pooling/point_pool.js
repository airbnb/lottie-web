var point_pool = (function(){

	function create() {
		return createTypedArray('float32', 2);
	}
	return pool_factory(8, create);
}());