import {
  createTypedArray,
} from '../../utils/helpers/arrays';
import Matrix from '../../3rd_party/transformation-matrix';

function CVContextData() {
  this.saved = [];
  this.cArrPos = 0;
  this.cTr = new Matrix();
  this.cO = 1;
  var i;
  var len = 15;
  this.savedOp = createTypedArray('float32', len);
  for (i = 0; i < len; i += 1) {
    this.saved[i] = createTypedArray('float32', 16);
  }
  this._length = len;
}

CVContextData.prototype.duplicate = function () {
  var newLength = this._length * 2;
  var currentSavedOp = this.savedOp;
  this.savedOp = createTypedArray('float32', newLength);
  this.savedOp.set(currentSavedOp);
  var i = 0;
  for (i = this._length; i < newLength; i += 1) {
    this.saved[i] = createTypedArray('float32', 16);
  }
  this._length = newLength;
};

CVContextData.prototype.reset = function () {
  this.cArrPos = 0;
  this.cTr.reset();
  this.cO = 1;
};

CVContextData.prototype.popTransform = function () {
  var popped = this.saved[this.cArrPos];
  var i;
  var arr = this.cTr.props;
  for (i = 0; i < 16; i += 1) {
    arr[i] = popped[i];
  }
  return popped;
};

CVContextData.prototype.popOpacity = function () {
  var popped = this.savedOp[this.cArrPos];
  this.cO = popped;
  return popped;
};

CVContextData.prototype.pop = function () {
  this.cArrPos -= 1;
  var transform = this.popTransform();
  var opacity = this.popOpacity();
  return {
    transform: transform,
    opacity: opacity,
  };
};

CVContextData.prototype.push = function () {
  var props = this.cTr.props;
  if (this._length <= this.cArrPos) {
    this.duplicate();
  }
  var i;
  var arr = this.saved[this.cArrPos];
  for (i = 0; i < 16; i += 1) {
    arr[i] = props[i];
  }
  this.savedOp[this.cArrPos] = this.cO;
  this.cArrPos += 1;
};

CVContextData.prototype.getTransform = function () {
  return this.cTr;
};

CVContextData.prototype.getOpacity = function () {
  return this.cO;
};

CVContextData.prototype.setOpacity = function (value) {
  this.cO = value;
};

export default CVContextData;
