function EffectsManager(data,element,dynamicProperties){
    var data = data;
    var element = element;
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
                eff = new CheckboxEffect(effects[i],element,dynamicProperties);
                effectElements.push(eff.proxyFunction.bind(eff));
                break;
            case 5:
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
            if(name === effects[i].nm || name === i + 1){
                if(effects[i].ty === 5){
                    return effectElements[i];
                } else{
                    return effectElements[i]();
                }
            }
            i += 1;
        }
    }
    return fn;
}