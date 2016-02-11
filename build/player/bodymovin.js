(function(window){var svgNS = "http://www.w3.org/2000/svg";
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

    function reset(){
        this.props[0] = 1;
        this.props[1] = 0;
        this.props[2] = 0;
        this.props[3] = 0;
        this.props[4] = 0;
        this.props[5] = 1;
        this.props[6] = 0;
        this.props[7] = 0;
        this.props[8] = 0;
        this.props[9] = 0;
        this.props[10] = 1;
        this.props[11] = 0;
        this.props[12] = 0;
        this.props[13] = 0;
        this.props[14] = 0;
        this.props[15] = 1;
        return this;
    }

    function rotate(angle) {
        if(angle === 0){
            return this;
        }
        var mCos = Math.cos(angle);
        var mSin = Math.sin(angle);
        return this._t(mCos, -mSin,  0, 0
            , mSin,  mCos, 0, 0
            , 0,  0,  1, 0
            , 0, 0, 0, 1);
    }

    function rotateX(angle){
        if(angle === 0){
            return this;
        }
        var mCos = Math.cos(angle);
        var mSin = Math.sin(angle);
        return this._t(1, 0, 0, 0
            , 0, mCos, -mSin, 0
            , 0, mSin,  mCos, 0
            , 0, 0, 0, 1);
    }

    function rotateY(angle){
        if(angle === 0){
            return this;
        }
        var mCos = Math.cos(angle);
        var mSin = Math.sin(angle);
        return this._t(mCos,  0,  mSin, 0
            , 0, 1, 0, 0
            , -mSin,  0,  mCos, 0
            , 0, 0, 0, 1);
    }

    function rotateZ(angle){
        if(angle === 0){
            return this;
        }
        var mCos = Math.cos(angle);
        var mSin = Math.sin(angle);
        return this._t(mCos, -mSin,  0, 0
            , mSin,  mCos, 0, 0
            , 0,  0,  1, 0
            , 0, 0, 0, 1);
    }

    function shear(sx,sy){
        return this._t(1, sy, sx, 1, 0, 0);
    }

    function skew(ax, ay){
        return this.shear(Math.tan(ax), Math.tan(ay));
    }

    function skewFromAxis(ax, angle){
        var mCos = Math.cos(angle);
        var mSin = Math.sin(angle);
        return this._t(mCos, mSin,  0, 0
            , -mSin,  mCos, 0, 0
            , 0,  0,  1, 0
            , 0, 0, 0, 1)
            ._t(1, 0,  0, 0
            , Math.tan(ax),  1, 0, 0
            , 0,  0,  1, 0
            , 0, 0, 0, 1)
            ._t(mCos, -mSin,  0, 0
            , mSin,  mCos, 0, 0
            , 0,  0,  1, 0
            , 0, 0, 0, 1);
        //return this._t(mCos, mSin, -mSin, mCos, 0, 0)._t(1, 0, Math.tan(ax), 1, 0, 0)._t(mCos, -mSin, mSin, mCos, 0, 0);
    }

    function scale(sx, sy, sz) {
        sz = isNaN(sz) ? 1 : sz;
        if(sx == 1 && sy == 1 && sz == 1){
            return this;
        }
        return this._t(sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1);
    }

    function setTransform(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
        this.props[0] = a;
        this.props[1] = b;
        this.props[2] = c;
        this.props[3] = d;
        this.props[4] = e;
        this.props[5] = f;
        this.props[6] = g;
        this.props[7] = h;
        this.props[8] = i;
        this.props[9] = j;
        this.props[10] = k;
        this.props[11] = l;
        this.props[12] = m;
        this.props[13] = n;
        this.props[14] = o;
        this.props[15] = p;
        return this;
    }

    function translate(tx, ty, tz) {
        tz = isNaN(tz) ? 0 : tz;
        if(tx !== 0 || ty !== 0 || tz !== 0){
            return this._t(1,0,0,0,0,1,0,0,0,0,1,0,tx,ty,tz,1);
        }
        return this;
    }

    function transform(a2, b2, c2, d2, e2, f2, g2, h2, i2, j2, k2, l2, m2, n2, o2, p2) {

        if(a2 === 1 && b2 === 0 && c2 === 0 && d2 === 0 && e2 === 0 && f2 === 1 && g2 === 0 && h2 === 0 && i2 === 0 && j2 === 0 && k2 === 1 && l2 === 0){
            if(m2 !== 0 || n2 !== 0 || o2 !== 0){

                this.props[12] = this.props[12] * a2 + this.props[13] * e2 + this.props[14] * i2 + this.props[15] * m2 ;
                this.props[13] = this.props[12] * b2 + this.props[13] * f2 + this.props[14] * j2 + this.props[15] * n2 ;
                this.props[14] = this.props[12] * c2 + this.props[13] * g2 + this.props[14] * k2 + this.props[15] * o2 ;
                this.props[15] = this.props[12] * d2 + this.props[13] * h2 + this.props[14] * l2 + this.props[15] * p2 ;
            }
            return this;
        }

        var a1 = this.props[0];
        var b1 = this.props[1];
        var c1 = this.props[2];
        var d1 = this.props[3];
        var e1 = this.props[4];
        var f1 = this.props[5];
        var g1 = this.props[6];
        var h1 = this.props[7];
        var i1 = this.props[8];
        var j1 = this.props[9];
        var k1 = this.props[10];
        var l1 = this.props[11];
        var m1 = this.props[12];
        var n1 = this.props[13];
        var o1 = this.props[14];
        var p1 = this.props[15];

        /* matrix order (canvas compatible):
         * ace
         * bdf
         * 001
         */
        this.props[0] = a1 * a2 + b1 * e2 + c1 * i2 + d1 * m2;
        this.props[1] = a1 * b2 + b1 * f2 + c1 * j2 + d1 * n2 ;
        this.props[2] = a1 * c2 + b1 * g2 + c1 * k2 + d1 * o2 ;
        this.props[3] = a1 * d2 + b1 * h2 + c1 * l2 + d1 * p2 ;

        this.props[4] = e1 * a2 + f1 * e2 + g1 * i2 + h1 * m2 ;
        this.props[5] = e1 * b2 + f1 * f2 + g1 * j2 + h1 * n2 ;
        this.props[6] = e1 * c2 + f1 * g2 + g1 * k2 + h1 * o2 ;
        this.props[7] = e1 * d2 + f1 * h2 + g1 * l2 + h1 * p2 ;

        this.props[8] = i1 * a2 + j1 * e2 + k1 * i2 + l1 * m2 ;
        this.props[9] = i1 * b2 + j1 * f2 + k1 * j2 + l1 * n2 ;
        this.props[10] = i1 * c2 + j1 * g2 + k1 * k2 + l1 * o2 ;
        this.props[11] = i1 * d2 + j1 * h2 + k1 * l2 + l1 * p2 ;

        this.props[12] = m1 * a2 + n1 * e2 + o1 * i2 + p1 * m2 ;
        this.props[13] = m1 * b2 + n1 * f2 + o1 * j2 + p1 * n2 ;
        this.props[14] = m1 * c2 + n1 * g2 + o1 * k2 + p1 * o2 ;
        this.props[15] = m1 * d2 + n1 * h2 + o1 * l2 + p1 * p2 ;

        return this;
    }

    function clone(matr){
        var i;
        for(i=0;i<16;i+=1){
            matr.props[i] = this.props[i];
        }
    }

    function cloneFromProps(props){
        var i;
        for(i=0;i<16;i+=1){
            this.props[i] = props[i];
        }
    }

    function applyToPoint(x, y, z) {

        return {
            x: x * this.props[0] + y * this.props[4] + z * this.props[8] + this.props[12],
            y: x * this.props[1] + y * this.props[5] + z * this.props[9] + this.props[13],
            z: x * this.props[2] + y * this.props[6] + z * this.props[10] + this.props[14]
        };
        /*return {
         x: x * me.a + y * me.c + me.e,
         y: x * me.b + y * me.d + me.f
         };*/
    }
    function applyToX(x, y, z) {
        return x * this.props[0] + y * this.props[4] + z * this.props[8] + this.props[12];
    }
    function applyToY(x, y, z) {
        return x * this.props[1] + y * this.props[5] + z * this.props[9] + this.props[13];
    }
    function applyToZ(x, y, z) {
        return x * this.props[2] + y * this.props[6] + z * this.props[10] + this.props[14];
    }

    function applyToPointArray(x,y,z){
        return [x * this.props[0] + y * this.props[4] + z * this.props[8] + this.props[12],x * this.props[1] + y * this.props[5] + z * this.props[9] + this.props[13],x * this.props[2] + y * this.props[6] + z * this.props[10] + this.props[14]];
    }
    function applyToPointStringified(x, y) {
        return (bm_rnd(x * this.props[0] + y * this.props[4] + this.props[12]))+','+(bm_rnd(x * this.props[1] + y * this.props[5] + this.props[13]));
    }

    function toArray() {
        return [this.props[0],this.props[1],this.props[2],this.props[3],this.props[4],this.props[5],this.props[6],this.props[7],this.props[8],this.props[9],this.props[10],this.props[11],this.props[12],this.props[13],this.props[14],this.props[15]];
    }

    function toCSS() {
        if(isSafari){
            return "matrix3d(" + roundTo2Decimals(this.props[0]) + ',' + roundTo2Decimals(this.props[1]) + ',' + roundTo2Decimals(this.props[2]) + ',' + roundTo2Decimals(this.props[3]) + ',' + roundTo2Decimals(this.props[4]) + ',' + roundTo2Decimals(this.props[5]) + ',' + roundTo2Decimals(this.props[6]) + ',' + roundTo2Decimals(this.props[7]) + ',' + roundTo2Decimals(this.props[8]) + ',' + roundTo2Decimals(this.props[9]) + ',' + roundTo2Decimals(this.props[10]) + ',' + roundTo2Decimals(this.props[11]) + ',' + roundTo2Decimals(this.props[12]) + ',' + roundTo2Decimals(this.props[13]) + ',' + roundTo2Decimals(this.props[14]) + ',' + roundTo2Decimals(this.props[15]) + ')';
        } else {
            this.cssParts[1] = this.props.join(',');
            return this.cssParts.join('');
        }
    }

    function to2dCSS() {
        return "matrix(" + this.props[0] + ',' + this.props[1] + ',' + this.props[4] + ',' + this.props[5] + ',' + this.props[12] + ',' + this.props[13] + ")";
    }

    function toString() {
        return "" + this.toArray();
    }

    return function(){
        this.reset = reset;
        this.rotate = rotate;
        this.rotateX = rotateX;
        this.rotateY = rotateY;
        this.rotateZ = rotateZ;
        this.skew = skew;
        this.skewFromAxis = skewFromAxis;
        this.shear = shear;
        this.scale = scale;
        this.setTransform = setTransform;
        this.translate = translate;
        this.transform = transform;
        this.applyToPoint = applyToPoint;
        this.applyToX = applyToX;
        this.applyToY = applyToY;
        this.applyToZ = applyToZ;
        this.applyToPointArray = applyToPointArray;
        this.applyToPointStringified = applyToPointStringified;
        this.toArray = toArray;
        this.toCSS = toCSS;
        this.to2dCSS = to2dCSS;
        this.toString = toString;
        this.clone = clone;
        this.cloneFromProps = cloneFromProps;
        this._t = this.transform;

        this.props = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];

        this.cssParts = ['matrix3d(','',')'];
    }
}());

function Matrix() {


}

