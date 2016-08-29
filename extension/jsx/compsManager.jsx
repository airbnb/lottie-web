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
                    segmentTime: 10,
                    standalone: false,
                    demo: false,
                    glyphs: true,
                    hiddens: false,
                    extraComps: {
                        active: false,
                        list:[]
                    },
                    guideds: false
                }
            };
        }
        if(!compData.settings.extraComps){
            compData.settings.extraComps = {
                active: false,
                list:[]
            }
        }
        
        compData.name = comp.name;
        
        return compData;
    }
    
    function setCompositionSettings(id, data) {
        var i = 0, len = compositions.length, compData;
        while (i < len) {
            compData = compositions[i];
            if (compData.id === id) {
                compData.settings = data;
                if (compData.destination) {
                    var lastInd = compData.destination.lastIndexOf('.');
                    compData.destination = compData.destination.substr(0, lastInd);
                    compData.destination += compData.settings.standalone ? '.js' : '.json';
                    lastInd = compData.absoluteURI.lastIndexOf('.');
                    compData.absoluteURI = compData.absoluteURI.substr(0, lastInd);
                    compData.absoluteURI += compData.settings.standalone ? '.js' : '.json';
                    bm_eventDispatcher.sendEvent('bm:compositions:list', compositions);
                }
                break;
            }
            i += 1;
        }
    }
    
    function syncCompositionData(id, data) {
        var i = 0, len = compositions.length, compData;
        while (i < len) {
            compData = compositions[i];
            if (compData.id === id) {
                compData.selected = data.selected;
                compData.destination = data.destination;
                compData.absoluteURI = data.absoluteURI;
                compData.settings = data.settings;
                if (compData.destination) {
                    var lastInd = compData.destination.lastIndexOf('.');
                    compData.destination = compData.destination.substr(0, lastInd);
                    compData.destination += compData.settings.standalone ? '.js' : '.json';
                    lastInd = compData.absoluteURI.lastIndexOf('.');
                    compData.absoluteURI = compData.absoluteURI.substr(0, lastInd);
                    compData.absoluteURI += compData.settings.standalone ? '.js' : '.json';
                    bm_eventDispatcher.sendEvent('bm:compositions:list', compositions);
                }
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
        var uri;
        if (compData.absoluteURI) {
            uri = compData.absoluteURI;
        } else {
            uri = Folder.desktop.absoluteURI + '/data';
            uri += compData.settings.standalone ? '.js' : '.json';
        }
        var f = new File(uri);
        var saveFileData = f.saveDlg();
        if (saveFileData !== null) {
            compData.absoluteURI = saveFileData.absoluteURI;
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
    
    function updateData(){
        bm_projectManager.checkProject();
        getCompositions();
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
        var comp, destination, fsDestination;
        var i = 0, len = projectComps.length;
        while (i < len) {
            if (projectComps[i].id === renderingCompositions[currentRenderingComposition].id) {
                comp = projectComps[i];
                destination = renderingCompositions[currentRenderingComposition].absoluteURI;
                fsDestination = renderingCompositions[currentRenderingComposition].destination;
                break;
            }
            i += 1;
        }
        if (!comp) {
            currentRenderingComposition += 1;
            renderNextComposition();
            return;
        }
        bm_renderManager.render(comp, destination, fsDestination, renderingCompositions[currentRenderingComposition].settings);
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
        updateData : updateData,
        setCompositionSelectionState : setCompositionSelectionState,
        setCompositionDestinationFolder : setCompositionDestinationFolder,
        setCompositionSettings : setCompositionSettings,
        syncCompositionData : syncCompositionData,
        searchCompositionDestination : searchCompositionDestination,
        renderComplete : renderComplete,
        browseFolder : browseFolder,
        render : render,
        cancel : cancel,
        cancelled: false
    };
    
    return ob;
}());