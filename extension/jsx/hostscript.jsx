/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global bm_eventDispatcher, File, Folder*/
var bm_main = (function () {
    'use strict';
    var ob = {};
    
    function browseFile(path) {
        //openDlg()
        path = path ? path : Folder.desktop.absoluteURI
        var f = new File(path);
        var openFileData = f.openDlg();
        if (openFileData !== null) {
            bm_eventDispatcher.sendEvent('bm:file:uri', openFileData.fsName);
        } else {
            bm_eventDispatcher.sendEvent('bm:file:cancel');
        }

    }
    
    ob.browseFile = browseFile;

    return ob;
}());