function matrixManagerFunction(){

    var mat = new Matrix();

    var returnMatrix2D = function(rX, scaleX, scaleY, tX, tY){
        return mat.reset().translate(tX,tY).rotate(rX).scale(scaleX,scaleY).toCSS();
    };

    var getMatrix = function(animData){
        return returnMatrix2D(animData.tr.r[2],animData.tr.s[0],animData.tr.s[1],animData.tr.p[0],animData.tr.p[1]);
    };

    return {
        getMatrix : getMatrix
    };

}
var MatrixManager = matrixManagerFunction;
(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if(!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    if(!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}());
var subframeEnabled = false;
var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
var cachedColors = {};
var bm_rounder = Math.round;
var bm_rnd;
var bm_pow = Math.pow;
var bm_sqrt = Math.sqrt;
var bm_abs = Math.abs;
var bm_floor = Math.floor;
var bm_max = Math.max;
var bm_min = Math.min;
var defaultCurveSegments = 75;
var degToRads = Math.PI/180;

function roundValues(flag){
    if(flag){
        bm_rnd = Math.round;
    }else{
        bm_rnd = function(val){
            return val;
        };
    }
}
roundValues(false);

function roundTo2Decimals(val){
    return Math.round(val*10000)/10000;
}

function roundTo3Decimals(val){
    return Math.round(val*100)/100;
}

function styleDiv(element){
    element.style.position = 'absolute';
    element.style.top = 0;
    element.style.left = 0;
    element.style.display = 'block';
    element.style.transformOrigin = element.style.webkitTransformOrigin = '0 0';
    element.style.backfaceVisibility  = element.style.webkitBackfaceVisibility = 'visible';
    element.style.transformStyle = element.style.webkitTransformStyle = element.style.mozTransformStyle = "preserve-3d";
}

function styleUnselectableDiv(element){
    element.style.userSelect = 'none';
    element.style.MozUserSelect = 'none';
    element.style.webkitUserSelect = 'none';
    element.style.oUserSelect = 'none';

}

function BMEnterFrameEvent(n,c,t,d){
    this.type = n;
    this.currentTime = c;
    this.totalTime = t;
    this.direction = d < 0 ? -1:1;
}

function BMCompleteEvent(n,d){
    this.type = n;
    this.direction = d < 0 ? -1:1;
}

function BMCompleteLoopEvent(n,c,t,d){
    this.type = n;
    this.currentLoop = c;
    this.totalLoops = t;
    this.direction = d < 0 ? -1:1;
}

function BMSegmentStartEvent(n,f,t){
    this.type = n;
    this.firstFrame = f;
    this.totalFrames = t;
}

function BMDestroyEvent(n,t){
    this.type = n;
    this.target = t;
}

function _addEventListener(eventName, callback){

    if (!this._cbs[eventName]){
        this._cbs[eventName] = [];
    }
    this._cbs[eventName].push(callback);

}

function _removeEventListener(eventName,callback){

    if (!callback){
        this._cbs[eventName] = null;
    }else if(this._cbs[eventName]){
        var i = 0, len = this._cbs[eventName].length;
        while(i<len){
            if(this._cbs[eventName][i] === callback){
                this._cbs[eventName].splice(i,1);
                i -=1;
                len -= 1;
            }
            i += 1;
        }
        if(!this._cbs[eventName].length){
            this._cbs[eventName] = null;
        }
    }

}

function _triggerEvent(eventName, args){
    if (this._cbs[eventName]) {
        var len = this._cbs[eventName].length;
        for (var i = 0; i < len; i++){
            this._cbs[eventName][i](args);
        }
    }
}

function randomString(length, chars){
    if(chars === undefined){
        chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    }
    var i;
    var result = '';
    for (i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
}

var rgbToHex = (function(){
    var colorMap = [];
    var i;
    var hex;
    for(i=0;i<256;i+=1){
        hex = i.toString(16);
        colorMap[i] = hex.length == 1 ? '0' + hex : hex;
    }

    return function(r, g, b) {
        if(r<0){
            r = 0;
        }
        if(g<0){
            g = 0;
        }
        if(b<0){
            b = 0;
        }
        return '#' + colorMap[r] + colorMap[g] + colorMap[b];
    };
}());

function fillToRgba(hex,alpha){
    if(!cachedColors[hex]){
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        cachedColors[hex] = parseInt(result[1], 16)+','+parseInt(result[2], 16)+','+parseInt(result[3], 16);
    }
    return 'rgba('+cachedColors[hex]+','+alpha+')';
}

var fillColorToString = (function(){

    var colorMap = [];
    return function(colorArr,alpha){
        if(alpha !== undefined){
            colorArr[3] = alpha;
        }
        if(!colorMap[colorArr[0]]){
            colorMap[colorArr[0]] = {};
        }
        if(!colorMap[colorArr[0]][colorArr[1]]){
            colorMap[colorArr[0]][colorArr[1]] = {};
        }
        if(!colorMap[colorArr[0]][colorArr[1]][colorArr[2]]){
            colorMap[colorArr[0]][colorArr[1]][colorArr[2]] = {};
        }
        if(!colorMap[colorArr[0]][colorArr[1]][colorArr[2]][colorArr[3]]){
            colorMap[colorArr[0]][colorArr[1]][colorArr[2]][colorArr[3]] = 'rgba(' + colorArr.join(',')+')';
        }
        return colorMap[colorArr[0]][colorArr[1]][colorArr[2]][colorArr[3]];
    };
}());

function RenderedFrame(tr,o) {
    this.tr = tr;
    this.o = o;
}

function LetterProps(o,sw,sc,fc,m,p){
    this.o = o;
    this.sw = sw;
    this.sc = sc;
    this.fc = fc;
    this.m = m;
    this.props = p;
}

function iterateDynamicProperties(num){
    var i, len = this.dynamicProperties;
    for(i=0;i<len;i+=1){
        this.dynamicProperties[i].getValue(num);
    }
}
function createElement(parent,child,params){
    if(child){
        child.prototype = Object.create(parent.prototype);
        child.prototype.constructor = child;
        child.prototype.parent = parent.prototype;
    }else{
        var instance = Object.create(parent.prototype,params);
        var getType = {};
        if(instance && getType.toString.call(instance.init) === '[object Function]'){
            instance.init();
        }
        return instance;
    }
}

function extendPrototype(source,destination){
    for (var attr in source.prototype) {
        if (source.prototype.hasOwnProperty(attr)) destination.prototype[attr] = source.prototype[attr];
    }
}
function bezFunction(){

    var easingFunctions = [];
    var math = Math;

    function pointOnLine2D(x1,y1, x2,y2, x3,y3){
        var det1 = (x1*y2) + (y1*x3) + (x2*y3) - (x3*y2) - (y3*x1) - (x2*y1);
        return det1 > -0.0001 && det1 < 0.0001;
    }

    function pointOnLine3D(x1,y1,z1, x2,y2,z2, x3,y3,z3){
        return pointOnLine2D(x1,y1, x2,y2, x3,y3) && pointOnLine2D(x1,z1, x2,z2, x3,z3);
    }

    function getEasingCurve(aa,bb,cc,dd,encodedFuncName) {
        if(!encodedFuncName){
            encodedFuncName = ('bez_' + aa+'_'+bb+'_'+cc+'_'+dd).replace(/\./g, 'p');
        }
        if(easingFunctions[encodedFuncName]){
            return easingFunctions[encodedFuncName];
        }
        var A0, B0, C0;
        var A1, B1, C1;
        easingFunctions[encodedFuncName] = function(tt) {
            var x = tt;
            var i = 0, z;
            while (++i < 20) {
                C0 = 3 * aa;
                B0 = 3 * (cc - aa) - C0;
                A0 = 1 - C0 - B0;
                z = (x * (C0 + x * (B0 + x * A0))) - tt;
                if (bm_abs(z) < 1e-3) break;
                x -= z / (C0 + x * (2 * B0 + 3 * A0 * x));
            }
            C1 = 3 * bb;
            B1 = 3 * (dd - bb) - C1;
            A1 = 1 - C1 - B1;
            var polyB = x * (C1 + x * (B1 + x * A1));
            //return c * polyB + b;
            return polyB;
        };
        return easingFunctions[encodedFuncName];
    }
    var getBezierLength = (function(){
        var storedBezierCurves = {};

        function Segment(l,p){
            this.l = l;
            this.p = p;
        }

        return function(pt1,pt2,pt3,pt4){
            var bezierName = (pt1.join('_')+'_'+pt2.join('_')+'_'+pt3.join('_')+'_'+pt4.join('_')).replace(/\./g, 'p');
            if(storedBezierCurves[bezierName]){
                return storedBezierCurves[bezierName];
            }
            var curveSegments = defaultCurveSegments;
            var k;
            var i, len;
            var ptCoord,perc,addedLength = 0;
            var ptDistance;
            var point = [],lastPoint = [];
            var lengthData = {
                addedLength: 0,
                segments: []
            };
            len = pt3.length;
            for(k=0;k<curveSegments;k+=1){
                perc = k/(curveSegments-1);
                ptDistance = 0;
                for(i=0;i<len;i+=1){
                    ptCoord = bm_pow(1-perc,3)*pt1[i]+3*bm_pow(1-perc,2)*perc*pt3[i]+3*(1-perc)*bm_pow(perc,2)*pt4[i]+bm_pow(perc,3)*pt2[i];
                    point[i] = ptCoord;
                    if(lastPoint[i] !== null){
                        ptDistance += bm_pow(point[i] - lastPoint[i],2);
                    }
                    lastPoint[i] = point[i];
                }
                if(ptDistance){
                    ptDistance = bm_sqrt(ptDistance);
                    addedLength += ptDistance;
                }
                lengthData.segments.push(new Segment(addedLength,perc));
            }
            lengthData.addedLength = addedLength;
            storedBezierCurves[bezierName] = lengthData;
            return lengthData;
        };
    }());

    function BezierData(length){
        this.segmentLength = 0;
        this.points = new Array(length);
    }

    function PointData(partial,point){
        this.partialLength = partial;
        this.point = point;
    }

    var buildBezierData = (function(){

        var storedData = {};

        return function (keyData){
            var pt1 = keyData.s;
            var pt2 = keyData.e;
            var pt3 = keyData.to;
            var pt4 = keyData.ti;
            var bezierName = (pt1.join('_')+'_'+pt2.join('_')+'_'+pt3.join('_')+'_'+pt4.join('_')).replace(/\./g, 'p');
            if(storedData[bezierName]){
                keyData.bezierData = storedData[bezierName];
                return;
            }
        var curveSegments = defaultCurveSegments;
        var k, i, len;
            var ptCoord,perc,addedLength = 0;
            var ptDistance;
            var point,lastPoint = null;
            if(pt1.length === 2 && (pt1[0] != pt2[0] || pt1[1] != pt2[1]) && pointOnLine2D(pt1[0],pt1[1],pt2[0],pt2[1],pt1[0]+pt3[0],pt1[1]+pt3[1]) && pointOnLine2D(pt1[0],pt1[1],pt2[0],pt2[1],pt2[0]+pt4[0],pt2[1]+pt4[1])){
                curveSegments = 2;
            }
            var bezierData = new BezierData(curveSegments);
            len = pt3.length;
            for(k=0;k<curveSegments;k+=1){
            point = new Array(len);
                perc = k/(curveSegments-1);
                ptDistance = 0;
                for(i=0;i<len;i+=1){
                ptCoord = bm_pow(1-perc,3)*pt1[i]+3*bm_pow(1-perc,2)*perc*(pt1[i] + pt3[i])+3*(1-perc)*bm_pow(perc,2)*(pt2[i] + pt4[i])+bm_pow(perc,3)*pt2[i];
                point[i] = ptCoord;
                    if(lastPoint !== null){
                    ptDistance += bm_pow(point[i] - lastPoint[i],2);
                    }
                }
            ptDistance = bm_sqrt(ptDistance);
                addedLength += ptDistance;
                bezierData.points[k] = new PointData(ptDistance,point);
                lastPoint = point;
            }
            bezierData.segmentLength = addedLength;
            keyData.bezierData = bezierData;
            storedData[bezierName] = bezierData;

        }
    }());

    function getDistancePerc(perc,bezierData){
        var segments = bezierData.segments;
        var len = segments.length;
        var initPos = bm_floor((len-1)*perc);
        var lengthPos = perc*bezierData.addedLength;
        var lPerc = 0;
        if(lengthPos == segments[initPos].l){
            return segments[initPos].p;
        }else{
            var dir = segments[initPos].l > lengthPos ? -1 : 1;
            var flag = true;
            while(flag){
                if(segments[initPos].l <= lengthPos && segments[initPos+1].l > lengthPos){
                    lPerc = (lengthPos - segments[initPos].l)/(segments[initPos+1].l-segments[initPos].l);
                    flag = false;
                }else{
                    initPos += dir;
                }
                if(initPos < 0 || initPos >= len - 1){
                    flag = false;
                }
            }
            return segments[initPos].p + (segments[initPos+1].p - segments[initPos].p)*lPerc;
        }
    }

    function SegmentPoints(){
        this.pt1 = new Array(2);
        this.pt2 = new Array(2);
        this.pt3 = new Array(2);
        this.pt4 = new Array(2);
    }

    function getNewSegment(pt1,pt2,pt3,pt4,startPerc,endPerc, bezierData){
        var pts = new SegmentPoints();
        startPerc = startPerc < 0 ? 0 : startPerc;
        var t0 = getDistancePerc(startPerc,bezierData);
        endPerc = endPerc > 1 ? 1 : endPerc;
        var t1 = getDistancePerc(endPerc,bezierData);
        var i, len = pt1.length;
        var u0 = 1 - t0;
        var u1 = 1 - t1;
        for(i=0;i<len;i+=1){
            pts.pt1[i] =  u0*u0*u0* pt1[i] + (t0*u0*u0 + u0*t0*u0 + u0*u0*t0) * pt3[i] + (t0*t0*u0 + u0*t0*t0 + t0*u0*t0)* pt4[i] + t0*t0*t0* pt2[i];
            pts.pt3[i] = u0*u0*u1*pt1[i] + (t0*u0*u1 + u0*t0*u1 + u0*u0*t1)* pt3[i] + (t0*t0*u1 + u0*t0*t1 + t0*u0*t1)* pt4[i] + t0*t0*t1* pt2[i];
            pts.pt4[i] = u0*u1*u1* pt1[i] + (t0*u1*u1 + u0*t1*u1 + u0*u1*t1)* pt3[i] + (t0*t1*u1 + u0*t1*t1 + t0*u1*t1)* pt4[i] + t0*t1*t1* pt2[i];
            pts.pt2[i] = u1*u1*u1* pt1[i] + (t1*u1*u1 + u1*t1*u1 + u1*u1*t1)* pt3[i] + (t1*t1*u1 + u1*t1*t1 + t1*u1*t1)*pt4[i] + t1*t1*t1* pt2[i];
        }
        return pts;
    }

    return {
        getEasingCurve : getEasingCurve,
        getBezierLength : getBezierLength,
        getNewSegment : getNewSegment,
        buildBezierData : buildBezierData,
        pointOnLine2D : pointOnLine2D,
        pointOnLine3D : pointOnLine3D
    };
}

var bez = bezFunction();
function dataFunctionManager(){

    //var tCanvasHelper = document.createElement('canvas').getContext('2d');

    function completeLayers(layers, comps, fontManager){
        var layerData;
        var animArray, lastFrame;
        var i, len = layers.length;
        var j, jLen, k, kLen;
        for(i=0;i<len;i+=1){
            layerData = layers[i];
            if(!('ks' in layerData) || layerData.completed){
                continue;
            }
            layerData.completed = true;
            if(layerData.tt){
                layers[i-1].td = layerData.tt;
            }
            animArray = [];
            lastFrame = -1;
            if(layerData.hasMask){
                var maskProps = layerData.masksProperties;
                jLen = maskProps.length;
                for(j=0;j<jLen;j+=1){
                    if(maskProps[j].pt.k.i){
                        convertPathsToAbsoluteValues(maskProps[j].pt.k);
                    }else{
                        kLen = maskProps[j].pt.k.length;
                        for(k=0;k<kLen;k+=1){
                            if(maskProps[j].pt.k[k].s){
                                convertPathsToAbsoluteValues(maskProps[j].pt.k[k].s[0]);
                            }
                            if(maskProps[j].pt.k[k].e){
                                convertPathsToAbsoluteValues(maskProps[j].pt.k[k].e[0]);
                            }
                        }
                    }
                }
            }
            if(layerData.ty===0){
                layerData.layers = findCompLayers(layerData.refId, comps);
                completeLayers(layerData.layers,comps, fontManager);
            }else if(layerData.ty === 4){
                completeShapes(layerData.shapes, false);
            }else if(layerData.ty == 5){
                completeText(layerData, fontManager);
            }
        }
    }

    function findCompLayers(id,comps){
        var i = 0, len = comps.length;
        while(i<len){
            if(comps[i].id === id){
                return JSON.parse(JSON.stringify(comps[i].layers));
            }
            i += 1;
        }
    }

    function completeShapes(arr,trimmedFlag){
        var i, len = arr.length;
        var j, jLen;
        var isTrimmed = trimmedFlag ? trimmedFlag : false;
        for(i=len-1;i>=0;i-=1){
            if(arr[i].ty == 'tm'){
                isTrimmed = true;
            }
            if(arr[i].ty == 'sh'){
                arr[i].trimmed = isTrimmed;
                if(arr[i].ks.k.i){
                    convertPathsToAbsoluteValues(arr[i].ks.k);
                }else{
                    jLen = arr[i].ks.k.length;
                    for(j=0;j<jLen;j+=1){
                        if(arr[i].ks.k[j].s){
                            convertPathsToAbsoluteValues(arr[i].ks.k[j].s[0]);
                        }
                        if(arr[i].ks.k[j].e){
                            convertPathsToAbsoluteValues(arr[i].ks.k[j].e[0]);
                        }
                    }
                }
            }else if(arr[i].ty == 'gr'){
                completeShapes(arr[i].it,isTrimmed);
            }else if(arr[i].ty == 'el' || arr[i].ty == 'rc'){
                arr[i].trimmed = isTrimmed;
            }
        }
    }

    function convertPathsToAbsoluteValues(path){
        var i, len = path.i.length;
        for(i=0;i<len;i+=1){
            path.i[i][0] += path.v[i][0];
            path.i[i][1] += path.v[i][1];
            path.o[i][0] += path.v[i][0];
            path.o[i][1] += path.v[i][1];
        }
    }

    function completeData(animationData, fontManager){
        completeLayers(animationData.layers, animationData.assets, fontManager);
    }

    function completeText(data, fontManager){
        var letters = [];
        var documentData = data.t.d;
        var i, len;
        var newLineFlag, index = 0, val;
        var anchorGrouping = data.t.m.g;
        var currentSize = 0, currentPos = 0, currentLine = 0, lineWidths = [];
        var lineWidth = 0;
        var maxLineWidth = 0;
        var j, jLen;
        var fontData = fontManager.getFontByName(documentData.f);
        var charData, cLength = 0;
        var styles = fontData.fStyle.split(' ');

        var fWeight = 'normal', fStyle = 'normal';
        len = styles.length;
        for(i=0;i<len;i+=1){
            if (styles[i].toLowerCase() === 'italic') {
                fStyle = 'italic';
            }else if (styles[i].toLowerCase() === 'bold') {
                fWeight = '700';
            } else if (styles[i].toLowerCase() === 'black') {
                fWeight = '900';
            } else if (styles[i].toLowerCase() === 'medium') {
                fWeight = '500';
            } else if (styles[i].toLowerCase() === 'regular' || styles[i].toLowerCase() === 'normal') {
                fWeight = '400';
            } else if (styles[i].toLowerCase() === 'light' || styles[i].toLowerCase() === 'thin') {
                fWeight = '200';
            }
        }
        documentData.fWeight = fWeight;
        documentData.fStyle = fStyle;
        len = documentData.t.length;
        if(documentData.sz){
            var boxWidth = documentData.sz[0];
            var lastSpaceIndex = -1;
            for(i=0;i<len;i+=1){
                newLineFlag = false;
                if(documentData.t.charAt(i) === ' '){
                    lastSpaceIndex = i;
                }else if(documentData.t.charCodeAt(i) === 13){
                    lineWidth = 0;
                    newLineFlag = true;
                }
                if(fontManager.chars){
                    charData = fontManager.getCharData(documentData.t.charAt(i), fontData.fStyle, fontData.fFamily);
                    cLength = newLineFlag ? 0 : charData.w*documentData.s/100;
                }else{
                    //tCanvasHelper.font = documentData.s + 'px '+ fontData.fFamily;
                    cLength = fontManager.measureText(documentData.t.charAt(i), documentData.f, documentData.s);
                }
                if(lineWidth + cLength > boxWidth){
                    if(lastSpaceIndex === -1){
                       //i -= 1;
                        documentData.t = documentData.t.substr(0,i) + "\r" + documentData.t.substr(i);
                        len += 1;
                    } else {
                        i = lastSpaceIndex;
                        documentData.t = documentData.t.substr(0,i) + "\r" + documentData.t.substr(i+1);
                    }
                    lastSpaceIndex = -1;
                    lineWidth = 0;
                }else {
                    lineWidth += cLength;
                }
            }
            len = documentData.t.length;
        }
        lineWidth = 0;
        cLength = 0;
        for (i = 0;i < len ;i += 1) {
            newLineFlag = false;
            if(documentData.t.charAt(i) === ' '){
                val = '\u00A0';
            }else if(documentData.t.charCodeAt(i) === 13){
                lineWidths.push(lineWidth);
                maxLineWidth = lineWidth > maxLineWidth ? lineWidth : maxLineWidth;
                lineWidth = 0;
                val = '';
                newLineFlag = true;
                currentLine += 1;
            }else{
                val = documentData.t.charAt(i);
            }
            if(fontManager.chars){
                charData = fontManager.getCharData(documentData.t.charAt(i), fontData.fStyle, fontManager.getFontByName(documentData.f).fFamily);
                if(!charData){
                    cLength = 0;
                } else {
                    cLength = newLineFlag ? 0 : charData.w*documentData.s/100;
                }
            }else{
                //var charWidth = fontManager.measureText(val, documentData.f, documentData.s);
                //tCanvasHelper.font = documentData.s + 'px '+ fontManager.getFontByName(documentData.f).fFamily;
                cLength = fontManager.measureText(val, documentData.f, documentData.s);
            }

            //
            lineWidth += cLength;
            letters.push({l:cLength,an:cLength,add:currentSize,n:newLineFlag, anIndexes:[], val: val, line: currentLine});
            if(anchorGrouping == 2){
                currentSize += cLength;
                if(val == '' || val == '\u00A0' || i == len - 1){
                    if(val == '' || val == '\u00A0'){
                        currentSize -= cLength;
                    }
                    while(currentPos<=i){
                        letters[currentPos].an = currentSize;
                        letters[currentPos].ind = index;
                        letters[currentPos].extra = cLength;
                        currentPos += 1;
                    }
                    index += 1;
                    currentSize = 0;
                }
            }else if(anchorGrouping == 3){
                currentSize += cLength;
                if(val == '' || i == len - 1){
                    if(val == ''){
                        currentSize -= cLength;
                    }
                    while(currentPos<=i){
                        letters[currentPos].an = currentSize;
                        letters[currentPos].ind = index;
                        letters[currentPos].extra = cLength;
                        currentPos += 1;
                    }
                    currentSize = 0;
                    index += 1;
                }
            }else{
                letters[index].ind = index;
                letters[index].extra = 0;
                index += 1;
            }
        }
        documentData.l = letters;
        maxLineWidth = lineWidth > maxLineWidth ? lineWidth : maxLineWidth;
        lineWidths.push(lineWidth);
        if(documentData.sz){
            documentData.boxWidth = documentData.sz[0];
            data.t.d.justifyOffset = 0;
        }else{
            documentData.boxWidth = maxLineWidth;
            switch(documentData.j){
                case 1:
                    data.t.d.justifyOffset = - documentData.boxWidth;
                    break;
                case 2:
                    data.t.d.justifyOffset = - documentData.boxWidth/2;
                    break;
                default:
                    data.t.d.justifyOffset = 0;
            }
        }
        documentData.lineWidths = lineWidths;

        var animators = data.t.a;
        jLen = animators.length;
        var based, ind, indexes = [];
        for(j=0;j<jLen;j+=1){
            if(animators[j].a.sc){
                documentData.strokeColorAnim = true;
            }
            if(animators[j].a.sw){
                documentData.strokeWidthAnim = true;
            }
            if(animators[j].a.fc){
                documentData.fillColorAnim = true;
            }
            ind = 0;
            based = animators[j].s.b;
            for(i=0;i<len;i+=1){
                letters[i].anIndexes[j] = ind;
                if((based == 1 && letters[i].val != '') || (based == 2 && letters[i].val != '' && letters[i].val != '\u00A0') || (based == 3 && (letters[i].n || letters[i].val == '\u00A0' || i == len - 1)) || (based == 4 && (letters[i].n || i == len - 1))){
                    if(animators[j].s.rn === 1){
                        indexes.push(ind);
                    }
                    ind += 1;
                }
            }
            data.t.a[j].s.totalChars = ind;
            var currentInd = -1, newInd;
            if(animators[j].s.rn === 1){
                for(i = 0; i < len; i += 1){
                    if(currentInd != letters[i].anIndexes[j]){
                        currentInd = letters[i].anIndexes[j];
                        newInd = indexes.splice(Math.floor(Math.random()*indexes.length),1)[0];
                    }
                    letters[i].anIndexes[j] = newInd;
                }
            }
        }
        if(jLen === 0 && !('m' in data.t.p)){
            data.singleShape = true;
        }
        documentData.yOffset = documentData.s*1.2;
        documentData.ascent = fontData.ascent*documentData.s/100;
    }

    var moduleOb = {};
    moduleOb.completeData = completeData;

    return moduleOb;
}

var dataManager = dataFunctionManager();
var FontManager = (function(){

    var maxWaitingTime = 5000;

    function setUpNode(font, family){
        var parentNode = document.createElement('span');
        parentNode.style.fontFamily    = family;
        var node = document.createElement('span');
        // Characters that vary significantly among different fonts
        node.innerHTML = 'giItT1WQy@!-/#';
        // Visible - so we can measure it - but not on the screen
        parentNode.style.position      = 'absolute';
        parentNode.style.left          = '-10000px';
        parentNode.style.top           = '-10000px';
        // Large font size makes even subtle changes obvious
        parentNode.style.fontSize      = '300px';
        // Reset any font properties
        parentNode.style.fontVariant   = 'normal';
        parentNode.style.fontStyle     = 'normal';
        parentNode.style.fontWeight    = 'normal';
        parentNode.style.letterSpacing = '0';
        parentNode.appendChild(node);
        document.body.appendChild(parentNode);

        // Remember width with no applied web font
        var width = node.offsetWidth;
        node.style.fontFamily = font + ', '+family;
        return {node:node, w:width, parent:parentNode};
    }

    function checkLoadedFonts() {
        var i, len = this.fonts.length;
        var node, w;
        var loadedCount = len;
        for(i=0;i<len; i+= 1){
            if(this.fonts[i].loaded){
                loadedCount -= 1;
                continue;
            }
            if(this.fonts[i].fOrigin === 't'){
                if(window.Typekit && window.Typekit.load && this.typekitLoaded === 0){
                    this.typekitLoaded = 1;
                    try{Typekit.load({
                        async: true,
                        active: function() {
                            this.typekitLoaded = 2;
                        }.bind(this)
                    });}catch(e){}
                }
                if(this.typekitLoaded === 2) {
                    this.fonts[i].loaded = true;
                }
            } else if(this.fonts[i].fOrigin === 'n'){
                this.fonts[i].loaded = true;
            } else{
                node = this.fonts[i].monoCase.node;
                w = this.fonts[i].monoCase.w;
                if(node.offsetWidth !== w){
                    loadedCount -= 1;
                    this.fonts[i].loaded = true;
                }else{
                    node = this.fonts[i].sansCase.node;
                    w = this.fonts[i].sansCase.w;
                    if(node.offsetWidth !== w){
                        loadedCount -= 1;
                        this.fonts[i].loaded = true;
                    }
                }
                if(this.fonts[i].loaded){
                    this.fonts[i].sansCase.parent.parentNode.removeChild(this.fonts[i].sansCase.parent);
                    this.fonts[i].monoCase.parent.parentNode.removeChild(this.fonts[i].monoCase.parent);
                }
            }
        }

        if(loadedCount !== 0 && Date.now() - this.initTime < maxWaitingTime){
            setTimeout(checkLoadedFonts.bind(this),20);
        }else{
            setTimeout(function(){this.loaded = true;}.bind(this),0);

        }
    };

    function createHelper(def, fontData){
        var tHelper = document.createElementNS(svgNS,'text');
        tHelper.style.fontSize = '100px';
        tHelper.style.fontFamily = fontData.fFamily;
        tHelper.textContent = '1';
        if(fontData.fClass){
            tHelper.style.fontFamily = 'inherit';
            tHelper.className = fontData.fClass;
        } else {
            tHelper.style.fontFamily = fontData.fFamily;
        }
        def.appendChild(tHelper);
        return tHelper;
    }

    function addFonts(fontData, defs){
        if(!fontData){
            this.loaded = true;
            return;
        }
        if(this.chars){
            this.loaded = true;
            this.fonts = fontData.list;
            return;
        }

        var fontArr = fontData.list;
        var i, len = fontArr.length;
        for(i=0; i<len; i+= 1){
            fontArr[i].loaded = false;
            fontArr[i].monoCase = setUpNode(fontArr[i].fFamily,'monospace');
            fontArr[i].sansCase = setUpNode(fontArr[i].fFamily,'sans-serif');
            if(!fontArr[i].fPath) {
                fontArr[i].loaded = true;
            }else if(fontArr[i].fOrigin === 'p'){
                var s = document.createElement('style');
                s.type = "text/css";
                s.innerHTML = "@font-face {" + "font-family: "+fontArr[i].fFamily+"; font-style: normal; src: url('"+fontArr[i].fPath+"');}";
                defs.appendChild(s);
            } else if(fontArr[i].fOrigin === 'g'){
                //<link href='https://fonts.googleapis.com/css?family=Montserrat' rel='stylesheet' type='text/css'>
                var l = document.createElement('link');
                l.type = "text/css";
                l.rel = "stylesheet";
                l.href = fontArr[i].fPath;
                defs.appendChild(l);
            } else if(fontArr[i].fOrigin === 't'){
                //<link href='https://fonts.googleapis.com/css?family=Montserrat' rel='stylesheet' type='text/css'>
                var sc = document.createElement('script');
                sc.setAttribute('src',fontArr[i].fPath);
                defs.appendChild(sc);
            }
            fontArr[i].helper = createHelper(defs,fontArr[i]);
            this.fonts.push(fontArr[i]);
        }
        checkLoadedFonts.bind(this)();
    }

    function addChars(chars){
        if(!this.chars){
            this.chars = [];
        }
        if(!chars){
            return;
        }
        var i, len = chars.length;
        var j, jLen = this.chars.length, found;
        for(i=0;i<len;i+=1){
            j = 0;
            found = false;
            while(j<jLen){
                if(this.chars[j].style === chars[i].style && this.chars[j].fFamily === chars[i].fFamily && this.chars[j].ch === chars[i].ch){
                    found = true;
                }
                j += 1;
            }
            if(!found){
                this.chars.push(chars[i]);
                jLen += 1;
            }
        }
        this.chars = chars;
    }

    function getCharData(char, style, font){
        var i = 0, len = this.chars.length;
        while( i < len) {
            if(this.chars[i].ch === char && this.chars[i].style === style && this.chars[i].fFamily === font){
                return this.chars[i];
            }
            i+= 1;
        }
        console.log('missing char: ',char);
    }

    function measureText(char, fontName, size){
        var fontData = this.getFontByName(fontName);
        var tHelper = fontData.helper;
        tHelper.textContent = char;
        return tHelper.getComputedTextLength()*size/100;
    }

    function getFontByName(name){
        var i = 0, len = this.fonts.length;
        while(i<len){
            if(this.fonts[i].fName === name) {
                return this.fonts[i];
            }
            i += 1;
        }
        return 'sans-serif';
    }

    var Font = function(){
        this.fonts = [];
        this.chars = null;
        this.typekitLoaded = 0;
        this.loaded = false;
        this.initTime = Date.now();
    };
    Font.prototype.addChars = addChars;
    Font.prototype.addFonts = addFonts;
    Font.prototype.getCharData = getCharData;
    Font.prototype.getFontByName = getFontByName;
    Font.prototype.measureText = measureText;

    return Font;

}());
var ExpressionManager = (function(){
    var ob = {};

    function sum(a,b) {
        if(typeof a === 'number' && typeof b === 'number') {
            return a + b;
        }
        if(typeof a === 'object' && typeof b === 'number'){
            a[0] = a[0] + b;
            return a;
        }
        if(typeof a === 'number' && typeof b === 'object'){
            b[0] = a + b[0];
            return b;
        }
        if(typeof a === 'object' && typeof b === 'object'){
            var i = 0, lenA = a.length, lenB = b.length;
            var retArr = [];
            while(i<lenA || i < lenB){
                if(a[i] && b[i]){
                    retArr[i] = a[i] + b[i];
                }else{
                    retArr[i] = a[i] || b[i];
                }
                i += 1;
            }
            return retArr;
        }
        return 0;
    }

    function sub(a,b) {
        if(typeof a === 'number' && typeof b === 'number') {
            return a - b;
        }
        if(typeof a === 'object' && typeof b === 'number'){
            a[0] = a[0] - b;
            return a;
        }
        if(typeof a === 'number' && typeof b === 'object'){
            b[0] = a - b[0];
            return b;
        }
        if(typeof a === 'object' && typeof b === 'object'){
            var i = 0, lenA = a.length, lenB = b.length;
            var retArr = [];
            while(i<lenA || i < lenB){
                if(a[i] && b[i]){
                    retArr[i] = a[i] - b[i];
                }else{
                    retArr[i] = a[i] || b[i];
                }
                i += 1;
            }
            return retArr;
        }
        return 0;
    }

    function mul(a,b) {
        if(typeof a === 'number' && typeof b === 'number') {
            return a * b;
        }
        var i, len;
        if(typeof a === 'object' && typeof b === 'number'){
            len = a.length;
            for(i=0;i<len;i+=1){
                a[i] = a[i] * b;
            }
            return a;
        }
        if(typeof a === 'number' && typeof b === 'object'){
            len = b.length;
            for(i=0;i<len;i+=1){
                b[i] = a * b[i];
            }
            return b;
        }
        return 0;
    }

    function div(a,b) {
        if(typeof a === 'number' && typeof b === 'number') {
            return a / b;
        }
        var i, len;
        if(typeof a === 'object' && typeof b === 'number'){
            len = a.length;
            for(i=0;i<len;i+=1){
                a[i] = a[i] / b;
            }
            return a;
        }
        if(typeof a === 'number' && typeof b === 'object'){
            len = b.length;
            for(i=0;i<len;i+=1){
                b[i] = a / b[i];
            }
            return b;
        }
        return 0;
    }

    function clamp(num, min, max) {
        if(min > max){
            var mm = max;
            max = min;
            min = mm;
        }
        return Math.min(Math.max(num, min), max);
    }
    function random(min,max){
        if(!max){
            max = 0;
        }
        if(min > max){
            var _m = max;
            max = min;
            min = _m;
        }
        return min + (Math.random()*(max-min));
    }

    function radiansToDegrees(val) {
        return val/degToRads;
    }

    function length(arr1,arr2){
        var i,len = arr1.length;
        var addedLength = 0;
        for(i=0;i<len;i+=1){
            addedLength += Math.pow(arr2[i]-arr1[i],2);
        }
        return Math.sqrt(addedLength);
    }

    function initiateExpression(elem,data){
        var val = data.x;
        var transform,content,effect;
        var thisComp = elem.comp;
        var thisLayer = elem;
        var fnStr = 'var fn = function(){'+val+';this.v = $bm_rt;}';
        eval(fnStr);
        var bindedFn = fn.bind(this);
        var numKeys = data.k ? data.k.length : 0;

        var loopIn = function loopIn(type,duration, durationFlag) {
            if(!this.k){
                return this.pv;
            }
            var currentFrame = time*thisComp.globalData.frameRate;
            var keyframes = this.keyframes;
            var firstKeyFrame = keyframes[0].t;
            if(currentFrame>=firstKeyFrame){
                return this.pv;
            }else{
                var cycleDuration, lastKeyFrame;
                if(!durationFlag){
                    if(!duration || duration > keyframes.length - 1){
                        duration = keyframes.length - 1;
                    }
                    lastKeyFrame = keyframes[duration].t;
                    cycleDuration = lastKeyFrame - firstKeyFrame;
                } else {
                    if(!duration){
                        cycleDuration = Math.max(0,this.elem.data.op - firstKeyFrame);
                    } else {
                        cycleDuration = Math.abs(thisComp.globalData.frameRate*duration);
                    }
                    lastKeyFrame = firstKeyFrame + cycleDuration;
                }
                var i, len, ret;
                if(type === 'pingpong') {
                    var iterations = Math.floor((firstKeyFrame - currentFrame)/cycleDuration);
                    if(iterations % 2 === 0){
                        return this.getValueAtTime((firstKeyFrame - currentFrame)%cycleDuration +  firstKeyFrame);
                    }
                } else if(type === 'offset'){
                    var initV = this.getValueAtTime(firstKeyFrame);
                    var endV = this.getValueAtTime(lastKeyFrame);
                    var current = this.getValueAtTime(cycleDuration - (firstKeyFrame - currentFrame)%cycleDuration +  firstKeyFrame);
                    var repeats = Math.floor((firstKeyFrame - currentFrame)/cycleDuration)+1;
                    if(this.pv.length){
                        ret = new Array(initV.length);
                        len = ret.length;
                        for(i=0;i<len;i+=1){
                            ret[i] = current[i]-(endV[i]-initV[i])*repeats;
                        }
                        return ret;
                    }
                    return current-(endV-initV)*repeats;
                } else if(type === 'continue'){
                    var firstValue = this.getValueAtTime(firstKeyFrame);
                    var nextFirstValue = this.getValueAtTime(firstKeyFrame + 0.001);
                    if(this.pv.length){
                        ret = new Array(firstValue.length);
                        len = ret.length;
                        for(i=0;i<len;i+=1){
                            ret[i] = firstValue[i] + (firstValue[i]-nextFirstValue[i])*(firstKeyFrame - currentFrame)/0.0005;
                        }
                        return ret;
                    }
                    return firstValue + (firstValue-nextFirstValue)*(firstKeyFrame - currentFrame)/0.0005;
                }
                return this.getValueAtTime(cycleDuration - (firstKeyFrame - currentFrame)%cycleDuration +  firstKeyFrame);
            }
        }.bind(this);

        var loopInDuration = function loopInDuration(type,duration){
            return loopIn(type,duration,true);
        }.bind(this);

        var loopOut = function loopOut(type,duration,durationFlag){
            if(!this.k){
                return this.pv;
            }
            var currentFrame = time*thisComp.globalData.frameRate;
            var keyframes = this.keyframes;
            var lastKeyFrame = keyframes[keyframes.length - 1].t;
            if(currentFrame<=lastKeyFrame){
                return this.pv;
            }else{
                var cycleDuration, firstKeyFrame;
                if(!durationFlag){
                    if(!duration || duration > keyframes.length - 1){
                        duration = keyframes.length - 1;
                    }
                    firstKeyFrame = keyframes[keyframes.length - 1 - duration].t;
                    cycleDuration = lastKeyFrame - firstKeyFrame;
                } else {
                    if(!duration){
                        cycleDuration = Math.max(0,lastKeyFrame - this.elem.data.ip);
                    } else {
                        cycleDuration = Math.abs(lastKeyFrame - thisComp.globalData.frameRate*duration);
                    }
                    firstKeyFrame = lastKeyFrame - cycleDuration;
                }
                var i, len, ret;
                if(type === 'pingpong') {
                    var iterations = Math.floor((currentFrame - firstKeyFrame)/cycleDuration);
                    if(iterations % 2 !== 0){
                        return this.getValueAtTime(cycleDuration - (currentFrame - firstKeyFrame)%cycleDuration +  firstKeyFrame);
                    }
                } else if(type === 'offset'){
                    var initV = this.getValueAtTime(firstKeyFrame);
                    var endV = this.getValueAtTime(lastKeyFrame);
                    var current = this.getValueAtTime((currentFrame - firstKeyFrame)%cycleDuration +  firstKeyFrame);
                    var repeats = Math.floor((currentFrame - firstKeyFrame)/cycleDuration);
                    if(this.pv.length){
                        ret = new Array(initV.length);
                        len = ret.length;
                        for(i=0;i<len;i+=1){
                            ret[i] = (endV[i]-initV[i])*repeats + current[i];
                        }
                        return ret;
                    }
                    return (endV-initV)*repeats + current;
                } else if(type === 'continue'){
                    var lastValue = this.getValueAtTime(lastKeyFrame);
                    var nextLastValue = this.getValueAtTime(lastKeyFrame - 0.001);
                    if(this.pv.length){
                        ret = new Array(lastValue.length);
                        len = ret.length;
                        for(i=0;i<len;i+=1){
                            ret[i] = lastValue[i] + (lastValue[i]-nextLastValue[i])*(currentFrame - lastKeyFrame)/0.0005;
                        }
                        return ret;
                    }
                    return lastValue + (lastValue-nextLastValue)*(currentFrame - lastKeyFrame)/0.0005;
                }
                return this.getValueAtTime((currentFrame - firstKeyFrame)%cycleDuration +  firstKeyFrame);
            }
        }.bind(this);

        var loopOutDuration = function loopOutDuration(type,duration){
            return loopOut(type,duration,true);
        }.bind(this);

        var valueAtTime = function valueAtTime(t) {
            return this.getValueAtTime(t*thisComp.globalData.frameRate);
        }.bind(this);

        function effect(nm){
            return elem.effectsManager.getEffect(nm);
        }

        function nearestKey(time){
            var i, len = data.k.length,index;
            if(!data.k.length || typeof(data.k[0]) === 'number'){
                index = 0;
            } else {
                for(i=0;i<len;i+=1){
                    if(time === data.k[i].t){
                        index = i + 1;
                        break;
                    }else if(time<data.k[i].t){
                        index = i + 1;
                        break;
                    }else if(time>data.k[i].t && i === len - 1){
                        index = len;
                        break;
                    }
                }
            }
            var ob = {};
            ob.index = index;
            return ob;
        }

        function key(ind){
            if(!data.k.length || typeof(data.k[0]) === 'number'){
                return {time:0};
            }
            ind -= 1;
            var ob = {
                time: data.k[ind].t/thisComp.globalData.frameRate
            };
            var arr;
            if(ind === data.k.length - 1){
                arr = data.k[ind-1].e;
            }else{
                arr = data.k[ind].s;
            }
            var i, len = arr.length;
            for(i=0;i<len;i+=1){
                ob[i] = arr[i];
            }
            return ob;
        }

        function hasParentGetter(){
        }

        Object.defineProperty(this, "hasParent", { get: hasParentGetter});
        var time, value,textIndex,textTotal,selectorValue;
        var hasParent = !!(elem.hierarchy && elem.hierarchy.length);
        function execute(){
            if(this.type === 'textSelector'){
                textIndex = this.textIndex;
                textTotal = this.textTotal;
                selectorValue = this.selectorValue;
            }
            if(!transform){
                transform = elem.transform;
            }
            if(!content && elem.content){
                content = elem.content.bind(elem);
            }
            if(this.getPreValue){
                this.getPreValue();
            }
            value = this.pv;
            time = this.comp.renderedFrame/this.comp.globalData.frameRate;
            bindedFn();
            var i,len;
            if(this.mult){
                if(typeof this.v === 'number'){
                    this.v *= this.mult;
                }else{
                    len = this.v.length;
                    if(value === this.v){
                        this.v = len === 2 ? [value[0],value[1]] : [value[0],value[1],value[2]];
                    }
                    for(i = 0; i < len; i += 1){
                        this.v[i] *= this.mult;
                    }
                }
            }
            if(typeof this.v === 'number'){
                if(this.lastValue !== this.v){
                    this.lastValue = this.v;
                    this.mdf = true;
                }
            }else if(this.v.i){
                // Todo Improve validation for masks and shapes
                this.mdf = true;
            }else{
                if(!this.lastValue){

                }
                len = this.v.length;
                for(i = 0; i < len; i += 1){
                    if(this.v[i] !== this.lastValue[i]){
                        this.lastValue[i] = this.v[i];
                        this.mdf = true;
                    }
                }
            }
        }
        return execute;
    }

    ob.initiateExpression = initiateExpression;
    return ob;
}());
function ExpressionComp(){}
(function(){

    ExpressionComp.prototype.layer = function(nm){
        var i=0, len = this.layers.length;
        while(i<len){
            if(this.layers[i].nm === nm){
                return this.elements[i];
            }
            i += 1;
        }
    }

    ExpressionComp.prototype.pixelAspect = 1;
}());
function ShapeInterface(){}

ShapeInterface.prototype.fillInterface = function(view) {
    var ob = {
        get color(){
            if(view.c.k){
                view.c.getValue();
            }
            return [view.c.pv[0],view.c.pv[1],view.c.pv[2]];
        },
        get opacity(){
            if(view.o.k){
                view.o.getValue();
            }
            return view.o.pv;
        }
    }
    return ob;
};

ShapeInterface.prototype.strokeInterface = function(shape,view) {
    var ob = {
        get color(){
            if(view.c.k){
                view.c.getValue();
            }
            return [view.c.pv[0],view.c.pv[1],view.c.pv[2]];
        },
        get opacity(){
            if(view.o.k){
                view.o.getValue();
            }
            return view.o.pv;
        },
        get strokeWidth(){
            if(view.w.k){
                view.w.getValue();
            }
            return view.w.pv;
        },
        dashOb: {},
        get dash(){
            var d = view.d;
            var dModels = shape.d;
            var i, len = dModels.length;
            for(i=0;i<len;i+=1){
                if(d.dataProps[i].p.k){
                    d.dataProps[i].p.getValue();
                }
                this.dashOb[dModels[i].nm] = d.dataProps[i].p.v;
            }
            return this.dashOb;
        }
    }
    return ob;
};

ShapeInterface.prototype.shapeInterface = function(view) {
    var ob = {
        get shape(){
            if(view.sh.k){
                view.sh.getValue();
            }
            return view.sh.pv;
        }
    }
    return ob;
};

ShapeInterface.prototype.ellipseInterface = function(view) {
    var ob = {
        get size(){
            if(view.sh.s.k){
                view.sh.s.getValue();
            }
            return [view.sh.s.pv[0],view.sh.s.pv[1]];
        },
        get position(){
            if(view.sh.p.k){
                view.sh.p.getValue();
            }
            return [view.sh.p.pv[0],view.sh.p.pv[1]];
        }
    };
    return ob;
};

ShapeInterface.prototype.rectangleInterface = function(view) {
    var prop = view.sh.ty === 'tm' ? view.sh.prop : view.sh;
    var ob = {
        get size(){
            if(prop.s.k){
                prop.s.getValue();
            }
            return [prop.s.pv[0],prop.s.pv[1]];
        },
        get position(){
            if(prop.p.k){
                prop.p.getValue();
            }
            return [prop.p.pv[0],prop.p.pv[1]];
        },
        get roundness(){
            if(prop.r.k){
                prop.r.getValue();
            }
            return prop.r.pv;
        }
    };
    return ob;
};

ShapeInterface.prototype.trimInterface = function(view) {
    var ob = {
        get start(){
            if(view.tr.s.k){
                view.tr.s.getValue();
            }
            return view.tr.s.pv;
        },
        get end(){
            if(view.tr.e.k){
                view.tr.e.getValue();
            }
            return view.tr.e.pv;
        },
        get offset(){
            if(view.tr.o.k){
                view.tr.o.getValue();
            }
            return view.tr.o.pv;
        }
    };
    return ob;
};

ShapeInterface.prototype.transformInterface = function(view) {
    var ob = {
        get opacity(){
            if(view.transform.mProps.o.k){
                view.transform.mProps.o.getValue();
            }
            return view.transform.mProps.o.pv;
        },
        get position(){
            if(view.transform.mProps.p.k){
                view.transform.mProps.p.getValue();
            }
            return [view.transform.mProps.p.pv[0],view.transform.mProps.p.pv[1]];
        },
        get anchorPoint(){
            if(view.transform.mProps.a.k){
                view.transform.mProps.a.getValue();
            }
            return [view.transform.mProps.a.pv[0],view.transform.mProps.a.pv[1]];
        },
        get scale(){
            if(view.transform.mProps.s.k){
                view.transform.mProps.s.getValue();
            }
            return [view.transform.mProps.s.pv[0],view.transform.mProps.s.pv[1]];
        },
        get rotation(){
            if(view.transform.mProps.r.k){
                view.transform.mProps.r.getValue();
            }
            return view.transform.mProps.r.pv;
        },
        get skew(){
            if(view.transform.mProps.sk.k){
                view.transform.mProps.sk.getValue();
            }
            return view.transform.mProps.sk.pv;
        },
        get skewAxis(){
            if(view.transform.mProps.sa.k){
                view.transform.mProps.sa.getValue();
            }
            return view.transform.mProps.sa.pv;
        }
    }
    return ob;
};

ShapeInterface.prototype.groupInterface = function(shapes,view,container){
    var interfaceArr = [];
    var i, len = shapes.length,interfaceOb;
    for(i=0;i<len;i+=1){
        if(shapes[i].ty === 'gr'){
            interfaceOb = {};
            this.groupInterface(shapes[i].it,view[i].it,interfaceOb);
            interfaceArr.push(interfaceOb);
        }else if(shapes[i].ty === 'sh'){
            interfaceOb = this.shapeInterface(view[i]);
            interfaceArr.push(interfaceOb);
        }else if(shapes[i].ty === 'fl'){
            interfaceOb = this.fillInterface(view[i]);
            interfaceArr.push(interfaceOb);
        }else if(shapes[i].ty === 'st'){
            interfaceOb = this.strokeInterface(shapes[i],view[i]);
            interfaceArr.push(interfaceOb);
        }else if(shapes[i].ty === 'el'){
            interfaceOb = this.ellipseInterface(view[i]);
            interfaceArr.push(interfaceOb);
        }else if(shapes[i].ty === 'rc'){
            interfaceOb = this.rectangleInterface(view[i]);
            interfaceArr.push(interfaceOb);
        }else if(shapes[i].ty === 'tr'){
            container.transform = this.transformInterface(view[i]);
        }else if(shapes[i].ty === 'tm'){
            interfaceOb = this.trimInterface(view[i]);
            interfaceArr.push(interfaceOb);
        }else{
            //console.log(shapes[i].ty);
            interfaceArr.push('');
        }
    }
    container.content = function(nm){
        var i, len = shapes.length;
        for(i=0;i<len;i+=1){
            if(shapes[i].nm === nm){
                return interfaceArr[i];
            }
        }
    }
};

ShapeInterface.prototype.buildExpressionInterface = function(){
    this.groupInterface(this.shapesData,this.viewData,this);
}
function LayerInterface(){}

LayerInterface.prototype.toWorld = function(arr) {
    if(this.hierarchy.length){
        var finalMat = new Matrix();
        var i, len = this.hierarchy.length;
        this.finalTransform.mProp.applyToMatrix(finalMat,false);
        for(i=0;i<len;i+=1){
            this.hierarchy[i].finalTransform.mProp.applyToMatrix(finalMat,true);
        }
        var retArr = finalMat.applyToPointArray(arr[0],arr[1],arr[2]||0);
        return retArr;
    }
    return arr;
};
var PropertyFactory = (function(){

    var initFrame = -999999;

    function getValueAtTime(frameNum) {
        var i = 0,len = this.keyframes.length- 1,dir= 1,flag = true;
        var keyData, nextKeyData;
        var offsetTime = 0;
        var retVal = typeof this.pv === 'object' ? [this.pv.length] : 0;

        while(flag){
            keyData = this.keyframes[i];
            nextKeyData = this.keyframes[i+1];
            if(i == len-1 && frameNum >= nextKeyData.t - offsetTime){
                if(keyData.h){
                    keyData = nextKeyData;
                }
                break;
            }
            if((nextKeyData.t - offsetTime) > frameNum){
                break;
            }
            if(i < len - 1){
                i += dir;
            }else{
                flag = false;
            }
        }

        var k, kLen,perc,jLen, j = 0, fnc;
        if(keyData.to){

            if(!keyData.bezierData){
                bez.buildBezierData(keyData);
            }
            var bezierData = keyData.bezierData;
            if(frameNum >= nextKeyData.t-offsetTime || frameNum < keyData.t-offsetTime){
                var ind = frameNum >= nextKeyData.t-offsetTime ? bezierData.points.length - 1 : 0;
                kLen = bezierData.points[ind].point.length;
                for(k = 0; k < kLen; k += 1){
                    retVal[k] = bezierData.points[ind].point[k];
                }
            }else{
                if(keyData.__fnct){
                    fnc = keyData.__fnct;
                }else{
                    fnc = bez.getEasingCurve(keyData.o.x,keyData.o.y,keyData.i.x,keyData.i.y,keyData.n);
                    keyData.__fnct = fnc;
                }
                perc = fnc((frameNum-(keyData.t-offsetTime))/((nextKeyData.t-offsetTime)-(keyData.t-offsetTime)));
                var distanceInLine = bezierData.segmentLength*perc;

                var segmentPerc;
                var addedLength = 0;
                dir = 1;
                flag = true;
                jLen = bezierData.points.length;
                while(flag){
                    addedLength +=bezierData.points[j].partialLength*dir;
                    if(distanceInLine === 0 || perc === 0 || j == bezierData.points.length - 1){
                        kLen = bezierData.points[j].point.length;
                        for(k=0;k<kLen;k+=1){
                            retVal[k] = bezierData.points[j].point[k];
                        }
                        break;
                    }else if(distanceInLine >= addedLength && distanceInLine < addedLength + bezierData.points[j+1].partialLength){
                        segmentPerc = (distanceInLine-addedLength)/(bezierData.points[j+1].partialLength);
                        kLen = bezierData.points[j].point.length;
                        for(k=0;k<kLen;k+=1){
                            retVal[k] = bezierData.points[j].point[k] + (bezierData.points[j+1].point[k] - bezierData.points[j].point[k])*segmentPerc;
                        }
                        break;
                    }
                    if(j < jLen - 1 && dir == 1 || j > 0 && dir == -1){
                        j += dir;
                    }else{
                        flag = false;
                    }
                }
            }
        }else{
            var outX,outY,inX,inY, isArray = false, keyValue;
            len = keyData.s.length;
            for(i=0;i<len;i+=1){
                if(keyData.h !== 1){
                    if(keyData.o.x instanceof Array){
                        isArray = true;
                        if(!keyData.__fnct){
                            keyData.__fnct = [];
                        }
                        if(!keyData.__fnct[i]){
                            outX = keyData.o.x[i] || keyData.o.x[0];
                            outY = keyData.o.y[i] || keyData.o.y[0];
                            inX = keyData.i.x[i] || keyData.i.x[0];
                            inY = keyData.i.y[i] || keyData.i.y[0];
                        }
                    }else{
                        isArray = false;
                        if(!keyData.__fnct) {
                            outX = keyData.o.x;
                            outY = keyData.o.y;
                            inX = keyData.i.x;
                            inY = keyData.i.y;
                        }
                    }
                    if(isArray){
                        if(keyData.__fnct[i]){
                            fnc = keyData.__fnct[i];
                        }else{
                            fnc = bez.getEasingCurve(outX,outY,inX,inY);
                            keyData.__fnct[i] = fnc;
                        }
                    }else{
                        if(keyData.__fnct){
                            fnc = keyData.__fnct;
                        }else{
                            fnc = bez.getEasingCurve(outX,outY,inX,inY);
                            keyData.__fnct = fnc;
                        }
                    }
                    if(frameNum >= nextKeyData.t-offsetTime){
                        perc = 1;
                    }else if(frameNum < keyData.t-offsetTime){
                        perc = 0;
                    }else{
                        perc = fnc((frameNum-(keyData.t-offsetTime))/((nextKeyData.t-offsetTime)-(keyData.t-offsetTime)));
                    }
                }
                if(this.sh && keyData.h !== 1){
                    var initP = keyData.s[i];
                    var endP = keyData.e[i];
                    if(initP-endP < -180){
                        initP += 360;
                    } else if(initP-endP > 180){
                        initP -= 360;
                    }
                    keyValue = initP+(endP-initP)*perc;
                } else {
                    keyValue = keyData.h === 1 ? keyData.s[i] : keyData.s[i]+(keyData.e[i]-keyData.s[i])*perc;
                }
                if(len === 1){
                    retVal = keyValue;
                }else{
                    retVal[i] = keyValue;
                }
            }
        }
        return retVal;
    }

    function getNonKeyframedValueAtTime(){
        return this.pv;
    }

    function getValue(){
        if(this.elem.globalData.frameId === this.frameId){
            return;
        }
        this.mdf = false;
        this.frameId = this.elem.globalData.frameId;
        var frameNum = this.comp.renderedFrame - this.offsetTime;
        if(frameNum === this.lastFrame || (this.lastFrame !== initFrame && ((this.lastFrame >= this.keyframes[this.keyframes.length- 1].t-this.offsetTime && frameNum >= this.keyframes[this.keyframes.length- 1].t-this.offsetTime) || (this.lastFrame < this.keyframes[0].t-this.offsetTime && frameNum < this.keyframes[0].t-this.offsetTime)))){

        }else{
            var i = 0,len = this.keyframes.length- 1,dir= 1,flag = true;
            var keyData, nextKeyData;

            while(flag){
                keyData = this.keyframes[i];
                nextKeyData = this.keyframes[i+1];
                if(i == len-1 && frameNum >= nextKeyData.t - this.offsetTime){
                    if(keyData.h){
                        keyData = nextKeyData;
                    }
                    break;
                }
                if((nextKeyData.t - this.offsetTime) > frameNum){
                    break;
                }
                if(i < len - 1){
                    i += dir;
                }else{
                    flag = false;
                }
            }

            var k, kLen,perc,jLen, j = 0, fnc;
            if(keyData.to){

                if(!keyData.bezierData){
                    bez.buildBezierData(keyData);
                }
                var bezierData = keyData.bezierData;
                if(frameNum >= nextKeyData.t-this.offsetTime || frameNum < keyData.t-this.offsetTime){
                    var ind = frameNum >= nextKeyData.t-this.offsetTime ? bezierData.points.length - 1 : 0;
                    kLen = bezierData.points[ind].point.length;
                    for(k = 0; k < kLen; k += 1){
                        this.v[k] = this.mult ? bezierData.points[ind].point[k]*this.mult : bezierData.points[ind].point[k];
                        this.pv[k] = bezierData.points[ind].point[k];
                        if(this.lastPValue[k] !== this.pv[k]) {
                            this.mdf = true;
                            this.lastPValue[k] = this.pv[k];
                        }
                    }
                }else{
                    if(keyData.__fnct){
                        fnc = keyData.__fnct;
                    }else{
                        fnc = bez.getEasingCurve(keyData.o.x,keyData.o.y,keyData.i.x,keyData.i.y,keyData.n);
                        keyData.__fnct = fnc;
                    }
                    perc = fnc((frameNum-(keyData.t-this.offsetTime))/((nextKeyData.t-this.offsetTime)-(keyData.t-this.offsetTime)));
                    var distanceInLine = bezierData.segmentLength*perc;

                    var segmentPerc;
                    var addedLength = 0;
                    dir = 1;
                    flag = true;
                    jLen = bezierData.points.length;
                    while(flag){
                        addedLength +=bezierData.points[j].partialLength*dir;
                        if(distanceInLine === 0 || perc === 0 || j == bezierData.points.length - 1){
                            kLen = bezierData.points[j].point.length;
                            for(k=0;k<kLen;k+=1){
                                this.v[k] = this.mult ? bezierData.points[j].point[k]*this.mult : bezierData.points[j].point[k];
                                this.pv[k] = bezierData.points[j].point[k];
                                if(this.lastPValue[k] !== this.pv[k]) {
                                    this.mdf = true;
                                    this.lastPValue[k] = this.pv[k];
                                }
                            }
                            break;
                        }else if(distanceInLine >= addedLength && distanceInLine < addedLength + bezierData.points[j+1].partialLength){
                            segmentPerc = (distanceInLine-addedLength)/(bezierData.points[j+1].partialLength);
                            kLen = bezierData.points[j].point.length;
                            for(k=0;k<kLen;k+=1){
                                this.v[k] = this.mult ? (bezierData.points[j].point[k] + (bezierData.points[j+1].point[k] - bezierData.points[j].point[k])*segmentPerc)*this.mult : bezierData.points[j].point[k] + (bezierData.points[j+1].point[k] - bezierData.points[j].point[k])*segmentPerc;
                                this.pv[k] = bezierData.points[j].point[k] + (bezierData.points[j+1].point[k] - bezierData.points[j].point[k])*segmentPerc;

                                if(this.lastPValue[k] !== this.pv[k]) {
                                    this.mdf = true;
                                    this.lastPValue[k] = this.pv[k];
                                }
                            }
                            break;
                        }
                        if(j < jLen - 1 && dir == 1 || j > 0 && dir == -1){
                            j += dir;
                        }else{
                            flag = false;
                        }
                    }
                }
            }else{
                var outX,outY,inX,inY, isArray = false, keyValue;
                len = keyData.s.length;
                for(i=0;i<len;i+=1){
                    if(keyData.h !== 1){
                        if(keyData.o.x instanceof Array){
                            isArray = true;
                            if(!keyData.__fnct){
                                keyData.__fnct = [];
                            }
                            if(!keyData.__fnct[i]){
                                outX = keyData.o.x[i] || keyData.o.x[0];
                                outY = keyData.o.y[i] || keyData.o.y[0];
                                inX = keyData.i.x[i] || keyData.i.x[0];
                                inY = keyData.i.y[i] || keyData.i.y[0];
                            }
                        }else{
                            isArray = false;
                            if(!keyData.__fnct) {
                                outX = keyData.o.x;
                                outY = keyData.o.y;
                                inX = keyData.i.x;
                                inY = keyData.i.y;
                            }
                        }
                        if(isArray){
                            if(keyData.__fnct[i]){
                                fnc = keyData.__fnct[i];
                            }else{
                                fnc = bez.getEasingCurve(outX,outY,inX,inY);
                                keyData.__fnct[i] = fnc;
                            }
                        }else{
                            if(keyData.__fnct){
                                fnc = keyData.__fnct;
                            }else{
                                fnc = bez.getEasingCurve(outX,outY,inX,inY);
                                keyData.__fnct = fnc;
                            }
                        }
                        if(frameNum >= nextKeyData.t-this.offsetTime){
                            perc = 1;
                        }else if(frameNum < keyData.t-this.offsetTime){
                            perc = 0;
                        }else{
                            perc = fnc((frameNum-(keyData.t-this.offsetTime))/((nextKeyData.t-this.offsetTime)-(keyData.t-this.offsetTime)));
                        }
                    }
                    if(this.sh && keyData.h !== 1){
                        var initP = keyData.s[i];
                        var endP = keyData.e[i];
                        if(initP-endP < -180){
                            initP += 360;
                        } else if(initP-endP > 180){
                            initP -= 360;
                        }
                        keyValue = initP+(endP-initP)*perc;
                    } else {
                        keyValue = keyData.h === 1 ? keyData.s[i] : keyData.s[i]+(keyData.e[i]-keyData.s[i])*perc;
                    }
                    if(len === 1){
                        this.v = this.mult ? keyValue*this.mult : keyValue;
                        this.pv = keyValue;
                        if(this.lastPValue != this.pv){
                            this.mdf = true;
                            this.lastPValue = this.pv;
                        }
                    }else{
                        this.v[i] = this.mult ? keyValue*this.mult : keyValue;
                        this.pv[i] = keyValue;
                        if(this.lastPValue[i] !== this.pv[i]){
                            this.mdf = true;
                            this.lastPValue[i] = this.pv[i];
                        }
                    }
                }
            }
        }
        this.lastFrame = frameNum;
    }

    function interpolateShape() {
        this.mdf = false;
        var frameNum = this.comp.renderedFrame - this.offsetTime;
        if(this.lastFrame !== initFrame && ((this.lastFrame < this.keyframes[0].t-this.offsetTime && frameNum < this.keyframes[0].t-this.offsetTime) || (this.lastFrame > this.keyframes[this.keyframes.length - 1].t-this.offsetTime && frameNum > this.keyframes[this.keyframes.length - 1].t-this.offsetTime))){

        }else{
            var keyPropS,keyPropE,isHold;
            if(frameNum < this.keyframes[0].t-this.offsetTime){
                this.mdf = true;
                keyPropS = this.keyframes[0].s[0];
                isHold = true;
            }else if(frameNum > this.keyframes[this.keyframes.length - 1].t-this.offsetTime){
                this.mdf = true;
                if(this.keyframes[this.keyframes.length - 2].h === 1){
                    keyPropS = this.keyframes[this.keyframes.length - 2].s[0];
                }else{
                    keyPropS = this.keyframes[this.keyframes.length - 2].e[0];
                }
                isHold = true;
            }else{
                this.mdf = true;
                var i = 0,len = this.keyframes.length- 1, dir = 1,flag = true,keyData,nextKeyData, j, jLen, k, kLen;

                while(flag){
                    keyData = this.keyframes[i];
                    nextKeyData = this.keyframes[i+1];
                    if((nextKeyData.t - this.offsetTime) > frameNum && dir == 1){
                        break;
                    }
                    if(i < len - 1 && dir == 1 || i > 0 && dir == -1){
                        i += dir;
                    }else{
                        flag = false;
                    }
                }

                var perc;
                if(keyData.h !== 1){
                    var fnc;
                    if(keyData.__fnct){
                        fnc = keyData.__fnct;
                    }else{
                        fnc = bez.getEasingCurve(keyData.o.x,keyData.o.y,keyData.i.x,keyData.i.y);
                        keyData.__fnct = fnc;
                    }
                    if(frameNum >= nextKeyData.t-this.offsetTime){
                        perc = 1;
                    }else if(frameNum < keyData.t-this.offsetTime){
                        perc = 0;
                    }else{
                        perc = fnc((frameNum-(keyData.t-this.offsetTime))/((nextKeyData.t-this.offsetTime)-(keyData.t-this.offsetTime)));
                    }
                    keyPropE = keyData.e[0];
                }
                keyPropS = keyData.s[0];
                isHold = keyData.h === 1;
            }

            jLen = this.v.i.length;
            kLen = keyPropS.i[0].length;
            for(j=0;j<jLen;j+=1){
                for(k=0;k<kLen;k+=1){
                    if(isHold){
                        this.v.i[j][k] = keyPropS.i[j][k];
                        this.v.o[j][k] = keyPropS.o[j][k];
                        this.v.v[j][k] = keyPropS.v[j][k];
                        this.pv.i[j][k] = keyPropS.i[j][k];
                        this.pv.o[j][k] = keyPropS.o[j][k];
                        this.pv.v[j][k] = keyPropS.v[j][k];
                    }else{
                        this.v.i[j][k] = keyPropS.i[j][k]+(keyPropE.i[j][k]-keyPropS.i[j][k])*perc;
                        this.v.o[j][k] = keyPropS.o[j][k]+(keyPropE.o[j][k]-keyPropS.o[j][k])*perc;
                        this.v.v[j][k] = keyPropS.v[j][k]+(keyPropE.v[j][k]-keyPropS.v[j][k])*perc;
                        this.pv.i[j][k] = keyPropS.i[j][k]+(keyPropE.i[j][k]-keyPropS.i[j][k])*perc;
                        this.pv.o[j][k] = keyPropS.o[j][k]+(keyPropE.o[j][k]-keyPropS.o[j][k])*perc;
                        this.pv.v[j][k] = keyPropS.v[j][k]+(keyPropE.v[j][k]-keyPropS.v[j][k])*perc;
                    }
                }
            }
        }

        this.lastFrame = frameNum;
    }

    function checkExpressions(elem,data){
        this.getExpression = ExpressionManager.initiateExpression;
        if(data.x){
            this.k = true;
            this.x = true;
            if(this.getValue) {
                this.getPreValue = this.getValue;
            }
            this.getValue = this.getExpression(elem,data);
        }
    }

    function ValueProperty(elem,data, mult){
        this.mult = mult;
        this.v = mult ? data.k * mult : data.k;
        this.pv = data.k;
        this.mdf = false;
        this.comp = elem.comp;
        this.k = false;
        checkExpressions.bind(this)(elem,data);
    }

    function MultiDimensionalProperty(elem,data, mult){
        this.mult = mult;
        this.data = data;
        this.mdf = false;
        this.comp = elem.comp;
        this.k = false;
        checkExpressions.bind(this)(elem,data);
        this.v = new Array(data.k.length);
        this.pv = new Array(data.k.length);
        this.lastValue = new Array(data.k.length);
        this.getValueAtTime = getNonKeyframedValueAtTime;
        var i, len = data.k.length;
        for(i = 0;i<len;i+=1){
            this.v[i] = mult ? data.k[i] * mult : data.k[i];
            this.pv[i] = data.k[i];
        }
    }

    function KeyframedValueProperty(elem, data, mult){
        this.keyframes = data.k;
        this.offsetTime = elem.data.st;
        this.lastValue = -99999;
        this.lastPValue = -99999;
        this.frameId = -1;
        this.k = true;
        this.data = data;
        this.mult = mult;
        this.elem = elem;
        this.comp = elem.comp;
        this.lastFrame = initFrame;
        this.v = mult ? data.k[0].s[0]*mult : data.k[0].s[0];
        this.pv = data.k[0].s[0];
        this.getValue = getValue;
        this.getValueAtTime = getValueAtTime;
        checkExpressions.bind(this)(elem,data);
    }

    function KeyframedMultidimensionalProperty(elem, data, mult){
        var i, len = data.k.length;
        var s, e,to,ti;
        for(i=0;i<len-1;i+=1){
            if(data.k[i].to && data.k[i].s && data.k[i].e ){
                s = data.k[i].s;
                e = data.k[i].e;
                to = data.k[i].to;
                ti = data.k[i].ti;
                if((s.length == 2 && bez.pointOnLine2D(s[0],s[1],e[0],e[1],s[0] + to[0],s[1] + to[1]) && bez.pointOnLine2D(s[0],s[1],e[0],e[1],e[0] + ti[0],e[1] + ti[1])) || (bez.pointOnLine3D(s[0],s[1],s[2],e[0],e[1],e[2],s[0] + to[0],s[1] + to[1],s[2] + to[2]) && bez.pointOnLine3D(s[0],s[1],s[2],e[0],e[1],e[2],e[0] + ti[0],e[1] + ti[1],e[2] + ti[2]))){

                    data.k[i].to = null;
                    data.k[i].ti = null;
                }
            }
        }
        this.keyframes = data.k;
        this.offsetTime = elem.data.st;
        this.k = true;
        this.mult = mult;
        this.elem = elem;
        this.comp = elem.comp;
        this.getValue = getValue;
        this.getValueAtTime = getValueAtTime;
        this.frameId = -1;
        this.v = new Array(data.k[0].s.length);
        this.pv = new Array(data.k[0].s.length);
        this.lastValue = new Array(data.k[0].s.length);
        this.lastPValue = new Array(data.k[0].s.length);
        this.lastFrame = initFrame;
        checkExpressions.bind(this)(elem,data);
    }

    var TransformProperty = (function(){
        function positionGetter(){
            if(this.p.k){
                this.getValue();
            }
            return this.p.pv;
        }
        function anchorGetter(){
            if(this.a.k){
                this.getValue();
            }
            return this.a.pv;
        }
        function orientationGetter(){
            if(this.or.k){
                this.getValue();
            }
            return this.or.pv;
        }
        function rotationGetter(){
            if(this.r.k){
                this.getValue();
            }
            return this.r.pv;
        }
        function scaleGetter(){
            if(this.s.k){
                this.getValue();
            }
            return this.s.pv;
        }
        function opacityGetter(){
            if(this.o.k){
                this.o.getValue();
            }
            return this.o.pv;
        }
        function skewGetter(){
            if(this.sk.k){
                this.sk.getValue();
            }
            return this.sk.pv;
        }
        function skewAxisGetter(){
            if(this.sa.k){
                this.sa.getValue();
            }
            return this.sa.pv;
        }
        function applyToMatrix(mat, processExpressions){
            var i, len = this.dynamicProperties.length;

            if(processExpressions){
                for(i=0;i<len;i+=1){
                    this.dynamicProperties[i].getValue();
                    if(this.dynamicProperties[i].mdf){
                        this.mdf = true;
                    }
                }
                if(this.a){
                    mat.translate(-this.a.v[0],-this.a.v[1],this.a.v[2]);
                }
                if(this.s){
                    mat.scale(this.s.v[0],this.s.v[1],this.s.v[2]);
                }
                if(this.r){
                    mat.rotate(-this.r.v);
                }else{
                    mat.rotateZ(-this.rz.v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or.v[2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]);
                }
                if(this.data.p.s){
                    if(this.data.p.z) {
                        mat.translate(this.px.v, this.py.v, -this.pz.v);
                    } else {
                        mat.translate(this.px.v, this.py.v, 0);
                    }
                }else{
                    mat.translate(this.p.v[0],this.p.v[1],-this.p.v[2]);
                }
            } else {

                if(this.a){
                    mat.translate(-this.a.pv[0],-this.a.pv[1],this.a.pv[2]);
                }
                if(this.s){
                    mat.scale(this.s.pv[0],this.s.pv[1],this.s.pv[2]);
                }
                if(this.r){
                    mat.rotate(-this.r.pv);
                }else{
                    mat.rotateZ(-this.rz.pv).rotateY(this.ry.pv).rotateX(this.rx.pv).rotateZ(-this.or.pv[2]).rotateY(this.or.pv[1]).rotateX(this.or.pv[0]);
                }
                if(this.data.p.s){
                    if(this.data.p.z) {
                        mat.translate(this.px.pv, this.py.pv, -this.pz.pv);
                    } else {
                        mat.translate(this.px.pv, this.py.pv, 0);
                    }
                }else{
                    mat.translate(this.p.pv[0],this.p.pv[1],-this.p.pv[2]);
                }
            }
        }
        function processKeys(){
            if(this.elem.globalData.frameId === this.frameId){
                return;
            }
            this.mdf = false;
            this.frameId = this.elem.globalData.frameId;
            var i, len = this.dynamicProperties.length;

            for(i=0;i<len;i+=1){
                this.dynamicProperties[i].getValue();
                if(this.dynamicProperties[i].mdf){
                    this.mdf = true;
                }
            }
            if(this.mdf){
                this.v.reset();
                if(this.a){
                    this.v.translate(-this.a.v[0],-this.a.v[1],this.a.v[2]);
                }
                if(this.s){
                    this.v.scale(this.s.v[0],this.s.v[1],this.s.v[2]);
                }
                if(this.sk){
                    this.v.skewFromAxis(-this.sk.v,this.sa.v);
                }
                if(this.r){
                    this.v.rotate(-this.r.v);
                }else{
                    this.v.rotateZ(-this.rz.v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or.v[2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]);
                }
                if(this.data.p.s){
                    if(this.data.p.z) {
                        this.v.translate(this.px.v, this.py.v, -this.pz.v);
                    } else {
                        this.v.translate(this.px.v, this.py.v, 0);
                    }
                }else{
                    this.v.translate(this.p.v[0],this.p.v[1],-this.p.v[2]);
                }
            }
        }

        function setInverted(){
            this.inverted = true;
            this.iv = new Matrix();
            if(!this.k){
                if(this.data.p.s){
                    this.iv.translate(this.px.v,this.py.v,-this.pz.v);
                }else{
                    this.iv.translate(this.p.v[0],this.p.v[1],-this.p.v[2]);
                }
                if(this.r){
                    this.iv.rotate(-this.r.v);
                }else{
                    this.iv.rotateX(-this.rx.v).rotateY(-this.ry.v).rotateZ(this.rz.v);
                }
                if(this.s){
                    this.iv.scale(this.s.v[0],this.s.v[1],1);
                }
                if(this.a){
                    this.iv.translate(-this.a.v[0],-this.a.v[1],this.a.v[2]);
                }
            }
        }

        return function TransformProperty(elem,data,arr){
            this.elem = elem;
            this.frameId = -1;
            this.dynamicProperties = [];
            this.mdf = false;
            this.data = data;
            this.getValue = processKeys;
            this.applyToMatrix = applyToMatrix;
            this.setInverted = setInverted;
            this.v = new Matrix();
            if(data.p.s){
                this.px = getProp(elem,data.p.x,0,0,this.dynamicProperties);
                this.py = getProp(elem,data.p.y,0,0,this.dynamicProperties);
                if(data.p.z){
                    this.pz = getProp(elem,data.p.z,0,0,this.dynamicProperties);
                }
            }else{
                this.p = getProp(elem,data.p,1,0,this.dynamicProperties);
            }
            if(data.r) {
                this.r = getProp(elem, data.r, 0, degToRads, this.dynamicProperties);
            } else if(data.rx) {
                this.rx = getProp(elem, data.rx, 0, degToRads, this.dynamicProperties);
                this.ry = getProp(elem, data.ry, 0, degToRads, this.dynamicProperties);
                this.rz = getProp(elem, data.rz, 0, degToRads, this.dynamicProperties);
                this.or = getProp(elem, data.or, 0, degToRads, this.dynamicProperties);
            }
            if(data.sk){
                this.sk = getProp(elem, data.sk, 0, degToRads, this.dynamicProperties);
                this.sa = getProp(elem, data.sa, 0, degToRads, this.dynamicProperties);
            }
            if(data.a) {
                this.a = getProp(elem,data.a,1,0,this.dynamicProperties);
            }
            if(data.s) {
                this.s = getProp(elem,data.s,1,0.01,this.dynamicProperties);
            }
            if(data.o){
                this.o = getProp(elem,data.o,0,0.01,arr);
            } else {
                this.o = {mdf:false,v:1};
            }
            if(this.dynamicProperties.length){
                arr.push(this);
            }else{
                if(this.a){
                    this.v.translate(-this.a.v[0],-this.a.v[1],this.a.v[2]);
                }
                if(this.s){
                    this.v.scale(this.s.v[0],this.s.v[1],this.s.v[2]);
                }
                if(this.sk){
                    this.v.skewFromAxis(-this.sk.v,this.sa.v);
                }
                if(this.r){
                    this.v.rotate(-this.r.v);
                }else{
                    this.v.rotateZ(-this.rz.v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or.v[2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]);
                }
                if(this.data.p.s){
                    if(data.p.z) {
                        this.v.translate(this.px.v, this.py.v, -this.pz.v);
                    } else {
                        this.v.translate(this.px.v, this.py.v, 0);
                    }
                }else{
                    this.v.translate(this.p.v[0],this.p.v[1],-this.p.v[2]);
                }
            }
            Object.defineProperty(this, "position", { get: positionGetter});
            Object.defineProperty(this, "orientation", { get: orientationGetter});
            Object.defineProperty(this, "anchorPoint", { get: anchorGetter});
            Object.defineProperty(this, "rotation", { get: rotationGetter});
            Object.defineProperty(this, "scale", { get: scaleGetter});
            Object.defineProperty(this, "opacity", { get: opacityGetter});
            Object.defineProperty(this, "skew", { get: skewGetter});
            Object.defineProperty(this, "skewAxis", { get: skewAxisGetter});
        }
    }());

    function getProp(elem,data,type, mult, arr) {
        var p;
        if(type === 2){
            p = new TransformProperty(elem, data, arr);
        }else if(type === 7){
            p = new TrimProperty(elem, data, arr);
        }else if(!data.k.length){
            p = new ValueProperty(elem,data, mult);
        }else if(typeof(data.k[0]) === 'number'){
            p = new MultiDimensionalProperty(elem,data, mult);
        }else{
            switch(type){
                case 0:
                    p = new KeyframedValueProperty(elem,data,mult);
                    break;
                case 1:
                    p = new KeyframedMultidimensionalProperty(elem,data,mult);
                    break;
            }
        }
        if(p.k || p.x){
            arr.push(p);
        }
        return p;
    }

    function getShapeValue(){
        return this.v;
    }

    function ShapeProperty(elem, data, type){
        this.comp = elem.comp;
        this.k = false;
        this.mdf = false;
        this.closed = type === 3 ? data.cl : data.closed;
        this.numNodes = type === 3 ? data.pt.k.v.length : data.ks.k.v.length;
        this.v = type === 3 ? data.pt.k : data.ks.k;
        var shapeData = type === 3 ? data.pt : data.ks;
        this.getValue = getShapeValue;
        this.pv = this.v;
        checkExpressions.bind(this)(elem,shapeData);
    }

    function KeyframedShapeProperty(elem,data,type){
        this.comp = elem.comp;
        this.offsetTime = elem.data.st;
        this.getValue = interpolateShape;
        this.keyframes = type === 3 ? data.pt.k : data.ks.k;
        this.k = true;
        this.closed = type === 3 ? data.cl : data.closed;
        var i, len = this.keyframes[0].s[0].i.length;
        var jLen = this.keyframes[0].s[0].i[0].length;
        this.numNodes = len;
        this.v = {
            i: new Array(len),
            o: new Array(len),
            v: new Array(len)
        };
        this.pv = {
            i: new Array(len),
            o: new Array(len),
            v: new Array(len)
        };
        for(i=0;i<len;i+=1){
            this.v.i[i] = new Array(jLen);
            this.v.o[i] = new Array(jLen);
            this.v.v[i] = new Array(jLen);
            this.pv.i[i] = new Array(jLen);
            this.pv.o[i] = new Array(jLen);
            this.pv.v[i] = new Array(jLen);
        }
        this.lastFrame = initFrame;
        var shapeData = type === 3 ? data.pt : data.ks;
        checkExpressions.bind(this)(elem,shapeData);
    }

    var EllShapeProperty = (function(){

        var cPoint = 0.5519;

        function convertEllToPath(){
            var p0 = this.p.v[0], p1 = this.p.v[1], s0 = this.s.v[0]/2, s1 = this.s.v[1]/2;
            if(this.d !== 2 && this.d !== 3){
                this.v.v[0] = [p0,p1-s1];
                this.v.i[0] = [p0 - s0*cPoint,p1 - s1];
                this.v.o[0] = [p0 + s0*cPoint,p1 - s1];
                this.v.v[1] = [p0 + s0,p1];
                this.v.i[1] = [p0 + s0,p1 - s1*cPoint];
                this.v.o[1] = [p0 + s0,p1 + s1*cPoint];
                this.v.v[2] = [p0,p1+s1];
                this.v.i[2] = [p0 + s0*cPoint,p1 + s1];
                this.v.o[2] = [p0 - s0*cPoint,p1 + s1];
                this.v.v[3] = [p0 - s0,p1];
                this.v.i[3] = [p0 - s0,p1 + s1*cPoint];
                this.v.o[3] = [p0 - s0,p1 - s1*cPoint];
            }else{
                this.v.v[0] = [p0,p1-s1];
                this.v.o[0] = [p0 - s0*cPoint,p1 - s1];
                this.v.i[0] = [p0 + s0*cPoint,p1 - s1];
                this.v.v[1] = [p0 - s0,p1];
                this.v.o[1] = [p0 - s0,p1 + s1*cPoint];
                this.v.i[1] = [p0 - s0,p1 - s1*cPoint];
                this.v.v[2] = [p0,p1+s1];
                this.v.o[2] = [p0 + s0*cPoint,p1 + s1];
                this.v.i[2] = [p0 - s0*cPoint,p1 + s1];
                this.v.v[3] = [p0 + s0,p1];
                this.v.o[3] = [p0 + s0,p1 - s1*cPoint];
                this.v.i[3] = [p0 + s0,p1 + s1*cPoint];
            }
        }

        function processKeys(frameNum){
            var i, len = this.dynamicProperties.length;
            if(this.elem.globalData.frameId === this.frameId){
                return;
            }
            this.mdf = false;
            this.frameId = this.elem.globalData.frameId;

            for(i=0;i<len;i+=1){
                this.dynamicProperties[i].getValue(frameNum);
                if(this.dynamicProperties[i].mdf){
                    this.mdf = true;
                }
            }
            if(this.mdf){
                this.convertEllToPath();
            }
        }

        return function EllShapeProperty(elem,data) {
            this.v = {
                v: new Array(4),
                i: new Array(4),
                o: new Array(4),
                c: true
            };
            this.numNodes = 4;
            this.d = data.d;
            this.dynamicProperties = [];
            data.closed = true;
            this.closed = true;
            this.elem = elem;
            this.comp = elem.comp;
            this.frameId = -1;
            this.mdf = false;
            this.getValue = processKeys;
            this.convertEllToPath = convertEllToPath;
            this.p = getProp(elem,data.p,1,0,this.dynamicProperties);
            this.s = getProp(elem,data.s,1,0,this.dynamicProperties);
            if(this.dynamicProperties.length){
                this.k = true;
            }else{
                this.convertEllToPath();
            }
        }
    }());

    var StarShapeProperty = (function() {

        function convertPolygonToPath(){
            var numPts = Math.floor(this.pt.v);
            var angle = Math.PI*2/numPts;
            this.v.v.length = numPts;
            this.v.i.length = numPts;
            this.v.o.length = numPts;
            var rad = this.or.v;
            var roundness = this.os.v;
            var perimSegment = 2*Math.PI*rad/(numPts*4);
            var i, currentAng = -Math.PI/ 2;
            var dir = this.data.d === 3 ? -1 : 1;
            currentAng += this.r.v;
            for(i=0;i<numPts;i+=1){
                var x = rad * Math.cos(currentAng);
                var y = rad * Math.sin(currentAng);
                var ox = x === 0 && y === 0 ? 0 : y/Math.sqrt(x*x + y*y);
                var oy = x === 0 && y === 0 ? 0 : -x/Math.sqrt(x*x + y*y);
                x +=  + this.p.v[0];
                y +=  + this.p.v[1];
                this.v.v[i] = [x,y];
                this.v.i[i] = [x+ox*perimSegment*roundness*dir,y+oy*perimSegment*roundness*dir];
                this.v.o[i] = [x-ox*perimSegment*roundness*dir,y-oy*perimSegment*roundness*dir];
                currentAng += angle*dir;
            }
            this.numNodes = numPts;
        }

        function convertStarToPath() {
            var numPts = Math.floor(this.pt.v)*2;
            var angle = Math.PI*2/numPts;
            this.v.v.length = numPts;
            this.v.i.length = numPts;
            this.v.o.length = numPts;
            var longFlag = true;
            var longRad = this.or.v;
            var shortRad = this.ir.v;
            var longRound = this.os.v;
            var shortRound = this.is.v;
            var longPerimSegment = 2*Math.PI*longRad/(numPts*2);
            var shortPerimSegment = 2*Math.PI*shortRad/(numPts*2);
            var i, rad,roundness,perimSegment, currentAng = -Math.PI/ 2;
            currentAng += this.r.v;
            var dir = this.data.d === 3 ? -1 : 1;
            for(i=0;i<numPts;i+=1){
                rad = longFlag ? longRad : shortRad;
                roundness = longFlag ? longRound : shortRound;
                perimSegment = longFlag ? longPerimSegment : shortPerimSegment;
                var x = rad * Math.cos(currentAng);
                var y = rad * Math.sin(currentAng);
                var ox = x === 0 && y === 0 ? 0 : y/Math.sqrt(x*x + y*y);
                var oy = x === 0 && y === 0 ? 0 : -x/Math.sqrt(x*x + y*y);
                x +=  + this.p.v[0];
                y +=  + this.p.v[1];
                this.v.v[i] = [x,y];
                this.v.i[i] = [x+ox*perimSegment*roundness*dir,y+oy*perimSegment*roundness*dir];
                this.v.o[i] = [x-ox*perimSegment*roundness*dir,y-oy*perimSegment*roundness*dir];
                longFlag = !longFlag;
                currentAng += angle*dir;
            }
            this.numNodes = numPts;
        }

        function processKeys() {
            if(this.elem.globalData.frameId === this.frameId){
                return;
            }
            this.mdf = false;
            this.frameId = this.elem.globalData.frameId;
            var i, len = this.dynamicProperties.length;

            for(i=0;i<len;i+=1){
                this.dynamicProperties[i].getValue();
                if(this.dynamicProperties[i].mdf){
                    this.mdf = true;
                }
            }
            if(this.mdf){
                this.convertToPath();
            }
        }

        return function StarShapeProperty(elem,data) {
            this.v = {
                v: [],
                i: [],
                o: [],
                c: true
            };
            this.elem = elem;
            this.comp = elem.comp;
            this.data = data;
            this.frameId = -1;
            this.d = data.d;
            this.dynamicProperties = [];
            this.mdf = false;
            data.closed = true;
            this.closed = true;
            this.getValue = processKeys;
            if(data.sy === 1){
                this.ir = getProp(elem,data.ir,0,0,this.dynamicProperties);
                this.is = getProp(elem,data.is,0,0.01,this.dynamicProperties);
                this.convertToPath = convertStarToPath;
            } else {
                this.convertToPath = convertPolygonToPath;
            }
            this.pt = getProp(elem,data.pt,0,0,this.dynamicProperties);
            this.p = getProp(elem,data.p,1,0,this.dynamicProperties);
            this.r = getProp(elem,data.r,0,degToRads,this.dynamicProperties);
            this.or = getProp(elem,data.or,0,0,this.dynamicProperties);
            this.os = getProp(elem,data.os,0,0.01,this.dynamicProperties);
            if(this.dynamicProperties.length){
                this.k = true;
            }else{
                this.convertToPath();
            }
        }
    }());

    var RectShapeProperty = (function() {
        function processKeys(frameNum){
            if(this.elem.globalData.frameId === this.frameId){
                return;
            }
            this.mdf = false;
            this.frameId = this.elem.globalData.frameId;
            var i, len = this.dynamicProperties.length;

            for(i=0;i<len;i+=1){
                this.dynamicProperties[i].getValue(frameNum);
                if(this.dynamicProperties[i].mdf){
                    this.mdf = true;
                }
            }
            if(this.mdf){
                this.convertRectToPath();
            }

        }

        function convertRectToPath(){
            var p0 = this.p.v[0], p1 = this.p.v[1], v0 = this.s.v[0]/2, v1 = this.s.v[1]/2;
            var round = bm_min(v0,v1,this.r.v);
            var cPoint = round*(1-0.5519);

            if(this.d === 2 || this.d === 1) {

                this.v.v[0] = [p0+v0,p1-v1+round];
                this.v.o[0] = this.v.v[0];
                this.v.i[0] = [p0+v0,p1-v1+cPoint];

                this.v.v[1] = [p0+v0,p1+v1-round];
                this.v.o[1] = [p0+v0,p1+v1-cPoint];
                this.v.i[1] = this.v.v[1];

                this.v.v[2] = [p0+v0-round,p1+v1];
                this.v.o[2] = this.v.v[2];
                this.v.i[2] = [p0+v0-cPoint,p1+v1];

                this.v.v[3] = [p0-v0+round,p1+v1];
                this.v.o[3] = [p0-v0+cPoint,p1+v1];
                this.v.i[3] = this.v.v[3];

                this.v.v[4] = [p0-v0,p1+v1-round];
                this.v.o[4] = this.v.v[4];
                this.v.i[4] = [p0-v0,p1+v1-cPoint];

                this.v.v[5] = [p0-v0,p1-v1+round];
                this.v.o[5] = [p0-v0,p1-v1+cPoint];
                this.v.i[5] = this.v.v[5];

                this.v.v[6] = [p0-v0+round,p1-v1];
                this.v.o[6] = this.v.v[6];
                this.v.i[6] = [p0-v0+cPoint,p1-v1];

                this.v.v[7] = [p0+v0-round,p1-v1];
                this.v.o[7] = [p0+v0-cPoint,p1-v1];
                this.v.i[7] = this.v.v[7];
            }else{
                this.v.v[0] = [p0+v0,p1-v1+round];
                this.v.o[0] = [p0+v0,p1-v1+cPoint];
                this.v.i[0] = this.v.v[0];

                this.v.v[1] = [p0+v0-round,p1-v1];
                this.v.o[1] = this.v.v[1];
                this.v.i[1] = [p0+v0-cPoint,p1-v1];

                this.v.v[2] = [p0-v0+round,p1-v1];
                this.v.o[2] = [p0-v0+cPoint,p1-v1];
                this.v.i[2] = this.v.v[2];

                this.v.v[3] = [p0-v0,p1-v1+round];
                this.v.o[3] = this.v.v[3];
                this.v.i[3] = [p0-v0,p1-v1+cPoint];

                this.v.v[4] = [p0-v0,p1+v1-round];
                this.v.o[4] = [p0-v0,p1+v1-cPoint];
                this.v.i[4] = this.v.v[4];

                this.v.v[5] = [p0-v0+round,p1+v1];
                this.v.o[5] = this.v.v[5];
                this.v.i[5] = [p0-v0+cPoint,p1+v1];

                this.v.v[6] = [p0+v0-round,p1+v1];
                this.v.o[6] = [p0+v0-cPoint,p1+v1];
                this.v.i[6] = this.v.v[6];

                this.v.v[7] = [p0+v0,p1+v1-round];
                this.v.o[7] = this.v.v[7];
                this.v.i[7] = [p0+v0,p1+v1-cPoint];

            }
        }

        return function RectShapeProperty(elem,data) {
            this.v = {
                v: new Array(8),
                i: new Array(8),
                o: new Array(8),
                c: true
            };
            this.numNodes = 8;
            this.elem = elem;
            this.comp = elem.comp;
            this.frameId = -1;
            this.d = data.d;
            this.dynamicProperties = [];
            this.mdf = false;
            data.closed = true;
            this.closed = true;
            this.getValue = processKeys;
            this.convertRectToPath = convertRectToPath;
            this.p = getProp(elem,data.p,1,0,this.dynamicProperties);
            this.s = getProp(elem,data.s,1,0,this.dynamicProperties);
            this.r = getProp(elem,data.r,0,0,this.dynamicProperties);
            if(this.dynamicProperties.length){
                this.k = true;
            }else{
                this.convertRectToPath();
            }
        }
    }());

    var TrimProperty = (function(){
        function processKeys(forceRender){
            if(this.elem.globalData.frameId === this.frameId && !forceRender){
                return;
            }
            this.mdf = false;
            this.frameId = this.elem.globalData.frameId;
            var i, len = this.dynamicProperties.length;

            for(i=0;i<len;i+=1){
                this.dynamicProperties[i].getValue();
                if(this.dynamicProperties[i].mdf){
                    this.mdf = true;
                }
            }
            if(this.mdf || forceRender){
                var o = (this.o.v%360)/360;
                if(o === 0 && this.s.v === 0 && this.e.v == 1){
                    this.isTrimming = false;
                    return;
                }
                this.isTrimming = true;
                if(o < 0){
                    o += 1;
                }
                var s = this.s.v + o;
                var e = this.e.v + o;
                if(s == e){

                }
                if(s>e){
                    var _s = s;
                    s = e;
                    e = _s;
                }
                this.sValue = s;
                this.eValue = e;
                this.oValue = o;
            }
        }
        return function TrimProperty(elem,data){
            this.elem = elem;
            this.frameId = -1;
            this.dynamicProperties = [];
            this.sValue = 0;
            this.eValue = 0;
            this.oValue = 0;
            this.mdf = false;
            this.getValue = processKeys;
            this.k = false;
            this.isTrimming = false;
            this.comp = elem.comp;
            this.s = getProp(elem,data.s,0,0.01,this.dynamicProperties);
            this.e = getProp(elem,data.e,0,0.01,this.dynamicProperties);
            this.o = getProp(elem,data.o,0,0,this.dynamicProperties);
            if(this.dynamicProperties.length){
                this.k = true;
            }else{
                this.getValue(true);
            }
        }
    }());

    var TrimTransformerProperty = (function(){


        function getSegmentsLength(keyframes,closed){
            this.totalLength = 0;
            var pathV = keyframes.v;
            var pathO = keyframes.o;
            var pathI = keyframes.i;
            var i, len = pathV.length;
            for(i=0;i<len-1;i+=1){
                this.lengths[i] = bez.getBezierLength(pathV[i],pathV[i+1],pathO[i],pathI[i+1]);
                this.totalLength += this.lengths[i].addedLength;
            }
            if(closed){
                this.lengths[i] = bez.getBezierLength(pathV[i],pathV[0],pathO[i],pathI[0]);
                this.totalLength += this.lengths[i].addedLength;
            }
        }

        function addSegment(pt1,pt2,pt3,pt4, lengthData){
            this.nextO[this.segmentCount] = pt2;
            this.nextI[this.segmentCount+1] = pt3;
            this.nextV[this.segmentCount+1] = pt4;
            if(!this.pathStarted){
                this.pathStarted = true;
                this.v.s[this.segmentCount] = pt1;
            }else{
                this.nextV[this.segmentCount] = pt1;
            }
            this.segmentCount+=1;
        }

        function processKeys(forceRender){
            this.mdf = forceRender ? true : false;
            if(this.prop.k){
                this.prop.getValue();
            }
            var i = 0, len = this.trims.length;
            this.pathStarted = false;
            while(i<len) {
                if(this.trims[i].mdf){
                    this.mdf = true;
                    break;
                }
                i += 1;
            }
            this.mdf = this.prop.mdf ? true : this.mdf;
            if(this.mdf) {
                this.nextO.length = 0;
                this.nextI.length = 0;
                this.nextV.length = 0;
                this.v.s.length = 0;
                var closed = this.prop.closed;
                this.getSegmentsLength(this.prop.v,closed);

                var finalPaths = this.prop.v;
                var j, jLen = this.trims.length, e, s, o, k, kLen;
                for(j=0;j<jLen;j+=1){
                    if(!this.trims[j].isTrimming){
                        this.v.v = finalPaths.v;
                        this.v.o = finalPaths.o;
                        this.v.i = finalPaths.i;
                        continue;
                    }
                    e = this.trims[j].eValue;
                    s = this.trims[j].sValue;
                    o = this.trims[j].oValue;
                    if(e === s){
                        this.v.v = this.nextV;
                        this.v.o = this.nextO;
                        this.v.i = this.nextI;
                        return;
                    }
                    if(e <= 1){
                        this.segments[0].s = this.totalLength*s;
                        this.segments[0].e = this.totalLength*e;
                        this.segments[1].vl = false;
                    }else if(s >= 1){
                        this.segments[0].s = this.totalLength*(s-1);
                        this.segments[0].e = this.totalLength*(e-1);
                        this.segments[1].vl = false;
                    }else{
                        this.segments[0].s = this.totalLength*s;
                        this.segments[0].e = this.totalLength;
                        this.segments[1].s = 0;
                        this.segments[1].e = this.totalLength*(e-1);
                        this.segments[1].vl = true;
                    }

                    this.v.v = finalPaths.v;
                    this.v.o = finalPaths.o;
                    this.v.i = finalPaths.i;
                    kLen = this.v.v.length;
                    var addedLength = 0, segmentLength = 0;
                    len = this.segments[1].vl ? 2 : 1;
                    var segment;
                    this.segmentCount = 0;
                    for(i=0;i<len;i+=1){
                        addedLength = 0;
                        for(k=1;k<kLen;k++){
                            segmentLength = this.lengths[k-1].addedLength;
                            if(addedLength + segmentLength < this.segments[i].s){
                                addedLength += segmentLength;
                                continue;
                            }else if(addedLength > this.segments[i].e){
                                break;
                            }
                            if(this.segments[i].s <= addedLength && this.segments[i].e >= addedLength + segmentLength){
                                this.addSegment(this.v.v[k-1],this.v.o[k-1],this.v.i[k],this.v.v[k],this.lengths[k-1]);
                            }else{
                                segment = bez.getNewSegment(this.v.v[k-1],this.v.v[k],this.v.o[k-1],this.v.i[k], (this.segments[i].s - addedLength)/segmentLength,(this.segments[i].e - addedLength)/segmentLength, this.lengths[k-1]);
                                this.addSegment(segment.pt1,segment.pt3,segment.pt4,segment.pt2/*,bez.getBezierLength(segment.pt1,segment.pt4,segment.pt2,segment.pt3)*/);
                            }
                            addedLength += segmentLength;
                        }
                        if(closed !== false){
                            if(addedLength <= this.segments[i].e){
                                segmentLength = this.lengths[k-1].addedLength;
                                if(this.segments[i].s <= addedLength && this.segments[i].e >= addedLength + segmentLength){
                                    this.addSegment(this.v.v[k-1],this.v.o[k-1],this.v.i[0],this.v.v[0],this.lengths[k-1]);
                                }else{
                                    segment = bez.getNewSegment(this.v.v[k-1],this.v.v[0],this.v.o[k-1],this.v.i[0], (this.segments[i].s - addedLength)/segmentLength,(this.segments[i].e - addedLength)/segmentLength, this.lengths[k-1]);
                                    this.addSegment(segment.pt1,segment.pt3,segment.pt4,segment.pt2/*,bez.getBezierLength(segment.pt1,segment.pt4,segment.pt2,segment.pt3)*/);
                                }
                            }
                        }else{
                            this.pathStarted = false;
                        }
                    }
                    closed = false;
                }
                if(!this.nextV.length){
                    this.v.s.length = 0;
                }else{
                    this.v.v = this.nextV;
                    this.v.o = this.nextO;
                    this.v.i = this.nextI;
                }
                this.v.c = closed;
            }
        }

        return function TrimTransformerProperty(prop,trims) {
            this.trims  = [];
            this.k = false;
            this.mdf = false;
            this.ty = 'tm';
            ////this.comp = elem.comp;
            this.pathStarted = false;
            this.segments = [
                {s:0,e:0,vl:true},{s:0,e:0,vl:false}
            ];
            this.nextO = [];
            this.nextV = [];
            this.nextI = [];
            this.v = {
                i: null,
                o: null,
                v: null,
                s: [],
                c: false
            };
            var i, len = trims.length;
            for(i=0;i<len;i+=1){
                if(!trims[i].closed){
                    this.k = trims[i].trimProp.k ? true : this.k;
                    this.trims.push(trims[i].trimProp);
                }
            }
            this.prop = prop;
            if(this.prop.numNodes){
                len = this.prop.numNodes - 1;
                len += this.prop.closed ? 1:0;
                this.lengths = new Array(len);
            } else {
                this.lengths = [];
            }
            this.k = prop.k ? true : this.k;
            this.totalLength = 0;
            this.getValue = processKeys;
            this.addSegment = addSegment;
            this.getSegmentsLength = getSegmentsLength;
            if(!this.k){
                this.prop.getValue();
                this.getValue(true);
            }
        }
    }());

    function getShapeProp(elem,data,type, arr, trims){
        var prop;
        if(type === 3 || type === 4){
            var keys = type === 3 ? data.pt.k : data.ks.k;
            if(keys.length){
                prop = new KeyframedShapeProperty(elem, data, type);
            }else{
                prop = new ShapeProperty(elem, data, type);
            }
        }else if(type === 5){
            prop = new RectShapeProperty(elem, data);
        }else if(type === 6){
            prop = new EllShapeProperty(elem, data);
        }else if(type === 7){
            prop = new StarShapeProperty(elem, data);
        }
        var hasTrims = false;
        if(trims){
            var i = 0, len = trims.length;
            while(i<len){
                if(!trims[i].closed){
                    hasTrims = true;
                    break;
                }
                i += 1;
            }
        }
        if(hasTrims){
            prop = new TrimTransformerProperty(prop,trims);
        }
        if(prop.k){
            arr.push(prop);
        }
        return prop;
    }

    var DashProperty = (function(){

        function processKeys(forceRender){
            var i = 0, len = this.dataProps.length;

            if(this.elem.globalData.frameId === this.frameId && !forceRender){
                return;
            }
            this.mdf = false;
            this.frameId = this.elem.globalData.frameId;
            while(i<len){
                if(this.dataProps[i].p.mdf){
                    this.mdf = true;
                    break;
                }
                i+=1;
            }
            if(this.mdf || forceRender){
                if(this.renderer === 'svg') {
                    this.dasharray = '';
                }
                for(i=0;i<len;i+=1){
                    if(this.dataProps[i].n != 'o'){
                        if(this.renderer === 'svg') {
                            this.dasharray += ' ' + this.dataProps[i].p.v;
                        }else{
                            this.dasharray[i] = this.dataProps[i].p.v;
                        }
                    }else{
                        this.dashoffset = this.dataProps[i].p.v;
                    }
                }
            }
        }

        return function(elem, data,renderer, dynamicProperties){
            this.elem = elem;
            this.frameId = -1;
            this.dataProps = new Array(data.length);
            this.renderer = renderer;
            this.mdf = false;
            this.k = false;
            if(this.renderer === 'svg'){
                this.dasharray = '';
            }else{

                this.dasharray = new Array(data.length - 1);
            }
            this.dashoffset = 0;
            var i, len = data.length, prop;
            for(i=0;i<len;i+=1){
                prop = getProp(elem,data[i].v,0, 0, dynamicProperties);
                this.k = prop.k ? true : this.k;
                this.dataProps[i] = {n:data[i].n,p:prop};
            }
            this.getValue = processKeys;
            if(this.k){
                dynamicProperties.push(this);
            }else{
                this.getValue(true);
            }

        }
    }());

    function getDashProp(elem, data,renderer, dynamicProperties) {
        return new DashProperty(elem, data,renderer, dynamicProperties);
    };

    var TextExpressionSelectorProp = (function(){

        function getValueProxy(index,total){
            this.textIndex = index+1;
            this.textTotal = total;
            this.getValue();
            return this.v;
        }

        return function TextExpressionSelectorProp(elem,data){
            this.pv = 1;
            this.comp = elem.comp;
            this.mult = .01;
            this.type = 'textSelector';
            this.textTotal = data.totalChars;
            this.selectorValue = 100;
            checkExpressions.bind(this)(elem,data);
            this.getMult = getValueProxy;
        }
    }());

    var TextSelectorProp = (function(){
        var max = Math.max;
        var min = Math.min;
        var floor = Math.floor;
        function updateRange(){
            if(this.dynamicProperties.length){
                var i, len = this.dynamicProperties.length;
                for(i=0;i<len;i+=1){
                    this.dynamicProperties[i].getValue();
                }
            }
            var totalChars = this.data.totalChars;
            var divisor = this.data.r === 2 ? 1 : 100/totalChars;
            var o = this.o.v/divisor;
            var s = this.s.v/divisor + o;
            var e = (this.e.v/divisor) + o;
            if(s>e){
                var _s = s;
                s = e;
                e = _s;
            }
            this.finalS = s;
            this.finalE = e;
        }

        function getMult(ind){
            var easer = bez.getEasingCurve(this.ne.v/100,0,1-this.xe.v/100,1);
            var mult = 0;
            var s = this.finalS;
            var e = this.finalE;
            var type = this.data.sh;
            if(type == 2){
                if(e === s){
                    mult = ind >= e ? 1 : 0;
                }else{
                    mult = max(0,min(0.5/(e-s) + (ind-s)/(e-s),1));
                }
                mult = easer(mult);
            }else if(type == 3){
                if(e === s){
                    mult = ind >= e ? 0 : 1;
                }else{
                    mult = 1 - max(0,min(0.5/(e-s) + (ind-s)/(e-s),1));
                }

                mult = easer(mult);
            }else if(type == 4){
                if(e === s){
                    mult = ind >= e ? 0 : 1;
                }else{
                    mult = max(0,min(0.5/(e-s) + (ind-s)/(e-s),1));
                    if(mult<.5){
                        mult *= 2;
                    }else{
                        mult = 1 - mult;
                    }
                }
            }else if(type == 5){
                if(e === s){
                    mult = ind >= e ? 0 : 1;
                }else{
                    var tot = e - s;

                    mult = -4/(tot*tot)*(ind*ind)+(4/tot)*ind;
                }
            }else if(type == 6){
                if(e === s){
                    mult = ind >= e ? 0 : 1;
                }else{
                    mult = (1+(Math.cos(Math.PI+Math.PI*2*(ind-s)/(e-s))+0))/2;
                }
            }else {
                if(ind >= floor(s)){
                    if(ind-s < 0){
                        mult = 1 - (s - ind);
                    }else{
                        mult = max(0,min(e-ind,1));
                    }
                }
            }
            return mult*this.a.v;
        }

        return function TextSelectorProp(elem,data, arr){
            this.mdf = false;
            this.k = false;
            this.data = data;
            this.dynamicProperties = [];
            this.getValue = updateRange;
            this.getMult = getMult;
            this.comp = elem.comp;
            this.finalS = 0;
            this.finalE = 0;
            this.s = getProp(elem,data.s || {k:0},0,0,this.dynamicProperties);
            if('e' in data){
                this.e = getProp(elem,data.e,0,0,this.dynamicProperties);
            }else{
                this.e = {v:data.r === 2 ? data.totalChars : 100};
            }
            this.o = getProp(elem,data.o || {k:0},0,0,this.dynamicProperties);
            this.xe = getProp(elem,data.xe || {k:0},0,0,this.dynamicProperties);
            this.ne = getProp(elem,data.ne || {k:0},0,0,this.dynamicProperties);
            this.a = getProp(elem,data.a,0,0.01,this.dynamicProperties);
            if(this.dynamicProperties.length){
                arr.push(this);
            }else{
                this.getValue();
            }
        }
    }());

    function getTextSelectorProp(elem, data,arr) {
        switch(data.t){
            case 0:
                return new TextSelectorProp(elem, data, arr);
            case 1:
                return new TextExpressionSelectorProp(elem, data);
        }
    };

    var ob = {};
    ob.getProp = getProp;
    ob.getShapeProp = getShapeProp;
    ob.getDashProp = getDashProp;
    ob.getTextSelectorProp = getTextSelectorProp;
    return ob;
}());
function SVGRenderer(animationItem){
    this.animationItem = animationItem;
    this.layers = null;
    this.renderedFrame = -1;
    this.globalData = {
        frameNum: -1
    };
    this.elements = [];
    this.destroyed = false;
}

SVGRenderer.prototype.createItem = function(layer,parentContainer,comp, placeholder){
    switch(layer.ty){
        case 2:
            return this.createImage(layer,parentContainer,comp, placeholder);
        case 0:
            return this.createComp(layer,parentContainer,comp, placeholder);
        case 1:
            return this.createSolid(layer,parentContainer,comp, placeholder);
        case 4:
            return this.createShape(layer,parentContainer,comp, placeholder);
        case 5:
            return this.createText(layer,parentContainer,comp, placeholder);
        case 99:
            return this.createPlaceHolder(layer,parentContainer);
    }
    return this.createBase(layer,parentContainer,comp);
};

SVGRenderer.prototype.buildItems = function(layers,parentContainer,elements,comp, placeholder){
    var  i, len = layers.length;
    if(!elements){
        elements = this.elements;
    }
    if(!parentContainer){
        parentContainer = this.animationItem.container;
    }
    if(!comp){
        comp = this;
    }
    var elems;
    for (i = len - 1; i >= 0; i--) {
        elements[i] = this.createItem(layers[i],parentContainer,comp, placeholder);
        if (layers[i].ty === 0) {
            elems = [];
            this.buildItems(layers[i].layers,elements[i].getDomElement(),elems,elements[i], elements[i].placeholder);
            elements[i].setElements(elems);
        }
        if(layers[i].td){
            elements[i+1].setMatte(elements[i].layerId);
        }
        //NullLayer
    }
};

SVGRenderer.prototype.includeLayers = function(layers,parentContainer,elements){
    var i, len = layers.length;
    if(!elements){
        elements = this.elements;
    }
    if(!parentContainer){
        parentContainer = this.animationItem.container;
    }
    var j, jLen = elements.length, elems, placeholder;
    for(i=0;i<len;i+=1){
        if(!layers[i].id){
            var elem = this.createItem(layers[i],parentContainer, this);
            elements.push(elem);
            if (layers[i].ty === 0) {
                elems = [];
                this.buildItems(layers[i].layers,elem.getDomElement(),elems, elem);
                elem.setElements(elems);
            }
        }else {
            j = 0;
            while (j < jLen) {
                if (elements[j].data.id == layers[i].id) {
                    placeholder = elements[j];
                    elements[j] = this.createItem(layers[i], parentContainer, this, placeholder);
                    if (layers[i].ty === 0) {
                        elems = [];
                        this.buildItems(layers[i].layers, elements[j].getDomElement(), elems, elements[j], elements[i].placeholder);
                        elements[j].setElements(elems);
                    }
                }
                j += 1;
            }
        }
    }
    for(i=0;i<len;i+=1){
        if(layers[i].td){
            elements[i+1].setMatte(elements[i].layerId);
        }
    }
};

SVGRenderer.prototype.createBase = function (data,parentContainer,comp, placeholder) {
    return new SVGBaseElement(data, parentContainer,this.globalData,comp, placeholder);
};

SVGRenderer.prototype.createPlaceHolder = function (data,parentContainer) {
    return new PlaceHolderElement(data, parentContainer,this.globalData);
};

SVGRenderer.prototype.createShape = function (data,parentContainer,comp, placeholder) {
    return new IShapeElement(data, parentContainer,this.globalData,comp, placeholder);
};

SVGRenderer.prototype.createText = function (data,parentContainer,comp, placeholder) {
    return new SVGTextElement(data, parentContainer,this.globalData,comp, placeholder);

};

SVGRenderer.prototype.createImage = function (data,parentContainer,comp, placeholder) {
    return new IImageElement(data, parentContainer,this.globalData,comp, placeholder);
};

SVGRenderer.prototype.createComp = function (data,parentContainer,comp, placeholder) {
    return new ICompElement(data, parentContainer,this.globalData,comp, placeholder);

};

SVGRenderer.prototype.createSolid = function (data,parentContainer,comp, placeholder) {
    return new ISolidElement(data, parentContainer,this.globalData,comp, placeholder);
};

SVGRenderer.prototype.configAnimation = function(animData){
    this.animationItem.container = document.createElementNS(svgNS,'svg');
    this.animationItem.container.setAttribute('xmlns','http://www.w3.org/2000/svg');
    this.animationItem.container.setAttribute('width',animData.w);
    this.animationItem.container.setAttribute('height',animData.h);
    this.animationItem.container.setAttribute('viewBox','0 0 '+animData.w+' '+animData.h);
    this.animationItem.container.setAttribute('preserveAspectRatio','xMidYMid meet');
    this.animationItem.container.style.width = '100%';
    this.animationItem.container.style.height = '100%';
    this.animationItem.container.style.transform = 'translate3d(0,0,0)';
    this.animationItem.container.style.transformOrigin = this.animationItem.container.style.mozTransformOrigin = this.animationItem.container.style.webkitTransformOrigin = this.animationItem.container.style['-webkit-transform'] = "0px 0px 0px";
    this.animationItem.wrapper.appendChild(this.animationItem.container);
    //Mask animation
    var defs = document.createElementNS(svgNS, 'defs');
    this.globalData.defs = defs;
    this.animationItem.container.appendChild(defs);
    this.globalData.getAssetData = this.animationItem.getAssetData.bind(this.animationItem);
    this.globalData.getPath = this.animationItem.getPath.bind(this.animationItem);
    this.globalData.elementLoaded = this.animationItem.elementLoaded.bind(this.animationItem);
    this.globalData.frameId = 0;
    this.globalData.compSize = {
        w: animData.w,
        h: animData.h
    };
    this.globalData.frameRate = animData.fr;
    var maskElement = document.createElementNS(svgNS, 'clipPath');
    var rect = document.createElementNS(svgNS,'rect');
    rect.setAttribute('width',animData.w);
    rect.setAttribute('height',animData.h);
    rect.setAttribute('x',0);
    rect.setAttribute('y',0);
    var maskId = 'animationMask_'+randomString(10);
    maskElement.setAttribute('id', maskId);
    maskElement.appendChild(rect);
    var maskedElement = document.createElementNS(svgNS,'g');
    maskedElement.setAttribute("clip-path", "url(#"+maskId+")");
    this.animationItem.container.appendChild(maskedElement);
    defs.appendChild(maskElement);
    this.animationItem.container = maskedElement;
    this.layers = animData.layers;
    this.globalData.fontManager = new FontManager();
    this.globalData.fontManager.addChars(animData.chars);
    this.globalData.fontManager.addFonts(animData.fonts,defs);
};

SVGRenderer.prototype.buildStage = function (container, layers,elements) {
    var i, len = layers.length, layerData;
    if(!elements){
        elements = this.elements;
    }
    for (i = len - 1; i >= 0; i--) {
        layerData = layers[i];
        if (layerData.parent !== undefined) {
            this.buildItemParenting(layerData,elements[i],layers,layerData.parent,elements, true);
        }

        if (layerData.ty === 0) {
            this.buildStage(elements[i].getComposingElement(), layerData.layers, elements[i].getElements());
        }
    }
};
SVGRenderer.prototype.buildItemParenting = function (layerData,element,layers,parentName,elements, resetHierarchyFlag) {
    if(!layerData.parents){
        layerData.parents = [];
    }
    if(resetHierarchyFlag){
        element.resetHierarchy();
    }
    var i=0, len = layers.length;
    while(i<len){
        if(layers[i].ind == parentName){
            element.getHierarchy().push(elements[i]);
            if(layers[i].parent !== undefined){
                this.buildItemParenting(layerData,element,layers,layers[i].parent,elements, false);
            }
        }
        i += 1;
    }
};

SVGRenderer.prototype.destroy = function () {
    this.animationItem.wrapper.innerHTML = '';
    this.animationItem.container = null;
    this.globalData.defs = null;
    var i, len = this.layers.length;
    for (i = 0; i < len; i++) {
        this.elements[i].destroy();
    }
    this.elements.length = 0;
    this.destroyed = true;
};

SVGRenderer.prototype.updateContainerSize = function () {
};

SVGRenderer.prototype.renderFrame = function(num){
    if(this.renderedFrame == num || this.destroyed){
        return;
    }
    if(num === null){
        num = this.renderedFrame;
    }else{
        this.renderedFrame = num;
    }
    //console.log('-------');
    //console.log('FRAME ',num);
    this.globalData.frameNum = num;
    this.globalData.frameId += 1;
    var i, len = this.layers.length;
    for (i = 0; i < len; i++) {
        this.elements[i].prepareFrame(num - this.layers[i].st);
    }
    for (i = 0; i < len; i++) {
        this.elements[i].renderFrame();
    }
};

extendPrototype(ExpressionComp,SVGRenderer);

function CanvasRenderer(animationItem, config){
    this.animationItem = animationItem;
    this.renderConfig = {
        clearCanvas: (config && config.clearCanvas) || true,
        context: (config && config.context) || null,
        scaleMode: (config && config.scaleMode) || 'fit'
    };
    this.renderConfig.dpr = (config && config.dpr) || 1;
    if (this.animationItem.wrapper) {
        this.renderConfig.dpr = (config && config.dpr) || window.devicePixelRatio || 1;
    }
    this.renderedFrame = -1;
    this.globalData = {
        frameNum: -1
    };
    this.contextData = {
        saved : new Array(15),
        savedOp: new Array(15),
        cArrPos : 0,
        cTr : new Matrix(),
        cO : 1
    };
    var i, len = 15;
    for(i=0;i<len;i+=1){
        this.contextData.saved[i] = new Array(16);
    }
    this.elements = [];
    this.transformMat = new Matrix();
}

CanvasRenderer.prototype.createItem = function(layer, comp){
    switch(layer.ty){
        case 0:
            return this.createComp(layer, comp);
        case 1:
            return this.createSolid(layer, comp);
        case 2:
            return this.createImage(layer, comp);
        case 4:
            return this.createShape(layer, comp);
        case 5:
            return this.createText(layer, comp);
        case 99:
            return this.createPlaceHolder(layer, comp);
        default:
            return this.createBase(layer, comp);
    }
    return this.createBase(layer,comp);
};

CanvasRenderer.prototype.buildItems = function(layers,elements, comp){
    if(!elements){
        elements = this.elements;
    }
    if(!comp){
        comp = this;
    }
    var i, len = layers.length;
    for (i = 0; i < len; i++) {
        elements[i] = this.createItem(layers[i], comp);
        if (layers[i].ty === 0) {
            var elems = [];
            this.buildItems(layers[i].layers,elems,elements[i]);
            elements[elements.length - 1].setElements(elems);
        }
    }
};

CanvasRenderer.prototype.includeLayers = function(layers,parentContainer,elements){
    var i, len = layers.length;
    if(!elements){
        elements = this.elements;
    }
    var j, jLen = elements.length, elems;
    for(i=0;i<len;i+=1){
        if(!layers[i].id){
            var elem = this.createItem(layers[i],this);
            elements.unshift(elem);
            if (layers[i].ty === 0) {
                elems = [];
                this.buildItems(layers[i].layers,elems,elem);
                elem.setElements(elems);
            }
        }else {
            j = 0;
            while (j < jLen) {
                if (elements[j].data.id == layers[i].id) {
                    elements[j] = this.createItem(layers[i], this);
                    if (layers[i].ty === 0) {
                        elems = [];
                        this.buildItems(layers[i].layers, elems, elements[j]);
                        elements[j].setElements(elems);
                    }
                }
                j += 1;
            }
        }
    }
};

CanvasRenderer.prototype.createBase = function (data, comp) {
    return new CVBaseElement(data, comp, this.globalData);
};

CanvasRenderer.prototype.createShape = function (data, comp) {
    return new CVShapeElement(data, comp, this.globalData);
};

CanvasRenderer.prototype.createText = function (data, comp) {
    return new CVTextElement(data, comp, this.globalData);
};

CanvasRenderer.prototype.createPlaceHolder = function (data) {
    return new PlaceHolderElement(data, null,this.globalData);
};

CanvasRenderer.prototype.createImage = function (data, comp) {
    return new CVImageElement(data, comp, this.globalData);
};

CanvasRenderer.prototype.createComp = function (data, comp) {
    return new CVCompElement(data, comp, this.globalData);
};

CanvasRenderer.prototype.createSolid = function (data, comp) {
    return new CVSolidElement(data, comp, this.globalData);
};

CanvasRenderer.prototype.ctxTransform = function(props){
    if(props[0] === 1 && props[1] === 0 && props[4] === 0 && props[5] === 1 && props[12] === 0 && props[13] === 0){
        return;
    }
    if(!this.renderConfig.clearCanvas){
        this.canvasContext.transform(props[0],props[1],props[4],props[5],props[12],props[13]);
        return;
    }
    this.transformMat.cloneFromProps(props);
    this.transformMat.transform(this.contextData.cTr.props[0],this.contextData.cTr.props[1],this.contextData.cTr.props[2],this.contextData.cTr.props[3],this.contextData.cTr.props[4],this.contextData.cTr.props[5],this.contextData.cTr.props[6],this.contextData.cTr.props[7],this.contextData.cTr.props[8],this.contextData.cTr.props[9],this.contextData.cTr.props[10],this.contextData.cTr.props[11],this.contextData.cTr.props[12],this.contextData.cTr.props[13],this.contextData.cTr.props[14],this.contextData.cTr.props[15])
    //this.contextData.cTr.transform(props[0],props[1],props[2],props[3],props[4],props[5],props[6],props[7],props[8],props[9],props[10],props[11],props[12],props[13],props[14],props[15]);
    this.contextData.cTr.cloneFromProps(this.transformMat.props);
    var trProps = this.contextData.cTr.props;
    this.canvasContext.setTransform(trProps[0],trProps[1],trProps[4],trProps[5],trProps[12],trProps[13]);
};

CanvasRenderer.prototype.ctxOpacity = function(op){
    if(op === 1){
        return;
    }
    if(!this.renderConfig.clearCanvas){
        this.canvasContext.globalAlpha *= op < 0 ? 0 : op;
        return;
    }
    this.contextData.cO *= op < 0 ? 0 : op;
     this.canvasContext.globalAlpha = this.contextData.cO;
};

CanvasRenderer.prototype.reset = function(){
    if(!this.renderConfig.clearCanvas){
        this.canvasContext.restore();
        return;
    }
    this.contextData.cArrPos = 0;
    this.contextData.cTr.reset();
    this.contextData.cO = 1;
};

CanvasRenderer.prototype.save = function(actionFlag){
    if(!this.renderConfig.clearCanvas){
        this.canvasContext.save();
        return;
    }
    if(actionFlag){
        this.canvasContext.save();
    }
    var props = this.contextData.cTr.props;
    if(this.contextData.saved[this.contextData.cArrPos] === null || this.contextData.saved[this.contextData.cArrPos] === undefined){
        this.contextData.saved[this.contextData.cArrPos] = new Array(16);
    }
    var i,arr = this.contextData.saved[this.contextData.cArrPos];
    for(i=0;i<16;i+=1){
        arr[i] = props[i];
    }
    this.contextData.savedOp[this.contextData.cArrPos] = this.contextData.cO;
    this.contextData.cArrPos += 1;
};

CanvasRenderer.prototype.restore = function(actionFlag){
    if(!this.renderConfig.clearCanvas){
        this.canvasContext.restore();
        return;
    }
    if(actionFlag){
        this.canvasContext.restore();
    }
    this.contextData.cArrPos -= 1;
    var popped = this.contextData.saved[this.contextData.cArrPos];
    var i,arr = this.contextData.cTr.props;
    for(i=0;i<16;i+=1){
        arr[i] = popped[i];
    }
    this.canvasContext.setTransform(popped[0],popped[1],popped[4],popped[5],popped[12],popped[13]);
    popped = this.contextData.savedOp[this.contextData.cArrPos];
    this.contextData.cO = popped;
    this.canvasContext.globalAlpha = popped;
};

CanvasRenderer.prototype.configAnimation = function(animData){
    if(this.animationItem.wrapper){
        this.animationItem.container = document.createElement('canvas');
        this.animationItem.container.style.width = '100%';
        this.animationItem.container.style.height = '100%';
        //this.animationItem.container.style.transform = 'translate3d(0,0,0)';
        //this.animationItem.container.style.webkitTransform = 'translate3d(0,0,0)';
        this.animationItem.container.style.transformOrigin = this.animationItem.container.style.mozTransformOrigin = this.animationItem.container.style.webkitTransformOrigin = this.animationItem.container.style['-webkit-transform'] = "0px 0px 0px";
        this.animationItem.wrapper.appendChild(this.animationItem.container);
        this.canvasContext = this.animationItem.container.getContext('2d');
    }else{
        this.canvasContext = this.renderConfig.context;
    }
    this.globalData.canvasContext = this.canvasContext;
    this.globalData.renderer = this;
    this.globalData.isDashed = false;
    this.globalData.totalFrames = Math.floor(animData.tf);
    this.globalData.compWidth = animData.w;
    this.globalData.compHeight = animData.h;
    this.globalData.frameRate = animData.fr;
    this.globalData.frameId = 0;
    this.layers = animData.layers;
    this.transformCanvas = {};
    this.transformCanvas.w = animData.w;
    this.transformCanvas.h = animData.h;
    this.updateContainerSize();
    this.globalData.fontManager = new FontManager();
    this.globalData.fontManager.addChars(animData.chars);
    this.globalData.fontManager.addFonts(animData.fonts,document);
};

CanvasRenderer.prototype.updateContainerSize = function () {
    var elementWidth,elementHeight;
    if(this.animationItem.wrapper && this.animationItem.container){
        elementWidth = this.animationItem.wrapper.offsetWidth;
        elementHeight = this.animationItem.wrapper.offsetHeight;
        this.animationItem.container.setAttribute('width',elementWidth * this.renderConfig.dpr );
        this.animationItem.container.setAttribute('height',elementHeight * this.renderConfig.dpr);
    }else{
        elementWidth = this.canvasContext.canvas.width * this.renderConfig.dpr;
        elementHeight = this.canvasContext.canvas.height * this.renderConfig.dpr;
    }
    if(this.renderConfig.scaleMode == 'fit'){
        var elementRel = elementWidth/elementHeight;
        var animationRel = this.transformCanvas.w/this.transformCanvas.h;
        if(animationRel>elementRel){
            this.transformCanvas.sx = elementWidth/(this.transformCanvas.w/this.renderConfig.dpr);
            this.transformCanvas.sy = elementWidth/(this.transformCanvas.w/this.renderConfig.dpr);
            this.transformCanvas.tx = 0;
            this.transformCanvas.ty = ((elementHeight-this.transformCanvas.h*(elementWidth/this.transformCanvas.w))/2)*this.renderConfig.dpr;
        }else{
            this.transformCanvas.sx = elementHeight/(this.transformCanvas.h / this.renderConfig.dpr);
            this.transformCanvas.sy = elementHeight/(this.transformCanvas.h / this.renderConfig.dpr);
            this.transformCanvas.tx = (elementWidth-this.transformCanvas.w*(elementHeight/this.transformCanvas.h))/2*this.renderConfig.dpr;
            this.transformCanvas.ty = 0;
        }
    }else{
        this.transformCanvas.sx = this.renderConfig.dpr;
        this.transformCanvas.sy = this.renderConfig.dpr;
        this.transformCanvas.tx = 0;
        this.transformCanvas.ty = 0;
    }
    this.transformCanvas.props = [this.transformCanvas.sx,0,0,0,0,this.transformCanvas.sy,0,0,0,0,1,0,this.transformCanvas.tx,this.transformCanvas.ty,0,1];
    this.globalData.cWidth = elementWidth;
    this.globalData.cHeight = elementHeight;
};

CanvasRenderer.prototype.buildStage = function (container, layers, elements) {
    if(!elements){
        elements = this.elements;
    }
    var i, len = layers.length, layerData;
    for (i = len - 1; i >= 0; i--) {
        layerData = layers[i];
        if (layerData.parent !== undefined) {
            this.buildItemHierarchy(layerData,elements[i], layers, layerData.parent,elements, true);
        }
        if (layerData.ty == 0) {
            this.buildStage(null, layerData.layers, elements[i].getElements());
        }
    }
};

CanvasRenderer.prototype.buildItemHierarchy = function (data,element, layers, parentName,elements,resetHierarchyFlag) {
    var i=0, len = layers.length;
    if(resetHierarchyFlag){
        element.resetHierarchy();
    }
    while(i<len){
        if(layers[i].ind === parentName){
            element.getHierarchy().push(elements[i]);
            if (layers[i].parent !== undefined) {
                this.buildItemHierarchy(data,element, layers, layers[i].parent,elements, false);
            }
        }
        i += 1;
    }
};

CanvasRenderer.prototype.destroy = function () {
    if(this.renderConfig.clearCanvas) {
        this.animationItem.wrapper.innerHTML = '';
    }
    var i, len = this.layers.length;
    for (i = len - 1; i >= 0; i-=1) {
        this.elements[i].destroy();
    }
    this.elements.length = 0;
    this.globalData.canvasContext = null;
    this.animationItem.container = null;
    this.destroyed = true;
};

CanvasRenderer.prototype.renderFrame = function(num){
    if((this.renderedFrame == num && this.renderConfig.clearCanvas === true) || this.destroyed || num === null){
        return;
    }
    this.renderedFrame = num;
    this.globalData.frameNum = num - this.animationItem.firstFrame;
    this.globalData.frameId += 1;
    if(this.renderConfig.clearCanvas === true){
        this.reset();
        //this.canvasContext.canvas.width = this.canvasContext.canvas.width;
        this.canvasContext.clearRect(0, 0, this.transformCanvas.w, this.transformCanvas.h);
    }else{
        this.save();
    }
    this.ctxTransform(this.transformCanvas.props);
    this.canvasContext.beginPath();
    this.canvasContext.rect(0,0,this.transformCanvas.w,this.transformCanvas.h);
    this.canvasContext.closePath();
    this.canvasContext.clip();

    //console.log('--------');
    //console.log('NEW: ',num);
    var i, len = this.layers.length;
    for (i = 0; i < len; i++) {
        this.elements[i].prepareFrame(num - this.layers[i].st);
    }
    for (i = len - 1; i >= 0; i-=1) {
        this.elements[i].renderFrame();
    }
    if(this.renderConfig.clearCanvas !== true){
        this.restore();
    }
};
extendPrototype(ExpressionComp,CanvasRenderer);

function HybridRenderer(animationItem){
    this.animationItem = animationItem;
    this.layers = null;
    this.renderedFrame = -1;
    this.globalData = {
        frameNum: -1
    };
    this.elements = [];
    this.threeDElements = [];
    this.destroyed = false;
    this.camera = null;

}

HybridRenderer.prototype.createItem = function(layer,parentContainer,comp, placeholder){
    switch(layer.ty){
        case 2:
            return this.createImage(layer,parentContainer,comp, placeholder);
        case 0:
            return this.createComp(layer,parentContainer,comp, placeholder);
        case 1:
            return this.createSolid(layer,parentContainer,comp, placeholder);
        case 4:
            return this.createShape(layer,parentContainer,comp, placeholder);
        case 5:
            return this.createText(layer,parentContainer,comp, placeholder);
        case 13:
            return this.createCamera(layer,parentContainer,comp, placeholder);
        case 99:
            return this.createPlaceHolder(layer,parentContainer);
    }
    return this.createBase(layer,parentContainer,comp);
};

HybridRenderer.prototype.buildItems = function(layers,parentContainer,elements,comp, placeholder){
    var  i, len = layers.length;
    if(!elements){
        elements = this.elements;
    }
    if(!comp){
        comp = this;
    }

    var currentContainer, is3d = false;

    var elems;
    for (i = len - 1; i >= 0; i--) {
        if(!parentContainer) {
            if(layers[i].ddd) {
                if(!is3d){
                    is3d = true;
                    currentContainer = this.getThreeDContainer();
                }
                elements[i] = this.createItem(layers[i],currentContainer,comp, placeholder);
            } else {
                is3d = false;
                elements[i] = this.createItem(layers[i],this.animationItem.resizerElem,comp, placeholder);
            }
        } else{
            elements[i] = this.createItem(layers[i],parentContainer,comp, placeholder);
        }
        if (layers[i].ty === 0) {
            elems = [];
            this.buildItems(layers[i].layers,elements[i].getDomElement(),elems,elements[i], elements[i].placeholder);
            elements[i].setElements(elems);
        }
        if(layers[i].td){
            elements[i+1].setMatte(elements[i].layerId);
        }
        //NullLayer
    }
    this.currentContainer = this.animationItem.resizerElem;
    if(!parentContainer){
        if(this.threeDElements.length){
            if(!this.camera){
                var cWidth = this.globalData.compSize.w;
                var cHeight = this.globalData.compSize.h;
                len = this.threeDElements.length;
                for(i=0;i<len;i+=1){
                    this.threeDElements[0][i].style.perspective = this.threeDElements[0][i].style.webkitPerspective = Math.sqrt(Math.pow(cWidth,2) + Math.pow(cHeight,2)) + 'px';
                }

            } else {
                this.camera.setup();
            }
        }
    }
};

HybridRenderer.prototype.includeLayers = function(layers,parentContainer,elements){
    var i, len = layers.length;
    if(!elements){
        elements = this.elements;
    }
    if(!parentContainer){
        parentContainer = this.currentContainer;
    }
    var j, jLen = elements.length, elems, placeholder;
    for(i=0;i<len;i+=1){
        if(!layers[i].id){
            var elem = this.createItem(layers[i],parentContainer, this);
            elements.push(elem);
            if (layers[i].ty === 0) {
                elems = [];
                this.buildItems(layers[i].layers,elem.getDomElement(),elems, elem);
                elem.setElements(elems);
            }
        }else {
            j = 0;
            while(j<jLen){
                if(elements[j].data.id == layers[i].id){
                    placeholder = elements[j];
                    elements[j] = this.createItem(layers[i],parentContainer,this, placeholder);
                    if (layers[i].ty === 0) {
                        elems = [];
                        this.buildItems(layers[i].layers,elements[j].getDomElement(),elems,elements[j], elements[i].placeholder);
                        elements[j].setElements(elems);
                    }
                }
                j += 1;
            }
        }
    }
    for(i=0;i<len;i+=1){
        if(layers[i].td){
            elements[i+1].setMatte(elements[i].layerId);
        }
    }
};

HybridRenderer.prototype.createBase = function (data,parentContainer,comp, placeholder) {
    return new SVGBaseElement(data, parentContainer,this.globalData,comp, placeholder);
};

HybridRenderer.prototype.createPlaceHolder = function (data,parentContainer) {
    return new PlaceHolderElement(data, parentContainer,this.globalData);
};

HybridRenderer.prototype.createShape = function (data,parentContainer,comp, placeholder) {
    if(comp.isSvg){
        return new IShapeElement(data, parentContainer,this.globalData,comp, placeholder);
    }
    return new HShapeElement(data, parentContainer,this.globalData,comp, placeholder);
};

HybridRenderer.prototype.createText = function (data,parentContainer,comp, placeholder) {
    if(comp.isSvg){
        return new SVGTextElement(data, parentContainer,this.globalData,comp, placeholder);
    }
    return new HTextElement(data, parentContainer,this.globalData,comp, placeholder);
};

HybridRenderer.prototype.createCamera = function (data,parentContainer,comp, placeholder) {
    this.camera = new HCameraElement(data, parentContainer,this.globalData,comp, placeholder);
    return this.camera;
};

HybridRenderer.prototype.createImage = function (data,parentContainer,comp, placeholder) {
    if(comp.isSvg){
        return new IImageElement(data, parentContainer,this.globalData,comp, placeholder);
    }
    return new HImageElement(data, parentContainer,this.globalData,comp, placeholder);
};

HybridRenderer.prototype.createComp = function (data,parentContainer,comp, placeholder) {
    if(comp.isSvg){
        return new ICompElement(data, parentContainer,this.globalData,comp, placeholder);
    }
    return new HCompElement(data, parentContainer,this.globalData,comp, placeholder);

};

HybridRenderer.prototype.createSolid = function (data,parentContainer,comp, placeholder) {
    if(comp.isSvg){
        return new ISolidElement(data, parentContainer,this.globalData,comp, placeholder);
    }
    return new HSolidElement(data, parentContainer,this.globalData,comp, placeholder);
};

HybridRenderer.prototype.getThreeDContainer = function(){
    var perspectiveElem = document.createElement('div');
    styleDiv(perspectiveElem);
    perspectiveElem.style.width = this.globalData.compSize.w+'px';
    perspectiveElem.style.height = this.globalData.compSize.h+'px';
    perspectiveElem.style.transformOrigin = perspectiveElem.style.mozTransformOrigin = perspectiveElem.style.webkitTransformOrigin = "50% 50%";
    var container = document.createElement('div');
    styleDiv(container);
    container.style.transform = container.style.webkitTransform = 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)';
    perspectiveElem.appendChild(container);
    this.animationItem.resizerElem.appendChild(perspectiveElem);
    this.threeDElements.push([perspectiveElem,container]);
    return container;
}

HybridRenderer.prototype.configAnimation = function(animData){
    var resizerElem = document.createElement('div');
    var wrapper = this.animationItem.wrapper;
    resizerElem.style.width = animData.w+'px';
    resizerElem.style.height = animData.h+'px';
    this.animationItem.resizerElem = resizerElem;
    styleDiv(resizerElem);
    resizerElem.style.transformStyle = resizerElem.style.webkitTransformStyle = resizerElem.style.mozTransformStyle = "flat";
    wrapper.appendChild(resizerElem);

    resizerElem.style.overflow = 'hidden';
    var svg = document.createElementNS(svgNS,'svg');
    svg.setAttribute('width','1');
    svg.setAttribute('height','1');
    styleDiv(svg);
    this.animationItem.resizerElem.appendChild(svg);
    var defs = document.createElementNS(svgNS,'defs');
    svg.appendChild(defs);
    this.globalData.defs = defs;
    //Mask animation
    this.globalData.getAssetData = this.animationItem.getAssetData.bind(this.animationItem);
    this.globalData.getPath = this.animationItem.getPath.bind(this.animationItem);
    this.globalData.elementLoaded = this.animationItem.elementLoaded.bind(this.animationItem);
    this.globalData.frameId = 0;
    this.globalData.compSize = {
        w: animData.w,
        h: animData.h
    };
    this.globalData.frameRate = animData.fr;
    this.layers = animData.layers;
    this.globalData.fontManager = new FontManager();
    this.globalData.fontManager.addChars(animData.chars);
    this.globalData.fontManager.addFonts(animData.fonts,svg);
    this.updateContainerSize();
};

HybridRenderer.prototype.buildStage = function (container, layers,elements) {
    var i, len = layers.length, layerData;
    if(!elements){
        elements = this.elements;
    }
    for (i = len - 1; i >= 0; i--) {
        layerData = layers[i];
        if (layerData.parent !== undefined) {
            this.buildItemParenting(layerData,elements[i],layers,layerData.parent,elements, true);
        }

        if (layerData.ty === 0) {
            this.buildStage(elements[i].getComposingElement(), layerData.layers, elements[i].getElements());
        }
    }
};
HybridRenderer.prototype.buildItemParenting = function (layerData,element,layers,parentName,elements, resetHierarchyFlag) {
    if(!layerData.parents){
        layerData.parents = [];
    }
    if(resetHierarchyFlag){
        element.resetHierarchy();
    }
    var i=0, len = layers.length;
    while(i<len){
        if(layers[i].ind == parentName){
            element.getHierarchy().push(elements[i]);
            if(element.data.ty === 13){
                elements[i].finalTransform.mProp.setInverted();
            }
            if(layers[i].parent !== undefined){
                this.buildItemParenting(layerData,element,layers,layers[i].parent,elements, false);
            }
        }
        i += 1;
    }
};

HybridRenderer.prototype.destroy = function () {
    this.animationItem.wrapper.innerHTML = '';
    this.animationItem.container = null;
    this.globalData.defs = null;
    var i, len = this.layers.length;
    for (i = 0; i < len; i++) {
        this.elements[i].destroy();
    }
    this.elements.length = 0;
    this.destroyed = true;
};

HybridRenderer.prototype.updateContainerSize = function () {
    var elementWidth = this.animationItem.wrapper.offsetWidth;
    var elementHeight = this.animationItem.wrapper.offsetHeight;
    var elementRel = elementWidth/elementHeight;
    var animationRel = this.globalData.compSize.w/this.globalData.compSize.h;
    var sx,sy,tx,ty;
    if(animationRel>elementRel){
        sx = elementWidth/(this.globalData.compSize.w);
        sy = elementWidth/(this.globalData.compSize.w);
        tx = 0;
        ty = ((elementHeight-this.globalData.compSize.h*(elementWidth/this.globalData.compSize.w))/2);
    }else{
        sx = elementHeight/(this.globalData.compSize.h);
        sy = elementHeight/(this.globalData.compSize.h);
        tx = (elementWidth-this.globalData.compSize.w*(elementHeight/this.globalData.compSize.h))/2;
        ty = 0;
    }
    this.animationItem.resizerElem.style.transform = this.animationItem.resizerElem.style.webkitTransform = 'matrix3d(' + sx + ',0,0,0,0,'+sy+',0,0,0,0,1,0,'+tx+','+ty+',0,1)';
};

HybridRenderer.prototype.renderFrame = function(num){
    if(this.renderedFrame == num || this.destroyed){
        return;
    }
    if(num === null){
        num = this.renderedFrame;
    }else{
        this.renderedFrame = num;
    }
    //console.log('-------');
    //console.log('FRAME ',num);
    this.globalData.frameNum = num;
    this.globalData.frameId += 1;
    var i, len = this.layers.length;
    for (i = 0; i < len; i++) {
        this.elements[i].prepareFrame(num - this.layers[i].st);
    }
    for (i = 0; i < len; i++) {
        this.elements[i].renderFrame();
    }
};

extendPrototype(ExpressionComp,HybridRenderer);
function MaskElement(data,element,globalData) {
    this.dynamicProperties = [];
    this.data = data;
    this.element = element;
    this.globalData = globalData;
    this.paths = [];
    this.storedData = [];
    this.masksProperties = this.data.masksProperties;
    this.viewData = new Array(this.masksProperties.length);
    this.maskElement = null;
    this.firstFrame = true;
    var maskedElement = this.element.maskedElement;
    var defs = this.globalData.defs;
    var i, len = this.masksProperties.length;


    var path, properties = this.masksProperties;
    var count = 0;
    var currentMasks = [];
    var j, jLen;
    var layerId = randomString(10);
    var rect, expansor, feMorph,x;
    var maskType = 'clipPath', maskRef = 'clip-path';
    for (i = 0; i < len; i++) {

        if((properties[i].mode !== 'a' && properties[i].mode !== 'n')|| properties[i].inv){
            maskType = 'mask';
            maskRef = 'mask';
        }

        if((properties[i].mode == 's' || properties[i].mode == 'i') && count == 0){
            rect = document.createElementNS(svgNS, 'rect');
            rect.setAttribute('fill', '#ffffff');
            rect.setAttribute('x', '0');
            rect.setAttribute('y', '0');
            rect.setAttribute('width', '100%');
            rect.setAttribute('height', '100%');
            currentMasks.push(rect);
        }

        if(properties[i].mode == 'n' || properties[i].cl === false) {
            this.viewData[i] = {
                prop: PropertyFactory.getShapeProp(this.element,properties[i],3,this.dynamicProperties,null)
            };
            continue;
        }
        count += 1;
        path = document.createElementNS(svgNS, 'path');
        if (properties[i].cl) {
            if(properties[i].mode == 's'){
                path.setAttribute('fill', '#000000');
            }else{
                path.setAttribute('fill', '#ffffff');
            }
        } else {
            path.setAttribute('fill', 'none');
            if(properties[i].mode == 's'){
                path.setAttribute('fill', '#000000');
            }else{
                path.setAttribute('fill', '#ffffff');
            }
            path.setAttribute('stroke-width', '1');
            path.setAttribute('stroke-miterlimit', '10');
        }
        path.setAttribute('clip-rule','nonzero');

        if(properties[i].x.k !== 0){
            maskType = 'mask';
            maskRef = 'mask';
            x = PropertyFactory.getProp(this.element,properties[i].x,0,null,this.dynamicProperties);
            var filterID = 'fi_'+randomString(10);
            expansor = document.createElementNS(svgNS,'filter');
            expansor.setAttribute('id',filterID);
            feMorph = document.createElementNS(svgNS,'feMorphology');
            feMorph.setAttribute('operator','dilate');
            feMorph.setAttribute('in','SourceGraphic');
            feMorph.setAttribute('radius','0');
            expansor.appendChild(feMorph);
            defs.appendChild(expansor);
            if(properties[i].mode == 's'){
                path.setAttribute('stroke', '#000000');
            }else{
                path.setAttribute('stroke', '#ffffff');
            }
        }else{
            feMorph = null;
            x = null;
        }


        this.storedData[i] = {
             elem: path,
             x: x,
             expan: feMorph,
            lastPath: '',
            lastOperator:'',
            filterId:filterID,
            lastRadius:0
        };
        if(properties[i].mode == 'i'){
            jLen = currentMasks.length;
            var g = document.createElementNS(svgNS,'g');
            for(j=0;j<jLen;j+=1){
                g.appendChild(currentMasks[j]);
            }
            var mask = document.createElementNS(svgNS,'mask');
            mask.setAttribute('mask-type','alpha');
            mask.setAttribute('id',layerId+'_'+count);
            mask.appendChild(path);
            defs.appendChild(mask);
            g.setAttribute('mask','url(#'+layerId+'_'+count+')');

            currentMasks.length = 0;
            currentMasks.push(g);
        }else{
            currentMasks.push(path);
        }
        if(properties[i].inv && !this.solidPath){
            this.solidPath = this.createLayerSolidPath();
        }
        this.viewData[i] = {
            elem: path,
            lastPath: '',
            prop:PropertyFactory.getShapeProp(this.element,properties[i],3,this.dynamicProperties,null)
        };
        if(!this.viewData[i].prop.k){
            this.drawPath(properties[i],this.viewData[i].prop.v,this.viewData[i]);
        }
    }

    this.maskElement = document.createElementNS(svgNS, maskType);

    len = currentMasks.length;
    for(i=0;i<len;i+=1){
        this.maskElement.appendChild(currentMasks[i]);
    }

    this.maskElement.setAttribute('id', layerId);
    if(count > 0){
        this.element.maskedElement.setAttribute(maskRef, "url(#" + layerId + ")");
    }

    defs.appendChild(this.maskElement);
};

MaskElement.prototype.getMaskProperty = function(pos){
    return this.viewData[pos].prop;
};

MaskElement.prototype.prepareFrame = function(){
    var i, len = this.dynamicProperties.length;
    for(i=0;i<len;i+=1){
        this.dynamicProperties[i].getValue();

    }
};

MaskElement.prototype.renderFrame = function () {
    var i, len = this.masksProperties.length;
    for (i = 0; i < len; i++) {
        if(this.masksProperties[i].mode !== 'n' && this.masksProperties[i].cl !== false){
            if(this.viewData[i].prop.mdf || this.firstFrame){
                this.drawPath(this.masksProperties[i],this.viewData[i].prop.v,this.viewData[i]);
            }
            if(this.storedData[i].x && (this.storedData[i].x.mdf || this.firstFrame)){
                var feMorph = this.storedData[i].expan;
                if(this.storedData[i].x.v < 0){
                    if(this.storedData[i].lastOperator !== 'erode'){
                        this.storedData[i].lastOperator = 'erode';
                        this.storedData[i].elem.setAttribute('filter','url(#'+this.storedData[i].filterId+')');
                    }
                    feMorph.setAttribute('radius',-this.storedData[i].x.v);
                }else{
                    if(this.storedData[i].lastOperator !== 'dilate'){
                        this.storedData[i].lastOperator = 'dilate';
                        this.storedData[i].elem.setAttribute('filter',null);
                    }
                    this.storedData[i].elem.setAttribute('stroke-width', this.storedData[i].x.v*2);

                }
            }
        }
    }
    this.firstFrame = false;
};

MaskElement.prototype.getMaskelement = function () {
    return this.maskElement;
};

MaskElement.prototype.createLayerSolidPath = function(){
    var path = 'M0,0 ';
    path += ' h' + this.globalData.compSize.w ;
    path += ' v' + this.globalData.compSize.h ;
    path += ' h-' + this.globalData.compSize.w ;
    path += ' v-' + this.globalData.compSize.h + ' ';
    return path;
};

MaskElement.prototype.drawPath = function(pathData,pathNodes,viewData){
    var pathString = '';
    var i, len;
    len = pathNodes.v.length;
    for(i=1;i<len;i+=1){
        if(i==1){
            //pathString += " M"+pathNodes.v[0][0]+','+pathNodes.v[0][1];
            pathString += " M"+bm_rnd(pathNodes.v[0][0])+','+bm_rnd(pathNodes.v[0][1]);
        }
        //pathString += " C"+pathNodes.o[i-1][0]+','+pathNodes.o[i-1][1] + " "+pathNodes.i[i][0]+','+pathNodes.i[i][1] + " "+pathNodes.v[i][0]+','+pathNodes.v[i][1];
        pathString += " C"+bm_rnd(pathNodes.o[i-1][0])+','+bm_rnd(pathNodes.o[i-1][1]) + " "+bm_rnd(pathNodes.i[i][0])+','+bm_rnd(pathNodes.i[i][1]) + " "+bm_rnd(pathNodes.v[i][0])+','+bm_rnd(pathNodes.v[i][1]);
    }
    if(pathData.cl){
        //pathString += " C"+pathNodes.o[i-1][0]+','+pathNodes.o[i-1][1] + " "+pathNodes.i[0][0]+','+pathNodes.i[0][1] + " "+pathNodes.v[0][0]+','+pathNodes.v[0][1];
        pathString += " C"+bm_rnd(pathNodes.o[i-1][0])+','+bm_rnd(pathNodes.o[i-1][1]) + " "+bm_rnd(pathNodes.i[0][0])+','+bm_rnd(pathNodes.i[0][1]) + " "+bm_rnd(pathNodes.v[0][0])+','+bm_rnd(pathNodes.v[0][1]);
    }
    //pathNodes.__renderedString = pathString;


    if(viewData.lastPath !== pathString){
        if(pathData.inv){
            viewData.elem.setAttribute('d',this.solidPath + pathString);
        }else{
            viewData.elem.setAttribute('d',pathString);
        }
        viewData.lastPath = pathString;
    }
};

MaskElement.prototype.getMask = function(nm){
    var i = 0, len = this.masksProperties.length;
    while(i<len){
        if(this.masksProperties[i].nm === nm){
            return {
                maskPath: this.viewData[i].prop.pv
            }
        }
        i += 1;
    }
};

MaskElement.prototype.destroy = function(){
    this.element = null;
    this.globalData = null;
    this.maskElement = null;
    this.data = null;
    this.paths = null;
    this.masksProperties = null;
};
function SliderEffect(data,elem, dynamicProperties){
    this.p = PropertyFactory.getProp(elem,data.v,0,0,dynamicProperties);
}
function AngleEffect(data,elem, dynamicProperties){
    this.p = PropertyFactory.getProp(elem,data.v,0,0,dynamicProperties);
}
function ColorEffect(data,elem, dynamicProperties){
    this.p = PropertyFactory.getProp(elem,data.v,1,1/255,dynamicProperties);
}
function PointEffect(data,elem, dynamicProperties){
    this.p = PropertyFactory.getProp(elem,data.v,1,0,dynamicProperties);
}
function CheckboxEffect(data,elem, dynamicProperties){
    this.p = PropertyFactory.getProp(elem,data.v,1,0,dynamicProperties);
}

SliderEffect.prototype.proxyFunction = function(){
    return this.p.v;
}

AngleEffect.prototype.proxyFunction = SliderEffect.prototype.proxyFunction;
ColorEffect.prototype.proxyFunction = SliderEffect.prototype.proxyFunction;
PointEffect.prototype.proxyFunction = SliderEffect.prototype.proxyFunction;
CheckboxEffect.prototype.proxyFunction = SliderEffect.prototype.proxyFunction;
function EffectsManager(data,element,dynamicProperties){
    this.data = data;
    this.element = element;
    var effects = data.ef;
    this.effectElements = [];
    var i,len = effects.length;
    var eff;
    for(i=0;i<len;i++){
        switch(effects[i].ty){
            case 0:
                eff = new SliderEffect(effects[i],element,dynamicProperties);
                this.effectElements.push(eff.proxyFunction.bind(eff));
                break;
            case 1:
;                eff = new AngleEffect(effects[i],element,dynamicProperties);
                this.effectElements.push(eff.proxyFunction.bind(eff));
                break;
            case 2:
                eff = new ColorEffect(effects[i],element,dynamicProperties);
                this.effectElements.push(eff.proxyFunction.bind(eff));
                break;
            case 3:
                eff = new PointEffect(effects[i],element,dynamicProperties);
                this.effectElements.push(eff.proxyFunction.bind(eff));
                break;
            case 4:
                eff = new CheckboxEffect(effects[i],element,dynamicProperties);
                this.effectElements.push(eff.proxyFunction.bind(eff));
                break;
        }
    }
}

EffectsManager.prototype.getEffect = function(name){
    var effects = this.data.ef, i = 0, len = effects.length;
    while(i<len) {
        if(effects[i].nm === name){
            return this.effectElements[i];
        }
        i += 1;
    }
};
function BaseElement(){
};
BaseElement.prototype.checkMasks = function(){
    if(!this.data.hasMask){
        return false;
    }
    var i = 0, len = this.data.masksProperties.length;
    while(i<len) {
        if((this.data.masksProperties[i].mode !== 'n' && this.data.masksProperties[i].cl !== false)) {
            return true;
        }
        i += 1;
    }
    return false;
}

BaseElement.prototype.prepareFrame = function(num){
    if(this.data.ip - this.data.st <= num && this.data.op - this.data.st > num)
    {
        if(this.isVisible !== true){
            this.isVisible = true;
            this.firstFrame = true;
            if(this.data.hasMask){
                this.maskManager.firstFrame = true;
            }
        }
    }else{
        if(this.isVisible !== false){
            this.isVisible = false;
        }
    }
    var i, len = this.dynamicProperties.length;
    for(i=0;i<len;i+=1){
        this.dynamicProperties[i].getValue(num);
    }
    if(this.data.hasMask){
        this.maskManager.prepareFrame(num);
    }
    /* TODO check this
    if(this.data.sy){
        if(this.data.sy[0].renderedData[num]){
            if(this.data.sy[0].renderedData[num].c){
                this.feFlood.setAttribute('flood-color','rgb('+Math.round(this.data.sy[0].renderedData[num].c[0])+','+Math.round(this.data.sy[0].renderedData[num].c[1])+','+Math.round(this.data.sy[0].renderedData[num].c[2])+')');
            }
            if(this.data.sy[0].renderedData[num].s){
                this.feMorph.setAttribute('radius',this.data.sy[0].renderedData[num].s);
            }
        }
    }
    */

    this.currentFrameNum = num;
    return this.isVisible;
};

BaseElement.prototype.init = function(){
    this.hidden = false;
    this.firstFrame = true;
    this.isVisible = false;
    this.dynamicProperties = [];
    this.currentFrameNum = -99999;
    this.lastNum = -99999;
    if(this.data.ef){
        this.effectsManager = new EffectsManager(this.data,this,this.dynamicProperties);
        this.effect = this.effectsManager.getEffect.bind(this.effectsManager);
    }
    this.finalTransform = {
        mProp: PropertyFactory.getProp(this,this.data.ks,2,null,this.dynamicProperties),
        matMdf: false,
        opMdf: false,
        mat: new Matrix(),
        opacity: 1
    };
    this.finalTransform.op = this.finalTransform.mProp.o;
    this.transform = this.finalTransform.mProp;
    this.createElements();
    if(this.data.hasMask){
        this.addMasks(this.data);
    }
};
BaseElement.prototype.getType = function(){
    return this.type;
};

BaseElement.prototype.resetHierarchy = function(){
    if(!this.hierarchy){
        this.hierarchy = [];
    }else{
        this.hierarchy.length = 0;
    }
};

BaseElement.prototype.getHierarchy = function(){
    if(!this.hierarchy){
        this.hierarchy = [];
    }
    return this.hierarchy;
};

BaseElement.prototype.getLayerSize = function(){
    if(this.data.ty === 5){
        return {w:this.data.textData.width,h:this.data.textData.height};
    }else{
        return {w:this.data.width,h:this.data.height};
    }
};

BaseElement.prototype.hide = function(){

};


BaseElement.prototype.mHelper = new Matrix();
BaseElement.prototype.mask = function(nm){
    return this.maskManager.getMask(nm);
}

extendPrototype(LayerInterface,BaseElement);

Object.defineProperty(BaseElement.prototype, "anchorPoint", {
    get: function anchorPoint() {
        return this.finalTransform.mProp.anchorPoint;
    }
});
function SVGBaseElement(data,parentContainer,globalData,comp, placeholder){
    this.globalData = globalData;
    this.comp = comp;
    this.data = data;
    this.matteElement = null;
    this.parentContainer = parentContainer;
    this.layerId = placeholder ? placeholder.layerId : 'ly_'+randomString(10);
    this.placeholder = placeholder;
    this.init();
};

createElement(BaseElement, SVGBaseElement);

SVGBaseElement.prototype.appendNodeToParent = function(node) {
    if(this.placeholder){
        var g = this.placeholder.phElement;
        g.parentNode.insertBefore(node, g);
        //g.parentNode.removeChild(g);
    }else{
        this.parentContainer.appendChild(node);
    }
};

SVGBaseElement.prototype.createElements = function(){
    if(this.data.td){
        if(this.data.td == 3){
            this.layerElement = document.createElementNS(svgNS,'mask');
            this.layerElement.setAttribute('id',this.layerId);
            this.layerElement.setAttribute('mask-type','luminance');
            this.globalData.defs.appendChild(this.layerElement);
        }else if(this.data.td == 2){
            var maskGroup = document.createElementNS(svgNS,'mask');
            maskGroup.setAttribute('id',this.layerId);
            maskGroup.setAttribute('mask-type','alpha');
            var maskGrouper = document.createElementNS(svgNS,'g');
            maskGroup.appendChild(maskGrouper);
            this.layerElement = document.createElementNS(svgNS,'g');
            var fil = document.createElementNS(svgNS,'filter');
            var filId = randomString(10);
            fil.setAttribute('id',filId);
            fil.setAttribute('filterUnits','objectBoundingBox');
            fil.setAttribute('x','0%');
            fil.setAttribute('y','0%');
            fil.setAttribute('width','100%');
            fil.setAttribute('height','100%');
            var feCTr = document.createElementNS(svgNS,'feComponentTransfer');
            feCTr.setAttribute('in','SourceGraphic');
            fil.appendChild(feCTr);
            var feFunc = document.createElementNS(svgNS,'feFuncA');
            feFunc.setAttribute('type','table');
            feFunc.setAttribute('tableValues','1.0 0.0');
            feCTr.appendChild(feFunc);
            this.globalData.defs.appendChild(fil);
            var alphaRect = document.createElementNS(svgNS,'rect');
            alphaRect.setAttribute('width','100%');
            alphaRect.setAttribute('height','100%');
            alphaRect.setAttribute('x','0');
            alphaRect.setAttribute('y','0');
            alphaRect.setAttribute('fill','#ffffff');
            alphaRect.setAttribute('opacity','0');
            maskGrouper.setAttribute('filter','url(#'+filId+')');
            maskGrouper.appendChild(alphaRect);
            maskGrouper.appendChild(this.layerElement);
            this.globalData.defs.appendChild(maskGroup);
        }else{
            this.layerElement = document.createElementNS(svgNS,'g');
            var masker = document.createElementNS(svgNS,'mask');
            masker.setAttribute('id',this.layerId);
            masker.setAttribute('mask-type','alpha');
            masker.appendChild(this.layerElement);
            this.globalData.defs.appendChild(masker);
        }
        if(this.data.hasMask){
            this.maskedElement = this.layerElement;
        }
    }else if(this.data.hasMask){
        this.layerElement = document.createElementNS(svgNS,'g');
        if(this.data.tt){
            this.matteElement = document.createElementNS(svgNS,'g');
            this.matteElement.appendChild(this.layerElement);
            this.appendNodeToParent(this.matteElement);
        }else{
            this.appendNodeToParent(this.layerElement);
        }
        this.maskedElement = this.layerElement;
    }else if(this.data.tt){
        this.matteElement = document.createElementNS(svgNS,'g');
        this.matteElement.setAttribute('id',this.layerId);
        this.appendNodeToParent(this.matteElement);
        this.layerElement = this.matteElement;
    }else{
        this.layerElement = this.parentContainer;
    }
    if(this.data.ln && (this.data.ty === 4 || this.data.ty === 0)){
        if(this.layerElement === this.parentContainer){
            this.layerElement = document.createElementNS(svgNS,'g');
            this.appendNodeToParent(this.layerElement);
        }
        this.layerElement.setAttribute('id',this.data.ln);
    }
    if(this.layerElement !== this.parentContainer){
        this.placeholder = null;
    }
    /* Todo performance killer
    if(this.data.sy){
        var filterID = 'st_'+randomString(10);
        var c = this.data.sy[0].c.k;
        var r = this.data.sy[0].s.k;
        var expansor = document.createElementNS(svgNS,'filter');
        expansor.setAttribute('id',filterID);
        var feFlood = document.createElementNS(svgNS,'feFlood');
        this.feFlood = feFlood;
        if(!c[0].e){
            feFlood.setAttribute('flood-color','rgb('+c[0]+','+c[1]+','+c[2]+')');
        }
        feFlood.setAttribute('result','base');
        expansor.appendChild(feFlood);
        var feMorph = document.createElementNS(svgNS,'feMorphology');
        feMorph.setAttribute('operator','dilate');
        feMorph.setAttribute('in','SourceGraphic');
        feMorph.setAttribute('result','bigger');
        this.feMorph = feMorph;
        if(!r.length){
            feMorph.setAttribute('radius',this.data.sy[0].s.k);
        }
        expansor.appendChild(feMorph);
        var feColorMatrix = document.createElementNS(svgNS,'feColorMatrix');
        feColorMatrix.setAttribute('result','mask');
        feColorMatrix.setAttribute('in','bigger');
        feColorMatrix.setAttribute('type','matrix');
        feColorMatrix.setAttribute('values','0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0');
        expansor.appendChild(feColorMatrix);
        var feComposite = document.createElementNS(svgNS,'feComposite');
        feComposite.setAttribute('result','drop');
        feComposite.setAttribute('in','base');
        feComposite.setAttribute('in2','mask');
        feComposite.setAttribute('operator','in');
        expansor.appendChild(feComposite);
        var feBlend = document.createElementNS(svgNS,'feBlend');
        feBlend.setAttribute('in','SourceGraphic');
        feBlend.setAttribute('in2','drop');
        feBlend.setAttribute('mode','normal');
        expansor.appendChild(feBlend);
        this.globalData.defs.appendChild(expansor);
        var cont = document.createElementNS(svgNS,'g');
        if(this.layerElement === this.parentContainer){
            this.layerElement = cont;
        }else{
            cont.appendChild(this.layerElement);
        }
        cont.setAttribute('filter','url(#'+filterID+')');
        if(this.data.td){
            cont.setAttribute('data-td',this.data.td);
        }
        if(this.data.td == 3){
            this.globalData.defs.appendChild(cont);
        }else if(this.data.td == 2){
            maskGrouper.appendChild(cont);
        }else if(this.data.td == 1){
            masker.appendChild(cont);
        }else{
            if(this.data.hasMask && this.data.tt){
                this.matteElement.appendChild(cont);
            }else{
                this.appendNodeToParent(cont);
            }
        }
    }*/
};

SVGBaseElement.prototype.renderFrame = function(parentTransform){
    if(this.data.ty === 3){
        return false;
    }

    if(this.currentFrameNum === this.lastNum || !this.isVisible){
        return this.isVisible;
    }
    this.lastNum = this.currentFrameNum;

    if(this.data.hasMask){
        this.maskManager.renderFrame();
    }
    this.finalTransform.opMdf = this.finalTransform.op.mdf;
    this.finalTransform.matMdf = this.finalTransform.mProp.mdf;
    this.finalTransform.opacity = this.finalTransform.op.v;
    if(this.firstFrame){
        this.finalTransform.opMdf = true;
        this.finalTransform.matMdf = true;
    }

    var mat;
    var finalMat = this.finalTransform.mat;

    if(this.hierarchy){
        var i, len = this.hierarchy.length;

        mat = this.finalTransform.mProp.v.props;
        finalMat.cloneFromProps(mat);
        for(i=0;i<len;i+=1){
            this.finalTransform.matMdf = this.hierarchy[i].finalTransform.mProp.mdf ? true : this.finalTransform.matMdf;
            mat = this.hierarchy[i].finalTransform.mProp.v.props;
            finalMat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5],mat[6],mat[7],mat[8],mat[9],mat[10],mat[11],mat[12],mat[13],mat[14],mat[15]);
        }
    }else{
        if(this.isVisible){
            if(!parentTransform){
                finalMat.cloneFromProps(this.finalTransform.mProp.v.props);
            }else{
                mat = this.finalTransform.mProp.v.props;
                finalMat.cloneFromProps(mat);
            }
        }
    }
    if(parentTransform){
        mat = parentTransform.mat.props;
        finalMat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5],mat[6],mat[7],mat[8],mat[9],mat[10],mat[11],mat[12],mat[13],mat[14],mat[15]);
        this.finalTransform.opacity *= parentTransform.opacity;
        this.finalTransform.opMdf = parentTransform.opMdf ? true : this.finalTransform.opMdf;
        this.finalTransform.matMdf = parentTransform.matMdf ? true : this.finalTransform.matMdf;
    }
    if(this.data.hasMask){
        if(this.finalTransform.matMdf){
            this.layerElement.setAttribute('transform',finalMat.to2dCSS());
        }
        if(this.finalTransform.opMdf){
            this.layerElement.setAttribute('opacity',this.finalTransform.opacity);
        }
    }
    return this.isVisible;
};

