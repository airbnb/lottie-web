/*jslint vars: true , plusplus: true, continue:true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global bm_keyframeHelper, bm_eventDispatcher, bm_generalUtils*/
var bm_cameraHelper = (function () {
    'use strict';
    var ob = {};
    
    function exportCamera(layerInfo, data, frameRate) {
        data.pe = bm_keyframeHelper.exportKeyframes(layerInfo.property('Camera Options').property('Zoom'), frameRate);
        data.ks = {};
        if (layerInfo.transform['Point of Interest'].canSetExpression) {
            data.ks.a = bm_keyframeHelper.exportKeyframes(layerInfo.transform['Point of Interest'], frameRate);
        }
        if (layerInfo.transform.position.dimensionsSeparated) {
            data.ks.p = {s: true};
            data.ks.p.x = bm_keyframeHelper.exportKeyframes(layerInfo.transform['X Position'], frameRate);
            data.ks.p.y = bm_keyframeHelper.exportKeyframes(layerInfo.transform['Y Position'], frameRate);
            data.ks.p.z = bm_keyframeHelper.exportKeyframes(layerInfo.transform['Z Position'], frameRate);
        } else {
            data.ks.p = bm_keyframeHelper.exportKeyframes(layerInfo.transform.position, frameRate);
        }
        data.ks.or = bm_keyframeHelper.exportKeyframes(layerInfo.transform.Orientation, frameRate);
        data.ks.rx = bm_keyframeHelper.exportKeyframes(layerInfo.transform['X Rotation'], frameRate);
        data.ks.ry = bm_keyframeHelper.exportKeyframes(layerInfo.transform['Y Rotation'], frameRate);
        data.ks.rz = bm_keyframeHelper.exportKeyframes(layerInfo.transform['Z Rotation'], frameRate);
    }
    
    ob.exportCamera = exportCamera;
    
    return ob;
}());
    