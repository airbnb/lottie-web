/****** INIT extras******/
(function (){
    function getItemByName(name,collection){
        for(var i=0;i<collection.length;i++){
            if(collection[i+1].name==name){
                return collection[i+1];
            }
        }
        return null;
    }

    function compareObjects(object1,object2){
        return JSON.stringify(object1) === JSON.stringify(object2);
    }

    function roundNumber(num, decimals){
        if( typeof num == 'number'){
            return parseFloat(num.toFixed(decimals));
        }else{
            return roundArray(num,decimals);
        }
    }

    function roundArray(arr, decimals){
        var i, len = arr.length;
        var retArray = [];
        for( i = 0; i < len ; i += 1){
            if( typeof arr[i] == 'number'){
                retArray.push(roundNumber(arr[i],decimals));
            }else{
                retArray.push(roundArray(arr[i],decimals));
            }
        }
        return retArray;
    }

    function setInterval(func,millis){
        var guid = getRandomName(10);
        Gtlym.CALL["interval_"+guid] = func;
        return app.scheduleTask('Gtlym.CALL["interval_'+guid+'"]();',millis,true);
    }

    function setTimeout(func,millis){
        var guid = getRandomName(10);
        Gtlym.CALL["interval_"+guid] = func;
        return app.scheduleTask('Gtlym.CALL["interval_'+guid+'"]();',millis,false);
    }

    function cancelTimeout(id){
        app.cancelTask(id);
    }

    function cancelInterval(id){
        app.cancelTask(id);
    }

    function removeDirectoryContent(f, callback){
        var removeNextItem = function(){
            currentFileIndex++;
            if(currentFileIndex == len){
                callback.apply();
            }else{
                removeFileFromDisk(files[currentFileIndex],removeNextItem);
            }
        };
        var files = f.getFiles();
        var len = files.length;
        var currentFileIndex = 0;
        if(len==0){
            callback.apply();
        }else{
            removeFileFromDisk(files[currentFileIndex],removeNextItem);
        }
    }

    function removeFileFromDisk(f, cb){
        var callback = cb;
        var currentFileIndex =0;
        var removeNextItem = function(){
            currentFileIndex++;
            if(currentFileIndex >= len){
                if(f.remove()){
                    callback.apply();
                }else{
                }
            }else{
                removeFileFromDisk(files[currentFileIndex],removeNextItem);
            }
        };
        if (f instanceof File){
            if(f.remove()){
                callback.apply();
            }else{
            }
        }else{
            var files = f.getFiles();
            var len = files.length;
            if(len==0){
                removeNextItem();
            }else{
                removeFileFromDisk(files[currentFileIndex],removeNextItem);
            }
        }
    }

    function getRandomName(length){
        var sequence = 'abcdefghijklmnoqrstuvwxyz1234567890';
        var returnString ='';
        for(var	i=0;i<length;i++){
            returnString += sequence.charAt(Math.floor(Math.random()*sequence.length));
        }
        return returnString;
    }

    function iterateProperty(property, space){
        if(space === null || space === undefined){
            space = 0;
        }
        var spaceString ='';
        for(var a=0;a<space;a++){
            spaceString+='     ';
        }
        if(property.numProperties){
            $.writeln(spaceString+'--- new iteration '+property.name+' ---');
            var i=0, len = property.numProperties;
            while(i<len){
                $.writeln(spaceString+'-> '+property(i+1).name +" | "+property(i+1).matchName );
                iterateProperty(property(i+1), space+1);
                i++;
            }
        }else{
            if(property.propertyValueType != PropertyValueType.NO_VALUE && property.value != undefined){
                $.writeln(spaceString+'--- Value:'+property.value.toString()+' ---');
            }else{
                $.writeln(spaceString+'--- No Value:'+' ---');
            }
        }
    }

    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function arrayRgbToHex(values) {
        return rgbToHex(Math.round(values[0]*255),Math.round(values[1]*255),Math.round(values[2]*255));
    }

    function layerType(layerOb){
        function avLayerType(lObj){
            var lSource = lObj.source;
            if(lSource instanceof CompItem){
                return "PreCompLayer";
            }
            var lMainSource = lSource.mainSource;
            var lFile = lMainSource.file;
            if(!lObj.hasVideo){
                return "AudioLayer";
            }else if(lSource instanceof CompItem){
                return "PreCompLayer";
            }else if(lSource.frameDuration < 1){
                if(lMainSource instanceof PlaceholderSource){
                    return "PlaceholderVideoLayer";
                }else if(lSource.name.toString().indexOf("].") != -1){
                    return "ImageSequenceLayer";
                }else{
                    return "VideoLayer";
                }
            }else if(lSource.frameDuration == 1){
                if(lMainSource instanceof PlaceholderSource){
                    return "PlaceholderStillLayer";
                }else if(lMainSource.color){
                    return "SolidLayer";
                }else{
                    return "StillLayer";
                }
            }
        }
        try{
            var curLayer,instanceOfArray,instanceOfArrayLength,result;
            curLayer = layerOb;
            instanceOfArray = [AVLayer, CameraLayer, LightLayer, ShapeLayer, TextLayer];
            instanceOfArrayLength = instanceOfArray.length;
            if(curLayer.guideLayer){
                return "GuideLayer";
            }else if(curLayer.adjustmentLayer){
                return "AdjustmentLayer";
            }else if (curLayer.nullLayer)
            {
                return "NullLayer";
            }
            for(var i = 0;i<instanceOfArrayLength;i++){
                if(curLayer instanceof instanceOfArray[i]){
                    result = instanceOfArray[i].name;
                    break;
                }
            }
            if(result == "AVLayer"){
                result = avLayerType(curLayer);
            };
            return result;
        }catch(err){alert(err.line.toString+" "+err.toString())}
    }

    function getprojectItemType(item){
        var getType = {};
        var type = getType.toString.call(item);
        var itemType = '';
        switch(type){
            case "[object FolderItem]":
                itemType = 'Folder';
                break;
            case "[object FootageItem]":
                itemType = 'Footage';
                break;
            case "[object CompItem]":
                itemType = 'Comp';
                break;
            default:
                itemType = type;
                break;

        }
        return itemType;
    }

    function convertToBezierValues(property, frameRate, ob,propertyName){
        function getPropertyValue(value, roundFlag){
            switch(property.propertyValueType){
                case PropertyValueType.SHAPE:
                    var elem = {
                        i : roundFlag ? extrasInstance.roundNumber(value.inTangents,3) :  value.inTangents,
                        o : roundFlag ? extrasInstance.roundNumber(value.outTangents,3) : value.outTangents,
                        v : roundFlag ? extrasInstance.roundNumber(value.vertices,3) : value.vertices
                    };
                    return elem;
                case PropertyValueType.COLOR:
                    var i, len = value.length;
                    for(i = 0; i < len; i+=1){
                        value[i] = Math.round(value[i]*255);
                    }
                    return value;
                default:
                    return roundFlag ? extrasInstance.roundNumber(value,3) :  value;
            }
        }

        var j = 1, jLen = property.numKeys;
        var beziersArray = [];
        var averageSpeed, duration;
        var bezierIn, bezierOut;
        function buildSegment(segmentOb, indexTime){
i
            function getCurveLength(initPos,endPos, outBezier, inBezier){
                var k, curveSegments = 200;
                var point,lastPoint = null;
                var ptDistance;
                var absToCoord,absTiCoord;
                var triCoord1,triCoord2,triCoord3,liCoord1,liCoord2,ptCoord,perc,addedLength = 0;
                for(k=0;k<curveSegments;k+=1){
                    point = [];
                    perc = k/(curveSegments-1);
                    ptDistance = 0;
                    absToCoord = [];
                    absTiCoord = [];
                    outBezier.forEach(function(item,index){
                        if(absToCoord[index] == null){
                            absToCoord[index] = initPos[index] + outBezier[index];
                            absTiCoord[index] = endPos[index] + inBezier[index];
                        }
                        triCoord1 = initPos[index] + (absToCoord[index] - initPos[index])*perc;
                        triCoord2 = absToCoord[index] + (absTiCoord[index] - absToCoord[index])*perc;
                        triCoord3 = absTiCoord[index] + (endPos[index] - absTiCoord[index])*perc;
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
                    lastPoint = point;
                }
                return addedLength;
            }

            var i, len;
            var key = {};
            var lastKey = {};
            var interpolationType = '';
            key.time = property.keyTime(indexTime+1);
            lastKey.time = property.keyTime(indexTime);
            key.value = getPropertyValue(property.keyValue(indexTime+1), false);
            lastKey.value = getPropertyValue(property.keyValue(indexTime), false);
            if(!(key.value instanceof Array)){
                key.value = [key.value];
                lastKey.value = [lastKey.value];
            }
            if(property.keyOutInterpolationType(indexTime) == KeyframeInterpolationType.HOLD){
                interpolationType = 'hold';
            }else{
                if(property.keyOutInterpolationType(indexTime) == KeyframeInterpolationType.LINEAR && property.keyInInterpolationType(indexTime + 1) == KeyframeInterpolationType.LINEAR){
                    interpolationType = 'linear';
                }
                buildKeyInfluence(key, lastKey, indexTime);
                switch(property.propertyValueType){
                    case PropertyValueType.ThreeD_SPATIAL:
                    case PropertyValueType.TwoD_SPATIAL:
                        lastKey.to = property.keyOutSpatialTangent(indexTime);
                        key.ti = property.keyInSpatialTangent(indexTime+1);
                        break;
                }
            }
            if(interpolationType == 'hold'){
                segmentOb.t = extrasInstance.roundNumber(lastKey.time*frameRate,3);
                segmentOb.s = getPropertyValue(property.keyValue(j), true);
                if(!(segmentOb.s instanceof Array)){
                    segmentOb.s = [segmentOb.s];
                }
                segmentOb.h = 1;
                j += 1;
                buildNextSegment();
                return;
            }
            duration = key.time - lastKey.time;
            len = key.value.length;
            bezierIn = {};
            bezierOut = {};
            averageSpeed = 0;
            var infOut,infIn;
            switch(property.propertyValueType){
                case PropertyValueType.ThreeD_SPATIAL:
                case PropertyValueType.TwoD_SPATIAL:
                    var curveLength = getCurveLength(lastKey.value,key.value, lastKey.to, key.ti);
                    averageSpeed = curveLength/duration;
                    if(curveLength === 0){
                        infOut = lastKey.easeOut.influence;
                        infIn = key.easeIn.influence;
                    }else{
                        infOut = Math.min(100*curveLength/(lastKey.easeOut.speed*duration), lastKey.easeOut.influence);
                        infIn = Math.min(100*curveLength/(key.easeIn.speed*duration), key.easeIn.influence);
                    }
                    bezierIn.x = 1 - infIn / 100;
                    bezierOut.x = infOut / 100;
                    break;
                case PropertyValueType.SHAPE:
                    averageSpeed = 1;
                    infOut = Math.min(100/lastKey.easeOut.speed, lastKey.easeOut.influence);
                    infIn = Math.min(100/key.easeIn.speed, key.easeIn.influence);
                    bezierIn.x = 1 - infIn / 100;
                    bezierOut.x = infOut / 100;
                    break;
                case PropertyValueType.ThreeD:
                case PropertyValueType.TwoD:
                case PropertyValueType.OneD:
                case PropertyValueType.COLOR:
                    bezierIn.x = [];
                    bezierOut.x = [];
                    key.easeIn.forEach(function(item, index){
                        bezierIn.x[index] = 1 - item.influence / 100;
                        bezierOut.x[index] = lastKey.easeOut[index].influence / 100;

                    });
                    averageSpeed = [];
                    for(i=0;i<len;i+=1){
                        averageSpeed[i] =  (key.value[i] - lastKey.value[i])/duration;
                    }
                    break;
            }
            if(averageSpeed == 0){
                bezierIn.y = bezierIn.x;
                bezierOut.y = bezierOut.x;
            }else{
                switch(property.propertyValueType){
                    case PropertyValueType.ThreeD_SPATIAL:
                    case PropertyValueType.TwoD_SPATIAL:
                    case PropertyValueType.SHAPE:
                        if(interpolationType == 'linear'){
                            bezierIn.y = bezierIn.x;
                            bezierOut.y = bezierOut.x;
                        }else{
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
                        key.easeIn.forEach(function(item,index){
                            if(averageSpeed[index] == 0 || interpolationType == 'linear'){
                                bezierIn.y[index] = bezierIn.x[index];
                                bezierOut.y[index] = bezierOut.x[index];
                            }else{
                                bezierIn.y[index] = 1 - ((item.speed) / averageSpeed[index]) * (item.influence / 100);
                                bezierOut.y[index] = ((lastKey.easeOut[index].speed) / averageSpeed[index]) * bezierOut.x[index];
                            }
                        });
                        break;
                }
            }

            bezierIn.x = extrasInstance.roundNumber(bezierIn.x,3);
            bezierIn.y = extrasInstance.roundNumber(bezierIn.y,3);
            bezierOut.x = extrasInstance.roundNumber(bezierOut.x,3);
            bezierOut.y = extrasInstance.roundNumber(bezierOut.y,3);
            segmentOb.i = bezierIn;
            segmentOb.o = bezierOut;
            segmentOb.n = (bezierIn.x.toString()+'_'+bezierIn.y.toString()+'_'+bezierOut.x.toString()+'_'+bezierOut.y.toString()).replace(/\./g, 'p');
            segmentOb.t = extrasInstance.roundNumber(lastKey.time*frameRate,3);
            segmentOb.s = getPropertyValue(property.keyValue(j), true);
            segmentOb.e = getPropertyValue(property.keyValue(j+1), true);
            if(!(segmentOb.s instanceof Array)){
                segmentOb.s = [segmentOb.s];
                segmentOb.e = [segmentOb.e];
            }
            if(property.propertyValueType == PropertyValueType.ThreeD_SPATIAL || property.propertyValueType == PropertyValueType.TwoD_SPATIAL ){
                segmentOb.to = lastKey.to;
                segmentOb.ti = key.ti;
            }
            j += 1;
            buildNextSegment();
        }

        if(property.numKeys <= 1){
            //beziersArray.push(getPropertyValue(property.valueAtTime(0,true), true));
            ob[propertyName] = getPropertyValue(property.valueAtTime(0,true), true);
            return;
        }

        function buildKeyInfluence(key,lastKey, indexTime){
            switch(property.propertyValueType){
                case PropertyValueType.ThreeD_SPATIAL:
                case PropertyValueType.TwoD_SPATIAL:
                case PropertyValueType.SHAPE:
                    key.easeIn = {
                        influence : property.keyInTemporalEase(indexTime+1)[0].influence,
                        speed : property.keyInTemporalEase(indexTime+1)[0].speed
                    };
                    lastKey.easeOut = {
                        influence : property.keyOutTemporalEase(indexTime)[0].influence,
                        speed : property.keyOutTemporalEase(indexTime)[0].speed
                    };
                    break;
                default:
                    key.easeIn = [];
                    lastKey.easeOut = [];
                    var inEase = property.keyInTemporalEase(indexTime+1);
                    var outEase = property.keyOutTemporalEase(indexTime);
                    inEase.forEach(function(item,index){
                        key.easeIn.push({influence : item.influence, speed:item.speed});
                        lastKey.easeOut.push({influence : outEase[index].influence, speed:outEase[index].speed});
                    });
            }
        }

        function buildNextSegment(){
            if(j<jLen){
                var segmentOb = {};
                beziersArray.push(segmentOb);
                buildSegment(segmentOb,j);
            }
        }
        buildNextSegment();
        beziersArray.push({t:property.keyTime(j)*frameRate});
        ob[propertyName] = beziersArray;
    }

    var ob = {};
    ob.getItemByName = getItemByName;
    ob.compareObjects = compareObjects;
    ob.roundNumber = roundNumber;
    ob.roundArray = roundArray;
    ob.setInterval = setInterval;
    ob.setTimeout = setTimeout;
    ob.cancelTimeout = cancelTimeout;
    ob.cancelInterval = cancelInterval;
    ob.removeDirectoryContent = removeDirectoryContent;
    ob.removeFileFromDisk = removeFileFromDisk;
    ob.getRandomName = getRandomName;
    ob.iterateProperty = iterateProperty;
    ob.rgbToHex = rgbToHex;
    ob.arrayRgbToHex = arrayRgbToHex;
    ob.layerType = layerType;
    ob.getprojectItemType = getprojectItemType;
    ob.convertToBezierValues = convertToBezierValues;

    extrasInstance = ob;

}());