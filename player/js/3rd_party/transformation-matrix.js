/*!
 Transformation Matrix v2.0
 (c) Epistemex 2014-2015
 www.epistemex.com
 By Ken Fyrstenberg
 Contributions by leeoniya.
 License: MIT, header required.
 */

/**
 * 2D transformation matrix object initialized with identity matrix.
 *
 * The matrix can synchronize a canvas context by supplying the context
 * as an argument, or later apply current absolute transform to an
 * existing context.
 *
 * All values are handled as floating point values.
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
 */

function Matrix() {

    var me = this;
    me._t = me.transform;

    me.a = me.d = 1;
    me.b = me.c = me.e = me.f = 0;

    me.props = [1,0,0,1,0,0];

    me.cssParts = ['matrix(','',')'];

    me.a1 = me.b1 = me.c1 = me.d1 = me.e1 = me.f1 = 0;

    me.cos = me.sin = 0;


}
Matrix.prototype = {

    /**
     * Short-hand to reset current matrix to an identity matrix.
     */
    reset: function() {
        return this.setTransform(1, 0, 0, 1, 0, 0);
    },

    /**
     * Rotates current matrix accumulative by angle.
     * @param {number} angle - angle in radians
     */
    rotate: function(angle) {
        if(angle === 0){
            return this;
        }
        this.cos = Math.cos(angle);
        this.sin = Math.sin(angle);
        return this._t(this.cos, this.sin, -this.sin, this.cos, 0, 0);
    },

    /**
     * Scales current matrix accumulative.
     * @param {number} sx - scale factor x (1 does nothing)
     * @param {number} sy - scale factor y (1 does nothing)
     */
    scale: function(sx, sy) {
        if(sx == 1 && sy == 1){
            return this;
        }
        return this._t(sx, 0, 0, sy, 0, 0);
    },

    /**
     * Scales current matrix on x axis accumulative.
     * @param {number} sx - scale factor x (1 does nothing)
     */
    scaleX: function(sx) {
        if(sx == 1){
            return this;
        }
        return this._t(sx, 0, 0, 1, 0, 0);
    },

    /**
     * Scales current matrix on y axis accumulative.
     * @param {number} sy - scale factor y (1 does nothing)
     */
    scaleY: function(sy) {
        if(sy == 1){
            return this;
        }
        return this._t(1, 0, 0, sy, 0, 0);
    },

    /**
     * Set current matrix to new absolute matrix.
     * @param {number} a - scale x
     * @param {number} b - shear y
     * @param {number} c - shear x
     * @param {number} d - scale y
     * @param {number} e - translate x
     * @param {number} f - translate y
     */
    setTransform: function(a, b, c, d, e, f) {
        this.props[0] = a;
        this.props[1] = b;
        this.props[2] = c;
        this.props[3] = d;
        this.props[4] = e;
        this.props[5] = f;
        return this;
    },

    /**
     * Translate current matrix accumulative.
     * @param {number} tx - translation for x
     * @param {number} ty - translation for y
     */
    translate: function(tx, ty) {
        if(tx === 0 && ty === 0){
            return this;
        }
        return this._t(1, 0, 0, 1, tx, ty);
    },

    /**
     * Translate current matrix on x axis accumulative.
     * @param {number} tx - translation for x
     */
    translateX: function(tx) {
        return this._t(1, 0, 0, 1, tx, 0);
    },

    /**
     * Translate current matrix on y axis accumulative.
     * @param {number} ty - translation for y
     */
    translateY: function(ty) {
        return this._t(1, 0, 0, 1, 0, ty);
    },

    /**
     * Multiplies current matrix with new matrix values.
     * @param {number} a2 - scale x
     * @param {number} b2 - shear y
     * @param {number} c2 - shear x
     * @param {number} d2 - scale y
     * @param {number} e2 - translate x
     * @param {number} f2 - translate y
     */
    transform: function(a2, b2, c2, d2, e2, f2) {

        this.a1 = this.props[0];
        this.b1 = this.props[1];
        this.c1 = this.props[2];
        this.d1 = this.props[3];
        this.e1 = this.props[4];
        this.f1 = this.props[5];

        /* matrix order (canvas compatible):
         * ace
         * bdf
         * 001
         */
        this.props[0] = this.a1 * a2 + this.c1 * b2;
        this.props[1] = this.b1 * a2 + this.d1 * b2;
        this.props[2] = this.a1 * c2 + this.c1 * d2;
        this.props[3] = this.b1 * c2 + this.d1 * d2;
        this.props[4] = this.a1 * e2 + this.c1 * f2 + this.e1;
        this.props[5] = this.b1 * e2 + this.d1 * f2 + this.f1;

        return this;
    },

    /**
     * Apply current matrix to x and y point.
     * Returns a point object.
     *
     * @param {number} x - value for x
     * @param {number} y - value for y
     * @returns {{x: number, y: number}} A new transformed point object
     */
    applyToPoint: function(x, y) {

        return {
            x: x * this.props[0] + y * this.props[2] + this.props[4],
            y: x * this.props[1] + y * this.props[3] + this.props[5]
        };
        /*return {
         x: x * me.a + y * me.c + me.e,
         y: x * me.b + y * me.d + me.f
         };*/
    },
    applyToPointArray: function(x, y) {

        return [x * this.props[0] + y * this.props[2] + this.props[4],x * this.props[1] + y * this.props[3] + this.props[5]];
        /*return {
         x: x * me.a + y * me.c + me.e,
         y: x * me.b + y * me.d + me.f
         };*/
    },
    applyToPointStringified: function(x, y) {
        return (bm_rnd(x * this.props[0] + y * this.props[2] + this.props[4]))+','+(bm_rnd(x * this.props[1] + y * this.props[3] + this.props[5]));
    },

    /**
     * Apply current matrix to array with point objects or point pairs.
     * Returns a new array with points in the same format as the input array.
     *
     * A point object is an object literal:
     *
     * {x: x, y: y}
     *
     * so an array would contain either:
     *
     * [{x: x1, y: y1}, {x: x2, y: y2}, ... {x: xn, y: yn}]
     *
     * or
     * [x1, y1, x2, y2, ... xn, yn]
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
            l = points.length;
            for(i = 0; i<l; i++) {
                mxPoints.push(this.applyToPoint(points[i].x, points[i].y));
            }
        }

        return mxPoints;
    },

    /**
     * Apply current matrix to a typed array with point pairs. Although
     * the input array may be an ordinary array, this method is intended
     * for more performant use where typed arrays are used. The returned
     * array is regardless always returned as a Float32Array.
     *
     * @param {*} points - (typed) array with point pairs
     * @param {boolean} [use64=false] - use Float64Array instead of Float32Array
     * @returns {*} A new typed array with transformed points
     */
    applyToTypedArray: function(points, use64) {

        var i = 0, p,
            l = points.length,
            mxPoints = use64 ? new Float64Array(l) : new Float32Array(l);

        while(i < l) {
            p = this.applyToPoint(points[i], points[i+1]);
            mxPoints[i++] = p.x;
            mxPoints[i++] = p.y;
        }

        return mxPoints;
    },

    /**
     * Apply to any canvas 2D context object. This does not affect the
     * context that optionally was referenced in constructor unless it is
     * the same context.
     * @param {CanvasRenderingContext2D} context
     */
    applyToContext: function(context) {
        var me = this;
        return me;
    },

    /**
     * Returns an array with current matrix values.
     * @returns {Array}
     */
    toArray: function() {
        return [this.props[0],this.props[1],this.props[2],this.props[3],this.props[4],this.props[5]];
    },

    /**
     * Generates a string that can be used with CSS `transform:`.
     * @returns {string}
     */
    toCSS: function() {
        this.cssParts[1] = this.props.join(',');
        return this.cssParts.join('');
        //return "matrix(" + this.a + ',' + this.b + ',' + this.c + ',' + this.d + ',' + this.e + ',' + this.f + ")";
    },

    /**
     * Returns a JSON compatible string of current matrix.
     * @returns {string}
     */
    toJSON: function() {
        var me = this;
        return '{"a":' + me.a + ',"b":' + me.b + ',"c":' + me.c + ',"d":' + me.d + ',"e":' + me.e + ',"f":' + me.f + '}';
    },

    /**
     * Returns a string with current matrix as comma-separated list.
     * @returns {string}
     */
    toString: function() {
        return "" + this.toArray();
    },

    /**
     * Compares floating point values with some tolerance (epsilon)
     * @param {number} f1 - float 1
     * @param {number} f2 - float 2
     * @returns {boolean}
     * @private
     */
    _q: function(f1, f2) {
        return Math.abs(f1 - f2) < 1e-14;
    }
};