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
            var file = new File(openFileData.absoluteURI);
            if (file.open('r')) {
                var reading = file.read();
                reading = '__PFX__' + reading;
                bm_eventDispatcher.sendEvent('bm:file:path', reading);
            }
            
        }

    }
    
    ob.browseFile = browseFile;

    return ob;
}());