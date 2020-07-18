var propertyGroupFactory = (function() {
	return function(interfaceFunction, parentPropertyGroup) {
		return function(val) {
			val = val === undefined ? 1 : val
			if(val <= 0){
			    return interfaceFunction;
			} else{
			    return parentPropertyGroup(val-1);
			}
		}
	}
}())