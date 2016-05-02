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
        var delta = 0.01;
        var v1 = this.getValueAtTime(frameNum);
        var v2 = this.getValueAtTime(frameNum + delta);
        var velocity;
        if(v1.length){
            velocity = Array.apply(null,{length:v1.length});
            var i;
            for(i=0;i<v1.length;i+=1){
                velocity[i] = this.elem.globalData.frameRate*((v2[i] - v1[i])/delta);
            }
            /*console.log('frameNum: ',frameNum);
            console.log('v1: ',v1);
            console.log('v2: ',v2);
            console.log('v2[i] - v1[i]: ',v2[0] - v1[0]);
            console.log('velocity: ',velocity);*/
        } else {
            velocity = (v2 - v1)/delta;
        }
        return velocity;
    };

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
                        fnc = BezierFactory.getBezierEasing(keyData.o.x,keyData.o.y,keyData.i.x,keyData.i.y,keyData.n).get;
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
                        //fnc = bez.getEasingCurve(keyData.o.x,keyData.o.y,keyData.i.x,keyData.i.y);
                        fnc = BezierFactory.getBezierEasing(keyData.o.x,keyData.o.y,keyData.i.x,keyData.i.y).get;
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
        if(data.x){
            this.getExpression = ExpressionManager.initiateExpression;
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
        this.getVelocityAtTime = getVelocityAtTime;
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
        this.getVelocityAtTime = getVelocityAtTime;
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
            this.lastValue = [1,1,1];
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