SVGBaseElement.prototype.destroy = function(){
    this.layerElement = null;
    this.parentContainer = null;
    if(this.matteElement) {
        this.matteElement = null;
    }
    if(this.maskManager) {
        this.maskManager.destroy();
    }
};

SVGBaseElement.prototype.getDomElement = function(){
    return this.layerElement;
};
SVGBaseElement.prototype.addMasks = function(data){
    this.maskManager = new MaskElement(data,this,this.globalData);
};

SVGBaseElement.prototype.setMatte = function(id){
    if(!this.matteElement){
        return;
    }
    this.matteElement.setAttribute("mask", "url(#" + id + ")");
};

SVGBaseElement.prototype.hide = function(){

};

function ITextElement(data, animationItem,parentContainer,globalData){
}
ITextElement.prototype.init = function(){
    this.parent.init.call(this);
    this.lettersChangedFlag = false;
    var data = this.data;
    this.renderedLetters = new Array(data.t.d.l.length);
    this.viewData = {
        m:{
            a: PropertyFactory.getProp(this,data.t.m.a,1,0,this.dynamicProperties)
        }
    };
    var textData = this.data.t;
    if(textData.a.length){
        this.viewData.a = new Array(textData.a.length);
        var i, len = textData.a.length, animatorData, animatorProps;
        for(i=0;i<len;i+=1){
            animatorProps = textData.a[i];
            animatorData = {
                a: {},
                s: {}
            };
            if('r' in animatorProps.a) {
                animatorData.a.r = PropertyFactory.getProp(this,animatorProps.a.r,0,degToRads,this.dynamicProperties);
            }
            if('rx' in animatorProps.a) {
                animatorData.a.rx = PropertyFactory.getProp(this,animatorProps.a.rx,0,degToRads,this.dynamicProperties);
            }
            if('ry' in animatorProps.a) {
                animatorData.a.ry = PropertyFactory.getProp(this,animatorProps.a.ry,0,degToRads,this.dynamicProperties);
            }
            if('sk' in animatorProps.a) {
                animatorData.a.sk = PropertyFactory.getProp(this,animatorProps.a.sk,0,degToRads,this.dynamicProperties);
            }
            if('sa' in animatorProps.a) {
                animatorData.a.sa = PropertyFactory.getProp(this,animatorProps.a.sa,0,degToRads,this.dynamicProperties);
            }
            if('s' in animatorProps.a) {
                animatorData.a.s = PropertyFactory.getProp(this,animatorProps.a.s,1,0.01,this.dynamicProperties);
            }
            if('a' in animatorProps.a) {
                animatorData.a.a = PropertyFactory.getProp(this,animatorProps.a.a,1,0,this.dynamicProperties);
            }
            if('o' in animatorProps.a) {
                animatorData.a.o = PropertyFactory.getProp(this,animatorProps.a.o,0,0.01,this.dynamicProperties);
            }
            if('p' in animatorProps.a) {
                animatorData.a.p = PropertyFactory.getProp(this,animatorProps.a.p,1,0,this.dynamicProperties);
            }
            if('sw' in animatorProps.a) {
                animatorData.a.sw = PropertyFactory.getProp(this,animatorProps.a.sw,0,0,this.dynamicProperties);
            }
            if('sc' in animatorProps.a) {
                animatorData.a.sc = PropertyFactory.getProp(this,animatorProps.a.sc,1,0,this.dynamicProperties);
            }
            if('fc' in animatorProps.a) {
                animatorData.a.fc = PropertyFactory.getProp(this,animatorProps.a.fc,1,0,this.dynamicProperties);
            }
            if('t' in animatorProps.a) {
                animatorData.a.t = PropertyFactory.getProp(this,animatorProps.a.t,0,0,this.dynamicProperties);
            }
            animatorData.s = PropertyFactory.getTextSelectorProp(this,animatorProps.s,this.dynamicProperties);
            animatorData.s.t = animatorProps.s.t;
            this.viewData.a[i] = animatorData;
        }
    }else{
        this.viewData.a = [];
    }
    if(textData.p && 'm' in textData.p){
        this.viewData.p = {
            f: PropertyFactory.getProp(this,textData.p.f,0,0,this.dynamicProperties),
            l: PropertyFactory.getProp(this,textData.p.l,0,0,this.dynamicProperties),
            m: this.maskManager.getMaskProperty(textData.p.m)
        };
        this.maskPath = true;
    } else {
        this.maskPath = false;
    }
};

