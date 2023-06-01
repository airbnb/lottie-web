import {
  createTypedArray,
} from '../../utils/helpers/arrays';
import Matrix from '../../3rd_party/transformation-matrix';

function CanvasContext() {
  this.opacity = -1;
  this.transform = createTypedArray('float32', 16);
  this.fillStyle = '';
  this.strokeStyle = '';
  this.lineWidth = '';
  this.lineCap = '';
  this.lineJoin = '';
  this.miterLimit = '';
  this.id = Math.random();
}

function CVContextData() {
  this.stack = [];
  this.cArrPos = 0;
  this.cTr = new Matrix();
  var i;
  var len = 15;
  for (i = 0; i < len; i += 1) {
    var canvasContext = new CanvasContext();
    this.stack[i] = canvasContext;
  }
  this._length = len;
  this.nativeContext = null;
  this.transformMat = new Matrix();
  this.currentOpacity = 1;
  this.currentFillStyle = '';
  this.currentStrokeStyle = '';
  this.currentLineWidth = '';
  this.currentLineCap = '';
  this.currentLineJoin = '';
  this.currentMiterLimit = '';
}

CVContextData.prototype.duplicate = function () {
  var newLength = this._length * 2;
  var i = 0;
  for (i = this._length; i < newLength; i += 1) {
    this.stack[i] = new CanvasContext();
  }
  this._length = newLength;
};

CVContextData.prototype.reset = function () {
  this.cArrPos = 0;
  this.cTr.reset();
  this.stack[this.cArrPos].opacity = 1;
};

CVContextData.prototype.restore = function (forceRestore) {
  this.cArrPos -= 1;
  var currentContext = this.stack[this.cArrPos];
  var transform = currentContext.transform;
  var i;
  var arr = this.cTr.props;
  for (i = 0; i < 16; i += 1) {
    arr[i] = transform[i];
  }
  this.nativeContext.setTransform(transform[0], transform[1], transform[4], transform[5], transform[12], transform[13]);
  if (forceRestore || (currentContext.opacity !== -1 && this.currentOpacity !== currentContext.opacity)) {
    this.nativeContext.globalAlpha = currentContext.opacity;
    this.currentOpacity = currentContext.opacity;
  }
  if (forceRestore || (currentContext.fillStyle && this.currentFillStyle !== currentContext.fillStyle)) {
    this.nativeContext.fillStyle = currentContext.fillStyle;
    this.currentFillStyle = currentContext.fillStyle;
  }
  if (forceRestore || (currentContext.strokeStyle && this.currentStrokeStyle !== currentContext.strokeStyle)) {
    this.nativeContext.strokeStyle = currentContext.strokeStyle;
    this.currentStrokeStyle = currentContext.strokeStyle;
  }
  if (forceRestore || (currentContext.lineWidth && this.currentLineWidth !== currentContext.lineWidth)) {
    this.nativeContext.lineWidth = currentContext.lineWidth;
    this.currentLineWidth = currentContext.lineWidth;
  }
  if (forceRestore || (currentContext.lineCap && this.currentLineCap !== currentContext.lineCap)) {
    this.nativeContext.lineCap = currentContext.lineCap;
    this.currentLineCap = currentContext.lineCap;
  }
  if (forceRestore || (currentContext.lineJoin && this.currentLineJoin !== currentContext.lineJoin)) {
    this.nativeContext.lineJoin = currentContext.lineJoin;
    this.currentLineJoin = currentContext.lineJoin;
  }
  if (currentContext.miterLimit && this.currentMiterLimit !== currentContext.miterLimit) {
    this.nativeContext.miterLimit = currentContext.miterLimit;
    this.currentMiterLimit = currentContext.miterLimit;
  }
};

