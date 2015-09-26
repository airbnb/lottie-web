/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global bm_eventDispatcher, bm_generalUtils, bm_keyframeHelper*/
var bm_effectsHelper = (function () {
    'use strict';
    var ob = {};
    var effectTypes = {
        sliderControl: 0
    };
    
    function getEffectType(name) {
        switch (name) {
        case 'ADBE Slider Control':
            return effectTypes.sliderControl;
        default:
            return '';
        }
    }
    
    function exportSliderControl(effect, frameRate) {
        var ob = {};
        ob.ty = effectTypes.sliderControl;
        ob.nm = effect.name;
        ob.v = bm_keyframeHelper.exportKeyframes(effect.property('Slider'), frameRate);
        bm_generalUtils.iterateProperty(effect);
        return ob;
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
            var effectType = getEffectType(effectElement.matchName);
            switch (effectType) {
            case 0:
                effectsArray.push(exportSliderControl(effectElement, frameRate));
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