var PropertyFactory = (function(){

    function getInterpolatedValue(frameNum){
        this.mdf = false;
        var i = 0,len = this.keyframes.length- 1,dir= 1,flag = true;
        var keyData, nextKeyData;

        while(flag){
            keyData = this.keyframes[i];
            nextKeyData = this.keyframes[i+1];
            if(i == len-1 && frameNum >= nextKeyData.t - this.offsetTime){
                break;
            }
            if((nextKeyData.t - this.offsetTime) > frameNum && dir == 1){
                break;
            }else if((nextKeyData.t - this.offsetTime) < frameNum && dir == -1){
                i += 1;
                keyData = this.keyframes[i];
                nextKeyData = this.keyframes[i+1];
                break;
            }
            if(i < len - 1 && dir == 1 || i > 0 && dir == -1){
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
            if((this.lastFrame >= nextKeyData.t-this.offsetTime && frameNum >= nextKeyData.t-this.offsetTime) || (this.lastFrame < keyData.t-this.offsetTime && frameNum < keyData.t-this.offsetTime)){
            }else if(frameNum >= nextKeyData.t-this.offsetTime || frameNum < keyData.t-this.offsetTime){
                var ind = frameNum >= nextKeyData.t-this.offsetTime ? bezierData.points.length - 1 : 0;
                var k, kLen = bezierData.points[ind].point.length;
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
                        this.v = bezierData.points[j].point;
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
        this.lastFrame = frameNum;
    }


    function ValueProperty(data, mult){
        mult = mult ? mult : 1;
        this.v = data * mult;
        this.mdf = false;
    }

    function MultiDimensionalProperty(data, mult){
        if(mult){
            var i, len = data.length;
            for(i = 0;i<len;i+=1){
                data[i] *= mult;
            }
        }
        this.v = data;
        this.mdf = false;
    }

    function KeyframedValueProperty(elemData, data, mult){
        this.keyframes = data;
        this.offsetTime = elemData.st;
        this.lastFrame = -99999;
        this.lastValue = -99999;
        this.k = true;
        this.mult = mult;
        this.getInterpolatedValue = getInterpolatedValue;
    }

    function KeyframedMultidimensionalProperty(elemData, data, mult){
        this.keyframes = data;
        this.offsetTime = elemData.st;
        this.k = true;
        this.mult = mult;
        this.getInterpolatedValue = getInterpolatedValue;
        this.v = new Array(data[0].s.length);
        this.lastValue = new Array(data[0].s.length);
        this.getInterpolatedValue(data[0].t);
    }

    var TransformProperty = (function(){
        function processKeys(frameNum){
            var i, len = this.dynamicProperties.length;
            this.mdf = false;

            for(i=0;i<len;i+=1){
                this.dynamicProperties[i].getInterpolatedValue(frameNum);
                if(this.dynamicProperties[i].mdf){
                    this.mdf = true;
                }
            }
            if(this.mdf){
                this.v.reset().translate(this.p.v[0],this.p.v[1]).rotate(this.r.v).scale(this.s.v[0],this.s.v[1]).translate(-this.a.v[0],-this.a.v[1]);
            }
        }
        return function(elemData,data,arr){
            this.dynamicProperties = [];
            this.mdf = false;
            this.getInterpolatedValue = processKeys;
            if(typeof(data.a[0]) === 'number'){
                this.a = new MultiDimensionalProperty(data.a);
            }else{
                this.a = new KeyframedMultidimensionalProperty(elemData,data.a,0);
                this.dynamicProperties.push(this.a);
            }
            if(typeof(data.p[0]) === 'number'){
                this.p = new MultiDimensionalProperty(data.p);
            }else{
                this.p = new KeyframedMultidimensionalProperty(elemData,data.p,0);
                this.dynamicProperties.push(this.p);
            }
            if(typeof(data.s[0]) === 'number'){
                this.s = new MultiDimensionalProperty(data.s,0.01);
            }else{
                this.s = new KeyframedMultidimensionalProperty(elemData,data.s, 0.01);
                this.dynamicProperties.push(this.s);
            }
            if(data.r.length){
                this.r = new KeyframedValueProperty(elemData,data.r,degToRads);
                this.dynamicProperties.push(this.r);
            }else{
                this.r = new ValueProperty(data.r,degToRads);
            }
            if(this.dynamicProperties.length){
                arr.push(this);
                this.v = new Matrix();
            }else{
                this.v = new Matrix().translate(this.p.v[0],this.p.v[1]).rotate(this.r.v).scale(this.s.v[0],this.s.v[1]).translate(-this.a.v[0],-this.a.v[1]);
            }
        }

    }());

    function ShapeProperty(elemData,data,arr){
        if(data.pt.length){
            this.k = true;
            arr.push(this);
        }else{
            this.k = false;
        }
    }

    function getProp(elemData,data,type, mult, arr) {

        if(type === 2){
            return new TransformProperty(elemData, data, arr);
        }else if(type === 3){
            return new ShapeProperty(elemData, data, arr);
        }else if(!data.length){
            return new ValueProperty(data, mult);
        }else if(!('t' in data[0])){
            return new MultiDimensionalProperty(data, mult);
        }else{
            switch(type){
                case 0:
                    arr.push(new KeyframedValueProperty(elemData,data,mult));
                    break;
                case 1:
                    arr.push(new KeyframedMultidimensionalProperty(elemData,data,mult));
                    break;
            }
            return arr[arr.length - 1];
        }
    }

    var ob = {};
    ob.getProp = getProp;
    return ob;
}());