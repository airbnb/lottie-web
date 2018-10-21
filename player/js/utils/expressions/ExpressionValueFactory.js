var ExpressionMultidimensionalValueFactory = function(property, mult) {
	if(!property) {
		property = {pv:[0,0,0], v:[0,0,0]}
	}
	var len = property.pv.length;
    var expressionValue = createTypedArray('float32', len);
    var arrValue = createTypedArray('float32', len);
    expressionValue.value = arrValue;
    completeProperty(expressionValue, property);

    return function() {
    	if (property.k) {
	        property.getValue();
	    }
	    for (i = 0; i < len; i += 1) {
            expressionValue[i] = arrValue[i] = property.v[i] * mult;
        }
        return expressionValue;
    }
}

var ExpressionUnidimensionalValueFactory = function(property, mult) {
	if(!property) {
		property = {pv:0, v:0}
	}
	var val = property.pv * mult;
    var expressionValue = new Number(val);
    expressionValue.value = val;
	completeProperty(expressionValue, property);

    return function() {
    	if (property.k) {
	        property.getValue();
	    }
	    val = property.v * mult;
	    if(expressionValue.value !== val) {
	        expressionValue = new Number(val);
	        expressionValue.value = val;
	        completeProperty(expressionValue, property);
	    }
        return expressionValue;
    }
}

function completeProperty(expressionValue, property) {
    Object.defineProperty(expressionValue, 'velocity', {
        get: function(){
            return property.getVelocityAtTime(property.comp.currentFrame);
        }
    });
    expressionValue.numKeys = property.keyframes ? property.keyframes.length : 0;
    expressionValue.key = function(pos) {
        if (!expressionValue.numKeys) {
            return 0;
        } else {
            return property.keyframes[pos-1].t;
        }
    };
    expressionValue.valueAtTime = property.getValueAtTime;
    expressionValue.speedAtTime = property.getSpeedAtTime;
    expressionValue.velocityAtTime = property.getVelocityAtTime;
    expressionValue.propertyGroup = property.propertyGroup;
}