$.__bodymovin.bm_blendModes = (function () {
	var ob = {
        getBlendMode: getBlendMode,
		getBlendModeShape: getBlendModeShape
	};
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;

    var blendModes = {
        normal : 0,
        multiply : 1,
        screen : 2,
        overlay : 3,
        darken : 4,
        lighten : 5,
        colorDodge : 6,
        colorBurn : 7,
        hardLight : 8,
        softLight : 9,
        difference : 10,
        exclusion : 11,
        hue : 12,
        saturation : 13,
        color : 14,
        luminosity :15,
        add: 16
    };

    var BlendingModeShape = {
        NORMAL: 1,
        DARKEN: 3,
        MULTIPLY: 4,
        COLOR_BURN: 5,
        LINEAR_BURN: 6,
        DARKER_COLOR: 7,
        LIGHTEN: 9,
        SCREEN: 10,
        COLOR_DODGE: 11,
        LINEAR_DODGE: 12,
        LIGHTER_COLOR: 13,
        OVERLAY: 15,
        SOFT_LIGHT: 16,
        HARD_LIGHT: 17,
        LINEAR_LIGHT: 18,
        VIVID_LIGHT: 19,
        PIN_LIGHT: 20,
        HARD_MIX: 21,
        DIFFERENCE: 23,
        EXCLUSION: 24,
        HUE: 26,
        SATURATION: 27,
        COLOR: 28,
        LUMINOSITY: 29,
    }

    function getBlendMode(value){
        var blendModeValue = blendModes.normal;
        switch(value){
            case BlendingMode.MULTIPLY:
                blendModeValue = blendModes.multiply;
                break;
            case BlendingMode.SCREEN:
                blendModeValue = blendModes.screen;
                break;
            case BlendingMode.OVERLAY:
                blendModeValue = blendModes.overlay;
                break;
            case BlendingMode.DARKEN:
                blendModeValue = blendModes.darken;
                break;
            case BlendingMode.LIGHTEN:
                blendModeValue = blendModes.lighten;
                break;
            case BlendingMode.CLASSIC_COLOR_DODGE:
            case BlendingMode.COLOR_DODGE:
                blendModeValue = blendModes.colorDodge;
                break;
            case BlendingMode.CLASSIC_COLOR_BURN:
            case BlendingMode.COLOR_BURN:
                blendModeValue = blendModes.colorBurn;
                break;
            case BlendingMode.HARD_LIGHT:
                blendModeValue = blendModes.hardLight;
                break;
            case BlendingMode.SOFT_LIGHT:
                blendModeValue = blendModes.softLight;
                break;
            case BlendingMode.DIFFERENCE:
                blendModeValue = blendModes.difference;
                break;
            case BlendingMode.EXCLUSION:
                blendModeValue = blendModes.exclusion;
                break;
            case BlendingMode.HUE:
                blendModeValue = blendModes.hue;
                break;
            case BlendingMode.SATURATION:
                blendModeValue = blendModes.saturation;
                break;
            case BlendingMode.COLOR:
                blendModeValue = blendModes.color;
                break;
            case BlendingMode.LUMINOSITY:
                blendModeValue = blendModes.luminosity;
                break;
            case BlendingMode.ADD:
                blendModeValue = blendModes.add;
                break;
            default:
                blendModeValue = blendModes.normal;
        }
        return blendModeValue;
    }

    function getBlendModeShape(value) {
        
        var blendModeValue = blendModes.normal;
        switch(value){
            case BlendingModeShape.MULTIPLY:
                blendModeValue = blendModes.multiply;
                break;
            case BlendingModeShape.SCREEN:
                blendModeValue = blendModes.screen;
                break;
            case BlendingModeShape.OVERLAY:
                blendModeValue = blendModes.overlay;
                break;
            case BlendingModeShape.DARKEN:
                blendModeValue = blendModes.darken;
                break;
            case BlendingModeShape.COLOR_BURN:
                blendModeValue = blendModes.colorBurn;
                break;
            case BlendingModeShape.LIGHTEN:
                blendModeValue = blendModes.lighten;
                break;
            case BlendingModeShape.COLOR_DODGE:
                blendModeValue = blendModes.colorDodge;
                break;
            case BlendingModeShape.SOFT_LIGHT:
                blendModeValue = blendModes.softLight;
                break;
            case BlendingModeShape.HARD_LIGHT:
                blendModeValue = blendModes.hardLight;
                break;
            case BlendingModeShape.DIFFERENCE:
                blendModeValue = blendModes.difference;
                break;
            case BlendingModeShape.EXCLUSION:
                blendModeValue = blendModes.exclusion;
                break;
            case BlendingModeShape.HUE:
                blendModeValue = blendModes.hue;
                break;
            case BlendingModeShape.SATURATION:
                blendModeValue = blendModes.saturation;
                break;
            case BlendingModeShape.COLOR:
                blendModeValue = blendModes.color;
                break;
            case BlendingModeShape.LUMINOSITY:
                blendModeValue = blendModes.luminosity;
                break;
            default:
                blendModeValue = blendModes.normal;
        }
        return blendModeValue;
    }

	return ob;
}())