/* global createSizedArray */
/* exported pooling */

var pooling = (function () {
  function double(arr) {
    return arr.concat(createSizedArray(arr.length));
  }

  return {
    double: double,
  };
}());
