function floatEqual(a, b) {
  return Math.abs(a - b) * 100000 <= Math.min(Math.abs(a), Math.abs(b));
}

function floatZero(f) {
  return Math.abs(f) <= 0.00001;
}

function lerp(p0, p1, amount) {
  return p0 * (1 - amount) + p1 * amount;
}

function lerpPoint(p0, p1, amount) {
  return [lerp(p0[0], p1[0], amount), lerp(p0[1], p1[1], amount)];
}

function quadRoots(a, b, c) {
  // no root
  if (a === 0) return [];
  var s = b * b - 4 * a * c;
  // Complex roots
  if (s < 0) return [];
  var singleRoot = -b / (2 * a);
  // 1 root
  if (s === 0) return [singleRoot];
  var delta = Math.sqrt(s) / (2 * a);
  // 2 roots
  return [singleRoot - delta, singleRoot + delta];
}

function polynomialCoefficients(p0, p1, p2, p3) {
  return [
    -p0 + 3 * p1 - 3 * p2 + p3,
    3 * p0 - 6 * p1 + 3 * p2,
    -3 * p0 + 3 * p1,
    p0,
  ];
}

function singlePoint(p) {
  return new PolynomialBezier(p, p, p, p, false);
}

function PolynomialBezier(p0, p1, p2, p3, linearize) {
  if (linearize && pointEqual(p0, p1)) {
    p1 = lerpPoint(p0, p3, 1 / 3);
  }
  if (linearize && pointEqual(p2, p3)) {
    p2 = lerpPoint(p0, p3, 2 / 3);
  }
  var coeffx = polynomialCoefficients(p0[0], p1[0], p2[0], p3[0]);
  var coeffy = polynomialCoefficients(p0[1], p1[1], p2[1], p3[1]);
  this.a = [coeffx[0], coeffy[0]];
  this.b = [coeffx[1], coeffy[1]];
  this.c = [coeffx[2], coeffy[2]];
  this.d = [coeffx[3], coeffy[3]];
  this.points = [p0, p1, p2, p3];
}
PolynomialBezier.prototype.point = function (t) {
  return [
    (((this.a[0] * t) + this.b[0]) * t + this.c[0]) * t + this.d[0],
    (((this.a[1] * t) + this.b[1]) * t + this.c[1]) * t + this.d[1],
  ];
};
PolynomialBezier.prototype.derivative = function (t) {
  return [
    (3 * t * this.a[0] + 2 * this.b[0]) * t + this.c[0],
    (3 * t * this.a[1] + 2 * this.b[1]) * t + this.c[1],
  ];
};
PolynomialBezier.prototype.tangentAngle = function (t) {
  var p = this.derivative(t);
  return Math.atan2(p[1], p[0]);
};
PolynomialBezier.prototype.normalAngle = function (t) {
  var p = this.derivative(t);
  return Math.atan2(p[0], p[1]);
};

PolynomialBezier.prototype.inflectionPoints = function () {
  var denom = this.a[1] * this.b[0] - this.a[0] * this.b[1];
  if (floatZero(denom)) return [];
  var tcusp = (-0.5 * (this.a[1] * this.c[0] - this.a[0] * this.c[1])) / denom;
  var square = tcusp * tcusp - ((1 / 3) * (this.b[1] * this.c[0] - this.b[0] * this.c[1])) / denom;
  if (square < 0) return [];
  var root = Math.sqrt(square);
  if (floatZero(root)) {
    if (root > 0 && root < 1) return [tcusp];
    return [];
  }
  return [tcusp - root, tcusp + root].filter(function (r) { return r > 0 && r < 1; });
};
PolynomialBezier.prototype.split = function (t) {
  if (t <= 0) return [singlePoint(this.points[0]), this];
  if (t >= 1) return [this, singlePoint(this.points[this.points.length - 1])];
  var p10 = lerpPoint(this.points[0], this.points[1], t);
  var p11 = lerpPoint(this.points[1], this.points[2], t);
  var p12 = lerpPoint(this.points[2], this.points[3], t);
  var p20 = lerpPoint(p10, p11, t);
  var p21 = lerpPoint(p11, p12, t);
  var p3 = lerpPoint(p20, p21, t);
  return [
    new PolynomialBezier(this.points[0], p10, p20, p3, true),
    new PolynomialBezier(p3, p21, p12, this.points[3], true),
  ];
};
function extrema(bez, comp) {
  var min = bez.points[0][comp];
  var max = bez.points[bez.points.length - 1][comp];
  if (min > max) {
    var e = max;
    max = min;
    min = e;
  }
  // Derivative roots to find min/max
  var f = quadRoots(3 * bez.a[comp], 2 * bez.b[comp], bez.c[comp]);
  for (var i = 0; i < f.length; i += 1) {
    if (f[i] > 0 && f[i] < 1) {
      var val = bez.point(f[i])[comp];
      if (val < min) min = val;
      else if (val > max) max = val;
    }
  }
  return {
    min: min,
    max: max,
  };
}
PolynomialBezier.prototype.bounds = function () {
  return {
    x: extrema(this, 0),
    y: extrema(this, 1),
  };
};
PolynomialBezier.prototype.boundingBox = function () {
  var bounds = this.bounds();
  return {
    left: bounds.x.min,
    right: bounds.x.max,
    top: bounds.y.min,
    bottom: bounds.y.max,
    width: bounds.x.max - bounds.x.min,
    height: bounds.y.max - bounds.y.min,
    cx: (bounds.x.max + bounds.x.min) / 2,
    cy: (bounds.y.max + bounds.y.min) / 2,
  };
};

