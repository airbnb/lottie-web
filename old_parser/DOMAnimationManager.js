/****** INIT DOMAnimationMAnager ******/
(function(){
    var frameRate = 0;
    var totalFrames = 0;
    var firstFrame = 0;
    var currentRenderFrame = 0;
    var currentTime = 0;
    var imageCount = 0;
    var zCount = 0;
    var isRenderReady = false;
    var mainComp;
    var mainLayers = [];
    var filesDirectory;
    var callback;
    var pendingLayers = [];
    var totalLayers = 0;
    var exportedComps = [];

    function getCompositionAnimationData(compo, compositionData,fDirectory){
        exportedComps = [];
        mainComp = compo;
        frameRate = mainComp.frameRate;
        currentRenderFrame = 0;
        imageCount = 0;
        zCount = 0;
        mainLayers = [];
        totalFrames = mainComp.workAreaDuration*mainComp.frameRate;
        firstFrame = mainComp.workAreaStart*mainComp.frameRate;
        //totalFrames = 1;
        var animationOb = {};
        compositionData.animation = animationOb;
        compositionData.assets = AssetsManager.getAssetsData();
        compositionData.v = '2.0.6';
        animationOb.layers = mainLayers;
        animationOb.totalFrames = totalFrames;
        animationOb.frameRate = frameRate;
        animationOb.ff = mainComp.workAreaStart;
        animationOb.compWidth = mainComp.width;
        animationOb.compHeight = mainComp.height;
        filesDirectory = fDirectory;
        iterateComposition();
    }

    function getMaskMode (num){
        switch(num){
            case MaskMode.NONE:
                return 'n';
            case MaskMode.ADD:
                return 'a';
            case MaskMode.SUBTRACT:
                return 's';
            case MaskMode.INTERSECT:
                return 'i';
            case MaskMode.LIGHTEN:
                return 'l';
            case MaskMode.DARKEN:
                return 'd';
            case MaskMode.DIFFERENCE:
                return 'f';
        }
    }

    function addMasksToLayer(layerInfo,layerOb,time){
        layerOb.mk = [];
        var i, len = layerInfo.mask.numProperties, maskShape, maskElement;
        for(i=0;i<len;i++){
            maskElement = layerInfo.mask(i+1);
            maskShape = layerInfo.mask(i+1).property('maskShape').valueAtTime(time,false);
            layerOb.mk.push({v:extrasInstance.roundNumber(maskShape.vertices,3), i:extrasInstance.roundNumber(maskShape.inTangents,3), o:extrasInstance.roundNumber(maskShape.outTangents,3), t:extrasInstance.roundNumber(maskElement.property('Mask Opacity').valueAtTime(time,false)/100,3)});
        }
    }

    function setMasks(masks,layerOb){
        layerOb.masksProperties = [];
        var i, len = masks.numProperties, maskShape, maskElement;
        for(i=0;i<len;i++){
            maskElement = masks(i+1);
            maskShape = maskElement.property('maskShape').value;
            var shapeData = {
                cl:maskShape.closed,
                inv:maskElement.inverted,
                mode:getMaskMode(maskElement.maskMode)
            };
            extrasInstance.convertToBezierValues(maskElement.property('maskShape'), frameRate, shapeData,'pt');
            extrasInstance.convertToBezierValues(maskElement.property('Mask Opacity'), frameRate, shapeData,'o');
            layerOb.masksProperties.push(shapeData);
        }
    }

    function addStillAsset(layerOb,layerInfo){
        layerOb.assetId = AssetsManager.exportFileFromLayer(layerInfo,filesDirectory);
    }

    function removeExtraData(layersData){
        var i, len = layersData.length,j, jLen, shapes;
        for(i = 0;i<len;i++){
            var layerOb = layersData[i];
            if(layerOb.enabled == false){
                layersData.splice(i,1);
                i -= 1;
                len -= 1;
                continue;
            }
            layerOb.lastData = null ;
            delete layerOb.lastData;
            if(layerOb.type == 'ShapeLayer'){
                shapes = layerOb.shapes;
                jLen = shapes.length;
                for(j=0;j<jLen;j++){
                    shapes[j].lastData = null;
                    delete shapes[j].lastData;
                }
            }
            if(layerOb.type == 'PreCompLayer' && layerOb.layers){
                removeExtraData(layerOb.layers);
            }
            EffectsParser.saveEffectData(layerOb);
        }
    }

    function processFinalData(layersData){
        var i, len = layersData.length;
        for(i = 0;i<len;i++){
            var layerOb = layersData[i];
            if(layerOb.type == 'ShapeLayer'){
                layerOb.rectData.w = extrasInstance.roundNumber(layerOb.rectData.r - layerOb.rectData.l,3);
                layerOb.rectData.h = extrasInstance.roundNumber(layerOb.rectData.b - layerOb.rectData.t,3);
            }
            if(layerOb.type == 'PreCompLayer' && layerOb.layers){
                processFinalData(layerOb.layers);
            }
        }
    }

    function buildTextData(textDocument){
        var textDataOb = {};
        textDataOb.font = textDocument.font;
        textDataOb.fontSize = textDocument.fontSize;
        textDataOb.fillColor = extrasInstance.arrayRgbToHex(textDocument.fillColor);
        textDataOb.text = textDocument.text;
        var justification = '';
        switch(textDocument.justification){
            case ParagraphJustification.LEFT_JUSTIFY:
                justification = 'left';
                break;
            case ParagraphJustification.RIGHT_JUSTIFY:
                justification = 'right';
                break;
            case ParagraphJustification.CENTER_JUSTIFY:
                justification = 'center';
                break;
            case ParagraphJustification.FULL_JUSTIFY_LASTLINE_LEFT:
            case ParagraphJustification.FULL_JUSTIFY_LASTLINE_RIGHT:
            case ParagraphJustification.FULL_JUSTIFY_LASTLINE_CENTER:
            case ParagraphJustification.FULL_JUSTIFY_LASTLINE_FULL:
                justification = 'justify';
                break;
            default:
                justification = 'left';
                break;
        }
        textDataOb.justification = justification;
        return textDataOb;
    }

    function analyzeNextLayer(){
        if(pendingLayers.length == 0){
            renderNextFrame();
        }else{
            var pendingItem = pendingLayers.pop();
            UI.setProgress(pendingLayers.length/totalLayers);
            var layerOb = pendingItem.lOb;
            var layerInfo = pendingItem.lInfo;
            var frameRate = pendingItem.frameRate;
            var lType = extrasInstance.layerType(layerInfo);
            if(lType == 'AudioLayer' || lType == 'CameraLayer' || (layerInfo.enabled == false && !layerInfo.isTrackMatte)){
                //TODO add audios
                layerOb.enabled = false;
                extrasInstance.setTimeout(analyzeNextLayer,100);
                return;
            }else if(lType == 'TextLayer'){
                var textProp = layerInfo.property("Source Text");
                var textDocument = textProp.value;
                layerOb.textData = buildTextData(textDocument);
                var r = layerInfo.sourceRectAtTime(0, false);
                layerOb.textData.xOffset = r.left;
                layerOb.textData.yOffset = r.top;
                layerOb.textData.width = r.width;
                layerOb.textData.height = r.height;
            }

            //EffectsParser.createEffects(layerInfo,layerOb);

            if(layerInfo.mask.numProperties>0){
                setMasks(layerInfo.mask,layerOb);
                layerOb.hasMask = true;
            }
            layerOb.type = lType;
            if(lType == 'ShapeLayer'){
                ShapesParser.createShapes(layerInfo,layerOb, frameRate);
                layerOb.rectData = {l:0,t:0,b:0,r:0,w:0,h:0};
            }
            if(layerInfo.parent != null){
                layerOb.parent = layerInfo.parent.index - 1;
            }
            layerOb.layerName = layerInfo.name;
            layerOb.threeD = layerInfo.threeDLayer;
            layerOb.an = {};

            if(lType=='PreCompLayer'){
                layerOb.width = layerInfo.source.width;
                layerOb.height = layerInfo.source.height;
            }else if(lType == 'StillLayer'){
                addStillAsset(layerOb,layerInfo);
                layerOb.width = layerInfo.source.width;
                layerOb.height = layerInfo.source.height;
            }else if(lType == 'SolidLayer'){
                layerOb.width = layerInfo.source.width;
                layerOb.height = layerInfo.source.height;
                layerOb.color = extrasInstance.arrayRgbToHex(layerInfo.source.mainSource.color);
            }else if(lType == 'ShapeLayer'){
                layerOb.width = layerInfo.width;
                layerOb.height = layerInfo.height;
            }
            layerOb.inPoint = layerInfo.inPoint*frameRate;
            layerOb.outPoint = layerInfo.outPoint*frameRate;
            layerOb.startTime = layerInfo.startTime*frameRate;
            layerOb.lastData = {};

            layerOb.ks = {};
            if(layerInfo.transform.opacity.numKeys>1){
                extrasInstance.convertToBezierValues(layerInfo.transform.opacity, frameRate, layerOb.ks,'o');
            }else{
                layerOb.ks.o = extrasInstance.roundNumber(layerInfo.transform.opacity.valueAtTime(0,false),3);
            }
            if(layerInfo.transform.rotation.numKeys>1){
                extrasInstance.convertToBezierValues(layerInfo.transform.rotation, frameRate, layerOb.ks,'r');
            }else{
                layerOb.ks.r = extrasInstance.roundNumber(layerInfo.transform.rotation.valueAtTime(0,false),3);
            }
            if(layerInfo.transform.position.dimensionsSeparated){
                layerOb.ks.p = {s:true};
                extrasInstance.convertToBezierValues(layerInfo.transform['X Position'], frameRate, layerOb.ks.p,'x');
                extrasInstance.convertToBezierValues(layerInfo.transform['Y Position'], frameRate, layerOb.ks.p,'y');
            }else{
                if(layerInfo.transform.position.numKeys>1){
                    extrasInstance.convertToBezierValues(layerInfo.transform.position, frameRate, layerOb.ks,'p');
                }else{
                    layerOb.ks.p = extrasInstance.roundNumber(layerInfo.transform.position.valueAtTime(0,false),3);
                }
            }
            if(layerInfo.transform['Anchor Point'].numKeys>1){
                if(lType == 'ShapeLayer'){
                    prepareHelperSolid(layerInfo.transform['Anchor Point'],frameRate,layerOb.ks,'a');
                }else{
                    extrasInstance.convertToBezierValues(layerInfo.transform['Anchor Point'], frameRate, layerOb.ks,'a');
                }
            }else{
                layerOb.ks.a = extrasInstance.roundNumber(layerInfo.transform['Anchor Point'].valueAtTime(0,false),3);
            }
            if(layerInfo.transform['Scale'].numKeys>1){
                extrasInstance.convertToBezierValues(layerInfo.transform['Scale'], frameRate, layerOb.ks,'s');
            }else{
                layerOb.ks.s = extrasInstance.roundNumber(layerInfo.transform['Scale'].valueAtTime(0,false),3);
            }

            if(layerInfo.canSetTimeRemapEnabled && layerInfo.timeRemapEnabled){
                extrasInstance.convertToBezierValues(layerInfo['Time Remap'], frameRate, layerOb,'tm');
            }
            checkLayerReady();
        }
    }

    function checkLayerReady(){
        if(renderCancelled){
            callback.apply();
        }else{
            extrasInstance.setTimeout(analyzeNextLayer,100);
        }
    }

    function prepareHelperSolid(property,frameRate,ob,param){
        var currentKeyframe = 1;
        var helperPosition = helperSolid.transform["Anchor Point"];
        var jLen = helperPosition.numKeys;
        while(jLen > 0){
            helperPosition.removeKey(1);
            jLen -= 1;
        }
        helperSolidComp.frameRate = frameRate;
        jLen = property.numKeys;
        var keyIn, keyOut;
        var keyInHelper, keyOutHelper;
        var propertyValueDelta, helperValueDelta;

        function adjustNextHelperSpeed(){
            var j;
            for(j = 0; j<jLen; j+=1){
                keyIn = property.keyInTemporalEase(j+1)[0];
                keyOut = property.keyOutTemporalEase(j+1)[0];
                keyInHelper = new KeyframeEase(keyIn.speed, keyIn.influence);
                keyOutHelper = new KeyframeEase(keyOut.speed, keyOut.influence);
                helperPosition.addKey(property.keyTime(j+1));
                helperPosition.setValueAtTime(property.keyTime(j+1),property.valueAtTime(property.keyTime(j+1),true));
                helperPosition.setTemporalEaseAtKey(j+1, [keyInHelper], [keyOutHelper]);
            }
            correctNextKey();
        }

        function correctNextKey(){

            var i= 0, len = 20;
            if(currentKeyframe !== jLen + 1){
                keyIn = property.keyInTemporalEase(currentKeyframe)[0];
                keyOut = property.keyOutTemporalEase(currentKeyframe)[0];
                propertyValueDelta = property.valueAtTime(property.keyTime(currentKeyframe)+0.01,false);
                keyOutHelper = helperPosition.keyOutTemporalEase(currentKeyframe);
                keyInHelper = helperPosition.keyInTemporalEase(currentKeyframe);
                var flag = true;
                var currentSpeed, deltaSpeed = 10, dir = 0;
                var helpValue,helpValue2;
                 if(currentKeyframe != 1){
                     helpValue = helperPosition.valueAtTime(helperPosition.keyTime(currentKeyframe),false);
                     helpValue2 = helperPosition.valueAtTime(helperPosition.keyTime(currentKeyframe-1),false);
                    propertyValueDelta = property.valueAtTime(property.keyTime(currentKeyframe)-0.01,false);
                    helperValueDelta = helperPosition.valueAtTime(helperPosition.keyTime(currentKeyframe)-0.01,false);
                    currentSpeed = keyInHelper[0].speed;
                    deltaSpeed = Math.abs(keyInHelper[0].speed);
                    if(Math.abs(helperValueDelta[0]) > Math.abs(propertyValueDelta[0]) || Math.abs(helperValueDelta[1]) > Math.abs(propertyValueDelta[1])){
                        dir = 1;
                    }else{
                        dir = -1;
                    }
                    while(flag){
                        helpValue = helperPosition.valueAtTime(helperPosition.keyTime(currentKeyframe),false);
                        helpValue2 = helperPosition.valueAtTime(helperPosition.keyTime(currentKeyframe - 1),false);
                        helperValueDelta = helperPosition.valueAtTime(helperPosition.keyTime(currentKeyframe)-0.01,false);
                        if(Math.abs(helperValueDelta[0]-propertyValueDelta[0]) < 0.001 && Math.abs(helperValueDelta[1]-propertyValueDelta[1]) < 0.001){
                            flag = false;
                        }else{
                            if(Math.abs(helperValueDelta[0]) > Math.abs(propertyValueDelta[0]) || Math.abs(helperValueDelta[1]) > Math.abs(propertyValueDelta[1])){
                                if(dir == 1){
                                    deltaSpeed /= 2;
                                }
                                dir = -1;
                                currentSpeed += deltaSpeed;
                                keyInHelper[0].speed = currentSpeed;
                                helperPosition.setTemporalEaseAtKey(currentKeyframe, keyInHelper, keyOutHelper);
                            }else{
                                if(dir == -1){
                                    deltaSpeed /= 2;
                                }
                                dir = 1;
                                currentSpeed -= deltaSpeed;
                                keyInHelper[0].speed = currentSpeed;
                                helperPosition.setTemporalEaseAtKey(currentKeyframe, keyInHelper, keyOutHelper);
                            }
                        }
                        i += 1;
                        if(i == len){
                            keyInHelper[0].speed = keyIn.speed;
                            helperPosition.setTemporalEaseAtKey(currentKeyframe, keyInHelper, keyOutHelper);
                            flag = false;
                        }
                    }
                }
                if(currentKeyframe != jLen){
                    i = 0;
                    flag = true;
                    propertyValueDelta = property.valueAtTime(property.keyTime(currentKeyframe)+0.01,false);
                    helperValueDelta = helperPosition.valueAtTime(helperPosition.keyTime(currentKeyframe)+0.01,false);
                    helpValue = helperPosition.valueAtTime(helperPosition.keyTime(currentKeyframe),false);
                    currentSpeed = keyOutHelper[0].speed;
                    deltaSpeed = Math.abs(keyOutHelper[0].speed);
                    if(Math.abs(helperValueDelta[0]) > Math.abs(propertyValueDelta[0]) || Math.abs(helperValueDelta[1]) > Math.abs(propertyValueDelta[1])){
                        dir = -1;
                    }else{
                        dir = 1;
                    }
                    while(flag){
                        helpValue = helperPosition.valueAtTime(helperPosition.keyTime(currentKeyframe),false);
                        helperValueDelta = helperPosition.valueAtTime(helperPosition.keyTime(currentKeyframe)+0.01,false);
                        if(Math.abs(helperValueDelta[0]-propertyValueDelta[0]) < 0.001 && Math.abs(helperValueDelta[1]-propertyValueDelta[1]) < 0.001){
                            flag = false;
                        }else{
                            if(Math.abs(helperValueDelta[0]) > Math.abs(propertyValueDelta[0]) || Math.abs(helperValueDelta[1]) > Math.abs(propertyValueDelta[1]) ){
                                if(dir == -1){
                                    deltaSpeed /= 2;
                                }
                                dir = 1;
                                currentSpeed -= deltaSpeed;
                                keyOutHelper[0].speed = currentSpeed;
                                helperPosition.setTemporalEaseAtKey(currentKeyframe, keyInHelper, keyOutHelper);
                            }else{
                                if(dir == 1){
                                    deltaSpeed /= 2;
                                }
                                dir = -1;
                                currentSpeed += deltaSpeed;
                                keyOutHelper[0].speed = currentSpeed;
                                helperPosition.setTemporalEaseAtKey(currentKeyframe, keyInHelper, keyOutHelper);
                            }
                        }
                        i += 1;
                        if(i == len){
                            keyOutHelper[0].speed = keyOut.speed;
                            helperPosition.setTemporalEaseAtKey(currentKeyframe, keyInHelper, keyOutHelper);
                            flag = false;
                        }
                    }
                }
                currentKeyframe += 1;
                correctNextKey();
            }else{
                extrasInstance.convertToBezierValues(helperPosition, frameRate, ob,param);
            }
        }

        adjustNextHelperSpeed();
    }

    function createLayers(compo, layersData, frameRate){
        var i, len = compo.layers.length;
        var pendingType;
        for(i = 0;i<len;i++){
            var layerOb = {};
            layerOb.ind = i;
            var layerInfo = compo.layers[i+1];
            var lType = extrasInstance.layerType(layerInfo);
            //$.writeln('layerInfo.isTrackMatte: ',layerInfo.isTrackMatte);
            //$.writeln('layerInfo.hasTrackMatte: ',layerInfo.hasTrackMatte);
            layersData.push(layerOb);
            if(lType == 'AudioLayer' || lType == 'CameraLayer' || (layerInfo.enabled == false && !layerInfo.isTrackMatte)){
                //TODO add audios
                layerOb.enabled = false;
                continue;
            }
            if(layerInfo.hasTrackMatte){
                switch(layerInfo.trackMatteType){
                    case TrackMatteType.ALPHA:
                        pendingType = 1;
                        break;
                    case TrackMatteType.ALPHA_INVERTED:
                        pendingType = 2;
                        break;
                    case TrackMatteType.LUMA:
                        pendingType = 3;
                        break;
                    case TrackMatteType.LUMA_INVERTED :
                        pendingType = 4;
                        break;
                }
                layerOb.tt = pendingType;
            }else if(layerInfo.isTrackMatte){
                layerOb.td = 1;
            }
            pendingLayers.push({lInfo:layerInfo,lOb:layerOb,frameRate:frameRate});
            if(lType=='PreCompLayer'){
                var j = 0, jLen = exportedComps.length, isRendered = false;
                while(j<jLen){
                    if(exportedComps[j].lInfo.source == layerInfo.source){
                        isRendered = true;
                        break;
                    }
                    j+=1;
                }
                if(isRendered){
                    if(!exportedComps[j].lOb.compId){
                        exportedComps[j].lOb.compId = extrasInstance.getRandomName(7);
                    }
                    layerOb.refId = exportedComps[j].lOb.compId;
                }else{
                    layerOb.layers = [];
                    createLayers(layerInfo.source,layerOb.layers,layerInfo.source.frameRate);
                    exportedComps.push({
                        lInfo: layerInfo,
                        lOb: layerOb
                    })
                }
            }

        }
    }

    function getParentSize (name,layers){
        var i=0, len = layers.length;
        while(i<len){
            if(layers[i].layerName == name){
                return {width:layers[i].width,height:layers[i].height};
            }
            i++;
        }
        return {width:0,height:0};
    }

    function traverseAnimation(compo,layersData, frameNum, time){
        var i, len = compo.layers.length;
        for(i = 0;i<len;i++){
            var layerInfo = compo.layers[i+1];
            var lType = extrasInstance.layerType(layerInfo);
            if(lType == 'AudioLayer' || lType == 'CameraLayer' || (layerInfo.enabled == false && !layerInfo.isTrackMatte)){
                //TODO add audios
                continue;
            }
            var layerOb = layersData[i];
            var animData = {};
            if(layerOb.hasMask){
                addMasksToLayer(layerInfo,animData,time);
            }
            animData.tr = {};
            animData.tr.p = [];
            animData.tr.a = [];
            animData.tr.r = [];
            animData.tr.s = [];
            animData.tr.o = {};

            if(layerOb.parent != null){
                var parentSize = getParentSize(layerOb.parent,layersData);
                animData.tr.p[0] = extrasInstance.roundNumber(layerInfo.transform.position.valueAtTime(time,false)[0],3);
                animData.tr.p[1] = extrasInstance.roundNumber(layerInfo.transform.position.valueAtTime(time,false)[1],3);
            }else{
                animData.tr.p[0] = extrasInstance.roundNumber(layerInfo.transform.position.valueAtTime(time,false)[0],3);
                animData.tr.p[1] = extrasInstance.roundNumber(layerInfo.transform.position.valueAtTime(time,false)[1],3);
            }
            if(layerOb.threeD){
                animData.tr.p[2] = extrasInstance.roundNumber(-layerInfo.transform.position.valueAtTime(time,false)[2],3);
            }else{
                animData.tr.p[2] = -zCount;
                zCount++;
            }
            if(lType=='ShapeLayer'){
                var r = layerInfo.sourceRectAtTime(frameNum, false);
                layerOb.rectData.l = extrasInstance.roundNumber(Math.min(r.left,layerOb.rectData.l),3);
                layerOb.rectData.t = extrasInstance.roundNumber(Math.min(r.top,layerOb.rectData.t),3);
                layerOb.rectData.r = extrasInstance.roundNumber(Math.max(r.left+r.width,layerOb.rectData.r),3);
                layerOb.rectData.b = extrasInstance.roundNumber(Math.max(r.top+r.height,layerOb.rectData.b),3);
            }
            animData.tr.a[0] = extrasInstance.roundNumber(layerInfo.transform['Anchor Point'].valueAtTime(time,false)[0],3);
            animData.tr.a[1] = extrasInstance.roundNumber(layerInfo.transform['Anchor Point'].valueAtTime(time,false)[1],3);
            animData.tr.a[2] = extrasInstance.roundNumber(-layerInfo.transform['Anchor Point'].valueAtTime(time,false)[2],3);
            animData.tr.s = extrasInstance.roundNumber([(layerInfo.transform['Scale'].valueAtTime(time,false)[0]/100),(layerInfo.transform['Scale'].valueAtTime(time,false)[1]/100),(layerInfo.transform['Scale'].valueAtTime(time,false)[2]/100)],3);
            if(layerOb.threeD){
                animData.tr.r[0] = extrasInstance.roundNumber((layerInfo.transform['X Rotation'].valueAtTime(time,false)+layerInfo.transform['Orientation'].valueAtTime(time,false)[0])*Math.PI/180,3);
                animData.tr.r[1] = extrasInstance.roundNumber(-(layerInfo.transform['Y Rotation'].valueAtTime(time,false)+layerInfo.transform['Orientation'].valueAtTime(time,false)[1])*Math.PI/180,3);
                animData.tr.r[2] = extrasInstance.roundNumber((layerInfo.transform['Rotation'].valueAtTime(time,false)+layerInfo.transform['Orientation'].valueAtTime(time,false)[2])*Math.PI/180,3);
            }else{
                animData.tr.r[0] = 0;
                animData.tr.r[1] = 0;
                animData.tr.r[2] = extrasInstance.roundNumber(layerInfo.transform['Rotation'].valueAtTime(time,false)*Math.PI/180,3);
            }
            animData.tr.o = extrasInstance.roundNumber(layerInfo.transform['Opacity'].valueAtTime(time,false)/100,3);
            if(lType == 'ShapeLayer'){
                ShapesParser.addFrameData(layerInfo,layerOb, frameNum, time);
            }
            if(lType == 'PreCompLayer'){
                var compoInTime = -layerInfo.startTime;
                traverseAnimation(layerInfo.source,layerOb.layers, frameNum, time+compoInTime);
            }
            //THIS IS REPLACED WITH THE KEYFRAMES. LEAVE THIS FOR NOW.
            /*if(layerOb.lastData.an == null || extrasInstance.compareObjects(animData,layerOb.lastData.an)==false){
             layerOb.an[frameNum] = animData;
             layerOb.lastData.an = animData;
             }*/
            EffectsParser.renderFrame(layerOb,frameNum);
        }
    }

    function iterateComposition(){
        createLayers(mainComp, mainLayers, mainComp.frameRate);
        // TO TRAVERSE LAYER BY LAYER. NEEDED FOR TIME REMAP?
        /*renderCompo(mainComp, mainLayers);
         AssetsManager.createAssetsDataForExport();
         removeExtraData(mainLayers);
         processFinalData(mainLayers);
         callback.apply();*/
        // END TO TRAVERSE LAYER BY LAYER. NEEDED FOR TIME REMAP?
        totalLayers = pendingLayers.length;
        extrasInstance.setTimeout(analyzeNextLayer,100);
    }

    function iterateLayer(layerInfo, layerOb,frameRate){
        var duration =layerInfo.duration;
        layerOb.st = layerInfo.startTime;
        var frameNum = 0;
        var time = layerInfo.startTime;

        var lType = extrasInstance.layerType(layerInfo);
        if(lType == 'AudioLayer' || lType == 'CameraLayer' || (layerInfo.enabled == false && !layerInfo.isTrackMatte)){
            //TODO add audios
            return;
        }
        while(frameNum < duration*frameRate){
            var layerOb = layersData[i];
            var animData = {};
            if(layerOb.hasMask){
                addMasksToLayer(layerInfo,animData,time);
            }
            animData.tr = {};
            animData.tr.p = [];
            animData.tr.a = [];
            animData.tr.r = [];
            animData.tr.s = [];
            animData.tr.o = {};

            if(layerOb.parent != null){
                var parentSize = getParentSize(layerOb.parent,layersData);
                animData.tr.p[0] = extrasInstance.roundNumber(layerInfo.transform.position.valueAtTime(time,false)[0],3);
                animData.tr.p[1] = extrasInstance.roundNumber(layerInfo.transform.position.valueAtTime(time,false)[1],3);
            }else{
                animData.tr.p[0] = extrasInstance.roundNumber(layerInfo.transform.position.valueAtTime(time,false)[0],3);
                animData.tr.p[1] = extrasInstance.roundNumber(layerInfo.transform.position.valueAtTime(time,false)[1],3);
            }
            if(layerOb.threeD){
                animData.tr.p[2] = extrasInstance.roundNumber(-layerInfo.transform.position.valueAtTime(time,false)[2],3);
            }else{
                animData.tr.p[2] = -zCount;
                zCount++;
            }
            if(lType=='ShapeLayer'){
                var r = layerInfo.sourceRectAtTime(frameNum, false);
                layerOb.rectData.l = extrasInstance.roundNumber(Math.min(r.left,layerOb.rectData.l),3);
                layerOb.rectData.t = extrasInstance.roundNumber(Math.min(r.top,layerOb.rectData.t),3);
                layerOb.rectData.r = extrasInstance.roundNumber(Math.max(r.left+r.width,layerOb.rectData.r),3);
                layerOb.rectData.b = extrasInstance.roundNumber(Math.max(r.top+r.height,layerOb.rectData.b),3);
            }
            animData.tr.a[0] = extrasInstance.roundNumber(layerInfo.transform['Anchor Point'].valueAtTime(time,false)[0],3);
            animData.tr.a[1] = extrasInstance.roundNumber(layerInfo.transform['Anchor Point'].valueAtTime(time,false)[1],3);
            animData.tr.a[2] = extrasInstance.roundNumber(-layerInfo.transform['Anchor Point'].valueAtTime(time,false)[2],3);
            animData.tr.s = extrasInstance.roundNumber([(layerInfo.transform['Scale'].valueAtTime(time,false)[0]/100),(layerInfo.transform['Scale'].valueAtTime(time,false)[1]/100),(layerInfo.transform['Scale'].valueAtTime(time,false)[2]/100)],3);
            if(layerOb.threeD){
                animData.tr.r[0] = extrasInstance.roundNumber((layerInfo.transform['X Rotation'].valueAtTime(time,false)+layerInfo.transform['Orientation'].valueAtTime(time,false)[0])*Math.PI/180,3);
                animData.tr.r[1] = extrasInstance.roundNumber(-(layerInfo.transform['Y Rotation'].valueAtTime(time,false)+layerInfo.transform['Orientation'].valueAtTime(time,false)[1])*Math.PI/180,3);
                animData.tr.r[2] = extrasInstance.roundNumber((layerInfo.transform['Rotation'].valueAtTime(time,false)+layerInfo.transform['Orientation'].valueAtTime(time,false)[2])*Math.PI/180,3);
            }else{
                animData.tr.r[0] = 0;
                animData.tr.r[1] = 0;
                animData.tr.r[2] = extrasInstance.roundNumber(layerInfo.transform['Rotation'].valueAtTime(time,false)*Math.PI/180,3);
            }
            animData.tr.o = extrasInstance.roundNumber(layerInfo.transform['Opacity'].valueAtTime(time,false)/100,3);
            if(lType == 'ShapeLayer'){
                ShapesParser.addFrameData(layerInfo,layerOb, frameNum, time);
            }
            //THIS IS REPLACED WITH THE KEYFRAMES. BUT SHOULD BE USED FOR EXPRESSION LAYERS.
            if(layerOb.lastData.an == null || extrasInstance.compareObjects(animData,layerOb.lastData.an)==false){
                layerOb.an[frameNum] = animData;
                layerOb.lastData.an = animData;
            }
            //END FOR EXPRESSION LAYERS

            EffectsParser.renderFrame(layerOb,frameNum);
            frameNum += 1;
            time += 1/frameRate;
        }



        //traverseAnimation(layerInfo.source,layerOb.layers, frameNum, time+compoInTime);
        if(lType == 'PreCompLayer'){
            var i, len = layerInfo.source.layers.length;
            for(i = 0;i<len;i++){
                iterateLayer(layerInfo.source.layers[i+1],layerOb.layers[i],layerInfo.source.frameRate);
            }
        }
    }

    function renderCompo(compo, mainLayers){
        //var duration = compo.duration;
        var i, len = compo.layers.length;
        for(i = 0;i<len;i++){
            iterateLayer(compo.layers[i+1],mainLayers[i],compo.frameRate);
        }
    }

    function renderNextFrame(){
        /*if(currentRenderFrame < totalFrames && renderCancelled === false){
            renderFrame();
            currentRenderFrame +=1;
            renderNextFrame();
            //extrasInstance.setTimeout(renderNextFrame,50);
        }else{
            isRenderReady = true;
            checkRenderReady();
        }*/
        isRenderReady = true;
        checkRenderReady();
    }

    function checkRenderReady(){
        if(AsyncManager.getAsyncCounter() == 0 && isRenderReady == true){
            AssetsManager.createAssetsDataForExport();
            removeExtraData(mainLayers);
            processFinalData(mainLayers);
            callback.apply();
        }
    }

    function renderFrame(){
        currentTime = (currentRenderFrame+firstFrame)/frameRate;
        zCount = 0;
        traverseAnimation(mainComp,mainLayers, currentRenderFrame,currentTime);
    }

    function setCallback(cb){
        callback = cb;
    }

    AsyncManager.setCallBack(checkRenderReady);

    var ob = {};
        ob.getCompositionAnimationData = getCompositionAnimationData;
        ob.setCallback = setCallback;

    DOMAnimationManager = ob;
}());
/****** END DOMAnimationMAnager ******/