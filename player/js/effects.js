function EffectsManager(data,element,dynamicProperties){
    var effects = data.ef;
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
    this.mdf = false;
    var i, len = this.dynamicProperties.length;
    for(i=0;i<len;i+=1){
        this.dynamicProperties[i].getValue();
        this.mdf = this.dynamicProperties[i].mdf ? true : this.mdf;
    }
};

GroupEffect.prototype.init = function(data,element,dynamicProperties){
    this.data = data;
    this.mdf = false;
    this.effectElements = [];
    var i, len = this.data.ef.length;
    var eff, effects = this.data.ef;
    for(i=0;i<len;i+=1){
        switch(effects[i].ty){
            case 0:
                eff = new SliderEffect(effects[i],element,dynamicProperties);
                this.effectElements.push(eff);
                break;
            case 1:
                eff = new AngleEffect(effects[i],element,dynamicProperties);
                this.effectElements.push(eff);
                break;
            case 2:
                eff = new ColorEffect(effects[i],element,dynamicProperties);
                this.effectElements.push(eff);
                break;
            case 3:
                eff = new PointEffect(effects[i],element,dynamicProperties);
                this.effectElements.push(eff);
                break;
            case 4:
            case 7:
                eff = new CheckboxEffect(effects[i],element,dynamicProperties);
                this.effectElements.push(eff);
                break;
            case 5:
                eff = new EffectsManager(effects[i],element,dynamicProperties);
                this.effectElements.push(eff);
                break;
            case 6:
                eff = new NoValueEffect(effects[i],element,dynamicProperties);
                this.effectElements.push(eff);
                break;
        }
    }
};






/*function EffectsManager(data,element,dynamicProperties){

    var effects = data.ef;
    var effectElements = [];
    var i,len = effects.length;
    var eff;
    for(i=0;i<len;i++){
        switch(effects[i].ty){
            case 0:
                eff = new SliderEffect(effects[i],element,dynamicProperties);
                effectElements.push(eff.proxyFunction.bind(eff));
                break;
            case 1:
;                eff = new AngleEffect(effects[i],element,dynamicProperties);
                effectElements.push(eff.proxyFunction.bind(eff));
                break;
            case 2:
                eff = new ColorEffect(effects[i],element,dynamicProperties);
                effectElements.push(eff.proxyFunction.bind(eff));
                break;
            case 3:
                eff = new PointEffect(effects[i],element,dynamicProperties);
                effectElements.push(eff.proxyFunction.bind(eff));
                break;
            case 4:
            case 7:
                eff = new CheckboxEffect(effects[i],element,dynamicProperties);
                effectElements.push(eff.proxyFunction.bind(eff));
                break;
            case 5:
            case 20:
                eff = new EffectsManager(effects[i],element,dynamicProperties);
                effectElements.push(eff);
                break;
            case 6:
                eff = new NoValueEffect(effects[i],element,dynamicProperties);
                effectElements.push(eff);
                break;
        }
    }

    var fn = function(name){
        var effects = data.ef, i = 0, len = effects.length;
        while(i<len) {
            if(name === effects[i].nm || name === effects[i].ix){
                if(effects[i].ty === 5 || effects[i].ty === 20){
                    return effectElements[i];
                } else{
                    return effectElements[i]();
                }
            }
            i += 1;
        }
        // In case there is no match it's returning the first element of the group
        return effectElements[0]();
    }
    return fn;
}*/