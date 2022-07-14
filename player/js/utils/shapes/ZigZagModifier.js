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
  this.pointsType = PropertyFactory.getProp(elem, data.pt, 0, null, this);
  this._isAnimated = this.amplitude.effectsSequence.length !== 0 || this.frequency.effectsSequence.length !== 0 || this.pointsType.effectsSequence.length !== 0;
};

function setPoint(outputBezier, point, angle, direction, amplitude, outAmplitude, inAmplitude) {
  var angO = angle - Math.PI / 2;
  var angI = angle + Math.PI / 2;
  var px = point[0] + Math.cos(angle) * direction * amplitude;
  var py = point[1] - Math.sin(angle) * direction * amplitude;

  outputBezier.setTripleAt(
    px,
    py,
    px + Math.cos(angO) * outAmplitude,
    py - Math.sin(angO) * outAmplitude,
    px + Math.cos(angI) * inAmplitude,
    py - Math.sin(angI) * inAmplitude,
    outputBezier.length()
  );
}

function getPerpendicularVector(pt1, pt2) {
  var vector = [
    pt2[0] - pt1[0],
    pt2[1] - pt1[1],
  ];
  var rot = -Math.PI * 0.5;
  var rotatedVector = [
    Math.cos(rot) * vector[0] - Math.sin(rot) * vector[1],
    Math.sin(rot) * vector[0] + Math.cos(rot) * vector[1],
  ];
  return rotatedVector;
}

function getProjectingAngle(path, cur) {
  var prevIndex = cur === 0 ? path.length() - 1 : cur - 1;
  var nextIndex = (cur + 1) % path.length();
  var prevPoint = path.v[prevIndex];
  var nextPoint = path.v[nextIndex];
  var pVector = getPerpendicularVector(prevPoint, nextPoint);
  return Math.atan2(0, 1) - Math.atan2(pVector[1], pVector[0]);
}

function zigZagCorner(outputBezier, path, cur, amplitude, frequency, pointType, direction) {
  var angle = getProjectingAngle(path, cur);
  var point = path.v[cur % path._length];
  var prevPoint = path.v[cur === 0 ? path._length - 1 : cur - 1];
  var nextPoint = path.v[(cur + 1) % path._length];
  var prevDist = pointType === 2
    ? Math.sqrt(Math.pow(point[0] - prevPoint[0], 2) + Math.pow(point[1] - prevPoint[1], 2))
    : 0;
  var nextDist = pointType === 2
    ? Math.sqrt(Math.pow(point[0] - nextPoint[0], 2) + Math.pow(point[1] - nextPoint[1], 2))
    : 0;

  setPoint(
    outputBezier,
    path.v[cur % path._length],
    angle,
    direction,
    amplitude,
    nextDist / ((frequency + 1) * 2),
    prevDist / ((frequency + 1) * 2),
    pointType
  );
}

function zigZagSegment(outputBezier, segment, amplitude, frequency, pointType, direction) {
  for (var i = 0; i < frequency; i += 1) {
    var t = (i + 1) / (frequency + 1);

    var dist = pointType === 2
      ? Math.sqrt(Math.pow(segment.points[3][0] - segment.points[0][0], 2) + Math.pow(segment.points[3][1] - segment.points[0][1], 2))
      : 0;

    var angle = segment.normalAngle(t);
    var point = segment.point(t);
    setPoint(
      outputBezier,
      point,
      angle,
      direction,
      amplitude,
      dist / ((frequency + 1) * 2),
      dist / ((frequency + 1) * 2),
      pointType
    );

    direction = -direction;
  }

  return direction;
}

ZigZagModifier.prototype.processPath = function (path, amplitude, frequency, pointType) {
  var count = path._length;
  var clonedPath = shapePool.newElement();
  clonedPath.c = path.c;

  if (!path.c) {
    count -= 1;
  }

  if (count === 0) return clonedPath;

  var direction = -1;
  var segment = PolynomialBezier.shapeSegment(path, 0);
  zigZagCorner(clonedPath, path, 0, amplitude, frequency, pointType, direction);

  for (var i = 0; i < count; i += 1) {
    direction = zigZagSegment(clonedPath, segment, amplitude, frequency, pointType, -direction);

    if (i === count - 1 && !path.c) {
      segment = null;
    } else {
      segment = PolynomialBezier.shapeSegment(path, (i + 1) % count);
    }

    zigZagCorner(clonedPath, path, i + 1, amplitude, frequency, pointType, direction);
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
  var pointType = this.pointsType.v;

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
          localShapeCollection.addShape(this.processPath(shapePaths[j], amplitude, frequency, pointType));
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
