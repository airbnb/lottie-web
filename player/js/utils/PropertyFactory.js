var PropertyFactory = (function(){

    var initFrame = initialDefaultFrame;

    function interpolateValue(frameNum, previousValue, caching){
        var offsetTime = this.offsetTime;
        var newValue;
        if(this.propType === 'multidimensional') {
            newValue = createTypedArray('float32', previousValue.length);
        }
        var iterationIndex = caching.lastIndex;
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
        caching.lastIndex = iterationIndex;
        return newValue;
    }

    function calculateMultidimensionalValueAtCurrentTime(renderResult) {
        var i = 0;
        while(i<this.v.length){
            this.pv[i] = renderResult[i];
            this.v[i] = this.mult ? this.pv[i] * this.mult : this.pv[i];
            if(this.lastPValue[i] !== this.pv[i]) {
                this.mdf = true;
                this.lastPValue[i] = this.pv[i];
            }
            i += 1;
        }
    }

    function calculateUnidimenstionalValueAtCurrentTime(renderResult) {
        this.pv = renderResult;
        this.v = this.mult ? this.pv*this.mult : this.pv;
        if(this.lastPValue != this.pv){
            this.mdf = true;
            this.lastPValue = this.pv;
        }
    }

    function getValueAtCurrentTime(){
        if(this.elem.globalData.frameId === this.frameId){
            return;
        }
        this.mdf = false;
        var frameNum = this.comp.renderedFrame - this.offsetTime;
        var initTime = this.keyframes[0].t - this.offsetTime;
        var endTime = this.keyframes[this.keyframes.length- 1].t-this.offsetTime;
        if(!(frameNum === this._caching.lastFrame || (this._caching.lastFrame !== initFrame && ((this._caching.lastFrame >= endTime && frameNum >= endTime) || (this._caching.lastFrame < initTime && frameNum < initTime))))){
            this._caching.lastIndex = this._caching.lastFrame < frameNum ? this._caching.lastIndex : 0;
            var renderResult = this.interpolateValue(frameNum, this.pv, this._caching);
            this.calculateValueAtCurrentTime(renderResult);
            
        }
        this._caching.lastFrame = frameNum;
        this.frameId = this.elem.globalData.frameId;
    }

    function getNoValue(){}

    function ValueProperty(elem,data, mult){
        this.propType = 'unidimensional';
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
        this.propType = 'multidimensional';
        this.mult = mult;
        this.data = data;
        this.mdf = false;
        this.comp = elem.comp;
        this.k = false;
        this.kf = false;
        this.frameId = -1;
        this.v = createTypedArray('float32', data.k.length);
        this.pv = createTypedArray('float32', data.k.length);
        this.lastValue = createTypedArray('float32', data.k.length);
        var arr = createTypedArray('float32', data.k.length);
        this.vel = createTypedArray('float32', data.k.length);
        var i, len = data.k.length;
        for(i = 0;i<len;i+=1){
            this.v[i] = mult ? data.k[i] * mult : data.k[i];
            this.pv[i] = data.k[i];
        }
        this.getValue = getNoValue;
    }

    function KeyframedValueProperty(elem, data, mult){
        this.propType = 'unidimensional';
        this.keyframes = data.k;
        this.offsetTime = elem.data.st;
        this.lastValue = initFrame;
        this.lastPValue = initFrame;
        this.frameId = -1;
        this._caching={lastFrame:initFrame,lastIndex:0,value:0};
        this.k = true;
        this.kf = true;
        this.data = data;
        this.mult = mult;
        this.elem = elem;
        this.comp = elem.comp;
        this.v = mult ? data.k[0].s[0]*mult : data.k[0].s[0];
        this.pv = data.k[0].s[0];
        this.getValue = getValueAtCurrentTime;
        this.calculateValueAtCurrentTime = calculateUnidimenstionalValueAtCurrentTime;
        this.interpolateValue = interpolateValue;
    }

    function KeyframedMultidimensionalProperty(elem, data, mult){
        this.propType = 'multidimensional';
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
        this.getValue = getValueAtCurrentTime;
        this.calculateValueAtCurrentTime = calculateMultidimensionalValueAtCurrentTime;
        this.interpolateValue = interpolateValue;
        this.frameId = -1;
        var arrLen = data.k[0].s.length;
        this.v = createTypedArray('float32', arrLen);
        this.pv = createTypedArray('float32', arrLen);
        this.lastValue = createTypedArray('float32', arrLen);
        this.lastPValue = createTypedArray('float32', arrLen);
        this._caching={lastFrame:initFrame,lastIndex:0,value:createTypedArray('float32', arrLen)};
    }

    function getProp(elem,data,type, mult, arr) {
        var p;
        if(data.a === 0){
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

    var ob = {
        getProp: getProp
    };
    return ob;
}());