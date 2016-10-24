var EffectsExpressionInterface = (function (){
    var ob = {
        createEffectsInterface: createEffectsInterface
    };

    function createEffectsInterface(elem, propertyGroup){
        if(elem.effects){

            var effectElements = [];
            var effectsData = elem.data.ef;
            var i, len = elem.effects.effectElements.length;
            for(i=0;i<len;i+=1){
                effectElements.push(createGroupInterface(effectsData[i],elem.effects.effectElements[i],propertyGroup));
            }

            return function(name){
                var effects = elem.data.ef, i = 0, len = effects.length;
                while(i<len) {
                    if(name === effects[i].nm || name === effects[i].mn || name === effects[i].ix){
                        return effectElements[i];
                    }
                    i += 1;
                }
            }
        }
    }

    function createGroupInterface(data,elements, propertyGroup){
        var effectElements = [];
        var i, len = data.ef.length;
        for(i=0;i<len;i+=1){
            if(data.ef.ty === 5){
                effectElements.push(createGroupInterface(data.ef[i],elements.effectElements[i],propertyGroup));
            } else {
                effectElements.push(createValueInterface(elements.effectElements[i]));
            }
        }
        return function(name){
            var effects = data.ef, i = 0, len = effects.length;
           // console.log('effects:',effects);
            while(i<len) {
                if(name === effects[i].nm || name === effects[i].mn || name === effects[i].ix){
                    if(effects[i].ty === 5){
                        return effectElements[i];
                    } else {
                        return effectElements[i]();
                    }
                }
                i += 1;
            }
            return effectElements[0]();
        }
    }

    function createValueInterface(element){
        return function(){
            if(element.p.k){
                element.p.getValue();
            }
            if(typeof element.p.v === 'number'){
                return element.p.v;
            }
            var i, len = element.p.v.length;
            var arr = Array.apply(null,{length:len});
            for(i=0;i<len;i+=1){
                arr[i] = element.p.v[i];
            }
            return arr;
        }
    }

    return ob;

}());