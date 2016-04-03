function EffectsManager(data,element,dynamicProperties){
    var data = data;
    var element = element;
    var effects = data.ef;
    var effectElements = [];
    var i,len = effects.length;
    var eff;
    console.log(effects);
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
        }
    }

    var fn = function(name){
        console.log(data);
        var effects = data.ef, i = 0, len = effects.length;
        while(i<len) {
            if(effects[i].nm === name || i === name){
                return effectElements[i];
            }
            i += 1;
        }
    }
    return fn;
}