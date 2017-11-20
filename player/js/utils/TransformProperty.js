var TransformPropertyFactory = (function() {
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

    function TransformProperty(elem,data,arr){
        this.elem = elem;
        this.frameId = -1;
        this.type = 'transform';
        this.dynamicProperties = [];
        this.mdf = false;
        this.data = data;
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
    }

    TransformProperty.prototype.applyToMatrix = applyToMatrix;
    TransformProperty.prototype.getValue = processKeys;
    TransformProperty.prototype.setInverted = setInverted;
    TransformProperty.prototype.autoOrient = autoOrient;

    function getTransformProperty(elem,data,arr){
        return new TransformProperty(elem,data,arr)
    }

    return {
        getTransformProperty: getTransformProperty
    };

}());