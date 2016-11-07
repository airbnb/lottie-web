/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global app, bm_eventDispatcher, bm_projectManager, bm_shapeHelper, bm_renderManager, ParagraphJustification, bm_generalUtils*/
var bm_textShapeHelper = (function () {
    'use strict';
    var ob = {}, chars = [], comp, fontComp, dupl, boxText, layers = [], currentFont, compsAddedFlag = false;
    
    function reset() {
        chars.length = 0;
        layers.length = 0;
        currentFont = '';
        compsAddedFlag = false;
    }
    
    function addComps() {
        if (compsAddedFlag) {
            return;
        }
        compsAddedFlag = true;
        comp = app.project.items.addComp('bm_charHelper', 1000, 1000, 1, 1, 1);
        fontComp = app.project.items.addComp('bm_fontHelper', 1000, 1000, 1, 1, 1);
        boxText = fontComp.layers.addBoxText([500, 500], 'm');
        dupl = comp.layers.addText();
        var textProp = dupl.property("Source Text");
        var textDocument = textProp.value;
        textDocument.fontSize = 100;
        textDocument.justification = ParagraphJustification.LEFT_JUSTIFY;

        textProp.setValue(textDocument);
        var fontProp = dupl.property("Source Text");
        var fontDocument = fontProp.value;
        fontDocument.fontSize = 100;
        fontDocument.justification = ParagraphJustification.LEFT_JUSTIFY;
        fontProp.setValue(fontDocument);
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
    
    function createNewChar(layerInfo, originalTextDocument, ch, charData) {
            //"allCaps","applyFill","applyStroke","baselineLocs","baselineShift","boxText","boxTextPos","boxTextSize","fauxBold","fauxItalic","fillColor","font","fontFamily","fontLocation","fontSize","fontStyle","horizontalScale","justification","pointText","resetCharStyle","resetParagraphStyle","smallCaps","strokeColor","strokeOverFill","strokeWidth","subscript","superscript","text","tracking","tsume","verticalScale"
        if (ch.charCodeAt(0) === 13) {
            return;
        }
        var shapeLayer;
        var l, lLen;
        var cmdID = bm_projectManager.getCommandID('shapesFromText');
        layerInfo.copyToComp(comp);
        //var dupl = comp.layers[1];
        //var dupl = comp.layers.addText();
        //removeLayerAnimators(dupl);
        var textProp = dupl.property("Source Text");
        var textDocument = textProp.value;
        if (ch !== ' ') {
            textDocument.text = ch + ch;
        } else {
            textDocument.text = 'i i';
        }
        textDocument.font = originalTextDocument.font;
        textDocument.fontSize = 100;
        textDocument.tracking = 0;
        textDocument.justification = ParagraphJustification.LEFT_JUSTIFY;
        textProp.setValue(textDocument);
        dupl.enabled = true;
        dupl.selected = true;
        if (ch !== ' ') {
            app.executeCommand(cmdID);
        }
        dupl.selected = false;
        var doubleSize, singleSize;
        doubleSize = dupl.sourceRectAtTime(0, false).width;
        if (ch !== ' ') {
            textDocument.text = ch;
        } else {
            textDocument.text = 'ii';
        }
        textProp.setValue(textDocument);
        singleSize = dupl.sourceRectAtTime(0, false).width;
        charData.w = bm_generalUtils.roundNumber(doubleSize - singleSize, 2);
        shapeLayer = comp.layers[1];
        charData.data = {};
        if (ch !== ' ') {
            bm_shapeHelper.exportShape(shapeLayer, charData.data, 1, true);
            lLen = charData.data.shapes[0].it.length;
            for (l = 0; l < lLen; l += 1) {
                var ks = charData.data.shapes[0].it[l].ks;
                if (ks) {
                    var k, kLen = ks.k.i.length;
                    for (k = 0; k < kLen; k += 1) {
                        ks.k.i[k][0] += ks.k.v[k][0];
                        ks.k.i[k][1] += ks.k.v[k][1];
                        ks.k.o[k][0] += ks.k.v[k][0];
                        ks.k.o[k][1] += ks.k.v[k][1];
                    }
                } else {
                    charData.data.shapes[0].it.splice(l, 1);
                    l -= 1;
                    lLen -= 1;
                }
            }
        }
        shapeLayer.selected = false;
    }
    
    function exportChars(fonts) {
        
        comp.openInViewer();
        var i, len = layers.length, layerInfo;
        var k, kLen;
        for (i = 0; i < len; i += 1) {
            layerInfo = layers[i];
            var textProp = layerInfo.property("Source Text");
            kLen = textProp.numKeys;
            var keysFlag = true;
            if(kLen === 0){
                kLen = 1;
                keysFlag = false;
            }
            var textDocument;
            for(k=0;k<kLen;k+=1){
                if(!keysFlag){
                    textDocument = textProp.value;
                } else {
                    textDocument = textProp.keyValue(k + 1);
                }
                var font = textDocument.font;
                var fontFamily = textDocument.fontFamily;
                var fontStyle = textDocument.fontStyle;
                var fontSize = textDocument.fontSize;
                var text = textDocument.allCaps ? textDocument.text.toUpperCase() : textDocument.text;
                var j, jLen = text.length;

                if (currentFont !== font) {
                    currentFont = font;
                    createNewChar(layerInfo, textDocument, '[]', {});
                }
                var l, lLen;
                for (j = 0; j < jLen; j += 1) {
                    var ch = text.substr(j, 1);
                    var charData = addChar(ch, fontSize, font, fontStyle);
                    if (charData !== false) {
                        createNewChar(layerInfo, textDocument, ch, charData);
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

        }
        
        bm_renderManager.setChars(chars);
    }
    
    function exportFonts(fonts) {
        fontComp.openInViewer();
        var i, len = fonts.list.length, rect;
        var fontProp = boxText.property("Source Text");
        var fontDocument = fontProp.value;
        fontDocument.text = 'm';
        for (i = 0; i < len; i += 1) {
            fontDocument.font = fonts.list[i].fName;
            fontDocument.fontSize = 100;
            fontDocument.tracking = 0;
            fontProp.setValue(fontDocument);
            rect = boxText.sourceRectAtTime(0, false);
            fonts.list[i].ascent = 250 + rect.top + rect.height;
        }
    }
    
    function removeComps() {
        if (compsAddedFlag) {
            comp.remove();
            fontComp.remove();
            compsAddedFlag = false;
        }
    }
    
    ob.reset = reset;
    ob.addChar = addChar;
    ob.addTextLayer = addTextLayer;
    ob.exportChars = exportChars;
    ob.exportFonts = exportFonts;
    ob.addComps = addComps;
    ob.removeComps = removeComps;
    
    return ob;
}());