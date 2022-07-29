import {
  roundCorner,
} from '../common';
import {
  extendPrototype,
} from '../functionExtensions';
import PropertyFactory from '../PropertyFactory';
import shapePool from '../pooling/shape_pool';
import {
  ShapeModifier,
} from './ShapeModifiers';
import {
  PolynomialBezier,
  polarOffset,
  lineIntersection,
  pointDistance,
  pointEqual,
  floatEqual,
} from '../PolynomialBezier';

function linearOffset(p1, p2, amount) {
  var angle = Math.atan2(p2[0] - p1[0], p2[1] - p1[1]);
  return [
    polarOffset(p1, angle, amount),
    polarOffset(p2, angle, amount),
  ];
}

function offsetSegment(segment, amount) {
  var p0; var p1a; var p1b; var p2b; var p2a; var
    p3;
  var e;
  e = linearOffset(segment.points[0], segment.points[1], amount);
  p0 = e[0];
  p1a = e[1];
  e = linearOffset(segment.points[1], segment.points[2], amount);
  p1b = e[0];
  p2b = e[1];
  e = linearOffset(segment.points[2], segment.points[3], amount);
  p2a = e[0];
  p3 = e[1];
  var p1 = lineIntersection(p0, p1a, p1b, p2b);
  if (p1 === null) p1 = p1a;
  var p2 = lineIntersection(p2a, p3, p1b, p2b);
  if (p2 === null) p2 = p2a;

  return new PolynomialBezier(p0, p1, p2, p3);
}

function joinLines(outputBezier, seg1, seg2, lineJoin, miterLimit) {
  var p0 = seg1.points[3];
  var p1 = seg2.points[0];

  // Bevel
  if (lineJoin === 3) return p0;

  // Connected, they don't need a joint
  if (pointEqual(p0, p1)) return p0;

  // Round
  if (lineJoin === 2) {
    var angleOut = -seg1.tangentAngle(1);
    var angleIn = -seg2.tangentAngle(0) + Math.PI;
    var center = lineIntersection(
      p0,
      polarOffset(p0, angleOut + Math.PI / 2, 100),
      p1,
      polarOffset(p1, angleOut + Math.PI / 2, 100)
    );
    var radius = center ? pointDistance(center, p0) : pointDistance(p0, p1) / 2;

    var tan = polarOffset(p0, angleOut, 2 * radius * roundCorner);
    outputBezier.setXYAt(tan[0], tan[1], 'o', outputBezier.length() - 1);

    tan = polarOffset(p1, angleIn, 2 * radius * roundCorner);
    outputBezier.setTripleAt(p1[0], p1[1], p1[0], p1[1], tan[0], tan[1], outputBezier.length());

    return p1;
  }

  // Miter
  var t0 = pointEqual(p0, seg1.points[2]) ? seg1.points[0] : seg1.points[2];
  var t1 = pointEqual(p1, seg2.points[1]) ? seg2.points[3] : seg2.points[1];
  var intersection = lineIntersection(t0, p0, p1, t1);
  if (intersection && pointDistance(intersection, p0) < miterLimit) {
    outputBezier.setTripleAt(
      intersection[0],
      intersection[1],
      intersection[0],
      intersection[1],
      intersection[0],
      intersection[1],
      outputBezier.length()
    );
    return intersection;
  }

  return p0;
}

function getIntersection(a, b) {
  const intersect = a.intersections(b);

  if (intersect.length && floatEqual(intersect[0][0], 1)) intersect.shift();

  if (intersect.length) return intersect[0];

  return null;
}

function pruneSegmentIntersection(a, b) {
  var outa = a.slice();
  var outb = b.slice();
  var intersect = getIntersection(a[a.length - 1], b[0]);
  if (intersect) {
    outa[a.length - 1] = a[a.length - 1].split(intersect[0])[0];
    outb[0] = b[0].split(intersect[1])[1];
  }
  if (a.length > 1 && b.length > 1) {
    intersect = getIntersection(a[0], b[b.length - 1]);
    if (intersect) {
      return [
        [a[0].split(intersect[0])[0]],
        [b[b.length - 1].split(intersect[1])[1]],
      ];
    }
  }
  return [outa, outb];
}

function pruneIntersections(segments) {
  var e;
  for (var i = 1; i < segments.length; i += 1) {
    e = pruneSegmentIntersection(segments[i - 1], segments[i]);
    segments[i - 1] = e[0];
    segments[i] = e[1];
  }

  if (segments.length > 1) {
    e = pruneSegmentIntersection(segments[segments.length - 1], segments[0]);
    segments[segments.length - 1] = e[0];
    segments[0] = e[1];
  }

  return segments;
}