ITextElement.prototype.createPathShape = function(matrixHelper, shapes) {
    var j,jLen = shapes.length;
    var k, kLen, pathNodes;
    var shapeStr = '';
    for(j=0;j<jLen;j+=1){
        kLen = shapes[j].ks.k.i.length;
        pathNodes = shapes[j].ks.k;
        for(k=1;k<kLen;k+=1){
            if(k==1){
                shapeStr += " M"+matrixHelper.applyToPointStringified(pathNodes.v[0][0],pathNodes.v[0][1]);
            }
            shapeStr += " C"+matrixHelper.applyToPointStringified(pathNodes.o[k-1][0],pathNodes.o[k-1][1]) + " "+matrixHelper.applyToPointStringified(pathNodes.i[k][0],pathNodes.i[k][1]) + " "+matrixHelper.applyToPointStringified(pathNodes.v[k][0],pathNodes.v[k][1]);
        }
        shapeStr += " C"+matrixHelper.applyToPointStringified(pathNodes.o[k-1][0],pathNodes.o[k-1][1]) + " "+matrixHelper.applyToPointStringified(pathNodes.i[0][0],pathNodes.i[0][1]) + " "+matrixHelper.applyToPointStringified(pathNodes.v[0][0],pathNodes.v[0][1]);
        shapeStr += 'z';
    }
    return shapeStr;
};

