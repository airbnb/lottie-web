var TransformPropertyFactory = (function() {

    function searchDynamicProperties() {
        var i, len = this.dynamicProperties.length;
        for(i = 0; i < len; i += 1) {
            this.dynamicProperties[i].getValue();
            if (this.dynamicProperties[i]._mdf) {
                this._mdf = true;
            }
        }
    }

    function applyToMatrix(mat) {
        this.searchDynamicProperties();
        if (this.a) {
            mat.translate(-this.a.v[0], -this.a.v[1], this.a.v[2]);
        }
        if (this.s) {
            mat.scale(this.s.v[0], this.s.v[1], this.s.v[2]);
        }
        if (this.sk) {
            mat.skewFromAxis(-this.sk.v, this.sa.v);
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
    function processKeys(forceRender){
        if (this.elem.globalData.frameId === this.frameId) {
            return;
        }

        this._mdf = false;
        this.searchDynamicProperties();

        if (this._mdf || forceRender) {
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

    function TransformProperty(elem,data,container){
        this.elem = elem;
        this.frameId = -1;
        this.propType = 'transform';
        this.container = container || elem;
        this.dynamicProperties = [];
        this._mdf = false;
        this.data = data;
        this.v = new Matrix();
        if(data.p.s){
            this.px = PropertyFactory.getProp(elem,data.p.x,0,0,this);
            this.py = PropertyFactory.getProp(elem,data.p.y,0,0,this);
            if(data.p.z){
                this.pz = PropertyFactory.getProp(elem,data.p.z,0,0,this);
            }
        }else{
            this.p = PropertyFactory.getProp(elem,data.p,1,0,this);
        }
        if(data.r) {
            this.r = PropertyFactory.getProp(elem, data.r, 0, degToRads, this);
        } else if(data.rx) {
            this.rx = PropertyFactory.getProp(elem, data.rx, 0, degToRads, this);
            this.ry = PropertyFactory.getProp(elem, data.ry, 0, degToRads, this);
            this.rz = PropertyFactory.getProp(elem, data.rz, 0, degToRads, this);
            if(data.or.k[0].ti) {
                var i, len = data.or.k.length;
                for(i=0;i<len;i+=1) {
                    data.or.k[i].to = data.or.k[i].ti = null;
                }
            }
            this.or = PropertyFactory.getProp(elem, data.or, 1, degToRads, this);
            //sh Indicates it needs to be capped between -180 and 180
            this.or.sh = true;
        }
        if(data.sk){
            this.sk = PropertyFactory.getProp(elem, data.sk, 0, degToRads, this);
            this.sa = PropertyFactory.getProp(elem, data.sa, 0, degToRads, this);
        }
        if(data.a) {
            this.a = PropertyFactory.getProp(elem,data.a,1,0,this);
        }
        if(data.s) {
            this.s = PropertyFactory.getProp(elem,data.s,1,0.01,this);
        }
        // Opacity is not part of the transform properties, that's why it won't use this.dynamicProperties. That way transforms won't get updated if opacity changes.
        if(data.o){
            this.o = PropertyFactory.getProp(elem,data.o,0,0.01,elem);
        } else {
            this.o = {_mdf:false,v:1};
        }
        if(!this.dynamicProperties.length){
            this.getValue(true);
        }
    }

    TransformProperty.prototype = {
        applyToMatrix: applyToMatrix,
        searchDynamicProperties: searchDynamicProperties,
        getValue: processKeys,
        setInverted: setInverted,
        autoOrient: autoOrient,
        addDynamicProperty: addDynamicProperty
    }

    function getTransformProperty(elem,data,container){
        return new TransformProperty(elem,data,container);
    }

    return {
        getTransformProperty: getTransformProperty
    };

}());