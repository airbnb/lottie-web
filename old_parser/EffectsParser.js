/****** INIT Effects Parser ******/
(function(){
    var ob = {};
    var registeredEffects = {};

    function createEffects(layerInfo,layerOb){
        if(layerInfo.effect.numProperties>0){
            layerOb.eff = [];
            var i, len = layerInfo.effect.numProperties, name;
            for(i=0;i<len;i++){
                name = layerInfo.effect(i+1).name;
                if(registeredEffects[name] != null){
                    layerOb.eff.push({parser: registeredEffects[name], id:registeredEffects[name].registerElement(layerInfo.effect(i+1))});
                }
            }
        }
    }

    function renderFrame(layerOb,frameNum){
        if(layerOb.eff){
            layerOb.eff.forEach(function(item){
                item.parser.renderFrame(frameNum);
            });
        }
    }

    function saveEffectData(layerOb){
        if(layerOb.eff){
            layerOb.eff = layerOb.eff.map(function(item){
                return item.parser.getData(item.id);
            });
        }
    }

    function registerEffect(name,object){
        registeredEffects[name] = object;
    }

    ob.registerEffect = registerEffect;
    ob.createEffects = createEffects;
    ob.renderFrame = renderFrame;
    ob.saveEffectData = saveEffectData;

    EffectsParser = ob;

}());
/****** END Effects Parser ******/