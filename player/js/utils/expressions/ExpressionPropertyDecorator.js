(function addPropertyDecorator() {

    function getStaticValueAtTime() {
        return this.pv;
    }

    function getValueAtTime(frameNum, offsetTime) {
        frameNum *= this.elem.globalData.frameRate;
        var i = 0,len = this.keyframes.length- 1,dir= 1,flag = true;
        var keyData, nextKeyData;
        offsetTime = offsetTime === undefined ? this.offsetTime : 0;
        var retVal = typeof this.pv === 'object' ? [this.pv._length] : 0;

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
        if (keyData.to) {

            if (!keyData.bezierData) {
                bez.buildBezierData(keyData);
            }
            var bezierData = keyData.bezierData;
            if (frameNum >= nextKeyData.t-offsetTime || frameNum < keyData.t-offsetTime) {
                var ind = frameNum >= nextKeyData.t-offsetTime ? bezierData.points.length - 1 : 0;
                kLen = bezierData.points[ind].point.length;
                for(k = 0; k < kLen; k += 1){
                    retVal[k] = bezierData.points[ind].point[k];
                }
            } else {
                if (keyData.__fnct) {
                    fnc = keyData.__fnct;
                } else {
                    //fnc = bez.getEasingCurve(keyData.o.x,keyData.o.y,keyData.i.x,keyData.i.y,keyData.n);
                    fnc = BezierFactory.getBezierEasing(keyData.o.x, keyData.o.y, keyData.i.x, keyData.i.y, keyData.n).get;
                    keyData.__fnct = fnc;
                }
                perc = fnc((frameNum - (keyData.t - offsetTime)) / ((nextKeyData.t - offsetTime) - (keyData.t - offsetTime)));
                var distanceInLine = bezierData.segmentLength * perc;

                var segmentPerc;
                var addedLength = 0;
                dir = 1;
                flag = true;
                jLen = bezierData.points.length;
                while(flag) {
                    addedLength += bezierData.points[j].partialLength*dir;
                    if (distanceInLine === 0 || perc === 0 || j == bezierData.points.length - 1) {
                        kLen = bezierData.points[j].point.length;
                        for (k = 0; k < kLen; k += 1) {
                            retVal[k] = bezierData.points[j].point[k];
                        }
                        break;
                    } else if (distanceInLine >= addedLength && distanceInLine < addedLength + bezierData.points[j+1].partialLength){
                        segmentPerc = (distanceInLine - addedLength) / (bezierData.points[j + 1].partialLength);
                        kLen = bezierData.points[j].point.length;
                        for (k = 0; k < kLen; k += 1) {
                            retVal[k] = bezierData.points[j].point[k] + (bezierData.points[j+1].point[k] - bezierData.points[j].point[k]) * segmentPerc;
                        }
                        break;
                    }
                    if (j < jLen - 1 && dir == 1 || j > 0 && dir == -1) {
                        j += dir;
                    } else {
                        flag = false;
                    }
                }
            }
        } else {
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
                            //fnc = bez.getEasingCurve(outX,outY,inX,inY);
                            fnc = BezierFactory.getBezierEasing(outX,outY,inX,inY).get;
                            keyData.__fnct[i] = fnc;
                        }
                    }else{
                        if(keyData.__fnct){
                            fnc = keyData.__fnct;
                        }else{
                            //fnc = bez.getEasingCurve(outX,outY,inX,inY);
                            fnc = BezierFactory.getBezierEasing(outX,outY,inX,inY).get;
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

    function getVelocityAtTime(frameNum) {
        if(this.vel !== undefined){
            return this.vel;
        }
        var delta = -0.01;
        //frameNum += this.elem.data.st;
        var v1 = this.getValueAtTime(frameNum, 0);
        var v2 = this.getValueAtTime(frameNum + delta, 0);
        var velocity;
        if(v1.length){
            velocity = Array.apply(null,{length:v1.length});
            var i;
            for(i=0;i<v1.length;i+=1){
                //removing frameRate
                //if needed, don't add it here
                //velocity[i] = this.elem.globalData.frameRate*((v2[i] - v1[i])/delta);
                velocity[i] = (v2[i] - v1[i])/delta;
            }
        } else {
            velocity = (v2 - v1)/delta;
        }
        return velocity;
    };

    function setGroupProperty(propertyGroup){
        this.propertyGroup = propertyGroup;
    }

    function searchExpressions(elem,data,prop){
        if(data.x){
            prop.k = true;
            prop.x = true;
            if(prop.getValue) {
                prop.getPreValue = prop.getValue;
            }
            prop.getValue = ExpressionManager.initiateExpression.bind(prop)(elem,data,prop);
        }
    }

    function getTransformValueAtTime(time) {
        console.log('time:', time)
    }

    function getTransformStaticValueAtTime(time) {

    }

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
            this.elem = elem;
            this.mult = .01;
            this.type = 'textSelector';
            this.textTotal = data.totalChars;
            this.selectorValue = 100;
            this.lastValue = [1,1,1];
            searchExpressions.bind(this)(elem,data,this);
            this.getMult = getValueProxy;
            this.getVelocityAtTime = getVelocityAtTime;
            if(this.kf){
                this.getValueAtTime = getValueAtTime.bind(this);
            } else {
                this.getValueAtTime = getStaticValueAtTime.bind(this);
            }
            this.setGroupProperty = setGroupProperty;
        }
    }());


    var propertyGetProp = PropertyFactory.getProp;
    PropertyFactory.getProp = function(elem,data,type, mult, arr){
        var prop = propertyGetProp(elem,data,type, mult, arr);
        prop.getVelocityAtTime = getVelocityAtTime;
        if(type === 2) {
            if(prop.dynamicProperties.length) {
                prop.getValueAtTime = getTransformValueAtTime.bind(prop);
            } else {
                prop.getValueAtTime = getTransformStaticValueAtTime.bind(prop);
            }
        } else {
            if(prop.kf){
                prop.getValueAtTime = getValueAtTime.bind(prop);
            } else {
                prop.getValueAtTime = getStaticValueAtTime.bind(prop);
            }
        }
        prop.setGroupProperty = setGroupProperty;
        var isAdded = prop.k;
        if(data.ix !== undefined){
            Object.defineProperty(prop,'propertyIndex',{
                get: function(){
                    return data.ix;
                }
            })
        }
        searchExpressions(elem,data,prop);
        if(!isAdded && prop.x){
            arr.push(prop);
        }

        return prop;
    }

    function getShapeValueAtTime(frameNum) {
        if (!this._shapeValueAtTime) {
            this._lastIndexAtTime = 0;
            this._lastTimeAtTime = -999999;
            this._shapeValueAtTime = shape_pool.clone(this.pv);
        }
        if(frameNum !== this._lastTimeAtTime) {
            this._lastTimeAtTime = frameNum;
            frameNum *= this.elem.globalData.frameRate;
            var interpolationResult = this.interpolateShape(frameNum, this._lastIndexAtTime, this._shapeValueAtTime, false);
            this._lastIndexAtTime = interpolationResult.iterationIndex;
        }
        return this._shapeValueAtTime;
    }

    var ShapePropertyConstructorFunction = ShapePropertyFactory.getConstructorFunction();
    var KeyframedShapePropertyConstructorFunction = ShapePropertyFactory.getKeyframedConstructorFunction();

    ShapePropertyConstructorFunction.prototype.vertices = function(prop, time){
        var shapePath = this.v;
        if(time !== undefined) {
            shapePath = this.getValueAtTime(time, 0);
        }
        var i, len = shapePath._length;
        var vertices = shapePath[prop];
        var points = shapePath.v;
        var arr = Array.apply(null,{length:len})
        for(i = 0; i < len; i += 1) {
            if(prop === 'i' || prop === 'o') {
                arr[i] = [vertices[i][0] - points[i][0], vertices[i][1] - points[i][1]]
            } else {
                arr[i] = [vertices[i][0], vertices[i][1]]
            }
            
        }
        return arr;
    }

    ShapePropertyConstructorFunction.prototype.points = function(time){
        return this.vertices('v', time);
    }

    ShapePropertyConstructorFunction.prototype.inTangents = function(time){
        return this.vertices('i', time);
    }

    ShapePropertyConstructorFunction.prototype.outTangents = function(time){
        return this.vertices('o', time);
    }

    ShapePropertyConstructorFunction.prototype.isClosed = function(){
        return this.v.c;
    }

    ShapePropertyConstructorFunction.prototype.pointOnPath = function(perc, time){
        var shapePath = this.v;
        if(time !== undefined) {
            shapePath = this.getValueAtTime(time, 0);
        }
        if(!this._segmentsLength) {
            this._segmentsLength = bez.getSegmentsLength(shapePath);
        }

        var segmentsLength = this._segmentsLength;
        var lengths = segmentsLength.lengths;
        var lengthPos = segmentsLength.totalLength * perc;
        var i = 0, len = lengths.length;
        var j = 0, jLen;
        var accumulatedLength = 0;
        var segments;
        while(i < len) {
            if(accumulatedLength + lengths[i].addedLength > lengthPos) {
                segments = lengths[i].segments;
                var initIndex = i;
                var endIndex = (shapePath.c && i === len - 1) ? 0 : i + 1;
                var segmentPerc = (lengthPos - accumulatedLength)/lengths[i].addedLength;
                var pt = bez.getPointInSegment(shapePath.v[initIndex], shapePath.v[endIndex], shapePath.o[initIndex], shapePath.i[endIndex], segmentPerc, lengths[i])
                break;
            } else {
                accumulatedLength += lengths[i].addedLength;
            }
            i += 1;
        }
        if(!pt){
            pt = shapePath.c ? [shapePath.v[0][0],shapePath.v[0][1]]:[shapePath.v[shapePath._length-1][0],shapePath.v[shapePath._length-1][1]]
        }
        return pt;
    }

    ShapePropertyConstructorFunction.prototype.setGroupProperty = setGroupProperty;
    ShapePropertyConstructorFunction.prototype.getValueAtTime = getStaticValueAtTime;

    KeyframedShapePropertyConstructorFunction.prototype.vertices = ShapePropertyConstructorFunction.prototype.vertices;
    KeyframedShapePropertyConstructorFunction.prototype.points = ShapePropertyConstructorFunction.prototype.points;
    KeyframedShapePropertyConstructorFunction.prototype.inTangents = ShapePropertyConstructorFunction.prototype.inTangents;
    KeyframedShapePropertyConstructorFunction.prototype.outTangents = ShapePropertyConstructorFunction.prototype.outTangents;
    KeyframedShapePropertyConstructorFunction.prototype.isClosed = ShapePropertyConstructorFunction.prototype.isClosed;
    KeyframedShapePropertyConstructorFunction.prototype.pointOnPath = ShapePropertyConstructorFunction.prototype.pointOnPath;
    KeyframedShapePropertyConstructorFunction.prototype.setGroupProperty = ShapePropertyConstructorFunction.prototype.setGroupProperty;
    KeyframedShapePropertyConstructorFunction.prototype.getValueAtTime = getShapeValueAtTime;

    var propertyGetShapeProp = ShapePropertyFactory.getShapeProp;
    ShapePropertyFactory.getShapeProp = function(elem,data,type, arr, trims){
        var prop = propertyGetShapeProp(elem,data,type, arr, trims);
        var isAdded = prop.k;
        if(data.ix !== undefined){
            Object.defineProperty(prop,'propertyIndex',{
                get: function(){
                    return data.ix;
                }
            })
        }
        if(type === 3){
            searchExpressions(elem,data.pt,prop);
        } else if(type === 4){
            searchExpressions(elem,data.ks,prop);
        }
        if(!isAdded && prop.x){
            arr.push(prop);
        }
        return prop;
    }

    var propertyGetTextProp = PropertyFactory.getTextSelectorProp;
    PropertyFactory.getTextSelectorProp = function(elem, data,arr){
        if(data.t === 1){
            return new TextExpressionSelectorProp(elem, data,arr);
        } else {
            return propertyGetTextProp(elem,data,arr);
        }
    }
}());