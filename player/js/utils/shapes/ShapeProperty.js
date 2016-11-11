var ShapePropertyFactory = (function(){

    var initFrame = -999999;

    function interpolateShape() {
        if(this.elem.globalData.frameId === this.frameId){
            return;
        }
        this.mdf = false;
        var frameNum = this.comp.renderedFrame - this.offsetTime;
        if(this.lastFrame !== initFrame && ((this.lastFrame < this.keyframes[0].t-this.offsetTime && frameNum < this.keyframes[0].t-this.offsetTime) || (this.lastFrame > this.keyframes[this.keyframes.length - 1].t-this.offsetTime && frameNum > this.keyframes[this.keyframes.length - 1].t-this.offsetTime))){
        }else{
            var keyPropS,keyPropE,isHold;
            if(frameNum < this.keyframes[0].t-this.offsetTime){
                keyPropS = this.keyframes[0].s[0];
                isHold = true;
            }else if(frameNum >= this.keyframes[this.keyframes.length - 1].t-this.offsetTime){
                if(this.keyframes[this.keyframes.length - 2].h === 1){
                    //keyPropS = this.keyframes[this.keyframes.length - 1].s ? this.keyframes[this.keyframes.length - 1].s[0] : this.keyframes[this.keyframes.length - 2].s[0];
                    keyPropS = this.keyframes[this.keyframes.length - 1].s[0];
                }else{
                    keyPropS = this.keyframes[this.keyframes.length - 2].e[0];
                }
                isHold = true;
            }else{
                var i = 0,len = this.keyframes.length- 1,flag = true,keyData,nextKeyData, j, jLen, k, kLen;
                while(flag){
                    keyData = this.keyframes[i];
                    nextKeyData = this.keyframes[i+1];
                    if((nextKeyData.t - this.offsetTime) > frameNum){
                        break;
                    }
                    if(i < len - 1){
                        i += 1;
                    }else{
                        flag = false;
                    }
                }
                isHold = keyData.h === 1;
                if(isHold && i === len){
                    keyData = nextKeyData;
                }

                var perc;
                if(!isHold){
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
            }
            jLen = this.v.i.length;
            kLen = keyPropS.i[0].length;
            var hasModified = false;
            var vertexValue;
            for(j=0;j<jLen;j+=1){
                for(k=0;k<kLen;k+=1){
                    if(isHold){
                        vertexValue = keyPropS.i[j][k];
                        if(this.v.i[j][k] !== vertexValue){
                            this.v.i[j][k] = vertexValue;
                            this.pv.i[j][k] = vertexValue;
                            hasModified = true;
                        }
                        vertexValue = keyPropS.o[j][k];
                        if(this.v.o[j][k] !== vertexValue){
                            this.v.o[j][k] = vertexValue;
                            this.pv.o[j][k] = vertexValue;
                            hasModified = true;
                        }
                        vertexValue = keyPropS.v[j][k];
                        if(this.v.v[j][k] !== vertexValue){
                            this.v.v[j][k] = vertexValue;
                            this.pv.v[j][k] = vertexValue;
                            hasModified = true;
                        }
                    }else{
                        vertexValue = keyPropS.i[j][k]+(keyPropE.i[j][k]-keyPropS.i[j][k])*perc;
                        if(this.v.i[j][k] !== vertexValue){
                            this.v.i[j][k] = vertexValue;
                            this.pv.i[j][k] = vertexValue;
                            hasModified = true;
                        }
                        vertexValue = keyPropS.o[j][k]+(keyPropE.o[j][k]-keyPropS.o[j][k])*perc;
                        if(this.v.o[j][k] !== vertexValue){
                            this.v.o[j][k] = vertexValue;
                            this.pv.o[j][k] = vertexValue;
                            hasModified = true;
                        }
                        vertexValue = keyPropS.v[j][k]+(keyPropE.v[j][k]-keyPropS.v[j][k])*perc;
                        if(this.v.v[j][k] !== vertexValue){
                            this.v.v[j][k] = vertexValue;
                            this.pv.v[j][k] = vertexValue;
                            hasModified = true;
                        }
                    }
                }
            }
            this.mdf = hasModified;
            this.paths.length = 0;
            this.v.c = keyPropS.c;
            this.paths[0] = this.v;
        }

        this.lastFrame = frameNum;
        this.frameId = this.elem.globalData.frameId;
    }

    function getShapeValue(){
        return this.v;
    }

    function resetShape(){
        if(this.paths.length){
            this.paths.length = 1;
            this.paths[0] = this.v;
        } else {
            this.paths = [this.v];
        }
        if(!this.k){
            this.mdf = false;
        }
    }

    function ShapeProperty(elem, data, type){
        this.comp = elem.comp;
        this.k = false;
        this.mdf = false;
        this.numNodes = type === 3 ? data.pt.k.v.length : data.ks.k.v.length;
        this.v = type === 3 ? data.pt.k : data.ks.k;
        this.getValue = getShapeValue;
        this.pv = this.v;
        this.paths = [this.v];
        this.reset = resetShape;
    }

    function KeyframedShapeProperty(elem,data,type){
        this.comp = elem.comp;
        this.elem = elem;
        this.offsetTime = elem.data.st;
        this.getValue = interpolateShape;
        this.keyframes = type === 3 ? data.pt.k : data.ks.k;
        this.k = true;
        var i, len = this.keyframes[0].s[0].i.length;
        var jLen = this.keyframes[0].s[0].i[0].length;
        this.numNodes = len;
        this.v = {
            i: Array.apply(null,{length:len}),
            o: Array.apply(null,{length:len}),
            v: Array.apply(null,{length:len}),
            c: this.keyframes[0].s[0].c
        };
        this.pv = {
            i: Array.apply(null,{length:len}),
            o: Array.apply(null,{length:len}),
            v: Array.apply(null,{length:len}),
            c: this.keyframes[0].s[0].c
        };
        for(i=0;i<len;i+=1){
            this.v.i[i] = Array.apply(null,{length:jLen});
            this.v.o[i] = Array.apply(null,{length:jLen});
            this.v.v[i] = Array.apply(null,{length:jLen});
            this.pv.i[i] = Array.apply(null,{length:jLen});
            this.pv.o[i] = Array.apply(null,{length:jLen});
            this.pv.v[i] = Array.apply(null,{length:jLen});
        }
        this.paths = [];
        this.lastFrame = initFrame;
        this.reset = resetShape;
    }

    var EllShapeProperty = (function(){

        var cPoint = roundCorner;

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
            this.paths.length = 0;
            this.paths[0] = this.v;
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
                this.paths.length = 0;
                this.paths[0] = this.v;
            }
        }

        return function EllShapeProperty(elem,data) {
            this.v = {
                v: Array.apply(null,{length:4}),
                i: Array.apply(null,{length:4}),
                o: Array.apply(null,{length:4}),
                c: true
            };
            this.numNodes = 4;
            this.d = data.d;
            this.dynamicProperties = [];
            this.paths = [];
            this.elem = elem;
            this.comp = elem.comp;
            this.frameId = -1;
            this.mdf = false;
            this.getValue = processKeys;
            this.convertEllToPath = convertEllToPath;
            this.reset = resetShape;
            this.p = PropertyFactory.getProp(elem,data.p,1,0,this.dynamicProperties);
            this.s = PropertyFactory.getProp(elem,data.s,1,0,this.dynamicProperties);
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
            this.paths.length = 0;
            this.paths[0] = this.v;
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
            this.paths.length = 0;
            this.paths[0] = this.v;
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
            this.getValue = processKeys;
            this.reset = resetShape;
            if(data.sy === 1){
                this.ir = PropertyFactory.getProp(elem,data.ir,0,0,this.dynamicProperties);
                this.is = PropertyFactory.getProp(elem,data.is,0,0.01,this.dynamicProperties);
                this.convertToPath = convertStarToPath;
            } else {
                this.convertToPath = convertPolygonToPath;
            }
            this.pt = PropertyFactory.getProp(elem,data.pt,0,0,this.dynamicProperties);
            this.p = PropertyFactory.getProp(elem,data.p,1,0,this.dynamicProperties);
            this.r = PropertyFactory.getProp(elem,data.r,0,degToRads,this.dynamicProperties);
            this.or = PropertyFactory.getProp(elem,data.or,0,0,this.dynamicProperties);
            this.os = PropertyFactory.getProp(elem,data.os,0,0.01,this.dynamicProperties);
            this.paths = [];
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
            var cPoint = round*(1-roundCorner);
            if(round === 0){
                this.v.v.length = 4;
                this.v.i.length = 4;
                this.v.o.length = 4;
            } else {
                this.v.v.length = 8;
                this.v.i.length = 8;
                this.v.o.length = 8;
            }

            if(this.d === 2 || this.d === 1) {

                this.v.v[0] = [p0+v0,p1-v1+round];
                this.v.o[0] = this.v.v[0];
                this.v.i[0] = [p0+v0,p1-v1+cPoint];

                this.v.v[1] = [p0+v0,p1+v1-round];
                this.v.o[1] = [p0+v0,p1+v1-cPoint];
                this.v.i[1] = this.v.v[1];

                if(round!== 0){
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
                } else {
                    this.v.v[2] = [p0-v0+round,p1+v1];
                    this.v.o[2] = [p0-v0+cPoint,p1+v1];
                    this.v.i[2] = this.v.v[2];
                    this.v.v[3] = [p0-v0,p1-v1+round];
                    this.v.o[3] = [p0-v0,p1-v1+cPoint];
                    this.v.i[3] = this.v.v[3];
                }
            }else{
                this.v.v[0] = [p0+v0,p1-v1+round];
                this.v.o[0] = [p0+v0,p1-v1+cPoint];
                this.v.i[0] = this.v.v[0];

                if(round!== 0){
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
                } else {
                    this.v.v[1] = [p0-v0+round,p1-v1];
                    this.v.o[1] = [p0-v0+cPoint,p1-v1];
                    this.v.i[1] = this.v.v[1];
                    this.v.v[2] = [p0-v0,p1+v1-round];
                    this.v.o[2] = [p0-v0,p1+v1-cPoint];
                    this.v.i[2] = this.v.v[2];
                    this.v.v[3] = [p0+v0-round,p1+v1];
                    this.v.o[3] = [p0+v0-cPoint,p1+v1];
                    this.v.i[3] = this.v.v[3];

                }
            }
            this.paths.length = 0;
            this.paths[0] = this.v;
        }

        return function RectShapeProperty(elem,data) {
            this.v = {
                v: Array.apply(null,{length:8}),
                i: Array.apply(null,{length:8}),
                o: Array.apply(null,{length:8}),
                c: true
            };
            this.idd = randomString(10);
            this.paths = [];
            this.numNodes = 8;
            this.elem = elem;
            this.comp = elem.comp;
            this.frameId = -1;
            this.d = data.d;
            this.dynamicProperties = [];
            this.mdf = false;
            this.getValue = processKeys;
            this.convertRectToPath = convertRectToPath;
            this.reset = resetShape;
            this.p = PropertyFactory.getProp(elem,data.p,1,0,this.dynamicProperties);
            this.s = PropertyFactory.getProp(elem,data.s,1,0,this.dynamicProperties);
            this.r = PropertyFactory.getProp(elem,data.r,0,0,this.dynamicProperties);
            if(this.dynamicProperties.length){
                this.k = true;
            }else{
                this.convertRectToPath();
            }
        }
    }());

    function getShapeProp(elem,data,type, arr){
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
        if(prop.k){
            arr.push(prop);
        }
        return prop;
    }

    var ob = {};
    ob.getShapeProp = getShapeProp;
    return ob;
}());