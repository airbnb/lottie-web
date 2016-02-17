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

function rgbToHSL(color){

    var r = color[0] / 255,
        g = color[1] / 255,
        b = color[2] / 255,
        cMax = Math.max(r, g, b),
        cMin = Math.min(r, g, b),
        delta = cMax - cMin,
        l = (cMax + cMin) / 2,
        h = 0,
        s = 0;

    if (delta == 0) {
        h = 0;
    }
    else if (cMax == r) {
        h = 60 * (((g - b) / delta) % 6);
    }
    else if (cMax == g) {
        h = 60 * (((b - r) / delta) + 2);
    }
    else {
        h = 60 * (((r - g) / delta) + 4);
    }

    if (delta == 0) {
        s = 0;
    }
    else {
        s = (delta/(1-Math.abs(2*l - 1)))
    }

    return [h,s,l];
}

function hslToRGB(h,s,l) {
    var c = (1 - Math.abs(2*l - 1)) * s,
        x = c * ( 1 - Math.abs((h / 60 ) % 2 - 1 )),
        m = l - c/ 2,
        r, g, b;

    if (h < 60) {
        r = c;
        g = x;
        b = 0;
    }
    else if (h < 120) {
        r = x;
        g = c;
        b = 0;
    }
    else if (h < 180) {
        r = 0;
        g = c;
        b = x;
    }
    else if (h < 240) {
        r = 0;
        g = x;
        b = c;
    }
    else if (h < 300) {
        r = x;
        g = 0;
        b = c;
    }
    else {
        r = c;
        g = 0;
        b = x;
    }

    r = normalize_rgb_value(r, m);
    g = normalize_rgb_value(g, m);
    b = normalize_rgb_value(b, m);

    //console.log('r,g,b: ',r,g,b);
    return [r,g,b];
}
function normalize_rgb_value(color, m) {
    color = Math.floor((color + m) * 255);
    if (color < 0) {
        color = 0;
    }
    return color;
}

function addSaturationToRGB(color,offset){
    var hsl = rgbToHSL(color);
    hsl[1] += offset;
    if (hsl[1] > 1) {
        hsl[1] = 1;
    }
    else if (hsl[1] < 0) {
        hsl[1] = 0;
    }
    console.log(hsl);
    return hslToRGB(hsl[0],hsl[1],hsl[2]);
}

function addBrightnessToRGB(color,offset){
    var hsl = rgbToHSL(color);
    hsl[2] += offset;
    if (hsl[2] > 1) {
        hsl[2] = 1;
    }
    else if (hsl[2] < 0) {
        hsl[2] = 0;
    }
    return hslToRGB(hsl[0],hsl[1],hsl[2]/2);
}

function addHueToRGB(color,offset) {
    var hsl = rgbToHSL(color);
    hsl[0] += offset;
    if (hsl[0] > 360) {
        hsl[0] -= 360;
    }
    else if (hsl[0] < 0) {
        hsl[0] += 360;
    }
    return hslToRGB(hsl[0],hsl[1],hsl[2]/2);
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