ITextElement.prototype.getMeasures = function(){

    var matrixHelper = this.mHelper;
    var renderType = this.renderType;
    var data = this.data;
    var xPos,yPos;
    var i, len;
    var documentData = data.t.d;
    var letters = documentData.l;
    if(this.maskPath) {
        var mask = this.viewData.p.m;
        if(!this.viewData.p.n || this.viewData.p.mdf){
            var paths = mask.v;
            var pathInfo = {
                tLength: 0,
                segments: []
            };
            len = paths.v.length - 1;
            var pathData;
            var totalLength = 0;
            for (i = 0; i < len; i += 1) {
                pathData = {
                    s: paths.v[i],
                    e: paths.v[i + 1],
                    to: [paths.o[i][0] - paths.v[i][0], paths.o[i][1] - paths.v[i][1]],
                    ti: [paths.i[i + 1][0] - paths.v[i + 1][0], paths.i[i + 1][1] - paths.v[i + 1][1]]
                };
                bez.buildBezierData(pathData);
                pathInfo.tLength += pathData.bezierData.segmentLength;
                pathInfo.segments.push(pathData);
                totalLength += pathData.bezierData.segmentLength;
            }
            i = len;
            if (mask.closed) {
                pathData = {
                    s: paths.v[i],
                    e: paths.v[0],
                    to: [paths.o[i][0] - paths.v[i][0], paths.o[i][1] - paths.v[i][1]],
                    ti: [paths.i[0][0] - paths.v[0][0], paths.i[0][1] - paths.v[0][1]]
                };
                bez.buildBezierData(pathData);
                pathInfo.tLength += pathData.bezierData.segmentLength;
                pathInfo.segments.push(pathData);
                totalLength += pathData.bezierData.segmentLength;
            }
            this.viewData.p.pi = pathInfo;
        }
        var pathInfo = this.viewData.p.pi;

        var currentLength = this.viewData.p.f.v, segmentInd = 0, pointInd = 1, currentPoint, prevPoint, points;
        var segmentLength = 0, flag = true;
        var segments = pathInfo.segments;
        if (currentLength < 0 && mask.closed) {
            if (pathInfo.tLength < Math.abs(currentLength)) {
                currentLength = -Math.abs(currentLength) % pathInfo.tLength;
            }
            segmentInd = segments.length - 1;
            points = segments[segmentInd].bezierData.points;
            pointInd = points.length - 1;
            while (currentLength < 0) {
                currentLength += points[pointInd].partialLength;
                pointInd -= 1;
                if (pointInd < 0) {
                    segmentInd -= 1;
                    points = segments[segmentInd].bezierData.points;
                    pointInd = points.length - 1;
                }
            }

        }
        points = segments[segmentInd].bezierData.points;
        prevPoint = points[pointInd - 1];
        currentPoint = points[pointInd];
        var partialLength = currentPoint.partialLength;
        var perc, tanAngle;
    }


    len = letters.length;
    xPos = 0;
    yPos = 0;
    var yOff = data.t.d.s*1.2*.714;
    var firstLine = true;
    var renderedData = this.viewData, animatorProps, animatorSelector;
    var j, jLen;
    var lettersValue = new Array(len), letterValue;
    this.lettersChangedFlag = false;

    jLen = renderedData.a.length;
    var lastLetter;

    var mult, ind = -1, offf, xPathPos, yPathPos;
    var initPathPos = currentLength,initSegmentInd = segmentInd, initPointInd = pointInd, currentLine = -1;
    var elemOpacity;
    var sc,sw,fc,k;
    var lineLength = 0;
    var letterSw,letterSc,letterFc,letterM,letterP,letterO;
    for( i = 0; i < len; i += 1) {
        matrixHelper.reset();
        elemOpacity = 1;
        if(letters[i].n) {
            xPos = 0;
            yPos += documentData.yOffset;
            yPos += firstLine ? 1 : 0;
            currentLength = initPathPos ;
            firstLine = false;
            lineLength = 0;
            if(this.maskPath) {
                segmentInd = initSegmentInd;
                pointInd = initPointInd;
                points = segments[segmentInd].bezierData.points;
                prevPoint = points[pointInd - 1];
                currentPoint = points[pointInd];
                partialLength = currentPoint.partialLength;
                segmentLength = 0;
            }
            lettersValue[i] = this.emptyProp;
        }else{
            if(this.maskPath) {
                if(currentLine !== letters[i].line){
                    switch(documentData.j){
                        case 1:
                            currentLength += totalLength - documentData.lineWidths[letters[i].line];
                            break;
                        case 2:
                            currentLength += (totalLength - documentData.lineWidths[letters[i].line])/2;
                            break;
                    }
                    currentLine = letters[i].line;
                }
                if (ind !== letters[i].ind) {
                    if (letters[ind]) {
                        currentLength += letters[ind].extra;
                    }
                    currentLength += letters[i].an / 2;
                    ind = letters[i].ind;
                }
                currentLength += renderedData.m.a.v[0] * letters[i].an / 200;
                var animatorOffset = 0;
                for (j = 0; j < jLen; j += 1) {
                    animatorProps = renderedData.a[j].a;
                    if ('p' in animatorProps) {
                        animatorSelector = renderedData.a[j].s;
                        mult = animatorSelector.getMult(letters[i].anIndexes[j]);

                        animatorOffset += animatorProps.p.v[0] * mult;
                    }
                }
                flag = true;
                while (flag) {
                    if (segmentLength + partialLength >= currentLength + animatorOffset || !points) {
                        perc = (currentLength + animatorOffset - segmentLength) / currentPoint.partialLength;
                        xPathPos = prevPoint.point[0] + (currentPoint.point[0] - prevPoint.point[0]) * perc;
                        yPathPos = prevPoint.point[1] + (currentPoint.point[1] - prevPoint.point[1]) * perc;
                        matrixHelper.translate(0, -(renderedData.m.a.v[1] * yOff / 100) + yPos);
                        flag = false;
                    } else if (points) {
                        segmentLength += currentPoint.partialLength;
                        pointInd += 1;
                        if (pointInd >= points.length) {
                            pointInd = 0;
                            segmentInd += 1;
                            if (!segments[segmentInd]) {
                                if (mask.closed) {
                                    pointInd = 0;
                                    segmentInd = 0;
                                    points = segments[segmentInd].bezierData.points;
                                } else {
                                    segmentLength -= currentPoint.partialLength;
                                    points = null;
                                }
                            } else {
                                points = segments[segmentInd].bezierData.points;
                            }
                        }
                        if (points) {
                            prevPoint = currentPoint;
                            currentPoint = points[pointInd];
                            partialLength = currentPoint.partialLength;
                        }
                    }
                }
                offf = letters[i].an / 2 - letters[i].add;
                matrixHelper.translate(-offf, 0, 0);
            } else {
                offf = letters[i].an/2 - letters[i].add;
                matrixHelper.translate(-offf,0,0);

                // Grouping alignment
                matrixHelper.translate(-renderedData.m.a.v[0]*letters[i].an/200, -renderedData.m.a.v[1]*yOff/100, 0);
            }

            lineLength += letters[i].l/2;
            for(j=0;j<jLen;j+=1){
                animatorProps = renderedData.a[j].a;
                if ('t' in animatorProps) {
                    animatorSelector = renderedData.a[j].s;
                    mult = animatorSelector.getMult(letters[i].anIndexes[j]);
                    if(this.maskPath) {
                        currentLength += animatorProps.t*mult;
                    }else{
                        xPos += animatorProps.t.v*mult;
                    }
                }
            }
            lineLength += letters[i].l/2;
            if(documentData.strokeWidthAnim) {
                sw = data.t.d.sw || 0;
            }
            if(documentData.strokeColorAnim) {
                if(data.t.d.sc){
                    sc = [data.t.d.sc[0], data.t.d.sc[1], data.t.d.sc[2]];
                }else{
                    sc = [0,0,0];
                }
            }
            if(documentData.fillColorAnim) {
                fc = [data.t.d.fc[0], data.t.d.fc[1], data.t.d.fc[2]];
            }
            for(j=0;j<jLen;j+=1){
                animatorProps = renderedData.a[j].a;
                if ('a' in animatorProps) {
                    animatorSelector = renderedData.a[j].s;
                    mult = animatorSelector.getMult(letters[i].anIndexes[j]);
                    matrixHelper.translate(-animatorProps.a.v[0]*mult, -animatorProps.a.v[1]*mult, animatorProps.a.v[2]*mult);
                }
            }
            for(j=0;j<jLen;j+=1){
                animatorProps = renderedData.a[j].a;
                if ('s' in animatorProps) {
                    animatorSelector = renderedData.a[j].s;
                    mult = animatorSelector.getMult(letters[i].anIndexes[j]);
                    matrixHelper.scale(1+((animatorProps.s.v[0]-1)*mult),1+((animatorProps.s.v[1]-1)*mult),1);
                }
            }
            for(j=0;j<jLen;j+=1) {
                animatorProps = renderedData.a[j].a;
                animatorSelector = renderedData.a[j].s;
                mult = animatorSelector.getMult(letters[i].anIndexes[j]);
                if ('sk' in animatorProps) {
                    matrixHelper.skewFromAxis(-animatorProps.sk.v*mult,animatorProps.sa.v*mult);
                }
                if ('r' in animatorProps) {
                    matrixHelper.rotateZ(-animatorProps.r.v*mult);
                }
                if ('ry' in animatorProps) {
                    matrixHelper.rotateY(animatorProps.ry.v*mult);
                }
                if ('rx' in animatorProps) {
                    matrixHelper.rotateX(animatorProps.rx.v*mult);
                }
                if ('o' in animatorProps) {
                    elemOpacity += ((animatorProps.o.v)*mult - elemOpacity)*mult;
                }
                if (documentData.strokeWidthAnim && 'sw' in animatorProps) {
                    sw += animatorProps.sw.v*mult;
                }
                if (documentData.strokeColorAnim && 'sc' in animatorProps) {
                    for(k=0;k<3;k+=1){
                        sc[k] = Math.round(sc[k] + (animatorProps.sc.v[k] - sc[k])*mult);
                    }
                }
                if (documentData.fillColorAnim && 'fc' in animatorProps) {
                    for(k=0;k<3;k+=1){
                        fc[k] = Math.round(fc[k] + (animatorProps.fc.v[k] - fc[k])*mult);
                    }
                }
            }
            for(j=0;j<jLen;j+=1){
                animatorProps = renderedData.a[j].a;
                if ('s' in animatorProps) {
                    animatorSelector = renderedData.a[j].s;
                    mult = animatorSelector.getMult(letters[i].anIndexes[j]);
                }
            }

            for(j=0;j<jLen;j+=1){
                animatorProps = renderedData.a[j].a;

                if ('p' in animatorProps) {
                    animatorSelector = renderedData.a[j].s;
                    mult = animatorSelector.getMult(letters[i].anIndexes[j]);
                    if(this.maskPath) {
                        matrixHelper.translate(0, animatorProps.p.v[1] * mult, -animatorProps.p.v[2] * mult);
                    }else{
                        matrixHelper.translate(animatorProps.p.v[0] * mult, animatorProps.p.v[1] * mult, -animatorProps.p.v[2] * mult);
                    }
                }
            }
            for(j=0;j<jLen;j+=1){
                animatorProps = renderedData.a[j].a;
                if ('a' in animatorProps) {
                    animatorSelector = renderedData.a[j].s;
                    mult = animatorSelector.getMult(letters[i].anIndexes[j]);
                }
            }
            if(documentData.strokeWidthAnim){
                letterSw = sw < 0 ? 0 : sw;
            }
            if(documentData.strokeColorAnim){
                letterSc = 'rgb('+sc[0]+','+sc[1]+','+sc[2]+')';
            }
            if(documentData.fillColorAnim){
                letterFc = 'rgb('+fc[0]+','+fc[1]+','+fc[2]+')';
            }

            if(this.maskPath) {
                if (data.t.p.p) {
                    tanAngle = (currentPoint.point[1] - prevPoint.point[1]) / (currentPoint.point[0] - prevPoint.point[0]);
                    var rot = Math.atan(tanAngle) * 180 / Math.PI;
                    if (currentPoint.point[0] < prevPoint.point[0]) {
                        rot += 180;
                    }
                    matrixHelper.rotate(-rot * Math.PI / 180);
                }
                matrixHelper.translate(xPathPos, yPathPos, 0);
                matrixHelper.translate(renderedData.m.a.v[0]*letters[i].an/200, renderedData.m.a.v[1]*yOff/100,0);
                currentLength -= renderedData.m.a.v[0]*letters[i].an/200;
                if(letters[i+1] && ind !== letters[i+1].ind){
                    currentLength += letters[i].an / 2;
                    currentLength += documentData.tr/1000*data.t.d.s;
                }
            }else{

                matrixHelper.translate(xPos,yPos,0);

                if(documentData.ps){
                    //matrixHelper.translate(documentData.ps[0],documentData.ps[1],0);
                    matrixHelper.translate(documentData.ps[0],documentData.ps[1] + documentData.ascent,0);
                }
                switch(documentData.j){
                    case 1:
                        matrixHelper.translate(documentData.justifyOffset + (documentData.boxWidth - documentData.lineWidths[letters[i].line]),0,0);
                        break;
                    case 2:
                        matrixHelper.translate(documentData.justifyOffset + (documentData.boxWidth - documentData.lineWidths[letters[i].line])/2,0,0);
                        break;
                }
                matrixHelper.translate(offf,0,0);
                matrixHelper.translate(renderedData.m.a.v[0]*letters[i].an/200,renderedData.m.a.v[1]*yOff/100,0);
                xPos += letters[i].l + documentData.tr/1000*data.t.d.s;
            }
            if(renderType === 'html'){
                letterM = matrixHelper.toCSS();
            }else if(renderType === 'svg'){
                letterM = matrixHelper.to2dCSS();
            }else{
                letterP = [matrixHelper.props[0],matrixHelper.props[1],matrixHelper.props[2],matrixHelper.props[3],matrixHelper.props[4],matrixHelper.props[5],matrixHelper.props[6],matrixHelper.props[7],matrixHelper.props[8],matrixHelper.props[9],matrixHelper.props[10],matrixHelper.props[11],matrixHelper.props[12],matrixHelper.props[13],matrixHelper.props[14],matrixHelper.props[15]];
            }
            letterO = elemOpacity;

            lastLetter = this.renderedLetters[i];
            if(lastLetter && (lastLetter.o !== letterO || lastLetter.sw !== letterSw || lastLetter.sc !== letterSc || lastLetter.fc !== letterFc)){
                this.lettersChangedFlag = true;
                letterValue = new LetterProps(letterO,letterSw,letterSc,letterFc,letterM,letterP);
            }else{
                if((renderType === 'svg' || renderType === 'html') && (!lastLetter || lastLetter.m !== letterM)){
                    this.lettersChangedFlag = true;
                    letterValue = new LetterProps(letterO,letterSw,letterSc,letterFc,letterM);
                }else if(renderType === 'canvas' && (!lastLetter || (lastLetter.props[0] !== letterP[0] || lastLetter.props[1] !== letterP[1] || lastLetter.props[4] !== letterP[4] || lastLetter.props[5] !== letterP[5] || lastLetter.props[12] !== letterP[12] || lastLetter.props[13] !== letterP[13]))){
                    this.lettersChangedFlag = true;
                    letterValue = new LetterProps(letterO,letterSw,letterSc,letterFc,null,letterP);
                } else {
                    letterValue = lastLetter;
                }
            }

            this.renderedLetters[i] = letterValue;
        }
    }
};

