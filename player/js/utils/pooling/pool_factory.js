var pool_factory = (function() {
	return function(initialLength, _create, _release, _clone) {

		var _length = 0;
		var _maxLength = initialLength;
		var pool = createSizedArray(_maxLength);

		var ob = {
			newElement: newElement,
			release: release
		};

		function newElement(){
			var element;
			if(_length){
				_length -= 1;
				element = pool[_length];
			} else {
				element = _create();
			}
			return element;
		}

		function release(element) {
			if(_length === _maxLength) {
				pool = pooling.double(pool);
				_maxLength = _maxLength*2;
			}
			if (_release) {
				_release(element);
			}
			pool[_length] = element;
			_length += 1;
		}

		function clone() {
			var clonedElement = newElement();
			return _clone(clonedElement);
		}

		return ob;
	};
}());
