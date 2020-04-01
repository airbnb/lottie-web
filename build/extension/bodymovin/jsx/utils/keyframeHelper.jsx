/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global PropertyValueType, KeyframeInterpolationType, $ */
$.__bodymovin.bm_keyframeHelper = (function () {
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var bm_generalUtils = $.__bodymovin.bm_generalUtils;
    var bm_expressionHelper = $.__bodymovin.bm_expressionHelper;
    var ob = {}, property, j = 1, jLen, beziersArray, averageSpeed, duration, bezierIn, bezierOut, frameRate;
    var hasRovingKeyframes = false;
    
    function getPropertyValue(value, roundFlag) {
        switch (property.propertyValueType) {
        case PropertyValueType.SHAPE:
            var elem = {
                i : roundFlag ? bm_generalUtils.roundNumber(value.inTangents, 3) :  value.inTangents,
                o : roundFlag ? bm_generalUtils.roundNumber(value.outTangents, 3) : value.outTangents,
                v : roundFlag ? bm_generalUtils.roundNumber(value.vertices, 3) : value.vertices,
                c: value.closed
            };
            return elem;
        case PropertyValueType.COLOR:
            var i, len = value.length;
            for (i = 0; i < len; i += 1) {
                //value[i] = Math.round(value[i] * 255);
                value[i] = Math.round(value[i]*1000000000000)/1000000000000;
                value[i] = value[i];
            }
            return value;
        default:
            return roundFlag ? bm_generalUtils.roundNumber(value, 3) :  value;
        }
    }

    function getCurveLength(initPos, endPos, outBezier, inBezier) {
        var k, curveSegments = 200, point, lastPoint = null, ptDistance, absToCoord, absTiCoord, triCoord1, triCoord2, triCoord3, liCoord1, liCoord2, ptCoord, perc, addedLength = 0, i, len;
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
        case PropertyValueType.NO_VALUE:
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

    function exportKeys(prop, frRate, stretch, keyframeValues) {
        var exportOldFormat = $.__bodymovin.bm_renderManager.shouldExportOldFormat();
        var currentExpression = '';
        property = prop;
        var propertyValueType = property.propertyValueType;
        
        frameRate = frRate;
        beziersArray = [];
        if(propertyValueType === PropertyValueType.SHAPE) {
            if (prop.expressionEnabled && !prop.expressionError) {
                currentExpression = prop.expression;
                prop.expression = '';
            }
        }
        if (property.numKeys <= 1) {
            if(propertyValueType === PropertyValueType.NO_VALUE){
                return keyframeValues;
            }
            var propertyValue = getPropertyValue(property.valueAtTime(0, true), true);
            if(currentExpression !== ''){
                prop.expression = currentExpression;
            }
            return propertyValue;
        }
        jLen = property.numKeys;
        var isPrevHoldInterpolated = false;
        var STRETCH_FACTOR = stretch;
        for (j = 1; j < jLen; j += 1) {
            isPrevHoldInterpolated = false;
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
            if(propertyValueType !== PropertyValueType.NO_VALUE){
                key.value = getPropertyValue(property.keyValue(indexTime + 1), false);
                lastKey.value = getPropertyValue(property.keyValue(indexTime), false);
                if (!(key.value instanceof Array)) {
                    key.value = [key.value];
                    lastKey.value = [lastKey.value];
                }
            } else {
                key.value = keyframeValues[j];
                lastKey.value = keyframeValues[j-1];
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
                    lastKey.to = bm_generalUtils.roundNumber(property.keyOutSpatialTangent(indexTime), 3);
                    key.ti = bm_generalUtils.roundNumber(property.keyInSpatialTangent(indexTime + 1), 3);
                    break;
                }
            }

            if (interpolationType === 'hold') {
                isPrevHoldInterpolated = true;
                segmentOb.t = bm_generalUtils.roundNumber(lastKey.time * frameRate, 3);
                if(propertyValueType !== PropertyValueType.NO_VALUE){
                    segmentOb.s = getPropertyValue(property.keyValue(j), true);
                    if (!(segmentOb.s instanceof Array)) {
                        segmentOb.s = [segmentOb.s];
                    }
                } else {
                    segmentOb.s = keyframeValues[j-1];
                }
                segmentOb.h = 1;
            } else {
                duration = (key.time - lastKey.time)/STRETCH_FACTOR;
                // bm_eventDispatcher.log('duration')
                // bm_eventDispatcher.log(duration)
                len = propertyValueType === PropertyValueType.NO_VALUE ? 0 : key.value.length;
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
                case PropertyValueType.NO_VALUE:
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
                        // bm_eventDispatcher.log('key.easeIn[k].influence')
                        // bm_eventDispatcher.log(key.easeIn[k].influence)
                        // bm_eventDispatcher.log('key.easeIn[k].speed')
                        // bm_eventDispatcher.log(key.easeIn[k].speed)
                        // bm_eventDispatcher.log('lastKey.easeOut[k].influence')
                        // bm_eventDispatcher.log(lastKey.easeOut[k].influence)
                        // bm_eventDispatcher.log('lastKey.easeOut[k].speed')
                        // bm_eventDispatcher.log(lastKey.easeOut[k].speed)
                        bezierIn.x[k] = 1 - key.easeIn[k].influence / 100;
                        bezierOut.x[k] = lastKey.easeOut[k].influence / 100;
                    }
                    averageSpeed = [];
                    for (i = 0; i < len; i += 1) {
                        if(property.propertyValueType === PropertyValueType.COLOR){
                            averageSpeed[i] =  255*(key.value[i] - lastKey.value[i]) / duration;
                        } else {
                            averageSpeed[i] =  (key.value[i] - lastKey.value[i]) / duration;
                        }
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
                    case PropertyValueType.NO_VALUE:
                        if (interpolationType === 'linear') {
                            bezierIn.y = bezierIn.x;
                            bezierOut.y = bezierOut.x;
                        } else {
                            bezierIn.y =  1 - (key.easeIn.speed / averageSpeed)  * (infIn / 100);
                            bezierOut.y = (lastKey.easeOut.speed / averageSpeed) * (infOut / 100);
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
                            if (interpolationType === 'linear') {
                                bezierIn.y[k] = bezierIn.x[k];
                                bezierOut.y[k] = bezierOut.x[k];
                            } else {
                                var yNormal;
                                if(property.propertyValueType === PropertyValueType.COLOR){
                                    yNormal = 255*(key.value[k] - lastKey.value[k]);
                                } else {
                                    yNormal = (key.value[k] - lastKey.value[k]);
                                }
                                if(Math.abs(yNormal) < 0.0000001) {
                                    yNormal = 1;
                                }
                                // bm_eventDispatcher.log('yNormal')
                                // bm_eventDispatcher.log(yNormal)
                                /*bezierIn.y[k] = 1 - ((key.easeIn[k].speed) / averageSpeed[k]) * (key.easeIn[k].influence / 100);
                                bezierOut.y[k] = ((lastKey.easeOut[k].speed) / averageSpeed[k]) * bezierOut.x[k];*/
                                var bezierY = (lastKey.easeOut[k].speed*lastKey.easeOut[k].influence/100);
                                var bezierInY = (key.easeIn[k].speed*key.easeIn[k].influence/100);
                                // bm_eventDispatcher.log('bezierY')
                                // bm_eventDispatcher.log(bezierY)
                                // bm_eventDispatcher.log('bezierInY')
                                // bm_eventDispatcher.log(bezierInY)
                                bezierIn.y[k] = 1 - (bezierInY*duration)/yNormal;
                                bezierOut.y[k] = (bezierY*duration)/yNormal;
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
                /*if (bezierIn.x.length) {
                    segmentOb.n = [];
                    kLen = bezierIn.x.length;
                    for (k = 0; k < kLen; k += 1) {
                        segmentOb.n.push((bezierIn.x[k].toString() + '_' + bezierIn.y[k].toString() + '_' + bezierOut.x[k].toString() + '_' + bezierOut.y[k].toString()).replace(/\./g, 'p'));
                    }
                } else {
                    segmentOb.n = (bezierIn.x.toString() + '_' + bezierIn.y.toString() + '_' + bezierOut.x.toString() + '_' + bezierOut.y.toString()).replace(/\./g, 'p');
                }*/
                segmentOb.t = bm_generalUtils.roundNumber(lastKey.time * frameRate, 3);
                if(propertyValueType !== PropertyValueType.NO_VALUE) {
                    segmentOb.s = getPropertyValue(property.keyValue(j), true);
                    if (exportOldFormat) {
                        segmentOb.e = getPropertyValue(property.keyValue(j + 1), true);
                    }
                    if (!(segmentOb.s instanceof Array)) {
                        segmentOb.s = [segmentOb.s];
                        if (exportOldFormat) {
                            segmentOb.e = [segmentOb.e];
                        }
                    }
                } else {
                    segmentOb.s = keyframeValues[j-1];
                    if (exportOldFormat) {
                        segmentOb.e = keyframeValues[j];
                    }

                }
                if (property.propertyValueType === PropertyValueType.ThreeD_SPATIAL || property.propertyValueType === PropertyValueType.TwoD_SPATIAL) {
                    segmentOb.to = lastKey.to;
                    segmentOb.ti = key.ti;
                }
            }
            
            ///////
            beziersArray.push(segmentOb);
        }
        //
        if (exportOldFormat) {
            beziersArray.push({t: property.keyTime(j) * frameRate});
        } else {
            var finalValue;
            if(propertyValueType !== PropertyValueType.NO_VALUE) {
                finalValue = getPropertyValue(property.keyValue(j), true);
                if (!(finalValue instanceof Array)) {
                    finalValue = [finalValue];
                }
            } else {
                finalValue = keyframeValues[j-1];

            }
            beziersArray.push({t: property.keyTime(j) * frameRate, s: finalValue});
        }
        
        //

        if (property.keyOutInterpolationType(j) === KeyframeInterpolationType.HOLD || isPrevHoldInterpolated) {
            if (exportOldFormat) {
                if(propertyValueType !== PropertyValueType.NO_VALUE) {
                    var value = getPropertyValue(property.keyValue(j), true);
                    if (!(value instanceof Array)) {
                        value = [value];
                    }
                } else {
                    value = keyframeValues[j-1];
                }
                beziersArray[beziersArray.length - 1].s = value;
            }
            beziersArray[beziersArray.length - 1].h = 1;
        }
        if(currentExpression !== ''){
            prop.expression = currentExpression;
        }
        return beziersArray;
    }

    function searchRovingKeyframes(property) {
        hasRovingKeyframes = false;
        if(property.propertyValueType === PropertyValueType.ThreeD_SPATIAL ||  property.propertyValueType === PropertyValueType.TwoD_SPATIAL){
            var numKeys = property.numKeys;
            var keyIndex;
            for(keyIndex = 1; keyIndex <= numKeys; keyIndex += 1) {
                if(property.keyRoving(keyIndex)) {
                    if(!hasRovingKeyframes) {
                        app.beginUndoGroup("Roving Undo Group");
                        hasRovingKeyframes = true;
                    }
                    property.setSelectedAtKey(keyIndex, true);
                    bm_eventDispatcher.log('IT IS ROVING')
                    //This sets roving values at the actual easing value and then in turns it back on
                    /*property.setRovingAtKey(keyIndex, false);
                    property.setRovingAtKey(keyIndex, true);*/
                }
            }
            if(hasRovingKeyframes) {
                app.executeCommand(3153); // Rove Across Time
            }
        }
    }

    function restoreRovingKeyframes(property) {

        if(hasRovingKeyframes) {
            app.endUndoGroup();
            app.executeCommand(16); //Undo
            var keyIndex, numKeys = property.numKeys;
            for(keyIndex = 1; keyIndex <= numKeys; keyIndex += 1) {
                property.setSelectedAtKey(keyIndex, false);
            }
        }
    }
    
    function exportKeyframes(prop, frRate, stretch, keyframeValues) {
        var returnOb = {}
        if (prop.numKeys <= 1) {
            returnOb.a = 0;
        } else {
            returnOb.a = 1;
        }
        searchRovingKeyframes(prop);
        returnOb.k = exportKeys(prop, frRate, stretch, keyframeValues);
        if(prop.propertyIndex && !$.__bodymovin.bm_renderManager.shouldIgnoreExpressionProperties()) {
            returnOb.ix = prop.propertyIndex;
        }
        bm_expressionHelper.checkExpression(prop, returnOb);
        restoreRovingKeyframes(prop);
        return returnOb;
    }
    
    ob.exportKeyframes = exportKeyframes;
    
    return ob;
}());