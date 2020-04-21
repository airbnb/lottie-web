/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $*/
$.__bodymovin.bm_layerStylesHelper = (function () {
    var bm_keyframeHelper = $.__bodymovin.bm_keyframeHelper;
    var ob = {};
    var layerStyleTypes = {
        stroke: 0,
        dropShadow: 1,
        innerShadow: 2,
        outerGlow: 3,
        innerGlow: 4
    };
    
    function getStyleType(name) {
        switch (name) {
        case 'frameFX/enabled':
            return layerStyleTypes.stroke;
        case 'dropShadow/enabled':
            return layerStyleTypes.dropShadow;
        case 'innerShadow/enabled':
            return layerStyleTypes.innerShadow;
        case 'outerGlow/enabled':
            return layerStyleTypes.outerGlow;
        case 'innerGlow/enabled':
            return layerStyleTypes.innerGlow;
        default:
            return '';
        }
    }
    
    function exportStroke(style, frameRate, stretch) {
        var ob = {};
        ob.c = bm_keyframeHelper.exportKeyframes(style.property('frameFX/color'), frameRate, stretch);
        ob.s = bm_keyframeHelper.exportKeyframes(style.property('frameFX/size'), frameRate, stretch);
        return ob;
    }
    
    function exportDropShadow(style, frameRate, stretch) {
        var ob = {};
        // Color
        ob.c = bm_keyframeHelper.exportKeyframes(style.property('dropShadow/color'), frameRate, stretch);
        // Opacity
        ob.o = bm_keyframeHelper.exportKeyframes(style.property('dropShadow/opacity'), frameRate, stretch);
        // Angle
        ob.a = bm_keyframeHelper.exportKeyframes(style.property('dropShadow/localLightingAngle'), frameRate, stretch);
        // Size
        ob.s = bm_keyframeHelper.exportKeyframes(style.property('dropShadow/blur'), frameRate, stretch);
        // Distance
        ob.d = bm_keyframeHelper.exportKeyframes(style.property('dropShadow/distance'), frameRate, stretch);
        // Choke/Spread
        ob.ch = bm_keyframeHelper.exportKeyframes(style.property('dropShadow/chokeMatte'), frameRate, stretch);
        // Blend Mode
        ob.bm = bm_keyframeHelper.exportKeyframes(style.property('dropShadow/mode2'), frameRate, stretch);
        // Noise
        ob.no = bm_keyframeHelper.exportKeyframes(style.property('dropShadow/noise'), frameRate, stretch);
        // Layer Knocks Out Drop Shadow
        ob.lc = bm_keyframeHelper.exportKeyframes(style.property('dropShadow/layerConceals'), frameRate, stretch);
        return ob;
    }
    
    function exportInnerShadow(style, frameRate, stretch) {
        var ob = {};
        // Color
        ob.c = bm_keyframeHelper.exportKeyframes(style.property('innerShadow/color'), frameRate, stretch);
        // Opacity
        ob.o = bm_keyframeHelper.exportKeyframes(style.property('innerShadow/opacity'), frameRate, stretch);
        // Angle
        ob.a = bm_keyframeHelper.exportKeyframes(style.property('innerShadow/localLightingAngle'), frameRate, stretch);
        // Size
        ob.s = bm_keyframeHelper.exportKeyframes(style.property('innerShadow/blur'), frameRate, stretch);
        // Distance
        ob.d = bm_keyframeHelper.exportKeyframes(style.property('innerShadow/distance'), frameRate, stretch);
        // Choke/Spread
        ob.ch = bm_keyframeHelper.exportKeyframes(style.property('innerShadow/chokeMatte'), frameRate, stretch);
        // Blend Mode
        ob.bm = bm_keyframeHelper.exportKeyframes(style.property('innerShadow/mode2'), frameRate, stretch);
        // Noise
        ob.no = bm_keyframeHelper.exportKeyframes(style.property('innerShadow/noise'), frameRate, stretch);
        return ob;
    }
    
    function exportOuterGlow(style, frameRate, stretch) {
        var ob = {};
        // Color
        ob.c = bm_keyframeHelper.exportKeyframes(style.property('outerGlow/color'), frameRate, stretch);
        // Opacity
        ob.o = bm_keyframeHelper.exportKeyframes(style.property('outerGlow/opacity'), frameRate, stretch);
        // Size
        ob.s = bm_keyframeHelper.exportKeyframes(style.property('outerGlow/blur'), frameRate, stretch);
        // Range
        ob.r = bm_keyframeHelper.exportKeyframes(style.property('outerGlow/inputRange'), frameRate, stretch);
        // Choke/Spread
        ob.ch = bm_keyframeHelper.exportKeyframes(style.property('outerGlow/chokeMatte'), frameRate, stretch);
        // Blend Mode
        ob.bm = bm_keyframeHelper.exportKeyframes(style.property('outerGlow/mode2'), frameRate, stretch);
        // Noise
        ob.no = bm_keyframeHelper.exportKeyframes(style.property('outerGlow/noise'), frameRate, stretch);
        // Jitter
        ob.j = bm_keyframeHelper.exportKeyframes(style.property('outerGlow/shadingNoise'), frameRate, stretch);
        return ob;
    }
    
    function exportInnerGlow(style, frameRate, stretch) {
        var ob = {};
        // Color
        ob.c = bm_keyframeHelper.exportKeyframes(style.property('innerGlow/color'), frameRate, stretch);
        // Opacity
        ob.o = bm_keyframeHelper.exportKeyframes(style.property('innerGlow/opacity'), frameRate, stretch);
        // Size
        ob.s = bm_keyframeHelper.exportKeyframes(style.property('innerGlow/blur'), frameRate, stretch);
        // Range
        ob.r = bm_keyframeHelper.exportKeyframes(style.property('innerGlow/inputRange'), frameRate, stretch);
        // Source
        ob.sr = bm_keyframeHelper.exportKeyframes(style.property('innerGlow/innerGlowSource'), frameRate, stretch);
        // Choke/Spread
        ob.ch = bm_keyframeHelper.exportKeyframes(style.property('innerGlow/chokeMatte'), frameRate, stretch);
        // Blend Mode
        ob.bm = bm_keyframeHelper.exportKeyframes(style.property('innerGlow/mode2'), frameRate, stretch);
        // Noise
        ob.no = bm_keyframeHelper.exportKeyframes(style.property('innerGlow/noise'), frameRate, stretch);
        // Jitter
        ob.j = bm_keyframeHelper.exportKeyframes(style.property('innerGlow/shadingNoise'), frameRate, stretch);
        return ob;
    }
    
    function exportStyles(layerInfo, layerData, frameRate) {
        if (!(layerInfo.property('Layer Styles') && layerInfo.property('Layer Styles').numProperties > 0)) {
            return;
        }
        var stretch = layerData.sr;
        var styles = layerInfo.property('Layer Styles');
        var i, len = styles.numProperties, styleElement;
        var stylesArray = [];
        for (i = 0; i < len; i += 1) {
            styleElement = styles(i + 1);
            if (styleElement.enabled) {
                var styleOb = null;
                var styleType = getStyleType(styleElement.matchName);
                
                switch (styleType) {
                case layerStyleTypes.stroke:
                    styleOb = exportStroke(styleElement, frameRate, stretch);
                    break;
                case layerStyleTypes.dropShadow:
                    styleOb = exportDropShadow(styleElement, frameRate, stretch);
                    break;
                case layerStyleTypes.innerShadow:
                    styleOb = exportInnerShadow(styleElement, frameRate, stretch);
                    break;
                case layerStyleTypes.outerGlow:
                    styleOb = exportOuterGlow(styleElement, frameRate, stretch);
                    break;
                case layerStyleTypes.innerGlow:
                    styleOb = exportInnerGlow(styleElement, frameRate, stretch);
                    break;
                }
                
                if (styleOb) {
                    // common props
                    styleOb.ty = styleType;
                    styleOb.nm = styleElement.name;
                
                    stylesArray.push(styleOb);
                }
            }
        }
        if (stylesArray.length) {
            layerData.sy = stylesArray;
        }
    }
    
    ob.exportStyles = exportStyles;
    
    return ob;
}());