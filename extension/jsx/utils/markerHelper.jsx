/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global bm_eventDispatcher*/
var bm_markerHelper = (function () {
    'use strict';
    var ob = {};
    
    function searchMarkers(comp, ob) {
        if (!(comp.marker && comp.marker.numProperties > 0)) {
            return;
        }
        var markersData = [], markerData, markers = comp.marker, i, len = markers.numProperties, markerElement;
        for (i = 0; i < len; i += 1) {
            markerData = {};
            markerElement = markers(i + 1);
            markersData.push(markerData);
        }
    }
    
    ob.searchMarkers = searchMarkers;
    
    return ob;
}());