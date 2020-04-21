/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global bm_keyframeHelper*/
$.__bodymovin.bm_transformHelper = (function () {
    'use strict';
    var bm_keyframeHelper = $.__bodymovin.bm_keyframeHelper;
    var ob = {};
    
    function exportTransform(layerInfo, data, frameRate) {

        var skipDefaultProperties = $.__bodymovin.bm_renderManager.shouldSkipDefaultProperties()

        if (!layerInfo.transform) {
            return;
        }
        var stretch = data.sr;
        
        data.ks = {};
        if (layerInfo.transform.opacity) {
            data.ks.o = bm_keyframeHelper.exportKeyframes(layerInfo.transform.opacity, frameRate, stretch);
        }
        if (layerInfo.threeDLayer) {
            data.ks.rx = bm_keyframeHelper.exportKeyframes(layerInfo.transform.property('ADBE Rotate X'), frameRate, stretch);
            data.ks.ry = bm_keyframeHelper.exportKeyframes(layerInfo.transform.property('ADBE Rotate Y'), frameRate, stretch);
            data.ks.rz = bm_keyframeHelper.exportKeyframes(layerInfo.transform.property('ADBE Rotate Z'), frameRate, stretch);
            data.ks.or = bm_keyframeHelper.exportKeyframes(layerInfo.transform.Orientation, frameRate, stretch);
        } else {
            data.ks.r = bm_keyframeHelper.exportKeyframes(layerInfo.transform.rotation, frameRate, stretch);
        }
        if (layerInfo.transform.position.dimensionsSeparated) {
            data.ks.p = {s: true};
            data.ks.p.x = bm_keyframeHelper.exportKeyframes(layerInfo.transform.property('ADBE Position_0'), frameRate, stretch);
            data.ks.p.y = bm_keyframeHelper.exportKeyframes(layerInfo.transform.property('ADBE Position_1'), frameRate, stretch);
            if (layerInfo.threeDLayer) {
                data.ks.p.z = bm_keyframeHelper.exportKeyframes(layerInfo.transform.property('ADBE Position_2'), frameRate, stretch);
            }
        } else {
            data.ks.p = bm_keyframeHelper.exportKeyframes(layerInfo.transform.position, frameRate, stretch);
        }
        if (layerInfo.transform.property('ADBE Anchor Point')) {
            data.ks.a = bm_keyframeHelper.exportKeyframes(layerInfo.transform.property('ADBE Anchor Point'), frameRate, stretch);
        }
        if (layerInfo.transform.Scale) {
            data.ks.s = bm_keyframeHelper.exportKeyframes(layerInfo.transform.Scale, frameRate, stretch);
        }
        if(layerInfo.autoOrient === AutoOrientType.ALONG_PATH){
            data.ao = 1;
        } else {
            data.ao = 0;
        }

        if(skipDefaultProperties) {
            if(data.ks.o && !data.ks.o.x && data.ks.o.k === 100) {
                delete data.ks.o
            }
            if(data.ks.r && !data.ks.r.x && data.ks.r.k === 0) {
                delete data.ks.r
            }

            if(data.ks.p && !data.ks.p.x && data.ks.p.k && data.ks.p.k.length) {
                if ((data.ks.p.k.length === 2 && data.ks.p.k[0] === 0 && data.ks.p.k[1] === 0)
                    || (data.ks.p.k.length === 3 && data.ks.p.k[0] === 0 && data.ks.p.k[1] === 0 && data.ks.p.k[2] === 0)) {
                    delete data.ks.p
                }
            }

            if(data.ks.a && !data.ks.a.x && data.ks.a.k && data.ks.a.k.length) {
                if ((data.ks.a.k.length === 2 && data.ks.a.k[0] === 0 && data.ks.a.k[1] === 0)
                    || (data.ks.a.k.length === 3 && data.ks.a.k[0] === 0 && data.ks.a.k[1] === 0 && data.ks.a.k[2] === 0)) {
                    delete data.ks.a
                }
            }

            if(data.ks.s && !data.ks.s.x && data.ks.s.k && data.ks.s.k.length) {
                if ((data.ks.s.k.length === 2 && data.ks.s.k[0] === 100 && data.ks.s.k[1] === 100)
                    || (data.ks.s.k.length === 3 && data.ks.s.k[0] === 100 && data.ks.s.k[1] === 100 && data.ks.s.k[2] === 100)) {
                    delete data.ks.s
                }
            }
        }
    }
    
    ob.exportTransform = exportTransform;
    return ob;
}());