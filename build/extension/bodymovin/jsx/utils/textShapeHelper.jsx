/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global app, bm_projectManager, $, ParagraphJustification*/
$.__bodymovin.bm_textShapeHelper = (function () {
    var bm_projectManager = $.__bodymovin.bm_projectManager;
    var bm_compsManager = $.__bodymovin.bm_compsManager;
    var bm_renderManager = $.__bodymovin.bm_renderManager;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var layerTypes = $.__bodymovin.layerTypes;
    var getLayerType = $.__bodymovin.getLayerType;
    var bm_generalUtils = $.__bodymovin.bm_generalUtils;
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
        textDocument.resetCharStyle();
        textDocument.resetParagraphStyle();
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

    function getOutlinesLayer(comp) {
        var i = 1, len = comp.layers.length, layer;
        while(i <= len) {
            layer = comp.layers[i];
            var layerType = getLayerType(layer);
            if(layerType === layerTypes.shape) {
                return layer;
            }
            i += 1;
        }
    }
    
    function createNewChar(layerInfo, originalTextDocument, ch, charData) {
        if (bm_compsManager.cancelled) {
            return;
        }
        try {
            var charCode = ch.charCodeAt(0);
                //"allCaps","applyFill","applyStroke","baselineLocs","baselineShift","boxText","boxTextPos","boxTextSize","fauxBold","fauxItalic","fillColor","font","fontFamily","fontLocation","fontSize","fontStyle","horizontalScale","justification","pointText","resetCharStyle","resetParagraphStyle","smallCaps","strokeColor","strokeOverFill","strokeWidth","subscript","superscript","text","tracking","tsume","verticalScale"
            if (charCode === 13 || charCode === 3 || charCode === 160 || charCode === 65279) {
                charData.w = 0;
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
            if (charCode !== 32 && charCode !== 9) {
                textDocument.text = ch + ch;
            } else {
                textDocument.text = 'i' + ch + 'i';
            }
            textDocument.font = originalTextDocument.font;
            textDocument.fontSize = 100;
            textDocument.tracking = 0;
            textDocument.justification = ParagraphJustification.LEFT_JUSTIFY;
            textProp.setValue(textDocument);
            dupl.enabled = true;
            dupl.selected = true;
            var hasShapeData = true;
            if (charCode !== 32 && charCode !== 9) {
                hasShapeData = false;
                app.executeCommand(3781);
            }
            dupl.selected = false;
            var doubleSize, singleSize;
            doubleSize = dupl.sourceRectAtTime(0, false).width;
            if (charCode !== 32 && charCode !== 9) {
                textDocument.text = ch;
            } else {
                textDocument.text = 'ii';
            }
            textProp.setValue(textDocument);
            singleSize = dupl.sourceRectAtTime(0, false).width;
            charData.w = bm_generalUtils.roundNumber(doubleSize - singleSize, 2);
            shapeLayer = getOutlinesLayer(comp);
            charData.data = {};
            if (charCode !== 32 && charCode !== 9) {
                $.__bodymovin.bm_shapeHelper.exportShape(shapeLayer, charData.data, 1, true);
                while(charData.data.shapes.length > 1) {
                    charData.data.shapes.pop();
                }
                lLen = charData.data.shapes[0].it.length;
                for (l = 0; l < lLen; l += 1) {
                    var ks = charData.data.shapes[0].it[l].ks;
                    if (ks) {
                        var k, kLen = ks.k.i.length;
                        /*for (k = 0; k < kLen; k += 1) {
                            ks.k.i[k][0] += ks.k.v[k][0];
                            ks.k.i[k][1] += ks.k.v[k][1];
                            ks.k.o[k][0] += ks.k.v[k][0];
                            ks.k.o[k][1] += ks.k.v[k][1];
                        }*/
                    } else {
                        charData.data.shapes[0].it.splice(l, 1);
                        l -= 1;
                        lLen -= 1;
                    }
                }
            }




            if(shapeLayer && shapeLayer.containingComp) {
                shapeLayer.selected = false;
                shapeLayer.remove();
            }
        } catch(err) {
            bm_eventDispatcher.alert('Character could not be created: ' + ch); 
        }
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
                var l, lLen, ch;
                for (j = 0; j < jLen; j += 1) {
                    var charCode = text.charCodeAt(j);
                    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
                        charCode = text.charCodeAt(j + 1);
                        if (charCode >= 0xDC00 && charCode <= 0xDFFF) {
                            ch = text.substr(j, 2);
                            ++j;
                        } else {
                            ch = text.substr(j, 1);
                        }
                    } else {
                        ch = text.substr(j, 1);
                    }
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
        var i, len = fonts.list.length, rect, baseLineShift;
        var fontProp = boxText.property("Source Text");
        var fontDocument = fontProp.value;
        fontDocument.text = 'm';
        for (i = 0; i < len; i += 1) {
            fontDocument.font = fonts.list[i].fName;
            fontDocument.fontSize = 100;
            fontDocument.tracking = 0;
            fontProp.setValue(fontDocument);
            rect = boxText.sourceRectAtTime(0, false);
            baseLineShift = 0;
            if(fontDocument.baselineShift){
                baseLineShift = fontDocument.baselineShift;
            }
            fonts.list[i].ascent = 250 + rect.top + rect.height + baseLineShift;
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