/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global bez*/

var PropertyFactory = (function () {
    var initFrame = -999999;
    var degToRads = Math.PI / 180;
    var bm_min = Math.min;

    function getValue() {
        if (this.elem.globalData.frameId === this.frameId) {
            return;
        }
        this.mdf = false;
        this.frameId = this.elem.globalData.frameId;
        var frameNum = this.comp.renderedFrame - this.offsetTime;
        if (frameNum === this.lastFrame || (this.lastFrame !== initFrame && ((this.lastFrame >= this.keyframes[this.keyframes.length - 1].t - this.offsetTime && frameNum >= this.keyframes[this.keyframes.length - 1].t - this.offsetTime) || (this.lastFrame < this.keyframes[0].t - this.offsetTime && frameNum < this.keyframes[0].t - this.offsetTime)))) {

        } else {
            var i = 0, len = this.keyframes.length - 1, dir = 1, flag = true, keyData, nextKeyData;

            while (flag) {
                keyData = this.keyframes[i];
                nextKeyData = this.keyframes[i + 1];
                if (i === len - 1 && frameNum >= nextKeyData.t - this.offsetTime) {
                    if (keyData.h) {
                        keyData = nextKeyData;
                    }
                    break;
                }
                if ((nextKeyData.t - this.offsetTime) > frameNum) {
                    break;
                }
                if (i < len - 1) {
                    i += dir;
                } else {
                    flag = false;
                }
            }

            var k, kLen, perc, jLen, j = 0, fnc;
            if (keyData.to) {
                var bezierData = bez.buildBezierData(keyData);
                if (frameNum >= nextKeyData.t - this.offsetTime || frameNum < keyData.t - this.offsetTime) {
                    var ind = frameNum >= nextKeyData.t - this.offsetTime ? bezierData.points.length - 1 : 0;
                    kLen = bezierData.points[ind].point.length;
                    for (k = 0; k < kLen; k += 1) {
                        this.v[k] = this.mult ? bezierData.points[ind].point[k] * this.mult : bezierData.points[ind].point[k];
                        this.pv[k] = bezierData.points[ind].point[k];
                        if (this.lastPValue[k] !== this.pv[k]) {
                            this.mdf = true;
                            this.lastPValue[k] = this.pv[k];
                        }
                    }
                } else {
                    if (keyData.__fnct) {
                        fnc = keyData.__fnct;
                    } else {
                        fnc = bez.getEasingCurve(keyData.o.x, keyData.o.y, keyData.i.x, keyData.i.y, keyData.n);
                        keyData.__fnct = fnc;
                    }
                    perc = fnc('', (frameNum) - (keyData.t - this.offsetTime), 0, 1, (nextKeyData.t - this.offsetTime) - (keyData.t - this.offsetTime));
                    var distanceInLine = bezierData.segmentLength * perc;

                    var segmentPerc;
                    var addedLength = 0;
                    dir = 1;
                    flag = true;
                    jLen = bezierData.points.length;
                    while (flag) {
                        addedLength += bezierData.points[j].partialLength * dir;
                        if (distanceInLine === 0 || perc === 0 || j === bezierData.points.length - 1) {
                            kLen = bezierData.points[j].point.length;
                            for (k = 0; k < kLen; k += 1) {
                                this.v[k] = this.mult ? bezierData.points[j].point[k] * this.mult : bezierData.points[j].point[k];
                                this.pv[k] = bezierData.points[j].point[k];
                                if (this.lastPValue[k] !== this.pv[k]) {
                                    this.mdf = true;
                                    this.lastPValue[k] = this.pv[k];
                                }
                            }
                            break;
                        } else if (distanceInLine >= addedLength && distanceInLine < addedLength + bezierData.points[j + 1].partialLength) {
                            segmentPerc = (distanceInLine - addedLength) / (bezierData.points[j + 1].partialLength);
                            kLen = bezierData.points[j].point.length;
                            for (k = 0; k < kLen; k += 1) {
                                this.v[k] = this.mult ? (bezierData.points[j].point[k] + (bezierData.points[j + 1].point[k] - bezierData.points[j].point[k]) * segmentPerc) * this.mult : bezierData.points[j].point[k] + (bezierData.points[j + 1].point[k] - bezierData.points[j].point[k]) * segmentPerc;
                                this.pv[k] = bezierData.points[j].point[k] + (bezierData.points[j + 1].point[k] - bezierData.points[j].point[k]) * segmentPerc;

                                if (this.lastPValue[k] !== this.pv[k]) {
                                    this.mdf = true;
                                    this.lastPValue[k] = this.pv[k];
                                }
                            }
                            break;
                        }
                        if ((j < jLen - 1 && dir === 1) || (j > 0 && dir === -1)) {
                            j += dir;
                        } else {
                            flag = false;
                        }
                    }
                }
            } else {
                var outX, outY, inX, inY, isArray = false, keyValue;
                len = keyData.s.length;
                for (i = 0; i < len; i += 1) {
                    if (keyData.h !== 1) {
                        if (keyData.o.x instanceof Array) {
                            isArray = true;
                            if (!keyData.__fnct) {
                                keyData.__fnct = [];
                            }
                            if (!keyData.__fnct[i]) {
                                outX = keyData.o.x[i] || keyData.o.x[0];
                                outY = keyData.o.y[i] || keyData.o.y[0];
                                inX = keyData.i.x[i] || keyData.i.x[0];
                                inY = keyData.i.y[i] || keyData.i.y[0];
                            }
                        } else {
                            isArray = false;
                            if (!keyData.__fnct) {
                                outX = keyData.o.x;
                                outY = keyData.o.y;
                                inX = keyData.i.x;
                                inY = keyData.i.y;
                            }
                        }
                        if (isArray) {
                            if (keyData.__fnct[i]) {
                                fnc = keyData.__fnct[i];
                            } else {
                                fnc = bez.getEasingCurve(outX, outY, inX, inY);
                                keyData.__fnct[i] = fnc;
                            }
                        } else {
                            if (keyData.__fnct) {
                                fnc = keyData.__fnct;
                            } else {
                                fnc = bez.getEasingCurve(outX, outY, inX, inY);
                                keyData.__fnct = fnc;
                            }
                        }
                        if (frameNum >= nextKeyData.t - this.offsetTime) {
                            perc = 1;
                        } else if (frameNum < keyData.t - this.offsetTime) {
                            perc = 0;
                        } else {
                            perc = fnc('', (frameNum) - (keyData.t - this.offsetTime), 0, 1, (nextKeyData.t - this.offsetTime) - (keyData.t - this.offsetTime));
                        }
                    }

                    keyValue = keyData.h === 1 ? keyData.s[i] : keyData.s[i] + (keyData.e[i] - keyData.s[i]) * perc;
                    if (len === 1) {
                        this.v = this.mult ? keyValue * this.mult : keyValue;
                        this.pv = keyValue;
                        if (this.lastPValue !== this.pv) {
                            this.mdf = true;
                            this.lastPValue = this.pv;
                        }
                    } else {
                        this.v[i] = this.mult ? keyValue * this.mult : keyValue;
                        this.pv[i] = keyValue;
                        if (this.lastPValue[i] !== this.pv[i]) {
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
                    if(i < len - 1 && dir == 1){
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
                        perc = fnc('',(frameNum)-(keyData.t-this.offsetTime),0,1,(nextKeyData.t-this.offsetTime)-(keyData.t-this.offsetTime));
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

    function getKeys(arr){
        var i = 0, len = arr.length;
        if(!this.keyframes){
            var i = 0, len = arr.length;
            while(i<len){
                if(arr[i] === 0){
                    return;
                }
                i+=1;
            }
            arr.push(0);
        }else{
            var j, jLen = this.keyframes.length,found;
            for(j=0;j<jLen;j+=1){
                i = 0;
                found = false;
                while(i<len){
                    if(arr[i] === this.keyframes[j].t){
                        found = true;
                    }
                    i+=1;
                }
                if(!found){
                    arr.push(this.keyframes[j].t);
                }
            }
        }
    }

    function ValueProperty(elem,data, mult){
        this.mult = mult;
        this.v = mult ? data.k * mult : data.k;
        this.pv = data.k;
        this.mdf = false;
        this.comp = elem.comp;
        this.k = false;
        this.getKeys = getKeys;
    }

    function MultiDimensionalProperty(elem,data, mult){
        this.mult = mult;
        this.mdf = false;
        this.comp = elem.comp;
        this.k = false;
        this.v = new Array(data.k.length);
        this.pv = new Array(data.k.length);
        this.getKeys = getKeys;
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
        this.mult = mult;
        this.elem = elem;
        this.comp = elem.comp;
        this.lastFrame = initFrame;
        this.v = mult ? data.k[0].s[0]*mult : data.k[0].s[0];
        this.pv = data.k[0].s[0];
        this.getValue = getValue;
        this.getKeys = getKeys;
    }

    function KeyframedMultidimensionalProperty(elem, data, mult){
        this.keyframes = data.k;
        this.offsetTime = elem.data.st;
        this.k = true;
        this.mult = mult;
        this.elem = elem;
        this.comp = elem.comp;
        this.getValue = getValue;
        this.frameId = -1;
        this.v = new Array(data.k[0].s.length);
        this.pv = new Array(data.k[0].s.length);
        this.lastValue = new Array(data.k[0].s.length);
        this.lastPValue = new Array(data.k[0].s.length);
        this.lastFrame = initFrame;
        this.getKeys = getKeys;
    }

    var TransformProperty = (function(){
        function getKeys(arr){
            this.a.getKeys(arr);
            this.p.getKeys(arr);
            this.s.getKeys(arr);
            this.r.getKeys(arr);
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
                if(this.data.p.s){
                    this.v.reset().translate(this.px.v,this.py.v).rotate(this.r.v).scale(this.s.v[0],this.s.v[1]).translate(-this.a.v[0],-this.a.v[1]);
                }else{
                    this.v.reset().translate(this.p.v[0],this.p.v[1]).rotate(this.r.v).scale(this.s.v[0],this.s.v[1]).translate(-this.a.v[0],-this.a.v[1]);
                }
            }
        }

        return function(elem,data,arr){
            this.elem = elem;
            this.frameId = -1;
            this.dynamicProperties = [];
            this.mdf = false;
            this.data = data;
            this.getValue = processKeys;
            this.getKeys = getKeys;
            this.v = new Matrix();
            this.a = getProp(elem,data.a,1,0,this.dynamicProperties);
            if(data.p.s){
                this.px = getProp(elem,data.p.x,0,0,this.dynamicProperties);
                this.py = getProp(elem,data.p.y,0,0,this.dynamicProperties);
            }else{
                this.p = getProp(elem,data.p,1,0,this.dynamicProperties);
            }
            this.s = getProp(elem,data.s,1,0.01,this.dynamicProperties);
            this.r = getProp(elem,data.r,0,degToRads,this.dynamicProperties);
            this.o = getProp(elem,data.o,0,0.01,arr);
            if(this.dynamicProperties.length){
                arr.push(this);
            }else{
                if(this.data.p.s){
                    this.v.translate(this.px.v,this.py.v).rotate(this.r.v).scale(this.s.v[0],this.s.v[1]).translate(-this.a.v[0],-this.a.v[1]);
                }else{
                    this.v.translate(this.p.v[0],this.p.v[1]).rotate(this.r.v).scale(this.s.v[0],this.s.v[1]).translate(-this.a.v[0],-this.a.v[1]);
                }
            }
        }
    }());

    function getProp(elem,data,type, mult, arr) {
        var p;
        if(type === 2){
            p = new TransformProperty(elem, data, arr);
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

    function ShapeProperty(elem, data, type){
        this.comp = elem.comp;
        this.k = false;
        this.mdf = false;
        this.closed = type === 3 ? data.cl : data.closed;
        this.numNodes = type === 3 ? data.pt.k.v.length : data.ks.k.v.length;
        this.v = type === 3 ? data.pt.k : data.ks.k;
        var shapeData = type === 3 ? data.pt : data.ks;
        this.pv = this.v;
        this.getKeys = getKeys;
    }

    function KeyframedShapeProperty(elem,data,type){
        this.comp = elem.comp;
        this.offsetTime = elem.data.st;
        this.getValue = interpolateShape;
        this.keyframes = type === 3 ? data.pt.k : data.ks.k;
        this.getKeys = getKeys;
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

        function getKeys(arr){
            this.p.getKeys(arr);
            this.s.getKeys(arr);
        }

        return function(elem,data) {
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
            this.getKeys = getKeys;
            this.p = getProp(elem,data.p,1,0,this.dynamicProperties);
            this.s = getProp(elem,data.s,1,0,this.dynamicProperties);
            if(this.dynamicProperties.length){
                this.k = true;
            }else{
                this.convertEllToPath();
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

        function getKeys(arr){
            this.p.getKeys(arr);
            this.s.getKeys(arr);
            this.r.getKeys(arr);
        }

        return function(elem,data) {
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
            this.getKeys = getKeys;
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

        function getKeys(arr){
            this.pt.getKeys(arr);
            this.p.getKeys(arr);
            this.r.getKeys(arr);
            this.or.getKeys(arr);
            this.os.getKeys(arr);
            if(this.data.sy === 1){
                this.ir.getKeys(arr);
                this.is.getKeys(arr);
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
            this.getKeys = getKeys;
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

    var ob = {};
    ob.getProp = getProp;
    ob.getShapeProp = getShapeProp;
    return ob;
}());