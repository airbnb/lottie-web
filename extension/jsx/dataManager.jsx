/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global bm_eventDispatcher, bm_generalUtils, bm_downloadManager, bm_layerElement, File*/

var bm_dataManager = (function () {
    'use strict';
    var ob = {};
    var animationSegments;
    var segmentCount = 0;
    
    function addCompsToSegment(layers, comps, segmentComps) {
        var i, len = layers.length, j, jLen;
        for (i = 0; i < len; i += 1) {
            if (layers[i].ty === bm_layerElement.layerTypes.precomp) {
                j = 0;
                jLen = comps.length;
                while (j < jLen) {
                    if (comps[j].id === layers[i].refId) {
                        segmentComps.push(comps.splice(j, 1)[0]);
                        addCompsToSegment(segmentComps[segmentComps.length - 1].layers, comps, segmentComps);
                        break;
                    }
                    j += 1;
                }
            }
        }
    }
    
    function splitAnimation(data, time) {
        var comps = data.comps;
        var layers = data.layers;
        var frameRate = data.fr;
        var totalFrames = data.op - data.ip;
        var i, len = layers.length, j, jLen;
        var currentSegment = time * frameRate;
        var segmentLength = time * frameRate;
        animationSegments = [];
        var currentPeriod, segments, segmentComps;
        for (i = 0; i < len; i += 1) {
            if (layers[i].ip < currentSegment) {
                if (layers[i].ty === bm_layerElement.layerTypes.precomp) {
                    if (!segmentComps) {
                        segmentComps = [];
                    }
                    j = 0;
                    jLen = comps.length;
                    while (j < jLen) {
                        if (comps[j].id === layers[i].refId) {
                            segmentComps.push(comps.splice(j, 1)[0]);
                            addCompsToSegment(segmentComps[segmentComps.length - 1].layers, comps, segmentComps);
                            break;
                        }
                        j += 1;
                    }
                }
            }
        }
        if (data.assets && segmentComps && segmentComps.length) {
            data.assets = data.assets.concat(segmentComps);
            if (data.comps) {
                delete data.comps;
            }
        } else {
            data.assets = segmentComps;
        }
        
        var timeData;
        
        while (currentSegment < totalFrames) {
            currentPeriod = null;
            segmentComps = null;
            for (i = 0; i < len; i += 1) {
                if (layers[i].ip >= currentSegment && layers[i].ip < currentSegment + segmentLength) {
                    if (!segments) {
                        segments = [];
                    }
                    if (layers[i].ty === bm_layerElement.layerTypes.precomp) {
                        if (!segmentComps) {
                            segmentComps = [];
                        }
                        j = 0;
                        jLen = comps.length;
                        while (j < jLen) {
                            if (comps[j].id === layers[i].refId) {
                                segmentComps.push(comps.splice(j, 1)[0]);
                                addCompsToSegment(segmentComps[segmentComps.length - 1].layers, comps, segmentComps);
                                break;
                            }
                            j += 1;
                        }
                    }
                    if (!currentPeriod) {
                        timeData = currentSegment / frameRate;
                        currentPeriod = {
                            layers: []
                        };
                        segmentCount += 1;
                    }
                    var randomId = bm_generalUtils.random(10);
                    layers[i].id = randomId;
                    currentPeriod.layers.push(layers[i]);
                    layers[i] = {
                        id: randomId,
                        ty: 99
                    };
                }
            }
            if (currentPeriod) {
                currentPeriod.assets = segmentComps;
                animationSegments.push(currentPeriod);
                segments.push({
                    time: timeData
                });
            }
            currentSegment += segmentLength;
        }
        data.segments = segments;
    }
    
    function separateComps(layers, comps) {
        var i, len = layers.length;
        for (i = 0; i < len; i += 1) {
            if (layers[i].ty === bm_layerElement.layerTypes.precomp && layers[i].compId) {
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
    
    function deleteLayerParams(layers) {
        var i, len = layers.length;
        for (i = 0; i < len; i += 1) {
            delete layers[i].isValid;
            delete layers[i].isGuide;
            delete layers[i].render;
            delete layers[i].enabled;
            if (layers[i].ty === bm_layerElement.layerTypes.precomp && layers[i].layers) {
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
        deleteLayerParams(data.layers);
    }
    
    function saveData(data, destinationPath, config) {
        deleteExtraParams(data, config);
        separateComps(data.layers, data.comps);
        var dataFile, segmentPath, s, string;
        if (config.segmented) {
            splitAnimation(data, config.segmentTime);
            var i, len = animationSegments.length;
            var filePathName = destinationPath.substr(destinationPath.lastIndexOf('/') + 1);
            filePathName = filePathName.substr(0, filePathName.lastIndexOf('.'));
            for (i = 0; i < len; i += 1) {
                segmentPath = destinationPath.substr(0, destinationPath.lastIndexOf('/') + 1);
                segmentPath += filePathName + '_' + i + '.json';
                dataFile = new File(segmentPath);
                dataFile.open('w', 'TEXT', '????');
                dataFile.encoding = 'UTF-8';
                string = JSON.stringify(animationSegments[i]);
                try {
                    dataFile.write(string); //DO NOT ERASE, JSON UNFORMATTED
                    //dataFile.write(JSON.stringify(ob.renderData.exportData, null, '  ')); //DO NOT ERASE, JSON FORMATTED
                    dataFile.close();
                } catch (err) {
                    bm_eventDispatcher.sendEvent('bm:alert', {message: 'Could not write file.<br /> Make sure you have enabled scripts to write files. <br /> Edit > Preferences > General > Allow Scripts to Write Files and Access Network '});
                }
            }
        } else if (data.comps) {
            if (data.assets) {
                data.assets = data.assets.concat(data.comps);
            } else {
                data.assets = data.comps;
            }
            data.comps = null;
            delete data.comps;
        }
        dataFile = new File(destinationPath);
        dataFile.open('w', 'TEXT', '????');
        dataFile.encoding = 'UTF-8';
        string = JSON.stringify(data);
        string = string.replace(/\n/g, '');
        ////
        if (config.demo) {
            var demoStr = bm_downloadManager.getDemoData();
            demoStr = demoStr.replace('"__[[ANIMATIONDATA]]__"', "" + string + "");
            if(data.ddd) {
                demoStr = demoStr.replace('__[[RENDERER]]__', "html");
            } else {
                demoStr = demoStr.replace('__[[RENDERER]]__', "svg");
            }
            var filePathName = destinationPath.substr(destinationPath.lastIndexOf('/') + 1);
            var demoDestinationPath = destinationPath.replace(filePathName,'demo.html');
            var demoFile = new File(demoDestinationPath);
            demoFile.open('w', 'TEXT', '????');
            demoFile.encoding = 'UTF-8';
            try {
                demoFile.write(demoStr); //DO NOT ERASE, JSON UNFORMATTED
                //dataFile.write(JSON.stringify(ob.renderData.exportData, null, '  ')); //DO NOT ERASE, JSON FORMATTED
                demoFile.close();
            } catch (errr) {
                bm_eventDispatcher.sendEvent('bm:alert', {message: 'Could not write file.<br /> Make sure you have enabled scripts to write files. <br /> Edit > Preferences > General > Allow Scripts to Write Files and Access Network '});
            }
        }
        if (config.standalone) {
            var bodymovinJsStr = bm_downloadManager.getStandaloneData();
            string = bodymovinJsStr.replace("\"__[ANIMATIONDATA]__\"",  string );
            string = string.replace("\"__[STANDALONE]__\"", 'true');
        }
        ////
        try {
            dataFile.write(string); //DO NOT ERASE, JSON UNFORMATTED
            //dataFile.write(JSON.stringify(ob.renderData.exportData, null, '  ')); //DO NOT ERASE, JSON FORMATTED
            dataFile.close();
        } catch (errr) {
            bm_eventDispatcher.sendEvent('bm:alert', {message: 'Could not write file.<br /> Make sure you have enabled scripts to write files. <br /> Edit > Preferences > General > Allow Scripts to Write Files and Access Network '});
        }
        animationSegments = [];
        segmentCount = 0;
    }
    
    ob.saveData = saveData;
    
    return ob;
}());