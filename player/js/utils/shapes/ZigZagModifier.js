import {
  extendPrototype,
} from '../functionExtensions';
import PropertyFactory from '../PropertyFactory';
import shapePool from '../pooling/shape_pool';
import {
  ShapeModifier,
} from './ShapeModifiers';
import { PolynomialBezier } from '../PolynomialBezier';

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

  if (!path.c) {
    pathLength -= 1;
  }

  for (var cur = 0; cur < pathLength; cur += 1) {
    var bez = PolynomialBezier.shapeSegment(path, cur);

    vX = bez.points[0][0];
    vY = bez.points[0][1];
    clonedPath.setTripleAt(vX, vY, vX, vY, vX, vY, clonedPath.length());

    for (var i = 0; i < frequency; i += 1) {
      var t = (i + 0.5) / frequency;
      var pt = bez.point(t);
      var normal = bez.normalAngle(t);
      vX = pt[0] + Math.cos(normal) * direction * amplitude;
      vY = pt[1] - Math.sin(normal) * direction * amplitude;

      clonedPath.setTripleAt(vX, vY, vX, vY, vX, vY, clonedPath.length());
      direction = -direction;
    }

    direction = -direction;

    vX = bez.points[3][0];
    vY = bez.points[3][1];
    clonedPath.setTripleAt(vX, vY, vX, vY, vX, vY, clonedPath.length());
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
  var frequency = Math.max(1, Math.round(this.frequency.v));

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
