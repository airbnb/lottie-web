/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global Folder, File, bm_eventDispatcher, $ */
var bm_downloadManager = (function () {
    'use strict';
    var ob = {};
    
    function getPlayer(zippedFlag) {
        var extensionPath = $.fileName.split('/').slice(0, -1).join('/') + '/';
        var folder = new Folder(extensionPath);
        folder = folder.parent;
        var fileName;
        if (zippedFlag) {
            fileName = 'bm.js.gz';
        } else {
            fileName = 'bm.js';
        }
        var bmFile = new File(folder.absoluteURI + '/assets/player/' + fileName);
        
        var uri = Folder.desktop.absoluteURI + '/bodymovin.js';
        var f = new File(uri);
        var saveFileData = f.saveDlg();
        if (saveFileData !== null) {
            if (bmFile.copy(saveFileData.absoluteURI)) {
                bm_eventDispatcher.sendEvent('bm:alert', {message: 'File saved', type: 'success'});
            } else {
                bm_eventDispatcher.sendEvent('bm:alert', {message: 'File could not be saved', type: 'fail'});
            }
        }
    }
    
    function getStandaloneData() {
        var extensionPath = $.fileName.split('/').slice(0, -1).join('/') + '/';
        var folder = new Folder(extensionPath);
        folder = folder.parent;
        var bmFile = new File(folder.absoluteURI + '/assets/player/standalone.js');
        bmFile.open('r');
        var str = bmFile.read();
        return str;
    }
    
    function getDemoData() {
        var extensionPath = $.fileName.split('/').slice(0, -1).join('/') + '/';
        var folder = new Folder(extensionPath);
        folder = folder.parent;
        var bmFile = new File(folder.absoluteURI + '/assets/player/demo.html');
        bmFile.open('r');
        var str = bmFile.read();
        return str;
    }
    
    ob.getPlayer = getPlayer;
    ob.getStandaloneData = getStandaloneData;
    ob.getDemoData = getDemoData;

    return ob;
}());