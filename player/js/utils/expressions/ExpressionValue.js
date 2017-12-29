var ExpressionValue = (function() {
	return function(elementProp, mult, type) {
        var expressionValue, arrayValue;

		if (elementProp.k) {
            elementProp.getValue();
        }
        var i, len, arrValue, val;
        if (type) {
        	if(type === 'color') {
        		len = 4;
                expressionValue = createTypedArray('float32', len);
                arrValue = createTypedArray('float32', len);
		        for (i = 0; i < len; i += 1) {
		            expressionValue[i] = arrValue[i] = (mult && i < 3) ? elementProp.v[i] * mult : 1;
		        }
	        	expressionValue.value = arrValue;
        	}
        } else if (typeof elementProp.v === 'number' || elementProp.v instanceof Number){
            val = mult ? elementProp.v * mult : elementProp.v;
            expressionValue = new Number(val);
            expressionValue.value = val;
        } else {
        	len = elementProp.v.length;
            expressionValue = createTypedArray('float32', len);
            arrValue = createTypedArray('float32', len);
	        for (i = 0; i < len; i += 1) {
	            expressionValue[i] = arrValue[i] = mult ? elementProp.v[i] * mult : elementProp.v[i];
	        }
	        expressionValue.value = arrValue;
        }
        
        expressionValue.numKeys = elementProp.keyframes ? elementProp.keyframes.length : 0;
        expressionValue.key = function(pos) {
            if (!expressionValue.numKeys) {
                return 0;
            } else {
                return elementProp.keyframes[pos-1].t;
            }
        };
        expressionValue.valueAtTime = elementProp.getValueAtTime;
        expressionValue.propertyGroup = elementProp.propertyGroup;
        return expressionValue;
	};
}());