/****** INIT Effects Stroke Parser ******/
(function(){
    var ob = {};
    var registeredElements = [];
    var lastValues = {};

    function renderFrame(frameNum, id){
        var effectData = registeredElements[id];
        var effectInfo = effectData.elem;
        for(var s in effectData.animated){
            var propertyValue = getPropertyValue(effectInfo[s].value,getPropertyType(s));
            if(lastValues[s] == null || !extrasInstance.compareObjects(propertyValue,lastValues[s])){
                effectData.animated[s][frameNum] = propertyValue;
                lastValues[s] = propertyValue;
            }
        }
    }

    function getPropertyValue(value,type){
        switch(type)
        {
            case 'color':
                return extrasInstance.arrayRgbToHex(value);
                break;
            default:
                return value;
                break;
        }
    }

    function getPropertyType(propertyName){
        var i = 0;len = animatableProperties.length;
        while(i<len){
            if(animatableProperties[i].name == propertyName){
                return animatableProperties[i].type;
            }
            i++;
        }
        return '';
    }

    function getData(id){
        return registeredElements[id];
    }

    function registerElement(elem){
        var effectData = {
            type: 'Stroke',
            effectInfo : elem,
            effectDataPath : elem['Path'].value,
            allMasks : elem['All Masks'].value,
            strokeSequentially : elem['Stroke Sequentially'].value,
            animated: {},
            singleValue: {}
        };
        registeredElements.push(effectData);
        animatableProperties.forEach(function(item){
            if(elem[item.name].numKeys == 0){
                effectData.singleValue[item.name] = getPropertyValue(effectInfo[item.name].value, item.type);
            }else{
                effectData.animated[item.name] = {};
            }
        });
        return registeredElements.length;
    }
    var animatableProperties = [{name:'Color',type:'color'},{name:'Brush Size',type:'simple'},{name:'Brush Hardness',type:'simple'},{name:'Opacity',type:'simple'},{name:'Start',type:'simple'},{name:'End',type:'simple'},{name:'Spacing',type:'simple'},{name:'Paint Style',type:'simple'}];
    var i, len = animatableProperties.length;

    ob.renderFrame = renderFrame;
    ob.getData = getData;
    ob.registerElement = registerElement;
    EffectsParser.registerEffect('Stroke',ob);
}());
/****** END Effects Stroke Parser ******/