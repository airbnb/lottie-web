import {
  createSizedArray,
} from '../helpers/arrays';
import pointPool from '../pooling/point_pool';

function ShapePath() {
  this.c = false;
  this._length = 0;
  this._maxLength = 8;
  this.v = createSizedArray(this._maxLength);
  this.o = createSizedArray(this._maxLength);
  this.i = createSizedArray(this._maxLength);
}

ShapePath.prototype.setPathData = function (closed, len) {
  this.c = closed;
  this.setLength(len);
  var i = 0;
  while (i < len) {
    this.v[i] = pointPool.newElement();
    this.o[i] = pointPool.newElement();
    this.i[i] = pointPool.newElement();
    i += 1;
  }
};

ShapePath.prototype.setLength = function (len) {
  while (this._maxLength < len) {
    this.doubleArrayLength();
  }
  this._length = len;
};

ShapePath.prototype.doubleArrayLength = function () {
  this.v = this.v.concat(createSizedArray(this._maxLength));
  this.i = this.i.concat(createSizedArray(this._maxLength));
  this.o = this.o.concat(createSizedArray(this._maxLength));
  this._maxLength *= 2;
};

ShapePath.prototype.setXYAt = function (x, y, type, pos, replace) {
  var arr;
  this._length = Math.max(this._length, pos + 1);
  if (this._length >= this._maxLength) {
    this.doubleArrayLength();
  }
  switch (type) {
    case 'v':
      arr = this.v;
      break;
    case 'i':
      arr = this.i;
      break;
    case 'o':
      arr = this.o;
      break;
    default:
      arr = [];
      break;
  }
  if (!arr[pos] || (arr[pos] && !replace)) {
    arr[pos] = pointPool.newElement();
  }
  arr[pos][0] = x;
  arr[pos][1] = y;
};

ShapePath.prototype.setTripleAt = function (vX, vY, oX, oY, iX, iY, pos, replace) {
  this.setXYAt(vX, vY, 'v', pos, replace);
  this.setXYAt(oX, oY, 'o', pos, replace);
  this.setXYAt(iX, iY, 'i', pos, replace);
};

ShapePath.prototype.reverse = function () {
  var newPath = new ShapePath();
  newPath.setPathData(this.c, this._length);
  var vertices = this.v;
  var outPoints = this.o;
  var inPoints = this.i;
  var init = 0;
  if (this.c) {
    newPath.setTripleAt(vertices[0][0], vertices[0][1], inPoints[0][0], inPoints[0][1], outPoints[0][0], outPoints[0][1], 0, false);
    init = 1;
  }
  var cnt = this._length - 1;
  var len = this._length;

  var i;
  for (i = init; i < len; i += 1) {
    newPath.setTripleAt(vertices[cnt][0], vertices[cnt][1], inPoints[cnt][0], inPoints[cnt][1], outPoints[cnt][0], outPoints[cnt][1], i, false);
    cnt -= 1;
  }
  return newPath;
};

export default ShapePath;
