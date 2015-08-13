/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global PropertyValueType, KeyframeInterpolationType, bm_generalUtils, bm_eventDispatcher*/
var bm_keyframeHelper = (function () {
    'use strict';
    var ob = {}, property, j = 1, jLen, beziersArray, averageSpeed, duration, bezierIn, bezierOut, frameRate;
    
    function getPropertyValue(value, roundFlag) {
        switch (property.propertyValueType) {
        case PropertyValueType.SHAPE:
            var elem = {
                i : roundFlag ? bm_generalUtils.roundNumber(value.inTangents, 3) :  value.inTangents,
                o : roundFlag ? bm_generalUtils.roundNumber(value.outTangents, 3) : value.outTangents,
                v : roundFlag ? bm_generalUtils.roundNumber(value.vertices, 3) : value.vertices
            };
            return elem;
        case PropertyValueType.COLOR:
            var i, len = value.length;
            for (i = 0; i < len; i += 1) {
                value[i] = Math.round(value[i] * 255);
            }
            return value;
        default:
            return roundFlag ? bm_generalUtils.roundNumber(value, 3) :  value;
        }
    }

    function getCurveLength(initPos, endPos, outBezier, inBezier) {
        var k, curveSegments = 2, point, lastPoint = null, ptDistance, absToCoord, absTiCoord, triCoord1, triCoord2, triCoord3, liCoord1, liCoord2, ptCoord, perc, addedLength = 0, i, len;
        for (k = 0; k < curveSegments; k += 1) {
            point = [];
            perc = k / (curveSegments - 1);
            ptDistance = 0;
            absToCoord = [];
            absTiCoord = [];
            len = outBezier.length;
            for (i = 0; i < len; i += 1) {
                if (absToCoord[i] === null || absToCoord[i] === undefined) {
                    absToCoord[i] = initPos[i] + outBezier[i];
                    absTiCoord[i] = endPos[i] + inBezier[i];
                }
                triCoord1 = initPos[i] + (absToCoord[i] - initPos[i]) * perc;
                triCoord2 = absToCoord[i] + (absTiCoord[i] - absToCoord[i]) * perc;
                triCoord3 = absTiCoord[i] + (endPos[i] - absTiCoord[i]) * perc;
                liCoord1 = triCoord1 + (triCoord2 - triCoord1) * perc;
                liCoord2 = triCoord2 + (triCoord3 - triCoord2) * perc;
                ptCoord = liCoord1 + (liCoord2 - liCoord1) * perc;
                point.push(ptCoord);
                if (lastPoint !== null) {
                    ptDistance += Math.pow(point[i] - lastPoint[i], 2);
                }
            }
            ptDistance = Math.sqrt(ptDistance);
            addedLength += ptDistance;
            lastPoint = point;
        }
        return addedLength;
    }

    function buildKeyInfluence(key, lastKey, indexTime) {
        switch (property.propertyValueType) {
        case PropertyValueType.ThreeD_SPATIAL:
        case PropertyValueType.TwoD_SPATIAL:
        case PropertyValueType.SHAPE:
            key.easeIn = {
                influence : property.keyInTemporalEase(indexTime + 1)[0].influence,
                speed : property.keyInTemporalEase(indexTime + 1)[0].speed
            };
            lastKey.easeOut = {
                influence : property.keyOutTemporalEase(indexTime)[0].influence,
                speed : property.keyOutTemporalEase(indexTime)[0].speed
            };
            break;
        default:
            key.easeIn = [];
            lastKey.easeOut = [];
            var inEase = property.keyInTemporalEase(indexTime + 1);
            var outEase = property.keyOutTemporalEase(indexTime);
            var i, len = inEase.length;
            for (i = 0; i < len; i += 1) {
                key.easeIn.push({influence: inEase[i].influence, speed: inEase[i].speed});
                lastKey.easeOut.push({influence: outEase[i].influence, speed: outEase[i].speed});
            }
        }
    }
    
    function exportKeyframes(prop, frRate) {
        property = prop;
        frameRate = frRate;
        beziersArray = [];
        if (property.numKeys <= 1) {
            return getPropertyValue(property.valueAtTime(0, true), true);
        }
        jLen = property.numKeys;
        for (j = 1; j < jLen; j += 1) {
            var segmentOb = {};
            ///////
            var indexTime = j;
            var i, len;
            var k, kLen;
            var key = {};
            var lastKey = {};
            var interpolationType = '';
            key.time = property.keyTime(indexTime + 1);
            lastKey.time = property.keyTime(indexTime);
            key.value = getPropertyValue(property.keyValue(indexTime + 1), false);
            lastKey.value = getPropertyValue(property.keyValue(indexTime), false);
            if (!(key.value instanceof Array)) {
                key.value = [key.value];
                lastKey.value = [lastKey.value];
            }
            if (property.keyOutInterpolationType(indexTime) === KeyframeInterpolationType.HOLD) {
                interpolationType = 'hold';
            } else {
                if (property.keyOutInterpolationType(indexTime) === KeyframeInterpolationType.LINEAR && property.keyInInterpolationType(indexTime + 1) === KeyframeInterpolationType.LINEAR) {
                    interpolationType = 'linear';
                }
                buildKeyInfluence(key, lastKey, indexTime);
                switch (property.propertyValueType) {
                case PropertyValueType.ThreeD_SPATIAL:
                case PropertyValueType.TwoD_SPATIAL:
                    lastKey.to = property.keyOutSpatialTangent(indexTime);
                    key.ti = property.keyInSpatialTangent(indexTime + 1);
                    break;
                }
            }
            if (interpolationType === 'hold') {
                segmentOb.t = bm_generalUtils.roundNumber(lastKey.time * frameRate, 3);
                segmentOb.s = getPropertyValue(property.keyValue(j), true);
                if (!(segmentOb.s instanceof Array)) {
                    segmentOb.s = [segmentOb.s];
                }
                segmentOb.h = 1;
            } else {
                duration = key.time - lastKey.time;
                len = key.value.length;
                bezierIn = {};
                bezierOut = {};
                averageSpeed = 0;
                var infOut, infIn;
                switch (property.propertyValueType) {
                case PropertyValueType.ThreeD_SPATIAL:
                case PropertyValueType.TwoD_SPATIAL:
                    var curveLength = getCurveLength(lastKey.value, key.value, lastKey.to, key.ti);
                    averageSpeed = curveLength / duration;
                    if (curveLength === 0) {
                        infOut = lastKey.easeOut.influence;
                        infIn = key.easeIn.influence;
                    } else {
                        infOut = Math.min(100 * curveLength / (lastKey.easeOut.speed * duration), lastKey.easeOut.influence);
                        infIn = Math.min(100 * curveLength / (key.easeIn.speed * duration), key.easeIn.influence);
                    }
                    bezierIn.x = 1 - infIn / 100;
                    bezierOut.x = infOut / 100;
                    break;
                case PropertyValueType.SHAPE:
                    averageSpeed = 1;
                    infOut = Math.min(100 / lastKey.easeOut.speed, lastKey.easeOut.influence);
                    infIn = Math.min(100 / key.easeIn.speed, key.easeIn.influence);
                    bezierIn.x = 1 - infIn / 100;
                    bezierOut.x = infOut / 100;
                    break;
                case PropertyValueType.ThreeD:
                case PropertyValueType.TwoD:
                case PropertyValueType.OneD:
                case PropertyValueType.COLOR:
                    bezierIn.x = [];
                    bezierOut.x = [];
                    kLen = key.easeIn.length;
                    for (k = 0; k < kLen; k += 1) {
                        bezierIn.x[k] = 1 - key.easeIn[k].influence / 100;
                        bezierOut.x[k] = lastKey.easeOut[k].influence / 100;
                    }
                    averageSpeed = [];
                    for (i = 0; i < len; i += 1) {
                        averageSpeed[i] =  (key.value[i] - lastKey.value[i]) / duration;
                    }
                    break;
                }
                if (averageSpeed === 0) {
                    bezierIn.y = bezierIn.x;
                    bezierOut.y = bezierOut.x;
                } else {
                    switch (property.propertyValueType) {
                    case PropertyValueType.ThreeD_SPATIAL:
                    case PropertyValueType.TwoD_SPATIAL:
                    case PropertyValueType.SHAPE:
                        if (interpolationType === 'linear') {
                            bezierIn.y = bezierIn.x;
                            bezierOut.y = bezierOut.x;
                        } else {
                            bezierIn.y =  1 - ((key.easeIn.speed) / averageSpeed) * (infIn / 100);
                            bezierOut.y = ((lastKey.easeOut.speed) / averageSpeed) * bezierOut.x;
                        }
                        break;
                    case PropertyValueType.ThreeD:
                    case PropertyValueType.TwoD:
                    case PropertyValueType.OneD:
                    case PropertyValueType.COLOR:
                        bezierIn.y = [];
                        bezierOut.y = [];
                        kLen = key.easeIn.length;
                        for (k = 0; k < kLen; k += 1) {
                            if (averageSpeed[k] === 0 || interpolationType === 'linear') {
                                bezierIn.y[k] = bezierIn.x[k];
                                bezierOut.y[k] = bezierOut.x[k];
                            } else {
                                bezierIn.y[k] = 1 - ((key.easeIn[k].speed) / averageSpeed[k]) * (key.easeIn[k].influence / 100);
                                bezierOut.y[k] = ((lastKey.easeOut[k].speed) / averageSpeed[k]) * bezierOut.x[k];
                            }
                        }
                        break;
                    }
                }

                bezierIn.x = bm_generalUtils.roundNumber(bezierIn.x, 3);
                bezierIn.y = bm_generalUtils.roundNumber(bezierIn.y, 3);
                bezierOut.x = bm_generalUtils.roundNumber(bezierOut.x, 3);
                bezierOut.y = bm_generalUtils.roundNumber(bezierOut.y, 3);
                segmentOb.i = bezierIn;
                segmentOb.o = bezierOut;
                segmentOb.n = (bezierIn.x.toString() + '_' + bezierIn.y.toString() + '_' + bezierOut.x.toString() + '_' + bezierOut.y.toString()).replace(/\./g, 'p');
                segmentOb.t = bm_generalUtils.roundNumber(lastKey.time * frameRate, 3);
                segmentOb.s = getPropertyValue(property.keyValue(j), true);
                segmentOb.e = getPropertyValue(property.keyValue(j + 1), true);
                if (!(segmentOb.s instanceof Array)) {
                    segmentOb.s = [segmentOb.s];
                    segmentOb.e = [segmentOb.e];
                }
                if (property.propertyValueType === PropertyValueType.ThreeD_SPATIAL || property.propertyValueType === PropertyValueType.TwoD_SPATIAL) {
                    segmentOb.to = lastKey.to;
                    segmentOb.ti = key.ti;
                }
            }
            
            ///////
            beziersArray.push(segmentOb);
        }
        beziersArray.push({t: property.keyTime(j) * frameRate});
        return beziersArray;
    }
    
    ob.exportKeyframes = exportKeyframes;
    
    return ob;
}());