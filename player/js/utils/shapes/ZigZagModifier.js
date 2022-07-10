import {
  extendPrototype,
} from '../functionExtensions';
import PropertyFactory from '../PropertyFactory';
import shapePool from '../pooling/shape_pool';
import {
  ShapeModifier,
} from './ShapeModifiers';
import bez from '../bez';

function ZigZagModifier() {}
extendPrototype([ShapeModifier], ZigZagModifier);
ZigZagModifier.prototype.initModifierProperties = function (elem, data) {
  this.getValue = this.processKeys;
  this.amplitude = PropertyFactory.getProp(elem, data.s, 0, null, this);
  this.frequency = PropertyFactory.getProp(elem, data.pt, 0, null, this);
  this._isAnimated = this.amplitude.effectsSequence.length !== 0 && this.frequency.effectsSequence.length !== 0;
};

ZigZagModifier.prototype.processPath = function (path, amplitude, frequency) {
  var pathLength = path._length;
  var clonedPath = shapePool.newElement();
  clonedPath.c = path.c;
  var vX;
  var vY;
  var direction = 1;
  var j = 0;
  var next;

  if (!path.c) {
    pathLength -= 1;
  }

  for (var cur = 0; cur < pathLength; cur += 1) {
    next = (cur + 1) % pathLength;

    var coeffx = bez.polynomialCoefficients(path.v[cur][0], path.o[cur][0], path.i[next][0], path.v[next][0]);
    var coeffy = bez.polynomialCoefficients(path.v[cur][1], path.o[cur][1], path.i[next][1], path.v[next][1]);

    vX = path.v[cur][0];
    vY = path.v[cur][1];
    clonedPath.setTripleAt(vX, vY, vX, vY, vX, vY, j);
    j += 1;

    for (var i = 0; i < frequency; i += 1) {
      var t = (i + 0.5) / frequency;
      var dervx = bez.polynomialDerivative(t, coeffx[0], coeffx[1], coeffx[2]);
      var dervy = bez.polynomialDerivative(t, coeffy[0], coeffy[1], coeffy[2]);
      var px = bez.polynomialValue(t, coeffx[0], coeffx[1], coeffx[2], coeffx[3]);
      var py = bez.polynomialValue(t, coeffy[0], coeffy[1], coeffy[2], coeffy[3]);
      var normal = Math.atan2(dervx, dervy);
      vX = px + Math.cos(normal) * direction * amplitude;
      vY = py - Math.sin(normal) * direction * amplitude;

      clonedPath.setTripleAt(vX, vY, vX, vY, vX, vY, j);
      j += 1;
      direction = -direction;
    }

    direction = -direction;

    vX = path.v[next][0];
    vY = path.v[next][1];
    clonedPath.setTripleAt(vX, vY, vX, vY, vX, vY, j);
    j += 1;
  }
  return clonedPath;
};

ZigZagModifier.prototype.processShapes = function (_isFirstFrame) {
  var shapePaths;
  var i;
  var len = this.shapes.length;
  var j;
  var jLen;
  var amplitude = this.amplitude.v;
  var frequency = this.frequency.v;

  if (amplitude !== 0) {
    var shapeData;
    var localShapeCollection;
    for (i = 0; i < len; i += 1) {
      shapeData = this.shapes[i];
      localShapeCollection = shapeData.localShapeCollection;
      if (!(!shapeData.shape._mdf && !this._mdf && !_isFirstFrame)) {
        localShapeCollection.releaseShapes();
        shapeData.shape._mdf = true;
        shapePaths = shapeData.shape.paths.shapes;
        jLen = shapeData.shape.paths._length;
        for (j = 0; j < jLen; j += 1) {
          localShapeCollection.addShape(this.processPath(shapePaths[j], amplitude, frequency));
        }
      }
      shapeData.shape.paths = shapeData.localShapeCollection;
    }
  }
  if (!this.dynamicProperties.length) {
    this._mdf = false;
  }
};

export default ZigZagModifier;
