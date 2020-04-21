/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, ExternalObject, CSXSEvent*/

$.__bodymovin.bm_eventDispatcher = (function () {
    'use strict';
    
    var JSON = $.__bodymovin.JSON;
    var xLib;
    try {
        xLib = new ExternalObject('lib:\PlugPlugExternalObject');
    } catch (e) { alert("Missing ExternalObject: "); }
    
    function sendEvent(type, data) {
        if (xLib) {
            if (data && data instanceof Object) {
                data = JSON.stringify(data);
            }
            if(typeof data === 'number') {
                data = data.toString()
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
    
    function alert(message) {
        sendEvent('bm:alert', {message: message});
    }
    
    var ob = {
        sendEvent : sendEvent,
        log : log,
        alert : alert,
    };
    return ob;
}());