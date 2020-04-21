/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global bm_keyframeHelper, bm_eventDispatcher, bm_expressionHelper*/
$.__bodymovin.bm_textAnimatorHelper = (function () {
    'use strict';
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var bm_keyframeHelper = $.__bodymovin.bm_keyframeHelper;
    var bm_expressionHelper = $.__bodymovin.bm_expressionHelper;
    var ob = {};
    
    function exportTextSelectors(layerInfo, frameRate, stretch) {
        var selectors = [];

        function exportSelector(selectorProperty) {
            if (!selectorProperty) return;

            var ob = {};
            var advancedProperty = selectorProperty.property('ADBE Text Range Advanced');
            ob.t = 0;
            ob.xe = bm_keyframeHelper.exportKeyframes(advancedProperty.property('ADBE Text Levels Max Ease'), frameRate, stretch);
            ob.ne = bm_keyframeHelper.exportKeyframes(advancedProperty.property('ADBE Text Levels Min Ease'), frameRate, stretch);
            ob.a = bm_keyframeHelper.exportKeyframes(advancedProperty.property('ADBE Text Selector Max Amount'), frameRate, stretch);
            ob.b = advancedProperty.property("ADBE Text Range Type2").value;
            ob.rn = advancedProperty.property("ADBE Text Randomize Order").value;
            ob.sh = advancedProperty.property("ADBE Text Range Shape").value;

            // 
            var rangeUnits = advancedProperty.property('ADBE Text Range Units').value;
            if (rangeUnits === 1) {
                if (selectorProperty.property('ADBE Text Percent Start').isModified) {
                    ob.s = bm_keyframeHelper.exportKeyframes(selectorProperty.property('ADBE Text Percent Start'), frameRate, stretch);
                }
                if (selectorProperty.property('ADBE Text Percent End').isModified) {
                    ob.e = bm_keyframeHelper.exportKeyframes(selectorProperty.property('ADBE Text Percent End'), frameRate, stretch);
                }
                if (selectorProperty.property('ADBE Text Percent Offset').isModified) {
                    ob.o = bm_keyframeHelper.exportKeyframes(selectorProperty.property('ADBE Text Percent Offset'), frameRate, stretch);
                }
            } else {
                if (selectorProperty.property('ADBE Text Index Start').isModified) {
                    ob.s = bm_keyframeHelper.exportKeyframes(selectorProperty.property('ADBE Text Index Start'), frameRate, stretch);
                }
                ob.e = bm_keyframeHelper.exportKeyframes(selectorProperty.property('ADBE Text Index End'), frameRate, stretch);
                if (selectorProperty.property('ADBE Text Index Offset').isModified) {
                    ob.o = bm_keyframeHelper.exportKeyframes(selectorProperty.property('ADBE Text Index Offset'), frameRate, stretch);
                }
            }
            ob.r = rangeUnits;

            selectors.push(ob);
        }

        function exportExpressibleSelector(selectorProperty) {
            if (!selectorProperty) return;

            var ob = {};
            ob.t = 1;
            ob.b = selectorProperty.property('ADBE Text Range Type2').value;
            var amount = selectorProperty.property('ADBE Text Expressible Amount');
            bm_expressionHelper.checkExpression(amount, ob);
            //bm_eventDispatcher.log(ob.x);

            selectors.push(ob);
        }

        var len = layerInfo.numProperties;
        for (var i = 0; i < len; i += 1) {
            var prop = layerInfo.property(i + 1);
            var propertyName = prop.matchName;
            if (propertyName === 'ADBE Text Selector') {
                exportSelector(prop);
            } else if (propertyName === 'ADBE Text Expressible Selector') {
                exportExpressibleSelector(prop);
            }
        }

        if (selectors.length == 0) {
            // Always export a full range selector, when no explicit selectors are present.
            selectors.push({
                t : 0,
                xe: {k:0},
                ne: {k:0},
                a : {k:100},
                b : 1,
                sh: 0,
                s : {k:0},
                e : {k:100},
                o : {k:0}
            });
        }

        var export_array = selectors.length > 1 && $.__bodymovin.bm_renderManager.shouldIncludeNotSupportedProperties();

        return export_array ? selectors : selectors[0];
    }
    
    function exportAnimationSelector(layerInfo, frameRate, stretch) {
        var ob = {};
        var i, len, property, propertyName;
        len = layerInfo.numProperties;
        for (i = 0; i < len; i += 1) {
            property = layerInfo.property(i + 1);
            if (property.canSetExpression) {
                propertyName = property.matchName;
                switch (propertyName) {
                case 'ADBE Text Anchor Point 3D':
                    ob.a = bm_keyframeHelper.exportKeyframes(property, frameRate, stretch);
                    break;
                case 'ADBE Text Position 3D':
                    ob.p = bm_keyframeHelper.exportKeyframes(property, frameRate, stretch);
                    break;
                case 'ADBE Text Scale 3D':
                    ob.s = bm_keyframeHelper.exportKeyframes(property, frameRate, stretch);
                    break;
                case 'ADBE Text Rotation':
                    ob.r = bm_keyframeHelper.exportKeyframes(property, frameRate, stretch);
                    break;
                case 'ADBE Text Rotation X':
                    ob.rx = bm_keyframeHelper.exportKeyframes(property, frameRate, stretch);
                    break;
                case 'ADBE Text Rotation Y':
                    ob.ry = bm_keyframeHelper.exportKeyframes(property, frameRate, stretch);
                    break;
                case 'ADBE Text Opacity':
                    ob.o = bm_keyframeHelper.exportKeyframes(property, frameRate, stretch);
                    break;
                case 'ADBE Text Fill Color':
                    ob.fc = bm_keyframeHelper.exportKeyframes(property, frameRate, stretch);
                    break;
                case 'ADBE Text Fill Hue':
                    ob.fh = bm_keyframeHelper.exportKeyframes(property, frameRate, stretch);
                    break;
                case 'ADBE Text Fill Saturation':
                    ob.fs = bm_keyframeHelper.exportKeyframes(property, frameRate, stretch);
                    break;
                case 'ADBE Text Fill Brightness':
                    ob.fb = bm_keyframeHelper.exportKeyframes(property, frameRate, stretch);
                    break;
                case 'ADBE Text Stroke Color':
                    ob.sc = bm_keyframeHelper.exportKeyframes(property, frameRate, stretch);
                    break;
                case 'ADBE Text Stroke Hue':
                    ob.sh = bm_keyframeHelper.exportKeyframes(property, frameRate, stretch);
                    break;
                case 'ADBE Text Stroke Saturation':
                    ob.ss = bm_keyframeHelper.exportKeyframes(property, frameRate, stretch);
                    break;
                case 'ADBE Text Stroke Brightness':
                    ob.sb = bm_keyframeHelper.exportKeyframes(property, frameRate, stretch);
                    break;
                case 'ADBE Text Stroke Width':
                    ob.sw = bm_keyframeHelper.exportKeyframes(property, frameRate, stretch);
                    break;
                case 'ADBE Text Fill Opacity':
                    ob.fo = bm_keyframeHelper.exportKeyframes(property, frameRate, stretch);
                    break;
                case 'ADBE Text Stroke Opacity':
                    ob.so = bm_keyframeHelper.exportKeyframes(property, frameRate, stretch);
                    break;
                case 'ADBE Text Tracking Amount':
                    ob.t = bm_keyframeHelper.exportKeyframes(property, frameRate, stretch);
                    break;
                case 'ADBE Text Skew':
                    ob.sk = bm_keyframeHelper.exportKeyframes(property, frameRate, stretch);
                    break;
                case 'ADBE Text Skew Axis':
                    ob.sa = bm_keyframeHelper.exportKeyframes(property, frameRate, stretch);
                    break;
                case 'ADBE Text Blur':
                    ob.bl = bm_keyframeHelper.exportKeyframes(property, frameRate, stretch);
                    break;
                }
            }
        }
        return ob;
    }
    
    function exportAnimator(layerInfo, ob, frameRate, stretch) {
        var i, len;
        len = layerInfo.numProperties;

        ob.nm = layerInfo.name;
        for (i = 0; i < len; i += 1) {
            switch (layerInfo.property(i + 1).matchName) {
            case "ADBE Text Selectors":
                ob.s = exportTextSelectors(layerInfo.property(i + 1), frameRate, stretch);
                break;
            case "ADBE Text Animator Properties":
                ob.a = exportAnimationSelector(layerInfo.property(i + 1), frameRate, stretch);
                break;
            }
        }
    }
    
    ob.exportAnimator = exportAnimator;
    
    return ob;
}());