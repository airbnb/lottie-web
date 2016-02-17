/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global bm_eventDispatcher, bm_generalUtils, bm_keyframeHelper*/
var bm_effectsHelper = (function () {
    'use strict';
    var ob = {};
    var effectTypes = {
        sliderControl: 0,
        angleControl: 1,
        colorControl: 2,
        pointControl: 3,
        checkboxControl: 4
    };
    
    function getEffectType(name) {
        switch (name) {
        case 'ADBE Slider Control':
            return effectTypes.sliderControl;
        case 'ADBE Angle Control':
            return effectTypes.angleControl;
        case 'ADBE Color Control':
            return effectTypes.colorControl;
        case 'ADBE Point Control':
            return effectTypes.pointControl;
        case 'ADBE Checkbox Control':
            return effectTypes.checkboxControl;
        default:
            //bm_eventDispatcher.log(name);
            return '';
        }
    }
    
    function exportSliderControl(effect, frameRate) {
        var ob = {};
        ob.ty = effectTypes.sliderControl;
        ob.nm = effect.name;
        ob.v = bm_keyframeHelper.exportKeyframes(effect.property('Slider'), frameRate);
        return ob;
    }
    
    function exportAngleControl(effect, frameRate) {
        var ob = {};
        ob.ty = effectTypes.angleControl;
        ob.nm = effect.name;
        ob.v = bm_keyframeHelper.exportKeyframes(effect.property('Angle'), frameRate);
        return ob;
    }
    
    function exportColorControl(effect, frameRate) {
        var ob = {};
        ob.ty = effectTypes.colorControl;
        ob.nm = effect.name;
        ob.v = bm_keyframeHelper.exportKeyframes(effect.property('Color'), frameRate);
        return ob;
    }
    
    function exportPointControl(effect, frameRate) {
        var ob = {};
        ob.ty = effectTypes.pointControl;
        ob.nm = effect.name;
        ob.v = bm_keyframeHelper.exportKeyframes(effect.property('Point'), frameRate);
        return ob;
    }
    
    function exportCheckboxControl(effect, frameRate) {
        var ob = {};
        ob.ty = effectTypes.checkboxControl;
        ob.nm = effect.name;
        ob.v = bm_keyframeHelper.exportKeyframes(effect.property('Checkbox'), frameRate);
        return ob;
    }
    
    function iterateEffectProperties(effectElement) {
        var i, len = effectElement.numProperties;
        for (i = 0; i < len; i += 1) {
            var prop = effectElement.property(i + 1);
            var propsArray = [], propValue;
            for (var s in prop) {
                propsArray.push({key:s,value:''});
            }
            /* bm_eventDispatcher.log(propsArray);
            bm_eventDispatcher.log('prop.name: ' + prop.name);
            bm_eventDispatcher.log('prop.matchName: ' + prop.matchName);
            bm_eventDispatcher.log('prop.propertyType: ' + prop.propertyType);
            bm_eventDispatcher.log('prop.propertyValueType: ' + prop.propertyValueType);
            bm_eventDispatcher.log('prop.hasMax: ' + prop.hasMax);
            bm_eventDispatcher.log('prop.hasMin: ' + prop.hasMin);
            if(prop.hasMax){
                bm_eventDispatcher.log('prop.maxValue: ' + prop.maxValue);
            }
            if(prop.hasMin){
                bm_eventDispatcher.log('prop.minValue: ' + prop.minValue);
            }
            bm_eventDispatcher.log('----------------');*/
        }
    }
    
    function exportEffects(layerInfo, layerData, frameRate) {
        if (!(layerInfo.effect && layerInfo.effect.numProperties > 0)) {
            return;
        }
        var effects = layerInfo.effect;
        var i, len = effects.numProperties, effectElement;
        var effectsArray = [];
        for (i = 0; i < len; i += 1) {
            effectElement = effects(i + 1);
            //iterateEffectProperties(effectElement);
            var effectType = getEffectType(effectElement.matchName);
            switch (effectType) {
            case effectTypes.sliderControl:
                effectsArray.push(exportSliderControl(effectElement, frameRate));
                break;
            case effectTypes.angleControl:
                effectsArray.push(exportAngleControl(effectElement, frameRate));
                break;
            case effectTypes.colorControl:
                effectsArray.push(exportColorControl(effectElement, frameRate));
                break;
            case effectTypes.pointControl:
                effectsArray.push(exportPointControl(effectElement, frameRate));
                break;
            case effectTypes.checkboxControl:
                effectsArray.push(exportCheckboxControl(effectElement, frameRate));
                break;
            }
        }
        if (effectsArray.length) {
            layerData.ef = effectsArray;
        }
    }
    
    ob.exportEffects = exportEffects;
    
    return ob;
}());