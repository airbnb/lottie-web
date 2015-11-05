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

var Matrix = (function(){

    var mCos,mSin,a1,b1,c1,d1,e1,f1;

    function reset(){
        return this.setTransform(1, 0, 0, 1, 0, 0);
    }

    function rotate(angle) {
        if(angle === 0){
            return this;
        }
        mCos = Math.cos(angle);
        mSin = Math.sin(angle);
        return this._t(mCos, mSin, -mSin, mCos, 0, 0);
    }

    function scale(sx, sy) {
        if(sx == 1 && sy == 1){
            return this;
        }
        return this._t(sx, 0, 0, sy, 0, 0);
    }

    function scaleX(sx) {
        if(sx == 1){
            return this;
        }
        return this._t(sx, 0, 0, 1, 0, 0);
    }

    function scaleY(sy) {
        if(sy == 1){
            return this;
        }
        return this._t(1, 0, 0, sy, 0, 0);
    }

    function setTransform(a, b, c, d, e, f) {
        this.props[0] = a;
        this.props[1] = b;
        this.props[2] = c;
        this.props[3] = d;
        this.props[4] = e;
        this.props[5] = f;
        return this;
    }

    function translate(tx, ty) {
        if(tx === 0 && ty === 0){
            return this;
        }
        return this._t(1, 0, 0, 1, tx, ty);
    }

    function translateX(tx) {
        return this._t(1, 0, 0, 1, tx, 0);
    }

    function translateY(ty) {
        return this._t(1, 0, 0, 1, 0, ty);
    }

    function transform(a2, b2, c2, d2, e2, f2) {

        a1 = this.props[0];
        b1 = this.props[1];
        c1 = this.props[2];
        d1 = this.props[3];
        e1 = this.props[4];
        f1 = this.props[5];

        /* matrix order (canvas compatible):
         * ace
         * bdf
         * 001
         */
        this.props[0] = a1 * a2 + c1 * b2;
        this.props[1] = b1 * a2 + d1 * b2;
        this.props[2] = a1 * c2 + c1 * d2;
        this.props[3] = b1 * c2 + d1 * d2;
        this.props[4] = a1 * e2 + c1 * f2 + e1;
        this.props[5] = b1 * e2 + d1 * f2 + f1;

        return this;
    }

    function applyToPoint(x, y) {

        return {
            x: x * this.props[0] + y * this.props[2] + this.props[4],
            y: x * this.props[1] + y * this.props[3] + this.props[5]
        };
        /*return {
         x: x * me.a + y * me.c + me.e,
         y: x * me.b + y * me.d + me.f
         };*/
    }

    function applyToPointArray(x,y){
        return [x * this.props[0] + y * this.props[2] + this.props[4],x * this.props[1] + y * this.props[3] + this.props[5]];
    }
    function applyToPointStringified(x, y) {
        return (bm_rnd(x * this.props[0] + y * this.props[2] + this.props[4]))+','+(bm_rnd(x * this.props[1] + y * this.props[3] + this.props[5]));
    }

    function applyToArray(points) {

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
    }

    function applyToTypedArray(points, use64) {

        var i = 0, p,
            l = points.length,
            mxPoints = use64 ? new Float64Array(l) : new Float32Array(l);

        while(i < l) {
            p = this.applyToPoint(points[i], points[i+1]);
            mxPoints[i++] = p.x;
            mxPoints[i++] = p.y;
        }

        return mxPoints;
    }

    function toArray() {
        return [this.props[0],this.props[1],this.props[2],this.props[3],this.props[4],this.props[5]];
    }

    function toCSS() {
        this.cssParts[1] = this.props.join(',');
        return this.cssParts.join('');
        //return "matrix(" + this.a + ',' + this.b + ',' + this.c + ',' + this.d + ',' + this.e + ',' + this.f + ")";
    }

    function toString() {
        return "" + this.toArray();
    }

    return function(){
        this.reset = reset;
        this.rotate = rotate;
        this.scale = scale;
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        this.setTransform = setTransform;
        this.translate = translate;
        this.translateX = translateX;
        this.translateY = translateY;
        this.transform = transform;
        this.applyToPoint = applyToPoint;
        this.applyToPointArray = applyToPointArray;
        this.applyToPointStringified = applyToPointStringified;
        this.applyToArray = applyToArray;
        this.applyToTypedArray = applyToTypedArray;
        this.toArray = toArray;
        this.toCSS = toCSS;
        this.toString = toString;
        this._t = this.transform;

        this.props = [1,0,0,1,0,0];

        this.cssParts = ['matrix(','',')'];
    }
}());

function Matrix() {


}