/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global bm_eventDispatcher, bm_renderManager, bm_timeremapHelper, bm_shapeHelper, bm_generalUtils, CompItem, PlaceholderSource, AVLayer, CameraLayer, LightLayer, ShapeLayer, TextLayer, TrackMatteType, bm_sourceHelper, bm_transformHelper, bm_maskHelper, bm_textHelper*/

var bm_layerElement = (function () {
    'use strict';
    var ob = {};
    ob.layerTypes = {
        precomp : 0,
        solid : 1,
        still : 2,
        nullLayer : 3,
        shape : 4,
        text : 5,
        audio : 6,
        pholderVideo : 7,
        imageSeq : 8,
        video : 9,
        pholderStill : 10,
        guide : 11,
        adjustment : 12,
        camera : 13,
        light : 14
    };
    
    var getLayerType = (function () {
        function avLayerType(lObj) {
            var lSource = lObj.source;
            if (lSource instanceof CompItem) {
                return ob.layerTypes.precomp;
            }
            var lMainSource = lSource.mainSource;
            var lFile = lMainSource.file;
            if (!lObj.hasVideo) {
                return ob.layerTypes.audio;
            } else if (lSource instanceof CompItem) {
                return ob.layerTypes.precomp;
            } else if (lSource.frameDuration < 1) {
                if (lMainSource instanceof PlaceholderSource) {
                    return ob.layerTypes.pholderVideo;
                } else if (lSource.name.toString().indexOf("].") !== -1) {
                    return ob.layerTypes.imageSeq;
                } else {
                    return ob.layerTypes.video;
                }
            } else if (lSource.frameDuration === 1) {
                if (lMainSource instanceof PlaceholderSource) {
                    return ob.layerTypes.pholderStill;
                } else if (lMainSource.color) {
                    return ob.layerTypes.solid;
                } else {
                    return ob.layerTypes.still;
                }
            }
        }
        return function (layerOb) {
            try {
                var curLayer, instanceOfArray, instanceOfArrayLength, result;
                curLayer = layerOb;
                instanceOfArray = [AVLayer, CameraLayer, LightLayer, ShapeLayer, TextLayer];
                instanceOfArrayLength = instanceOfArray.length;
                if (curLayer.guideLayer) {
                    return ob.layerTypes.guide;
                } else if (curLayer.adjustmentLayer) {
                    return ob.layerTypes.adjustment;
                } else if (curLayer.nullLayer) {
                    return ob.layerTypes.nullLayer;
                }
                var i;
                for (i = 0; i < instanceOfArrayLength; i++) {
                    if (curLayer instanceof instanceOfArray[i]) {
                        result = instanceOfArray[i].name;
                        break;
                    }
                }
                if (result === "AVLayer") {
                    result = avLayerType(curLayer);
                } else if (result === "CameraLayer") {
                    result = ob.layerTypes.camera;
                } else if (result === "LightLayer") {
                    result = ob.layerTypes.light;
                } else if (result === "ShapeLayer") {
                    result = ob.layerTypes.shape;
                } else if (result === "TextLayer") {
                    result = ob.layerTypes.text;
                }
                return result;
            } catch (err) {alert(err.line.toString + " " + err.toString()); }
        };
    }());
    
    function prepareLayer(layerInfo, ind) {
        var layerData = {};
        var layerType = getLayerType(layerInfo);
        if (layerType === ob.layerTypes.audio || layerType === ob.layerTypes.camera || layerType === ob.layerTypes.guide || layerType === ob.layerTypes.light || layerType === ob.layerTypes.adjustment || layerType === ob.layerTypes.pholderStill || layerType === ob.layerTypes.pholderVideo || layerType === ob.layerTypes.text) {
            layerData.isValid = false;
            layerData.render = false;
        }
        if (layerInfo.enabled === false) {
            layerData.enabled = false;
            layerData.render = false;
        }
        layerData.ind = ind;
        layerData.ty = layerType;
        if(layerInfo.name.substring(0,1) === '#'){
            layerData.ln = layerInfo.name.substr(1);
        }
        if (layerInfo.parent !== null) {
            layerData.parent = layerInfo.parent.index - 1;
        }
        
        if (layerInfo.hasTrackMatte) {
            switch (layerInfo.trackMatteType) {
            case TrackMatteType.ALPHA:
                layerData.tt = 1;
                break;
            case TrackMatteType.ALPHA_INVERTED:
                layerData.tt = 2;
                break;
            case TrackMatteType.LUMA:
                layerData.tt = 3;
                break;
            case TrackMatteType.LUMA_INVERTED:
                layerData.tt = 4;
                break;
            }
        } else if (layerInfo.isTrackMatte) {
            if (layerInfo.isValid !== false) {
                layerData.render = true;
                layerData.td = 1;
            }
        }
        return layerData;
    }
    
    var compCount = 0;
    
    function checkLayerSource(layerInfo, layerData) {
        if (layerData.render === false) {
            return;
        }
        var layerType = layerData.ty;
        var sourceId;
        if (layerType === ob.layerTypes.precomp) {
            sourceId = bm_sourceHelper.checkCompSource(layerInfo, layerType);
            if (sourceId !== false) {
                layerData.refId = sourceId;
            } else {
                //layerData.compId = bm_generalUtils.random(7);
                layerData.compId = 'comp_' + compCount;
                compCount += 1;
                layerData.refId = layerData.compId;
                bm_sourceHelper.setCompSourceId(layerInfo.source, layerData.compId);
            }
        } else if (layerType === ob.layerTypes.still) {
            layerData.refId = bm_sourceHelper.checkImageSource(layerInfo);
        }
    }
    
    function renderLayer(layerOb) {
        var layerInfo = layerOb.layer;
        var layerData = layerOb.data;
        var frameRate = layerOb.framerate;
        if (layerData.render === false) {
            bm_renderManager.renderLayerComplete();
            return;
        }
        var lType = layerData.ty;
        bm_transformHelper.exportTransform(layerInfo, layerData, frameRate);
        bm_maskHelper.exportMasks(layerInfo, layerData, frameRate);
        bm_timeremapHelper.exportTimeremap(layerInfo, layerData, frameRate);
        
        if (lType === ob.layerTypes.shape) {
            bm_shapeHelper.exportShape(layerInfo, layerData, frameRate);
            //layerData.rectData = {l: 0, t: 0, b: 0, r: 0, w: 0, h: 0};
        } else if (lType === ob.layerTypes.solid) {
            layerData.sw = layerInfo.source.width;
            layerData.sh = layerInfo.source.height;
            layerData.sc = bm_generalUtils.arrayRgbToHex(layerInfo.source.mainSource.color);
        } else if (lType === ob.layerTypes.text) {
            bm_textHelper.exportText(layerInfo, layerData, frameRate);
        }
        layerData.ip = layerInfo.inPoint * frameRate;
        layerData.op = layerInfo.outPoint * frameRate;
        layerData.st = layerInfo.startTime * frameRate;
        
        bm_renderManager.renderLayerComplete();
    }
    
    ob.prepareLayer = prepareLayer;
    ob.checkLayerSource = checkLayerSource;
    ob.renderLayer = renderLayer;
    ob.getLayerType = getLayerType;
    return ob;
}());