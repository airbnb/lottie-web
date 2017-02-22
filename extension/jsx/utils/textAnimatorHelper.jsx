/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global bm_keyframeHelper, bm_eventDispatcher, bm_generalUtils, bm_expressionHelper*/
var bm_textAnimatorHelper = (function () {
    'use strict';
    var ob = {};
    
    function exportTextSelector(layerInfo, frameRate) {
        var ob = {};
        var i, len;
        var selectorProperty;
        
        var property, propertyName;
        len = layerInfo.numProperties;
        var selectorType = -1;
        for (i = 0; i < len; i += 1) {
            propertyName = layerInfo.property(i + 1).matchName;
            if (propertyName === 'ADBE Text Selector') {
                selectorType = 0;
                selectorProperty = layerInfo.property('ADBE Text Selector');
                break;
            } else if (propertyName === 'ADBE Text Expressible Selector') {
                selectorType = 1;
                selectorProperty = layerInfo.property('ADBE Text Expressible Selector');
                break;
            }
        }
        
        if(!selectorProperty) {
            selectorType = -1;
        } else {
            len = selectorProperty.numProperties;
        }
        /*for (i = 0; i < len; i += 1) {
            //bm_eventDispatcher.log(selectorProperty.property(i + 1).matchName);
        }*/
        
        
        if (selectorType === 0) {
            
            var advancedProperty = selectorProperty.property('ADBE Text Range Advanced');
            ob.t = 0;
            ob.xe = bm_keyframeHelper.exportKeyframes(advancedProperty.property('ADBE Text Levels Max Ease'), frameRate);
            ob.ne = bm_keyframeHelper.exportKeyframes(advancedProperty.property('ADBE Text Levels Min Ease'), frameRate);
            ob.a = bm_keyframeHelper.exportKeyframes(advancedProperty.property('ADBE Text Selector Max Amount'), frameRate);
            ob.b = advancedProperty.property("ADBE Text Range Type2").value;
            ob.rn = advancedProperty.property("ADBE Text Randomize Order").value;
            ob.sh = advancedProperty.property("ADBE Text Range Shape").value;

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
        } else if (selectorType === 1) {
            ob.t = 1;
            ob.b = selectorProperty.property('ADBE Text Range Type2').value;
            var amount = selectorProperty.property('ADBE Text Expressible Amount');
            bm_expressionHelper.checkExpression(amount, ob);
            //bm_eventDispatcher.log(ob.x);
        } else if (selectorType === -1) {
            ob.t = 0;
            ob.xe = {k:0}
            ob.ne = {k:0}
            ob.a = {k:100}
            ob.b = 1
            ob.b = 0
            ob.sh = 0
            ob.s = {k:0}
            ob.e = {k:100}
            ob.o = {k:0}
            //bm_eventDispatcher.log(ob.x);
        }
        return ob;
    }
    
    function exportAnimationSelector(layerInfo, frameRate) {
        var ob = {};
        var i, len, property, propertyName;
        len = layerInfo.numProperties;
        for (i = 0; i < len; i += 1) {
            property = layerInfo.property(i + 1);
            if (property.canSetExpression) {
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
                case 'ADBE Text Rotation X':
                    ob.rx = bm_keyframeHelper.exportKeyframes(property, frameRate);
                    break;
                case 'ADBE Text Rotation Y':
                    ob.ry = bm_keyframeHelper.exportKeyframes(property, frameRate);
                    break;
                case 'ADBE Text Opacity':
                    ob.o = bm_keyframeHelper.exportKeyframes(property, frameRate);
                    break;
                case 'ADBE Text Fill Color':
                    ob.fc = bm_keyframeHelper.exportKeyframes(property, frameRate);
                    break;
                case 'ADBE Text Fill Hue':
                    ob.fh = bm_keyframeHelper.exportKeyframes(property, frameRate);
                    break;
                case 'ADBE Text Fill Saturation':
                    ob.fs = bm_keyframeHelper.exportKeyframes(property, frameRate);
                    break;
                case 'ADBE Text Fill Brightness':
                    ob.fb = bm_keyframeHelper.exportKeyframes(property, frameRate);
                    break;
                case 'ADBE Text Stroke Color':
                    ob.sc = bm_keyframeHelper.exportKeyframes(property, frameRate);
                    break;
                case 'ADBE Text Stroke Hue':
                    ob.sh = bm_keyframeHelper.exportKeyframes(property, frameRate);
                    break;
                case 'ADBE Text Stroke Saturation':
                    ob.ss = bm_keyframeHelper.exportKeyframes(property, frameRate);
                    break;
                case 'ADBE Text Stroke Brightness':
                    ob.sb = bm_keyframeHelper.exportKeyframes(property, frameRate);
                    break;
                case 'ADBE Text Stroke Width':
                    ob.sw = bm_keyframeHelper.exportKeyframes(property, frameRate);
                    break;
                case 'ADBE Text Fill Opacity':
                    ob.fo = bm_keyframeHelper.exportKeyframes(property, frameRate);
                    break;
                case 'ADBE Text Stroke Opacity':
                    ob.so = bm_keyframeHelper.exportKeyframes(property, frameRate);
                    break;
                case 'ADBE Text Tracking Amount':
                    ob.t = bm_keyframeHelper.exportKeyframes(property, frameRate);
                    break;
                case 'ADBE Text Skew':
                    ob.sk = bm_keyframeHelper.exportKeyframes(property, frameRate);
                    break;
                case 'ADBE Text Skew Axis':
                    ob.sa = bm_keyframeHelper.exportKeyframes(property, frameRate);
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