ITextElement.prototype.emptyProp = new LetterProps();

function SVGTextElement(data,parentContainer,globalData,comp, placeholder){
    this.textSpans = [];
    this.renderType = 'svg';
    this.parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
}
createElement(SVGBaseElement, SVGTextElement);

SVGTextElement.prototype.init = ITextElement.prototype.init;
SVGTextElement.prototype.createPathShape = ITextElement.prototype.createPathShape;
SVGTextElement.prototype.getMeasures = ITextElement.prototype.getMeasures;

SVGTextElement.prototype.createElements = function(){

    this.parent.createElements.call(this);
    var documentData = this.data.t.d;

    this.innerElem = document.createElementNS(svgNS,'g');
    if(documentData.fc) {
        this.innerElem.setAttribute('fill', 'rgb(' + documentData.fc[0] + ',' + documentData.fc[1] + ',' + documentData.fc[2] + ')');
    }else{
        this.innerElem.setAttribute('fill', 'rgba(0,0,0,0)');
    }
    if(documentData.sc){
        this.innerElem.setAttribute('stroke', 'rgb(' + documentData.sc[0] + ',' + documentData.sc[1] + ',' + documentData.sc[2] + ')');
        this.innerElem.setAttribute('stroke-width', documentData.sw);
    }
    this.innerElem.setAttribute('font-size', documentData.s);
    var fontData = this.globalData.fontManager.getFontByName(documentData.f);
    if(fontData.fClass){
        this.innerElem.setAttribute('class',fontData.fClass);
    } else {
        this.innerElem.setAttribute('font-family', fontData.fFamily);
        var fWeight = documentData.fWeight, fStyle = documentData.fStyle;
        this.innerElem.setAttribute('font-style', fStyle);
        this.innerElem.setAttribute('font-weight', fWeight);
    }
    var i, len;
    if(this.layerElement === this.parentContainer){
        this.appendNodeToParent(this.innerElem);
    }else{
        this.layerElement.appendChild(this.innerElem);
    }



    var letters = documentData.l;
    len = letters.length;
    var tSpan;
    var matrixHelper = this.mHelper;
    var shapes, shapeStr = '', singleShape = this.data.singleShape;
    if (singleShape) {
        var xPos = 0, yPos = 0, lineWidths = documentData.lineWidths, boxWidth = documentData.boxWidth, firstLine = true;
    }
    for (i = 0;i < len ;i += 1) {
        if(this.globalData.fontManager.chars){
            if(!singleShape || i === 0){
                tSpan = document.createElementNS(svgNS,'path');
            }
        }else{
            tSpan = document.createElementNS(svgNS,'text');
        }
        tSpan.setAttribute('stroke-linecap', 'butt');
        tSpan.setAttribute('stroke-linejoin','round');
        tSpan.setAttribute('stroke-miterlimit','4');
        //tSpan.setAttribute('visibility', 'hidden');
        if(singleShape && letters[i].n) {
            xPos = 0;
            yPos += documentData.yOffset;
            yPos += firstLine ? 1 : 0;
            firstLine = false;
        }
        matrixHelper.reset();
        if(this.globalData.fontManager.chars) {
            matrixHelper.scale(documentData.s / 100, documentData.s / 100);
        }
        if (singleShape) {
            if(documentData.ps){
                matrixHelper.translate(documentData.ps[0],documentData.ps[1] + documentData.ascent,0);
            }
            switch(documentData.j){
                case 1:
                    matrixHelper.translate(documentData.justifyOffset + (boxWidth - lineWidths[letters[i].line]),0,0);
                    break;
                case 2:
                    matrixHelper.translate(documentData.justifyOffset + (boxWidth - lineWidths[letters[i].line])/2,0,0);
                    break;
            }
            matrixHelper.translate(xPos, yPos, 0);
        }
        if(this.globalData.fontManager.chars){
            var charData = this.globalData.fontManager.getCharData(documentData.t.charAt(i), fontData.fStyle, this.globalData.fontManager.getFontByName(documentData.f).fFamily);
            var shapeData;
            if(charData){
                shapeData = charData.data;
            } else {
                shapeData = null;
            }
            if(shapeData && shapeData.shapes){
                shapes = shapeData.shapes[0].it;
                if(!singleShape){
                    shapeStr = '';
                }
                shapeStr += this.createPathShape(matrixHelper,shapes);
                if(!singleShape){

                    tSpan.setAttribute('d',shapeStr);
                }
            }
            if(!singleShape){
                this.innerElem.appendChild(tSpan);
            }
        }else{
            tSpan.textContent = letters[i].val;
            tSpan.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space","preserve");
            this.innerElem.appendChild(tSpan);
            if(singleShape){
                tSpan.setAttribute('transform',matrixHelper.to2dCSS());
            }
        }
        if(singleShape) {
            xPos += letters[i].l;
        }
        //
        this.textSpans.push(tSpan);
    }
    if(singleShape && this.globalData.fontManager.chars){
        tSpan.setAttribute('d',shapeStr);
        this.innerElem.appendChild(tSpan);
    }
};

SVGTextElement.prototype.hide = function(){
    if(!this.hidden){
        this.innerElem.style.display = 'none';
        this.hidden = true;
    }
};

SVGTextElement.prototype.renderFrame = function(parentMatrix){

    var renderParent = this.parent.renderFrame.call(this,parentMatrix);
    if(renderParent===false){
        this.hide();
        return;
    }
    if(this.hidden){
        this.hidden = false;
        this.innerElem.style.display = 'block';
    }
    if(!this.data.hasMask){
        if(this.finalTransform.matMdf){
            this.innerElem.setAttribute('transform',this.finalTransform.mat.to2dCSS());
        }
        if(this.finalTransform.opMdf){
            this.innerElem.setAttribute('opacity',this.finalTransform.opacity);
        }
    }

    if(this.data.singleShape){
        return;
    }

    this.getMeasures();
    if(!this.lettersChangedFlag){
        return;
    }
    var  i,len;
    var renderedLetters = this.renderedLetters;

    var letters = this.data.t.d.l;

    len = letters.length;
    var renderedLetter;
    for(i=0;i<len;i+=1){
        if(letters[i].n){
            continue;
        }
        renderedLetter = renderedLetters[i];
        this.textSpans[i].setAttribute('transform',renderedLetter.m);
        this.textSpans[i].setAttribute('opacity',renderedLetter.o);
        if(renderedLetter.sw){
            this.textSpans[i].setAttribute('stroke-width',renderedLetter.sw);
        }
        if(renderedLetter.sc){
            this.textSpans[i].setAttribute('stroke',renderedLetter.sc);
        }
        if(renderedLetter.fc){
            this.textSpans[i].setAttribute('fill',renderedLetter.fc);
        }
    }
    if(this.firstFrame) {
        this.firstFrame = false;
    }
}


SVGTextElement.prototype.destroy = function(){
    this.parent.destroy.call();
    this.innerElem =  null;
};
var PlaceHolderElement = function (data,parentContainer,globalData){
    this.data = data;
    this.globalData = globalData;
    if(parentContainer){
        this.parentContainer = parentContainer;
        var g = document.createElementNS(svgNS,'g');
        g.setAttribute('id',this.data.id);
        parentContainer.appendChild(g);
        this.phElement = g;
    }
    this.layerId = 'ly_'+randomString(10);
};
PlaceHolderElement.prototype.prepareFrame = function(){};
PlaceHolderElement.prototype.renderFrame = function(){};
PlaceHolderElement.prototype.draw = function(){};
function ICompElement(data,parentContainer,globalData,comp, placeholder){
    this.parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
    this.layers = data.layers;
    this.isSvg = true;
    if(this.data.tm){
        this.tm = PropertyFactory.getProp(this,this.data.tm,0,globalData.frameRate,this.dynamicProperties);
    }
}
createElement(SVGBaseElement, ICompElement);
extendPrototype(ExpressionComp,ICompElement);

ICompElement.prototype.getComposingElement = function(){
    return this.layerElement;
};

ICompElement.prototype.hide = function(){
    if(!this.hidden){
        var i,len = this.elements.length;
        for( i = 0; i < len; i+=1 ){
            this.elements[i].hide();
        }
        this.hidden = true;
    }
};

ICompElement.prototype.prepareFrame = function(num){
    this.parent.prepareFrame.call(this,num);
    if(this.isVisible===false){
        return;
    }
    var timeRemapped = num;
    if(this.tm){
        timeRemapped = this.tm.v;
        if(timeRemapped === this.data.op){
            timeRemapped = this.data.op - 1;
        }
    }
    this.renderedFrame = timeRemapped;
    var i,len = this.elements.length;
    for( i = 0; i < len; i+=1 ){
        this.elements[i].prepareFrame(timeRemapped - this.layers[i].st);
    }
};

ICompElement.prototype.renderFrame = function(parentMatrix){
    var renderParent = this.parent.renderFrame.call(this,parentMatrix);
    var i,len = this.layers.length;
    if(renderParent===false){
        this.hide();
        return;
    }

    this.hidden = false;

    for( i = 0; i < len; i+=1 ){
        if(this.data.hasMask){
            this.elements[i].renderFrame();
        }else{
            this.elements[i].renderFrame(this.finalTransform);
        }
    }
    if(this.firstFrame){
        this.firstFrame = false;
    }
};

ICompElement.prototype.setElements = function(elems){
    this.elements = elems;
};

ICompElement.prototype.getElements = function(){
    return this.elements;
};

ICompElement.prototype.destroy = function(){
    this.parent.destroy.call();
    var i,len = this.layers.length;
    for( i = 0; i < len; i+=1 ){
        this.elements[i].destroy();
    }
};
function IImageElement(data,parentContainer,globalData,comp,placeholder){
    this.assetData = globalData.getAssetData(data.refId);
    this.path = globalData.getPath();
    this.parent.constructor.call(this,data,parentContainer,globalData,comp,placeholder);
}
createElement(SVGBaseElement, IImageElement);

IImageElement.prototype.createElements = function(){

    var self = this;

    var imageLoaded = function(){
        self.innerElem.setAttributeNS('http://www.w3.org/1999/xlink','href',self.path+self.assetData.p);
        self.maskedElement = self.innerElem;
    };

    var img = new Image();
    img.addEventListener('load', imageLoaded, false);
    img.addEventListener('error', imageLoaded, false);

    img.src = this.path+this.assetData.p;

    this.parent.createElements.call(this);

    this.innerElem = document.createElementNS(svgNS,'image');
    this.innerElem.setAttribute('width',this.assetData.w+"px");
    this.innerElem.setAttribute('height',this.assetData.h+"px");
    if(this.layerElement === this.parentContainer){
        this.appendNodeToParent(this.innerElem);
    }else{
        this.layerElement.appendChild(this.innerElem);
    }
    if(this.data.ln){
        this.innerElem.setAttribute('id',this.data.ln);
    }

};

IImageElement.prototype.hide = function(){
    if(!this.hidden){
        this.innerElem.setAttribute('visibility','hidden');
        this.hidden = true;
    }
};

IImageElement.prototype.renderFrame = function(parentMatrix){
    var renderParent = this.parent.renderFrame.call(this,parentMatrix);
    if(renderParent===false){
        this.hide();
        return;
    }
    if(this.hidden){
        this.hidden = false;
        this.innerElem.setAttribute('visibility', 'visible');
    }
    if(!this.data.hasMask){
        if(this.finalTransform.matMdf || this.firstFrame){
            this.innerElem.setAttribute('transform',this.finalTransform.mat.to2dCSS());
        }
        if(this.finalTransform.opMdf || this.firstFrame){
            this.innerElem.setAttribute('opacity',this.finalTransform.opacity);
        }
    }
    if(this.firstFrame){
        this.firstFrame = false;
    }
};

IImageElement.prototype.destroy = function(){
    this.parent.destroy.call();
    this.innerElem =  null;
};
function IShapeElement(data,parentContainer,globalData,comp, placeholder){
    this.shapes = [];
    this.shapesData = data.shapes;
    this.stylesList = [];
    this.viewData = [];
    this.shapesContainer = document.createElementNS(svgNS,'g');
    this.parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
}
createElement(SVGBaseElement, IShapeElement);

IShapeElement.prototype.lcEnum = {
    '1': 'butt',
    '2': 'round',
    '3': 'butt'
}

IShapeElement.prototype.ljEnum = {
    '1': 'butt',
    '2': 'round',
    '3': 'butt'
}

IShapeElement.prototype.transformHelper = {opacity:1,mat:new Matrix(),matMdf:false,opMdf:false};

IShapeElement.prototype.createElements = function(){
    //TODO check if I can use symbol so i can set its viewBox
    this.parent.createElements.call(this);
    this.searchShapes(this.shapesData,this.viewData,this.dynamicProperties,[]);
    this.layerElement.appendChild(this.shapesContainer);
    styleUnselectableDiv(this.layerElement);
    styleUnselectableDiv(this.shapesContainer);
    this.buildExpressionInterface();
    //this.mainShape = new ShapeItemElement(this.data,this.layerElement,this.parentContainer,this.placeholder,this.dynamicProperties,this.globalData);
};

IShapeElement.prototype.searchShapes = function(arr,data,dynamicProperties,addedTrims){
    var i, len = arr.length - 1;
    var j, jLen;
    var ownArrays = [], ownTrims = [];
    for(i=len;i>=0;i-=1){
        if(arr[i].ty == 'fl' || arr[i].ty == 'st'){
            data[i] = {};
            var pathElement;
            data[i].c = PropertyFactory.getProp(this,arr[i].c,1,null,dynamicProperties);
            data[i].o = PropertyFactory.getProp(this,arr[i].o,0,0.01,dynamicProperties);
            if(arr[i].ty == 'st') {
                pathElement = document.createElementNS(svgNS, "g");
                ////pathElement.setAttribute('stroke-linecap', this.lcEnum[arr[i].lc] || 'round');
                pathElement.style.strokeLinecap = this.lcEnum[arr[i].lc] || 'round';
                ////pathElement.setAttribute('stroke-linejoin',this.ljEnum[arr[i].lj] || 'round');
                pathElement.style.strokeLinejoin = this.ljEnum[arr[i].lj] || 'round';
                ////pathElement.setAttribute('fill-opacity','0');
                pathElement.style.fillOpacity = 0;
                if(arr[i].lj == 1) {
                    ////pathElement.setAttribute('stroke-miterlimit',arr[i].ml);
                    pathElement.style.strokeMiterlimit = arr[i].ml;
                }
                if(!data[i].c.k) {
                    pathElement.style.stroke = 'rgb('+data[i].c.v[0]+','+data[i].c.v[1]+','+data[i].c.v[2]+')';
                    ////pathElement.setAttribute('stroke','rgb('+data[i].c.v[0]+','+data[i].c.v[1]+','+data[i].c.v[2]+')');
                }
                if(!data[i].o.k) {
                    ////pathElement.setAttribute('stroke-opacity',data[i].o.v);
                    pathElement.style.strokeOpacity = data[i].o.v;
                }
                data[i].w = PropertyFactory.getProp(this,arr[i].w,0,null,dynamicProperties);
                if(!data[i].w.k) {
                    ////pathElement.setAttribute('stroke-width',data[i].w.v);
                    pathElement.style.strokeWidth = data[i].w.v;
                }
                if(arr[i].d){
                    var d = PropertyFactory.getDashProp(this,arr[i].d,'svg',dynamicProperties);
                    if(!d.k){
                        ////pathElement.setAttribute('stroke-dasharray', d.dasharray);
                        pathElement.style.strokeDasharray = d.dasharray;
                        ////pathElement.setAttribute('stroke-dashoffset', d.dashoffset);
                        pathElement.style.strokeDashoffset = d.dashoffset;
                    }
                    data[i].d = d;
                }

            }else{
                pathElement = document.createElementNS(svgNS, "path");
                if(!data[i].c.k) {
                    ////pathElement.setAttribute('fill','rgb('+data[i].c.v[0]+','+data[i].c.v[1]+','+data[i].c.v[2]+')');
                    pathElement.style.fill = 'rgb('+data[i].c.v[0]+','+data[i].c.v[1]+','+data[i].c.v[2]+')';
                }
                if(!data[i].o.k) {
                    ////pathElement.setAttribute('fill-opacity',data[i].o.v);
                    pathElement.style.fillOpacity = data[i].o.v;
                }
            }
            /*if(this.layerElement === this.parentContainer){
                this.appendNodeToParent(pathElement);
            }else{
                this.layerElement.appendChild(pathElement);
            }*/
            this.shapesContainer.appendChild(pathElement);
            this.stylesList.push({
                pathElement: pathElement,
                type: arr[i].ty,
                d: '',
                ld: '',
                mdf: false
            });
            data[i].style = this.stylesList[this.stylesList.length - 1];
            ownArrays.push(data[i].style);
        }else if(arr[i].ty == 'gr'){
            data[i] = {
                it: []
            };
            this.searchShapes(arr[i].it,data[i].it,dynamicProperties,addedTrims);
        }else if(arr[i].ty == 'tr'){
            data[i] = {
                transform : {
                    mat: new Matrix(),
                    opacity: 1,
                    matMdf:false,
                    opMdf:false,
                    op: PropertyFactory.getProp(this,arr[i].o,0,0.01,dynamicProperties),
                    mProps: PropertyFactory.getProp(this,arr[i],2,null,dynamicProperties)
                },
                elements: []
            };
        }else if(arr[i].ty == 'sh' || arr[i].ty == 'rc' || arr[i].ty == 'el' || arr[i].ty == 'sr'){
            data[i] = {
                elements : [],
                styles : [],
                lStr: ''
            };
            var ty = 4;
            if(arr[i].ty == 'rc'){
                ty = 5;
            }else if(arr[i].ty == 'el'){
                ty = 6;
            }else if(arr[i].ty == 'sr'){
                ty = 7;
            }
            if(addedTrims.length){
                arr[i].trimmed = true;
            }
            data[i].sh = PropertyFactory.getShapeProp(this,arr[i],ty,dynamicProperties, addedTrims);
            jLen = this.stylesList.length;
            var element, hasStrokes = false, hasFills = false;
            for(j=0;j<jLen;j+=1){
                if(!this.stylesList[j].closed){
                    if(this.stylesList[j].type === 'st'){
                        hasStrokes = true;
                        element = document.createElementNS(svgNS, "path");
                        this.stylesList[j].pathElement.appendChild(element);
                        data[i].elements.push({
                            ty:this.stylesList[j].type,
                            el:element
                        });
                    }else{
                        hasFills = true;
                        data[i].elements.push({
                            ty:this.stylesList[j].type,
                            st: this.stylesList[j]
                        });
                    }
                }
            }
            data[i].st = hasStrokes;
            data[i].fl = hasFills;
        }else if(arr[i].ty == 'tm'){
            var trimOb = {
                closed: false,
                trimProp: PropertyFactory.getProp(this,arr[i],7,null,dynamicProperties)
            };
            data[i] = {
                tr : trimOb.trimProp
            };
            addedTrims.push(trimOb);
            ownTrims.push(trimOb);
        }
    }
    len = ownArrays.length;
    for(i=0;i<len;i+=1){
        ownArrays[i].closed = true;
    }
    len = ownTrims.length;
    for(i=0;i<len;i+=1){
        ownTrims[i].closed = true;
    }
};

IShapeElement.prototype.renderFrame = function(parentMatrix){


    var renderParent = this.parent.renderFrame.call(this,parentMatrix);
    if(renderParent===false){
        this.hide();
        return;
    }

    this.hidden = false;
    if(this.finalTransform.matMdf && !this.data.hasMask){
        this.shapesContainer.setAttribute('transform',this.finalTransform.mat.to2dCSS());
    }
    this.transformHelper.opacity = this.finalTransform.opacity;
    this.transformHelper.matMdf = false;
    this.transformHelper.opMdf = this.finalTransform.opMdf;
    this.renderShape(this.transformHelper,null,null,true);
};

IShapeElement.prototype.hide = function(){
    if(!this.hidden){
        var i, len = this.stylesList.length;
        for(i=len-1;i>=0;i-=1){
            if(this.stylesList[i].ld !== '0'){
                this.stylesList[i].ld = '0';
                this.stylesList[i].pathElement.style.display = 'none';
                if(this.stylesList[i].pathElement.parentNode){
                    this.stylesList[i].parent = this.stylesList[i].pathElement.parentNode;
                    //this.stylesList[i].pathElement.parentNode.removeChild(this.stylesList[i].pathElement);
                }
            }
        }
        this.hidden = true;
    }
};

IShapeElement.prototype.renderShape = function(parentTransform,items,data,isMain){
    var i, len;
    if(!items){
        items = this.shapesData;
        len = this.stylesList.length;
        for(i=0;i<len;i+=1){
            this.stylesList[i].d = '';
            this.stylesList[i].mdf = false;
        }
    }
    if(!data){
        data = this.viewData;
    }
    ///
    ///
    len = items.length - 1;
    var groupTransform,groupMatrix;
    groupTransform = parentTransform;
    for(i=len;i>=0;i-=1){
        if(items[i].ty == 'tr'){
            groupTransform = data[i].transform;
            var mtArr = data[i].transform.mProps.v.props;
            groupTransform.matMdf = groupTransform.mProps.mdf;
            groupTransform.opMdf = groupTransform.op.mdf;
            groupMatrix = groupTransform.mat;
            groupMatrix.cloneFromProps(mtArr);
            if(parentTransform){
                var props = parentTransform.mat.props;
                groupTransform.opacity = parentTransform.opacity;
                groupTransform.opacity *= data[i].transform.op.v;
                groupTransform.matMdf = parentTransform.matMdf ? true : groupTransform.matMdf;
                groupTransform.opMdf = parentTransform.opMdf ? true : groupTransform.opMdf;
                groupMatrix.transform(props[0],props[1],props[2],props[3],props[4],props[5],props[6],props[7],props[8],props[9],props[10],props[11],props[12],props[13],props[14],props[15]);

            }else{
                groupTransform.opacity = groupTransform.op.o;
            }
        }else if(items[i].ty == 'sh' || items[i].ty == 'el' || items[i].ty == 'rc' || items[i].ty == 'sr'){
            this.renderPath(items[i],data[i],groupTransform);
        }else if(items[i].ty == 'fl'){
            this.renderFill(items[i],data[i],groupTransform);
        }else if(items[i].ty == 'st'){
            this.renderStroke(items[i],data[i],groupTransform);
        }else if(items[i].ty == 'gr'){
            this.renderShape(groupTransform,items[i].it,data[i].it);
        }else if(items[i].ty == 'tm'){
            //
        }
    }
    if(!isMain){
        return;
    }
    len = this.stylesList.length;
    for(i=0;i<len;i+=1){
        if(this.stylesList[i].ld === '0') {
            this.stylesList[i].ld = '1';
            this.stylesList[i].pathElement.style.display = 'block';
            //this.stylesList[i].parent.appendChild(this.stylesList[i].pathElement);
        }
        if(this.stylesList[i].type === 'fl'){
            if(this.stylesList[i].mdf || this.firstFrame){
                this.stylesList[i].pathElement.setAttribute('d',this.stylesList[i].d);
            }
        }
    }
    if(this.firstFrame){
        this.firstFrame = false;
    }

};

IShapeElement.prototype.renderPath = function(pathData,viewData,groupTransform){
    var len, i;
    var pathNodes = viewData.sh.v;
    var pathStringTransformed = '';
    if(pathNodes.v){
        len = pathNodes.v.length;
        var redraw = groupTransform.matMdf || viewData.sh.mdf || this.firstFrame;
        if(redraw) {
            var stops = pathNodes.s ? pathNodes.s : [];
            for (i = 1; i < len; i += 1) {
                if (stops[i - 1]) {
                    pathStringTransformed += " M" + groupTransform.mat.applyToPointStringified(stops[i - 1][0], stops[i - 1][1]);
                } else if (i == 1) {
                    pathStringTransformed += " M" + groupTransform.mat.applyToPointStringified(pathNodes.v[0][0], pathNodes.v[0][1]);
                }
                pathStringTransformed += " C" + groupTransform.mat.applyToPointStringified(pathNodes.o[i - 1][0], pathNodes.o[i - 1][1]) + " " + groupTransform.mat.applyToPointStringified(pathNodes.i[i][0], pathNodes.i[i][1]) + " " + groupTransform.mat.applyToPointStringified(pathNodes.v[i][0], pathNodes.v[i][1]);
            }
            if (len == 1) {
                if (stops[0]) {
                    pathStringTransformed += " M" + groupTransform.mat.applyToPointStringified(stops[0][0], stops[0][1]);
                } else {
                    pathStringTransformed += " M" + groupTransform.mat.applyToPointStringified(pathNodes.v[0][0], pathNodes.v[0][1]);
                }
            }
            if (len && pathData.closed && !(pathData.trimmed && !pathNodes.c)) {
                pathStringTransformed += " C" + groupTransform.mat.applyToPointStringified(pathNodes.o[i - 1][0], pathNodes.o[i - 1][1]) + " " + groupTransform.mat.applyToPointStringified(pathNodes.i[0][0], pathNodes.i[0][1]) + " " + groupTransform.mat.applyToPointStringified(pathNodes.v[0][0], pathNodes.v[0][1]);
            }
            viewData.lStr = pathStringTransformed;
        }else{
            pathStringTransformed = viewData.lStr;
        }
        len = viewData.elements.length;
        for(i=0;i<len;i+=1){
            if(viewData.elements[i].ty === 'st'){
                if(viewData.sh.mdf || this.firstFrame){
                    //console.log(pathStringTransformed);
                    viewData.elements[i].el.setAttribute('d', pathStringTransformed);
                }
                if(groupTransform.matMdf || this.firstFrame) {
                    //viewData.elements[i].el.setAttribute('transform',t);
                    ////viewData.elements[i].el.style.transform = t;
                }
            }else{
                viewData.elements[i].st.mdf = redraw ? true : viewData.elements[i].st.mdf;
                viewData.elements[i].st.d += pathStringTransformed;
            }
        }
    }
};

IShapeElement.prototype.renderFill = function(styleData,viewData, groupTransform){
    var styleElem = viewData.style;

    if(viewData.c.mdf || this.firstFrame){
        ////styleElem.pathElement.setAttribute('fill','rgb('+bm_floor(viewData.c.v[0])+','+bm_floor(viewData.c.v[1])+','+bm_floor(viewData.c.v[2])+')');
        styleElem.pathElement.style.fill = 'rgb('+bm_floor(viewData.c.v[0])+','+bm_floor(viewData.c.v[1])+','+bm_floor(viewData.c.v[2])+')';
    }
    if(viewData.o.mdf || groupTransform.opMdf || this.firstFrame){
        ////styleElem.pathElement.setAttribute('fill-opacity',viewData.o.v*groupTransform.opacity);
        styleElem.pathElement.style.fillOpacity = viewData.o.v*groupTransform.opacity;
    }
};

IShapeElement.prototype.renderStroke = function(styleData,viewData, groupTransform){
    var styleElem = viewData.style;
    //TODO fix dashes
    var d = viewData.d;
    var dasharray,dashoffset;
    if(d && d.k){
        if(d.mdf || this.firstFrame){
            ////styleElem.pathElement.setAttribute('stroke-dasharray', d.dasharray);
            styleElem.pathElement.style.strokeDasharray = d.dasharray;
            ////styleElem.pathElement.setAttribute('stroke-dashoffset', d.dashoffset);
            styleElem.pathElement.style.strokeDashoffset = d.dashoffset;
        }
    }
    if(viewData.c.mdf || this.firstFrame){
        ////styleElem.pathElement.setAttribute('stroke','rgb('+bm_floor(viewData.c.v[0])+','+bm_floor(viewData.c.v[1])+','+bm_floor(viewData.c.v[2])+')');
        styleElem.pathElement.style.stroke = 'rgb('+bm_floor(viewData.c.v[0])+','+bm_floor(viewData.c.v[1])+','+bm_floor(viewData.c.v[2])+')';
    }
    if(viewData.o.mdf || groupTransform.opMdf || this.firstFrame){
        ////styleElem.pathElement.setAttribute('stroke-opacity',viewData.o.v*groupTransform.opacity);
        styleElem.pathElement.style.strokeOpacity =viewData.o.v*groupTransform.opacity;
    }
    if(viewData.w.mdf || this.firstFrame){
        ////styleElem.pathElement.setAttribute('stroke-width',viewData.w.v);
        styleElem.pathElement.style.strokeWidth = viewData.w.v;
    }
};

IShapeElement.prototype.destroy = function(){
    this.parent.destroy.call();
    this.shapeData = null;
    this.viewData = null;
    this.parentContainer = null;
    this.placeholder = null;
};
extendPrototype(ShapeInterface,IShapeElement);
function ISolidElement(data,parentContainer,globalData,comp, placeholder){
    this.parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
}
createElement(SVGBaseElement, ISolidElement);

ISolidElement.prototype.createElements = function(){
    this.parent.createElements.call(this);

    var rect = document.createElementNS(svgNS,'rect');
    ////rect.style.width = this.data.sw;
    ////rect.style.height = this.data.sh;
    ////rect.style.fill = this.data.sc;
    rect.setAttribute('width',this.data.sw);
    rect.setAttribute('height',this.data.sh);
    rect.setAttribute('fill',this.data.sc);
    if(this.layerElement === this.parentContainer){
        this.appendNodeToParent(rect);
    }else{
        this.layerElement.appendChild(rect);
    }
    if(this.data.ln){
        this.innerElem.setAttribute('id',this.data.ln);
    }
    this.innerElem = rect;
};

ISolidElement.prototype.hide = IImageElement.prototype.hide;
ISolidElement.prototype.renderFrame = IImageElement.prototype.renderFrame;
ISolidElement.prototype.destroy = IImageElement.prototype.destroy;

function CVBaseElement(data, comp,globalData){
    this.globalData = globalData;
    this.data = data;
    this.comp = comp;
    this.canvasContext = globalData.canvasContext;
    this.init();
}

createElement(BaseElement, CVBaseElement);

CVBaseElement.prototype.createElements = function(){

};

CVBaseElement.prototype.renderFrame = function(parentTransform){
    if(this.data.ty === 3){
        return false;
    }

    if(!this.isVisible){
        return this.isVisible;
    }
    this.finalTransform.opMdf = this.finalTransform.op.mdf;
    this.finalTransform.matMdf = this.finalTransform.mProp.mdf;
    this.finalTransform.opacity = this.finalTransform.op.v;

    var mat;
    var finalMat = this.finalTransform.mat;

    if(this.hierarchy){
        var i, len = this.hierarchy.length;
        mat = this.finalTransform.mProp.v.props;
        finalMat.cloneFromProps(mat);
        for(i=0;i<len;i+=1){
            this.finalTransform.matMdf = this.hierarchy[i].finalTransform.mProp.mdf ? true : this.finalTransform.matMdf;

            mat = this.hierarchy[i].finalTransform.mProp.v.props;
            finalMat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5],mat[6],mat[7],mat[8],mat[9],mat[10],mat[11],mat[12],mat[13],mat[14],mat[15]);
        }
    }else{
        if(!parentTransform){
            finalMat.cloneFromProps(this.finalTransform.mProp.v.props);
        }else{
            mat = this.finalTransform.mProp.v.props;
            finalMat.cloneFromProps(mat);
        }
    }

    if(parentTransform){
        mat = parentTransform.mat.props;
        finalMat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5],mat[6],mat[7],mat[8],mat[9],mat[10],mat[11],mat[12],mat[13],mat[14],mat[15]);
        this.finalTransform.opacity *= parentTransform.opacity;
        this.finalTransform.opMdf = parentTransform.opMdf ? true : this.finalTransform.opMdf;
        this.finalTransform.matMdf = parentTransform.matMdf ? true : this.finalTransform.matMdf
    }

    if(this.data.hasMask){
        this.globalData.renderer.save(true);
        this.maskManager.renderFrame(finalMat);
    }
    return this.isVisible;

};

CVBaseElement.prototype.getCurrentAnimData = function(){
    return this.currentAnimData;
};
CVBaseElement.prototype.addMasks = function(data){
    this.maskManager = new CVMaskElement(data,this,this.globalData);
};


CVBaseElement.prototype.destroy = function(){
    this.canvasContext = null;
    this.data = null;
    this.globalData = null;
    if(this.maskManager) {
        this.maskManager.destroy();
    }
};

CVBaseElement.prototype.mHelper = new Matrix();

function CVCompElement(data, comp,globalData){
    this.parent.constructor.call(this,data, comp,globalData);
    this.layers = data.layers;
    if(this.data.tm){
        this.tm = PropertyFactory.getProp(this,this.data.tm,0,globalData.frameRate,this.dynamicProperties);
    }
}
createElement(CVBaseElement, CVCompElement);

CVCompElement.prototype.prepareFrame = function(num){
    this.parent.prepareFrame.call(this,num);
    if(this.isVisible===false){
        return;
    }
    var timeRemapped = num;
    if(this.tm){
        timeRemapped = this.tm.v;
        if(timeRemapped === this.data.op){
            timeRemapped = this.data.op - 1;
        }
    }
    this.renderedFrame = timeRemapped;
    var i,len = this.elements.length;
    for( i = 0; i < len; i+=1 ){
        this.elements[i].prepareFrame(timeRemapped - this.layers[i].st);
    }
};

CVCompElement.prototype.renderFrame = function(parentMatrix){
    if(this.parent.renderFrame.call(this,parentMatrix)===false){
        return;
    }
    var i,len = this.layers.length;
    for( i = len - 1; i >= 0; i -= 1 ){
        this.elements[i].renderFrame(this.finalTransform);
    }
    if(this.data.hasMask){
        this.globalData.renderer.restore(true);
    }
    if(this.firstFrame){
        this.firstFrame = false;
    }
};

CVCompElement.prototype.setElements = function(elems){
    this.elements = elems;
};

CVCompElement.prototype.getElements = function(){
    return this.elements;
};

CVCompElement.prototype.destroy = function(){
    var i,len = this.layers.length;
    for( i = len - 1; i >= 0; i -= 1 ){
        this.elements[i].destroy();
    }
    this.layers = null;
    this.elements = null;
    this.parent.destroy.call();
};
function CVImageElement(data, comp,globalData){
    this.animationItem = globalData.renderer.animationItem;
    this.assetData = this.animationItem.getAssetData(data.refId);
    this.path = this.animationItem.getPath();
    this.parent.constructor.call(this,data, comp,globalData);
    this.animationItem.pendingElements += 1;
}
createElement(CVBaseElement, CVImageElement);

CVImageElement.prototype.createElements = function(){
    var self = this;

    var imageLoaded = function(){
        self.animationItem.elementLoaded();
    };
    var imageFailed = function(){
        //console.log('imageFailed');
        self.failed = true;
        self.animationItem.elementLoaded();
    };

    this.img = new Image();
    this.img.addEventListener('load', imageLoaded, false);
    this.img.addEventListener('error', imageFailed, false);
    this.img.src = this.path+this.assetData.p;

    this.parent.createElements.call(this);

};

CVImageElement.prototype.renderFrame = function(parentMatrix){
    if(this.failed){
        return;
    }
    if(this.parent.renderFrame.call(this,parentMatrix)===false){
        return;
    }
    var ctx = this.canvasContext;
    this.globalData.renderer.save();
    var finalMat = this.finalTransform.mat.props;
    this.globalData.renderer.ctxTransform(finalMat);
    this.globalData.renderer.ctxOpacity(this.finalTransform.opacity);
    ctx.drawImage(this.img,0,0);
    this.globalData.renderer.restore(this.data.hasMask);
    if(this.firstFrame){
        this.firstFrame = false;
    }
};

CVImageElement.prototype.destroy = function(){
    this.img = null;
    this.animationItem = null;
    this.parent.destroy.call();
};

function CVMaskElement(data,element,globalData){
    this.data = data;
    this.element = element;
    this.globalData = globalData;
    this.dynamicProperties = [];
    this.masksProperties = this.data.masksProperties;
    this.ctx = this.element.canvasContext;
    this.viewData = new Array(this.masksProperties.length);
    var i, len = this.masksProperties.length;
    for (i = 0; i < len; i++) {
        this.viewData[i] = PropertyFactory.getShapeProp(this.element,this.masksProperties[i],3,this.dynamicProperties,null);
    }
}

CVMaskElement.prototype.getMaskProperty = function(pos){
    return this.viewData[pos];
};

CVMaskElement.prototype.prepareFrame = function(num){
    var i, len = this.dynamicProperties.length;
    for(i=0;i<len;i+=1){
        this.dynamicProperties[i].getValue(num);
    }
};

