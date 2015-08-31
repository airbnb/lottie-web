/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global bm_keyframeHelper, bm_generalUtils*/
var bm_transformHelper = (function () {
    'use strict';
    var ob = {};
    
    function exportTransform(layerInfo, data, frameRate) {
        if (!layerInfo.transform) {
            return;
        }
        
        data.ks = {};
        data.ks.o = bm_keyframeHelper.exportKeyframes(layerInfo.transform.opacity, frameRate);
        if (layerInfo.transform.rotation) {
            data.ks.r = bm_keyframeHelper.exportKeyframes(layerInfo.transform.rotation, frameRate);
        } else {
            data.ks.r = 0;
        }
        if (layerInfo.transform.position.dimensionsSeparated) {
            data.ks.p = {s: true};
            data.ks.x = bm_keyframeHelper.exportKeyframes(layerInfo.transform['X Position'], frameRate);
            data.ks.y = bm_keyframeHelper.exportKeyframes(layerInfo.transform['Y Position'], frameRate);
        } else {
            data.ks.p = bm_keyframeHelper.exportKeyframes(layerInfo.transform.position, frameRate);
        }
        data.ks.a = bm_keyframeHelper.exportKeyframes(layerInfo.transform['Anchor Point'], frameRate);
        data.ks.s = bm_keyframeHelper.exportKeyframes(layerInfo.transform.Scale, frameRate);
    }
    
    ob.exportTransform = exportTransform;
    return ob;
}());