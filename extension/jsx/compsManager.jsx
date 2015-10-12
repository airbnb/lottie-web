/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global bm_projectManager, bm_eventDispatcher, bm_renderManager, Folder, File */

var bm_compsManager = (function () {
    'use strict';
    
    var compositions = [], tmpCompositions = [], renderingCompositions = [], currentRenderingComposition = 0, projectComps, ob;
    
    function getCompositionData(comp) {
        var i = 0, len = compositions.length, compData;
        while (i < len) {
            if (compositions[i].id === comp.id) {
                compData = compositions[i];
                break;
            }
            i += 1;
        }
        if (!compData) {
            compData = {
                id: comp.id,
                destination: '',
                absoluteURI: '',
                selected: false,
                settings: {
                    segmented: false,
                    segmentTime: 10
                }
            };
        }
        
        compData.name = comp.name;
        
        return compData;
    }
    
    function setCompositionSettings(id, data) {
        var i = 0, len = compositions.length, compData;
        while (i < len) {
            if (compositions[i].id === id) {
                compositions[i].settings = data;
                break;
            }
            i += 1;
        }
    }
    
    function setCompositionSelectionState(id, selectedFlag) {
        var i = 0, len = compositions.length, compData;
        while (i < len) {
            if (compositions[i].id === id) {
                compositions[i].selected = selectedFlag;
                break;
            }
            i += 1;
        }
    }
    
    function searchCompositionDestination(id) {
        var i = 0, len = compositions.length, compData;
        while (i < len) {
            if (compositions[i].id === id) {
                compData = compositions[i];
                break;
            }
            i += 1;
        }
        var uri = compData.absoluteURI || Folder.desktop.absoluteURI + '/data.json';
        var f = new File(uri);
        var saveFileData = f.saveDlg();
        if (saveFileData !== null) {
            compData.absoluteURI = saveFileData.absoluteURI;
            compData.settings.fsName = saveFileData.fsName;
            compData.destination = saveFileData.fsName;
        }
        bm_eventDispatcher.sendEvent('bm:compositions:list', compositions);
    }
    
    function setCompositionDestinationFolder(id, destination) {
        var i = 0, len = compositions.length, compData;
        while (i < len) {
            if (compositions[i].id === id) {
                compositions[i].destination = destination;
                break;
            }
            i += 1;
        }
    }
    
    function browseFolder(id) {
        var i = 0, len = compositions.length, compData;
        while (i < len) {
            if (compositions[i].id === id) {
                var file = new File(compositions[i].destination);
                file.parent.execute();
                break;
            }
            i += 1;
        }
    }
    
    function getCompositions() {
        tmpCompositions = [];
        projectComps = bm_projectManager.getCompositions();
        var i, len = projectComps.length;
        for (i = 0; i < len; i += 1) {
            tmpCompositions.push(getCompositionData(projectComps[i]));
        }
        compositions = tmpCompositions;
        bm_eventDispatcher.sendEvent('bm:compositions:list', compositions);
    }
    
    function complete() {
        bm_eventDispatcher.sendEvent('bm:render:complete');
    }
    
    function renderNextComposition() {
        if (currentRenderingComposition >= renderingCompositions.length) {
            complete();
            return;
        }
        projectComps = bm_projectManager.getCompositions();
        var comp, destination;
        var i = 0, len = projectComps.length;
        while (i < len) {
            if (projectComps[i].id === renderingCompositions[currentRenderingComposition].id) {
                comp = projectComps[i];
                destination = renderingCompositions[currentRenderingComposition].absoluteURI;
                break;
            }
            i += 1;
        }
        if (!comp) {
            currentRenderingComposition += 1;
            renderNextComposition();
            return;
        }
        bm_renderManager.render(comp, destination, renderingCompositions[currentRenderingComposition].settings);
    }
    
    function render() {
        ob.cancelled = false;
        renderingCompositions.length = 0;
        currentRenderingComposition = 0;
        var i, len = compositions.length;
        for (i = 0; i < len; i += 1) {
            if (compositions[i].selected && compositions[i].destination) {
                renderingCompositions.push(compositions[i]);
            }
        }
        if (renderingCompositions.length < 1) {
            return;
        }
        bm_eventDispatcher.sendEvent('bm:render:start', renderingCompositions);
        renderNextComposition();
    }
    
    function renderComplete() {
        currentRenderingComposition += 1;
        if (currentRenderingComposition >= renderingCompositions.length) {
            complete();
            return;
        }
        renderNextComposition();
    }
    
    function cancel() {
        ob.cancelled = true;
        bm_eventDispatcher.sendEvent('bm:render:cancel');
    }
    
    ob = {
        getCompositions : getCompositions,
        setCompositionSelectionState : setCompositionSelectionState,
        setCompositionDestinationFolder : setCompositionDestinationFolder,
        setCompositionSettings : setCompositionSettings,
        searchCompositionDestination : searchCompositionDestination,
        renderComplete : renderComplete,
        browseFolder : browseFolder,
        render : render,
        cancel : cancel,
        cancelled: false
    };
    
    return ob;
}());