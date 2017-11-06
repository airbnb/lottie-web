var PropertyFactory = (function(){

    var initFrame = -999999;

    function interpolateValue(frameNum, iterationIndex, previousValue, caching){
        var offsetTime = this.offsetTime;
        var newValue;
        if(previousValue.constructor === Array) {
            newValue = Array.apply(null,{length:previousValue.length})
        }
        var i = iterationIndex;
        var len = this.keyframes.length- 1,flag = true;
        var keyData, nextKeyData;

        while(flag){
            keyData = this.keyframes[i];
            nextKeyData = this.keyframes[i+1];
            if(i == len-1 && frameNum >= nextKeyData.t - offsetTime){
                if(keyData.h){
                    keyData = nextKeyData;
                }
                iterationIndex = 0;
                break;
            }
            if((nextKeyData.t - offsetTime) > frameNum){
                iterationIndex = i;
                break;
            }
            if(i < len - 1){
                i += 1;
            }else{
                iterationIndex = 0;
                flag = false;
            }
        }

        var k, kLen,perc,jLen, j, fnc;
        if(keyData.to){

            if(!keyData.bezierData){
                bez.buildBezierData(keyData);
            }
            var bezierData = keyData.bezierData;
            if(frameNum >= nextKeyData.t-offsetTime || frameNum < keyData.t-offsetTime){
                var ind = frameNum >= nextKeyData.t-offsetTime ? bezierData.points.length - 1 : 0;
                kLen = bezierData.points[ind].point.length;
                for(k = 0; k < kLen; k += 1){
                    newValue[k] = bezierData.points[ind].point[k];
                }
                caching._lastBezierData = null;
            }else{
                if(keyData.__fnct){
                    fnc = keyData.__fnct;
                }else{
                    fnc = BezierFactory.getBezierEasing(keyData.o.x,keyData.o.y,keyData.i.x,keyData.i.y,keyData.n).get;
                    keyData.__fnct = fnc;
                }
                perc = fnc((frameNum-(keyData.t-offsetTime))/((nextKeyData.t-offsetTime)-(keyData.t-offsetTime)));
                var distanceInLine = bezierData.segmentLength*perc;

                var segmentPerc;
                var addedLength =  (caching.lastFrame < frameNum && caching._lastBezierData === bezierData) ? caching._lastAddedLength : 0;
                j =  (caching.lastFrame < frameNum && caching._lastBezierData === bezierData) ? caching._lastPoint : 0;
                flag = true;
                jLen = bezierData.points.length;
                while(flag){
                    addedLength +=bezierData.points[j].partialLength;
                    if(distanceInLine === 0 || perc === 0 || j == bezierData.points.length - 1){
                        kLen = bezierData.points[j].point.length;
                        for(k=0;k<kLen;k+=1){
                            newValue[k] = bezierData.points[j].point[k];
                        }
                        break;
                    }else if(distanceInLine >= addedLength && distanceInLine < addedLength + bezierData.points[j+1].partialLength){
                        segmentPerc = (distanceInLine-addedLength)/(bezierData.points[j+1].partialLength);
                        kLen = bezierData.points[j].point.length;
                        for(k=0;k<kLen;k+=1){
                            newValue[k] = bezierData.points[j].point[k] + (bezierData.points[j+1].point[k] - bezierData.points[j].point[k])*segmentPerc;
                        }
                        break;
                    }
                    if(j < jLen - 1){
                        j += 1;
                    }else{
                        flag = false;
                    }
                }
                caching._lastPoint = j;
                caching._lastAddedLength = addedLength - bezierData.points[j].partialLength;
                caching._lastBezierData = bezierData;
            }
        }else{
            var outX,outY,inX,inY, keyValue;
            len = keyData.s.length;
            for(i=0;i<len;i+=1){
                if(keyData.h !== 1){
                    if(frameNum >= nextKeyData.t-offsetTime){
                        perc = 1;
                    }else if(frameNum < keyData.t-offsetTime){
                        perc = 0;
                    }else{
                        if(keyData.o.x.constructor === Array){
                            if(!keyData.__fnct){
                                keyData.__fnct = [];
                            }
                            if (!keyData.__fnct[i]) {
                                outX = keyData.o.x[i] || keyData.o.x[0];
                                outY = keyData.o.y[i] || keyData.o.y[0];
                                inX = keyData.i.x[i] || keyData.i.x[0];
                                inY = keyData.i.y[i] || keyData.i.y[0];
                                fnc = BezierFactory.getBezierEasing(outX,outY,inX,inY).get;
                                keyData.__fnct[i] = fnc;
                            } else {
                                fnc = keyData.__fnct[i];
                            }
                        } else {
                            if (!keyData.__fnct) {
                                outX = keyData.o.x;
                                outY = keyData.o.y;
                                inX = keyData.i.x;
                                inY = keyData.i.y;
                                fnc = BezierFactory.getBezierEasing(outX,outY,inX,inY).get;
                                keyData.__fnct = fnc;
                            } else{
                                fnc = keyData.__fnct;
                            }
                        }
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
                    newValue = keyValue;
                }else{
                    newValue[i] = keyValue;
                }
            }
        }
        return {
            value: newValue,
            iterationIndex: iterationIndex
        }
    }

    function getValueAtCurrentTime(){
        if(this.elem.globalData.frameId === this.frameId){
            return;
        }
        this.mdf = false;
        var frameNum = this.comp.renderedFrame - this.offsetTime;
        var initTime = this.keyframes[0].t-this.offsetTime;
        var endTime = this.keyframes[this.keyframes.length- 1].t-this.offsetTime;
        if(!(frameNum === this._caching.lastFrame || (this._caching.lastFrame !== initFrame && ((this._caching.lastFrame >= endTime && frameNum >= endTime) || (this._caching.lastFrame < initTime && frameNum < initTime))))){
            var i = this._caching.lastFrame < frameNum ? this._caching.lastIndex : 0;
            var renderResult = this.interpolateValue(frameNum, i, this.pv, this._caching);
            this._caching.lastIndex = renderResult.iterationIndex;
            if(this.pv.constructor === Array){
                i = 0;
                while(i<this.v.length){
                    this.pv[i] = renderResult.value[i];
                    this.v[i] = this.mult ? this.pv[i] * this.mult : this.pv[i];
                    if(this.lastPValue[i] !== this.pv[i]) {
                        this.mdf = true;
                        this.lastPValue[i] = this.pv[i];
                    }
                    i += 1;
                }
            } else {
                this.pv = renderResult.value;
                this.v = this.mult ? this.pv*this.mult : this.pv;
                if(this.lastPValue != this.pv){
                    this.mdf = true;
                    this.lastPValue = this.pv;
                }
            }
            
        }
        this._caching.lastFrame = frameNum;
        this.frameId = this.elem.globalData.frameId;
    }

    function getNoValue(){}

    function ValueProperty(elem,data, mult){
        this.mult = mult;
        this.v = mult ? data.k * mult : data.k;
        this.pv = data.k;
        this.mdf = false;
        this.comp = elem.comp;
        this.k = false;
        this.kf = false;
        this.vel = 0;
        this.getValue = getNoValue;
    }

    function MultiDimensionalProperty(elem,data, mult){
        this.mult = mult;
        this.data = data;
        this.mdf = false;
        this.comp = elem.comp;
        this.k = false;
        this.kf = false;
        this.frameId = -1;
        this.v = Array.apply(null, {length:data.k.length});
        this.pv = Array.apply(null, {length:data.k.length});
        this.lastValue = Array.apply(null, {length:data.k.length});
        var arr = Array.apply(null, {length:data.k.length});
        this.vel = arr.map(function () { return 0 });
        var i, len = data.k.length;
        for(i = 0;i<len;i+=1){
            this.v[i] = mult ? data.k[i] * mult : data.k[i];
            this.pv[i] = data.k[i];
        }
        this.getValue = getNoValue;
    }

    function KeyframedValueProperty(elem, data, mult){
        this.keyframes = data.k;
        this.offsetTime = elem.data.st;
        this.lastValue = -99999;
        this.lastPValue = -99999;
        this.frameId = -1;
        this._caching={lastFrame:initFrame,lastIndex:0};
        this.k = true;
        this.kf = true;
        this.data = data;
        this.mult = mult;
        this.elem = elem;
        this.comp = elem.comp;
        this.v = mult ? data.k[0].s[0]*mult : data.k[0].s[0];
        this.pv = data.k[0].s[0];
        this.getValue = getValueAtCurrentTime;
        this.interpolateValue = interpolateValue;
    }

    function KeyframedMultidimensionalProperty(elem, data, mult){
        var i, len = data.k.length;
        var s, e,to,ti;
        for(i=0;i<len-1;i+=1){
            if(data.k[i].to && data.k[i].s && data.k[i].e){
                s = data.k[i].s;
                e = data.k[i].e;
                to = data.k[i].to;
                ti = data.k[i].ti;
                if((s.length === 2 && !(s[0] === e[0] && s[1] === e[1]) && bez.pointOnLine2D(s[0],s[1],e[0],e[1],s[0] + to[0],s[1] + to[1]) && bez.pointOnLine2D(s[0],s[1],e[0],e[1],e[0] + ti[0],e[1] + ti[1])) || (s.length === 3 && !(s[0] === e[0] && s[1] === e[1] && s[2] === e[2]) && bez.pointOnLine3D(s[0],s[1],s[2],e[0],e[1],e[2],s[0] + to[0],s[1] + to[1],s[2] + to[2]) && bez.pointOnLine3D(s[0],s[1],s[2],e[0],e[1],e[2],e[0] + ti[0],e[1] + ti[1],e[2] + ti[2]))){
                    data.k[i].to = null;
                    data.k[i].ti = null;
                }
            }
        }
        this.keyframes = data.k;
        this.offsetTime = elem.data.st;
        this.k = true;
        this.kf = true;
        this.mult = mult;
        this.elem = elem;
        this.comp = elem.comp;
        this._caching={lastFrame:initFrame,lastIndex:0};
        this.getValue = getValueAtCurrentTime;
        this.interpolateValue = interpolateValue;
        this.frameId = -1;
        this.v = Array.apply(null, {length:data.k[0].s.length});
        this.pv = Array.apply(null, {length:data.k[0].s.length});
        this.lastValue = Array.apply(null, {length:data.k[0].s.length});
        this.lastPValue = Array.apply(null, {length:data.k[0].s.length});
    }

    var TransformProperty = (function() {
        function positionGetter() {
            if(this.p) {
                return ExpressionValue(this.p);
            } else {
                return [this.px.v, this.py.v, this.pz ? this.pz.v : 0];
            }
        }
        function xPositionGetter() {
            return ExpressionValue(this.px);
        }
        function yPositionGetter() {
            return ExpressionValue(this.py);
        }
        function zPositionGetter() {
            return ExpressionValue(this.pz);
        }
        function anchorGetter() {
            return ExpressionValue(this.a);
        }
        function orientationGetter() {
            return ExpressionValue(this.or);
        }
        function rotationGetter() {
            if(this.r) {
                return ExpressionValue(this.r, 1/degToRads);
            } else {
                return ExpressionValue(this.rz, 1/degToRads);
            }
        }
        function scaleGetter() {
            return ExpressionValue(this.s, 100);
        }
        function opacityGetter() {
            return ExpressionValue(this.o, 100);
        }
        function skewGetter() {
            return ExpressionValue(this.sk);
        }
        function skewAxisGetter() {
            return ExpressionValue(this.sa);
        }
        function applyToMatrix(mat) {
            var i, len = this.dynamicProperties.length;
            for(i = 0; i < len; i += 1) {
                this.dynamicProperties[i].getValue();
                if (this.dynamicProperties[i].mdf) {
                    this.mdf = true;
                }
            }
            if (this.a) {
                mat.translate(-this.a.v[0], -this.a.v[1], this.a.v[2]);
            }
            if (this.s) {
                mat.scale(this.s.v[0], this.s.v[1], this.s.v[2]);
            }
            if (this.r) {
                mat.rotate(-this.r.v);
            } else {
                mat.rotateZ(-this.rz.v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or.v[2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]);
            }
            if (this.data.p.s) {
                if (this.data.p.z) {
                    mat.translate(this.px.v, this.py.v, -this.pz.v);
                } else {
                    mat.translate(this.px.v, this.py.v, 0);
                }
            } else {
                mat.translate(this.p.v[0], this.p.v[1], -this.p.v[2]);
            }
        }
        function processKeys(){
            if (this.elem.globalData.frameId === this.frameId) {
                return;
            }

            this.mdf = false;
            var i, len = this.dynamicProperties.length;

            for(i = 0; i < len; i += 1) {
                this.dynamicProperties[i].getValue();
                if (this.dynamicProperties[i].mdf) {
                    this.mdf = true;
                }
            }
            if (this.mdf) {
                this.v.reset();
                if (this.a) {
                    this.v.translate(-this.a.v[0], -this.a.v[1], this.a.v[2]);
                }
                if(this.s) {
                    this.v.scale(this.s.v[0], this.s.v[1], this.s.v[2]);
                }
                if (this.sk) {
                    this.v.skewFromAxis(-this.sk.v, this.sa.v);
                }
                if (this.r) {
                    this.v.rotate(-this.r.v);
                } else {
                    this.v.rotateZ(-this.rz.v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or.v[2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]);
                }
                if (this.autoOriented && this.p.keyframes && this.p.getValueAtTime) {
                    var v1,v2;
                    if (this.p._caching.lastFrame+this.p.offsetTime <= this.p.keyframes[0].t) {
                        v1 = this.p.getValueAtTime((this.p.keyframes[0].t + 0.01) / this.elem.globalData.frameRate,0);
                        v2 = this.p.getValueAtTime(this.p.keyframes[0].t / this.elem.globalData.frameRate, 0);
                    } else if(this.p._caching.lastFrame+this.p.offsetTime >= this.p.keyframes[this.p.keyframes.length - 1].t) {
                        v1 = this.p.getValueAtTime((this.p.keyframes[this.p.keyframes.length - 1].t / this.elem.globalData.frameRate), 0);
                        v2 = this.p.getValueAtTime((this.p.keyframes[this.p.keyframes.length - 1].t - 0.01) / this.elem.globalData.frameRate, 0);
                    } else {
                        v1 = this.p.pv;
                        v2 = this.p.getValueAtTime((this.p._caching.lastFrame+this.p.offsetTime - 0.01) / this.elem.globalData.frameRate, this.p.offsetTime);
                    }
                    this.v.rotate(-Math.atan2(v1[1] - v2[1], v1[0] - v2[0]));
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
            this.frameId = this.elem.globalData.frameId;
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

        function autoOrient(){
            //
            //var prevP = this.getValueAtTime();
        }

        return function TransformProperty(elem,data,arr){
            this.elem = elem;
            this.frameId = -1;
            this.type = 'transform';
            this.dynamicProperties = [];
            this.mdf = false;
            this.data = data;
            this.getValue = processKeys;
            this.applyToMatrix = applyToMatrix;
            this.setInverted = setInverted;
            this.autoOrient = autoOrient;
            this.v = new Matrix();
            if(data.p.s){
                this.px = PropertyFactory.getProp(elem,data.p.x,0,0,this.dynamicProperties);
                this.py = PropertyFactory.getProp(elem,data.p.y,0,0,this.dynamicProperties);
                if(data.p.z){
                    this.pz = PropertyFactory.getProp(elem,data.p.z,0,0,this.dynamicProperties);
                }
            }else{
                this.p = PropertyFactory.getProp(elem,data.p,1,0,this.dynamicProperties);
            }
            if(data.r) {
                this.r = PropertyFactory.getProp(elem, data.r, 0, degToRads, this.dynamicProperties);
            } else if(data.rx) {
                this.rx = PropertyFactory.getProp(elem, data.rx, 0, degToRads, this.dynamicProperties);
                this.ry = PropertyFactory.getProp(elem, data.ry, 0, degToRads, this.dynamicProperties);
                this.rz = PropertyFactory.getProp(elem, data.rz, 0, degToRads, this.dynamicProperties);
                this.or = PropertyFactory.getProp(elem, data.or, 1, degToRads, this.dynamicProperties);
                //sh Indicates it needs to be capped between -180 and 180
                this.or.sh = true;
            }
            if(data.sk){
                this.sk = PropertyFactory.getProp(elem, data.sk, 0, degToRads, this.dynamicProperties);
                this.sa = PropertyFactory.getProp(elem, data.sa, 0, degToRads, this.dynamicProperties);
            }
            if(data.a) {
                this.a = PropertyFactory.getProp(elem,data.a,1,0,this.dynamicProperties);
            }
            if(data.s) {
                this.s = PropertyFactory.getProp(elem,data.s,1,0.01,this.dynamicProperties);
            }
            if(data.o){
                this.o = PropertyFactory.getProp(elem,data.o,0,0.01,this.dynamicProperties);
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
            Object.defineProperty(this, "xPosition", { get: xPositionGetter});
            Object.defineProperty(this, "yPosition", { get: yPositionGetter});
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
        } else if(data.a === 0){
            if(type === 0) {
                p = new ValueProperty(elem,data,mult);
            } else {
                p = new MultiDimensionalProperty(elem,data, mult);
            }
        } else if(data.a === 1){
            if(type === 0) {
                p = new KeyframedValueProperty(elem,data,mult);
            } else {
                p = new KeyframedMultidimensionalProperty(elem,data, mult);
            }
        } else if(!data.k.length){
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
        if(p.k){
            arr.push(p);
        }
        return p;
    }

    var getGradientProp = (function(){

        function getValue(forceRender){
            this.prop.getValue();
            this.cmdf = false;
            this.omdf = false;
            if(this.prop.mdf || forceRender){
                var i, len = this.data.p*4;
                var mult, val;
                for(i=0;i<len;i+=1){
                    mult = i%4 === 0 ? 100 : 255;
                    val = Math.round(this.prop.v[i]*mult);
                    if(this.c[i] !== val){
                        this.c[i] = val;
                        this.cmdf = true;
                    }
                }
                if(this.o.length){
                    len = this.prop.v.length;
                    for(i=this.data.p*4;i<len;i+=1){
                        mult = i%2 === 0 ? 100 : 1;
                        val = i%2 === 0 ?  Math.round(this.prop.v[i]*100):this.prop.v[i];
                        if(this.o[i-this.data.p*4] !== val){
                            this.o[i-this.data.p*4] = val;
                            this.omdf = true;
                        }
                    }
                }
            }

        }

        function gradientProp(elem,data,arr){
            this.prop = getProp(elem,data.k,1,null,[]);
            this.data = data;
            this.k = this.prop.k;
            this.c = Array.apply(null,{length:data.p*4});
            var cLength = data.k.k[0].s ? (data.k.k[0].s.length - data.p*4) : data.k.k.length - data.p*4;
            this.o = Array.apply(null,{length:cLength});
            this.cmdf = false;
            this.omdf = false;
            this.getValue = getValue;
            if(this.prop.k){
                arr.push(this);
            }
            this.getValue(true);
        }

        return function getGradientProp(elem,data,arr){
            return new gradientProp(elem,data,arr);
        }
    }());




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
                prop = PropertyFactory.getProp(elem,data[i].v,0, 0, dynamicProperties);
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

    var TextSelectorProp = (function(){
        var max = Math.max;
        var min = Math.min;
        var floor = Math.floor;
        function updateRange(newCharsFlag){
            this.mdf = newCharsFlag || false;
            if(this.dynamicProperties.length){
                var i, len = this.dynamicProperties.length;
                for(i=0;i<len;i+=1){
                    this.dynamicProperties[i].getValue();
                    if(this.dynamicProperties[i].mdf){
                        this.mdf = true;
                    }
                }
            }
            var totalChars = this.elem.textProperty.currentData ? this.elem.textProperty.currentData.l.length : 0;
            if(newCharsFlag && this.data.r === 2) {
                this.e.v = totalChars;
            }
            var divisor = this.data.r === 2 ? 1 : 100 / totalChars;
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
            //var easer = bez.getEasingCurve(this.ne.v/100,0,1-this.xe.v/100,1);
            var easer = BezierFactory.getBezierEasing(this.ne.v/100,0,1-this.xe.v/100,1).get;
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
                    mult = 0;
                }else{
                    mult = max(0,min(0.5/(e-s) + (ind-s)/(e-s),1));
                    if(mult<.5){
                        mult *= 2;
                    }else{
                        mult = 1 - 2*(mult-0.5);
                    }
                }
                mult = easer(mult);
            }else if(type == 5){
                if(e === s){
                    mult = 0;
                }else{
                    var tot = e - s;
                    /*ind += 0.5;
                    mult = -4/(tot*tot)*(ind*ind)+(4/tot)*ind;*/
                    ind = min(max(0,ind+0.5-s),e-s);
                    var x = -tot/2+ind;
                    var a = tot/2;
                    mult = Math.sqrt(1 - (x*x)/(a*a));
                }
                mult = easer(mult);
            }else if(type == 6){
                if(e === s){
                    mult = 0;
                }else{
                    ind = min(max(0,ind+0.5-s),e-s);
                    mult = (1+(Math.cos((Math.PI+Math.PI*2*(ind)/(e-s)))))/2;
                    /*
                     ind = Math.min(Math.max(s,ind),e-1);
                     mult = (1+(Math.cos((Math.PI+Math.PI*2*(ind-s)/(e-1-s)))))/2;
                     mult = Math.max(mult,(1/(e-1-s))/(e-1-s));*/
                }
                mult = easer(mult);
            }else {
                if(ind >= floor(s)){
                    if(ind-s < 0){
                        mult = 1 - (s - ind);
                    }else{
                        mult = max(0,min(e-ind,1));
                    }
                }
                mult = easer(mult);
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
            this.elem = elem;
            this.comp = elem.comp;
            this.finalS = 0;
            this.finalE = 0;
            this.s = PropertyFactory.getProp(elem,data.s || {k:0},0,0,this.dynamicProperties);
            if('e' in data){
                this.e = PropertyFactory.getProp(elem,data.e,0,0,this.dynamicProperties);
            }else{
                this.e = {v:100};
            }
            this.o = PropertyFactory.getProp(elem,data.o || {k:0},0,0,this.dynamicProperties);
            this.xe = PropertyFactory.getProp(elem,data.xe || {k:0},0,0,this.dynamicProperties);
            this.ne = PropertyFactory.getProp(elem,data.ne || {k:0},0,0,this.dynamicProperties);
            this.a = PropertyFactory.getProp(elem,data.a,0,0.01,this.dynamicProperties);
            if(this.dynamicProperties.length){
                arr.push(this);
            }else{
                this.getValue();
            }
        }
    }());

    function getTextSelectorProp(elem, data,arr) {
        return new TextSelectorProp(elem, data, arr);
    };

    var ob = {
        getProp: getProp,
        getDashProp: getDashProp,
        getTextSelectorProp: getTextSelectorProp,
        getGradientProp: getGradientProp
    };
    return ob;
}());