/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global app, bm_eventDispatcher, bm_projectManager, bm_shapeHelper, bm_renderManager, ParagraphJustification*/
var bm_textShapeHelper = (function () {
    'use strict';
    var ob = {}, chars = [], comp, layers = [];
    
    function reset() {
        chars.length = 0;
    }
    
    function addTextLayer(layer) {
        layers.push(layer);
    }
    
    function addChar(ch, size, font, style) {
        var i = 0, charData, len = chars.length;
        while (i < len) {
            if (chars[i].ch === ch && chars[i].font === font && chars[i].style === style) {
                return false;
            }
            i += 1;
        }
        charData = {
            ch: ch,
            size: size,
            font: font,
            style: style
        };
        chars.push(charData);
        return charData;
    }
    
    function resetProp(p, def) {
        if (!p) {
            return;
        }
        if (p.isModified) {
            if (p.expression !== "") {
                p.expression = "";
            }
            while (p.numKeys > 0) {
                p.removeKey(1);
            }
            p.setValue(def);
        }
        return;
    }
    
    function removeLayerAnimators(textLayer) {
        var layerInfo = textLayer.property("Text");
        var i, len = layerInfo.numProperties;
        for (i = 0; i < len; i += 1) {
            if (layerInfo.property(i + 1).matchName === "ADBE Text Animators") {
                var animatorInfo = layerInfo.property(i + 1);
                var j, jLen = animatorInfo.numProperties;
                for (j = 0; j < jLen; j += 1) {
                    if (animatorInfo.property(j + 1).matchName === "ADBE Text Animator") {
                        animatorInfo.property(j + 1).remove();
                        j -= 1;
                        jLen -= 1;
                    }
                }
            }
        }
        if ((textLayer.mask && textLayer.mask.numProperties > 0)) {
            textLayer.mask(1).remove();
        }
        resetProp(textLayer.transform.position, [0, 0, 0]);
        resetProp(textLayer.transform.rotation, 0);
    }
    
    function createNewChar(layerInfo, ch, charData) {
        if (ch === ' ' || ch.charCodeAt(0) === 13) {
            return;
        }
        var shapeLayer;
        var l, lLen;
        var cmdID = bm_projectManager.getCommandID('shapesFromText');
        layerInfo.copyToComp(comp);
        var dupl = comp.layers[1];
        removeLayerAnimators(dupl);
        var textProp = dupl.property("Source Text");
        var textDocument = textProp.value;
        textDocument.text = ch;
        textDocument.fontSize = 100;
        textDocument.justification = ParagraphJustification.LEFT_JUSTIFY;
        textProp.setValue(textDocument);
        dupl.enabled = true;
        dupl.selected = true;
        app.executeCommand(cmdID);
        dupl.selected = false;
        shapeLayer = comp.layers[1];
        charData.data = {};
        bm_shapeHelper.exportShape(shapeLayer, charData.data, 1, true);
        lLen = charData.data.shapes[0].it.length;
        for (l = 0; l < lLen; l += 1) {
            var k, kLen = charData.data.shapes[0].it[l].ks.i.length;
            for (k = 0; k < kLen; k += 1) {
                charData.data.shapes[0].it[l].ks.i[k][0] += charData.data.shapes[0].it[l].ks.v[k][0];
                charData.data.shapes[0].it[l].ks.i[k][1] += charData.data.shapes[0].it[l].ks.v[k][1];
                charData.data.shapes[0].it[l].ks.o[k][0] += charData.data.shapes[0].it[l].ks.v[k][0];
                charData.data.shapes[0].it[l].ks.o[k][1] += charData.data.shapes[0].it[l].ks.v[k][1];
            }
        }
        shapeLayer.selected = false;
    }
    
    function exportChars(fonts) {
        comp = app.project.items.addComp('bm_fontHelper', 1000, 1000, 1, 1, 1);
        comp.openInViewer();
        var layerCollection = comp.layers;
        var i, len = layers.length, layerInfo;
        for (i = 0; i < len; i += 1) {
            layerInfo = layers[i];
            var textProp = layerInfo.property("Source Text");
            var textDocument = textProp.value;
            var font = textDocument.font;
            var fontFamily = textDocument.fontFamily;
            var fontStyle = textDocument.fontStyle;
            var fontSize = textDocument.fontSize;
            var text = textDocument.text;
            var j, jLen = text.length;
            var l, lLen;
            for (j = 0; j < jLen; j += 1) {
                var ch = text.substr(j, 1);
                var charData = addChar(ch, fontSize, font, fontStyle);
                if (charData !== false) {
                    createNewChar(layerInfo, ch, charData);
                    l = 0;
                    lLen = fonts.list.length;
                    while (l < lLen) {
                        if (fonts.list[l].fName === charData.font) {
                            charData.fFamily = fonts.list[l].fFamily;
                            break;
                        }
                        l += 1;
                    }
                }
            }
        }
        
        comp.remove();
        bm_renderManager.setChars(chars);
    }
    
    ob.reset = reset;
    ob.addChar = addChar;
    ob.addTextLayer = addTextLayer;
    ob.exportChars = exportChars;
    
    return ob;
}());