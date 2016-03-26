/*!
	2D Transformation Matrix v2.3.2
	(c) Epistemex.com 2014-2016
	License: MIT, header required.
*/

/* --- To see contributors: please see readme.md and Change.log --- */

/**
 * 2D transformation matrix object initialized with identity matrix.
 *
 * The matrix can synchronize a canvas 2D context by supplying the context
 * as an argument, or later apply current absolute transform to an
 * existing context.
 *
 * To synchronize a DOM element you can use [`toCSS()`]{@link Matrix#toCSS} or [`toCSS3D()`]{@link Matrix#toCSS3D}.
 *
 * @param {CanvasRenderingContext2D} [context] - Optional context to sync with Matrix
 * @prop {number} a - scale x
 * @prop {number} b - shear y
 * @prop {number} c - shear x
 * @prop {number} d - scale y
 * @prop {number} e - translate x
 * @prop {number} f - translate y
 * @prop {CanvasRenderingContext2D|null} [context=null] - set or get current canvas context
 * @constructor
 * @license MIT license (header required)
 * @copyright Epistemex.com 2014-2016
 */
function Matrix(context) {

	var me = this;
	me._t = me.transform;

	me.a = me.d = 1;
	me.b = me.c = me.e = me.f = 0;

	// reset canvas to enable 100% sync.
	if (context)
		(me.context = context).setTransform(1, 0, 0, 1, 0, 0);
}

/**
 * Returns a new matrix that transforms a triangle `t1` into another triangle
 * `t2`, or throws an exception if it is impossible.
 *
 * Note: the method can take both arrays as well as literal objects.
 * Just make sure that both arguments (`t1`, `t2`) are of the same type.
 *
 * @param {{px: number, py: number, qx: number, qy: number, rx: number, ry: number}|Array} t1 - Object or array containing the three points for the triangle.
 * For object use obj.px, obj.py, obj.qx, obj.qy, obj.rx and obj.ry. For arrays provide the points in the order [px, py, qx, qy, rx, ry]
 * @param {{px: number, py: number, qx: number, qy: number, rx: number, ry: number}|Array} t2 - See description for t1.
 * @param {CanvasRenderingContext2D} [context] - optional canvas 2D context to use for the matrix
 * @returns {Matrix}
 * @throws Exception is matrix becomes not invertible
 * @static
 */
Matrix.fromTriangles = function(t1, t2, context) {

	var m1 = new Matrix(),
		m2 = new Matrix(context),
		r1, r2;

	if (Array.isArray(t1)) {
		var rx1 = t1[4], ry1 = t1[5], rx2 = t2[4], ry2 = t2[5];
		r1 = [t1[0] - rx1, t1[1] - ry1, t1[2] - rx1, t1[3] - ry1, rx1, ry1];
		r2 = [t2[0] - rx2, t2[1] - ry2, t2[2] - rx2, t2[3] - ry2, rx2, ry2]
	}
	else {
		r1 = [t1.px - t1.rx, t1.py - t1.ry, t1.qx - t1.rx, t1.qy - t1.ry, t1.rx, t1.ry];
		r2 = [t2.px - t2.rx, t2.py - t2.ry, t2.qx - t2.rx, t2.qy - t2.ry, t2.rx, t2.ry]
	}

	m1.setTransform.apply(m1, r1);
	m2.setTransform.apply(m2, r2);

	return m2.multiply(m1.inverse())
};

/**
 * Create a new matrix from a SVGMatrix
 *
 * @param {SVGMatrix} svgMatrix - source SVG Matrix
 * @param {CanvasRenderingContext2D} [context] - optional canvas 2D context to use for the matrix
 * @returns {Matrix}
 * @static
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGMatrix|MDN / SVGMatrix}
 */
Matrix.fromSVGMatrix = function(svgMatrix, context) {
	return new Matrix(context).multiply(svgMatrix)
};

