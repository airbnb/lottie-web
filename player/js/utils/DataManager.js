function dataFunctionManager(){
    var frameRate = 0;
    var matrixInstance =  new MatrixManager();
    var degToRads = Math.PI/180;

    function convertNumericValue(data,multiplier){
        var i, len = data.length;
        var j, jLen;
        for(i=0;i<len;i+=1){
            if(data[i].t !== undefined){
                if(!!(data[i].s instanceof Array)){
                    jLen = data[i].s.length;
                    for(j=0;j<jLen;j+=1){
                        data[i].s[j] *= multiplier;
                        if(data[i].e !== undefined){
                            data[i].e[j] *= multiplier;
                        }
                    }
                }else if(data[i].s){
                    data[i].s *= multiplier;
                    if(data[i].e){
                        data[i].e *= multiplier;
                    }
                }
            }else{
                data[i] = data[i]*multiplier;
            }
        }
    }

    function completeLayers(layers, mainLayers, fontManager){
        if(!mainLayers){
            mainLayers = layers;
        }
        var layerFrames, offsetFrame, layerData;
        var animArray, lastFrame;
        var i, len = layers.length;
        var j, jLen, k, kLen;
        for(i=0;i<len;i+=1){
            layerData = layers[i];
            layerFrames = layerData.outPoint - layerData.startTime;
            offsetFrame = layerData.startTime;
            //layerData.layerName = convertLayerNameToID(layerData.layerName);
            /*if(layerData.parent){
                layerData.parent = convertLayerNameToID(layerData.parent);
            }*/
            if(layerData.tt){
                layers[i-1].td = layerData.tt;
            }
            layerData.renderedFrame = {};
            layerData.renderedData = {};
            animArray = [];
            lastFrame = -1;
            if(layerData.tm){
                layerData.trmp = layerData.tm;
                var timeValues = new Array(Math.round(layerFrames));
                for(j=0 ; j<layerFrames; j+=1){
                    timeValues[j] = Math.floor(getInterpolatedValue(layerData.tm,j,offsetFrame)*frameRate);
                }
                layerData.tm = timeValues;
            }
            if(layerData.ks.o instanceof Array){
                convertNumericValue(layerData.ks.o,1/100);
            }else{
                layerData.ks.o /= 100;
            }
            if(layerData.ks.s instanceof Array){
                convertNumericValue(layerData.ks.s,1/100);
            }else{
                layerData.ks.s /= 100;
            }
            if(layerData.ks.r instanceof Array){
                convertNumericValue(layerData.ks.r,degToRads);
            }else{
                layerData.ks.r *= degToRads;
            }
            if(layerData.hasMask){
                var maskProps = layerData.masksProperties;
                jLen = maskProps.length;
                for(j=0;j<jLen;j+=1){
                    if(maskProps[j].pt.i){
                        convertPathsToAbsoluteValues(maskProps[j].pt);
                    }else{
                        kLen = maskProps[j].pt.length;
                        for(k=0;k<kLen;k+=1){
                            if(maskProps[j].pt[k].s){
                                convertPathsToAbsoluteValues(maskProps[j].pt[k].s[0]);
                            }
                            if(maskProps[j].pt[k].e){
                                convertPathsToAbsoluteValues(maskProps[j].pt[k].e[0]);
                            }
                        }
                    }
                }
            }
            if(layerData.ty=='PreCompLayer'){
                if(layerData.refId && !layerData.layers){
                    layerData.layers = findCompLayers(layerData.refId,mainLayers);
                }else{
                    completeLayers(layerData.layers,mainLayers, fontManager);
                }
            }else if(layerData.ty == 'ShapeLayer'){
                completeShapes(layerData.shapes);
            }else if(layerData.ty == 'TextLayer'){
                TextData_Helper.completeText(layerData, fontManager);
            }
        }
    }

    function findCompLayers(id,layers,mainLayers){
        if(!mainLayers){
            mainLayers = layers;
        }
        var i, len = layers.length;
        for(i=0;i<len;i+=1){
            if(layers[i].compId == id){
                if(!layers[i].layers){
                    layers[i].layers = findCompLayers(layers[i].refId,mainLayers);
                }
                return layers[i].layers;
            }
            if(layers[i].ty == 'PreCompLayer'){
                var elem = findCompLayers(id,layers[i].layers,mainLayers);
                if(elem){
                    return elem;
                }
            }
        }
        return null;
    }

    function completeShapes(arr,trimmedFlag){
        var i, len = arr.length;
        var j, jLen;
        var transformData;
        var isTrimmed = trimmedFlag ? trimmedFlag : false;
        for(i=len-1;i>=0;i-=1){
            arr[i].renderedData = [];
            if(arr[i].ty == 'tm'){
                isTrimmed = true;
            }
            if(arr[i].ty == 'fl' || arr[i].ty == 'st'){
                if(arr[i].o instanceof Array){
                    convertNumericValue(arr[i].o,1/100);
                }else{
                    arr[i].o *= 1/100;
                }
            }else if(arr[i].ty == 'sh'){
                arr[i].trimmed = isTrimmed;
                if(arr[i].ks.i){
                    convertPathsToAbsoluteValues(arr[i].ks);
                }else{
                    jLen = arr[i].ks.length;
                    for(j=0;j<jLen;j+=1){
                        if(arr[i].ks[j].s){
                            convertPathsToAbsoluteValues(arr[i].ks[j].s[0]);
                            convertPathsToAbsoluteValues(arr[i].ks[j].e[0]);
                        }
                    }
                }
            }else if(arr[i].ty == 'gr'){
                completeShapes(arr[i].it,isTrimmed);
            }else if(arr[i].ty == 'tr'){
                transformData = arr[i];
                transformData.renderedData = [];
                if(transformData.o instanceof Array){
                    convertNumericValue(transformData.o,1/100);
                }else{
                    transformData.o /= 100;
                }
                if(transformData.s instanceof Array){
                    convertNumericValue(transformData.s,1/100);
                }else{
                    transformData.s /= 100;
                }
                if(transformData.r instanceof Array){
                    convertNumericValue(transformData.r,degToRads);
                }else{
                    transformData.r *= degToRads;
                }
            }else if(arr[i].ty == 'rc' || arr[i].ty == 'el'){
                arr[i].trimmed = isTrimmed;
                arr[i].trimmed = true;
            }
        }
    }

    function convertPathsToAbsoluteValues(path){
        var i, len = path.i.length;
        for(i=0;i<len;i+=1){
            path.i[i][0] += path.v[i][0];
            path.i[i][1] += path.v[i][1];
            path.o[i][0] += path.v[i][0];
            path.o[i][1] += path.v[i][1];
        }
    }

    function completeData(animationData, fontManager){
        animationData.__renderedFrames = new Array(Math.floor(animationData.animation.totalFrames));
        animationData.__renderFinished = false;
        frameRate = animationData.animation.frameRate;
        completeLayers(animationData.animation.layers, null, fontManager);
    }

    function convertLayerNameToID(string){
        string = string.replace(/ /g,"_");
        string = string.replace(/-/g,"_");
        string = string.replace(/\./g,"_");
        string = string.replace(/\//g,"_");
        return string;
    }

    function getInterpolatedValue(keyframes, frameNum, offsetTime,paramArr,arrPos,arrLen){
        var keyData, nextKeyData,propertyArray,bezierData;
        var i;
        var len,paramCnt = 0;
        if(!(keyframes.length)){
            if(paramArr){
                while(arrLen>0){
                    paramArr[arrPos+paramCnt] = keyframes;
                    paramCnt += 1;
                    arrLen -= 1;
                }
            }
            return keyframes;
        }else if(keyframes[0].t === undefined){
            if(paramArr){
                while(arrLen>0){
                    paramArr[arrPos+paramCnt] = keyframes[paramCnt];
                    paramCnt += 1;
                    arrLen -= 1;
                }
            }
            return keyframes;
        }
        i = 0;
        len = keyframes.length- 1;
        var dir=1;
        var flag = true;

        while(flag){
            keyData = keyframes[i];
            nextKeyData = keyframes[i+1];
            if(i == len-1 && frameNum >= nextKeyData.t - offsetTime){
                break;
            }
            if((nextKeyData.t - offsetTime) > frameNum && dir == 1){
                break;
            }else if((nextKeyData.t - offsetTime) < frameNum && dir == -1){
                i += 1;
                keyData = keyframes[i];
                nextKeyData = keyframes[i+1];
                break;
            }
            if(i < len - 1 && dir == 1 || i > 0 && dir == -1){
                i += dir;
            }else{
                flag = false;
            }
        }

        if(keyData.to && !keyData.bezierData){
            bez.buildBezierData(keyData);
        }
        var k, kLen;
        var perc,jLen, j = 0;
        var fnc;
        if(!paramArr){
            propertyArray = [];
        }
        if(keyData.to){
            bezierData = keyData.bezierData;
            if(frameNum >= nextKeyData.t-offsetTime || frameNum < keyData.t-offsetTime){
                var ind = frameNum >= nextKeyData.t-offsetTime ? bezierData.points.length - 1 : 0;
                if(paramArr){
                    while(arrLen>0){
                        paramArr[arrPos+paramCnt] = bezierData.points[ind].point[paramCnt];
                        paramCnt += 1;
                        arrLen -= 1;
                    }
                }
                return bezierData.points[ind].point;
            }
            if(keyData.__fnct){
                fnc = keyData.__fnct;
            }else{
                fnc = bez.getEasingCurve(keyData.o.x,keyData.o.y,keyData.i.x,keyData.i.y,keyData.n);
                keyData.__fnct = fnc;
            }
            perc = fnc('',(frameNum)-(keyData.t-offsetTime),0,1,(nextKeyData.t-offsetTime)-(keyData.t-offsetTime));
            var distanceInLine = bezierData.segmentLength*perc;

            var segmentPerc;
            var addedLength = 0;
            dir = 1;
            flag = true;
            jLen = bezierData.points.length;
            while(flag){
                addedLength +=bezierData.points[j].partialLength*dir;
                if(distanceInLine === 0 || perc === 0 || j == bezierData.points.length - 1){
                    if(paramArr){
                        while(arrLen>0){
                            paramArr[arrPos+paramCnt] = bezierData.points[j].point[paramCnt];
                            paramCnt += 1;
                            arrLen -= 1;
                        }
                    }else{
                        propertyArray = bezierData.points[j].point;
                    }
                    break;
                }else if(distanceInLine > addedLength && distanceInLine < addedLength + bezierData.points[j+1].partialLength){
                    segmentPerc = (distanceInLine-addedLength)/(bezierData.points[j+1].partialLength);
                    if(paramArr){
                        while(arrLen>0){
                            paramArr[arrPos+paramCnt] = bezierData.points[j].point[paramCnt] + (bezierData.points[j+1].point[paramCnt] - bezierData.points[j].point[paramCnt])*segmentPerc;
                            paramCnt += 1;
                            arrLen -= 1;
                        }
                    }else{
                        kLen = bezierData.points[j].point.length;
                        for(k=0;k<kLen;k+=1){
                            propertyArray.push(bezierData.points[j].point[k] + (bezierData.points[j+1].point[k] - bezierData.points[j].point[k])*segmentPerc);
                        }
                    }
                    break;
                }
                if(j < jLen - 1 && dir == 1 || j > 0 && dir == -1){
                    j += dir;
                }else{
                    flag = false;
                }
            }
        }else{
            var outX,outY,inX,inY, isArray = false, keyValue;
            len = keyData.s.length;
            for(i=0;i<len;i+=1){
                if(keyData.h !== 1){
                    if(keyData.o.x instanceof Array){
                        isArray = true;
                        if(!keyData.__fnct){
                            keyData.__fnct = [];
                        }
                        if(!keyData.__fnct[i]){
                            outX = keyData.o.x[i] ? keyData.o.x[i] : keyData.o.x[0];
                            outY = keyData.o.y[i] ? keyData.o.y[i] : keyData.o.y[0];
                            inX = keyData.i.x[i] ? keyData.i.x[i] : keyData.i.x[0];
                            inY = keyData.i.y[i] ? keyData.i.y[i] : keyData.i.y[0];
                        }
                    }else{
                        isArray = false;
                        if(!keyData.__fnct) {
                            outX = keyData.o.x;
                            outY = keyData.o.y;
                            inX = keyData.i.x;
                            inY = keyData.i.y;
                        }
                    }
                    if(isArray){
                        if(keyData.__fnct[i]){
                            fnc = keyData.__fnct[i];
                        }else{
                            fnc = bez.getEasingCurve(outX,outY,inX,inY);
                            keyData.__fnct[i] = fnc;
                        }
                    }else{
                        if(keyData.__fnct){
                            fnc = keyData.__fnct;
                        }else{
                            fnc = bez.getEasingCurve(outX,outY,inX,inY);
                            keyData.__fnct = fnc;
                        }
                    }
                    if(frameNum >= nextKeyData.t-offsetTime){
                        perc = 1;
                    }else if(frameNum < keyData.t-offsetTime){
                        perc = 0;
                    }else{
                        perc = fnc('',(frameNum)-(keyData.t-offsetTime),0,1,(nextKeyData.t-offsetTime)-(keyData.t-offsetTime));
                    }
                }
                keyValue = keyData.h === 1 ? keyData.s[i] : keyData.s[i]+(keyData.e[i]-keyData.s[i])*perc;
                if(paramArr){
                    if(arrLen > 0) {
                        paramArr[arrPos + paramCnt] = keyValue;
                        paramCnt += 1;
                        arrLen -= 1;
                    }
                }else{
                    propertyArray.push(keyValue);
                }
            }
        }
        return propertyArray;
    }

    function getSegmentsLength(keyframes,closed){
        if(keyframes.__lengths){
            return;
        }
        keyframes.__lengths = [];
        keyframes.__totalLength = 0;
        var pathV = keyframes.v;
        var pathO = keyframes.o;
        var pathI = keyframes.i;
        var i, len = pathV.length;
        for(i=0;i<len-1;i+=1){
            keyframes.__lengths.push(bez.getBezierLength(pathV[i],pathV[i+1],pathO[i],pathI[i+1]));
            keyframes.__totalLength += keyframes.__lengths[i].addedLength;
        }
        if(closed){
            keyframes.__lengths.push(bez.getBezierLength(pathV[i],pathV[0],pathO[i],pathI[0]));
            keyframes.__totalLength += keyframes.__lengths[i].addedLength;
        }
    }

    function interpolateShape(shapeData, frameNum, offsetTime, renderType, isMask, trimData){
        var isTrimmed = trimData && trimData.length > 0;
        var pathData = {};
        pathData.closed = isMask ? shapeData.cl : shapeData.closed;
        var keyframes = isMask ? shapeData.pt : shapeData.ks;
        if(keyframes.v){
            if(!isTrimmed){
                pathData.pathNodes = keyframes;
            }else{
                pathData.pathNodes = trimPath(keyframes,pathData.closed, trimData, false);
            }
            return pathData;
        }else{
            var j,jLen, k, kLen;
            var coordsIData,coordsOData,coordsVData;
            if(frameNum < keyframes[0].t-offsetTime || frameNum > keyframes[keyframes.length - 1].t-offsetTime){
                var ob, pos, stored, key;
                if(frameNum < keyframes[0].t-offsetTime){
                    key = '__minValue';
                    pos = 0;
                    stored = keyframes.__minValue;
                    ob = keyframes[pos].s;
                }else{
                    key = '__maxValue';
                    pos = keyframes.length - 2;
                    stored = keyframes.__maxValue;
                    ob = keyframes[pos].h ? keyframes[pos].s : keyframes[pos].e;
                }
                if(!stored){
                    jLen = keyframes[pos].s[0].i.length;
                    shapeData = {
                        i: new Array(jLen),
                        o: new Array(jLen),
                        v: new Array(jLen)
                    };
                    for(j=0;j<jLen;j+=1){
                        kLen = keyframes[pos].s[0].i[j].length;
                        coordsIData = new Array(kLen);
                        coordsOData = new Array(kLen);
                        coordsVData = new Array(kLen);
                        for(k=0;k<kLen;k+=1){
                            coordsIData[k] = ob[0].i[j][k];
                            coordsOData[k] = ob[0].o[j][k];
                            coordsVData[k] = ob[0].v[j][k];
                        }
                        shapeData.i[j] = coordsIData;
                        shapeData.o[j] = coordsOData;
                        shapeData.v[j] = coordsVData;
                    }
                    keyframes[key] = shapeData;
                    stored = shapeData;
                }
                pathData.pathNodes = isTrimmed ? trimPath(stored,pathData.closed, trimData, false) : stored;
                return pathData;
            }else{
                var i = 0;
                var len = keyframes.length- 1;
                var dir = 1;
                var flag = true;
                var keyData,nextKeyData;

                while(flag){
                    keyData = keyframes[i];
                    nextKeyData = keyframes[i+1];
                    if((nextKeyData.t - offsetTime) > frameNum && dir == 1){
                        break;
                    }
                    if(i < len - 1 && dir == 1 || i > 0 && dir == -1){
                        i += dir;
                    }else{
                        flag = false;
                    }
                }

                var perc;
                if(keyData.h !== 1){
                    var fnc;
                    if(keyData.__fnct){
                        fnc = keyData.__fnct;
                    }else{
                        fnc = bez.getEasingCurve(keyData.o.x,keyData.o.y,keyData.i.x,keyData.i.y);
                        keyData.__fnct = fnc;
                    }
                    if(frameNum >= nextKeyData.t-offsetTime){
                        perc = 1;
                    }else if(frameNum < keyData.t-offsetTime){
                        perc = 0;
                    }else{
                        perc = fnc('',(frameNum)-(keyData.t-offsetTime),0,1,(nextKeyData.t-offsetTime)-(keyData.t-offsetTime));
                    }
                }
                if(keyData.h === 1 && keyData.__hValue){
                    shapeData = keyData.__hValue;
                }else{
                    jLen = keyData.s[0].i.length;
                    shapeData = {
                        i: new Array(jLen),
                        o: new Array(jLen),
                        v: new Array(jLen)
                    };
                    for(j=0;j<jLen;j+=1){
                        kLen = keyData.s[0].i[j].length;
                        coordsIData = new Array(kLen);
                        coordsOData = new Array(kLen);
                        coordsVData = new Array(kLen);
                        for(k=0;k<kLen;k+=1){
                            if(keyData.h === 1){
                                coordsIData[k] = keyData.s[0].i[j][k];
                                coordsOData[k] = keyData.s[0].o[j][k];
                                coordsVData[k] = keyData.s[0].v[j][k];
                            }else{
                                coordsIData[k] = keyData.s[0].i[j][k]+(keyData.e[0].i[j][k]-keyData.s[0].i[j][k])*perc;
                                coordsOData[k] = keyData.s[0].o[j][k]+(keyData.e[0].o[j][k]-keyData.s[0].o[j][k])*perc;
                                coordsVData[k] = keyData.s[0].v[j][k]+(keyData.e[0].v[j][k]-keyData.s[0].v[j][k])*perc;
                            }
                        }
                        shapeData.i[j] = coordsIData;
                        shapeData.o[j] = coordsOData;
                        shapeData.v[j] = coordsVData;
                        if(keyData.h === 1){
                            keyData.__hValue = shapeData;
                        }
                    }
                }
                pathData.pathNodes = isTrimmed ? trimPath(shapeData,pathData.closed, trimData, false) : shapeData;
                return pathData;
            }
        }
    }

    var trimPath = (function(){

        var pathStarted = false;
        var pathString = '';
        var nextI,nextV,nextO, stops;
        var nextLengths;
        var nextTotalLength;
        var segmentCount;
        function addSegment(pt1,pt2,pt3,pt4, lengthData){
            nextO[segmentCount] = pt2;
            nextI[segmentCount+1] = pt3;
            nextV[segmentCount+1] = pt4;
            if(!pathStarted){
                pathString += " M"+pt1.join(',');
                pathStarted = true;
                stops[segmentCount] = pt1;
            }else{
                nextV[segmentCount] = pt1;
            }
            pathString += " C"+pt2.join(',') + " "+pt3.join(',') + " "+pt4.join(',');
            //nextLengths[segmentCount] = lengthData;
            segmentCount+=1;
            //nextTotalLength += lengthData.addedLength;
        }

        return function trimPath_(paths,closed, trimData, stringifyFlag){
            getSegmentsLength(paths,closed);
            var j, jLen = trimData.length;
            var finalPaths = paths;
            nextV = nextI = nextO = stops = null;
            var pathV,pathO,pathI;
            var k, kLen;
            for(j=jLen-1;j>=0;j-=1){
                var segments = [];
                var o = (trimData[j].o%360)/360;
                if(o === 0 && trimData[j].s === 0 && trimData[j].e == 100){
                    continue;
                }
                pathString = '';
                pathStarted = false;
                nextI = [];
                nextO = [];
                nextV = [];
                stops = [];
                nextLengths = [];
                nextTotalLength = 0;
                if(o < 0){
                    o += 1;
                }
                var s = trimData[j].s/100 + o;
                var e = (trimData[j].e/100) + o;
                if(s == e){
                    if(stringifyFlag){
                        return '';
                    }else{
                        return {};
                    }
                }
                if(s>e){
                    var _s = s;
                    s = e;
                    e = _s;
                }
                if(e <= 1){
                    segments.push({s:finalPaths.__totalLength*s,e:finalPaths.__totalLength*e});
                }else if(s >= 1){
                    segments.push({s:finalPaths.__totalLength*(s-1),e:finalPaths.__totalLength*(e-1)});
                }else{
                    segments.push({s:finalPaths.__totalLength*s,e:finalPaths.__totalLength});
                    segments.push({s:0,e:finalPaths.__totalLength*(e-1)});
                }

                pathV=[];
                pathO=[];
                pathI=[];

                var lengths;
                pathV = finalPaths.v;
                pathO = finalPaths.o;
                pathI = finalPaths.i;
                lengths = finalPaths.__lengths;
                kLen = pathV.length;
                var addedLength = 0, segmentLength = 0;
                var i, len = segments.length;
                var segment;
                segmentCount = 0;
                for(i=0;i<len;i+=1){
                    addedLength = 0;
                    for(k=1;k<kLen;k++){
                        segmentLength = lengths[k-1].addedLength;
                        if(addedLength + segmentLength < segments[i].s){
                            addedLength += segmentLength;
                            continue;
                        }else if(addedLength > segments[i].e){
                            break;
                        }
                        if(segments[i].s <= addedLength && segments[i].e >= addedLength + segmentLength){
                            addSegment(pathV[k-1],pathO[k-1],pathI[k],pathV[k],lengths[k-1]);
                        }else{
                            segment = bez.getNewSegment(pathV[k-1],pathV[k],pathO[k-1],pathI[k], (segments[i].s - addedLength)/segmentLength,(segments[i].e - addedLength)/segmentLength, lengths[k-1]);
                            addSegment(segment.pt1,segment.pt3,segment.pt4,segment.pt2/*,bez.getBezierLength(segment.pt1,segment.pt4,segment.pt2,segment.pt3)*/);
                        }
                        addedLength += segmentLength;
                    }
                    if(closed !== false){
                        if(addedLength <= segments[i].e){
                            segmentLength = lengths[k-1].addedLength;
                            if(segments[i].s <= addedLength && segments[i].e >= addedLength + segmentLength){
                                addSegment(pathV[k-1],pathO[k-1],pathI[0],pathV[0],lengths[k-1]);
                            }else{
                                segment = bez.getNewSegment(pathV[k-1],pathV[0],pathO[k-1],pathI[0], (segments[i].s - addedLength)/segmentLength,(segments[i].e - addedLength)/segmentLength, lengths[k-1]);
                                addSegment(segment.pt1,segment.pt3,segment.pt4,segment.pt2/*,bez.getBezierLength(segment.pt1,segment.pt4,segment.pt2,segment.pt3)*/);
                            }
                        }
                    }else{
                        pathStarted = false;
                    }
                }
                closed = false;
            }
            if(!nextV){
                pathV = finalPaths.v;
                pathO = finalPaths.o;
                pathI = finalPaths.i;
                stops = [];
            }else{
                pathV = nextV;
                pathO = nextO;
                pathI = nextI;
            }
            kLen = pathV.length;
            if(stringifyFlag){
                pathString = '';
                for(k=1;k<kLen;k++){
                    if(stops[k-1]){
                        pathString += "M"+stops[k-1].join(',');
                    }else if(k == 1){
                        pathString += "M"+pathV[0].join(',');
                    }
                    pathString += " C"+pathO[k-1].join(',') + " "+pathI[k].join(',') + " "+pathV[k].join(',');
                }
                if(closed !== false){
                    pathString += " C"+pathO[k-1].join(',') + " "+pathI[0].join(',') + " "+pathV[0].join(',');
                }
                return pathString;
            }else{
                return {
                    i: pathI,
                    o: pathO,
                    v: pathV,
                    s: stops,
                    c: closed
                };
            }
        };
    }());

    var mtParams = [0,1,1,0,0];
    function iterateLayers(layers, frameNum,renderType){
        var dataOb;
        var maskProps;
        var timeRemapped;

        var offsettedFrameNum, i, len, renderedData;
        var j, jLen = layers.length, item;
        for(j=0;j<jLen;j+=1){
            item = layers[j];
            offsettedFrameNum = frameNum - item.startTime;
            dataOb = {};
            dataOb.a = getInterpolatedValue(item.ks.a,offsettedFrameNum, item.startTime);
            dataOb.o = getInterpolatedValue(item.ks.o,offsettedFrameNum, item.startTime);
            if(item.ks.p.s){
                getInterpolatedValue(item.ks.p.x,offsettedFrameNum, item.startTime,mtParams,3,1);
                getInterpolatedValue(item.ks.p.y,offsettedFrameNum, item.startTime,mtParams,4,1);
            }else{
                getInterpolatedValue(item.ks.p,offsettedFrameNum, item.startTime,mtParams,3,2);
            }
            getInterpolatedValue(item.ks.r,offsettedFrameNum, item.startTime,mtParams,0,1);
            getInterpolatedValue(item.ks.s,offsettedFrameNum, item.startTime,mtParams,1,2);
            renderedData = {};
            renderedData.an = {
                tr: dataOb
            };
            renderedData.an.matrixArray = matrixInstance.getMatrixArrayFromParams(mtParams[0],mtParams[1],mtParams[2],mtParams[3],mtParams[4]);
            item.renderedData[offsettedFrameNum] = renderedData;
            if(item.hasMask){
                maskProps = item.masksProperties;
                len = maskProps.length;
                for(i=0;i<len;i+=1){
                    if(!maskProps[i].paths){
                        maskProps[i].paths = [];
                        maskProps[i].opacity = [];
                    }

                    maskProps[i].paths[offsettedFrameNum] = interpolateShape(maskProps[i],offsettedFrameNum, item.startTime,renderType,true);
                    maskProps[i].opacity[offsettedFrameNum] = getInterpolatedValue(maskProps[i].o,offsettedFrameNum, item.startTime);
                    maskProps[i].opacity[offsettedFrameNum] = maskProps[i].opacity[offsettedFrameNum] instanceof Array ? maskProps[i].opacity[offsettedFrameNum][0]/100 : maskProps[i].opacity[offsettedFrameNum]/100;
                }
            }
            if((frameNum < item.inPoint || frameNum > item.outPoint)){
               continue;
            }
            if(item.ty == 'PreCompLayer'){
                timeRemapped = item.tm ? item.tm[offsettedFrameNum] < 0 ? 0 : offsettedFrameNum >= item.tm.length ? item.tm[item.tm.length - 1] :  item.tm[offsettedFrameNum] : offsettedFrameNum;
                if(timeRemapped === undefined){
                    timeRemapped = getInterpolatedValue(item.trmp,offsettedFrameNum, 0)[0]*frameRate;
                    item.tm[offsettedFrameNum] = timeRemapped;
                }
                iterateLayers(item.layers,timeRemapped,renderType);
            }else if(item.ty == 'ShapeLayer'){
                iterateShape(item.shapes,offsettedFrameNum,item.startTime,renderType);
            }else if(item.ty == 'TextLayer'){
                iterateText(item,offsettedFrameNum,renderType);
            }
        }
    }

    function iterateText(item,offsettedFrameNum,renderType){
        var renderedData = item.renderedData[offsettedFrameNum];
        renderedData.t = {
        };
        if(item.t.p && 'm' in item.t.p) {
            renderedData.t.p = [];
            getInterpolatedValue(item.t.p.f,offsettedFrameNum, item.startTime,renderedData.t.p,0,1);
        }
        renderedData.t.m = {
            a: getInterpolatedValue(item.t.m.a,offsettedFrameNum, item.startTime)
        };

        var animators = item.t.a;
        var i, len = animators.length, animatorProps;
        renderedData.t.a = new Array(len);
        for(i = 0; i < len; i += 1) {
            animatorProps = animators[i];
            renderedData.t.a[i] = {
                a: {},
                s: {}
            };
            if('r' in animatorProps.a) {
                renderedData.t.a[i].a.r = getInterpolatedValue(animatorProps.a.r,offsettedFrameNum, item.startTime);
            }
            if('s' in animatorProps.a) {
                renderedData.t.a[i].a.s = getInterpolatedValue(animatorProps.a.s,offsettedFrameNum, item.startTime);
            }
            if('a' in animatorProps.a) {
                renderedData.t.a[i].a.a = getInterpolatedValue(animatorProps.a.a,offsettedFrameNum, item.startTime);
            }
            if('o' in animatorProps.a) {
                renderedData.t.a[i].a.o = getInterpolatedValue(animatorProps.a.o,offsettedFrameNum, item.startTime);
            }
            if('p' in animatorProps.a) {
                renderedData.t.a[i].a.p = getInterpolatedValue(animatorProps.a.p,offsettedFrameNum, item.startTime);
            }
            if('sw' in animatorProps.a) {
                renderedData.t.a[i].a.sw = getInterpolatedValue(animatorProps.a.sw,offsettedFrameNum, item.startTime);
            }
            if('sc' in animatorProps.a) {
                renderedData.t.a[i].a.sc = getInterpolatedValue(animatorProps.a.sc,offsettedFrameNum, item.startTime);
            }
            if('fc' in animatorProps.a) {
                renderedData.t.a[i].a.fc = getInterpolatedValue(animatorProps.a.fc,offsettedFrameNum, item.startTime);
            }
            if('t' in animatorProps.a) {
                renderedData.t.a[i].a.t = getInterpolatedValue(animatorProps.a.t,offsettedFrameNum, item.startTime);
            }
            if('s' in animatorProps.s) {
                renderedData.t.a[i].s.s = getInterpolatedValue(animatorProps.s.s,offsettedFrameNum, item.startTime);
            }else{
                renderedData.t.a[i].s.s = 0;
            }
            if('e' in animatorProps.s) {
                renderedData.t.a[i].s.e = getInterpolatedValue(animatorProps.s.e,offsettedFrameNum, item.startTime);
            }
            if('o' in animatorProps.s) {
                renderedData.t.a[i].s.o = getInterpolatedValue(animatorProps.s.o,offsettedFrameNum, item.startTime);
            }else{
                renderedData.t.a[i].s.o = 0;
            }
            if('xe' in animatorProps.s) {
                renderedData.t.a[i].s.xe = getInterpolatedValue(animatorProps.s.xe,offsettedFrameNum, item.startTime);
            }else{
                renderedData.t.a[i].s.xe = 0;
            }
            if('ne' in animatorProps.s) {
                renderedData.t.a[i].s.ne = getInterpolatedValue(animatorProps.s.ne,offsettedFrameNum, item.startTime);
            }else{
                renderedData.t.a[i].s.ne = 0;
            }
        }
        TextData_Helper.getMeasures(item, offsettedFrameNum,renderType);

        //console.log(item.t);
    }

    function convertRectToPath(pos,size,round, d){
        round = Math.min(size[0],size[1],round/2);
        var nextV = new Array(8);
        var nextI = new Array(8);
        var nextO = new Array(8);
        var cPoint = round/2;
        //round *= 1;

        if(d === 2) {

            nextV[0] = [pos[0]+size[0]/2,pos[1]-size[1]/2+round];
            nextO[0] = nextV[0];
            nextI[0] = [pos[0]+size[0]/2,pos[1]-size[1]/2+cPoint];

            nextV[1] = [pos[0]+size[0]/2,pos[1]+size[1]/2-round];
            nextO[1] = [pos[0]+size[0]/2,pos[1]+size[1]/2-cPoint];
            nextI[1] = nextV[1];

            nextV[2] = [pos[0]+size[0]/2-round,pos[1]+size[1]/2];
            nextO[2] = nextV[2];
            nextI[2] = [pos[0]+size[0]/2-cPoint,pos[1]+size[1]/2];

            nextV[3] = [pos[0]-size[0]/2+round,pos[1]+size[1]/2];
            nextO[3] = [pos[0]-size[0]/2+cPoint,pos[1]+size[1]/2];
            nextI[3] = nextV[3];

            nextV[4] = [pos[0]-size[0]/2,pos[1]+size[1]/2-round];
            nextO[4] = nextV[4];
            nextI[4] = [pos[0]-size[0]/2,pos[1]+size[1]/2-cPoint];

            nextV[5] = [pos[0]-size[0]/2,pos[1]-size[1]/2+round];
            nextO[5] = [pos[0]-size[0]/2,pos[1]-size[1]/2+cPoint];
            nextI[5] = nextV[5];

            nextV[6] = [pos[0]-size[0]/2+round,pos[1]-size[1]/2];
            nextO[6] = nextV[6];
            nextI[6] = [pos[0]-size[0]/2+cPoint,pos[1]-size[1]/2];

            nextV[7] = [pos[0]+size[0]/2-round,pos[1]-size[1]/2];
            nextO[7] = [pos[0]+size[0]/2-cPoint,pos[1]-size[1]/2];
            nextI[7] = nextV[7];
        }else{
            nextV[0] = [pos[0]+size[0]/2,pos[1]-size[1]/2+round];
            nextO[0] = [pos[0]+size[0]/2,pos[1]-size[1]/2+cPoint];
            nextI[0] = nextV[0];

            nextV[1] = [pos[0]+size[0]/2-round,pos[1]-size[1]/2];
            nextO[1] = nextV[1];
            nextI[1] = [pos[0]+size[0]/2-cPoint,pos[1]-size[1]/2];

            nextV[2] = [pos[0]-size[0]/2+round,pos[1]-size[1]/2];
            nextO[2] = [pos[0]-size[0]/2+cPoint,pos[1]-size[1]/2];
            nextI[2] = nextV[2];

            nextV[3] = [pos[0]-size[0]/2,pos[1]-size[1]/2+round];
            nextO[3] = nextV[3];
            nextI[3] = [pos[0]-size[0]/2,pos[1]-size[1]/2+cPoint];

            nextV[4] = [pos[0]-size[0]/2,pos[1]+size[1]/2-round];
            nextO[4] = [pos[0]-size[0]/2,pos[1]+size[1]/2-cPoint];
            nextI[4] = nextV[4];

            nextV[5] = [pos[0]-size[0]/2+round,pos[1]+size[1]/2];
            nextO[5] = nextV[5];
            nextI[5] = [pos[0]-size[0]/2+cPoint,pos[1]+size[1]/2];

            nextV[6] = [pos[0]+size[0]/2-round,pos[1]+size[1]/2];
            nextO[6] = [pos[0]+size[0]/2-cPoint,pos[1]+size[1]/2];
            nextI[6] = nextV[6];

            nextV[7] = [pos[0]+size[0]/2,pos[1]+size[1]/2-round];
            nextO[7] = nextV[7];
            nextI[7] = [pos[0]+size[0]/2,pos[1]+size[1]/2-cPoint];

        }


        return {v:nextV,o:nextO,i:nextI,c:true};
    }

    function iterateShape(arr,offsettedFrameNum,startTime,renderType,addedTrim){
        var i, len = arr.length;
        var shapeItem;
        var fillColor, fillOpacity;
        var elmPos,elmSize,elmRound;
        var strokeColor,strokeOpacity,strokeWidth;
        if(!addedTrim){
            addedTrim = [];
        }
        var trimS,trimE,trimO;
        var j, jLen;
        for(i=len-1;i>=0;i-=1){
            shapeItem = arr[i];
            if(shapeItem.ty == 'sh'){
                shapeItem.renderedData[offsettedFrameNum] = {
                    path: interpolateShape(shapeItem,offsettedFrameNum, startTime,renderType,false,addedTrim)
                };
            }else if(shapeItem.ty == 'fl'){
                fillColor = getInterpolatedValue(shapeItem.c,offsettedFrameNum, startTime);
                fillOpacity = getInterpolatedValue(shapeItem.o,offsettedFrameNum, startTime);
                shapeItem.renderedData[offsettedFrameNum] = {
                    opacity:  fillOpacity instanceof Array ? fillOpacity[0] : fillOpacity
                };
                if(renderType == 'canvas'){
                    roundColor(fillColor);
                    shapeItem.renderedData[offsettedFrameNum].color = fillColor;
                }else{
                    shapeItem.renderedData[offsettedFrameNum].color = rgbToHex(Math.round(fillColor[0]),Math.round(fillColor[1]),Math.round(fillColor[2]));
                }
            }else if(shapeItem.ty == 'rc'){
                elmPos = getInterpolatedValue(shapeItem.p,offsettedFrameNum, startTime);
                elmSize = getInterpolatedValue(shapeItem.s,offsettedFrameNum, startTime);
                elmRound = getInterpolatedValue(shapeItem.r,offsettedFrameNum, startTime);
                if(!shapeItem.trimmed){
                    shapeItem.renderedData[offsettedFrameNum] = {
                        position : elmPos,
                        size : elmSize,
                        roundness : elmRound
                    };
                }else{
                    shapeItem.closed = true;
                    shapeItem.renderedData[offsettedFrameNum] = {
                        path: {
                            closed: true
                        }
                    };
                    shapeItem.renderedData[offsettedFrameNum].path.pathNodes = trimPath(convertRectToPath(elmPos,elmSize,elmRound,shapeItem.d),true, addedTrim, false);
                }
            }else if(shapeItem.ty == 'el'){
                elmPos = getInterpolatedValue(shapeItem.p,offsettedFrameNum, startTime);
                elmSize = getInterpolatedValue(shapeItem.s,offsettedFrameNum, startTime);
                shapeItem.renderedData[offsettedFrameNum] = {
                    p : elmPos,
                    size : elmSize
                };
                if(renderType == 'svg'){

                    var pathNodes = {
                        v: new Array(4),
                        i:new Array(4),
                        o:new Array(4)
                    };
                    if(shapeItem.d !== 2 && shapeItem.d !== 3){
                        pathNodes.v[0] = [elmPos[0],elmPos[1]-elmSize[1]/2];
                        pathNodes.i[0] = [elmPos[0] - (elmSize[0]/2)*0.55,elmPos[1] - elmSize[1]/2];
                        pathNodes.o[0] = [elmPos[0] + (elmSize[0]/2)*0.55,elmPos[1] - elmSize[1]/2];
                        pathNodes.v[1] = [elmPos[0] + elmSize[0]/2,elmPos[1]];
                        pathNodes.i[1] = [elmPos[0] + (elmSize[0]/2),elmPos[1] - (elmSize[1]/2)*0.55];
                        pathNodes.o[1] = [elmPos[0] + (elmSize[0]/2),elmPos[1] + (elmSize[1]/2)*0.55];
                        pathNodes.v[2] = [elmPos[0],elmPos[1]+elmSize[1]/2];
                        pathNodes.i[2] = [elmPos[0] + (elmSize[0]/2)*0.55,elmPos[1] + (elmSize[1]/2)];
                        pathNodes.o[2] = [elmPos[0] - (elmSize[0]/2)*0.55,elmPos[1] + (elmSize[1]/2)];
                        pathNodes.v[3] = [elmPos[0] - elmSize[0]/2,elmPos[1]];
                        pathNodes.i[3] = [elmPos[0] - (elmSize[0]/2),elmPos[1] + (elmSize[1]/2)*0.55];
                        pathNodes.o[3] = [elmPos[0] - (elmSize[0]/2),elmPos[1] - (elmSize[1]/2)*0.55];
                    }else{
                        pathNodes.v[0] = [elmPos[0],elmPos[1]-elmSize[1]/2];
                        pathNodes.o[0] = [elmPos[0] - (elmSize[0]/2)*0.55,elmPos[1] - elmSize[1]/2];
                        pathNodes.i[0] = [elmPos[0] + (elmSize[0]/2)*0.55,elmPos[1] - elmSize[1]/2];
                        pathNodes.v[1] = [elmPos[0] - elmSize[0]/2,elmPos[1]];
                        pathNodes.o[1] = [elmPos[0] - (elmSize[0]/2),elmPos[1] + (elmSize[1]/2)*0.55];
                        pathNodes.i[1] = [elmPos[0] - (elmSize[0]/2),elmPos[1] - (elmSize[1]/2)*0.55];
                        pathNodes.v[2] = [elmPos[0],elmPos[1]+elmSize[1]/2];
                        pathNodes.o[2] = [elmPos[0] + (elmSize[0]/2)*0.55,elmPos[1] + (elmSize[1]/2)];
                        pathNodes.i[2] = [elmPos[0] - (elmSize[0]/2)*0.55,elmPos[1] + (elmSize[1]/2)];
                        pathNodes.v[3] = [elmPos[0] + elmSize[0]/2,elmPos[1]];
                        pathNodes.o[3] = [elmPos[0] + (elmSize[0]/2),elmPos[1] - (elmSize[1]/2)*0.55];
                        pathNodes.i[3] = [elmPos[0] + (elmSize[0]/2),elmPos[1] + (elmSize[1]/2)*0.55];
                    }

                    if(!shapeItem.trimmed){
                        shapeItem.renderedData[offsettedFrameNum].path = {pathNodes:pathNodes};
                        shapeItem.closed = true;
                    }else{
                        shapeItem.renderedData[offsettedFrameNum] = {
                            path: {
                                closed: true
                            }
                        };
                        shapeItem.renderedData[offsettedFrameNum].path.pathNodes = trimPath(pathNodes,true, addedTrim, false);
                        shapeItem.closed = true;
                    }
                }
            }else if(shapeItem.ty == 'st'){
                strokeColor = getInterpolatedValue(shapeItem.c,offsettedFrameNum, startTime);
                strokeOpacity = getInterpolatedValue(shapeItem.o,offsettedFrameNum, startTime);
                strokeWidth = getInterpolatedValue(shapeItem.w,offsettedFrameNum, startTime);
                shapeItem.renderedData[offsettedFrameNum] = {
                    opacity : strokeOpacity instanceof Array ? strokeOpacity[0] : strokeOpacity,
                    width : strokeWidth instanceof Array ? strokeWidth[0] : strokeWidth
                };
                if(shapeItem.d){
                    var dashes = [];
                    jLen = shapeItem.d.length;
                    var val;
                    for(j=0;j<jLen;j+=1){
                        val = getInterpolatedValue(shapeItem.d[j].v,offsettedFrameNum, startTime);
                        dashes.push({
                            v : val instanceof Array ? val[0] : val,
                            n : shapeItem.d[j].n
                        });
                    }
                    shapeItem.renderedData[offsettedFrameNum].dashes = dashes;
                }
                if(renderType == 'canvas'){
                    roundColor(strokeColor);
                    shapeItem.renderedData[offsettedFrameNum].color = strokeColor;
                }else{
                    shapeItem.renderedData[offsettedFrameNum].color = rgbToHex(Math.round(strokeColor[0]),Math.round(strokeColor[1]),Math.round(strokeColor[2]));
                }
            }else if(shapeItem.ty == 'tr'){
                shapeItem.renderedData[offsettedFrameNum] = {
                    a : getInterpolatedValue(shapeItem.a,offsettedFrameNum, startTime),
                    o : getInterpolatedValue(shapeItem.o,offsettedFrameNum, startTime)
                };
                getInterpolatedValue(shapeItem.s,offsettedFrameNum, startTime,mtParams,1,2);
                getInterpolatedValue(shapeItem.r,offsettedFrameNum, startTime,mtParams,0,1);
                getInterpolatedValue(shapeItem.p,offsettedFrameNum, startTime,mtParams,3,2);
                shapeItem.renderedData[offsettedFrameNum].mtArr = matrixInstance.getMatrixArrayFromParams(mtParams[0],mtParams[1],mtParams[2],mtParams[3],mtParams[4]);
            }else if(shapeItem.ty == 'tm'){
                trimS = getInterpolatedValue(shapeItem.s,offsettedFrameNum, startTime);
                trimE = getInterpolatedValue(shapeItem.e,offsettedFrameNum, startTime);
                trimO = getInterpolatedValue(shapeItem.o,offsettedFrameNum, startTime);
                var trimData = {
                    s: trimS,
                    e: trimE,
                    o: trimO
                };
                addedTrim.push(trimData);
                shapeItem.renderedData[offsettedFrameNum] = trimData;
                /*var currentStrimS = addedTrim.s;
                var currentStrimE = addedTrim.e;
                addedTrim.o += trimData.o;
                addedTrim.s = currentStrimS + (currentStrimE - currentStrimS)*(trimData.s/100);
                addedTrim.e = currentStrimE - (currentStrimE - currentStrimS)*(trimData.e/100);*/
            }else if(shapeItem.ty == 'gr'){
                iterateShape(shapeItem.it,offsettedFrameNum,startTime,renderType,addedTrim);
            }
        }
    }

    function roundColor(arr){
        var i, len = arr.length;
        for(i=0;i<len ;i+=1){
            arr[i] = Math.round(arr[i]);
        }
    }

    function prerenderFrames(animationData,num){
        var totalFrames = 1;
        while(totalFrames > 0){
            num += 1;
            if(num >= Math.floor(animationData.animation.totalFrames)){
                animationData.__renderFinished = true;
                break;
            }
            if(!animationData.__renderedFrames[num]){
                renderFrame(animationData,num);
                totalFrames -= 1;
            }
        }
    }

    function renderFrame(animationData,num){
        if(animationData.__renderedFrames[num]==2){
            if(!animationData.__renderFinished){
                prerenderFrames(animationData,num);
            }
            return;
        }
        frameRate = animationData.animation.frameRate;
        animationData.__renderedFrames[num] = 2;
        iterateLayers(animationData.animation.layers, num, animationData._animType);
    }

    function populateLayers(layers, num, rendered){
        var i, len = layers.length, j, jLen;
        var offsettedFrameNum, timeRemapped;
        var shapes;
        for(i=0;i<len;i+=1){
            if(rendered[i] === ''){
                continue;
            }
            offsettedFrameNum = num - layers[i].startTime;
            layers[i].renderedData[offsettedFrameNum] = rendered[i];
            if(layers[i].ty == 'PreCompLayer'){
                timeRemapped = layers[i].tm ? layers[i].tm[offsettedFrameNum] < 0 ? 0 : offsettedFrameNum >= layers[i].tm.length ? layers[i].tm[layers[i].tm.length - 1] : layers[i].tm[offsettedFrameNum] : offsettedFrameNum;
                populateLayers(layers[i].layers,timeRemapped,rendered.renderedArray);
            }else if(layers[i].ty == 'ShapeLayer'){
                shapes = layers[i].shapes;
                jLen = shapes.length;
                for(j=0;j<jLen;j+=1){
                    shapes[j].renderedData[offsettedFrameNum] = rendered[i].shapes[j];
                }
            }
        }
    }

    var moduleOb = {};
    moduleOb.completeData = completeData;
    moduleOb.renderFrame = renderFrame;

    return moduleOb;
}

var dataManager = dataFunctionManager();