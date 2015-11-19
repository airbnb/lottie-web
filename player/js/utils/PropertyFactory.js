var PropertyFactory = (function(){

    var initFrame = -999999;

    function getValue(){
        this.mdf = false;
        var frameNum = this.comp.renderedFrame;
        if(frameNum === this.lastFrame || this.lastFrame !== initFrame && ((this.lastFrame >= this.keyframes[this.keyframes.length- 1].t-this.offsetTime && frameNum >= this.keyframes[this.keyframes.length- 1].t-this.offsetTime) || (this.lastFrame < this.keyframes[0].t-this.offsetTime && frameNum < this.keyframes[0].t-this.offsetTime))){
        }else{
            var i = 0,len = this.keyframes.length- 1,dir= 1,flag = true;
            var keyData, nextKeyData;

            while(flag){
                keyData = this.keyframes[i];
                nextKeyData = this.keyframes[i+1];
                if(i == len-1 && frameNum >= nextKeyData.t - this.offsetTime){
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
                        if(this.lastValue[k] !== this.v[k]) {
                            this.mdf = true;
                            this.lastValue[k] = this.v[k];
                        }
                    }
                }else{
                    if(keyData.__fnct){
                        fnc = keyData.__fnct;
                    }else{
                        fnc = bez.getEasingCurve(keyData.o.x,keyData.o.y,keyData.i.x,keyData.i.y,keyData.n);
                        keyData.__fnct = fnc;
                    }
                    perc = fnc('',(frameNum)-(keyData.t-this.offsetTime),0,1,(nextKeyData.t-this.offsetTime)-(keyData.t-this.offsetTime));
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
                                if(this.lastValue[k] !== this.v[k]) {
                                    this.mdf = true;
                                    this.lastValue[k] = this.v[k];
                                }
                            }
                            break;
                        }else if(distanceInLine > addedLength && distanceInLine < addedLength + bezierData.points[j+1].partialLength){
                            segmentPerc = (distanceInLine-addedLength)/(bezierData.points[j+1].partialLength);
                            kLen = bezierData.points[j].point.length;
                            for(k=0;k<kLen;k+=1){
                                this.v[k] = this.mult ? (bezierData.points[j].point[k] + (bezierData.points[j+1].point[k] - bezierData.points[j].point[k])*segmentPerc)*this.mult : bezierData.points[j].point[k] + (bezierData.points[j+1].point[k] - bezierData.points[j].point[k])*segmentPerc;

                                if(this.lastValue[k] !== this.v[k]) {
                                    this.mdf = true;
                                    this.lastValue[k] = this.v[k];
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
                                outX = keyData.o.x[i] ? keyData.o.x[i] : keyData.o.x[0];
                                outY = keyData.o.y[i] ? keyData.o.y[i] : keyData.o.y[0];
                                inX = keyData.i.x[i] ? keyData.i.x[i] : keyData.i.x[0];
                                inY = keyData.i.y[i] ? keyData.i.y[i] : keyData.i.y[0];
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
                            perc = fnc('',(frameNum)-(keyData.t-this.offsetTime),0,1,(nextKeyData.t-this.offsetTime)-(keyData.t-this.offsetTime));
                        }
                    }
                    keyValue = keyData.h === 1 ? keyData.s[i] : keyData.s[i]+(keyData.e[i]-keyData.s[i])*perc;
                    if(len === 1){
                        this.v = this.mult ? keyValue*this.mult : keyValue;
                        if(this.lastValue != this.v){
                            this.mdf = true;
                            this.lastValue = this.v;
                        }
                    }else{
                        this.v[i] = this.mult ? keyValue*this.mult : keyValue;
                        if(this.lastValue[i] !== this.v[i]){
                            this.mdf = true;
                            this.lastValue[i] = this.v[i];
                        }
                    }
                }
            }
        }
        if(this.x){
            if(typeof this.v === 'number'){
                this.pv = this.v;
            }else{
                this.pv = this.v;
            }
        }
        this.lastFrame = this.comp.renderedFrame;
    }

    function interpolateShape(frameNum) {
        this.mdf = false;
        if(this.lastFrame !== initFrame && ((this.lastFrame < this.keyframes[0].t-this.offsetTime && frameNum < this.keyframes[0].t-this.offsetTime) || (this.lastFrame > this.keyframes[this.keyframes.length - 1].t-this.offsetTime && frameNum > this.keyframes[this.keyframes.length - 1].t-this.offsetTime))){

        }else if(frameNum < this.keyframes[0].t-this.offsetTime){
            this.mdf = true;
            this.v = this.keyframes[0].s[0];
        }else if(frameNum > this.keyframes[this.keyframes.length - 1].t-this.offsetTime){
            this.mdf = true;
            this.v = this.keyframes[this.keyframes.length - 2].h === 1 ? this.keyframes[this.keyframes.length - 2].s[0] : this.keyframes[this.keyframes.length - 2].e[0];
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
                    perc = fnc('',(frameNum)-(keyData.t-this.offsetTime),0,1,(nextKeyData.t-this.offsetTime)-(keyData.t-this.offsetTime));
                }
            }
            jLen = this.shapeData.i.length;
            kLen = keyData.s[0].i[0].length;
            for(j=0;j<jLen;j+=1){
                for(k=0;k<kLen;k+=1){
                    if(keyData.h === 1){
                        this.shapeData.i[j][k] = keyData.s[0].i[j][k];
                        this.shapeData.o[j][k] = keyData.s[0].o[j][k];
                        this.shapeData.v[j][k] = keyData.s[0].v[j][k];
                    }else{
                        this.shapeData.i[j][k] = keyData.s[0].i[j][k]+(keyData.e[0].i[j][k]-keyData.s[0].i[j][k])*perc;
                        this.shapeData.o[j][k] = keyData.s[0].o[j][k]+(keyData.e[0].o[j][k]-keyData.s[0].o[j][k])*perc;
                        this.shapeData.v[j][k] = keyData.s[0].v[j][k]+(keyData.e[0].v[j][k]-keyData.s[0].v[j][k])*perc;
                    }
                }
            }
            this.v = this.shapeData;
        }
        this.lastFrame = frameNum;
    }

    function checkExpressions(data){
        this.getExpression = ExpressionManager.initiateExpression;
        if(data.x){
            this.k = true;
            this.x = true;
            if(this.getValue) {
                this.getPreValue = this.getValue;
            }
            this.getValue = this.getExpression(data);
        }
    }

    function ValueProperty(data, mult, comp){
        mult = mult ? mult : 1;
        this.v = data.k * mult;
        this.mdf = false;
        this.comp = comp;
        this.k = false;
        checkExpressions.bind(this)(data);
        if(this.x){
            this.pv = data.k;
        }
    }

    function MultiDimensionalProperty(data, mult, comp){
        this.mdf = false;
        this.comp = comp;
        this.k = false;
        checkExpressions.bind(this)(data);
        this.v = new Array(data.k.length);
        if(this.x){
            this.pv = new Array(data.k.length);
        }
        var i, len = data.k.length;
        for(i = 0;i<len;i+=1){
            this.v[i] = mult ? data.k[i] * mult : data.k[i];
            if(this.pv){
                this.pv[i] = data.k[i];
            }
        }
    }

    function KeyframedValueProperty(elemData, data, mult, comp){
        this.keyframes = data.k;
        this.offsetTime = elemData.st;
        this.lastValue = -99999;
        this.k = true;
        this.mult = mult;
        this.comp = comp;
        this.lastFrame = initFrame;
        this.v = data[0].s[0];
        this.getValue = getValue;
        checkExpressions.bind(this)(data);
        if(this.x){
            this.pv = data[0].s[0];
        }
    }

    function KeyframedMultidimensionalProperty(elemData, data, mult, comp){
        this.keyframes = data.k;
        this.offsetTime = elemData.st;
        this.k = true;
        this.mult = mult;
        this.comp = comp;
        this.getValue = getValue;
        this.v = new Array(data.k[0].s.length);
        this.lastValue = new Array(data.k[0].s.length);
        this.lastFrame = initFrame;
        checkExpressions.bind(this)(data);
        if(this.x){
            this.pv = new Array(data.k[0].s.length);
        }
    }

    var TransformProperty = (function(){
        function positionGetter(){
            if(this.p.k){
                this.p.getValue();
            }
            return this.p.v;
        };
        function processKeys(){
            var i, len = this.dynamicProperties.length;
            this.mdf = false;

            for(i=0;i<len;i+=1){
                this.dynamicProperties[i].getValue();
                if(this.dynamicProperties[i].mdf){
                    this.mdf = true;
                }
            }
            if(this.mdf){
                this.v.reset().translate(this.p.v[0],this.p.v[1]).rotate(this.r.v).scale(this.s.v[0],this.s.v[1]).translate(-this.a.v[0],-this.a.v[1]);
            }
        }

        return function(elemData,data,arr, comp){
            this.dynamicProperties = [];
            this.mdf = false;
            this.getValue = processKeys;
            this.v = new Matrix();
            this.a = getProp(elemData,data.a,1,0,this.dynamicProperties,comp);
            this.p = getProp(elemData,data.p,1,0,this.dynamicProperties,comp);
            this.s = getProp(elemData,data.s,1,0.01,this.dynamicProperties,comp);
            this.r = getProp(elemData,data.r,0,degToRads,this.dynamicProperties,comp);
            if(this.dynamicProperties.length){
                arr.push(this);
            }else{
                this.v = this.v.translate(this.p.v[0],this.p.v[1]).rotate(this.r.v).scale(this.s.v[0],this.s.v[1]).translate(-this.a.v[0],-this.a.v[1]);
            }
            Object.defineProperty(this, "position", { get: positionGetter});
        }
    }());

    function getProp(elemData,data,type, mult, arr, comp) {
        var p;
        if(type === 2){
            p = new TransformProperty(elemData, data, arr, comp);
        }else if(type === 7){
            p = new TrimProperty(elemData, data, arr);
        }else if(!data.k.length){
            p = new ValueProperty(data, mult, comp);
        }else if(typeof(data.k[0]) === 'number'){
            p = new MultiDimensionalProperty(data, mult, comp);
        }else{
            switch(type){
                case 0:
                    p = new KeyframedValueProperty(elemData,data,mult, comp);
                    break;
                case 1:
                    p = new KeyframedMultidimensionalProperty(elemData,data,mult, comp);
                    break;
            }
        }
        if(p.k || p.x){
            arr.push(p);
        }
        return p;
    }

    function ShapeProperty(data, type){
        this.k = false;
        this.mdf = false;
        this.closed = type === 3 ? data.cl : data.closed;
        this.shapeData = data.ks;
        this.v = type === 3 ? data.pt.k : data.ks.k;
    }

    function KeyframedShapeProperty(elemData,data,arr,type){
        this.offsetTime = elemData.st;
        this.getValue = interpolateShape;
        this.keyframes = type === 3 ? data.pt.k : data.ks.k;
        this.k = true;
        this.closed = type === 3 ? data.cl : data.closed;
        var i, len = this.keyframes[0].s[0].i.length;
        var jLen = this.keyframes[0].s[0].i[0].length;
        this.shapeData = {
            i: new Array(len),
            o: new Array(len),
            v: new Array(len)
        }
        for(i=0;i<len;i+=1){
            this.shapeData.i[i] = new Array(jLen);
            this.shapeData.o[i] = new Array(jLen);
            this.shapeData.v[i] = new Array(jLen);
        }
        this.lastFrame = initFrame;
        arr.push(this);
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
            this.mdf = false;

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

        return function(elemData,data,arr,comp) {
            this.v = {
                v: new Array(4),
                i: new Array(4),
                o: new Array(4),
                c: true
            };
            this.d = data.d;
            this.dynamicProperties = [];
            data.closed = true;
            this.closed = true;
            this.mdf = false;
            this.getValue = processKeys;
            this.convertEllToPath = convertEllToPath;
            this.p = getProp(elemData,data.p,1,0,this.dynamicProperties,comp);
            this.s = getProp(elemData,data.s,1,0,this.dynamicProperties,comp);
            if(this.dynamicProperties.length){
                arr.push(this);
            }else{
                this.convertEllToPath();
            }
        }
    }());

    var RectShapeProperty = (function() {
        function processKeys(frameNum){
            var i, len = this.dynamicProperties.length;
            this.mdf = false;

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

        return function(elemData,data,arr, comp) {
            this.v = {
                v: new Array(8),
                i: new Array(8),
                o: new Array(8),
                c: true
            };
            this.d = data.d;
            this.dynamicProperties = [];
            this.mdf = false;
            data.closed = true;
            this.closed = true;
            this.getValue = processKeys;
            this.convertRectToPath = convertRectToPath;
            this.p = getProp(elemData,data.p,1,0,this.dynamicProperties,comp);
            this.s = getProp(elemData,data.s,1,0,this.dynamicProperties,comp);
            this.r = getProp(elemData,data.r,0,0,this.dynamicProperties,comp);
            if(this.dynamicProperties.length){
                arr.push(this);
            }else{
                this.convertRectToPath();
            }
        }
    }());

    var TrimProperty = (function(){
        function processKeys(frameNum, forceRender){
            var i, len = this.dynamicProperties.length;
            this.mdf = false;

            for(i=0;i<len;i+=1){
                this.dynamicProperties[i].getValue(frameNum);
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
        return function(elemData,data, arr,comp){
            this.dynamicProperties = [];
            this.sValue = 0;
            this.eValue = 0;
            this.oValue = 0;
            this.mdf = false;
            this.getValue = processKeys;
            this.k = false;
            this.isTrimming = false;
            this.s = getProp(elemData,data.s,0,0.01,this.dynamicProperties,comp);
            this.e = getProp(elemData,data.e,0,0.01,this.dynamicProperties,comp);
            this.e = getProp(elemData,data.o,0,0,this.dynamicProperties,comp);
            if(this.dynamicProperties.length){
                arr.push(this);
                this.k = true;
            }else{
                this.getValue(0,true);
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

        function processKeys(frameNum, forceRender){
            this.mdf = forceRender ? true : false;
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

        return function(prop,trims,arr) {
            this.trims  = [];
            this.k = false;
            this.mdf = false;
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
            len = this.prop.shapeData.k.v.length - 1;
            len += this.prop.closed ? 1:0;
            this.lengths = new Array(len);
            this.k = prop.k ? true : this.k;
            this.totalLength = 0;
            this.getValue = processKeys;
            this.addSegment = addSegment;
            this.getSegmentsLength = getSegmentsLength;
            if(this.k){
                arr.push(this);
            }else{
                this.getValue(0,true);
            }
        }
    }());

    function getShapeProp(elemData,data,type, arr, trims){
        var prop;
        if(type === 3 || type === 4){
            var keys = type === 3 ? data.pt.k : data.ks.k;
            if(keys.length){
                prop = new KeyframedShapeProperty(elemData, data, arr, type);
            }else{
                prop = new ShapeProperty(data, type, arr);
            }
        }else if(type === 5){
            prop = new RectShapeProperty(elemData, data, arr);
        }else if(type === 6){
            prop = new EllShapeProperty(elemData, data, arr);
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
            return new TrimTransformerProperty(prop,trims, arr);
        }else{
            return prop;
        }
    }

    var DashProperty = (function(){

        function processKeys(frameNum, forceFlag){
            var i = 0, len = this.dataProps.length;
            this.mdf = forceFlag ? true : false;
            while(i<len){
                if(this.dataProps[i].p.mdf){
                    this.mdf = true;
                    break;
                }
                i+=1;
            }
            if(this.mdf){
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

        return function(elemData, data,renderer, dynamicProperties){
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
                prop = getProp(elemData,data[i].v,0, 0, dynamicProperties);
                this.k = prop.k ? true : this.k;
                this.dataProps[i] = {n:data[i].n,p:prop};
            }
            this.getValue = processKeys;
            if(this.k){
                dynamicProperties.push(this);
            }else{
                this.getValue(0,true);
            }

        }
    }());

    function getDashProp(elemData, data, dynamicProperties) {
        return new DashProperty(elemData, data, dynamicProperties);
    };

    var ob = {};
    ob.getProp = getProp;
    ob.getShapeProp = getShapeProp;
    ob.getDashProp = getDashProp;
    return ob;
}());