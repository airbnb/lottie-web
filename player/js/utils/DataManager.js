function dataFunctionManager(){
    var frameRate = 0;
    var matrixInstance =  new MatrixManager();
    var animations = {};
    var degToRads = Math.PI/180;
    var interpolatedParams = {
        arrayFlag : false
    };

    function completeTimeRemap(tm, layerFrames, offsetFrame){
        var interpolatedProperty = getInterpolatedValues(tm,layerFrames, offsetFrame);
        var i;
        var timeValues = [];
        for(i=0 ; i<layerFrames; i+=1){
            timeValues.push(Math.floor(interpolatedProperty[i]*frameRate));
        }
        return timeValues;
    }

    function convertNumericValue(data,multiplier){
        var i, len = data.length;
        var j, jLen;
        for(i=0;i<len;i+=1){
            if(data[i].t !== undefined){
                if(!!(data[i].s instanceof Array)){
                    jLen = data[i].s.length;
                    for(j=0;j<jLen;j+=1){
                        data[i].s[j] *= multiplier;
                        data[i].e[j] *= multiplier;
                    }
                }else if(data[i].s){
                    data[i].s *= multiplier;
                    data[i].e *= multiplier;
                }
            }else{
                data[i] = data[i]*multiplier;
            }
        }
    }

    function completeLayers(layers){
        var layerFrames, offsetFrame, layerData;
        var animArray, lastFrame;
        var shapeItem;
        var i, len = layers.length;
        var j, jLen, k, kLen;
        for(i=0;i<len;i+=1){
            layerData = layers[i];
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
            if(layerData.type=='PreCompLayer'){
                completeLayers(layerData.layers);
            }else if(layerData.type == 'ShapeLayer'){
                jLen = layerData.shapes.length;
                for(j=0;j<jLen;j+=1){
                    shapeItem = layerData.shapes[j];
                    completeShapes(shapeItem);
                }
            }
        }
    }

    function completeShapes(arr){
        var i, len = arr.length;
        var j, jLen;
        var transformData;
        for(i=0;i<len;i+=1){
            arr[i].renderedData = [];
            if(arr[i].ty == 'fl' || arr[i].ty == 'st'){
                if(arr[i].o instanceof Array){
                    convertNumericValue(arr[i].o,1/100);
                }else{
                    arr[i].o *= 1/100;
                }
            }else if(arr[i].ty == 'sh'){
                if(arr[i].ks.i){
                    convertPathsToAbsoluteValues(arr[i].ks);
                }else{
                    jLen = shapeItem[i].ks.length;
                    for(j=0;j<jLen;j+=1){
                        if(shapeItem[i].ks[j].s){
                            convertPathsToAbsoluteValues(arr[i].ks[j].s[0]);
                            convertPathsToAbsoluteValues(arr[i].ks[j].e[0]);
                        }
                    }
                }
            }else if(arr[i].ty == 'gr'){
                completeShapes(arr[i].it);
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
        if(!(keyframes instanceof Array) || keyframes[0].t === null){
            valuesArray.push(keyframes);
            return valuesArray;
        }
        var keyData, nextKeyData;
        valuesArray = [];
        var count;
        var propertyArray = [];
        var j, jLen;
        len = keyframes.length;
        var perc,bezierData,k;
        for(i=0;i<len;i+=1){
            keyData = keyframes[i];
            keyData.t -= offsetTime;
        }
        var lastFrameIndex = 0;
        var lastPointIndex = 0;
        for(i=0;i<frameCount;i+=1){
            count = lastFrameIndex;
            var found = false;
            while(count<len-1){
                keyData = keyframes[count];
                nextKeyData = keyframes[count+1];
                if(i<keyData.t && count === 0){
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
                        perc = bez.getEasingCurve(keyData.o.x,keyData.o.y,keyData.i.x,keyData.i.y)('',i-keyData.t,0,1,nextKeyData.t-keyData.t);
                        bezierData = keyData.bezierData;
                        var distanceInLine = bezierData.segmentLength*perc;
                        var kLen, segmentPerc;
                        j = lastPointIndex;
                        while(j<bezierData.points.length){
                            if(i === 0 || distanceInLine === 0 || perc === 0){
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
                                perc = bez.getEasingCurve(outX,outY,inX,inY)('',i-keyData.t,0,1,nextKeyData.t-keyData.t);
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
            if(found === false){
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

    function getInterpolatedValue(keyframes, frameNum, offsetTime,interpolatedParams){
        var keyData, nextKeyData,propertyArray,bezierData;
        var i;
        var len;
        if(!(keyframes.length)){
            if(interpolatedParams.type == 'p'){
                matrixParams.px = keyframes;
                matrixParams.py = keyframes;
            }else if(interpolatedParams.type == 's'){
                matrixParams.sx = keyframes;
                matrixParams.sy = keyframes;
            }else if(interpolatedParams.type == 'r'){
                matrixParams.r = keyframes;
            }
            if(interpolatedParams.toArray){
                return [keyframes];
            }
            return keyframes;
        }else if(keyframes[0].t === null){
            if(interpolatedParams.type == 'p'){
                matrixParams.px = keyframes[0];
                matrixParams.py = keyframes[1];
            }else if(interpolatedParams.type == 's'){
                matrixParams.sx = keyframes[0];
                matrixParams.sy = keyframes[1];
            }else if(interpolatedParams.type == 'r'){
                matrixParams.r = keyframes[0];
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
        if(interpolatedParams.type == 'default'){
            propertyArray = [];
        }
        var fnc;
        if(keyData.to){
            bezierData = keyData.bezierData;
            if(frameNum >= nextKeyData.t-offsetTime){
                if(interpolatedParams.type == 'p'){
                    matrixParams.px = bezierData.points[bezierData.points.length - 1].point[0];
                    matrixParams.py = bezierData.points[bezierData.points.length - 1].point[1];
                }else if(interpolatedParams.type == 's'){
                    matrixParams.sx = bezierData.points[bezierData.points.length - 1].point[0];
                    matrixParams.sy = bezierData.points[bezierData.points.length - 1].point[1];
                }else if(interpolatedParams.type == 'r'){
                    matrixParams.r = bezierData.points[bezierData.points.length - 1].point[0];
                }
                return bezierData.points[bezierData.points.length - 1].point;
            }else if(frameNum < keyData.t-offsetTime){
                if(interpolatedParams.type == 'p'){
                    matrixParams.px = bezierData.points[0].point[0];
                    matrixParams.py = bezierData.points[0].point[1];
                }else if(interpolatedParams.type == 's'){
                    matrixParams.sx = bezierData.points[0].point[0];
                    matrixParams.sy = bezierData.points[0].point[1];
                }else if(interpolatedParams.type == 'r'){
                    matrixParams.r = bezierData.points[0].point[0];
                }
                return bezierData.points[0].point;
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
                if(distanceInLine === 0 || perc === 0){
                    if(interpolatedParams.type == 'p'){
                        matrixParams.px = bezierData.points[j].point[0];
                        matrixParams.py = bezierData.points[j].point[1];
                    }else if(interpolatedParams.type == 's'){
                        matrixParams.sx = bezierData.points[j].point[0];
                        matrixParams.sy = bezierData.points[j].point[1];
                    }else if(interpolatedParams.type == 'r'){
                        matrixParams.r = bezierData.points[j].point[0];
                    }else{
                        propertyArray = bezierData.points[j].point;
                    }
                    break;
                }else if(j == bezierData.points.length - 1){
                    if(interpolatedParams.type == 'p'){
                        matrixParams.px = bezierData.points[j].point[0];
                        matrixParams.py = bezierData.points[j].point[1];
                    }else if(interpolatedParams.type == 's'){
                        matrixParams.sx = bezierData.points[j].point[0];
                        matrixParams.sy = bezierData.points[j].point[1];
                    }else if(interpolatedParams.type == 'r'){
                        matrixParams.r = bezierData.points[j].point[0];
                    }else{
                        propertyArray = bezierData.points[j].point;
                    }
                    break;
                }else if(distanceInLine > addedLength && distanceInLine < addedLength + bezierData.points[j+1].partialLength){
                    segmentPerc = (distanceInLine-addedLength)/(bezierData.points[j+1].partialLength);
                    if(interpolatedParams.type == 'p'){
                        matrixParams.px = bezierData.points[j].point[0] + (bezierData.points[j+1].point[0] - bezierData.points[j].point[0])*segmentPerc;
                        matrixParams.py = bezierData.points[j].point[1] + (bezierData.points[j+1].point[1] - bezierData.points[j].point[1])*segmentPerc;
                    }else if(interpolatedParams.type == 's'){
                        matrixParams.sx = bezierData.points[j].point[0] + (bezierData.points[j+1].point[0] - bezierData.points[j].point[0])*segmentPerc;
                        matrixParams.sy = bezierData.points[j].point[1] + (bezierData.points[j+1].point[1] - bezierData.points[j].point[1])*segmentPerc;
                    }else if(interpolatedParams.type == 'r'){
                        matrixParams.r = bezierData.points[j].point[0] + (bezierData.points[j+1].point[0] - bezierData.points[j].point[0])*segmentPerc;
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
            var outX,outY,inX,inY, isArray = false;
            len = keyData.s.length;
            for(i=0;i<len;i+=1){
                if(keyData.h !== 1){
                    if(keyData.o.x instanceof Array){
                        isArray = true;
                        outX = keyData.o.x[i] ? keyData.o.x[i] : keyData.o.x[0];
                        outY = keyData.o.y[i] ? keyData.o.y[i] : keyData.o.y[0];
                        inX = keyData.i.x[i] ? keyData.i.x[i] : keyData.i.x[0];
                        inY = keyData.i.y[i] ? keyData.i.y[i] : keyData.i.y[0];
                        if(!keyData.__fnct){
                            keyData.__fnct = [];
                        }
                    }else{
                        isArray = false;
                        outX = keyData.o.x;
                        outY = keyData.o.y;
                        inX = keyData.i.x;
                        inY = keyData.i.y;
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
                    perc = fnc('',(frameNum)-(keyData.t-offsetTime),0,1,(nextKeyData.t-offsetTime)-(keyData.t-offsetTime));
                    if(frameNum >= nextKeyData.t-offsetTime){
                        perc = 1;
                    }else if(frameNum < keyData.t-offsetTime){
                        perc = 0;
                    }
                }
                if(keyData.h === 1){
                    if(interpolatedParams.type == 'p'){
                        if(i === 0){
                            matrixParams.px = keyData.s[i];
                        }else if(i == 1){
                            matrixParams.py = keyData.s[i];
                        }
                    }else if(interpolatedParams.type == 's'){
                        if(i === 0){
                            matrixParams.sx = keyData.s[i];
                        }else if(i == 1){
                            matrixParams.sy = keyData.s[i];
                        }
                    }else if(interpolatedParams.type == 'r'){
                        matrixParams.r = keyData.s[i];
                    }else{
                        propertyArray.push(keyData.s[i]);
                    }
                }else{
                    if(interpolatedParams.type == 'p'){
                        if(i === 0){
                            matrixParams.px = keyData.s[i]+(keyData.e[i]-keyData.s[i])*perc;
                        }else if(i == 1){
                            matrixParams.py = keyData.s[i]+(keyData.e[i]-keyData.s[i])*perc;
                        }
                    }else if(interpolatedParams.type == 's'){
                        if(i === 0){
                            matrixParams.sx = keyData.s[i]+(keyData.e[i]-keyData.s[i])*perc;
                        }else if(i == 1){
                            matrixParams.sy = keyData.s[i]+(keyData.e[i]-keyData.s[i])*perc;
                        }
                    }else if(interpolatedParams.type == 'r'){
                        matrixParams.r = keyData.s[i]+(keyData.e[i]-keyData.s[i])*perc;
                    }else{
                        propertyArray.push(keyData.s[i]+(keyData.e[i]-keyData.s[i])*perc);
                    }
                }
            }
        }
        return propertyArray;
    }

    function interpolateShape(shapeData, frameNum, offsetTime, renderType, isMask){
        var pathData = {};
        pathData.closed = isMask ? shapeData.cl : shapeData.closed;
        var keyframes = isMask ? shapeData.pt : shapeData.ks;
        if(keyframes.v){
            if(renderType == 'svg'){
                if(!keyframes.__pathString){
                    keyframes.__pathString = createPathString(keyframes,pathData.closed);
                }
                pathData.pathString = keyframes.__pathString;
            }else{
                pathData.pathNodes = keyframes;
            }
            return pathData;
        }else{
            shapeData = {
                i: [],
                o: [],
                v: []
            };
            var propertyArray = [];
            var j,jLen, k, kLen;
            var coordsIData,coordsOData,coordsVData;
            if(frameNum < keyframes[0].t-offsetTime){
                jLen = keyframes[0].s[0].i.length;
                for(j=0;j<jLen;j+=1){
                    coordsIData = [];
                    coordsOData = [];
                    coordsVData = [];
                    kLen = keyframes[0].s[0].i[j].length;
                    for(k=0;k<kLen;k+=1){
                        coordsIData.push(keyframes[0].s[0].i[j][k]);
                        coordsOData.push(keyframes[0].s[0].o[j][k]);
                        coordsVData.push(keyframes[0].s[0].v[j][k]);
                    }
                    shapeData.i.push(coordsIData);
                    shapeData.o.push(coordsOData);
                    shapeData.v.push(coordsVData);
                }
                propertyArray.push(shapeData);
                if(renderType == 'svg'){
                    if(!keyframes.__minValue){
                        keyframes.__minValue = createPathString(propertyArray,pathData.closed);
                    }
                    pathData.pathString = keyframes.__minValue;
                }else{
                    if(!keyframes.__minValue){
                        keyframes.__minValue = propertyArray;
                    }
                    pathData.pathNodes = keyframes.__minValue;
                }
                return pathData;
            }else if(frameNum > keyframes[keyframes.length - 1].t-offsetTime){
                var pos = keyframes.length - 2;
                jLen = keyframes[pos].s[0].i.length;
                for(j=0;j<jLen;j+=1){
                    coordsIData = [];
                    coordsOData = [];
                    coordsVData = [];
                    kLen = keyframes[pos].s[0].i[j].length;
                    for(k=0;k<kLen;k+=1){
                        coordsIData.push(keyframes[pos].e[0].i[j][k]);
                        coordsOData.push(keyframes[pos].e[0].o[j][k]);
                        coordsVData.push(keyframes[pos].e[0].v[j][k]);
                    }
                    shapeData.i.push(coordsIData);
                    shapeData.o.push(coordsOData);
                    shapeData.v.push(coordsVData);
                }
                propertyArray.push(shapeData);
                if(renderType == 'svg'){
                    if(!keyframes.__maxValue){
                        keyframes.__maxValue = createPathString(propertyArray,pathData.closed);
                    }
                    pathData.pathString = keyframes.__maxValue;
                }else{
                    if(!keyframes.__maxValue){
                        keyframes.__maxValue = propertyArray;
                    }
                    pathData.pathNodes = keyframes.__maxValue;
                }
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

                var outX,outY,inX,inY,perc;
                if(keyData.h !== 1){
                    outX = keyData.o.x;
                    outY = keyData.o.y;
                    inX = keyData.i.x;
                    inY = keyData.i.y;
                    var fnc;
                    if(keyData.__fnct){
                        fnc = keyData.__fnct;
                    }else{
                        fnc = bez.getEasingCurve(outX,outY,inX,inY);
                        keyData.__fnct = fnc;
                    }
                    perc = fnc('',(frameNum)-(keyData.t-offsetTime),0,1,(nextKeyData.t-offsetTime)-(keyData.t-offsetTime));
                    if(frameNum >= nextKeyData.t-offsetTime){
                        perc = 1;
                    }else if(frameNum < keyData.t-offsetTime){
                        perc = 0;
                    }
                }
                if(keyData.h === 1 && keyData.__hValue){
                    propertyArray.push(keyData.__hValue);
                }else{
                    shapeData = {
                        i: [],
                        o: [],
                        v: []
                    };
                    jLen = keyData.s[0].i.length;
                    for(j=0;j<jLen;j+=1){
                        coordsIData = [];
                        coordsOData = [];
                        coordsVData = [];
                        kLen = keyData.s[0].i[j].length;
                        for(k=0;k<kLen;k+=1){
                            if(keyData.h === 1){
                                coordsIData.push(keyData.s[0].i[j][k]);
                                coordsOData.push(keyData.s[0].o[j][k]);
                                coordsVData.push(keyData.s[0].v[j][k]);
                            }else{
                                coordsIData.push(keyData.s[0].i[j][k]+(keyData.e[0].i[j][k]-keyData.s[0].i[j][k])*perc);
                                coordsOData.push(keyData.s[0].o[j][k]+(keyData.e[0].o[j][k]-keyData.s[0].o[j][k])*perc);
                                coordsVData.push(keyData.s[0].v[j][k]+(keyData.e[0].v[j][k]-keyData.s[0].v[j][k])*perc);
                            }
                        }
                        shapeData.i.push(coordsIData);
                        shapeData.o.push(coordsOData);
                        shapeData.v.push(coordsVData);
                        if(keyData.h === 1){
                            keyData.__hValue = shapeData;
                        }
                        propertyArray.push(shapeData);
                    }
                }
                if(renderType == 'svg'){
                    //pathData.pathString = createPathString(propertyArray[0],pathData.closed);
                    pathData.pathNodes = propertyArray[0];
                }else{
                    pathData.pathNodes = propertyArray[0];
                }
                return pathData;
            }
        }
    }

    function createPathString(paths,closed){
        var pathV,pathO,pathI;
        var pathString = '';
        var pathData;
        var k, kLen;

        if(!(paths instanceof Array)){
            pathV = paths.v;
            pathO = paths.o;
            pathI = paths.i;
            kLen = pathV.length;
            pathString += "M"+pathV[0].join(',');
            for(k=1;k<kLen;k++){
                pathString += " C"+pathO[k-1].join(',') + " "+pathI[k].join(',') + " "+pathV[k].join(',');
            }
            if(closed !== false){
                pathString += " C"+pathO[k-1].join(',') + " "+pathI[0].join(',') + " "+pathV[0].join(',');
            }
            return pathString;
        }
        var l,lLen = paths.length;
        pathString = '';
        for(l = 0;l<lLen;l+=1){
            pathData = paths[l];
            pathV = pathData.v;
            pathO = pathData.o;
            pathI = pathData.i;
            kLen = pathV.length;
            pathString += "M"+pathV[0].join(',');
            for(k=1;k<kLen;k++){
                pathString += " C"+pathO[k-1].join(',') + " "+pathI[k].join(',') + " "+pathV[k].join(',');
            }
            if(closed !== false){
                pathString += " C"+pathO[k-1].join(',') + " "+pathI[0].join(',') + " "+pathV[0].join(',');
            }
        }
        return pathString;
    }

    var matrixParams = {
        r: 0,
        sx: 1,
        sy: 1,
        px: 1,
        py: 1
    };

    function iterateLayers(layers, frameNum,renderType){
        var dataOb;
        var maskProps;
        var timeRemapped;

        var offsettedFrameNum, i, len, renderedData;
        var j, jLen = layers.length, item;
        for(j=0;j<jLen;j+=1){
            item = layers[j];
            offsettedFrameNum = frameNum - item.startTime;
            if(item.an[offsettedFrameNum]){
                continue;
            }
            dataOb = {};
            interpolatedParams.arrayFlag = false;
            interpolatedParams.type = 'default';
            dataOb.a = getInterpolatedValue(item.ks.a,offsettedFrameNum, item.startTime,interpolatedParams);
            dataOb.o = getInterpolatedValue(item.ks.o,offsettedFrameNum, item.startTime,interpolatedParams);
            interpolatedParams.arrayFlag = false;
            interpolatedParams.type = 'p';
            getInterpolatedValue(item.ks.p,offsettedFrameNum, item.startTime,interpolatedParams);
            interpolatedParams.arrayFlag = true;
            interpolatedParams.type = 'r';
            getInterpolatedValue(item.ks.r,offsettedFrameNum, item.startTime,interpolatedParams);
            interpolatedParams.arrayFlag = true;
            interpolatedParams.type = 's';
            getInterpolatedValue(item.ks.s,offsettedFrameNum, item.startTime,interpolatedParams);
            renderedData = {};
            renderedData.an = {
                tr: dataOb
            };
            interpolatedParams.arrayFlag = false;
            interpolatedParams.type = 'default';
            if(renderType == 'canvas'){
                renderedData.an.matrixArray = matrixInstance.getMatrixArrayFromParams(matrixParams.r,matrixParams.sx,matrixParams.sy,matrixParams.px,matrixParams.py);
            }else{
                renderedData.an.matrixArray = matrixInstance.getMatrixArrayFromParams(matrixParams.r,matrixParams.sx,matrixParams.sy,matrixParams.px,matrixParams.py);
                renderedData.an.matrixValue = matrixInstance.getMatrix2FromParams(matrixParams.r,matrixParams.sx,matrixParams.sy,matrixParams.px,matrixParams.py) + 'translate('+ -dataOb.a[0]+' '+ -dataOb.a[1]+')';
            }
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
                    maskProps[i].opacity[offsettedFrameNum] = getInterpolatedValue(maskProps[i].o,offsettedFrameNum, item.startTime,interpolatedParams);
                    maskProps[i].opacity[offsettedFrameNum] = maskProps[i].opacity[offsettedFrameNum] instanceof Array ? maskProps[i].opacity[offsettedFrameNum][0]/100 : maskProps[i].opacity[offsettedFrameNum]/100;
                }
            }
            if((frameNum < item.inPoint || frameNum > item.outPoint)){
               continue;
            }
            if(item.type == 'PreCompLayer'){
                timeRemapped = item.tm ? item.tm[offsettedFrameNum] < 0 ? 0 : item.tm[offsettedFrameNum] : offsettedFrameNum;
                iterateLayers(item.layers,timeRemapped,renderType);
            }else if(item.type == 'ShapeLayer'){
                len = item.shapes.length;
                for(i=0;i<len;i+=1){
                    iterateShape(item.shapes[i],offsettedFrameNum,item.startTime,renderType);
                }
            }
        }
    }

    function iterateShape(arr,offsettedFrameNum,startTime,renderType){
        var i, len = arr.length;
        var shapeItem;
        var fillColor, fillOpacity;
        var elmPos,elmSize,elmRound;
        var strokeColor,strokeOpacity,strokeWidth;
        var trimS,trimE,trimO;
        for(i=0;i<len;i+=1){
            shapeItem = arr[i];
            if(shapeItem.ty == 'sh'){
                shapeItem.renderedData[offsettedFrameNum] = {
                    path: interpolateShape(shapeItem,offsettedFrameNum, startTime,renderType)
                };
            }else if(shapeItem.ty == 'fl'){
                fillColor = getInterpolatedValue(shapeItem.c,offsettedFrameNum, startTime,interpolatedParams);
                fillOpacity = getInterpolatedValue(shapeItem.o,offsettedFrameNum, startTime,interpolatedParams);
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
                elmPos = getInterpolatedValue(shapeItem.p,offsettedFrameNum, startTime,interpolatedParams);
                elmSize = getInterpolatedValue(shapeItem.s,offsettedFrameNum, startTime,interpolatedParams);
                elmRound = getInterpolatedValue(shapeItem.r,offsettedFrameNum, startTime,interpolatedParams);
                shapeItem.renderedData[offsettedFrameNum] = {
                    position : elmPos,
                    size : elmSize,
                    roundness : elmRound
                };
            }else if(shapeItem.ty == 'el'){
                elmPos = getInterpolatedValue(shapeItem.p,offsettedFrameNum, startTime,interpolatedParams);
                elmSize = getInterpolatedValue(shapeItem.s,offsettedFrameNum, startTime,interpolatedParams);
                shapeItem.renderedData[offsettedFrameNum] = {
                    p : elmPos,
                    size : elmSize
                };
            }else if(shapeItem.ty == 'st'){
                strokeColor = getInterpolatedValue(shapeItem.c,offsettedFrameNum, startTime,interpolatedParams);
                strokeOpacity = getInterpolatedValue(shapeItem.o,offsettedFrameNum, startTime,interpolatedParams);
                strokeWidth = getInterpolatedValue(shapeItem.w,offsettedFrameNum, startTime,interpolatedParams);
                shapeItem.renderedData[offsettedFrameNum] = {
                    opacity : strokeOpacity instanceof Array ? strokeOpacity[0] : strokeOpacity,
                    width : strokeWidth instanceof Array ? strokeWidth[0] : strokeWidth
                };
                if(renderType == 'canvas'){
                    roundColor(strokeColor);
                    shapeItem.renderedData[offsettedFrameNum].color = strokeColor;
                }else{
                    shapeItem.renderedData[offsettedFrameNum].color = rgbToHex(Math.round(strokeColor[0]),Math.round(strokeColor[1]),Math.round(strokeColor[2]));
                }
            }else if(shapeItem.ty == 'tr'){
                shapeItem.renderedData[offsettedFrameNum] = {
                    a : getInterpolatedValue(shapeItem.a,offsettedFrameNum, startTime,interpolatedParams),
                    o : getInterpolatedValue(shapeItem.o,offsettedFrameNum, startTime,interpolatedParams)
                };
                interpolatedParams.arrayFlag = true;
                interpolatedParams.type = 's';
                getInterpolatedValue(shapeItem.s,offsettedFrameNum, startTime,interpolatedParams);
                interpolatedParams.arrayFlag = true;
                interpolatedParams.type = 'r';
                getInterpolatedValue(shapeItem.r,offsettedFrameNum, startTime,interpolatedParams);
                interpolatedParams.arrayFlag = false;
                interpolatedParams.type = 'p';
                getInterpolatedValue(shapeItem.p,offsettedFrameNum, startTime,interpolatedParams);
                interpolatedParams.arrayFlag = false;
                interpolatedParams.type = 'default';
                //console.log('frameNum: ',frameNum);
                //console.log('matrixParams.sx: ',matrixParams.sx);
                //console.log('matrixParams.sy: ',matrixParams.sy);
                if(renderType == 'canvas'){
                    shapeItem.renderedData[offsettedFrameNum].mtArr = matrixInstance.getMatrixArrayFromParams(matrixParams.r,matrixParams.sx,matrixParams.sy,matrixParams.px,matrixParams.py);
                }else{
                    shapeItem.renderedData[offsettedFrameNum].mtArr = matrixInstance.getMatrixArrayFromParams(matrixParams.r,matrixParams.sx,matrixParams.sy,matrixParams.px,matrixParams.py);
                    shapeItem.renderedData[offsettedFrameNum].mt = matrixInstance.getMatrix2FromParams(matrixParams.r,matrixParams.sx,matrixParams.sy,matrixParams.px,matrixParams.py);
                }
            }else if(shapeItem.ty == 'tm'){
                trimS = getInterpolatedValue(shapeItem.s,offsettedFrameNum, startTime,interpolatedParams);
                trimE = getInterpolatedValue(shapeItem.e,offsettedFrameNum, startTime,interpolatedParams);
                trimO = getInterpolatedValue(shapeItem.o,offsettedFrameNum, startTime,interpolatedParams);
                shapeItem.renderedData[offsettedFrameNum] = {
                    s: trimS,
                    e: trimE,
                    o: trimO
                };
            }else if(shapeItem.ty == 'gr'){
                iterateShape(shapeItem.it,offsettedFrameNum,startTime,renderType);
            }
        }
    }

    function roundColor(arr){
        var i, len = arr.length;
        for(i=0;i<len ;i+=1){
            arr[i] = Math.round(arr[i]);
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

    function renderFrame(animationId,num){
        if(animations[animationId].renderedFrames[num]==2){
            if(!animations[animationId].renderFinished){
                prerenderFrames(animations[animationId],num);
            }
            return;
        }
        animations[animationId].renderedFrames[num] = 2;
        iterateLayers(animations[animationId].data.animation.layers, num, animations[animationId].data._animType);
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
            renderedFrames.push({num:i,data:renderFrame(id,i)});
        }
    }

    var moduleOb = {};
    moduleOb.completeData = completeData;
    moduleOb.renderFrame = renderFrame;
    moduleOb.renderAllFrames = renderAllFrames;

    return moduleOb;
}

var dataManager = dataFunctionManager();