CVMaskElement.prototype.renderFrame = function (transform) {
    var ctx = this.ctx;
    var i, len = this.data.masksProperties.length;
    var pt,pt2,pt3,data, hasMasks = false;
    for (i = 0; i < len; i++) {
        if(this.masksProperties[i].mode === 'n'){
            continue;
        }
        if(hasMasks === false){
            ctx.beginPath();
            hasMasks = true;
        }
        if (this.masksProperties[i].inv) {
            ctx.moveTo(0, 0);
            ctx.lineTo(this.globalData.compWidth, 0);
            ctx.lineTo(this.globalData.compWidth, this.globalData.compHeight);
            ctx.lineTo(0, this.globalData.compHeight);
            ctx.lineTo(0, 0);
        }
        data = this.viewData[i].v;
        pt = transform.applyToPointArray(data.v[0][0],data.v[0][1],0);
        ctx.moveTo(pt[0], pt[1]);
        var j, jLen = data.v.length;
        for (j = 1; j < jLen; j++) {
            pt = transform.applyToPointArray(data.o[j - 1][0],data.o[j - 1][1],0);
            pt2 = transform.applyToPointArray(data.i[j][0],data.i[j][1],0);
            pt3 = transform.applyToPointArray(data.v[j][0],data.v[j][1],0);
            ctx.bezierCurveTo(pt[0], pt[1], pt2[0], pt2[1], pt3[0], pt3[1]);
        }
        pt = transform.applyToPointArray(data.o[j - 1][0],data.o[j - 1][1],0);
        pt2 = transform.applyToPointArray(data.i[0][0],data.i[0][1],0);
        pt3 = transform.applyToPointArray(data.v[0][0],data.v[0][1],0);
        ctx.bezierCurveTo(pt[0], pt[1], pt2[0], pt2[1], pt3[0], pt3[1]);
    }
    if(hasMasks){
        ctx.clip();
    }
};

CVMaskElement.prototype.getMask = function(nm){
    var i = 0, len = this.masksProperties.length;
    while(i<len){
        if(this.masksProperties[i].nm === nm){
            return {
                maskPath: this.viewData[i].pv
            }
        }
        i += 1;
    }
};

CVMaskElement.prototype.destroy = function(){
    this.ctx = null;
};
function CVShapeElement(data, comp,globalData){
    this.shapes = [];
    this.stylesList = [];
    this.viewData = [];
    this.shapesData = data.shapes;
    this.firstFrame = true;
    this.parent.constructor.call(this,data, comp,globalData);
}
createElement(CVBaseElement, CVShapeElement);

CVShapeElement.prototype.lcEnum = {
    '1': 'butt',
    '2': 'round',
    '3': 'butt'
}

CVShapeElement.prototype.ljEnum = {
    '1': 'butt',
    '2': 'round',
    '3': 'butt'
};
CVShapeElement.prototype.transformHelper = {opacity:1,mat:new Matrix(),matMdf:false,opMdf:false};

CVShapeElement.prototype.dashResetter = [];

CVShapeElement.prototype.createElements = function(){

    this.parent.createElements.call(this);
    this.searchShapes(this.shapesData,this.viewData,this.dynamicProperties,[]);
    this.buildExpressionInterface();
};
CVShapeElement.prototype.searchShapes = function(arr,data,dynamicProperties,addedTrims){
    var i, len = arr.length - 1;
    var j, jLen;
    var ownArrays = [], ownTrims = [], styleElem;
    for(i=len;i>=0;i-=1){
        if(arr[i].ty == 'fl' || arr[i].ty == 'st'){
            styleElem = {
                type: arr[i].ty,
                elements: []
            };
            data[i] = {};
            data[i].c = PropertyFactory.getProp(this,arr[i].c,1,null,dynamicProperties);
            if(!data[i].c.k){
                styleElem.co = 'rgb('+bm_floor(data[i].c.v[0])+','+bm_floor(data[i].c.v[1])+','+bm_floor(data[i].c.v[2])+')';
            }
            data[i].o = PropertyFactory.getProp(this,arr[i].o,0,0.01,dynamicProperties);
            if(arr[i].ty == 'st') {
                styleElem.lc = this.lcEnum[arr[i].lc] || 'round';
                styleElem.lj = this.ljEnum[arr[i].lj] || 'round';
                if(arr[i].lj == 1) {
                    styleElem.ml = arr[i].ml;
                }
                data[i].w = PropertyFactory.getProp(this,arr[i].w,0,null,dynamicProperties);
                if(!data[i].w.k){
                    styleElem.wi = data[i].w.v;
                }
                if(arr[i].d){
                    var d = PropertyFactory.getDashProp(this,arr[i].d,'canvas',dynamicProperties);
                    data[i].d = d;
                    if(!data[i].d.k){
                        styleElem.da = data[i].d.dasharray;
                        styleElem.do = data[i].d.dashoffset;
                    }
                }

            }
            this.stylesList.push(styleElem);
            data[i].style = styleElem;
            ownArrays.push(data[i].style);
        }else if(arr[i].ty == 'gr'){
            data[i] = {
                it: []
            };
            this.searchShapes(arr[i].it,data[i].it,dynamicProperties,addedTrims);
        }else if(arr[i].ty == 'tr'){
            data[i] = {
                transform : {
                    mat: new Matrix(),
                    opacity: 1,
                    matMdf:false,
                    opMdf:false,
                    op: PropertyFactory.getProp(this,arr[i].o,0,0.01,dynamicProperties),
                    mProps: PropertyFactory.getProp(this,arr[i],2,null,dynamicProperties)
                },
                elements: []
            };
        }else if(arr[i].ty == 'sh' || arr[i].ty == 'rc' || arr[i].ty == 'el' || arr[i].ty == 'sr'){
            data[i] = {
                nodes:[],
                trNodes:[],
                tr:[0,0,0,0,0,0]
            };
            var ty = 4;
            if(arr[i].ty == 'rc'){
                ty = 5;
            }else if(arr[i].ty == 'el'){
                ty = 6;
            }else if(arr[i].ty == 'sr'){
                ty = 7;
            }
            if(addedTrims.length){
                arr[i].trimmed = true;
            }
            data[i].sh = PropertyFactory.getShapeProp(this,arr[i],ty,dynamicProperties, addedTrims);
            jLen = this.stylesList.length;
            var hasStrokes = false, hasFills = false;
            for(j=0;j<jLen;j+=1){
                if(!this.stylesList[j].closed){
                    this.stylesList[j].elements.push(data[i]);
                    if(this.stylesList[j].type === 'st'){
                        hasStrokes = true;
                    }else{
                        hasFills = true;
                    }
                }
            }
            data[i].st = hasStrokes;
            data[i].fl = hasFills;
        }else if(arr[i].ty == 'tm'){
            var trimOb = {
                closed: false,
                trimProp: PropertyFactory.getProp(this,arr[i],7,null,dynamicProperties)
            };
            addedTrims.push(trimOb);
            ownTrims.push(trimOb);
        }
    }
    len = ownArrays.length;
    for(i=0;i<len;i+=1){
        ownArrays[i].closed = true;
    }
    len = ownTrims.length;
    for(i=0;i<len;i+=1){
        ownTrims[i].closed = true;
    }
};

CVShapeElement.prototype.renderFrame = function(parentMatrix){
    if(this.parent.renderFrame.call(this, parentMatrix)===false){
        return;
    }
    this.transformHelper.mat.reset();
    this.transformHelper.opacity = this.finalTransform.opacity;
    this.transformHelper.matMdf = false;
    this.transformHelper.opMdf = this.finalTransform.opMdf;
    this.renderShape(this.transformHelper,null,null,true);
    if(this.data.hasMask){
        this.globalData.renderer.restore(true);
    }
};

CVShapeElement.prototype.renderShape = function(parentTransform,items,data,isMain){
    var i, len;
    if(!items){
        items = this.shapesData;
        len = this.stylesList.length;
        for(i=0;i<len;i+=1){
            this.stylesList[i].d = '';
            this.stylesList[i].mdf = false;
        }
    }
    if(!data){
        data = this.viewData;
    }
    ///
    ///
    len = items.length - 1;
    var groupTransform,groupMatrix;
    groupTransform = parentTransform;
    for(i=len;i>=0;i-=1){
        if(items[i].ty == 'tr'){
            groupTransform = data[i].transform;
            var mtArr = data[i].transform.mProps.v.props;
            groupTransform.matMdf = groupTransform.mProps.mdf;
            groupTransform.opMdf = groupTransform.op.mdf;
            groupMatrix = groupTransform.mat;
            groupMatrix.cloneFromProps(mtArr);
            if(parentTransform){
                var props = parentTransform.mat.props;
                groupTransform.opacity = parentTransform.opacity;
                groupTransform.opacity *= data[i].transform.op.v;
                groupTransform.matMdf = parentTransform.matMdf ? true : groupTransform.matMdf;
                groupTransform.opMdf = parentTransform.opMdf ? true : groupTransform.opMdf;
                groupMatrix.transform(props[0],props[1],props[2],props[3],props[4],props[5],props[6],props[7],props[8],props[9],props[10],props[11],props[12],props[13],props[14],props[15]);
            }else{
                groupTransform.opacity = groupTransform.op.o;
            }
        }else if(items[i].ty == 'sh' || items[i].ty == 'el' || items[i].ty == 'rc' || items[i].ty == 'sr'){
            this.renderPath(items[i],data[i],groupTransform);
        }else if(items[i].ty == 'fl'){
            this.renderFill(items[i],data[i],groupTransform);
        }else if(items[i].ty == 'st'){
            this.renderStroke(items[i],data[i],groupTransform);
        }else if(items[i].ty == 'gr'){
            this.renderShape(groupTransform,items[i].it,data[i].it);
        }else if(items[i].ty == 'tm'){
            //
        }
    }
    if(!isMain){
        return;
    }
    len = this.stylesList.length;
    var j, jLen, k, kLen,elems,nodes, renderer = this.globalData.renderer, ctx = this.globalData.canvasContext, type;
    renderer.save();
    renderer.ctxTransform(this.finalTransform.mat.props);
    for(i=0;i<len;i+=1){
        type = this.stylesList[i].type;
        if(type === 'st' && this.stylesList[i].wi === 0){
            continue;
        }
        renderer.save();
        elems = this.stylesList[i].elements;
        jLen = elems.length;
        if(type === 'st'){
            ctx.strokeStyle = this.stylesList[i].co;
            ctx.lineWidth = this.stylesList[i].wi;
            ctx.lineCap = this.stylesList[i].lc;
            ctx.lineJoin = this.stylesList[i].lj;
            ctx.miterLimit = this.stylesList[i].ml || 0;
        }else{
            ctx.fillStyle = this.stylesList[i].co;
        }
        renderer.ctxOpacity(this.stylesList[i].coOp);
        if(type !== 'st'){
            ctx.beginPath();
        }
        for(j=0;j<jLen;j+=1){
            if(type === 'st'){
                ctx.beginPath();
                if(this.stylesList[i].da){
                    ctx.setLineDash(this.stylesList[i].da);
                    ctx.lineDashOffset = this.stylesList[i].do;
                    this.globalData.isDashed = true;
                }else if(this.globalData.isDashed){
                    ctx.setLineDash(this.dashResetter);
                    this.globalData.isDashed = false;
                }
            }
            nodes = elems[j].trNodes;
            kLen = nodes.length;

            for(k=0;k<kLen;k+=1){
                if(nodes[k].t == 'm'){
                    ctx.moveTo(nodes[k].p[0],nodes[k].p[1]);
                }else{
                    ctx.bezierCurveTo(nodes[k].p1[0],nodes[k].p1[1],nodes[k].p2[0],nodes[k].p2[1],nodes[k].p3[0],nodes[k].p3[1]);
                }
            }
            if(type === 'st'){
                ctx.stroke();
            }
        }
        if(type !== 'st'){
            ctx.fill();
        }
        renderer.restore();
    }
    renderer.restore();
    if(this.firstFrame){
        this.firstFrame = false;
    }
};
CVShapeElement.prototype.renderPath = function(pathData,viewData,groupTransform){
    var len, i;
    var pathNodes = viewData.sh.v;
    if(pathNodes.v){
        len = pathNodes.v.length;
        var redraw = groupTransform.matMdf || viewData.sh.mdf || this.firstFrame;
        if(redraw) {
            var pathStringTransformed = viewData.trNodes;
            pathStringTransformed.length = 0;
            var stops = pathNodes.s ? pathNodes.s : [];
            for (i = 1; i < len; i += 1) {
                if (stops[i - 1]) {
                    pathStringTransformed.push({
                        t:'m',
                        p:groupTransform.mat.applyToPointArray(stops[i - 1][0], stops[i - 1][1], 0)
                    });
                } else if (i == 1) {
                    pathStringTransformed.push({
                        t:'m',
                        p:groupTransform.mat.applyToPointArray(pathNodes.v[0][0], pathNodes.v[0][1], 0)
                    });
                }
                pathStringTransformed.push({
                    t:'c',
                    p1:groupTransform.mat.applyToPointArray(pathNodes.o[i - 1][0],pathNodes.o[i - 1][1], 0),
                    p2:groupTransform.mat.applyToPointArray(pathNodes.i[i][0], pathNodes.i[i][1], 0),
                    p3:groupTransform.mat.applyToPointArray(pathNodes.v[i][0], pathNodes.v[i][1], 0)
                });
            }
            if (len == 1) {
                if (stops[0]) {
                    pathStringTransformed.push({
                        t:'m',
                        p:groupTransform.mat.applyToPointArray(stops[0][0], stops[0][1], 0)
                    });
                } else {
                    pathStringTransformed.push({
                        t:'m',
                        p:groupTransform.mat.applyToPointArray(pathNodes.v[0][0], pathNodes.v[0][1], 0)
                    });
                }
            }
            if (len && pathData.closed && !(pathData.trimmed && !pathNodes.c)) {
                pathStringTransformed.push({
                    t:'c',
                    p1:groupTransform.mat.applyToPointArray(pathNodes.o[i - 1][0], pathNodes.o[i - 1][1], 0),
                    p2:groupTransform.mat.applyToPointArray(pathNodes.i[0][0], pathNodes.i[0][1], 0),
                    p3:groupTransform.mat.applyToPointArray(pathNodes.v[0][0], pathNodes.v[0][1], 0)
                });
            }
            if (viewData.st) {
                for(i=0;i<16;i+=1){
                    viewData.tr[i] = groupTransform.mat.props[i];
                }
            }
            viewData.trNodes = pathStringTransformed;
        }
    }
};



CVShapeElement.prototype.renderFill = function(styleData,viewData, groupTransform){
    var styleElem = viewData.style;

    if(viewData.c.mdf || this.firstFrame){
        styleElem.co = 'rgb('+bm_floor(viewData.c.v[0])+','+bm_floor(viewData.c.v[1])+','+bm_floor(viewData.c.v[2])+')';
    }
    if(viewData.o.mdf || groupTransform.opMdf || this.firstFrame){
        styleElem.coOp = viewData.o.v*groupTransform.opacity;
    }
};

CVShapeElement.prototype.renderStroke = function(styleData,viewData, groupTransform){
    var styleElem = viewData.style;
    //TODO fix dashes
    var d = viewData.d;
    var dasharray,dashoffset;
    if(d && (d.mdf  || this.firstFrame)){
        styleElem.da = d.dasharray;
        styleElem.do = d.dashoffset;
    }
    if(viewData.c.mdf || this.firstFrame){
        styleElem.co = 'rgb('+bm_floor(viewData.c.v[0])+','+bm_floor(viewData.c.v[1])+','+bm_floor(viewData.c.v[2])+')';
    }
    if(viewData.o.mdf || groupTransform.opMdf || this.firstFrame){
        styleElem.coOp = viewData.o.v*groupTransform.opacity;
    }
    if(viewData.w.mdf || this.firstFrame){
        styleElem.wi = viewData.w.v;
    }
};


CVShapeElement.prototype.destroy = function(){
    this.shapesData = null;
    this.globalData = null;
    this.canvasContext = null;
    this.stylesList.length = 0;
    this.viewData.length = 0;
    this.parent.destroy.call();
};
extendPrototype(ShapeInterface,CVShapeElement);
function CVSolidElement(data, comp,globalData){
    this.parent.constructor.call(this,data, comp,globalData);
}
createElement(CVBaseElement, CVSolidElement);

CVSolidElement.prototype.renderFrame = function(parentMatrix){
    if(this.parent.renderFrame.call(this, parentMatrix)===false){
        return;
    }
    var ctx = this.canvasContext;
    this.globalData.renderer.save();
    var finalMat = this.finalTransform.mat.props;
    this.globalData.renderer.ctxTransform(finalMat);
    this.globalData.renderer.ctxOpacity(this.finalTransform.opacity);

    ctx.fillStyle=this.data.sc;
    ctx.fillRect(0,0,this.data.sw,this.data.sh);
    this.globalData.renderer.restore(this.data.hasMask);
    if(this.firstFrame){
        this.firstFrame = false;
    }
};
function CVTextElement(data, comp, globalData){
    this.textSpans = [];
    this.yOffset = 0;
    this.fillColorAnim = false;
    this.strokeColorAnim = false;
    this.strokeWidthAnim = false;
    this.stroke = false;
    this.fill = false;
    this.justifyOffset = 0;
    this.currentRender = null;
    this.renderType = 'canvas';
    this.values = {
        fill: 'rgba(0,0,0,0)',
        stroke: 'rgba(0,0,0,0)',
        sWidth: 0,
        fValue: ''
    }
    this.parent.constructor.call(this,data,comp, globalData);
}
createElement(CVBaseElement, CVTextElement);

CVTextElement.prototype.init = ITextElement.prototype.init;
CVTextElement.prototype.getMeasures = ITextElement.prototype.getMeasures;
CVTextElement.prototype.getMult = ITextElement.prototype.getMult;

CVTextElement.prototype.tHelper = document.createElement('canvas').getContext('2d');

CVTextElement.prototype.createElements = function(){

    this.parent.createElements.call(this);
    //console.log('this.data: ',this.data);
    var documentData = this.data.t.d;

    var hasFill = false;
    if(documentData.fc) {
        hasFill = true;
        this.values.fill = 'rgb(' + documentData.fc[0] + ',' + documentData.fc[1] + ',' + documentData.fc[2] + ')';
    }else{
        this.values.fill = 'rgba(0,0,0,0)';
    }
    this.fill = hasFill;
    var hasStroke = false;
    if(documentData.sc){
        hasStroke = true;
        this.values.stroke = 'rgb(' + documentData.sc[0] + ',' + documentData.sc[1] + ',' + documentData.sc[2] + ')';
        this.values.sWidth = documentData.sw;
    }
    var fontData = this.globalData.fontManager.getFontByName(documentData.f);
    var i, len;
    var letters = documentData.l;
    var matrixHelper = this.mHelper;
    this.stroke = hasStroke;
    this.values.fValue = documentData.s + 'px '+ this.globalData.fontManager.getFontByName(documentData.f).fFamily;
    len = documentData.t.length;
    this.tHelper.font = this.values.fValue;
    var charData, shapeData, k, kLen, shapes, j, jLen, pathNodes, commands, pathArr, singleShape = this.data.singleShape;
    if (singleShape) {
        var xPos = 0, yPos = 0, lineWidths = documentData.lineWidths, boxWidth = documentData.boxWidth, firstLine = true;
    }
    for (i = 0;i < len ;i += 1) {
        charData = this.globalData.fontManager.getCharData(documentData.t.charAt(i), fontData.fStyle, this.globalData.fontManager.getFontByName(documentData.f).fFamily);
        var shapeData;
        if(charData){
            shapeData = charData.data;
        } else {
            shapeData = null;
        }
        matrixHelper.reset();
        if(singleShape && letters[i].n) {
            xPos = 0;
            yPos += documentData.yOffset;
            yPos += firstLine ? 1 : 0;
            firstLine = false;
        }

        if(shapeData && shapeData.shapes){
            shapes = shapeData.shapes[0].it;
            jLen = shapes.length;
            matrixHelper.scale(documentData.s/100,documentData.s/100);
            if(singleShape){
                if(documentData.ps){
                    matrixHelper.translate(documentData.ps[0],documentData.ps[1] + documentData.ascent,0);
                }
                switch(documentData.j){
                    case 1:
                        matrixHelper.translate(documentData.justifyOffset + (boxWidth - lineWidths[letters[i].line]),0,0);
                        break;
                    case 2:
                        matrixHelper.translate(documentData.justifyOffset + (boxWidth - lineWidths[letters[i].line])/2,0,0);
                        break;
                }
                matrixHelper.translate(xPos,yPos,0);
            }
            commands = new Array(jLen);
            for(j=0;j<jLen;j+=1){
                kLen = shapes[j].ks.k.i.length;
                pathNodes = shapes[j].ks.k;
                pathArr = [];
                for(k=1;k<kLen;k+=1){
                    if(k==1){
                        pathArr.push(matrixHelper.applyToX(pathNodes.v[0][0],pathNodes.v[0][1],0),matrixHelper.applyToY(pathNodes.v[0][0],pathNodes.v[0][1],0));
                    }
                    pathArr.push(matrixHelper.applyToX(pathNodes.o[k-1][0],pathNodes.o[k-1][1],0),matrixHelper.applyToY(pathNodes.o[k-1][0],pathNodes.o[k-1][1],0),matrixHelper.applyToX(pathNodes.i[k][0],pathNodes.i[k][1],0),matrixHelper.applyToY(pathNodes.i[k][0],pathNodes.i[k][1],0),matrixHelper.applyToX(pathNodes.v[k][0],pathNodes.v[k][1],0),matrixHelper.applyToY(pathNodes.v[k][0],pathNodes.v[k][1],0));
                }
                pathArr.push(matrixHelper.applyToX(pathNodes.o[k-1][0],pathNodes.o[k-1][1],0),matrixHelper.applyToY(pathNodes.o[k-1][0],pathNodes.o[k-1][1],0),matrixHelper.applyToX(pathNodes.i[0][0],pathNodes.i[0][1],0),matrixHelper.applyToY(pathNodes.i[0][0],pathNodes.i[0][1],0),matrixHelper.applyToX(pathNodes.v[0][0],pathNodes.v[0][1],0),matrixHelper.applyToY(pathNodes.v[0][0],pathNodes.v[0][1],0));
                commands[j] = pathArr;
            }
        }else{
            commands = [];
        }
        if(singleShape){
            xPos += letters[i].l;
        }
        this.textSpans.push({elem: commands});
    }
};

CVTextElement.prototype.renderFrame = function(parentMatrix){
    if(this.parent.renderFrame.call(this, parentMatrix)===false){
        return;
    }
    var ctx = this.canvasContext;
    var finalMat = this.finalTransform.mat.props;
    this.globalData.renderer.save();
    this.globalData.renderer.ctxTransform(finalMat);
    this.globalData.renderer.ctxOpacity(this.finalTransform.opacity);
    ctx.font = this.values.fValue;
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 4;

    if(!this.data.singleShape){
        this.getMeasures();
    }

    var  i,len, j, jLen, k, kLen;
    var renderedLetters = this.renderedLetters;

    var letters = this.data.t.d.l;

    len = letters.length;
    var renderedLetter;
    var lastFill = null, lastStroke = null, lastStrokeW = null, commands, pathArr;
    for(i=0;i<len;i+=1){
        if(letters[i].n){
            continue;
        }
        renderedLetter = renderedLetters[i];
        if(renderedLetter){
            this.globalData.renderer.save();
            this.globalData.renderer.ctxTransform(renderedLetter.props);
            this.globalData.renderer.ctxOpacity(renderedLetter.o);
        }
        if(this.fill){
            if(renderedLetter && renderedLetter.fc){
                if(lastFill !== renderedLetter.fc){
                    lastFill = renderedLetter.fc;
                    ctx.fillStyle = renderedLetter.fc;
                }
            }else if(lastFill !== this.values.fill){
                lastFill = this.values.fill;
                ctx.fillStyle = this.values.fill;
            }
            commands = this.textSpans[i].elem;
            jLen = commands.length;
            this.globalData.canvasContext.beginPath();
            for(j=0;j<jLen;j+=1) {
                pathArr = commands[j];
                kLen = pathArr.length;
                this.globalData.canvasContext.moveTo(pathArr[0], pathArr[1]);
                for (k = 2; k < kLen; k += 6) {
                    this.globalData.canvasContext.bezierCurveTo(pathArr[k], pathArr[k + 1], pathArr[k + 2], pathArr[k + 3], pathArr[k + 4], pathArr[k + 5]);
                }
            }
            this.globalData.canvasContext.closePath();
            this.globalData.canvasContext.fill();
            ///ctx.fillText(this.textSpans[i].val,0,0);
        }
        if(this.stroke){
            if(renderedLetter && renderedLetter.sw){
                if(lastStrokeW !== renderedLetter.sw){
                    lastStrokeW = renderedLetter.sw;
                    ctx.lineWidth = renderedLetter.sw;
                }
            }else if(lastStrokeW !== this.values.sWidth){
                lastStrokeW = this.values.sWidth;
                ctx.lineWidth = this.values.sWidth;
            }
            if(renderedLetter && renderedLetter.sc){
                if(lastStroke !== renderedLetter.sc){
                    lastStroke = renderedLetter.sc;
                    ctx.strokeStyle = renderedLetter.sc;
                }
            }else if(lastStroke !== this.values.stroke){
                lastStroke = this.values.stroke;
                ctx.strokeStyle = this.values.stroke;
            }
            commands = this.textSpans[i].elem;
            jLen = commands.length;
            this.globalData.canvasContext.beginPath();
            for(j=0;j<jLen;j+=1) {
                pathArr = commands[j];
                kLen = pathArr.length;
                this.globalData.canvasContext.moveTo(pathArr[0], pathArr[1]);
                for (k = 2; k < kLen; k += 6) {
                    this.globalData.canvasContext.bezierCurveTo(pathArr[k], pathArr[k + 1], pathArr[k + 2], pathArr[k + 3], pathArr[k + 4], pathArr[k + 5]);
                }
            }
            this.globalData.canvasContext.closePath();
            this.globalData.canvasContext.stroke();
            ///ctx.strokeText(letters[i].val,0,0);
        }
        if(renderedLetter) {
            this.globalData.renderer.restore();
        }
    }
    /*if(this.data.hasMask){
     this.globalData.renderer.restore(true);
     }*/
    this.globalData.renderer.restore(this.data.hasMask);
    if(this.firstFrame){
        this.firstFrame = false;
    }
};
function HBaseElement(data,parentContainer,globalData,comp, placeholder){
    this.globalData = globalData;
    this.comp = comp;
    this.data = data;
    this.matteElement = null;
    this.parentContainer = parentContainer;
    this.layerId = placeholder ? placeholder.layerId : 'ly_'+randomString(10);
    this.placeholder = placeholder;
    this.init();
};

createElement(BaseElement, HBaseElement);

HBaseElement.prototype.appendNodeToParent = function(node) {
    if(this.placeholder){
        var g = this.placeholder.phElement;
        g.parentNode.insertBefore(node, g);
        //g.parentNode.removeChild(g);
    }else{
        this.parentContainer.appendChild(node);
    }
};

HBaseElement.prototype.createElements = function(){
    if(this.data.hasMask){
        this.layerElement = document.createElementNS(svgNS,'svg');
        this.appendNodeToParent(this.layerElement);
        this.maskedElement = this.layerElement;
    }else{
        this.layerElement = this.parentContainer;
    }
    if(this.data.ln && (this.data.ty === 4 || this.data.ty === 0)){
        if(this.layerElement === this.parentContainer){
            this.layerElement = document.createElementNS(svgNS,'g');
            this.appendNodeToParent(this.layerElement);
        }
        this.layerElement.setAttribute('id',this.data.ln);
    }
    if(this.layerElement !== this.parentContainer){
        this.placeholder = null;
    }
};

HBaseElement.prototype.renderFrame = function(parentTransform){
    if(this.data.ty === 3){
        return false;
    }

    if(this.currentFrameNum === this.lastNum || !this.isVisible){
        return this.isVisible;
    }
    this.lastNum = this.currentFrameNum;

    if(this.data.hasMask){
        this.maskManager.renderFrame();
    }
    this.finalTransform.opMdf = this.finalTransform.op.mdf;
    this.finalTransform.matMdf = this.finalTransform.mProp.mdf;
    this.finalTransform.opacity = this.finalTransform.op.v;
    if(this.firstFrame){
        this.finalTransform.opMdf = true;
        this.finalTransform.matMdf = true;
    }

    var mat;
    var finalMat = this.finalTransform.mat;

    if(this.hierarchy){
        var i, len = this.hierarchy.length;

        mat = this.finalTransform.mProp.v.props;
        finalMat.cloneFromProps(mat);
        for(i=0;i<len;i+=1){
            this.finalTransform.matMdf = this.hierarchy[i].finalTransform.mProp.mdf ? true : this.finalTransform.matMdf;
            mat = this.hierarchy[i].finalTransform.mProp.v.props;
            finalMat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5],mat[6],mat[7],mat[8],mat[9],mat[10],mat[11],mat[12],mat[13],mat[14],mat[15]);
        }
    }else{
        if(this.isVisible && this.finalTransform.matMdf){
            if(!parentTransform){
                finalMat.cloneFromProps(this.finalTransform.mProp.v.props);
            }else{
                mat = this.finalTransform.mProp.v.props;
                finalMat.cloneFromProps(mat);
            }
        }
    }

    if(parentTransform){
        mat = parentTransform.mat.props;
        finalMat.cloneFromProps(mat);
        this.finalTransform.opacity *= parentTransform.opacity;
        this.finalTransform.opMdf = parentTransform.opMdf ? true : this.finalTransform.opMdf;
        this.finalTransform.matMdf = parentTransform.matMdf ? true : this.finalTransform.matMdf
    }

    if(this.finalTransform.matMdf){
        this.layerElement.style.transform = this.layerElement.style.webkitTransform = finalMat.toCSS();
    }
    if(this.finalTransform.opMdf){
        this.layerElement.style.opacity = this.finalTransform.opacity;
    }
    return this.isVisible;
};

HBaseElement.prototype.destroy = function(){
    this.layerElement = null;
    this.parentContainer = null;
    if(this.matteElement) {
        this.matteElement = null;
    }
    if(this.maskManager) {
        this.maskManager.destroy();
        this.maskManager = null;
    }
};

HBaseElement.prototype.getDomElement = function(){
    return this.layerElement;
};
HBaseElement.prototype.addMasks = function(data){
    this.maskManager = new MaskElement(data,this,this.globalData);
};

HBaseElement.prototype.hide = function(){

};

HBaseElement.prototype.setMatte = function(){

}
function HSolidElement(data,parentContainer,globalData,comp, placeholder){
    this.parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
}
createElement(HBaseElement, HSolidElement);

HSolidElement.prototype.createElements = function(){
    var parent = document.createElement('div');
    styleDiv(parent);
    var cont = document.createElementNS(svgNS,'svg');
    cont.setAttribute('width',this.data.sw);
    cont.setAttribute('height',this.data.sh);
    parent.appendChild(cont);
    this.layerElement = parent;
    this.parentContainer.appendChild(parent);
    this.innerElem = parent;
    if(this.data.ln){
        this.innerElem.setAttribute('id',this.data.ln);
    }
    var rect = document.createElementNS(svgNS,'rect');
    rect.setAttribute('width',this.data.sw);
    rect.setAttribute('height',this.data.sh);
    rect.setAttribute('fill',this.data.sc);
    cont.appendChild(rect);
    if(this.data.hasMask){
        this.maskedElement = rect;
    }
};



HSolidElement.prototype.hide = function(){
    if(!this.hidden){
        this.innerElem.style.display = 'none';
        this.hidden = true;
    }
};

HSolidElement.prototype.renderFrame = function(parentMatrix){
    var renderParent = this.parent.renderFrame.call(this,parentMatrix);
    if(renderParent===false){
        this.hide();
        return;
    }
    if(this.hidden){
        this.hidden = false;
        this.innerElem.style.display = 'block';
    }
    if(this.firstFrame){
        this.firstFrame = false;
    }
};

HSolidElement.prototype.destroy = function(){
    this.parent.destroy.call();
    this.innerElem =  null;
};
function HCompElement(data,parentContainer,globalData,comp, placeholder){
    this.parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
    this.layers = data.layers;
    this.isSvg = false;
    if(this.data.tm){
        this.tm = PropertyFactory.getProp(this,this.data.tm,0,globalData.frameRate,this.dynamicProperties);
    }
    if(this.data.hasMask) {
        this.isSvg = true;
    }
}
createElement(HBaseElement, HCompElement);
extendPrototype(ExpressionComp,HCompElement);

HCompElement.prototype.getDomElement = function(){
    return this.composingElement;
};

HCompElement.prototype.getComposingElement = function(){
    return this.layerElement;
};

HCompElement.prototype.createElements = function(){
    this.layerElement = document.createElement('div');
    styleDiv(this.layerElement);
    if(this.data.ln){
        this.layerElement.setAttribute('id',this.data.ln);
    }
    this.layerElement.style.clip = 'rect(0px, '+this.data.w+'px, '+this.data.h+'px, 0px)';
    if(this.layerElement !== this.parentContainer){
        this.placeholder = null;
    }
    if(this.data.hasMask){
        var compSvg = document.createElementNS(svgNS,'svg');
        compSvg.setAttribute('width',this.data.w);
        compSvg.setAttribute('height',this.data.h);
        var g = document.createElementNS(svgNS,'g');
        compSvg.appendChild(g);
        this.layerElement.appendChild(compSvg);
        this.maskedElement = g;
        this.composingElement = g;
    }else{
        this.composingElement = this.layerElement;
    }
    this.appendNodeToParent(this.layerElement);
};

HCompElement.prototype.hide = ICompElement.prototype.hide;
HCompElement.prototype.prepareFrame = ICompElement.prototype.prepareFrame;
HCompElement.prototype.setElements = ICompElement.prototype.setElements;
HCompElement.prototype.getElements = ICompElement.prototype.getElements;
HCompElement.prototype.destroy = ICompElement.prototype.destroy;

HCompElement.prototype.renderFrame = function(parentMatrix){
    var renderParent = this.parent.renderFrame.call(this,parentMatrix);
    var i,len = this.layers.length;
    if(renderParent===false){
        this.hide();
        return;
    }

    this.hidden = false;

    for( i = 0; i < len; i+=1 ){
        this.elements[i].renderFrame();
    }
    if(this.firstFrame){
        this.firstFrame = false;
    }
};
function HShapeElement(data,parentContainer,globalData,comp, placeholder){
    this.shapes = [];
    this.shapesData = data.shapes;
    this.stylesList = [];
    this.viewData = [];
    this.parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
}
createElement(HBaseElement, HShapeElement);
var parent = HShapeElement.prototype.parent;
extendPrototype(IShapeElement, HShapeElement);
HShapeElement.prototype.parent = parent;

HShapeElement.prototype.createElements = function(){
    var parent = document.createElement('div');
    styleDiv(parent);
    var cont = document.createElementNS(svgNS,'svg');
    if(this.data.bounds.l === 999999){
    }
    cont.setAttribute('width',this.data.bounds.r - this.data.bounds.l);
    cont.setAttribute('height',this.data.bounds.b - this.data.bounds.t);
    cont.setAttribute('viewBox',this.data.bounds.l+' '+this.data.bounds.t+' '+(this.data.bounds.r - this.data.bounds.l)+' '+(this.data.bounds.b - this.data.bounds.t));
    cont.style.transform = cont.style.webkitTransform = 'translate('+this.data.bounds.l+'px,'+this.data.bounds.t+'px)';
    if(this.data.hasMask){
        var g = document.createElementNS(svgNS,'g');
        parent.appendChild(cont);
        cont.appendChild(g);
        this.maskedElement = g;
        this.layerElement = g;
        this.shapesContainer = g;
    }else{
        parent.appendChild(cont);
        this.layerElement = cont;
        this.shapesContainer = document.createElementNS(svgNS,'g');
        this.layerElement.appendChild(this.shapesContainer);
    }
    this.parentContainer.appendChild(parent);
    this.innerElem = parent;
    if(this.data.ln){
        this.innerElem.setAttribute('id',this.data.ln);
    }
    this.searchShapes(this.shapesData,this.viewData,this.dynamicProperties,[]);
    this.buildExpressionInterface();
    this.layerElement = parent;
};

HShapeElement.prototype.renderFrame = function(parentMatrix){
    var renderParent = this.parent.renderFrame.call(this,parentMatrix);
    if(renderParent===false){
        this.hide();
        return;
    }
    this.hidden = false;
    this.renderShape(this.transformHelper,null,null,true);
};
function HTextElement(data,parentContainer,globalData,comp, placeholder){
    this.textSpans = [];
    this.textPaths = [];
    this.currentBBox = {
        x:999999,
        y: -999999,
        h: 0,
        w: 0
    }
    this.renderType = 'svg';
    this.isMasked = false;
    this.parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);

}
createElement(HBaseElement, HTextElement);

HTextElement.prototype.init = ITextElement.prototype.init;
HTextElement.prototype.getMeasures = ITextElement.prototype.getMeasures;
HTextElement.prototype.createPathShape = ITextElement.prototype.createPathShape;

