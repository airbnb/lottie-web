var PropertyInterface = (function() {
	return function(propertyName, propertyGroup) {

		var interfaceFunction = {
			_name: propertyName
		}

		function _propertyGroup(val){
		    val = val === undefined ? 1 : val
		    if(val <= 0){
		        return interfaceFunction;
		    } else {
		        return propertyGroup(--val);
		    }
		}

		return _propertyGroup;
	}
}())