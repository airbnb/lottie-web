var ShapePropertyFactory = (function(){

    var initFrame = -999999;

    function interpolateShape(frameNum, iterationIndex, previousValue, isCurrentRender) {
        var keyPropS,keyPropE,isHold;
        if(frameNum < this.keyframes[0].t-this.offsetTime){
            keyPropS = this.keyframes[0].s[0];
            isHold = true;
            iterationIndex = 0;
        }else if(frameNum >= this.keyframes[this.keyframes.length - 1].t-this.offsetTime){
            if(this.keyframes[this.keyframes.length - 2].h === 1){
                keyPropS = this.keyframes[this.keyframes.length - 1].s[0];
            }else{
                keyPropS = this.keyframes[this.keyframes.length - 2].e[0];
            }
            isHold = true;
        }else{
            var i = iterationIndex;
            var len = this.keyframes.length- 1,flag = true,keyData,nextKeyData, j, jLen, k, kLen;
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
            iterationIndex = i;

            var perc;
            if(!isHold){
                if(frameNum >= nextKeyData.t-this.offsetTime){
                    perc = 1;
                }else if(frameNum < keyData.t-this.offsetTime){
                    perc = 0;
                }else{
                    var fnc;
                    if(keyData.__fnct){
                        fnc = keyData.__fnct;
                    }else{
                        fnc = BezierFactory.getBezierEasing(keyData.o.x,keyData.o.y,keyData.i.x,keyData.i.y).get;
                        keyData.__fnct = fnc;
                    }
                    perc = fnc((frameNum-(keyData.t-this.offsetTime))/((nextKeyData.t-this.offsetTime)-(keyData.t-this.offsetTime)));
                }
                keyPropE = keyData.e[0];
            }
            keyPropS = keyData.s[0];
        }
        jLen = previousValue._length;
        kLen = keyPropS.i[0].length;
        var hasModified = false;
        var vertexValue;
        for(j=0;j<jLen;j+=1){
            for(k=0;k<kLen;k+=1){
                if(isHold){
                    vertexValue = keyPropS.i[j][k];
                    if(previousValue.i[j][k] !== vertexValue){
                        previousValue.i[j][k] = vertexValue;
                        if(isCurrentRender) {
                            this.pv.i[j][k] = vertexValue;
                        }
                        hasModified = true;
                    }
                    vertexValue = keyPropS.o[j][k];
                    if(previousValue.o[j][k] !== vertexValue){
                        previousValue.o[j][k] = vertexValue;
                        if(isCurrentRender) {
                            this.pv.o[j][k] = vertexValue;
                        }
                        hasModified = true;
                    }
                    vertexValue = keyPropS.v[j][k];
                    if(previousValue.v[j][k] !== vertexValue){
                        previousValue.v[j][k] = vertexValue;
                        if(isCurrentRender) {
                            this.pv.v[j][k] = vertexValue;
                        }
                        hasModified = true;
                    }
                }else{
                    vertexValue = keyPropS.i[j][k]+(keyPropE.i[j][k]-keyPropS.i[j][k])*perc;
                    if(previousValue.i[j][k] !== vertexValue){
                        previousValue.i[j][k] = vertexValue;
                        if(isCurrentRender) {
                            this.pv.i[j][k] = vertexValue;
                        }
                        hasModified = true;
                    }
                    vertexValue = keyPropS.o[j][k]+(keyPropE.o[j][k]-keyPropS.o[j][k])*perc;
                    if(previousValue.o[j][k] !== vertexValue){
                        previousValue.o[j][k] = vertexValue;
                        if(isCurrentRender) {
                            this.pv.o[j][k] = vertexValue;
                        }
                        hasModified = true;
                    }
                    vertexValue = keyPropS.v[j][k]+(keyPropE.v[j][k]-keyPropS.v[j][k])*perc;
                    if(previousValue.v[j][k] !== vertexValue){
                        previousValue.v[j][k] = vertexValue;
                        if(isCurrentRender) {
                            this.pv.v[j][k] = vertexValue;
                        }
                        hasModified = true;
                    }
                }
            }
        }
        if(hasModified) {
            previousValue.c = keyPropS.c;
        }
        return {
            iterationIndex: iterationIndex,
            hasModified: hasModified
        }
    }

    function interpolateShapeCurrentTime(){
        if(this.elem.globalData.frameId === this.frameId){
            return;
        }
        this.mdf = false;
        var frameNum = this.comp.renderedFrame - this.offsetTime;
        var initTime = this.keyframes[0].t - this.offsetTime;
        var endTime = this.keyframes[this.keyframes.length - 1].t - this.offsetTime;
        if(!(this.lastFrame !== initFrame && ((this.lastFrame < initTime && frameNum < initTime) || (this.lastFrame > endTime && frameNum > endTime)))){
            ////
            var i = this.lastFrame < frameNum ? this._lastIndex : 0;
            var renderResult = this.interpolateShape(frameNum, i, this.v, true);
            ////
            this._lastIndex = renderResult.iterationIndex;
            this.mdf = renderResult.hasModified;
            if(renderResult.hasModified) {
                this.paths = this.localShapeCollection;
            }
        }
        this.lastFrame = frameNum;
        this.frameId = this.elem.globalData.frameId;
    }

    function getShapeValue(){
        return this.v;
    }

    function resetShape(){
        this.paths = this.localShapeCollection;
        if(!this.k){
            this.mdf = false;
        }
    }

    function ShapeProperty(elem, data, type){
        this.__shapeObject = 1;
        this.comp = elem.comp;
        this.k = false;
        this.mdf = false;
        var pathData = type === 3 ? data.pt.k : data.ks.k;
        this.v = shape_pool.clone(pathData);
        this.pv = shape_pool.clone(this.v);
        this.localShapeCollection = shapeCollection_pool.newShapeCollection();
        this.paths = this.localShapeCollection;
        this.paths.addShape(this.v);
        this.reset = resetShape;
    }
    ShapeProperty.prototype.interpolateShape = interpolateShape;
    ShapeProperty.prototype.getValue = getShapeValue;

    function KeyframedShapeProperty(elem,data,type){
        this.__shapeObject = 1;
        this.comp = elem.comp;
        this.elem = elem;
        this.offsetTime = elem.data.st;
        this._lastIndex = 0;
        this.keyframes = type === 3 ? data.pt.k : data.ks.k;
        this.k = true;
        this.kf = true;
        var i, len = this.keyframes[0].s[0].i.length;
        var jLen = this.keyframes[0].s[0].i[0].length;
        this.v = shape_pool.newShape();
        this.v.setPathData(this.keyframes[0].s[0].c, len);
        this.pv = shape_pool.clone(this.v);
        this.localShapeCollection = shapeCollection_pool.newShapeCollection();
        this.paths = this.localShapeCollection;
        this.paths.addShape(this.v);
        this.lastFrame = initFrame;
        this.reset = resetShape;
    }
    KeyframedShapeProperty.prototype.getValue = interpolateShapeCurrentTime;
    KeyframedShapeProperty.prototype.interpolateShape = interpolateShape;

    var EllShapeProperty = (function(){

        var cPoint = roundCorner;

        function convertEllToPath(){
            var p0 = this.p.v[0], p1 = this.p.v[1], s0 = this.s.v[0]/2, s1 = this.s.v[1]/2;
            if(this.d !== 3){
                this.v.v[0][0] = p0;
                this.v.v[0][1] = p1-s1;
                this.v.v[1][0] = p0 + s0;
                this.v.v[1][1] = p1;
                this.v.v[2][0] = p0;
                this.v.v[2][1] = p1+s1;
                this.v.v[3][0] = p0 - s0;
                this.v.v[3][1] = p1;
                this.v.i[0][0] = p0 - s0*cPoint;
                this.v.i[0][1] = p1 - s1;
                this.v.i[1][0] = p0 + s0;
                this.v.i[1][1] = p1 - s1*cPoint;
                this.v.i[2][0] = p0 + s0*cPoint;
                this.v.i[2][1] = p1 + s1;
                this.v.i[3][0] = p0 - s0;
                this.v.i[3][1] = p1 + s1*cPoint;
                this.v.o[0][0] = p0 + s0*cPoint;
                this.v.o[0][1] = p1 - s1;
                this.v.o[1][0] = p0 + s0;
                this.v.o[1][1] = p1 + s1*cPoint;
                this.v.o[2][0] = p0 - s0*cPoint;
                this.v.o[2][1] = p1 + s1;
                this.v.o[3][0] = p0 - s0;
                this.v.o[3][1] = p1 - s1*cPoint;
            }else{
                this.v.v[0][0] = p0;
                this.v.v[0][1] = p1-s1;
                this.v.v[1][0] = p0 - s0;
                this.v.v[1][1] = p1;
                this.v.v[2][0] = p0;
                this.v.v[2][1] = p1+s1;
                this.v.v[3][0] = p0 + s0;
                this.v.v[3][1] = p1;
                this.v.i[0][0] = p0 + s0*cPoint;
                this.v.i[0][1] = p1 - s1;
                this.v.i[1][0] = p0 - s0;
                this.v.i[1][1] = p1 - s1*cPoint;
                this.v.i[2][0] = p0 - s0*cPoint;
                this.v.i[2][1] = p1 + s1;
                this.v.i[3][0] = p0 + s0;
                this.v.i[3][1] = p1 + s1*cPoint;
                this.v.o[0][0] = p0 - s0*cPoint;
                this.v.o[0][1] = p1 - s1;
                this.v.o[1][0] = p0 - s0;
                this.v.o[1][1] = p1 + s1*cPoint;
                this.v.o[2][0] = p0 + s0*cPoint;
                this.v.o[2][1] = p1 + s1;
                this.v.o[3][0] = p0 + s0;
                this.v.o[3][1] = p1 - s1*cPoint;
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
            /*this.v = {
                v: Array.apply(null,{length:4}),
                i: Array.apply(null,{length:4}),
                o: Array.apply(null,{length:4}),
                c: true
            };*/
            this.v = shape_pool.newShape();
            this.v.setPathData(true, 4);
            this.localShapeCollection = shapeCollection_pool.newShapeCollection();
            this.paths = this.localShapeCollection;
            this.localShapeCollection.addShape(this.v);
            this.d = data.d;
            this.dynamicProperties = [];
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
            /*this.v.v.length = numPts;
            this.v.i.length = numPts;
            this.v.o.length = numPts;*/
            var rad = this.or.v;
            var roundness = this.os.v;
            var perimSegment = 2*Math.PI*rad/(numPts*4);
            var i, currentAng = -Math.PI/ 2;
            var dir = this.data.d === 3 ? -1 : 1;
            currentAng += this.r.v;
            this.v._length = 0;
            for(i=0;i<numPts;i+=1){
                var x = rad * Math.cos(currentAng);
                var y = rad * Math.sin(currentAng);
                var ox = x === 0 && y === 0 ? 0 : y/Math.sqrt(x*x + y*y);
                var oy = x === 0 && y === 0 ? 0 : -x/Math.sqrt(x*x + y*y);
                x +=  + this.p.v[0];
                y +=  + this.p.v[1];
                this.v.setTripleAt(x,y,x-ox*perimSegment*roundness*dir,y-oy*perimSegment*roundness*dir,x+ox*perimSegment*roundness*dir,y+oy*perimSegment*roundness*dir, i, true);
                /*this.v.v[i] = [x,y];
                this.v.i[i] = [x+ox*perimSegment*roundness*dir,y+oy*perimSegment*roundness*dir];
                this.v.o[i] = [x-ox*perimSegment*roundness*dir,y-oy*perimSegment*roundness*dir];*/
                currentAng += angle*dir;
            }
            this.paths.length = 0;
            this.paths[0] = this.v;
        }

        function convertStarToPath() {
            var numPts = Math.floor(this.pt.v)*2;
            var angle = Math.PI*2/numPts;
            /*this.v.v.length = numPts;
            this.v.i.length = numPts;
            this.v.o.length = numPts;*/
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
            this.v._length = 0;
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
                this.v.setTripleAt(x,y,x-ox*perimSegment*roundness*dir,y-oy*perimSegment*roundness*dir,x+ox*perimSegment*roundness*dir,y+oy*perimSegment*roundness*dir, i, true);

                /*this.v.v[i] = [x,y];
                this.v.i[i] = [x+ox*perimSegment*roundness*dir,y+oy*perimSegment*roundness*dir];
                this.v.o[i] = [x-ox*perimSegment*roundness*dir,y-oy*perimSegment*roundness*dir];
                this.v._length = numPts;*/
                longFlag = !longFlag;
                currentAng += angle*dir;
            }
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
            /*this.v = {
                v: [],
                i: [],
                o: [],
                c: true
            };*/
            this.v = shape_pool.newShape();
            this.v.setPathData(true, 0);
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
            this.localShapeCollection = shapeCollection_pool.newShapeCollection();
            this.localShapeCollection.addShape(this.v);
            this.paths = this.localShapeCollection;
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
            this.v._length = 0;

            if(this.d === 2 || this.d === 1) {
                this.v.setTripleAt(p0+v0, p1-v1+round,p0+v0, p1-v1+round,p0+v0,p1-v1+cPoint,0, true);
                this.v.setTripleAt(p0+v0, p1+v1-round,p0+v0, p1+v1-cPoint,p0+v0, p1+v1-round,1, true);
                if(round!== 0){
                    this.v.setTripleAt(p0+v0-round, p1+v1,p0+v0-round,p1+v1,p0+v0-cPoint,p1+v1,2, true);
                    this.v.setTripleAt(p0-v0+round,p1+v1,p0-v0+cPoint,p1+v1,p0-v0+round,p1+v1,3, true);
                    this.v.setTripleAt(p0-v0,p1+v1-round,p0-v0,p1+v1-round,p0-v0,p1+v1-cPoint,4, true);
                    this.v.setTripleAt(p0-v0,p1-v1+round,p0-v0,p1-v1+cPoint,p0-v0,p1-v1+round,5, true);
                    this.v.setTripleAt(p0-v0+round,p1-v1,p0-v0+round,p1-v1,p0-v0+cPoint,p1-v1,6, true);
                    this.v.setTripleAt(p0+v0-round,p1-v1,p0+v0-cPoint,p1-v1,p0+v0-round,p1-v1,7, true);
                } else {
                    this.v.setTripleAt(p0-v0,p1+v1,p0-v0+cPoint,p1+v1,p0-v0,p1+v1,2);
                    this.v.setTripleAt(p0-v0,p1-v1,p0-v0,p1-v1+cPoint,p0-v0,p1-v1,3);
                }
            }else{
                this.v.setTripleAt(p0+v0,p1-v1+round,p0+v0,p1-v1+cPoint,p0+v0,p1-v1+round,0, true);
                if(round!== 0){
                    this.v.setTripleAt(p0+v0-round,p1-v1,p0+v0-round,p1-v1,p0+v0-cPoint,p1-v1,1, true);
                    this.v.setTripleAt(p0-v0+round,p1-v1,p0-v0+cPoint,p1-v1,p0-v0+round,p1-v1,2, true);
                    this.v.setTripleAt(p0-v0,p1-v1+round,p0-v0,p1-v1+round,p0-v0,p1-v1+cPoint,3, true);
                    this.v.setTripleAt(p0-v0,p1+v1-round,p0-v0,p1+v1-cPoint,p0-v0,p1+v1-round,4, true);
                    this.v.setTripleAt(p0-v0+round,p1+v1,p0-v0+round,p1+v1,p0-v0+cPoint,p1+v1,5, true);
                    this.v.setTripleAt(p0+v0-round,p1+v1,p0+v0-cPoint,p1+v1,p0+v0-round,p1+v1,6, true);
                    this.v.setTripleAt(p0+v0,p1+v1-round,p0+v0,p1+v1-round,p0+v0,p1+v1-cPoint,7, true);
                } else {
                    this.v.setTripleAt(p0-v0,p1-v1,p0-v0+cPoint,p1-v1,p0-v0,p1-v1,1, true);
                    this.v.setTripleAt(p0-v0,p1+v1,p0-v0,p1+v1-cPoint,p0-v0,p1+v1,2, true);
                    this.v.setTripleAt(p0+v0,p1+v1,p0+v0-cPoint,p1+v1,p0+v0,p1+v1,3, true);

                }
            }
        }

        return function RectShapeProperty(elem,data) {
            this.v = shape_pool.newShape();
            this.v.c = true;
            this.localShapeCollection = shapeCollection_pool.newShapeCollection();
            this.localShapeCollection.addShape(this.v);
            this.paths = this.localShapeCollection;
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
            var dataProp = type === 3 ? data.pt : data.ks;
            var keys = dataProp.k;
            if(dataProp.a === 1 || keys.length){
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

    function getConstructorFunction() {
        return ShapeProperty;
    }

    function getKeyframedConstructorFunction() {
        return KeyframedShapeProperty;
    }

    var ob = {};
    ob.getShapeProp = getShapeProp;
    ob.getConstructorFunction = getConstructorFunction;
    ob.getKeyframedConstructorFunction = getKeyframedConstructorFunction;
    return ob;
}());