HTextElement.prototype.createElements = function(){
    this.isMasked = this.checkMasks();
    var documentData = this.data.t.d;
    var parent = document.createElement('div');
    styleDiv(parent);
    this.layerElement = parent;
    if(this.isMasked){
        this.renderType = 'svg';
        var cont = document.createElementNS(svgNS,'svg');
        this.cont = cont;
        this.compW = this.comp.data ? this.comp.data.w : this.globalData.compSize.w;
        this.compH = this.comp.data ? this.comp.data.h : this.globalData.compSize.h;
        cont.setAttribute('width',this.compW);
        cont.setAttribute('height',this.compH);
        var g = document.createElementNS(svgNS,'g');
        cont.appendChild(g);
        parent.appendChild(cont);
        this.maskedElement = g;
        this.innerElem = g;
    } else {
        this.renderType = 'html';
        this.innerElem = parent;
    }
    this.parentContainer.appendChild(parent);

    if(documentData.fc) {
        this.innerElem.style.color = this.innerElem.style.fill = 'rgb(' + documentData.fc[0] + ',' + documentData.fc[1] + ',' + documentData.fc[2] + ')';
        ////this.innerElem.setAttribute('fill', 'rgb(' + documentData.fc[0] + ',' + documentData.fc[1] + ',' + documentData.fc[2] + ')');
    }else{
        this.innerElem.style.color = this.innerElem.style.fill = 'rgba(0,0,0,0)';
        ////this.innerElem.setAttribute('fill', 'rgba(0,0,0,0)');
    }
    if(documentData.sc){
        ////this.innerElem.setAttribute('stroke', 'rgb(' + documentData.sc[0] + ',' + documentData.sc[1] + ',' + documentData.sc[2] + ')');
        this.innerElem.style.stroke = 'rgb(' + documentData.sc[0] + ',' + documentData.sc[1] + ',' + documentData.sc[2] + ')';
        ////this.innerElem.setAttribute('stroke-width', documentData.sw);
        this.innerElem.style.strokeWidth = documentData.sw+'px';
    }
    ////this.innerElem.setAttribute('font-size', documentData.s);
    var fontData = this.globalData.fontManager.getFontByName(documentData.f);
    if(!this.globalData.fontManager.chars){
        this.innerElem.style.fontSize = documentData.s+'px';
        this.innerElem.style.lineHeight = documentData.s+'px';
        if(fontData.fClass){
            this.innerElem.className = fontData.fClass;
        } else {
            ////this.innerElem.setAttribute('font-family', fontData.fFamily);
            this.innerElem.style.fontFamily = fontData.fFamily;
            var fWeight = documentData.fWeight, fStyle = documentData.fStyle;
            ////this.innerElem.setAttribute('font-style', fStyle);
            this.innerElem.style.fontStyle = fStyle;
            ////this.innerElem.setAttribute('font-weight', fWeight);
            this.innerElem.style.fontWeight = fWeight;
        }
    }
    var i, len;



    var letters = documentData.l;
    len = letters.length;
    var tSpan,tParent,tCont;
    var matrixHelper = this.mHelper;
    var shapes, shapeStr = '';
    for (i = 0;i < len ;i += 1) {
        if(this.globalData.fontManager.chars){
            tSpan = document.createElementNS(svgNS,'path');
            if(!this.isMasked){
                tParent = document.createElement('div');
                tCont = document.createElementNS(svgNS,'svg');
                tParent.appendChild(tCont);
                tCont.appendChild(tSpan);
                styleDiv(tParent);
            }
            tSpan.setAttribute('stroke-linecap', 'butt');
            tSpan.setAttribute('stroke-linejoin','round');
            tSpan.setAttribute('stroke-miterlimit','4');
        }else{
            if(!this.isMasked){
                tParent = document.createElement('span');
                styleDiv(tParent);
                tSpan = document.createElement('span');
                styleDiv(tSpan);
                tParent.appendChild(tSpan);
            } else {
                tSpan = document.createElementNS(svgNS,'text');
            }
        }
        //tSpan.setAttribute('visibility', 'hidden');
        if(this.globalData.fontManager.chars){
            var charData = this.globalData.fontManager.getCharData(documentData.t.charAt(i), fontData.fStyle, this.globalData.fontManager.getFontByName(documentData.f).fFamily);
            var shapeData;
            if(charData){
                shapeData = charData.data;
            } else {
                shapeData = null;
            }
            matrixHelper.reset();
            if(shapeData && shapeData.shapes){
                shapes = shapeData.shapes[0].it;
                matrixHelper.scale(documentData.s/100,documentData.s/100);
                shapeStr = this.createPathShape(matrixHelper,shapes);
                tSpan.setAttribute('d',shapeStr);
            }
            if(!this.isMasked){
                this.innerElem.appendChild(tParent);
                var scale = documentData.s/100;
                if(shapeData && shapeData.shapes){
                    var rBound = Math.ceil(shapeData.bounds.r*scale);
                    var tBound = Math.floor(shapeData.bounds.t*scale);
                    var lBound = Math.floor(shapeData.bounds.l*scale);
                    var bBound = Math.ceil(shapeData.bounds.b*scale);
                    tCont.setAttribute('width',rBound - lBound);
                    tCont.setAttribute('height',bBound - tBound);
                    tCont.setAttribute('viewBox',lBound+' '+tBound+' '+(rBound - lBound)+' '+(bBound - tBound));
                    tCont.style.transform = tCont.style.webkitTransform = 'translate('+lBound+'px,'+ tBound+'px)';
                    letters[i].yOffset = tBound;
                } else{
                    tCont.setAttribute('width',1);
                    tCont.setAttribute('height',1);
                }
            }else{
                this.innerElem.appendChild(tSpan);
            }
        }else{
            tSpan.textContent = letters[i].val;
            tSpan.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space","preserve");
            if(!this.isMasked){
                this.innerElem.appendChild(tParent);
                //
                tSpan.style.transform = tSpan.style.webkitTransform = 'translate3d(0,'+ -documentData.s/1.2+'px,0)';
            } else {
                this.innerElem.appendChild(tSpan);
            }
        }
        //
        if(!this.isMasked){
            this.textSpans.push(tParent);
        }else{
            this.textSpans.push(tSpan);
        }
        this.textPaths.push(tSpan);
    }
};

HTextElement.prototype.hide = SVGTextElement.prototype.hide;

HTextElement.prototype.renderFrame = function(parentMatrix){

    var renderParent = this.parent.renderFrame.call(this,parentMatrix);
    if(renderParent===false){
        this.hide();
        return;
    }
    if(this.hidden){
        this.hidden = false;
        this.innerElem.style.display = 'block';
    }

    if(this.data.singleShape){
        if(!this.firstFrame){
            return;
        } else {
            // Todo Benchmark if using this is better than getBBox
             if(this.isMasked && this.finalTransform.matMdf){
                 this.cont.setAttribute('viewBox',-this.finalTransform.mProp.p.v[0]+' '+ -this.finalTransform.mProp.p.v[1]+' '+this.compW+' '+this.compH);
                this.cont.style.transform = this.cont.style.webkitTransform = 'translate(' + -this.finalTransform.mProp.p.v[0] + 'px,' + -this.finalTransform.mProp.p.v[1] + 'px)';
             }
        }
    }

    this.getMeasures();
    if(!this.lettersChangedFlag){
        return;
    }
    var  i,len;
    var renderedLetters = this.renderedLetters;

    var letters = this.data.t.d.l;

    len = letters.length;
    var renderedLetter;
    for(i=0;i<len;i+=1){
        if(letters[i].n){
            continue;
        }
        renderedLetter = renderedLetters[i];
        if(!this.isMasked){
            this.textSpans[i].style.transform = this.textSpans[i].style.webkitTransform = renderedLetter.m;
        }else{
            this.textSpans[i].setAttribute('transform',renderedLetter.m);
        }
        ////this.textSpans[i].setAttribute('opacity',renderedLetter.o);
        this.textSpans[i].style.opacity = renderedLetter.o;
        if(renderedLetter.sw){
            this.textPaths[i].setAttribute('stroke-width',renderedLetter.sw);
        }
        if(renderedLetter.sc){
            this.textPaths[i].setAttribute('stroke',renderedLetter.sc);
        }
        if(renderedLetter.fc){
            this.textPaths[i].setAttribute('fill',renderedLetter.fc);
            this.textPaths[i].style.color = renderedLetter.fc;
        }
    }
    if(this.isMasked){

        var boundingBox = this.innerElem.getBBox();
        if(this.currentBBox.w !== boundingBox.width){
            this.currentBBox.w = boundingBox.width;
            this.cont.setAttribute('width',boundingBox.width);
        }
        if(this.currentBBox.h !== boundingBox.height){
            this.currentBBox.h = boundingBox.height;
            this.cont.setAttribute('height',boundingBox.height);
        }
        if(this.currentBBox.w !== boundingBox.width || this.currentBBox.h !== boundingBox.height  || this.currentBBox.x !== boundingBox.x  || this.currentBBox.y !== boundingBox.y){
            this.currentBBox.w = boundingBox.width;
            this.currentBBox.h = boundingBox.height;
            this.currentBBox.x = boundingBox.x;
            this.currentBBox.y = boundingBox.y;

            this.cont.setAttribute('viewBox',this.currentBBox.x+' '+this.currentBBox.y+' '+this.currentBBox.w+' '+this.currentBBox.h);
            this.cont.style.transform = this.cont.style.webkitTransform = 'translate(' + this.currentBBox.x + 'px,' + this.currentBBox.y + 'px)';
        }
    }
    if(this.firstFrame){
        this.firstFrame = false;
    }
}


HTextElement.prototype.destroy = SVGTextElement.prototype.destroy;
function HImageElement(data,parentContainer,globalData,comp, placeholder){
    this.assetData = globalData.getAssetData(data.refId);
    this.path = globalData.getPath();
    this.parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
}
createElement(HBaseElement, HImageElement);

HImageElement.prototype.createElements = function(){

    var imageLoaded = function(){
        this.imageElem.setAttributeNS('http://www.w3.org/1999/xlink','href',this.path+this.assetData.p);
    };

    var img = new Image();

    var parent;
    if(this.data.hasMask){
        var parent = document.createElement('div');
        styleDiv(parent);
        var cont = document.createElementNS(svgNS,'svg');
        cont.setAttribute('width',this.assetData.w);
        cont.setAttribute('height',this.assetData.h);
        parent.appendChild(cont);
        this.imageElem = document.createElementNS(svgNS,'image');
        this.imageElem.setAttribute('width',this.assetData.w+"px");
        this.imageElem.setAttribute('height',this.assetData.h+"px");
        cont.appendChild(this.imageElem);
        this.layerElement = parent;
        this.parentContainer.appendChild(parent);
        this.innerElem = parent;
        this.maskedElement = this.imageElem;
        img.addEventListener('load', imageLoaded.bind(this), false);
        img.addEventListener('error', imageLoaded.bind(this), false);
    } else {
        styleDiv(img);
        this.layerElement = img;
        this.parentContainer.appendChild(img);
        this.innerElem = img;
    }
    img.src = this.path+this.assetData.p;
    if(this.data.ln){
        this.innerElem.setAttribute('id',this.data.ln);
    }
};



HImageElement.prototype.hide = HSolidElement.prototype.hide;

HImageElement.prototype.renderFrame = HSolidElement.prototype.renderFrame;

HImageElement.prototype.destroy = HSolidElement.prototype.destroy;
function HCameraElement(data,parentContainer,globalData,comp, placeholder){
    this.parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
    this.pe = PropertyFactory.getProp(this,data.pe,0,0,this.dynamicProperties);
    if(data.ks.p.s){
        this.px = PropertyFactory.getProp(this,data.ks.p.x,1,0,this.dynamicProperties);
        this.py = PropertyFactory.getProp(this,data.ks.p.y,1,0,this.dynamicProperties);
        this.pz = PropertyFactory.getProp(this,data.ks.p.z,1,0,this.dynamicProperties);
    }else{
        this.p = PropertyFactory.getProp(this,data.ks.p,1,0,this.dynamicProperties);
    }
    if(data.ks.a){
        this.a = PropertyFactory.getProp(this,data.ks.a,1,0,this.dynamicProperties);
    }
    if(data.ks.or.k.length){
        var i,len = data.ks.or.k.length;
        for(i=0;i<len;i+=1){
            data.ks.or.k[i].to = null;
            data.ks.or.k[i].ti = null;
        }
    }
    this.or = PropertyFactory.getProp(this,data.ks.or,1,degToRads,this.dynamicProperties);
    this.or.sh = true;
    this.rx = PropertyFactory.getProp(this,data.ks.rx,0,degToRads,this.dynamicProperties);
    this.ry = PropertyFactory.getProp(this,data.ks.ry,0,degToRads,this.dynamicProperties);
    this.rz = PropertyFactory.getProp(this,data.ks.rz,0,degToRads,this.dynamicProperties);
    this.mat = new Matrix();
}
createElement(HBaseElement, HCameraElement);

HCameraElement.prototype.setup = function() {
    var i, len = this.comp.threeDElements.length, comp;
    for(i=0;i<len;i+=1){
        comp = this.comp.threeDElements[i];
        comp[0].style.perspective = comp[0].style.webkitPerspective = this.pe.v+'px';
        comp[1].style.transformOrigin = comp[1].style.mozTransformOrigin = comp[1].style.webkitTransformOrigin = "0px 0px 0px";
        comp[0].style.transform = comp[0].style.webkitTransform = 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)';
    }
};

HCameraElement.prototype.createElements = function(){
};

HCameraElement.prototype.hide = function(){
};

HCameraElement.prototype.renderFrame = function(){
    var mdf = this.firstFrame;
    var i, len;
    if(this.hierarchy){
        len = this.hierarchy.length;
        for(i=0;i<len;i+=1){
            mdf = this.hierarchy[i].finalTransform.mProp.mdf ? true : mdf;
        }
    }
    if(mdf || (this.p && this.p.mdf) || (this.px && (this.px.mdf || this.py.mdf || this.pz.mdf)) || this.rx.mdf || this.ry.mdf || this.rz.mdf || this.or.mdf || (this.a && this.a.mdf)) {
        this.mat.reset();

        if(this.p){
            this.mat.translate(-this.p.v[0],-this.p.v[1],this.p.v[2]);
        }else{
            this.mat.translate(-this.px.v,-this.py.v,this.pz.v);
        }
        if(this.a){
            var diffVector = [this.p.v[0]-this.a.v[0],this.p.v[1]-this.a.v[1],this.p.v[2]-this.a.v[2]];
            var mag = Math.sqrt(Math.pow(diffVector[0],2)+Math.pow(diffVector[1],2)+Math.pow(diffVector[2],2));
            //var lookDir = getNormalizedPoint(getDiffVector(this.a.v,this.p.v));
            var lookDir = [diffVector[0]/mag,diffVector[1]/mag,diffVector[2]/mag];
            var lookLengthOnXZ = Math.sqrt( lookDir[2]*lookDir[2] + lookDir[0]*lookDir[0] );
            var m_rotationX = (Math.atan2( lookDir[1], lookLengthOnXZ ));
            var m_rotationY = (Math.atan2( lookDir[0], -lookDir[2]));
            this.mat.rotateY(m_rotationY).rotateX(-m_rotationX);

        }
        this.mat.rotateX(-this.rx.v).rotateY(-this.ry.v).rotateZ(this.rz.v);
        this.mat.rotateX(-this.or.v[0]).rotateY(-this.or.v[1]).rotateZ(this.or.v[2]);
        this.mat.translate(this.globalData.compSize.w/2,this.globalData.compSize.h/2,0);
        this.mat.translate(0,0,this.pe.v);
        if(this.hierarchy){
            var mat;
            len = this.hierarchy.length;
            for(i=0;i<len;i+=1){
                mat = this.hierarchy[i].finalTransform.mProp.iv.props;
                this.mat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5],mat[6],mat[7],mat[8],mat[9],mat[10],mat[11],-mat[12],-mat[13],mat[14],mat[15]);
            }
        }
        len = this.comp.threeDElements.length;
        var comp;
        for(i=0;i<len;i+=1){
            comp = this.comp.threeDElements[i];
            comp[1].style.transform = comp[1].style.webkitTransform = this.mat.toCSS();
        }
    }
    this.firstFrame = false;
};

HCameraElement.prototype.destroy = function(){
};
var animationManager = (function(){
    var moduleOb = {};
    var registeredAnimations = [];
    var initTime = 0;
    var isPaused = true;
    var len = 0;

    function removeElement(ev){
        var i = 0;
        var animItem = ev.target;
        animItem.removeEventListener('destroy',removeElement);
        while(i<len) {
            if (registeredAnimations[i].animation === animItem) {
                registeredAnimations.splice(i, 1);
                i -= 1;
                len -= 1;
            }
            i += 1;
        }
    }

    function registerAnimation(element, animationData){
        if(!element){
            return null;
        }
        var i=0;
        while(i<len){
            if(registeredAnimations[i].elem == element && registeredAnimations[i].elem !== null ){
                return registeredAnimations[i].animation;
            }
            i+=1;
        }
        var animItem = new AnimationItem();
        animItem.setData(element, animationData);
        animItem.addEventListener('destroy',removeElement);
        registeredAnimations.push({elem: element,animation:animItem});
        len += 1;
        return animItem;
    }

    function loadAnimation(params){
        var animItem = new AnimationItem();
        animItem.setParams(params);
        animItem.addEventListener('destroy',removeElement);
        registeredAnimations.push({elem: null,animation:animItem});
        len += 1;
        return animItem;
    }


    function setSpeed(val,animation){
        var i;
        for(i=0;i<len;i+=1){
            registeredAnimations[i].animation.setSpeed(val, animation);
        }
    }

    function setDirection(val, animation){
        var i;
        for(i=0;i<len;i+=1){
            registeredAnimations[i].animation.setDirection(val, animation);
        }
    }

    function play(animation){
        var i;
        for(i=0;i<len;i+=1){
            registeredAnimations[i].animation.play(animation);
        }
    }

    function moveFrame (value, animation) {
        isPaused = false;
        initTime = Date.now();
        var i;
        for(i=0;i<len;i+=1){
            registeredAnimations[i].animation.moveFrame(value,animation);
        }
    }

    function resume(nowTime) {

        var elapsedTime = nowTime - initTime;
        var i;
        for(i=0;i<len;i+=1){
            registeredAnimations[i].animation.advanceTime(elapsedTime);
        }
        initTime = nowTime;
        requestAnimationFrame(resume);


    }

    function first(nowTime){
        initTime = nowTime;
        requestAnimationFrame(resume);
    }

    function pause(animation) {
        var i;
        for(i=0;i<len;i+=1){
            registeredAnimations[i].animation.pause(animation);
        }
    }

    function goToAndStop(value,isFrame,animation) {
        var i;
        for(i=0;i<len;i+=1){
            registeredAnimations[i].animation.goToAndStop(value,isFrame,animation);
        }
    }

    function stop(animation) {
        var i;
        for(i=0;i<len;i+=1){
            registeredAnimations[i].animation.stop(animation);
        }
    }

    function togglePause(animation) {
        var i;
        for(i=0;i<len;i+=1){
            registeredAnimations[i].animation.togglePause(animation);
        }
    }

    function destroy(animation) {
        var i;
        for(i=0;i<len;i+=1){
            registeredAnimations[i].animation.destroy(animation);
        }
    }

    function searchAnimations(animationData, standalone, renderer){
        var animElements = document.getElementsByClassName('bodymovin');
        var i, len = animElements.length;
        for(i=0;i<len;i+=1){
            if(renderer){
                animElements[i].setAttribute('data-bm-type',renderer);
            }
            registerAnimation(animElements[i], animationData);
        }
        if(standalone && len === 0){
            if(!renderer){
                renderer = 'svg';
            }
            var body = document.getElementsByTagName('body')[0];
            body.innerHTML = '';
            var div = document.createElement('div');
            div.style.width = '100%';
            div.style.height = '100%';
            div.setAttribute('data-bm-type',renderer);
            body.appendChild(div);
            registerAnimation(div, animationData);
        }
    }

    function resize(){
        var i;
        for(i=0;i<len;i+=1){
            registeredAnimations[i].animation.resize();
        }
    }

    function start(){
        requestAnimationFrame(first);
    }
    //start();

    setTimeout(start,0);

    moduleOb.registerAnimation = registerAnimation;
    moduleOb.loadAnimation = loadAnimation;
    moduleOb.setSpeed = setSpeed;
    moduleOb.setDirection = setDirection;
    moduleOb.play = play;
    moduleOb.moveFrame = moveFrame;
    moduleOb.pause = pause;
    moduleOb.stop = stop;
    moduleOb.togglePause = togglePause;
    moduleOb.searchAnimations = searchAnimations;
    moduleOb.resize = resize;
    moduleOb.start = start;
    moduleOb.goToAndStop = goToAndStop;
    moduleOb.destroy = destroy;
    return moduleOb;
}());
var AnimationItem = function () {
    this._cbs = [];
    this.name = '';
    this.path = '';
    this.isLoaded = false;
    this.currentFrame = 0;
    this.currentRawFrame = 0;
    this.totalFrames = 0;
    this.frameRate = 0;
    this.frameMult = 0;
    this.playSpeed = 1;
    this.playDirection = 1;
    this.pendingElements = 0;
    this.playCount = 0;
    this.prerenderFramesFlag = true;
    this.repeat = 'indefinite';
    this.animationData = {};
    this.layers = [];
    this.assets = [];
    this.isPaused = true;
    this.isScrolling = false;
    this.autoplay = false;
    this.loop = true;
    this.renderer = null;
    this.animationID = randomString(10);
    this.renderedFrameCount = 0;
    this.scaleMode = 'fit';
    this.math = Math;
    this.removed = false;
    this.timeCompleted = 0;
    this.segmentPos = 0;
    this.segments = [];
};

AnimationItem.prototype.setParams = function(params) {
    var self = this;
    if(params.context){
        this.context = params.context;
    }
    if(params.wrapper || params.container){
        this.wrapper = params.wrapper || params.container;
    }
    var animType = params.animType ? params.animType : params.renderer ? params.renderer : 'canvas';
    switch(animType){
        case 'canvas':
            this.renderer = new CanvasRenderer(this, params.rendererSettings);
            break;
        case 'svg':
            this.renderer = new SVGRenderer(this, params.rendererSettings);
            break;
        case 'hybrid':
        case 'html':
        default:
            this.renderer = new HybridRenderer(this, params.rendererSettings);
            break;
    }
    this.animType = animType;

    if(params.loop === '' || params.loop === null){
    }else if(params.loop === false){
        this.loop = false;
    }else if(params.loop === true){
        this.loop = true;
    }else{
        this.loop = parseInt(params.loop);
    }
    this.autoplay = 'autoplay' in params ? params.autoplay : true;
    this.name = params.name ? params.name :  '';
    this.prerenderFramesFlag = 'prerender' in params ? params.prerender : true;
    if(params.animationData){
        self.configAnimation(params.animationData);
    }else if(params.path){
        if(params.path.substr(-4) != 'json'){
            if (params.path.substr(-1, 1) != '/') {
                params.path += '/';
            }
            params.path += 'data.json';
        }

        var xhr = new XMLHttpRequest();
        if(params.path.lastIndexOf('\\') != -1){
            this.path = params.path.substr(0,params.path.lastIndexOf('\\')+1);
        }else{
        this.path = params.path.substr(0,params.path.lastIndexOf('/')+1);
        }
        this.fileName = params.path.substr(params.path.lastIndexOf('/')+1);
        this.fileName = this.fileName.substr(0,this.fileName.lastIndexOf('.json'));
        xhr.open('GET', params.path, true);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if(xhr.status == 200){
                    self.configAnimation(JSON.parse(xhr.responseText));
                }else{
                    try{
                        var response = JSON.parse(xhr.responseText);
                        self.configAnimation(response);
                    }catch(err){
                    }
                }
            }
        };
    }
};

AnimationItem.prototype.setData = function (wrapper, animationData) {
    var params = {
        wrapper: wrapper,
        animationData: animationData ? JSON.parse(animationData) : null
    };
    var wrapperAttributes = wrapper.attributes;

    params.path = wrapperAttributes.getNamedItem('data-animation-path') ? wrapperAttributes.getNamedItem('data-animation-path').value : wrapperAttributes.getNamedItem('data-bm-path') ? wrapperAttributes.getNamedItem('data-bm-path').value :  wrapperAttributes.getNamedItem('bm-path') ? wrapperAttributes.getNamedItem('bm-path').value : '';
    params.animType = wrapperAttributes.getNamedItem('data-anim-type') ? wrapperAttributes.getNamedItem('data-anim-type').value : wrapperAttributes.getNamedItem('data-bm-type') ? wrapperAttributes.getNamedItem('data-bm-type').value : wrapperAttributes.getNamedItem('bm-type') ? wrapperAttributes.getNamedItem('bm-type').value :  wrapperAttributes.getNamedItem('data-bm-renderer').value ? wrapperAttributes.getNamedItem('data-bm-renderer').value : wrapperAttributes.getNamedItem('bm-renderer').value ? wrapperAttributes.getNamedItem('bm-renderer').value : 'canvas';

    var loop = wrapperAttributes.getNamedItem('data-anim-loop') ? wrapperAttributes.getNamedItem('data-anim-loop').value :  wrapperAttributes.getNamedItem('data-bm-loop') ? wrapperAttributes.getNamedItem('data-bm-loop').value :  wrapperAttributes.getNamedItem('bm-loop') ? wrapperAttributes.getNamedItem('bm-loop').value : '';
    if(loop === ''){
    }else if(loop === 'false'){
        params.loop = false;
    }else if(loop === 'true'){
        params.loop = true;
    }else{
        params.loop = parseInt(loop);
    }

    params.name = wrapperAttributes.getNamedItem('data-name') ? wrapperAttributes.getNamedItem('data-name').value :  wrapperAttributes.getNamedItem('data-bm-name') ? wrapperAttributes.getNamedItem('data-bm-name').value : wrapperAttributes.getNamedItem('bm-name') ? wrapperAttributes.getNamedItem('bm-name').value :  '';
    var prerender = wrapperAttributes.getNamedItem('data-anim-prerender') ? wrapperAttributes.getNamedItem('data-anim-prerender').value :  wrapperAttributes.getNamedItem('data-bm-prerender') ? wrapperAttributes.getNamedItem('data-bm-prerender').value :  wrapperAttributes.getNamedItem('bm-prerender') ? wrapperAttributes.getNamedItem('bm-prerender').value : '';

    if(prerender === 'false'){
        params.prerender = false;
    }
    this.setParams(params);
};

AnimationItem.prototype.includeLayers = function(data) {
    var layers = this.animationData.layers;
    var i, len = layers.length;
    var newLayers = data.layers;
    var j, jLen = newLayers.length;
    for(j=0;j<jLen;j+=1){
        if(!newLayers[j].id){
            if(this.animType == 'svg' || this.animType == 'html'){
                layers.push(newLayers[j]);
            }else{
                layers.unshift(newLayers[j]);
            }
        }else{
            i = 0;
            while(i<len){
                if(layers[i].id == newLayers[j].id){
                    layers[i] = newLayers[j];
                    break;
                }
                i += 1;
            }
        }
    }
    if(data.chars || data.fonts){
        this.renderer.globalData.fontManager.addChars(data.chars);
        this.renderer.globalData.fontManager.addFonts(data.fonts, this.renderer.globalData.defs);
    }

    if(data.assets){
        len = data.assets.length;
        for(i = 0; i < len; i += 1){
            this.animationData.assets.push(data.assets[i]);
        }
    }

    dataManager.completeData(this.animationData,this.renderer.globalData.fontManager);
    this.renderer.includeLayers(data.layers);
    this.renderer.buildStage(this.container, this.layers);
    this.renderer.renderFrame(null);
    this.loadNextSegment();
};

AnimationItem.prototype.loadNextSegment = function() {
    var segments = this.animationData.segments;
    if(!segments || segments.length === 0){
        this.trigger('data_ready');
        this.timeCompleted = this.animationData.tf;
        return;
    }
    var segment = segments.shift();
    this.timeCompleted = segment.time * this.frameRate;
    var xhr = new XMLHttpRequest();
    var self = this;
    var segmentPath = this.path+this.fileName+'_' + this.segmentPos + '.json';
    this.segmentPos += 1;
    xhr.open('GET', segmentPath, true);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if(xhr.status == 200){
                self.includeLayers(JSON.parse(xhr.responseText));
            }else{
                try{
                    var response = JSON.parse(xhr.responseText);
                    self.includeLayers(response);
                }catch(err){
                }
            }
        }
    };
};

AnimationItem.prototype.loadSegments = function() {
    var segments = this.animationData.segments;
    if(!segments) {
        this.timeCompleted = this.animationData.tf;
    }
    this.loadNextSegment();
};

AnimationItem.prototype.configAnimation = function (animData) {
    this.animationData = animData;
    this.totalFrames = Math.floor(this.animationData.op - this.animationData.ip);
    this.animationData.tf = this.totalFrames;
    this.renderer.configAnimation(animData);
    if(!animData.assets){
        animData.assets = [];
    }
    if(animData.comps) {
        animData.assets = animData.assets.concat(animData.comps);
        animData.comps = null;
    }

    this.animationData._id = this.animationID;
    this.animationData._animType = this.animType;
    this.layers = this.animationData.layers;
    this.assets = this.animationData.assets;
    this.frameRate = this.animationData.fr;
    this.firstFrame = Math.round(this.animationData.ip);
    this.frameMult = this.animationData.fr / 1000;
    /*
    this.firstFrame = 0;
    this.totalFrames = 205;
    this.animationData.tf = 205;
    //this.frameMult = 1/100;
    //*/////
    this.trigger('config_ready');
    this.loadSegments();
    this.updaFrameModifier();
    if(this.renderer.globalData.fontManager){
        this.waitForFontsLoaded();
    }else{
        dataManager.completeData(this.animationData,this.renderer.globalData.fontManager);
        this.checkLoaded();
    }
};

AnimationItem.prototype.waitForFontsLoaded = (function(){
    function checkFontsLoaded(){
        if(this.renderer.globalData.fontManager.loaded){
            dataManager.completeData(this.animationData,this.renderer.globalData.fontManager);
            this.renderer.buildItems(this.animationData.layers);
            this.checkLoaded();
        }else{
            setTimeout(checkFontsLoaded.bind(this),20);
        }
    }

    return function(){
        checkFontsLoaded.bind(this)();
    }
}());

AnimationItem.prototype.elementLoaded = function () {
    this.pendingElements--;
    this.checkLoaded();
};

AnimationItem.prototype.checkLoaded = function () {
    if (this.pendingElements === 0) {
        this.renderer.buildStage(this.container, this.layers);
        this.isLoaded = true;
        this.gotoFrame();
        if(this.autoplay){
            this.play();
        }
    }
};

AnimationItem.prototype.resize = function () {
    this.renderer.updateContainerSize();
};

AnimationItem.prototype.gotoFrame = function () {
    if(subframeEnabled){
        this.currentFrame = this.currentRawFrame;
    }else{
        this.currentFrame = this.math.floor(this.currentRawFrame);
    }

    if(this.timeCompleted !== this.totalFrames && this.currentFrame > this.timeCompleted){
        this.currentFrame = this.timeCompleted;
    }
    this.trigger('enterFrame');
    this.renderFrame();
};

AnimationItem.prototype.renderFrame = function () {
    if(this.isLoaded === false){
        return;
    }
    this.renderer.renderFrame(this.currentFrame + this.firstFrame);
};

AnimationItem.prototype.play = function (name) {
    if(name && this.name != name){
        return;
    }
    if(this.isPaused === true){
        this.isPaused = false;
    }
};

AnimationItem.prototype.pause = function (name) {
    if(name && this.name != name){
        return;
    }
    if(this.isPaused === false){
        this.isPaused = true;
    }
};

AnimationItem.prototype.togglePause = function (name) {
    if(name && this.name != name){
        return;
    }
    if(this.isPaused === true){
        this.isPaused = false;
        this.play();
    }else{
        this.isPaused = true;
        this.pause();
    }
};

AnimationItem.prototype.stop = function (name) {
    if(name && this.name != name){
        return;
    }
    this.isPaused = true;
    this.currentFrame = this.currentRawFrame = 0;
    this.playCount = 0;
    this.gotoFrame();
};

AnimationItem.prototype.goToAndStop = function (value, isFrame, name) {
    if(name && this.name != name){
        return;
    }
    if(isFrame){
        this.setCurrentRawFrameValue(value);
    }else{
        this.setCurrentRawFrameValue(value * this.frameModifier);
    }
    this.isPaused = true;
};

AnimationItem.prototype.advanceTime = function (value) {
    if (this.isPaused === true || this.isScrolling === true || this.isLoaded === false) {
        return;
    }
    this.setCurrentRawFrameValue(this.currentRawFrame + value * this.frameModifier);
};

AnimationItem.prototype.updateAnimation = function (perc) {
    this.setCurrentRawFrameValue(this.totalFrames * perc);
};

AnimationItem.prototype.moveFrame = function (value, name) {
    if(name && this.name != name){
        return;
    }
    this.setCurrentRawFrameValue(this.currentRawFrame+value);
};

AnimationItem.prototype.adjustSegment = function(arr){
    this.totalFrames = arr[1] - arr[0];
    this.firstFrame = arr[0];
    this.trigger('segmentStart');
};

AnimationItem.prototype.playSegments = function (arr,forceFlag) {
    if(typeof arr[0] === 'object'){
        var i, len = arr.length;
        for(i=0;i<len;i+=1){
            this.segments.push(arr[i]);
        }
    }else{
        this.segments.push(arr);
    }
    if(forceFlag){
        this.adjustSegment(this.segments.shift());
        this.setCurrentRawFrameValue(0);
    }
    if(this.isPaused){
        this.play();
    }
};

AnimationItem.prototype.resetSegments = function (forceFlag) {
    this.segments.length = 0;
    this.segments.push([this.animationData.ip*this.frameRate,Math.floor(this.animationData.op - this.animationData.ip+this.animationData.ip*this.frameRate)]);
    if(forceFlag){
        this.adjustSegment(this.segments.shift());
    }
};

AnimationItem.prototype.remove = function (name) {
    if(name && this.name != name){
        return;
    }
    this.renderer.destroy();
};

AnimationItem.prototype.destroy = function (name) {
    if((name && this.name != name) || (this.renderer && this.renderer.destroyed)){
        return;
    }
    this.renderer.destroy();
    this.trigger('destroy');
    this._cbs = null;
};

AnimationItem.prototype.setCurrentRawFrameValue = function(value){
    this.currentRawFrame = value;
    var newSegment = false;
    if (this.currentRawFrame >= this.totalFrames) {
        if(this.segments.length){
            newSegment = true;
        }
        if(this.loop === false){
            this.currentRawFrame = this.totalFrames - 0.01;
            this.gotoFrame();
            this.pause();
            this.trigger('complete');
            return;
        }else{
            this.trigger('loopComplete');
            this.playCount += 1;
            if(this.loop !== true){
                if(this.playCount == this.loop){
                    this.currentRawFrame = this.totalFrames - 0.01;
                    this.gotoFrame();
                    this.pause();
                    this.trigger('complete');
                    return;
                }
            }
        }
    } else if (this.currentRawFrame < 0) {
        this.playCount -= 1;
        if(this.playCount < 0){
            this.playCount = 0;
        }
        if(this.loop === false){
            this.currentRawFrame = 0;
            this.gotoFrame();
            this.pause();
            this.trigger('complete');
            return;
        }else{
            this.trigger('loopComplete');
            this.currentRawFrame = this.totalFrames + this.currentRawFrame;
            this.gotoFrame();
            return;
        }
    }


    if(newSegment){
        var offset = this.currentRawFrame % this.totalFrames;
        this.adjustSegment(this.segments.shift());
        this.currentRawFrame = offset;
    }else{
        this.currentRawFrame = this.currentRawFrame % this.totalFrames;
    }
    this.gotoFrame();
};

AnimationItem.prototype.setSpeed = function (val) {
    this.playSpeed = val;
    this.updaFrameModifier();
};

AnimationItem.prototype.setDirection = function (val) {
    this.playDirection = val < 0 ? -1 : 1;
    this.updaFrameModifier();
};

AnimationItem.prototype.updaFrameModifier = function () {
    this.frameModifier = this.frameMult * this.playSpeed * this.playDirection;
};

AnimationItem.prototype.getPath = function () {
    return this.path;
};

AnimationItem.prototype.getAssetData = function (id) {
    var i = 0, len = this.assets.length;
    while (i < len) {
        if(id == this.assets[i].id){
            return this.assets[i];
        }
        i += 1;
    }
};

AnimationItem.prototype.getAssets = function () {
    return this.assets;
};

AnimationItem.prototype.trigger = function(name){
    if(this._cbs[name]){
        switch(name){
            case 'enterFrame':
                this.triggerEvent(name,new BMEnterFrameEvent(name,this.currentFrame,this.totalFrames,this.frameMult));
                break;
            case 'loopComplete':
                this.triggerEvent(name,new BMCompleteLoopEvent(name,this.loop,this.playCount,this.frameMult));
                break;
            case 'complete':
                this.triggerEvent(name,new BMCompleteEvent(name,this.frameMult));
                break;
            case 'segmentStart':
                this.triggerEvent(name,new BMSegmentStartEvent(name,this.firstFrame,this.totalFrames));
                break;
            case 'destroy':
                this.triggerEvent(name,new BMDestroyEvent(name,this));
                break;
            default:
                this.triggerEvent(name);
        }
    }
    if(name === 'enterFrame' && this.onEnterFrame){
        this.onEnterFrame.call(this,new BMEnterFrameEvent(name,this.currentFrame,this.totalFrames,this.frameMult));
    }
    if(name === 'loopComplete' && this.onLoopComplete){
        this.onLoopComplete.call(this,new BMCompleteLoopEvent(name,this.loop,this.playCount,this.frameMult));
    }
    if(name === 'complete' && this.onComplete){
        this.onComplete.call(this,new BMCompleteEvent(name,this.frameMult));
    }
    if(name === 'segmentStart' && this.onSegmentStart){
        this.onSegmentStart.call(this,new BMSegmentStartEvent(name,this.firstFrame,this.totalFrames));
    }
    if(name === 'destroy' && this.onDestroy){
        this.onDestroy.call(this,new BMDestroyEvent(name,this));
    }
};

AnimationItem.prototype.addEventListener = _addEventListener;
AnimationItem.prototype.removeEventListener = _removeEventListener;
AnimationItem.prototype.triggerEvent = _triggerEvent;

(function (window){

    var bodymovinjs = {};

    function play(animation){
        animationManager.play(animation);
    }
    function pause(animation){
        animationManager.pause(animation);
    }
    function togglePause(animation){
        animationManager.togglePause(animation);
    }
    function setSpeed(value,animation){
        animationManager.setSpeed(value, animation);
    }
    function setDirection(value,animation){
        animationManager.setDirection(value, animation);
    }
    function stop(animation){
        animationManager.stop(animation);
    }
    function moveFrame(value){
        animationManager.moveFrame(value);
    }
    function searchAnimations(){
        if(standalone === true){
            animationManager.searchAnimations(animationData,standalone, renderer);
        }else{
            animationManager.searchAnimations();
        }
    }
    function registerAnimation(elem){
        return animationManager.registerAnimation(elem);
    }
    function resize(){
        animationManager.resize();
    }
    function start(){
        animationManager.start();
    }
    function goToAndStop(val,isFrame, animation){
        animationManager.goToAndStop(val,isFrame, animation);
    }
    function setSubframeRendering(flag){
        subframeEnabled = flag;
    }
    function loadAnimation(params){
        if(standalone === true){
            params.animationData = JSON.parse(animationData);
        }
        return animationManager.loadAnimation(params);
    }
    function destroy(animation){
        return animationManager.destroy(animation);
    }
    function setQuality(value){
        if(typeof value === 'string'){
            switch(value){
                case 'high':
                    defaultCurveSegments = 200;
                    break;
                case 'medium':
                    defaultCurveSegments = 50;
                    break;
                case 'low':
                    defaultCurveSegments = 10;
                    break;
            }
        }else if(!isNaN(value) && value > 1){
            defaultCurveSegments = value;
        }
        if(defaultCurveSegments >= 50){
            roundValues(false);
        }else{
            roundValues(true);
        }

    }

    bodymovinjs.play = play;
    bodymovinjs.pause = pause;
    bodymovinjs.togglePause = togglePause;
    bodymovinjs.setSpeed = setSpeed;
    bodymovinjs.setDirection = setDirection;
    bodymovinjs.stop = stop;
    bodymovinjs.moveFrame = moveFrame;
    bodymovinjs.searchAnimations = searchAnimations;
    bodymovinjs.registerAnimation = registerAnimation;
    bodymovinjs.loadAnimation = loadAnimation;
    bodymovinjs.setSubframeRendering = setSubframeRendering;
    bodymovinjs.resize = resize;
    bodymovinjs.start = start;
    bodymovinjs.goToAndStop = goToAndStop;
    bodymovinjs.destroy = destroy;
    bodymovinjs.setQuality = setQuality;
    bodymovinjs.version = '4.0.5';

    function checkReady(){
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);
                searchAnimations();
        }
    }

    function getQueryVariable(variable) {
        var vars = queryString.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) == variable) {
                return decodeURIComponent(pair[1]);
            }
        }
    }

    bodymovinjs.checkReady = checkReady;

    window.bodymovin = bodymovinjs;

    var standalone = '__[STANDALONE]__';
    var animationData = '__[ANIMATIONDATA]__';

    var renderer = '';
    if(standalone) {
        var scripts = document.getElementsByTagName('script');
        var index = scripts.length - 1;
        var myScript = scripts[index];
        var queryString = myScript.src.replace(/^[^\?]+\??/,'');
        renderer = getQueryVariable('renderer');
    }

    var readyStateCheckInterval = setInterval(checkReady, 100);

}(window));}(window));