function intersectData(bez, t1, t2) {
  var box = bez.boundingBox();
  return {
    cx: box.cx,
    cy: box.cy,
    width: box.width,
    height: box.height,
    bez: bez,
    t: (t1 + t2) / 2,
    t1: t1,
    t2: t2,
  };
}
function splitData(data) {
  var split = data.bez.split(0.5);
  return [
    intersectData(split[0], data.t1, data.t),
    intersectData(split[1], data.t, data.t2),
  ];
}

function boxIntersect(b1, b2) {
  return Math.abs(b1.cx - b2.cx) * 2 < b1.width + b2.width
    && Math.abs(b1.cy - b2.cy) * 2 < b1.height + b2.height;
}

function intersectsImpl(d1, d2, depth, tolerance, intersections, maxRecursion) {
  if (!boxIntersect(d1, d2)) return;
  if (depth >= maxRecursion || (d1.width <= tolerance && d1.height <= tolerance && d2.width <= tolerance && d2.height <= tolerance)) {
    intersections.push([d1.t, d2.t]);
    return;
  }
  var d1s = splitData(d1);
  var d2s = splitData(d2);
  intersectsImpl(d1s[0], d2s[0], depth + 1, tolerance, intersections, maxRecursion);
  intersectsImpl(d1s[0], d2s[1], depth + 1, tolerance, intersections, maxRecursion);
  intersectsImpl(d1s[1], d2s[0], depth + 1, tolerance, intersections, maxRecursion);
  intersectsImpl(d1s[1], d2s[1], depth + 1, tolerance, intersections, maxRecursion);
}

PolynomialBezier.prototype.intersections = function (other, tolerance, maxRecursion) {
  if (tolerance === undefined) tolerance = 2;
  if (maxRecursion === undefined) maxRecursion = 7;
  var intersections = [];
  intersectsImpl(intersectData(this, 0, 1), intersectData(other, 0, 1), 0, tolerance, intersections, maxRecursion);
  return intersections;
};

PolynomialBezier.shapeSegment = function (shapePath, index) {
  var nextIndex = (index + 1) % shapePath.length();
  return new PolynomialBezier(shapePath.v[index], shapePath.o[index], shapePath.i[nextIndex], shapePath.v[nextIndex], true);
};

PolynomialBezier.shapeSegmentInverted = function (shapePath, index) {
  var nextIndex = (index + 1) % shapePath.length();
  return new PolynomialBezier(shapePath.v[nextIndex], shapePath.i[nextIndex], shapePath.o[index], shapePath.v[index], true);
};

function crossProduct(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function lineIntersection(start1, end1, start2, end2) {
  var v1 = [start1[0], start1[1], 1];
  var v2 = [end1[0], end1[1], 1];
  var v3 = [start2[0], start2[1], 1];
  var v4 = [end2[0], end2[1], 1];

  var r = crossProduct(
    crossProduct(v1, v2),
    crossProduct(v3, v4)
  );

  if (floatZero(r[2])) return null;

  return [r[0] / r[2], r[1] / r[2]];
}

function polarOffset(p, angle, length) {
  return [
    p[0] + Math.cos(angle) * length,
    p[1] - Math.sin(angle) * length,
  ];
}

function pointDistance(p1, p2) {
  return Math.hypot(p1[0] - p2[0], p1[1] - p2[1]);
}

function pointEqual(p1, p2) {
  return floatEqual(p1[0], p2[0]) && floatEqual(p1[1], p2[1]);
}

export {
  PolynomialBezier,
  lineIntersection,
  polarOffset,
  pointDistance,
  pointEqual,
  floatEqual,
};
