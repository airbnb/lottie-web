/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global bm_keyframeHelper*/
$.__bodymovin.bm_timeremapHelper = (function () {
    'use strict';
    var bm_keyframeHelper = $.__bodymovin.bm_keyframeHelper;
    
    var ob = {};
    
    function exportTimeremap(layerInfo, layerData, frameRate, stretch) {
        if (layerInfo.canSetTimeRemapEnabled && layerInfo.timeRemapEnabled) {
        	var stretch = layerData.sr;
            layerData.tm = bm_keyframeHelper.exportKeyframes(layerInfo['Time Remap'], frameRate, stretch);
        }
    }
    
    ob.exportTimeremap = exportTimeremap;
    
    return ob;
    
}());