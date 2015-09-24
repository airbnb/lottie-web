/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global bm_eventDispatcher, bm_generalUtils, bm_layerElement, File*/

var bm_dataManager = (function () {
    'use strict';
    var ob = {};
    var animationSegments = {};
    
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
        var animation = data.animation;
        var comps = data.comps;
        var layers = animation.layers;
        var frameRate = animation.frameRate;
        var totalFrames = animation.totalFrames;
        var i, len = layers.length, j, jLen;
        var currentSegment = time * frameRate;
        var segmentLength = time * frameRate;
        animationSegments = {};
        var currentPeriod, segments, segmentComps;
        for (i = 0; i < len; i += 1) {
            if (layers[i].inPoint && layers[i].inPoint < currentSegment) {
                if (layers[i].ty === bm_layerElement.layerTypes.precomp) {
                    bm_eventDispatcher.log('passo: ' + currentSegment);
                    if (currentSegment === 0) {
                        bm_eventDispatcher.log('pass');
                    }
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
                if (layers[i].inPoint && layers[i].inPoint >= currentSegment && layers[i].inPoint < currentSegment + segmentLength) {
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
                    currentPeriod.layers.push({
                        id: randomId,
                        data: layers[i]
                    });
                    layers[i] = {
                        loadId: randomId,
                        ty: 99
                    };
                }
            }
            if (currentPeriod) {
                currentPeriod.comps = segmentComps;
                animationSegments[currentPeriod.time] = currentPeriod;
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
    
    function saveData(data, destinationPath, config) {
        separateComps(data.animation.layers, data.comps);
        var dataFile, segmentPath, s, string;
        if (config.split) {
            splitAnimation(data, config.time);
            for (s in animationSegments) {
                if (animationSegments.hasOwnProperty(s)) {
                    segmentPath = destinationPath.substr(0, destinationPath.lastIndexOf('/') + 1);
                    segmentPath += animationSegments[s].id + '.json';
                    dataFile = new File(segmentPath);
                    dataFile.open('w', 'TEXT', '????');
                    string = JSON.stringify(animationSegments[s]);
                    try {
                        dataFile.write(string); //DO NOT ERASE, JSON UNFORMATTED
                        //dataFile.write(JSON.stringify(ob.renderData.exportData, null, '  ')); //DO NOT ERASE, JSON FORMATTED
                        dataFile.close();
                    } catch (err) {
                        bm_eventDispatcher.sendEvent('bm:alert', {message: 'Could not write file.<br /> Make sure you have enabled scripts to write files. <br /> Edit > Preferences > General > Allow Scripts to Write Files and Access Network '});
                    }
                }
                //dataFile = new File(segmentPath);
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
    }
    
    ob.saveData = saveData;
    
    return ob;
}());