/**
 * Create a matrix from a transform list from an SVG shape. The list
 * can be for example baseVal (i.e. `shape.transform.baseVal`).
 *
 * The resulting matrix has all transformations from that list applied
 * in the same order as the list.
 *
 * @param {SVGTransformList} tList - transform list from an SVG shape.
 * @param {CanvasRenderingContext2D} [context] - optional canvas 2D context to use for the matrix
 * @returns {Matrix}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGTransformList|MDN / SVGTransformList}
 */
Matrix.fromSVGTransformList = function(tList, context) {

	var m = new Matrix(context),
		i = 0;

	while(i < tList.length)
		m.multiply(tList[i++].matrix);

	return m
};

Matrix.prototype = {

	/**
	 * Concatenates transforms of this matrix onto the given child matrix and
	 * returns a new matrix. This instance is used on left side.
	 *
	 * @param {Matrix} cm - child matrix to apply concatenation to
	 * @returns {Matrix} - new Matrix instance
	 */
	concat: function(cm) {
		return this.clone().multiply(cm)
	},

	/**
	 * Flips the horizontal values.
	 * @returns {Matrix}
	 */
	flipX: function() {
		return this._t(-1, 0, 0, 1, 0, 0)
	},

	/**
	 * Flips the vertical values.
	 * @returns {Matrix}
	 */
	flipY: function() {
		return this._t(1, 0, 0, -1, 0, 0)
	},

	/**
	 * Reflects incoming (velocity) vector on the normal which will be the
	 * current transformed x axis. Call when a trigger condition is met.
	 *
	 * @param {number} x - vector end point for x (start = 0)
	 * @param {number} y - vector end point for y (start = 0)
	 * @returns {{x: number, y: number}}
	 */
	reflectVector: function(x, y) {

		var v = this.applyToPoint(0, 1),
			d = (v.x * x + v.y * y) * 2;

		x -= d * v.x;
		y -= d * v.y;

		return {x: x, y: y}
	},

	/**
	 * Short-hand to reset current matrix to an identity matrix.
	 * @returns {Matrix}
	 */
	reset: function() {
		return this.setTransform(1, 0, 0, 1, 0, 0)
	},

	/**
	 * Rotates current matrix by angle (accumulative).
	 * @param {number} angle - angle in radians
	 * @returns {Matrix}
	 */
	rotate: function(angle) {
		var cos = Math.cos(angle),
			sin = Math.sin(angle);
		return this._t(cos, sin, -sin, cos, 0, 0)
	},

	/**
	 * Converts a vector given as `x` and `y` to angle, and
	 * rotates (accumulative).
	 * @param x
	 * @param y
	 * @returns {Matrix}
	 */
	rotateFromVector: function(x, y) {
		return this.rotate(Math.atan2(y, x))
	},

	/**
	 * Helper method to make a rotation based on an angle in degrees.
	 * @param {number} angle - angle in degrees
	 * @returns {Matrix}
	 */
	rotateDeg: function(angle) {
		return this.rotate(angle * Math.PI / 180)
	},

	/**
	 * Scales current matrix uniformly and accumulative.
	 * @param {number} f - scale factor for both x and y (1 does nothing)
	 * @returns {Matrix}
	 */
	scaleU: function(f) {
		return this._t(f, 0, 0, f, 0, 0)
	},

	/**
	 * Scales current matrix accumulative.
	 * @param {number} sx - scale factor x (1 does nothing)
	 * @param {number} sy - scale factor y (1 does nothing)
	 * @returns {Matrix}
	 */
	scale: function(sx, sy) {
		return this._t(sx, 0, 0, sy, 0, 0)
	},

	/**
	 * Scales current matrix on x axis accumulative.
	 * @param {number} sx - scale factor x (1 does nothing)
	 * @returns {Matrix}
	 */
	scaleX: function(sx) {
		return this._t(sx, 0, 0, 1, 0, 0)
	},

	/**
	 * Scales current matrix on y axis accumulative.
	 * @param {number} sy - scale factor y (1 does nothing)
	 * @returns {Matrix}
	 */
	scaleY: function(sy) {
		return this._t(1, 0, 0, sy, 0, 0)
	},

	/**
	 * Apply shear to the current matrix accumulative.
	 * @param {number} sx - amount of shear for x
	 * @param {number} sy - amount of shear for y
	 * @returns {Matrix}
	 */
	shear: function(sx, sy) {
		return this._t(1, sy, sx, 1, 0, 0)
	},

	/**
	 * Apply shear for x to the current matrix accumulative.
	 * @param {number} sx - amount of shear for x
	 * @returns {Matrix}
	 */
	shearX: function(sx) {
		return this._t(1, 0, sx, 1, 0, 0)
	},

	/**
	 * Apply shear for y to the current matrix accumulative.
	 * @param {number} sy - amount of shear for y
	 * @returns {Matrix}
	 */
	shearY: function(sy) {
		return this._t(1, sy, 0, 1, 0, 0)
	},

	/**
	 * Apply skew to the current matrix accumulative.
	 * @param {number} ax - angle of skew for x
	 * @param {number} ay - angle of skew for y
	 * @returns {Matrix}
	 */
	skew: function(ax, ay) {
		return this.shear(Math.tan(ax), Math.tan(ay))
	},

	/**
	 * Apply skew for x to the current matrix accumulative.
	 * @param {number} ax - angle of skew for x
	 * @returns {Matrix}
	 */
	skewX: function(ax) {
		return this.shearX(Math.tan(ax))
	},

	/**
	 * Apply skew for y to the current matrix accumulative.
	 * @param {number} ay - angle of skew for y
	 * @returns {Matrix}
	 */
	skewY: function(ay) {
		return this.shearY(Math.tan(ay))
	},

	/**
	 * Set current matrix to new absolute matrix.
	 * @param {number} a - scale x
	 * @param {number} b - shear y
	 * @param {number} c - shear x
	 * @param {number} d - scale y
	 * @param {number} e - translate x
	 * @param {number} f - translate y
	 * @returns {Matrix}
	 */
	setTransform: function(a, b, c, d, e, f) {
		var me = this;
		me.a = a;
		me.b = b;
		me.c = c;
		me.d = d;
		me.e = e;
		me.f = f;
		return me._x()
	},

	/**
	 * Translate current matrix accumulative.
	 * @param {number} tx - translation for x
	 * @param {number} ty - translation for y
	 * @returns {Matrix}
	 */
	translate: function(tx, ty) {
		return this._t(1, 0, 0, 1, tx, ty)
	},

	/**
	 * Translate current matrix on x axis accumulative.
	 * @param {number} tx - translation for x
	 * @returns {Matrix}
	 */
	translateX: function(tx) {
		return this._t(1, 0, 0, 1, tx, 0)
	},

	/**
	 * Translate current matrix on y axis accumulative.
	 * @param {number} ty - translation for y
	 * @returns {Matrix}
	 */
	translateY: function(ty) {
		return this._t(1, 0, 0, 1, 0, ty)
	},

	/**
	 * Multiplies current matrix with new matrix values. Also see [`multiply()`]{@link Matrix#multiply}.
	 *
	 * @param {number} a2 - scale x
	 * @param {number} b2 - shear y
	 * @param {number} c2 - shear x
	 * @param {number} d2 - scale y
	 * @param {number} e2 - translate x
	 * @param {number} f2 - translate y
	 * @returns {Matrix}
	 */
	transform: function(a2, b2, c2, d2, e2, f2) {

		var me = this,
			a1 = me.a,
			b1 = me.b,
			c1 = me.c,
			d1 = me.d,
			e1 = me.e,
			f1 = me.f;

		/* matrix order (canvas compatible):
		* ace
		* bdf
		* 001
		*/
		me.a = a1 * a2 + c1 * b2;
		me.b = b1 * a2 + d1 * b2;
		me.c = a1 * c2 + c1 * d2;
		me.d = b1 * c2 + d1 * d2;
		me.e = a1 * e2 + c1 * f2 + e1;
		me.f = b1 * e2 + d1 * f2 + f1;

		return me._x()
	},

	/**
	 * Multiplies current matrix with source matrix.
	 * @param {Matrix|SVGMatrix} m - source matrix to multiply with.
	 * @returns {Matrix}
	 */
	multiply: function(m) {
		return this._t(m.a, m.b, m.c, m.d, m.e, m.f)
	},

	/**
	 * Divide this matrix on input matrix which must be invertible.
	 * @param {Matrix} m - matrix to divide on (divisor)
	 * @throws Exception is input matrix is not invertible
	 * @returns {Matrix}
	 */
	divide: function(m) {

		if (!m.isInvertible())
			throw "Matrix not invertible";

		return this.multiply(m.inverse())
	},

	/**
	 * Divide current matrix on scalar value != 0.
	 * @param {number} d - divisor (can not be 0)
	 * @returns {Matrix}
	 */
	divideScalar: function(d) {

		var me = this;
		me.a /= d;
		me.b /= d;
		me.c /= d;
		me.d /= d;
		me.e /= d;
		me.f /= d;

		return me._x()
	},

	/**
	 * Get an inverse matrix of current matrix. The method returns a new
	 * matrix with values you need to use to get to an identity matrix.
	 * Context from parent matrix is not applied to the returned matrix.
	 *
	 * @param {boolean} [cloneContext=false] - clone current context to resulting matrix
	 * @throws Exception is input matrix is not invertible
	 * @returns {Matrix} - new Matrix instance
	 */
	inverse: function(cloneContext) {

		var me = this,
			m  = new Matrix(cloneContext ? me.context : null),
			dt = me.determinant();

		if (me._q(dt, 0))
			throw "Matrix not invertible.";

		m.a = me.d / dt;
		m.b = -me.b / dt;
		m.c = -me.c / dt;
		m.d = me.a / dt;
		m.e = (me.c * me.f - me.d * me.e) / dt;
		m.f = -(me.a * me.f - me.b * me.e) / dt;

		return m
	},

	/**
	 * Interpolate this matrix with another and produce a new matrix.
	 * `t` is a value in the range [0.0, 1.0] where 0 is this instance and
	 * 1 is equal to the second matrix. The `t` value is not clamped.
	 *
	 * Context from parent matrix is not applied to the returned matrix.
	 *
	 * Note: this interpolation is naive. For animation containing rotation,
	 * shear or skew use the [`interpolateAnim()`]{@link Matrix#interpolateAnim} method instead
	 * to avoid unintended flipping.
	 *
	 * @param {Matrix} m2 - the matrix to interpolate with.
	 * @param {number} t - interpolation [0.0, 1.0]
	 * @param {CanvasRenderingContext2D} [context] - optional context to affect
	 * @returns {Matrix} - new Matrix instance with the interpolated result
	 */
	interpolate: function(m2, t, context) {

		var me = this,
			m  = context ? new Matrix(context) : new Matrix();

		m.a = me.a + (m2.a - me.a) * t;
		m.b = me.b + (m2.b - me.b) * t;
		m.c = me.c + (m2.c - me.c) * t;
		m.d = me.d + (m2.d - me.d) * t;
		m.e = me.e + (m2.e - me.e) * t;
		m.f = me.f + (m2.f - me.f) * t;

		return m._x()
	},

	/**
	 * Interpolate this matrix with another and produce a new matrix.
	 * `t` is a value in the range [0.0, 1.0] where 0 is this instance and
	 * 1 is equal to the second matrix. The `t` value is not constrained.
	 *
	 * Context from parent matrix is not applied to the returned matrix.
	 *
	 * To obtain easing `t` can be preprocessed using easing-functions
	 * before being passed to this method.
	 *
	 * Note: this interpolation method uses decomposition which makes
	 * it suitable for animations (in particular where rotation takes
	 * places).
	 *
	 * @param {Matrix} m2 - the matrix to interpolate with.
	 * @param {number} t - interpolation [0.0, 1.0]
	 * @param {CanvasRenderingContext2D} [context] - optional context to affect
	 * @returns {Matrix} - new Matrix instance with the interpolated result
	 */
	interpolateAnim: function(m2, t, context) {

		var m          = new Matrix(context ? context : null),
			d1         = this.decompose(),
			d2         = m2.decompose(),
			t1         = d1.translate,
			t2         = d2.translate,
			s1         = d1.scale,
			rotation   = d1.rotation + (d2.rotation - d1.rotation) * t,
			translateX = t1.x + (t2.x - t1.x) * t,
			translateY = t1.y + (t2.y - t1.y) * t,
			scaleX     = s1.x + (d2.scale.x - s1.x) * t,
			scaleY     = s1.y + (d2.scale.y - s1.y) * t
			;

		// QR order (t-r-s-sk)
		m.translate(translateX, translateY);
		m.rotate(rotation);
		m.scale(scaleX, scaleY);
		//todo test skew scenarios

		return m._x()
	},

	/**
	 * Decompose the current matrix into simple transforms using either
	 * QR (default) or LU decomposition.
	 *
	 * The result must be applied in the following order to reproduce the current matrix:
	 *
	 *     QR: translate -> rotate -> scale -> skew
	 *     LU: translate -> skew   -> scale -> skew
	 *
	 * @param {boolean} [useLU=false] - set to true to use LU rather than QR algorithm
	 * @returns {*} - an object containing current decomposed values (rotate, skew, scale, translate)
	 * @see {@link http://www.maths-informatique-jeux.com/blog/frederic/?post/2013/12/01/Decomposition-of-2D-transform-matrices|Adoption based on this code}
	 */
	decompose: function(useLU) {

		var me        = this,
			a         = me.a,
			b         = me.b,
			c         = me.c,
			d         = me.d,
			acos      = Math.acos,
			atan      = Math.atan,
			sqrt      = Math.sqrt,
			pi        = Math.PI,

			translate = {x: me.e, y: me.f},
			rotation  = 0,
			scale     = {x: 1, y: 1},
			skew      = {x: 0, y: 0},

			determ    = a * d - b * c;	// determinant(), skip DRY here...

		if (useLU) {
			if (a) {
				skew = {x: atan(c / a), y: atan(b / a)};
				scale = {x: a, y: determ / a};
			}
			else if (b) {
				rotation = pi * 0.5;
				scale = {x: b, y: determ / b};
				skew.x = atan(d / b);
			}
			else { // a = b = 0
				scale = {x: c, y: d};
				skew.x = pi * 0.25;
			}
		}
		else {
			// Apply the QR-like decomposition.
			if (a || b) {
				var r = sqrt(a * a + b * b);
				rotation = b > 0 ? acos(a / r) : -acos(a / r);
				scale = {x: r, y: determ / r};
				skew.x = atan((a * c + b * d) / (r * r));
			}
			else if (c || d) {
				var s = sqrt(c * c + d * d);
				rotation = pi * 0.5 - (d > 0 ? acos(-c / s) : -acos(c / s));
				scale = {x: determ / s, y: s};
				skew.y = atan((a * c + b * d) / (s * s));
			}
			else { // a = b = c = d = 0
				scale = {x: 0, y: 0};		// = invalid matrix
			}
		}

		return {
			scale    : scale,
			translate: translate,
			rotation : rotation,
			skew     : skew
		}
	},

	/**
	 * Returns the determinant of the current matrix.
	 * @returns {number}
	 */
	determinant: function() {
		return this.a * this.d - this.b * this.c
	},

	/**
	 * Apply current matrix to `x` and `y` of a point.
	 * Returns a point object.
	 *
	 * @param {number} x - value for x
	 * @param {number} y - value for y
	 * @returns {{x: number, y: number}} A new transformed point object
	 */
	applyToPoint: function(x, y) {

		var me = this;

		return {
			x: x * me.a + y * me.c + me.e,
			y: x * me.b + y * me.d + me.f
		}
	},

	/**
	 * Apply current matrix to array with point objects or point pairs.
	 * Returns a new array with points in the same format as the input array.
	 *
	 * A point object is an object literal:
	 *
	 *     {x: x, y: y}
	 *
	 * so an array would contain either:
	 *
	 *     [{x: x1, y: y1}, {x: x2, y: y2}, ... {x: xn, y: yn}]
	 *
	 * or
	 *
	 *     [x1, y1, x2, y2, ... xn, yn]
	 *
	 * @param {Array} points - array with point objects or pairs
	 * @returns {Array} A new array with transformed points
	 */
	applyToArray: function(points) {

		var i = 0, p, l,
			mxPoints = [];

		if (typeof points[0] === 'number') {

			l = points.length;

			while(i < l) {
				p = this.applyToPoint(points[i++], points[i++]);
				mxPoints.push(p.x, p.y);
			}
		}
		else {
			while(p = points[i++]) {
				mxPoints.push(this.applyToPoint(p.x, p.y));
			}
		}

		return mxPoints
	},

	/**
	 * Apply current matrix to a typed array with point pairs. Although
	 * the input array may be an ordinary array, this method is intended
	 * for more performant use where typed arrays are used. The returned
	 * array is regardless always returned as a `Float32Array`.
	 *
	 * @param {*} points - (typed) array with point pairs [x1, y1, ..., xn, yn]
	 * @param {boolean} [use64=false] - use Float64Array instead of Float32Array
	 * @returns {*} A new typed array with transformed points
	 */
	applyToTypedArray: function(points, use64) {

		var i = 0, p,
			l = points.length,
			mxPoints = use64 ? new Float64Array(l) : new Float32Array(l);

		while(i < l) {
			p = this.applyToPoint(points[i], points[i + 1]);
			mxPoints[i++] = p.x;
			mxPoints[i++] = p.y;
		}

		return mxPoints
	},

	/**
	 * Apply to any canvas 2D context object. This does not affect the
	 * context that optionally was referenced in constructor unless it is
	 * the same context.
	 *
	 * @param {CanvasRenderingContext2D} context - target context
	 * @returns {Matrix}
	 */
	applyToContext: function(context) {
		var me = this;
		context.setTransform(me.a, me.b, me.c, me.d, me.e, me.f);
		return me
	},

	/**
	 * Returns true if matrix is an identity matrix (no transforms applied).
	 * @returns {boolean}
	 */
	isIdentity: function() {
		var me = this;
		return me._q(me.a, 1) &&
			me._q(me.b, 0) &&
			me._q(me.c, 0) &&
			me._q(me.d, 1) &&
			me._q(me.e, 0) &&
			me._q(me.f, 0)
	},

	/**
	 * Returns true if matrix is invertible
	 * @returns {boolean}
	 */
	isInvertible: function() {
		return !this._q(this.determinant(), 0)
	},

	/**
	 * Test if matrix is valid (here meaning the scale values are non-zero).
	 * @returns {boolean}
	 */
	isValid: function() {
		return !(this.a * this.d)
	},

	/**
	 * Compares current matrix with another matrix. Returns true if equal
	 * (within epsilon tolerance).
	 * @param {Matrix} m - matrix to compare this matrix with
	 * @returns {boolean}
	 */
	isEqual: function(m) {

		var me = this,
			q = me._q;

		return  q(me.a, m.a) &&
				q(me.b, m.b) &&
				q(me.c, m.c) &&
				q(me.d, m.d) &&
				q(me.e, m.e) &&
				q(me.f, m.f)
	},

	/**
	 * Clones current instance and returning a new matrix.
	 * @param {boolean} [noContext=false] don't clone context reference if true
	 * @returns {Matrix} - a new Matrix instance with identical transformations as this instance
	 */
	clone: function(noContext) {
		return new Matrix(noContext ? null : this.context).multiply(this)
	},

	/**
	 * Returns an array with current matrix values.
	 * @returns {Array}
	 */
	toArray: function() {
		var me = this;
		return [me.a, me.b, me.c, me.d, me.e, me.f]
	},

	/**
	 * Returns a binary typed array, either as 32-bit (default) or
	 * 64-bit.
	 * @param {boolean} [use64=false] chose whether to use 32-bit or 64-bit typed array
	 * @returns {*}
	 */
	toTypedArray: function(use64) {

		var a  = use64 ? new Float64Array(6) : new Float32Array(6),
			me = this;

		a[0] = me.a;
		a[1] = me.b;
		a[2] = me.c;
		a[3] = me.d;
		a[4] = me.e;
		a[5] = me.f;

		return a
	},

	/**
	 * Generates a string that can be used with CSS `transform`.
	 * @example
	 *     element.style.transform = m.toCSS();
	 * @returns {string}
	 */
	toCSS: function() {
		return "matrix(" + this.toArray() + ")"
	},

	/**
	 * Generates a `matrix3d()` string that can be used with CSS `transform`.
	 * Although the matrix is for 2D use you may see performance benefits
	 * on some devices using a 3D CSS transform instead of a 2D.
	 * @example
	 *     element.style.transform = m.toCSS3D();
	 * @returns {string}
	 */
	toCSS3D: function() {
		var me = this;
		return "matrix3d(" + me.a + "," + me.b + ",0,0," + me.c + "," + me.d + ",0,0,0,0,1,0," + me.e + "," + me.f + ",0,1)"
	},

	/**
	 * Returns a JSON compatible string of current matrix.
	 * @returns {string}
	 */
	toJSON: function() {
		var me = this;
		return '{"a":' + me.a + ',"b":' + me.b + ',"c":' + me.c + ',"d":' + me.d + ',"e":' + me.e + ',"f":' + me.f + '}'
	},

	/**
	 * Returns a string with current matrix as comma-separated list.
	 * @param {number} [fixLen=4] - truncate decimal values to number of digits
	 * @returns {string}
	 */
	toString: function(fixLen) {
		var me = this;
		fixLen = fixLen || 4;
		return 	 "a=" + me.a.toFixed(fixLen) +
				" b=" + me.b.toFixed(fixLen) +
				" c=" + me.c.toFixed(fixLen) +
				" d=" + me.d.toFixed(fixLen) +
				" e=" + me.e.toFixed(fixLen) +
				" f=" + me.f.toFixed(fixLen)
	},

	/**
	 * Returns a string with current matrix as comma-separated values
	 * string with line-end (CR+LF).
	 * @returns {string}
	 */
	toCSV: function() {
		return this.toArray().join() + "\r\n"
	},

	/**
	 * Convert current matrix into a `SVGMatrix`. If `SVGMatrix` is not
	 * supported, a `null` is returned.
	 *
	 * Note: BETA
	 *
	 * @returns {SVGMatrix}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGMatrix|MDN / SVGMatrix}
	 */
	toSVGMatrix: function() {

		// as we can not set transforms directly on SVG matrices we need
		// to decompose our own matrix first:
		var dc = this.decompose(),
			translate = dc.translate,
			scale = dc.scale,
			skew = dc.skew,
			eq = this._q,
			svgMatrix = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();

		if (!svgMatrix) return null;

		// apply transformations in the correct order (see decompose()), QR: translate -> rotate -> scale -> skew
		svgMatrix = svgMatrix.translate(translate.x, translate.y);
		svgMatrix = svgMatrix.rotate(dc.rotation / Math.PI * 180);		// SVGMatrix uses degrees
		svgMatrix = svgMatrix.scaleNonUniform(scale.x, scale.y);

		if (!eq(0, skew.x))
			svgMatrix = svgMatrix.skewX(skew.x);

		if (!eq(0, skew.y))
			svgMatrix = svgMatrix.skewY(skew.y);

		return svgMatrix
	},

	/**
	 * Compares floating point values with some tolerance (epsilon)
	 * @param {number} f1 - float 1
	 * @param {number} f2 - float 2
	 * @returns {boolean}
	 * @private
	 */
	_q: function(f1, f2) {
		return Math.abs(f1 - f2) < 1e-14
	},

	/**
	 * Apply current absolute matrix to context if defined, to sync it.
	 * @returns {Matrix}
	 * @private
	 */
	_x: function() {
		var me = this;
		if (me.context)
			me.context.setTransform(me.a, me.b, me.c, me.d, me.e, me.f);
		return me
	}
};
