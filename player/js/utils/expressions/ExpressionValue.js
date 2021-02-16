/* global createTypedArray */
/* exported ExpressionValue */

function ExpressionValue(elementProp, mult, type) {
  mult = mult || 1;
  var expressionValue;

  if (elementProp.k) {
    elementProp.getValue();
  }
  var i;
  var len;
  var arrValue;
  var val;
  if (type) {
    if (type === 'color') {
      len = 4;
      expressionValue = createTypedArray('float32', len);
      arrValue = createTypedArray('float32', len);
      for (i = 0; i < len; i += 1) {
        arrValue[i] = (i < 3) ? elementProp.v[i] * mult : 1;
        expressionValue[i] = arrValue[i];
      }
      expressionValue.value = arrValue;
    }
  } else if (elementProp.propType === 'unidimensional') {
    val = elementProp.v * mult;
    expressionValue = new Number(val); // eslint-disable-line no-new-wrappers
    expressionValue.value = val;
  } else {
    len = elementProp.pv.length;
    expressionValue = createTypedArray('float32', len);
    arrValue = createTypedArray('float32', len);
    for (i = 0; i < len; i += 1) {
      arrValue[i] = elementProp.v[i] * mult;
      expressionValue[i] = arrValue[i];
    }
    expressionValue.value = arrValue;
  }

  expressionValue.numKeys = elementProp.keyframes ? elementProp.keyframes.length : 0;
  expressionValue.key = function (pos) {
    if (!expressionValue.numKeys) {
      return 0;
    }
    return elementProp.keyframes[pos - 1].t;
  };
  expressionValue.valueAtTime = elementProp.getValueAtTime;
  expressionValue.speedAtTime = elementProp.getSpeedAtTime;
  expressionValue.velocityAtTime = elementProp.getVelocityAtTime;
  expressionValue.propertyGroup = elementProp.propertyGroup;
  Object.defineProperty(expressionValue, 'velocity', {
    get: function () {
      return elementProp.getVelocityAtTime(elementProp.comp.currentFrame);
    },
  });
  return expressionValue;
}
