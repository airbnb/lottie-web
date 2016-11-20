/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global layerElement, bm_generalUtils, bm_eventDispatcher, bm_renderManager, bm_compsManager, File, app, ParagraphJustification, bm_textAnimatorHelper, bm_keyframeHelper, bm_sourceHelper, bm_textShapeHelper*/
var bm_textHelper = (function () {
    'use strict';
    var ob = {};
    
    function getJustification(value) {
        switch (value) {
        case ParagraphJustification.LEFT_JUSTIFY:
            return 0;
        case ParagraphJustification.RIGHT_JUSTIFY:
            return 1;
        case ParagraphJustification.CENTER_JUSTIFY:
            return 2;
        case ParagraphJustification.FULL_JUSTIFY_LASTLINE_LEFT:
            return 3;
        case ParagraphJustification.FULL_JUSTIFY_LASTLINE_RIGHT:
            return 4;
        case ParagraphJustification.FULL_JUSTIFY_LASTLINE_CENTER:
            return 5;
        case ParagraphJustification.FULL_JUSTIFY_LASTLINE_FULL:
            return 6;
        }
    }
    
    function exportTextDocumentData(layerInfo, data, frameRate) {

        var sourceTextProp = layerInfo.property("Source Text");
        bm_expressionHelper.checkExpression(sourceTextProp, data);
        var arr = [];
        data.k = arr;
        var numKeys = sourceTextProp.numKeys;
        var j, jLen = numKeys ? numKeys : 1;
        if(jLen === 0){
            jLen = 1;
        }
        for(j=0;j<jLen;j+=1){
            var ob = {};
            var textDocument, time;
            if(numKeys === 0){
                time = 0;
                textDocument = sourceTextProp.value;
            } else {
                time = sourceTextProp.keyTime(j + 1);
                textDocument = sourceTextProp.keyValue(j + 1);
            }
            if (textDocument.boxText) {
                ob.sz = textDocument.boxTextSize;
                ob.ps = textDocument.boxTextPos;
            }
            var i, len;
            ob.s = textDocument.fontSize;
            ob.f = textDocument.font;
            bm_sourceHelper.addFont(textDocument.font, textDocument.fontFamily, textDocument.fontStyle);
            if(textDocument.allCaps){
                ob.t = textDocument.text.toUpperCase();
            } else {
                ob.t = textDocument.text;
            }
            len = ob.t.length;
            ob.j = getJustification(textDocument.justification);
            ob.tr = textDocument.tracking;
            if(textDocument.baselineLocs && textDocument.baselineLocs.length > 5){
                if(textDocument.baselineLocs[5] > textDocument.baselineLocs[1]){
                    ob.lh = textDocument.baselineLocs[5] - textDocument.baselineLocs[1];
                } else {
                    ob.lh = ob.s*1.2;
                }
            } else {
                ob.lh = ob.s*1.2;
            }
            if (textDocument.applyFill) {
                len = textDocument.fillColor.length;
                ob.fc = [];
                for (i = 0; i < len; i += 1) {
                    ob.fc[i] = Math.round(100*textDocument.fillColor[i])/100;
                }
            }
            if (textDocument.applyStroke) {
                len = textDocument.strokeColor.length;
                ob.sc = [];
                for (i = 0; i < len; i += 1) {
                    ob.sc[i] = Math.round(100*textDocument.strokeColor[i])/100;
                }
                ob.sw = textDocument.strokeWidth;
                if (textDocument.applyFill) {
                    ob.of = textDocument.strokeOverFill;
                }
            }
            arr.push({s:ob,t:time*frameRate});
        }
        bm_textShapeHelper.addTextLayer(layerInfo);

    }
    
    function exportTextPathData(pathOptions, ob, masksProperties, frameRate) {
        if (pathOptions.property("Path").value !== 0) {
            masksProperties[pathOptions.property("Path").value - 1].mode = 'n';
            ob.m = pathOptions.property("Path").value - 1;
            ob.f = bm_keyframeHelper.exportKeyframes(pathOptions.property("First Margin"), frameRate);
            ob.l = bm_keyframeHelper.exportKeyframes(pathOptions.property("Last Margin"), frameRate);
            ob.a = pathOptions.property("Force Alignment").value;
            ob.p = pathOptions.property("Perpendicular To Path").value;
            ob.r = pathOptions.property("Reverse Path").value;
        }
    }
    
    function exportMoreOptionsData(pathOptions, ob, frameRate) {
        ob.g = pathOptions.property("Anchor Point Grouping").value;
        ob.a = bm_keyframeHelper.exportKeyframes(pathOptions.property("Grouping Alignment"), frameRate);
        
    }
    
    function exportAnimators(layerInfo, animatorArr, frameRate) {
        var i, len = layerInfo.numProperties;
        for (i = 0; i < len; i += 1) {
            if (layerInfo.property(i + 1).matchName === "ADBE Text Animator") {
                var animatorOb = {};
                bm_textAnimatorHelper.exportAnimator(layerInfo.property(i + 1), animatorOb, frameRate);
                animatorArr.push(animatorOb);
            }
        }
    }
    
    function exportText(layerInfo, layerOb, frameRate) {
        layerOb.t = {
            d: {},
            p: {},
            m: {}
        };
        exportTextDocumentData(layerInfo, layerOb.t.d, frameRate);
        var textProperty = layerInfo.property("Text");
        
        var i, len = textProperty.numProperties;
        for (i = 0; i < len; i += 1) {
            switch (textProperty(i + 1).matchName) {
            case "ADBE Text Path Options":
                exportTextPathData(textProperty(i + 1), layerOb.t.p, layerOb.masksProperties, frameRate);
                break;
            case "ADBE Text More Options":
                exportMoreOptionsData(textProperty(i + 1), layerOb.t.m, frameRate);
                break;
            case "ADBE Text Animators":
                if (!layerOb.t.a) {
                    layerOb.t.a = [];
                }
                exportAnimators(textProperty(i + 1), layerOb.t.a, frameRate);
                break;
            }
        }
        //exportMoreOptionsData(layerInfo, layerOb.t.m, frameRate);
    }
    
    ob.exportText = exportText;
    
    return ob;
    
}());