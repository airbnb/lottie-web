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
            }else if(curLayer.isTrackMatte){
                return "TrackMatteLayer";
            }else if(curLayer.adjustmentLayer){
                return "AdjustmentLayer";
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
            function getRealInfluence(property,handle,time,diff,keyNum, keyOb){
                function iterateNextInfluence(){
                    referenceValue = getPropertyValue(property.valueAtTime(time+diff, false), false);
                    if(extrasInstance.compareObjects(originalValue,referenceValue) ==  true){
                        if(currentInfluence == 0.1){
                            loop = false;
                        }
                        topInfluence = currentInfluence;
                        currentInfluence -= (currentInfluence - lastInfluence)/2;
                        if(currentInfluence < 0.1){
                            currentInfluence = 0.1;
                        }
                        if(topInfluence - currentInfluence < 0.0001){
                            loop = false;
                        }
                    }else{
                        lastInfluence = currentInfluence;
                        currentInfluence += (topInfluence-currentInfluence)/2;
                        if(currentInfluence - lastInfluence< 0.0001){
                            loop = false;
                        }
                    }
                    if(originalInfluence - currentInfluence < 0.0001){
                        loop = false;
                    }
                    count +=1;
                    if(count >= 20){
                        loop = false;
                    }
                    if( loop == true){
                        if(handle == 'out'){
                            keyNew = new KeyframeEase(keyOut[0].speed,currentInfluence);
                            property.setTemporalEaseAtKey(keyNum, [keyIn[0]], [keyNew]);
                        }else{
                            keyNew = new KeyframeEase(keyIn[0].speed,currentInfluence);
                            property.setTemporalEaseAtKey(keyNum, [keyNew], [keyOut[0]]);
                        }
                        iterateNextInfluence();
                    }else{
                        if(handle == 'out'){
                            keyNew = new KeyframeEase(keyOut[0].speed,originalInfluence);
                            property.setTemporalEaseAtKey(keyNum, [keyIn[0]], [keyNew]);
                        }else{
                            keyNew = new KeyframeEase(keyIn[0].speed,originalInfluence);
                            property.setTemporalEaseAtKey(keyNum, [keyNew], [keyOut[0]]);
                        }
                        keyOb.influence = currentInfluence;
                        influenceReadyCount -= 1;
                        realInfluenceReady();
                    }
                }
                var count = 0;
                var referenceValue;
                var lastInfluence = 0;
                var originalValue = getPropertyValue(property.valueAtTime(time+diff, false), false);
                var keyIn = property.keyInTemporalEase(keyNum);
                var keyOut = property.keyOutTemporalEase(keyNum);
                var keyNew, originalInfluence;
                if(handle == 'out'){
                    originalInfluence = keyOut[0].influence;
                }else{
                    originalInfluence = keyIn[0].influence;
                }
                if(originalInfluence<0.1){
                    keyOb.influence = originalInfluence;
                    influenceReadyCount -= 1;
                    realInfluenceReady();
                    return;
                }
                if(handle == 'out'){
                    //keyOut[0]= new KeyframeEase(keyOut[0].speed,originalInfluence);
                    keyNew = new KeyframeEase(keyOut[0].speed,originalInfluence);
                    property.setTemporalEaseAtKey(keyNum, [keyIn[0]], [keyNew]);
                }else{
                    //keyIn[0] = new KeyframeEase(keyIn[0].speed,originalInfluence);
                    keyNew = new KeyframeEase(keyIn[0].speed,originalInfluence);
                    property.setTemporalEaseAtKey(keyNum, [keyNew], [keyOut[0]]);
                }
                var topInfluence = originalInfluence;
                var currentInfluence = originalInfluence/2;
                //AsyncManager.addAsyncCounter();
                originalValue = getPropertyValue(property.valueAtTime(time+diff, false), false);
                if(handle == 'out'){
                    keyNew= new KeyframeEase(keyOut[0].speed,currentInfluence);
                    property.setTemporalEaseAtKey(keyNum, [keyIn[0]], [keyNew]);
                }else{
                    keyNew = new KeyframeEase(keyIn[0].speed,currentInfluence);
                    property.setTemporalEaseAtKey(keyNum, [keyNew], [keyOut[0]]);
                }
                var loop = true;
                while(loop){
                    referenceValue = getPropertyValue(property.valueAtTime(time+diff, false), false);
                    if(extrasInstance.compareObjects(originalValue,referenceValue) ==  true){
                        if(currentInfluence == 0.1){
                            loop = false;
                        }
                        topInfluence = currentInfluence;
                        currentInfluence -= (currentInfluence - lastInfluence)/2;
                        if(currentInfluence < 0.1){
                            currentInfluence = 0.1;
                        }
                        if(topInfluence - currentInfluence < 0.0001){
                            loop = false;
                        }
                    }else{
                        lastInfluence = currentInfluence;
                        currentInfluence += (topInfluence-currentInfluence)/2;
                        if(currentInfluence - lastInfluence< 0.0001){
                            loop = false;
                        }
                    }
                    if(originalInfluence - currentInfluence < 0.0001){
                        loop = false;
                    }
                    count +=1;
                    if(count >= 20){
                        loop = false;
                    }
                    if(handle == 'out'){
                        keyNew = new KeyframeEase(keyOut[0].speed,currentInfluence);
                        property.setTemporalEaseAtKey(keyNum, [keyIn[0]], [keyNew]);
                    }else{
                        keyNew = new KeyframeEase(keyIn[0].speed,currentInfluence);
                        property.setTemporalEaseAtKey(keyNum, [keyNew], [keyOut[0]]);
                    }
                }
                if(handle == 'out'){
                    keyNew = new KeyframeEase(keyOut[0].speed,originalInfluence);
                    property.setTemporalEaseAtKey(keyNum, [keyIn[0]], [keyNew]);
                }else{
                    keyNew = new KeyframeEase(keyIn[0].speed,originalInfluence);
                    property.setTemporalEaseAtKey(keyNum, [keyNew], [keyOut[0]]);
                }
                keyOb.influence = currentInfluence;
                influenceReadyCount -= 1;
                realInfluenceReady();

                /*AsyncManager.addAsyncCall(function(){
                    originalValue = getPropertyValue(property.valueAtTime(time+diff, false), false);
                    if(handle == 'out'){
                        keyNew= new KeyframeEase(keyOut[0].speed,currentInfluence);
                        property.setTemporalEaseAtKey(keyNum, [keyIn[0]], [keyNew]);
                    }else{
                        keyNew = new KeyframeEase(keyIn[0].speed,currentInfluence);
                        property.setTemporalEaseAtKey(keyNum, [keyNew], [keyOut[0]]);
                    }
                    AsyncManager.addAsyncCall(iterateNextInfluence,1);
                },1);*/
            }

            function getCurveLength(initPos,endPos, outBezier, inBezier){
                var k, curveSegments = 5000;
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

            function realInfluenceReady(){
                if(influenceReadyCount != 0){
                    getRealInfluence(property,'out',lastKey.time,0.01/frameRate,indexTime,lastKey.easeOut);
                    return;
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
                switch(property.propertyValueType){
                    case PropertyValueType.ThreeD_SPATIAL:
                    case PropertyValueType.TwoD_SPATIAL:
                        bezierIn.x = 1 - key.easeIn.influence / 100;
                        bezierOut.x = lastKey.easeOut.influence / 100;
                        averageSpeed = getCurveLength(lastKey.value,key.value, lastKey.to, key.ti)/duration;
                        break;
                    case PropertyValueType.SHAPE:
                        bezierIn.x = 1 - key.easeIn.influence / 100;
                        bezierOut.x = lastKey.easeOut.influence / 100;
                        averageSpeed = 1;
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
                                bezierIn.y =  1 - ((key.easeIn.speed) / averageSpeed) * (key.easeIn.influence / 100);
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
                if(property.propertyValueType == PropertyValueType.ThreeD_SPATIAL || property.propertyValueType == PropertyValueType.TwoD_SPATIAL || property.propertyValueType == PropertyValueType.SHAPE ){
                    property.expression = propertyExpression;
                }
                /*bezierIn.x = extrasInstance.roundNumber(bezierIn.x,3);
                bezierIn.y = extrasInstance.roundNumber(bezierIn.y,3);
                bezierOut.x = extrasInstance.roundNumber(bezierOut.x,3);
                bezierOut.y = extrasInstance.roundNumber(bezierOut.y,3);*/
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

            var i, len;
            var influenceReadyCount = 0;
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
                realInfluenceReady();
            }else{
                if(property.keyOutInterpolationType(indexTime) == KeyframeInterpolationType.LINEAR){
                    interpolationType = 'linear';
                }
                buildKeyInfluence(key, lastKey, indexTime);
                switch(property.propertyValueType){
                    case PropertyValueType.ThreeD_SPATIAL:
                    case PropertyValueType.TwoD_SPATIAL:
                        lastKey.to = property.keyOutSpatialTangent(indexTime);
                        key.ti = property.keyInSpatialTangent(indexTime+1);
                    case PropertyValueType.SHAPE:
                        influenceReadyCount = 2;
                        var propertyExpression = property.expression;
                        property.expression = "velocityAtTime(time)";
                        if(interpolationType != 'linear'){
                            getRealInfluence(property,'in',key.time,-0.01/frameRate,indexTime+1,key.easeIn);
                        }else{
                            influenceReadyCount = 0;
                            realInfluenceReady();
                        }
                        break;
                    default:
                        realInfluenceReady();
                }
            }
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