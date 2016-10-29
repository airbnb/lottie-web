(function addPropertyDecorator(){

    function getStaticValueAtTime(){
        return this.pv;
    }

    function getValueAtTime(frameNum, offsetTime) {
        var i = 0,len = this.keyframes.length- 1,dir= 1,flag = true;
        var keyData, nextKeyData;
        offsetTime = offsetTime === undefined ? this.offsetTime : 0;
        //console.log(this.offsetTime);
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
                    //fnc = bez.getEasingCurve(keyData.o.x,keyData.o.y,keyData.i.x,keyData.i.y,keyData.n);
                    fnc = BezierFactory.getBezierEasing(keyData.o.x,keyData.o.y,keyData.i.x,keyData.i.y,keyData.n).get;
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
        frameNum *= this.elem.globalData.frameRate;
        //frameNum += this.elem.data.st;
        var v1 = this.getValueAtTime(frameNum,0);
        var v2 = this.getValueAtTime(frameNum + delta,0);
        var velocity;
        if(v1.length){
            velocity = Array.apply(null,{length:v1.length});
            var i;
            for(i=0;i<v1.length;i+=1){
                velocity[i] = this.elem.globalData.frameRate*((v2[i] - v1[i])/delta);
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
                this.getValueAtTime = getValueAtTime;
            } else {
                this.getValueAtTime = getStaticValueAtTime;
            }
            this.setGroupProperty = setGroupProperty;
        }
    }());


    var propertyGetProp = PropertyFactory.getProp;
    PropertyFactory.getProp = function(elem,data,type, mult, arr){
        var prop = propertyGetProp(elem,data,type, mult, arr);
        prop.getVelocityAtTime = getVelocityAtTime;
        if(prop.kf){
            prop.getValueAtTime = getValueAtTime;
        } else {
            prop.getValueAtTime = getStaticValueAtTime;
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

    var propertyGetShapeProp = ShapePropertyFactory.getShapeProp;
    ShapePropertyFactory.getShapeProp = function(elem,data,type, arr, trims){
        var prop = propertyGetShapeProp(elem,data,type, arr, trims);
        prop.setGroupProperty = setGroupProperty;
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