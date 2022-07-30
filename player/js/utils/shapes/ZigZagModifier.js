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

function angleMean(a, b) {
  if (Math.abs(a - b) > Math.PI) return (a + b) / 2 + Math.PI;

  return (a + b) / 2;
}

function zigZagCorner(outputBezier, segmentBefore, segmentAfter, amplitude, direction) {
  var point;
  var angle;

  if (!segmentBefore) {
    point = segmentAfter.points[0];
    angle = segmentAfter.normalAngle(0.01);
  } else if (!segmentAfter) {
    point = segmentBefore.points[3];
    angle = segmentBefore.normalAngle(0.99);
  } else {
    point = segmentAfter.points[0];
    angle = angleMean(segmentAfter.normalAngle(0.01), segmentBefore.normalAngle(0.99));
  }

  var px = point[0] + Math.cos(angle) * direction * amplitude;
  var py = point[1] - Math.sin(angle) * direction * amplitude;
  outputBezier.setTripleAt(px, py, px, py, px, py, outputBezier.length());
}

function zigZagSegment(outputBezier, segment, amplitude, frequency, direction) {
  for (var i = 0; i < frequency; i += 1) {
    var f = (i + 1) / (frequency + 1);
    var t = segment.tAtLengthPercent(f);
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
  var segment = path.c ? PolynomialBezier.shapeSegment(path, count - 1) : null;
  var nextSegment = PolynomialBezier.shapeSegment(path, 0);

  zigZagCorner(clonedPath, segment, nextSegment, amplitude, -1);

  for (var i = 0; i < count; i += 1) {
    segment = nextSegment;

    direction = zigZagSegment(clonedPath, segment, amplitude, frequency, -direction);

    if (i === count - 1 && !path.c) {
      nextSegment = null;
    } else {
      nextSegment = PolynomialBezier.shapeSegment(path, (i + 1) % count);
    }

    zigZagCorner(clonedPath, segment, nextSegment, amplitude, direction);
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
