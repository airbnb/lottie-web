/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global bm_eventDispatcher, File, Folder*/
var bm_main = (function () {
    'use strict';
    var ob = {};
    
    function browseFile() {
        //openDlg()
        var f = new File(Folder.desktop.absoluteURI);
        var openFileData = f.openDlg();
        if (openFileData !== null) {
            bm_eventDispatcher.sendEvent('bm:file:uri', openFileData.fsName);
        }

    }
    
    ob.browseFile = browseFile;

    return ob;
}());