function dataFunctionManager(){
    var frameRate = 0;
    var matrixInstance =  new MatrixManager();
    var animations = {};
    var degToRads = Math.PI/180;

    function completeTimeRemap(tm, layerFrames, offsetFrame){
        var interpolatedProperty = getInterpolatedValues(tm,layerFrames, offsetFrame);
        var i;
        var timeValues = [];
        for(i=0 ; i<layerFrames; i+=1){
            timeValues.push(Math.floor(interpolatedProperty[i]*frameRate));
        }
        return timeValues;
    }

    function completeLayers(layers){
        var layerFrames, offsetFrame;
        layers.forEach(function(layerData){
            layerFrames = layerData.outPoint - layerData.startTime;
            offsetFrame = layerData.startTime;
            layerData.layerName = convertLayerNameToID(layerData.layerName);
            if(layerData.parent){
                layerData.parent = convertLayerNameToID(layerData.parent);
            }
            layerData.renderedFrame = {};
            layerData.renderedData = {};
            animArray = [];
            lastFrame = -1;
            if(layerData.tm){
                layerData.tm = completeTimeRemap(layerData.tm, layerFrames, offsetFrame);
            }
            if(layerData.type=='PreCompLayer'){
                completeLayers(layerData.layers);
            }else if(layerData.type == 'ShapeLayer'){
                var i, len = layerData.shapes.length;
                for(i=0;i<len;i+=1){
                    shapeItem = layerData.shapes[i];
                    shapeItem.renderedData = {};
                }
            }
        })
    }

    function completeData(animationData){
        animations[animationData._id] = {data:animationData,renderedFrames:[]};
        frameRate = animationData.animation.frameRate;
        completeLayers(animationData.animation.layers);
    }

    function convertLayerNameToID(string){
        string = string.replace(/ /g,"_");
        string = string.replace(/-/g,"_");
        string = string.replace(/\./g,"_");
        string = string.replace(/\//g,"_");
        return string;
    }

    function getInterpolatedValues(keyframes, frameCount, offsetTime){
        var i ,len;
        var valuesArray = [];
        if(!(keyframes instanceof Array) || keyframes[0].t == null){
            valuesArray.push(keyframes);
            return valuesArray;
        }
        var keyData, nextKeyData;
        valuesArray = [];
        var count;
        var propertyArray = [];
        var j, jLen;
        len = keyframes.length;
        var perc;
        var curveSegments = 1000;
        var absToCoord = [];
        var absTiCoord = [];
        //len = keyframes.length;
        keyframes.forEach(function(keyData){
            keyData.t -= offsetTime;
            if(keyData.to){
                var k;
                var triCoord1,triCoord2,triCoord3,liCoord1,liCoord2,ptCoord,perc,addedLength = 0;
                var ptDistance;
                var point,lastPoint = null;
                var bezierData = {
                    points :[],
                    length: 0
                };
                for(k=0;k<curveSegments;k+=1){
                    point = [];
                    perc = k/(curveSegments-1);
                    ptDistance = 0;
                    absToCoord = [];
                    absTiCoord = [];
                    keyData.to.forEach(function(item,index){
                        if(absToCoord[index] == null){
                            absToCoord[index] = keyData.s[index] + keyData.to[index];
                            absTiCoord[index] = keyData.e[index] + keyData.ti[index];
                        }
                        triCoord1 = keyData.s[index] + (absToCoord[index] - keyData.s[index])*perc;
                        triCoord2 = absToCoord[index] + (absTiCoord[index] - absToCoord[index])*perc;
                        triCoord3 = absTiCoord[index] + (keyData.e[index] - absTiCoord[index])*perc;
                        liCoord1 = triCoord1 + (triCoord2 - triCoord1)*perc;
                        liCoord2 = triCoord2 + (triCoord3 - triCoord2)*perc;
                        ptCoord = liCoord1 + (liCoord2 - liCoord1)*perc;
                        point.push(ptCoord);
                        if(lastPoint !== null){
                            ptDistance += Math.pow(point[index] - lastPoint[index],2);
                        }
                    });
                    ptDistance = Math.sqrt(ptDistance);
                    addedLength += ptDistance;
                    bezierData.points.push({partialLength: addedLength, point: point});
                    lastPoint = point;
                    keyData.bezierData = bezierData;
                }
                bezierData.segmentLength = addedLength;
            }
        });
        var lastFrameIndex = 0;
        var lastPointIndex = 0;
        for(i=0;i<frameCount;i+=1){
            count = lastFrameIndex;
            var found = false;
            while(count<len-1){
                keyData = keyframes[count];
                nextKeyData = keyframes[count+1];
                if(i<keyData.t && count == 0){
                    jLen = keyData.s.length;
                    propertyArray = [];
                    for(j=0;j<jLen;j+=1){
                        propertyArray.push(keyData.s[j]);
                    }
                    valuesArray.push(propertyArray);
                    found = true;
                    if(lastFrameIndex != count){
                        lastFrameIndex = count;
                        lastPointIndex = 0;
                    }
                    break;
                }else if(i>=keyData.t && i<nextKeyData.t){
                    propertyArray = [];
                    if(keyData.to){
                        perc = bez.getEasingCurve([keyData.o.x,keyData.o.y,keyData.i.x,keyData.i.y])('',i-keyData.t,0,1,nextKeyData.t-keyData.t);
                        var bezierData = keyData.bezierData;
                        var distanceInLine = bezierData.segmentLength*perc;
                        var k, kLen, segmentPerc;
                        j = lastPointIndex;
                        while(j<bezierData.points.length){
                            if(i == 0 || distanceInLine == 0 || perc == 0){
                                propertyArray = bezierData.points[j].point;
                                lastPointIndex = j;
                                break;
                            }else if(j == bezierData.points.length - 1){
                                propertyArray = bezierData.points[j].point;
                            }else if(distanceInLine > bezierData.points[j].partialLength && distanceInLine < bezierData.points[j+1].partialLength){
                                kLen = bezierData.points[j].point.length;
                                segmentPerc = (distanceInLine-bezierData.points[j].partialLength)/(bezierData.points[j+1].partialLength-bezierData.points[j].partialLength);
                                for(k=0;k<kLen;k+=1){
                                    propertyArray.push(bezierData.points[j].point[k] + (bezierData.points[j+1].point[k] - bezierData.points[j].point[k])*segmentPerc);
                                }
                                //propertyArray = bezierData.points[j].point;
                                lastPointIndex = j;
                                break;
                            }
                            j += 1;
                        }
                    }else{
                        var outX,outY,inX,inY;
                        keyData.s.forEach(function(startItem,index){
                            if(keyData.h !== 1){
                                if(keyData.o.x instanceof Array){
                                    outX = keyData.o.x[index];
                                    outY = keyData.o.y[index];
                                    inX = keyData.i.x[index];
                                    inY = keyData.i.y[index];
                                }else{
                                    outX = keyData.o.x;
                                    outY = keyData.o.y;
                                    inX = keyData.i.x;
                                    inY = keyData.i.y;
                                }
                                perc = bez.getEasingCurve([outX,outY,inX,inY])('',i-keyData.t,0,1,nextKeyData.t-keyData.t);
                            }
                            // for shapes
                            if(startItem.i){
                                var shapeData = {
                                    i: [],
                                    o: [],
                                    v: []
                                };
                                startItem.i.forEach(function(inItem,inIndex){
                                    var coordsIData = [];
                                    var coordsOData = [];
                                    var coordsVData = [];
                                    inItem.forEach(function(pointItem,pointIndex){
                                        if(keyData.h === 1){
                                            coordsIData.push(pointItem);
                                            coordsOData.push(startItem.o[inIndex][pointIndex]);
                                            coordsVData.push(startItem.v[inIndex][pointIndex]);
                                        }else{
                                            coordsIData.push(pointItem+(keyData.e[index].i[inIndex][pointIndex]-pointItem)*perc);
                                            coordsOData.push(startItem.o[inIndex][pointIndex]+(keyData.e[index].o[inIndex][pointIndex]-startItem.o[inIndex][pointIndex])*perc);
                                            coordsVData.push(startItem.v[inIndex][pointIndex]+(keyData.e[index].v[inIndex][pointIndex]-startItem.v[inIndex][pointIndex])*perc);
                                        }
                                    });
                                    shapeData.i.push(coordsIData);
                                    shapeData.o.push(coordsOData);
                                    shapeData.v.push(coordsVData);
                                });
                                propertyArray.push(shapeData);
                            }else{
                                //perc = (i-keyData.t)/(nextKeyData.t-keyData.t);
                                if(keyData.h === 1){
                                    propertyArray.push(startItem);
                                }else{
                                    propertyArray.push(startItem+(keyData.e[index]-startItem)*perc);
                                }
                            }
                        });
                    }
                    valuesArray.push(propertyArray);
                    found = true;
                    if(lastFrameIndex != count){
                        lastFrameIndex = count;
                        lastPointIndex = 0;
                    }
                    break;
                }
                count += 1;
            }
            if(found == false){
                keyData = keyframes[keyframes.length - 2];
                propertyArray = [];
                keyData.e.forEach(function(item){
                    propertyArray.push(item);
                });
                valuesArray.push(propertyArray);
            }
        }
        count = valuesArray.length;
        while(count < frameCount){
            valuesArray.push(propertyArray);
            count += 1;
        }
        return valuesArray;
    }

    var keyData, nextKeyData,propertyArray,bezierData;

    function getInterpolatedValue(keyframes, frameNum, offsetTime){

        //Todo save on each frame the point found. pass to this function the previous frame to iterate points from last point.

        if(!(keyframes instanceof Array) || keyframes[0].t == null){
            return keyframes;
        }
        var i = 0, len = keyframes.length-1;
        while(i<len){
            keyData = keyframes[i];
            nextKeyData = keyframes[i+1];
            if((nextKeyData.t - offsetTime) > frameNum){
                break;
            }
            i += 1;
        }

        if(keyData.to && !keyData.bezierData){
            bez.buildBezierData(keyData);
        }
        var k, kLen;
        var perc, j = 0;
        propertyArray = [];
        if(keyData.to){
            bezierData = keyData.bezierData;
            if(frameNum >= nextKeyData.t-offsetTime){
                return bezierData.points[bezierData.points.length - 1].point;
            }else if(frameNum < keyData.t-offsetTime){
                return bezierData.points[0].point;
            }
            perc = bez.getEasingCurve([keyData.o.x,keyData.o.y,keyData.i.x,keyData.i.y])('',(frameNum)-(keyData.t-offsetTime),0,1,(nextKeyData.t-offsetTime)-(keyData.t-offsetTime));
            var distanceInLine = bezierData.segmentLength*perc;
            var segmentPerc;
            var addedLength = 0;
            while(j<bezierData.points.length){
                addedLength +=bezierData.points[j].partialLength;
                if(frameNum == 0 || distanceInLine == 0 || perc == 0){
                    propertyArray = bezierData.points[j].point;
                    break;
                }else if(j == bezierData.points.length - 1){
                    propertyArray = bezierData.points[j].point;
                }else if(distanceInLine > addedLength && distanceInLine < addedLength + bezierData.points[j+1].partialLength){
                    kLen = bezierData.points[j].point.length;
                    segmentPerc = (distanceInLine-addedLength)/(bezierData.points[j+1].partialLength);
                    for(k=0;k<kLen;k+=1){
                        propertyArray.push(bezierData.points[j].point[k] + (bezierData.points[j+1].point[k] - bezierData.points[j].point[k])*segmentPerc);
                    }
                    //propertyArray = bezierData.points[j].point;
                    break;
                }
                j += 1;
            }
        }else{
            var outX,outY,inX,inY;
            len = keyData.s.length;
            for(i=0;i<len;i+=1){
                if(keyData.h !== 1){
                    if(keyData.o.x instanceof Array){
                        outX = keyData.o.x[i];
                        outY = keyData.o.y[i];
                        inX = keyData.i.x[i];
                        inY = keyData.i.y[i];
                    }else{
                        outX = keyData.o.x;
                        outY = keyData.o.y;
                        inX = keyData.i.x;
                        inY = keyData.i.y;
                    }
                    perc = bez.getEasingCurve([outX,outY,inX,inY])('',(frameNum)-(keyData.t-offsetTime),0,1,(nextKeyData.t-offsetTime)-(keyData.t-offsetTime));
                    if(frameNum >= nextKeyData.t-offsetTime){
                        perc = 1;
                    }else if(frameNum < keyData.t-offsetTime){
                        perc = 0;
                    }
                }
                if(keyData.s[i].i){
                    var shapeData = {
                        i: [],
                        o: [],
                        v: []
                    };
                    var jLen = keyData.s[i].i.length;
                    for(j=0;j<jLen;j+=1){
                        var coordsIData = [];
                        var coordsOData = [];
                        var coordsVData = [];
                        kLen = keyData.s[i].i[j].length;
                        for(k=0;k<kLen;k+=1){
                            if(keyData.h === 1){
                                coordsIData.push(keyData.s[i].i[j][k]);
                                coordsOData.push(keyData.s[i].o[j][k]);
                                coordsVData.push(keyData.s[i].v[j][k]);
                            }else{
                                coordsIData.push(keyData.s[i].i[j][k]+(keyData.e[i].i[j][k]-keyData.s[i].i[j][k])*perc);
                                coordsOData.push(keyData.s[i].o[j][k]+(keyData.e[i].o[j][k]-keyData.s[i].o[j][k])*perc);
                                coordsVData.push(keyData.s[i].v[j][k]+(keyData.e[i].v[j][k]-keyData.s[i].v[j][k])*perc);
                            }
                        }
                        shapeData.i.push(coordsIData);
                        shapeData.o.push(coordsOData);
                        shapeData.v.push(coordsVData);
                    }
                    propertyArray.push(shapeData);
                }else{
                    //perc = (i-keyData.t)/(nextKeyData.t-keyData.t);
                    if(keyData.h === 1){
                        propertyArray.push(keyData.s[i]);
                    }else{
                        propertyArray.push(keyData.s[i]+(keyData.e[i]-keyData.s[i])*perc);
                    }
                }
            }
        }
        return propertyArray;
    }

    var pathV,pathO,pathI;
    var pathString = '';
    var pathData;

    function createPathString(paths,closed){
        if(!(paths instanceof Array)){
            paths = [paths];
        }
        var l,lLen = paths.length;
        var k, kLen;
        pathString = '';
        for(l = 0;l<lLen;l+=1){
            pathData = paths[l];
            pathV = pathData.v;
            pathO = pathData.o;
            pathI = pathData.i;
            kLen = pathV.length;
            pathString += "M"+pathV[0][0]+","+pathV[0][1];
            for(k=1;k<kLen;k++){
                pathString += " C"+(pathO[k-1][0]+pathV[k-1][0])+","+(pathO[k-1][1]+pathV[k-1][1]) + " "+(pathI[k][0]+pathV[k][0])+","+(pathI[k][1]+pathV[k][1]) + " "+pathV[k][0]+","+pathV[k][1];
            }
            if(closed !== false){
                pathString += " C"+(pathO[k-1][0]+pathV[k-1][0])+","+(pathO[k-1][1]+pathV[k-1][1]) + " "+(pathI[0][0]+pathV[0][0])+","+(pathI[0][1]+pathV[0][1]) + " "+pathV[0][0]+","+(pathV[0][1]);
            }
        }
        return pathString;
    }

    var trOb, dataOb, opacity,pos,rot,scale;
    var maskProps,maskValue;
    var timeRemapped;
    var shapeItem;
    var fillOpacity,fillColor, shape, strokeColor, strokeOpacity, strokeWidth, elmPos, elmSize, elmRound;
    var shapeTrOb = {};

    function iterateLayers(layers, frameNum,renderType){

        var offsettedFrameNum, i, len, renderedData, shapeData;
        var j, jLen = layers.length, item;
        for(j=0;j<jLen;j+=1){
            item = layers[j];
            offsettedFrameNum = frameNum - item.startTime;
            if(frameNum < item.inPoint || frameNum > item.outPoint){
                continue;
            }
            if(item.an[offsettedFrameNum]){
                continue;
            }
            trOb = {};
            dataOb = {};
            dataOb.a = getInterpolatedValue(item.ks.a,offsettedFrameNum, item.startTime);
            opacity = getInterpolatedValue(item.ks.o,offsettedFrameNum, item.startTime);
            dataOb.o = opacity instanceof Array ? opacity[0]/100 : opacity/100;
            pos = getInterpolatedValue(item.ks.p,offsettedFrameNum, item.startTime);
            rot = getInterpolatedValue(item.ks.r,offsettedFrameNum, item.startTime);
            scale = getInterpolatedValue(item.ks.s,offsettedFrameNum, item.startTime);
            trOb.s = scale instanceof Array ? scale.length > 1 ? [scale[0]/100,scale[1]/100,scale[2]/100] : [scale[0]/100,scale[0]/100,scale[0]/100] : [scale/100,scale/100,scale/100];
            trOb.r = rot instanceof Array ? rot.length > 1 ? [rot[0]*degToRads,rot[1]*degToRads,rot[2]*degToRads] : [rot[0]*degToRads,rot[0]*degToRads,rot[0]*degToRads] : [0,0,rot*degToRads];
            trOb.p = pos;
            renderedData = {};
            renderedData.an = {
                forwardFrame : offsettedFrameNum,
                tr: dataOb,
                matrixValue: matrixInstance.getMatrix2(trOb),
                matrixArray: matrixInstance.getMatrixArray(trOb)
            };
            item.renderedData[offsettedFrameNum] = renderedData;
            if(item.hasMask){
                maskProps = item.masksProperties;
                len = maskProps.length;
                for(i=0;i<len;i+=1){
                    if(!maskProps[i].pathStrings){
                        maskProps[i].pathStrings = [];
                        maskProps[i].pathVertices = [];
                        maskProps[i].opacity = [];
                    }
                    maskValue = getInterpolatedValue(maskProps[i].pt,offsettedFrameNum, item.startTime);
                    maskProps[i].pathVertices[offsettedFrameNum] = maskValue instanceof Array ? maskValue : [maskValue];
                    if(renderType == 'svg'){
                        maskProps[i].pathStrings[offsettedFrameNum] = createPathString(maskValue,maskProps[i].cl);
                    }
                    maskProps[i].opacity[offsettedFrameNum] = getInterpolatedValue(maskProps[i].o,offsettedFrameNum, item.startTime);
                    maskProps[i].opacity[offsettedFrameNum] = maskProps[i].opacity[offsettedFrameNum] instanceof Array ? maskProps[i].opacity[offsettedFrameNum][0]/100 : maskProps[i].opacity[offsettedFrameNum]/100;
                }
            }
            if(item.type == 'PreCompLayer'){
                timeRemapped = item.tm ? item.tm[offsettedFrameNum] < 0 ? 0 : item.tm[offsettedFrameNum] : offsettedFrameNum;
                iterateLayers(item.layers,timeRemapped,renderType);
            }else if(item.type == 'ShapeLayer'){
                len = item.shapes.length;
                for(i=0;i<len;i+=1){
                    shapeData = {};
                    shapeItem = item.shapes[i];
                    shapeItem.renderedData[offsettedFrameNum] = shapeData;
                    if(!shapeItem._created){
                        shapeItem.an.tr = [];
                        shapeItem.an.renderedFrame = {};
                        if(shapeItem.ks){
                            shapeItem.an.path = [];
                        }else if(shapeItem.el){
                            shapeItem.an.ell = [];
                        }else if(shapeItem.rc){
                            shapeItem.an.rect = [];
                        }
                        if(shapeItem.fl){
                            shapeItem.an.fill = [];
                        }
                        if(shapeItem.st){
                            shapeItem.an.stroke = [];
                        }
                    }
                    if(shapeItem.trim && (!shapeItem._created)){
                        shapeItem.trim.an = [];
                    }
                    if(shapeItem.fl){
                        fillColor = getInterpolatedValue(shapeItem.fl.c,offsettedFrameNum, item.startTime);
                        fillOpacity = getInterpolatedValue(shapeItem.fl.o,offsettedFrameNum, item.startTime);
                        shapeData.fill = {
                            color : rgbToHex(Math.round(fillColor[0]),Math.round(fillColor[1]),Math.round(fillColor[2])),
                            opacity : fillOpacity instanceof Array ? fillOpacity[0]/100 : fillOpacity/100,
                            forwardFrame : offsettedFrameNum
                        };
                    }
                    if(shapeItem.ks){
                        shape = getInterpolatedValue(shapeItem.ks,offsettedFrameNum, item.startTime);
                        shapeData.path = {
                            pathNodes: shape,
                            closed: shapeItem.closed,
                            forwardFrame : offsettedFrameNum
                        };
                        if(renderType == 'svg'){
                            shapeData.path.pathString = createPathString(shape,shapeItem.closed);
                        }
                    }else if(shapeItem.el){
                        elmPos = getInterpolatedValue(shapeItem.el.p,offsettedFrameNum, item.startTime);
                        elmSize = getInterpolatedValue(shapeItem.el.s,offsettedFrameNum, item.startTime);
                        shapeData.ell = {
                            p : elmPos,
                            size : elmSize,
                            forwardFrame : offsettedFrameNum
                        };
                    }else if(shapeItem.rc){
                        elmPos = getInterpolatedValue(shapeItem.rc.p,offsettedFrameNum, item.startTime);
                        elmSize = getInterpolatedValue(shapeItem.rc.s,offsettedFrameNum, item.startTime);
                        elmRound = getInterpolatedValue(shapeItem.rc.r,offsettedFrameNum, item.startTime);
                        shapeData.rect = {
                            position : elmPos,
                            size : elmSize,
                            roundness : elmRound,
                            forwardFrame : offsettedFrameNum
                        };
                    }
                    if(shapeItem.st){
                        strokeColor = getInterpolatedValue(shapeItem.st.c,offsettedFrameNum, item.startTime);
                        strokeOpacity = getInterpolatedValue(shapeItem.st.o,offsettedFrameNum, item.startTime);
                        strokeWidth = getInterpolatedValue(shapeItem.st.w,offsettedFrameNum, item.startTime);
                        shapeData.stroke = {
                            color : rgbToHex(Math.round(strokeColor[0]),Math.round(strokeColor[1]),Math.round(strokeColor[2])),
                            opacity : strokeOpacity instanceof Array ? strokeOpacity[0]/100 : strokeOpacity/100,
                            width : strokeWidth instanceof Array ? strokeWidth[0] : strokeWidth,
                            forwardFrame : offsettedFrameNum
                        };
                    }
                    shapeTrOb = {};
                    //var shapeDataOb = {};
                    shapeTrOb.a = getInterpolatedValue(shapeItem.tr.a,offsettedFrameNum, item.startTime);
                    shapeTrOb.o = getInterpolatedValue(shapeItem.tr.o,offsettedFrameNum, item.startTime);
                    shapeTrOb.o = shapeTrOb.o instanceof Array ? shapeTrOb.o[0]/100 : shapeTrOb.o/100;
                    shapeTrOb.s = getInterpolatedValue(shapeItem.tr.s,offsettedFrameNum, item.startTime);
                    shapeTrOb.s = shapeTrOb.s instanceof Array ? shapeTrOb.s.length > 1 ? [shapeTrOb.s[0]/100,shapeTrOb.s[1]/100,shapeTrOb.s[2]/100] : [shapeTrOb.s[0]/100,shapeTrOb.s[0]/100,shapeTrOb.s[0]/100] : [shapeTrOb.s/100,shapeTrOb.s/100,shapeTrOb.s/100];
                    shapeTrOb.r = getInterpolatedValue(shapeItem.tr.r,offsettedFrameNum, item.startTime);
                    shapeTrOb.r = shapeTrOb.r instanceof Array ? shapeTrOb.r.length > 1 ? [shapeTrOb.r[0]*degToRads,shapeTrOb.r[1]*degToRads,shapeTrOb.r[2]*degToRads] : [shapeTrOb.r[0]*degToRads,shapeTrOb.r[0]*degToRads,shapeTrOb.r[0]*degToRads] : [0,0,shapeTrOb.r*degToRads];
                    shapeTrOb.p = getInterpolatedValue(shapeItem.tr.p,offsettedFrameNum, item.startTime);
                    shapeTrOb.mt = matrixInstance.getMatrix2(shapeTrOb);
                    shapeTrOb.mtArr = matrixInstance.getMatrixArray(shapeTrOb);
                    shapeTrOb.forwardFrame = offsettedFrameNum;
                    shapeItem.an.tr[offsettedFrameNum] = shapeTrOb;
                    shapeData.tr = shapeTrOb;

                    if(shapeItem.trim){
                        var trimS = getInterpolatedValue(shapeItem.trim.s,offsettedFrameNum, item.startTime);
                        var trimE = getInterpolatedValue(shapeItem.trim.e,offsettedFrameNum, item.startTime);
                        var trimO = getInterpolatedValue(shapeItem.trim.o,offsettedFrameNum, item.startTime);
                        shapeData.trim = {
                            s: trimS,
                            e: trimE,
                            o: trimO,
                            forwardFrame: offsettedFrameNum
                        }
                    }
                    if(!shapeItem._created){
                        shapeItem._created = true;
                    }
                }
            }
        }
    }

    function prerenderFrames(renderData,num){
        var totalFrames = 1;
        while(totalFrames > 0){
            num += 1;
            if(num >= renderData.data.animation.totalFrames){
                renderData.renderFinished = true;
                break;
            }
            if(!renderData.renderedFrames[num]){
                renderFrame(renderData.data._id,num);
                totalFrames -= 1;
            }
        }
    }

    function renderFrames(id,frames){
        var i, len = frames.length;
        var renderedFrames = [];
        for(i=0;i<len;i+=1){
            renderedFrames.push({num:frames[i],data:renderFrame(id,frames[i])})
        }
        self.postMessage({frames:renderedFrames,id:id, type:'done'});
    }

    function renderFrame(animationId,num){
        if(animations[animationId].renderedFrames[num]==2){
            if(!animations[animationId].renderFinished){
                //prerenderFrames(animations[animationId],num);
            }
            return;
        }
        animations[animationId].renderedFrames[num] = 2;
        iterateLayers(animations[animationId].data.animation.layers, num, animations[animationId].data._animType);
        //populateLayers(animations[animationId].data.animation.layers, num,renderedArray);
    }

    function populateLayers(layers, num, rendered){
        var i, len = layers.length, j, jLen;
        var offsettedFrameNum, timeRemapped;
        var shapes;
        for(i=0;i<len;i+=1){
            if(rendered[i] == ''){
                continue;
            }
            offsettedFrameNum = num - layers[i].startTime;
            layers[i].renderedData[offsettedFrameNum] = rendered[i];
            if(layers[i].type == 'PreCompLayer'){
                timeRemapped = layers[i].tm ? layers[i].tm[offsettedFrameNum] < 0 ? 0 : layers[i].tm[offsettedFrameNum] : offsettedFrameNum;
                populateLayers(layers[i].layers,timeRemapped,rendered.renderedArray);
            }else if(layers[i].type == 'ShapeLayer'){
                shapes = layers[i].shapes;
                jLen = shapes.length;
                for(j=0;j<jLen;j+=1){
                    shapes[j].renderedData[offsettedFrameNum] = rendered[i].shapes[j];
                }
            }
        }
    }

    function renderAllFrames(id){
        var animationData = animations[id].data;
        var i, len = animationData.animation.totalFrames;
        var renderedFrames = [];
        for(i=0;i<len;i+=1){
            renderedFrames.push({num:i,data:renderFrame(id,i)})
        }
        self.postMessage({frames:renderedFrames,id:id, type:'done'});
    }

    var moduleOb = {};
    moduleOb.completeData = completeData;
    moduleOb.renderFrame = renderFrame;
    moduleOb.renderAllFrames = renderAllFrames;
    moduleOb.renderFrames = renderFrames;

    return moduleOb;
};

var dataManager = dataFunctionManager();