CVContextData.prototype.save = function () {
  var props = this.cTr.props;
  if (this._length <= this.cArrPos) {
    this.duplicate();
  }

  var currentStack = this.stack[this.cArrPos];
  var i;
  for (i = 0; i < 16; i += 1) {
    currentStack.transform[i] = props[i];
  }
  this.cArrPos += 1;
  var newStack = this.stack[this.cArrPos];
  newStack.opacity = currentStack.opacity;
  newStack.fillStyle = currentStack.fillStyle;
  newStack.strokeStyle = currentStack.strokeStyle;
  newStack.lineWidth = currentStack.lineWidth;
  newStack.lineCap = currentStack.lineCap;
  newStack.lineJoin = currentStack.lineJoin;
  newStack.miterLimit = currentStack.miterLimit;
};

CVContextData.prototype.setOpacity = function (value) {
  this.stack[this.cArrPos].opacity = value;
};

CVContextData.prototype.setContext = function (value) {
  this.nativeContext = value;
};

CVContextData.prototype.fillStyle = function (value) {
  if (this.stack[this.cArrPos].fillStyle !== value) {
    if (this.currentFillStyle !== value) {
      this.currentFillStyle = value;
      this.nativeContext.fillStyle = value;
    }
    this.stack[this.cArrPos].fillStyle = value;
  }
};

CVContextData.prototype.strokeStyle = function (value) {
  if (this.stack[this.cArrPos].strokeStyle !== value) {
    if (this.currentStrokeStyle !== value) {
      this.nativeContext.strokeStyle = value;
      this.currentStrokeStyle = value;
    }
    this.stack[this.cArrPos].strokeStyle = value;
  }
};

CVContextData.prototype.lineWidth = function (value) {
  if (this.stack[this.cArrPos].lineWidth !== value) {
    if (this.currentLineWidth !== value) {
      this.nativeContext.lineWidth = value;
      this.currentLineWidth = value;
    }
    this.stack[this.cArrPos].lineWidth = value;
  }
};

CVContextData.prototype.lineCap = function (value) {
  if (this.stack[this.cArrPos].lineCap !== value) {
    if (this.currentLineCap !== value) {
      this.nativeContext.lineCap = value;
      this.currentLineCap = value;
    }
    this.stack[this.cArrPos].lineCap = value;
  }
};

CVContextData.prototype.lineJoin = function (value) {
  if (this.stack[this.cArrPos].lineJoin !== value) {
    if (this.currentLineJoin !== value) {
      this.nativeContext.lineJoin = value;
      this.currentLineJoin = value;
    }
    this.stack[this.cArrPos].lineJoin = value;
  }
};

CVContextData.prototype.miterLimit = function (value) {
  if (this.stack[this.cArrPos].miterLimit !== value) {
    if (this.currentMiterLimit !== value) {
      this.nativeContext.miterLimit = value;
      this.currentMiterLimit = value;
    }
    this.stack[this.cArrPos].miterLimit = value;
  }
};

CVContextData.prototype.transform = function (props) {
  this.transformMat.cloneFromProps(props);
  // Taking the last transform value from the stored stack of transforms
  var currentTransform = this.cTr;
  // Applying the last transform value after the new transform to respect the order of transformations
  this.transformMat.multiply(currentTransform);
  // Storing the new transformed value in the stored transform
  currentTransform.cloneFromProps(this.transformMat.props);
  var trProps = currentTransform.props;
  // Applying the new transform to the canvas
  this.nativeContext.setTransform(trProps[0], trProps[1], trProps[4], trProps[5], trProps[12], trProps[13]);
};

CVContextData.prototype.opacity = function (op) {
  var currentOpacity = this.stack[this.cArrPos].opacity;
  currentOpacity *= op < 0 ? 0 : op;
  if (this.stack[this.cArrPos].opacity !== currentOpacity) {
    if (this.currentOpacity !== op) {
      this.nativeContext.globalAlpha = op;
      this.currentOpacity = op;
    }
    this.stack[this.cArrPos].opacity = currentOpacity;
  }
};

export default CVContextData;
