function GradientProperty(elem,data,arr){
    this.prop = PropertyFactory.getProp(elem,data.k,1,null,[]);
    this.data = data;
    this.k = this.prop.k;
    this.c = createTypedArray('uint8c', data.p*4)
    var cLength = data.k.k[0].s ? (data.k.k[0].s.length - data.p*4) : data.k.k.length - data.p*4;
    this.o = createTypedArray('float32', cLength);
    this.cmdf = false;
    this.omdf = false;
    if(this.prop.k){
        arr.push(this);
    }
    this.getValue(true);
}

GradientProperty.prototype.getValue = function(forceRender){
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
                this.cmdf = !forceRender;
            }
        }
        if(this.o.length){
            len = this.prop.v.length;
            for(i=this.data.p*4;i<len;i+=1){
                mult = i%2 === 0 ? 100 : 1;
                val = i%2 === 0 ?  Math.round(this.prop.v[i]*100):this.prop.v[i];
                if(this.o[i-this.data.p*4] !== val){
                    this.o[i-this.data.p*4] = val;
                    this.omdf = !forceRender;
                }
            }
        }
    }
}