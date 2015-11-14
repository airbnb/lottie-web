/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global bm_layerElement, bm_eventDispatcher, bm_sourceHelper, bm_generalUtils, bm_compsManager, bm_dataManager, app, File*/
var bm_renderManager = (function () {
    'use strict';
    
    var ob = {}, pendingLayers = [], pendingComps = [], destinationPath, currentCompID, totalLayers, currentLayer, currentCompSettings;

    function verifyTrackLayer(layerData, comp, pos) {
        var nextLayerInfo = comp.layers[pos + 2];
        if (nextLayerInfo.isTrackMatte) {
            layerData.td = 0;
        }
    }
    
    function restoreParents(layers) {
        
        var layerData, parentData, i, len = layers.length, hasChangedState = false;
        for (i = 0; i < len; i += 1) {
            layerData = layers[i];
            if (layerData.parent !== undefined) {
                parentData = layers[layerData.parent];
                if (parentData.render === false) {
                    parentData.ty = bm_layerElement.layerTypes.nullLayer;
                    hasChangedState = true;
                    parentData.render = true;
                    if (!parentData.isValid) {
                        parentData.isValid = true;
                    }
                }
            }
        }
        if (hasChangedState) {
            restoreParents(layers);
        }
    }
    
    function createLayers(comp, layers, framerate) {
        var i, len = comp.layers.length, layerInfo, layerData, prevLayerData;
        for (i = 0; i < len; i += 1) {
            layerInfo = comp.layers[i + 1];
            layerData = bm_layerElement.prepareLayer(layerInfo, i);
            if (layerData.td && prevLayerData && prevLayerData.td) {
                prevLayerData.td = false;
                if (prevLayerData.enabled === false) {
                    prevLayerData.render = false;
                }
            } else if (layerData.tt) {
                if (layerData.render === false) {
                    if (prevLayerData.enabled === false) {
                        prevLayerData.render = false;
                    }
                    prevLayerData.td = false;
                } else if (prevLayerData.render === false) {
                    layerData.tt = false;
                }
            }
            layers.push(layerData);
            pendingLayers.push({data: layerData, layer: layerInfo, framerate: framerate});
            prevLayerData = layerData;
        }
        restoreParents(layers);
        for (i = 0; i < len; i += 1) {
            layerData = layers[i];
            layerInfo = comp.layers[i + 1];
            bm_layerElement.checkLayerSource(layerInfo, layerData);
            if (layerData.ty === bm_layerElement.layerTypes.precomp && layerData.render !== false && layerData.compId) {
                layerData.layers = [];
                createLayers(layerInfo.source, layerData.layers, framerate);
            }
        }
    }
    
    function render(comp, destination, settings) {
        currentCompID = comp.id;
        currentCompSettings = settings;
        bm_eventDispatcher.sendEvent('bm:render:update', {type: 'update', message: 'Starting Render', compId: currentCompID, progress: 0});
        destinationPath = destination;
        bm_sourceHelper.reset();
        pendingLayers.length = 0;
        pendingComps.length = 0;
        var exportData = ob.renderData.exportData;
        exportData.assets = [];
        exportData.comps = [];
        exportData.v = '3.1.4';
        exportData.layers = [];
        exportData.ip = comp.workAreaStart * comp.frameRate;
        exportData.op = (comp.workAreaStart + comp.workAreaDuration) * comp.frameRate;
        exportData.fr = comp.frameRate;
        exportData.w = comp.width;
        exportData.h = comp.height;
        ob.renderData.firstFrame = exportData.ip * comp.frameRate;
        createLayers(comp, exportData.layers, exportData.fr);
        totalLayers = pendingLayers.length;
        currentLayer = 0;
        app.scheduleTask('bm_renderManager.renderNextLayer();', 20, false);
    }
    
    function reset() {
        pendingLayers.length = 0;
        pendingComps.length = 0;
        currentCompSettings = null;
    }
    
    function saveData() {
        bm_eventDispatcher.sendEvent('bm:render:update', {type: 'update', message: 'Saving data ', compId: currentCompID, progress: 1});
        bm_dataManager.saveData(ob.renderData.exportData, destinationPath, currentCompSettings);
        bm_eventDispatcher.sendEvent('bm:render:update', {type: 'update', message: 'Render finished ', compId: currentCompID, progress: 1, isFinished: true, fsPath: currentCompSettings.fsName});
        reset();
        bm_compsManager.renderComplete();
    }
    
    function clearUnrenderedLayers(layers) {
        var i, len = layers.length;
        for (i = 0; i < len; i += 1) {
            if (layers[i].render === false) {
                layers.splice(i, 1);
                i -= 1;
                len -= 1;
            } else if (layers[i].ty === bm_layerElement.layerTypes.precomp && layers[i].layers) {
                clearUnrenderedLayers(layers[i].layers);
            }
        }
    }
    
    function removeExtraData() {
        clearUnrenderedLayers(ob.renderData.exportData.layers);
    }
    
    function renderNextLayer() {
        if (bm_compsManager.cancelled) {
            return;
        }
        if (pendingLayers.length) {
            var nextLayerData = pendingLayers.pop();
            currentLayer += 1;
            bm_eventDispatcher.sendEvent('bm:render:update', {type: 'update', message: 'Rendering layer: ' + nextLayerData.layer.name, compId: currentCompID, progress: currentLayer / totalLayers});
            bm_layerElement.renderLayer(nextLayerData);
        } else {
            removeExtraData();
            bm_sourceHelper.exportImages(destinationPath, ob.renderData.exportData.assets, currentCompID);
        }
    }
    
    function imagesReady() {
        saveData();
    }
    
    function imagesSaved() {
        saveData();
    }
    
    function renderLayerComplete() {
        app.scheduleTask('bm_renderManager.renderNextLayer();', 20, false);
    }
    
    ob.renderData = {
        exportData : {
            assets : []
        }
    };
    ob.render = render;
    ob.renderLayerComplete = renderLayerComplete;
    ob.renderNextLayer = renderNextLayer;
    ob.imagesReady = imagesReady;
    
    return ob;
}());