function offsetSegmentSplit(segment, amount) {
  /*
    We split each bezier segment into smaller pieces based
    on inflection points, this ensures the control point
    polygon is convex.

    (A cubic bezier can have none, one, or two inflection points)
  */
  var flex = segment.inflectionPoints();
  var left;
  var right;
  var split;
  var mid;

  if (flex.length === 0) {
    return [offsetSegment(segment, amount)];
  }

  if (flex.length === 1 || floatEqual(flex[1], 1)) {
    split = segment.split(flex[0]);
    left = split[0];
    right = split[1];

    return [
      offsetSegment(left, amount),
      offsetSegment(right, amount),
    ];
  }

  split = segment.split(flex[0]);
  left = split[0];
  var t = (flex[1] - flex[0]) / (1 - flex[0]);
  split = split[1].split(t);
  mid = split[0];
  right = split[1];

  return [
    offsetSegment(left, amount),
    offsetSegment(mid, amount),
    offsetSegment(right, amount),
  ];
}

function OffsetPathModifier() {}

extendPrototype([ShapeModifier], OffsetPathModifier);
OffsetPathModifier.prototype.initModifierProperties = function (elem, data) {
  this.getValue = this.processKeys;
  this.amount = PropertyFactory.getProp(elem, data.a, 0, null, this);
  this.miterLimit = PropertyFactory.getProp(elem, data.ml, 0, null, this);
  this.lineJoin = data.lj;
  this._isAnimated = this.amount.effectsSequence.length !== 0;
};

OffsetPathModifier.prototype.processPath = function (inputBezier, amount, lineJoin, miterLimit) {
  var outputBezier = shapePool.newElement();
  outputBezier.c = inputBezier.c;
  var count = inputBezier.length();
  if (!inputBezier.c) {
    count -= 1;
  }
  var i; var j; var segment;
  var multiSegments = [];

  for (i = 0; i < count; i += 1) {
    segment = PolynomialBezier.shapeSegment(inputBezier, i);
    multiSegments.push(offsetSegmentSplit(segment, amount));
  }

  if (!inputBezier.c) {
    for (i = count - 1; i >= 0; i -= 1) {
      segment = PolynomialBezier.shapeSegmentInverted(inputBezier, i);
      multiSegments.push(offsetSegmentSplit(segment, amount));
    }
  }

  multiSegments = pruneIntersections(multiSegments);

  // Add bezier segments to the output and apply line joints
  var lastPoint = null;
  var lastSeg = null;

  for (i = 0; i < multiSegments.length; i += 1) {
    var multiSegment = multiSegments[i];

    if (lastSeg) lastPoint = joinLines(outputBezier, lastSeg, multiSegment[0], lineJoin, miterLimit);

    lastSeg = multiSegment[multiSegment.length - 1];

    for (j = 0; j < multiSegment.length; j += 1) {
      segment = multiSegment[j];

      if (lastPoint && pointEqual(segment.points[0], lastPoint)) {
        outputBezier.setXYAt(segment.points[1][0], segment.points[1][1], 'o', outputBezier.length() - 1);
      } else {
        outputBezier.setTripleAt(
          segment.points[0][0],
          segment.points[0][1],
          segment.points[1][0],
          segment.points[1][1],
          segment.points[0][0],
          segment.points[0][1],
          outputBezier.length()
        );
      }

      outputBezier.setTripleAt(
        segment.points[3][0],
        segment.points[3][1],
        segment.points[3][0],
        segment.points[3][1],
        segment.points[2][0],
        segment.points[2][1],
        outputBezier.length()
      );

      lastPoint = segment.points[3];
    }
  }

  if (multiSegments.length) joinLines(outputBezier, lastSeg, multiSegments[0][0], lineJoin, miterLimit);

  return outputBezier;
};

OffsetPathModifier.prototype.processShapes = function (_isFirstFrame) {
  var shapePaths;
  var i;
  var len = this.shapes.length;
  var j;
  var jLen;
  var amount = this.amount.v;
  var miterLimit = this.miterLimit.v;
  var lineJoin = this.lineJoin;

  if (amount !== 0) {
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
          localShapeCollection.addShape(this.processPath(shapePaths[j], amount, lineJoin, miterLimit));
        }
      }
      shapeData.shape.paths = shapeData.localShapeCollection;
    }
  }
  if (!this.dynamicProperties.length) {
    this._mdf = false;
  }
};

export default OffsetPathModifier;
