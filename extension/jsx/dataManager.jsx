/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global bm_eventDispatcher, bm_generalUtils, bm_layerElement, File*/

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
        data.comps = segmentComps;
        
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
                        currentPeriod = {
                            time: currentSegment / frameRate,
                            id: bm_generalUtils.random(5),
                            layers: [],
                            comps: []
                        };
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
                currentPeriod.comps = segmentComps;
                animationSegments.push(currentPeriod);
                segments.push({
                    time: currentPeriod.time,
                    id: currentPeriod.id
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
    
    function deleteExtraParams(layers) {
        var i, len = layers.length;
        for (i = 0; i < len; i += 1) {
            delete layers[i].isValid;
            delete layers[i].render;
            delete layers[i].enabled;
            if (layers[i].ty === bm_layerElement.layerTypes.precomp && layers[i].layers) {
                deleteExtraParams(layers[i].layers);
            }
        }
    }
    
    function saveData(data, destinationPath, config) {
        deleteExtraParams(data.layers);
        separateComps(data.layers, data.comps);
        var dataFile, segmentPath, s, string;
        if (config.segmented) {
            splitAnimation(data, config.segmentTime);
            var i, len = animationSegments.length;
            for (i = 0; i < len; i += 1) {
                segmentPath = destinationPath.substr(0, destinationPath.lastIndexOf('/') + 1);
                segmentPath += 'data_' + i + '.json';
                dataFile = new File(segmentPath);
                dataFile.open('w', 'TEXT', '????');
                string = JSON.stringify(animationSegments[i]);
                try {
                    dataFile.write(string); //DO NOT ERASE, JSON UNFORMATTED
                    //dataFile.write(JSON.stringify(ob.renderData.exportData, null, '  ')); //DO NOT ERASE, JSON FORMATTED
                    dataFile.close();
                } catch (err) {
                    bm_eventDispatcher.sendEvent('bm:alert', {message: 'Could not write file.<br /> Make sure you have enabled scripts to write files. <br /> Edit > Preferences > General > Allow Scripts to Write Files and Access Network '});
                }
            }
        }
        dataFile = new File(destinationPath);
        dataFile.open('w', 'TEXT', '????');
        string = JSON.stringify(data);
        string = string.replace(/\n/g, '');
        try {
            dataFile.write(string); //DO NOT ERASE, JSON UNFORMATTED
            //dataFile.write(JSON.stringify(ob.renderData.exportData, null, '  ')); //DO NOT ERASE, JSON FORMATTED
            dataFile.close();
        } catch (errr) {
            bm_eventDispatcher.sendEvent('bm:alert', {message: 'Could not write file.<br /> Make sure you have enabled scripts to write files. <br /> Edit > Preferences > General > Allow Scripts to Write Files and Access Network '});
        }
        ob = {};
        animationSegments = [];
        segmentCount = 0;
    }
    
    ob.saveData = saveData;
    
    return ob;
}());