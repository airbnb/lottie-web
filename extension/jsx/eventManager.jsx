/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, ExternalObject, CSXSEvent*/

var bm_eventDispatcher = (function () {
    'use strict';
    
    var xLib;
    try {
        xLib = new ExternalObject('lib:\PlugPlugExternalObject');
    } catch (e) { alert("Missing ExternalObject: "); }
    
    function sendEvent(type, data) {
        if (xLib) {
            if (data && data instanceof Object) {
                data = JSON.stringify(data);
            }
            var eventObj = new CSXSEvent();
            eventObj.type = type;
            eventObj.data = data || '';
            eventObj.dispatch();
        }
    }
    
    function log(data) {
        sendEvent('console:log', data);
    }
    
    var ob = {
        sendEvent : sendEvent,
        log : log
    };
    return ob;
}());