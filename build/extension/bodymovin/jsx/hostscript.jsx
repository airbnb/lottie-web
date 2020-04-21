/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, File, Folder*/

$.__bodymovin = $.__bodymovin || {esprima:{}}
$.__bodymovin.bm_main = (function () {
    'use strict';
    var ob = {};
    
    function browseFile_(path) {
        //openDlg()
        path = path ? path : Folder.desktop.absoluteURI
        var f = new File(path);
        var openFileData = f.openDlg();
        if (openFileData !== null) {
            $.__bodymovin.bm_eventDispatcher.sendEvent('bm:file:uri', openFileData.fsName);
        } else {
            $.__bodymovin.bm_eventDispatcher.sendEvent('bm:file:cancel');
        }

    }
    
    function browseFile(path) {
        //openDlg()
        path = path ? path : Folder.desktop.absoluteURI
        var f = new File(path);
        var openFileData = f.openDlg();
        if (openFileData !== null) {
            $.__bodymovin.bm_eventDispatcher.sendEvent('bm:file:uri', {
                absoluteURI: openFileData.absoluteURI,
                fsName: openFileData.fsName,
                path: openFileData.path,
            });
        } else {
            $.__bodymovin.bm_eventDispatcher.sendEvent('bm:file:cancel');
        }

    }
    
    ob.browseFile = browseFile;

    return ob;
}());