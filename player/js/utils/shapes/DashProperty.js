function DashProperty(elem, data, renderer) {
    this.elem = elem;
    this.container = elem;
    this.frameId = -1;
    this.dataProps = createSizedArray(data.length);
    this.renderer = renderer;
    this._mdf = false;
    this.k = false;
    this.dynamicProperties = [];
    this.dashStr = '';
    this.dashArray = createTypedArray('float32',  data.length ? data.length - 1 : 0);
    this.dashoffset = createTypedArray('float32',  1);
    var i, len = data.length || 0, prop;
    for(i = 0; i < len; i += 1) {
        prop = PropertyFactory.getProp(elem,data[i].v,0, 0, this);
        this.k = prop.k ? true : this.k;
        this.dataProps[i] = {n:data[i].n,p:prop};
    }
    if(!this.k){
        this.getValue(true);
    }
}

DashProperty.prototype.addDynamicProperty = addDynamicProperty;

DashProperty.prototype.getValue = function(forceRender) {
    if(this.elem.globalData.frameId === this.frameId && !forceRender){
        return;
    }
    var i = 0, len = this.dataProps.length;
    this._mdf = forceRender;
    this.frameId = this.elem.globalData.frameId;
    while(i<len){
        this.dataProps[i].p.getValue();
        if(this.dataProps[i].p._mdf){
            this._mdf = true;
        }
        i+=1;
    }
    if (this._mdf) {
        if(this.renderer === 'svg') {
            this.dashStr = '';
        }
        for(i=0;i<len;i+=1){
            if(this.dataProps[i].n != 'o'){
                if(this.renderer === 'svg') {
                    this.dashStr += ' ' + this.dataProps[i].p.v;
                }else{
                    this.dashArray[i] = this.dataProps[i].p.v;
                }
            }else{
                this.dashoffset[0] = this.dataProps[i].p.v;
            }
        }
    }
};