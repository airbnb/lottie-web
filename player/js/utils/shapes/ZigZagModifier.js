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
  this.frequency = PropertyFactory.getProp(elem, data.r, 0, null, this);
  this._isAnimated = this.amplitude.effectsSequence.length !== 0 && this.frequency.effectsSequence.length !== 0;
};

function getNormalNormalizedVector(pt1, pt2) {
  var vector = [
    pt2[0] - pt1[0],
    pt2[1] - pt1[1],
  ];
  var rot = -Math.PI * 0.5;
  var rotatedVector = [
    Math.cos(rot) * vector[0] - Math.sin(rot) * vector[1],
    Math.sin(rot) * vector[0] + Math.cos(rot) * vector[1],
  ];
  var length = Math.sqrt(rotatedVector[0] * rotatedVector[0] + rotatedVector[1] * rotatedVector[1]);
  var normalizedVector = [
    rotatedVector[0] / length,
    rotatedVector[1] / length,
  ];
  return normalizedVector;
}

function getSurroundingVector(path, cur) {
  var prevIndex = cur === 0 ? path.length() - 1 : cur - 1;
  var nextIndex = (cur + 1) % path.length();
  var prevPoint = path.v[prevIndex];
  var nextPoint = path.v[nextIndex];
  return getNormalNormalizedVector(prevPoint, nextPoint);
}

function zigZagCorner(outputBezier, path, cur, direction, amplitude) {
  var normalizedVector = getSurroundingVector(path, cur);
  var vX = path.v[cur % path._length][0] + normalizedVector[0] * direction * amplitude;
  var vY = path.v[cur % path._length][1] + normalizedVector[1] * direction * amplitude;
  outputBezier.setTripleAt(vX, vY, vX, vY, vX, vY, outputBezier.length());
}

function zigZagSegment(outputBezier, segment, amplitude, frequency, direction) {
  for (var i = 0; i < frequency; i += 1) {
    var t = (i + 1) / (frequency + 1);
    var angle = segment.normalAngle(t);
    var point = segment.point(t);
    var px = point[0] + Math.cos(angle) * direction * amplitude;
    var py = point[1] - Math.sin(angle) * direction * amplitude;

    outputBezier.setTripleAt(px, py, px, py, px, py, outputBezier.length());

    direction = -direction;
  }

  return direction;
}

ZigZagModifier.prototype.processPath = function (path, amplitude, frequency) {
  var count = path._length;
  var clonedPath = shapePool.newElement();
  clonedPath.c = path.c;

  if (!path.c) {
    count -= 1;
  }

  if (count === 0) return clonedPath;

  var direction = -1;
  var segment = PolynomialBezier.shapeSegment(path, 0);
  zigZagCorner(clonedPath, path, 0, amplitude, direction);

  for (var i = 0; i < count; i += 1) {
    direction = zigZagSegment(clonedPath, segment, amplitude, frequency, -direction);

    if (i === count - 1 && !path.c) {
      segment = null;
    } else {
      segment = PolynomialBezier.shapeSegment(path, (i + 1) % count);
    }

    zigZagCorner(clonedPath, path, i + 1, amplitude, direction);
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
  var frequency = Math.max(0, Math.round(this.frequency.v));

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
