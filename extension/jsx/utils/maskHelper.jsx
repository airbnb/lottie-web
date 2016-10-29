/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global bm_keyframeHelper, MaskMode, bm_generalUtils*/
var bm_maskHelper = (function () {
    'use strict';
    var ob = {};

    function getMaskMode(num) {
        switch (num) {
        case MaskMode.NONE:
            return 'n';
        case MaskMode.ADD:
            return 'a';
        case MaskMode.SUBTRACT:
            return 's';
        case MaskMode.INTERSECT:
            return 'i';
        case MaskMode.LIGHTEN:
            return 'l';
        case MaskMode.DARKEN:
            return 'd';
        case MaskMode.DIFFERENCE:
            return 'f';
        }
    }
    
    function exportMasks(layerInfo, layerData, frameRate) {
        if (!(layerInfo.mask && layerInfo.mask.numProperties > 0)) {
            return;
        }
        layerData.hasMask = true;
        layerData.masksProperties = [];
        var masks = layerInfo.mask;
        var i, len = masks.numProperties, maskShape, maskElement;
        for (i = 0; i < len; i += 1) {
            maskElement = masks(i + 1);
            maskShape = maskElement.property('maskShape').value;
            var shapeData = {
                inv: maskElement.inverted,
                mode: getMaskMode(maskElement.maskMode)
            };
            shapeData.pt = bm_keyframeHelper.exportKeyframes(maskElement.property('maskShape'), frameRate);
            bm_shapeHelper.checkVertexCount(shapeData.pt.k);
            //bm_generalUtils.convertPathsToAbsoluteValues(shapeData.pt.k);
            shapeData.o = bm_keyframeHelper.exportKeyframes(maskElement.property('Mask Opacity'), frameRate);
            shapeData.x = bm_keyframeHelper.exportKeyframes(maskElement.property('Mask Expansion'), frameRate);
            shapeData.nm = maskElement.name;
            layerData.masksProperties.push(shapeData);
        }
    }
    
    ob.exportMasks = exportMasks;
    
    return ob;
}());