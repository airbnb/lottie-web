/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global layerElement, bm_generalUtils, bm_eventDispatcher, bm_renderManager, bm_compsManager, File, app, ParagraphJustification*/
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
    
    function exportTextDocumentData(layerInfo, ob) {
        var textDocument = layerInfo.property("Source Text").value;
        ob.s = textDocument.fontSize;
        ob.f = textDocument.font;
        ob.t = textDocument.text;
        ob.j = getJustification(textDocument.justification);
        ob.tr = textDocument.tracking;
        if (textDocument.applyFill) {
            ob.fc = bm_generalUtils.arrayRgbToHex(textDocument.fillColor);
        }
        if (textDocument.applyStroke) {
            ob.sc = bm_generalUtils.arrayRgbToHex(textDocument.strokeColor);
            ob.sw = textDocument.strokeWidth;
            if (textDocument.applyFill) {
                ob.of = textDocument.strokeOverFill;
            }
        }
    }
    
    function exportTextPathData(layerInfo, ob, masksProperties) {
        var pathOptions = layerInfo.property("Text").property("Path Options");
        if (pathOptions.property("Path").value !== 0) {
            masksProperties[pathOptions.property("Path").value - 1].mode = 'n';
            ob.m = pathOptions.property("Path").value - 1;
            bm_generalUtils.iterateProperty(pathOptions);
        }
        //var pathOptions = layerInfo.property("Path Options");
        //ob.largo = pathOptions.properties.length;
    }
    
    function exportText(layerInfo, layerOb, frameRate) {
        layerOb.t = {
            d: {},
            p: {}
        };
        exportTextDocumentData(layerInfo, layerOb.t.d);
        exportTextPathData(layerInfo, layerOb.t.p, layerOb.masksProperties);
    }
    
    ob.exportText = exportText;
    
    return ob;
    
}());