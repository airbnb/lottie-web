/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global window, document, CSInterface*/


/*

    Responsible for overwriting CSS at runtime according to CC app
    settings as defined by the end user.

*/

var themeManager = (function () {
    'use strict';
     
    /**
     * Convert the Color object to string in hexadecimal format;
     */
    function toHex(color, delta) {
        
        function computeValue(value, delta) {
            var computedValue = !isNaN(delta) ? value + delta : value;
            if (computedValue < 0) {
                computedValue = 0;
            } else if (computedValue > 255) {
                computedValue = 255;
            }
            
            computedValue = Math.floor(computedValue);
    
            computedValue = computedValue.toString(16);
            return computedValue.length === 1 ? "0" + computedValue : computedValue;
        }
    
        var hex = "";
        if (color) {
            hex = computeValue(color.red, delta) + computeValue(color.green, delta) + computeValue(color.blue, delta);
        }
        return hex;
    }


    function reverseColor(color, delta) {
        return toHex({
            red: Math.abs(255 - color.red),
            green: Math.abs(255 - color.green),
            blue: Math.abs(255 - color.blue)
        },
            delta);
    }
            

    function addRule(stylesheetId, selector, rule) {
        var stylesheet = document.getElementById(stylesheetId);
        
        if (stylesheet) {
            stylesheet = stylesheet.sheet;
            if (stylesheet.addRule) {
                stylesheet.addRule(selector, rule);
            } else if (stylesheet.insertRule) {
                stylesheet.insertRule(selector + ' { ' + rule + ' }', stylesheet.cssRules.length);
            }
        }
    }
        
        
                
    /**
     * Update the theme with the AppSkinInfo retrieved from the host product.
     */
    function updateThemeWithAppSkinInfo(appSkinInfo) {
        
        var panelBgColor = appSkinInfo.panelBackgroundColor.color;
        var bgdColor = toHex(panelBgColor);
       
        var darkBgdColor =  toHex(panelBgColor, 20);
        
        var fontColor = "F0F0F0";
        if (panelBgColor.red > 122) {
            fontColor = "000000";
        }
        var lightBgdColor = toHex(panelBgColor, -100);
                
        var styleId = "hostStyle";
        
        addRule(styleId, ".hostElt", "background-color:" + "#" + bgdColor);
        addRule(styleId, ".hostElt", "font-size:" + appSkinInfo.baseFontSize + "px;");
        addRule(styleId, ".hostElt", "font-family:" + appSkinInfo.baseFontFamily);
        addRule(styleId, ".hostElt", "color:" + "#" + fontColor);

        addRule(styleId, ".hostBgd", "background-color:" + "#" + bgdColor);
        addRule(styleId, ".hostBgdDark", "background-color: " + "#" + darkBgdColor);
        addRule(styleId, ".hostBgdLight", "background-color: " + "#" + lightBgdColor);
        addRule(styleId, ".hostFontSize", "font-size:" + appSkinInfo.baseFontSize + "px;");
        addRule(styleId, ".hostFontFamily", "font-family:" + appSkinInfo.baseFontFamily);
        addRule(styleId, ".hostFontColor", "color:" + "#" + fontColor);
        
        addRule(styleId, ".hostFont", "font-size:" + appSkinInfo.baseFontSize + "px;");
        addRule(styleId, ".hostFont", "font-family:" + appSkinInfo.baseFontFamily);
        addRule(styleId, ".hostFont", "color:" + "#" + fontColor);
        
        addRule(styleId, ".hostButton", "background-color:" + "#" + darkBgdColor);
        addRule(styleId, ".hostButton:hover", "background-color:" + "#" + bgdColor);
        addRule(styleId, ".hostButton:active", "background-color:" + "#" + darkBgdColor);
        addRule(styleId, ".hostButton", "border-color: " + "#" + lightBgdColor);        

    }
    
    
    function onAppThemeColorChanged(event) {
        var skinInfo = JSON.parse(window.__adobe_cep__.getHostEnvironment()).appSkinInfo;
        updateThemeWithAppSkinInfo(skinInfo);
    }


    function init() {
        
        var csInterface = new CSInterface();
    
        updateThemeWithAppSkinInfo(csInterface.hostEnvironment.appSkinInfo);
        
        csInterface.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, onAppThemeColorChanged);
    }
    
    return {
        init: init
    };
    
}());
