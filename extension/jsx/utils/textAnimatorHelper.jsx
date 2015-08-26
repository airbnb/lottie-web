/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global bm_keyframeHelper, bm_eventDispatcher*/
var bm_textAnimatorHelper = (function () {
    'use strict';
    var ob = {};
    
    function exportTextSelector(layerInfo, frameRate) {
        var ob = {};
        var i, len;
        var selectorProperty = layerInfo.property('ADBE Text Selector');
        var advancedProperty = selectorProperty.property('ADBE Text Range Advanced');
        ob.b = advancedProperty.property("ADBE Text Range Type2").value;
        // 
        var rangeUnits = advancedProperty.property('ADBE Text Range Units').value;
        if (rangeUnits === 1) {
            if (selectorProperty.property('ADBE Text Percent Start').isModified) {
                ob.s = bm_keyframeHelper.exportKeyframes(selectorProperty.property('ADBE Text Percent Start'), frameRate);
            }
            if (selectorProperty.property('ADBE Text Percent End').isModified) {
                ob.e = bm_keyframeHelper.exportKeyframes(selectorProperty.property('ADBE Text Percent End'), frameRate);
            }
            if (selectorProperty.property('ADBE Text Percent Offset').isModified) {
                ob.o = bm_keyframeHelper.exportKeyframes(selectorProperty.property('ADBE Text Percent Offset'), frameRate);
            }
        } else {
            if (selectorProperty.property('ADBE Text Index Start').isModified) {
                ob.s = bm_keyframeHelper.exportKeyframes(selectorProperty.property('ADBE Text Index Start'), frameRate);
            }
            if (selectorProperty.property('ADBE Text Index End').isModified) {
                ob.e = bm_keyframeHelper.exportKeyframes(selectorProperty.property('ADBE Text Index End'), frameRate);
            }
            if (selectorProperty.property('ADBE Text Index Offset').isModified) {
                ob.o = bm_keyframeHelper.exportKeyframes(selectorProperty.property('ADBE Text Index Offset'), frameRate);
            }
        }
        ob.r = rangeUnits;
        return ob;
    }
    
    function exportAnimationSelector(layerInfo, frameRate) {
        var ob = {};
        var i, len, property, propertyName;
        len = layerInfo.numProperties;
        for (i = 0; i < len; i += 1) {
            property = layerInfo.property(i + 1);
            if (property.isModified) {
                propertyName = property.matchName;
                switch (propertyName) {
                case 'ADBE Text Anchor Point 3D':
                    ob.a = bm_keyframeHelper.exportKeyframes(property, frameRate);
                    break;
                case 'ADBE Text Position 3D':
                    ob.p = bm_keyframeHelper.exportKeyframes(property, frameRate);
                    break;
                case 'ADBE Text Scale 3D':
                    ob.s = bm_keyframeHelper.exportKeyframes(property, frameRate);
                    break;
                case 'ADBE Text Rotation':
                    ob.r = bm_keyframeHelper.exportKeyframes(property, frameRate);
                    break;
                case 'ADBE Text Opacity':
                    ob.o = bm_keyframeHelper.exportKeyframes(property, frameRate);
                    break;
                case 'ADBE Text Fill Color':
                    ob.fc = bm_keyframeHelper.exportKeyframes(property, frameRate);
                    break;
                case 'ADBE Text Stroke Color':
                    ob.sc = bm_keyframeHelper.exportKeyframes(property, frameRate);
                    break;
                case 'ADBE Text Fill Opacity':
                    ob.fo = bm_keyframeHelper.exportKeyframes(property, frameRate);
                    break;
                case 'ADBE Text Stroke Opacity':
                    ob.so = bm_keyframeHelper.exportKeyframes(property, frameRate);
                    break;
                }
            }
        }
        return ob;
    }
    
    function exportAnimator(layerInfo, ob, frameRate) {
        var i, len;
        len = layerInfo.numProperties;
        for (i = 0; i < len; i += 1) {
            switch (layerInfo.property(i + 1).matchName) {
            case "ADBE Text Selectors":
                ob.s = exportTextSelector(layerInfo.property(i + 1), frameRate);
                break;
            case "ADBE Text Animator Properties":
                ob.a = exportAnimationSelector(layerInfo.property(i + 1), frameRate);
                break;
            }
        }
    }
    
    ob.exportAnimator = exportAnimator;
    
    return ob;
}());