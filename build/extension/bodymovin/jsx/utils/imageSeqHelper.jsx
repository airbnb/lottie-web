/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, layerElement, File, app, ParagraphJustification, bm_textAnimatorHelper, bm_keyframeHelper, bm_sourceHelper, bm_textShapeHelper*/
$.__bodymovin.bm_imageSeqHelper = (function () {
    'use strict';
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var bm_sourceHelper;
    var bm_generalUtils = $.__bodymovin.bm_generalUtils;
    var layerTypes = $.__bodymovin.layerTypes;
    var ob = {};

    function getSourceHelper() {
        if (!bm_sourceHelper) {
            bm_sourceHelper = $.__bodymovin.bm_sourceHelper;
        }
        return bm_sourceHelper;
    }
    
    function exportStills(layerInfo, layerOb, frameRate) {
        var sourceHelper = getSourceHelper();
        layerOb.w = layerInfo.width;
        layerOb.h = layerInfo.height;
        layerOb.ty = layerTypes.precomp;
        if (layerOb.compId) {
            var totalFrames = Math.round(layerInfo.source.duration / layerInfo.source.frameDuration);
            var sequenceIds = sourceHelper.addImageSequenceStills(layerInfo.source, totalFrames);
            var i;
            var layers = [];
            for( i = 0; i < totalFrames; i += 1) {

                var duration = i === totalFrames - 1 ? 2 : 1;

                layers.push({
                    ty: layerTypes.still,
                    sc: "#00ffff",
                    refId: sequenceIds[i],
                    ks: {
                        p:{a:0,k:[0,0]},
                        a:{a:0,k:[0,0]},
                        s:{a:0,k:[100,100]},
                        r:{a:0,k:[0]},
                        o:{a:0,k:[100]},
                    },
                    ip: Math.round(1000 * i / 1) / 1000,
                    st: Math.round(1000 * i / 1) / 1000,
                    op: Math.round(1000 * (i + duration) / 1) / 1000,
                    sr: 1,
                    bm: 0,
                })
            }
            layerOb.layers = layers;
        }
        // bm_generalUtils.iterateOwnProperties(layerInfo.source);
    }
    
    ob.exportStills = exportStills;
    
    return ob;
    
}());