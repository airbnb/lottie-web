/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global File, $*/

$.__bodymovin.bm_dataManager = (function () {

    var ob = {};
    var _endCallback;
    var JSON = $.__bodymovin.JSON;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var exporterHelpers = $.__bodymovin.bm_exporterHelpers;
    var exportStatuses = exporterHelpers.exportStatuses;
    var exportTypes = exporterHelpers.exportTypes;
    var bm_bannerExporter = $.__bodymovin.bm_bannerExporter;
    var bm_standardExporter = $.__bodymovin.bm_standardExporter;
    var bm_standaloneExporter = $.__bodymovin.bm_standaloneExporter;
    var bm_demoExporter = $.__bodymovin.bm_demoExporter;
    var bm_avdExporter = $.__bodymovin.bm_avdExporter;
    var bm_riveExporter = $.__bodymovin.bm_riveExporter;
    var bm_fileManager = $.__bodymovin.bm_fileManager;
    var bm_generalUtils = $.__bodymovin.bm_generalUtils;
    var layerTypes = $.__bodymovin.layerTypes;

    var results = {
        avd: {
            status: exportStatuses.IDLE
        },
        banner: {
            status: exportStatuses.IDLE
        },
        demo: {
            status: exportStatuses.IDLE
        },
        rive: {
            status: exportStatuses.IDLE
        },
        standalone: {
            status: exportStatuses.IDLE
        },
        standard: {
            status: exportStatuses.IDLE
        }
    }

    function separateComps(layers, comps) {
        var i, len = layers.length;
        for (i = 0; i < len; i += 1) {
            if (layers[i].ty === layerTypes.precomp && layers[i].compId) {
                comps.push({
                    id: layers[i].compId,
                    layers: layers[i].layers
                });
                separateComps(layers[i].layers, comps);
                delete layers[i].compId;
                delete layers[i].layers;
            }
        }
    }

    function deleteAssetParams(assets) {
        if (!assets) {
            return;
        }
        var i, len = assets.length;
        for (i = 0; i < len; i += 1) {
            assets[i].fileId = undefined;
        }
    }
    
    function deleteLayerParams(layers) {
        var i, len = layers.length;
        for (i = 0; i < len; i += 1) {
            delete layers[i].isValid;
            delete layers[i].isGuide;
            delete layers[i].isAdjustment;
            delete layers[i].render;
            delete layers[i].enabled;
            if (layers[i].ty === layerTypes.precomp && layers[i].layers) {
                deleteLayerParams(layers[i].layers);
            }
        }
    }

    function deleteExtraParams(data, settings) {
        if (data.fonts.length === 0) {
            delete data.fonts;
            delete data.chars;
        } else {
            if (!settings.glyphs) {
                delete data.chars;
            }
        }
        deleteAssetParams(data.assets);
        deleteLayerParams(data.layers);
    }

    function moveCompsToAssets(data) {
        if (data.comps) {
            if (data.assets) {
                data.assets = data.assets.concat(data.comps);
            } else {
                data.assets = data.comps;
            }
            data.comps = null;
            delete data.comps;
        }
    }

    function onResult(type, status) {

        results[type].status = status;
        var idleCount = 0, failedCount = 0
        for (var exportType in results) {
            if (results[exportType].status === exportStatuses.IDLE) {
                idleCount += 1;
            } else if (results[exportType].status === exportStatuses.FAILED) {
                failedCount += 1;
            }
        }
        
        if (idleCount === 0) {
            if (failedCount > 0) {
                bm_eventDispatcher.sendEvent('bm:alert', {message: 'Some exports failed.<br /> Is Preferences > Scripting & Expressions > Allow Scripts to Write Files and Access Network enabled?'});
            }
            _endCallback();
        }
    }

    function resetStatus() {
        results[exportTypes.AVD].status = exportStatuses.IDLE;
        results[exportTypes.BANNER].status = exportStatuses.IDLE;
        results[exportTypes.DEMO].status = exportStatuses.IDLE;
        results[exportTypes.RIVE].status = exportStatuses.IDLE;
        results[exportTypes.STANDALONE].status = exportStatuses.IDLE;
        results[exportTypes.STANDARD].status = exportStatuses.IDLE;
    }
    
    function saveData(data, destinationPath, config, callback) {

        resetStatus();

        _endCallback = callback;

        var destinationFile = new File(destinationPath);
        var destinationFileName = destinationFile.name;
        var destinationFileNameWithoutExtension = destinationFileName.substr(0, destinationFileName.lastIndexOf('.'));

        deleteExtraParams(data, config);
        separateComps(data.layers, data.comps);
        moveCompsToAssets(data);

        var stringifiedData = JSON.stringify(data);
        stringifiedData = stringifiedData.replace(/\n/g, '');
        bm_fileManager.addFile(destinationFileNameWithoutExtension + '.json', ['raw'], stringifiedData);

        ////

        bm_avdExporter.save(destinationPath, config, onResult);
        bm_bannerExporter.save(destinationPath, config, onResult);
        bm_demoExporter.save(destinationPath, config, onResult, data);
        bm_riveExporter.save(destinationPath, config, onResult);
        bm_standardExporter.save(destinationPath, config, onResult);
        bm_standaloneExporter.save(destinationPath, config, onResult);

    }
    
    ob.saveData = saveData;
    
    return ob;
}());