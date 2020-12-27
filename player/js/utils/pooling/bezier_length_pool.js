/* global createTypedArray, defaultCurveSegments, poolFactory */
/* exported bezierLengthPool */

var bezierLengthPool = (function () {
  function create() {
    return {
      addedLength: 0,
      percents: createTypedArray('float32', defaultCurveSegments),
      lengths: createTypedArray('float32', defaultCurveSegments),
    };
  }
  return poolFactory(8, create);
}());
