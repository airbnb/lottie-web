/* eslint-disable */
const BezierFactory = (function () {
  /**
     * BezierEasing - use bezier curve for transition easing function
     * by Gaëtan Renaudeau 2014 - 2026 – MIT License
     * https://github.com/gre/bezier-easing
     *
     * Credits: is based on Firefox's nsSMILKeySpline.cpp
     * Usage:
     * var spline = BezierEasing([ 0.25, 0.1, 0.25, 1.0 ])
     * spline.get(x) => returns the easing value | x must be in [0, 1] range
     *
     */

  var ob = {};
  ob.getBezierEasing = getBezierEasing;
  var beziers = {};

  function getBezierEasing(a, b, c, d, nm) {
    var str = nm || ('bez_' + a + '_' + b + '_' + c + '_' + d).replace(/\./g, 'p');
    if (beziers[str]) {
      return beziers[str];
    }
    var bezEasing = new BezierEasing([a, b, c, d]);
    beziers[str] = bezEasing;
    return bezEasing;
  }

  // Fallback for environments without Math.cbrt
  var cbrt = Math.cbrt || function (x) { return x < 0 ? -Math.pow(-x, 1 / 3) : Math.pow(x, 1 / 3); };

  // Solves x(t) = ((2a * t + 3b) * t + 3c) * t = x for t, with x in (0, 1):
  // u = 1/t is the largest real root of x·u³ − 3c·u² − 3b·u − 2a = 0
  function solveTForX(x, a, b, c) {
    var j = 1 / Math.max(c, Math.sqrt(x));
    var k = x * j;
    var l = k * j;
    var s = c * j;
    var q = b * l;
    var m = s * s + q;
    var h = -s * (s * s + 1.5 * q) - a * k * l;
    var D = h * h - m * m * m;
    var v;
    if (m === 0 || D > 1e-12 * h * h) {
      // one real root (Cardano)
      var U = -cbrt(h < 0 ? h - Math.sqrt(D) : h + Math.sqrt(D));
      v = (U + m / U) || 0;
    } else {
      // three real roots, take the largest
      var r = Math.sqrt(m);
      v = 2 * r * Math.cos(Math.acos(Math.max(-1, Math.min(1, -h / (m * r)))) / 3);
    }
    return Math.min(1, k / (v + s));
  }

  // The iterative search below is kept for curves with x1 or x2 outside [0, 1]
  // (not monotonic, solveTForX does not apply) and for x outside (0, 1).
  // These values are established by empiricism with tests (tradeoff: performance VS precision)
  var NEWTON_ITERATIONS = 4;
  var NEWTON_MIN_SLOPE = 0.001;
  var SUBDIVISION_PRECISION = 0.0000001;
  var SUBDIVISION_MAX_ITERATIONS = 10;

  var kSplineTableSize = 11;
  var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

  var float32ArraySupported = typeof Float32Array === 'function';

  function A(aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
  function B(aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
  function C(aA1) { return 3.0 * aA1; }

  // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
  function calcBezier(aT, aA1, aA2) {
    return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
  }

  // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
  function getSlope(aT, aA1, aA2) {
    return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
  }

  function binarySubdivide(aX, aA, aB, mX1, mX2) {
    var currentX,
      currentT,
      i = 0;
    do {
      currentT = aA + (aB - aA) / 2.0;
      currentX = calcBezier(currentT, mX1, mX2) - aX;
      if (currentX > 0.0) {
        aB = currentT;
      } else {
        aA = currentT;
      }
    } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
    return currentT;
  }

  function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
    for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
      var currentSlope = getSlope(aGuessT, mX1, mX2);
      if (currentSlope === 0.0) return aGuessT;
      var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
      aGuessT -= currentX / currentSlope;
    }
    return aGuessT;
  }

  /**
     * points is an array of [ mX1, mY1, mX2, mY2 ]
     */
  function BezierEasing(points) {
    this._p = points;
    this._mSampleValues = null;
    this._precomputed = false;
    var mX1 = points[0],
      mY1 = points[1],
      mX2 = points[2],
      mY2 = points[3];
    this._linear = mX1 === mY1 && mX2 === mY2;
    this._monotonic = mX1 >= 0 && mX1 <= 1 && mX2 >= 0 && mX2 <= 1;
    this._a = (3 * mX1 - 3 * mX2 + 1) / 2;
    this._b = mX2 - 2 * mX1;
    this._c = mX1;
    this._ay = 3 * mY1 - 3 * mY2 + 1;
    this._by = 3 * (mY2 - 2 * mY1);
    this._cy = 3 * mY1;

    this.get = this.get.bind(this);
  }

  BezierEasing.prototype = {

    get: function (x) {
      if (this._linear) return x;
      if (x > 0 && x < 1 && this._monotonic) {
        var t = solveTForX(x, this._a, this._b, this._c);
        return ((this._ay * t + this._by) * t + this._cy) * t;
      }
      // Because JavaScript number are imprecise, we should guarantee the extremes are right.
      if (x === 0) return 0;
      if (x === 1) return 1;
      if (!this._precomputed) this._precompute();
      return calcBezier(this._getTForX(x), this._p[1], this._p[3]);
    },

    // Private part

    _precompute: function () {
      var mX1 = this._p[0],
        mY1 = this._p[1],
        mX2 = this._p[2],
        mY2 = this._p[3];
      this._precomputed = true;
      if (mX1 !== mY1 || mX2 !== mY2) { this._calcSampleValues(); }
    },

    _calcSampleValues: function () {
      var mX1 = this._p[0],
        mX2 = this._p[2];
      this._mSampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
      for (var i = 0; i < kSplineTableSize; ++i) {
        this._mSampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
      }
    },

    /**
         * getTForX chose the fastest heuristic to determine the percentage value precisely from a given X projection.
         */
    _getTForX: function (aX) {
      var mX1 = this._p[0],
        mX2 = this._p[2],
        mSampleValues = this._mSampleValues;

      var intervalStart = 0.0;
      var currentSample = 1;
      var lastSample = kSplineTableSize - 1;

      for (; currentSample !== lastSample && mSampleValues[currentSample] <= aX; ++currentSample) {
        intervalStart += kSampleStepSize;
      }
      --currentSample;

      // Interpolate to provide an initial guess for t
      var dist = (aX - mSampleValues[currentSample]) / (mSampleValues[currentSample + 1] - mSampleValues[currentSample]);
      var guessForT = intervalStart + dist * kSampleStepSize;

      var initialSlope = getSlope(guessForT, mX1, mX2);
      if (initialSlope >= NEWTON_MIN_SLOPE) {
        return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
      } if (initialSlope === 0.0) {
        return guessForT;
      }
      return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
    },
  };

  return ob;
}());

export default BezierFactory;