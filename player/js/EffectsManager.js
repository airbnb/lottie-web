function EffectsManager(data,element,dynamicProperties){
    var effects = data.ef || [];
    this.effectElements = [];
    var i,len = effects.length;
    var effectItem;
    for(i=0;i<len;i++) {
        effectItem = new GroupEffect(effects[i],element,dynamicProperties);
        this.effectElements.push(effectItem);
    }
}

function GroupEffect(data,element,dynamicProperties){
    this.dynamicProperties = [];
    this.init(data,element,this.dynamicProperties);
    if(this.dynamicProperties.length){
        dynamicProperties.push(this);
    }
}

GroupEffect.prototype.getValue = function(){
    this._mdf = false;
    var i, len = this.dynamicProperties.length;
    for(i=0;i<len;i+=1){
        this.dynamicProperties[i].getValue();
        this._mdf = this.dynamicProperties[i]._mdf || this._mdf;
    }
};

GroupEffect.prototype.init = function(data,element,dynamicProperties){
    this.data = data;
    this._mdf = false;
    this.effectElements = [];
    var i, len = this.data.ef.length;
    var eff, effects = this.data.ef;
    for(i=0;i<len;i+=1){
        eff = null;
        switch(effects[i].ty){
            case 0:
                eff = new SliderEffect(effects[i],element,dynamicProperties);
                break;
            case 1:
                eff = new AngleEffect(effects[i],element,dynamicProperties);
                break;
            case 2:
                eff = new ColorEffect(effects[i],element,dynamicProperties);
                break;
            case 3:
                eff = new PointEffect(effects[i],element,dynamicProperties);
                break;
            case 4:
            case 7:
                eff = new CheckboxEffect(effects[i],element,dynamicProperties);
                break;
            case 10:
                eff = new LayerIndexEffect(effects[i],element,dynamicProperties);
                break;
            case 11:
                eff = new MaskIndexEffect(effects[i],element,dynamicProperties);
                break;
            case 5:
                eff = new EffectsManager(effects[i],element,dynamicProperties);
                break;
            //case 6:
            default:
                eff = new NoValueEffect(effects[i],element,dynamicProperties);
                break;
        }
        if(eff) {
            this.effectElements.push(eff);
        }
    }
};