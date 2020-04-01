/*jslint vars: true , plusplus: true, continue:true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $*/
$.__bodymovin.bm_cameraHelper = (function () {
    var bm_keyframeHelper = $.__bodymovin.bm_keyframeHelper;
    var ob = {};
    
    function exportCamera(layerInfo, data, frameRate) {
        var stretch = data.sr;
        data.pe = bm_keyframeHelper.exportKeyframes(layerInfo.property('ADBE Camera Options Group').property('ADBE Camera Zoom'), frameRate, stretch);
        data.ks = {};
        if (layerInfo.transform.property('ADBE Anchor Point').canSetExpression) {
            data.ks.a = bm_keyframeHelper.exportKeyframes(layerInfo.transform.property('ADBE Anchor Point'), frameRate, stretch);
        }
        if (layerInfo.transform.position.dimensionsSeparated) {
            data.ks.p = {s: true};
            data.ks.p.x = bm_keyframeHelper.exportKeyframes(layerInfo.transform.property('ADBE Position_0'), frameRate, stretch);
            data.ks.p.y = bm_keyframeHelper.exportKeyframes(layerInfo.transform.property('ADBE Position_1'), frameRate, stretch);
            data.ks.p.z = bm_keyframeHelper.exportKeyframes(layerInfo.transform.property('ADBE Position_2'), frameRate, stretch);
        } else {
            data.ks.p = bm_keyframeHelper.exportKeyframes(layerInfo.transform.position, frameRate, stretch);
        }
        data.ks.or = bm_keyframeHelper.exportKeyframes(layerInfo.transform.Orientation, frameRate, stretch);
        data.ks.rx = bm_keyframeHelper.exportKeyframes(layerInfo.transform.property('ADBE Rotate X'), frameRate, stretch);
        data.ks.ry = bm_keyframeHelper.exportKeyframes(layerInfo.transform.property('ADBE Rotate Y'), frameRate, stretch);
        data.ks.rz = bm_keyframeHelper.exportKeyframes(layerInfo.transform.property('ADBE Rotate Z'), frameRate, stretch);
    }
    
    ob.exportCamera = exportCamera;
    
    return ob;
}());
    