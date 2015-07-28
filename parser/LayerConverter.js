/****** INIT LayerConverter ******/
(function(){
    var pendingComps = [];
    var convertedSources = [];
    var duplicatedSources = [];
    var helperFolder;
    var currentLayerNum = 0;
    var currentCompositionNum = 0;
    var totalLayers;
    var tempConverterComp;
    var currentComposition;
    var currentSource;
    var currentLayerInfo;
    var duplicateMainComp;
    var callback;
    function convertComposition(comp){
        var i=0, len = helperFootage.items.length;
        while(i<len){
            if(extrasInstance.getprojectItemType(helperFootage.item(i+1)) == 'Folder'){
                helperFolder = helperFootage.item(i+1);
                break;
            }
            i += 1;
        }
        AssetsManager.reset();
        duplicateMainComp = comp.duplicate();
        //duplicateMainComp.openInViewer() ;
        duplicateMainComp.parentFolder = helperFolder;
        currentLayerNum = 0;
        currentCompositionNum = 0;
        pendingComps = [];
        convertedSources = [];
        duplicatedSources = [];
        pendingComps.push(duplicateMainComp);
        if(pendingComps.length == 1){
            extrasInstance.setTimeout(iterateNextComposition,100);
        }
    };

    function iterateNextComposition(){
        UI.setExportText('Searching next comp');
        if(currentCompositionNum == pendingComps.length){
            UI.setExportText('Done');
            //TODO dar acceso externo a main comp
            //TODO despachar evento de fin
            callback.apply(null,[duplicateMainComp]);
            return;
        }
        currentComposition = pendingComps[currentCompositionNum];
        currentLayerNum = 0;
        totalLayers = currentComposition.layers.length;
        extrasInstance.setTimeout(verifyNextItem,100);
    }

    function verifyNextItem(){
        if(currentLayerNum<totalLayers){
            var layerInfo = currentComposition.layers[currentLayerNum+1];
            UI.setExportText('Verifying item: ' + currentLayerNum + ' from '+ layerInfo.name);
            var lType = extrasInstance.layerType(layerInfo);
            if(lType == 'StillLayer' && layerInfo.enabled){
                currentSource = layerInfo.source;
                var convertedSource = searchConvertedSource(currentSource);
                if(convertedSource==null){
                    currentLayerInfo = layerInfo;
                    tempConverterComp = app.project.items.addComp('tempConverterComp',Math.max(4,currentSource.width),Math.max(4,currentSource.height),1,1,1);
                    tempConverterComp.layers.add(currentSource);
                    rqManager.addComposition(tempConverterComp);
                    waitForRenderDone();
                }else{
                    AssetsManager.associateLayerToSource(layerInfo,currentSource);
                    //replaceCurrentLayerSource(convertedSource); //NOT REPLACING FOOTAGE. NOT SURE IF NEEDED.
                    currentLayerNum++;
                    extrasInstance.setTimeout(verifyNextItem,100);
                }
            }else{
                if(lType=='PreCompLayer'){
                    var copy = searchCompositionDuplicate(layerInfo);
                    layerInfo.replaceSource(copy, false);
                    pendingComps.push(copy);
                    copy.parentFolder = helperFolder;
                }
                currentLayerNum++;
                extrasInstance.setTimeout(verifyNextItem,100);
            }
        }else{
            currentCompositionNum++;
            extrasInstance.setTimeout(iterateNextComposition,100);
        }
    }

    function searchCompositionDuplicate(layerInfo){
        var i=0,len = duplicatedSources.length;
        while(i<len){
            if(duplicatedSources[i].s == layerInfo.source){
                return duplicatedSources[i].c;
            }
            i++;
        }
        var copy = layerInfo.source.duplicate();
        UI.setExportText('Duplicating: '+layerInfo.name);
        //copy.openInViewer() ;
        duplicatedSources.push({s:layerInfo.source,c:copy});
        return copy;
    }

    function searchConvertedSource(source){
        var i = 0, len = convertedSources.length;
        while(i<len){
            if(source == convertedSources[i].c){
                return convertedSources[i].r;
            }
            i++;
        }
        return null;
    }

    function waitForRenderDone(){
        if(checkRender()){
            replaceCurrentLayer();
            currentLayerNum++;
            extrasInstance.setTimeout(verifyNextItem,100);
        }else{
            extrasInstance.setTimeout(waitForRenderDone,100);
        }
    }

    function checkRender(){
        if(rqManager.getStatus() == RQItemStatus.DONE){
            return true;
        }
        return false;
    }

    function replaceCurrentLayerSource(source){
        var layerInfo = currentComposition.layers[currentLayerNum+1];
        layerInfo.replaceSource(source, false);
    }

    function replaceCurrentLayer(){
        var myFile = rqManager.getFile();
        var myImportOptions = new ImportOptions();
        myImportOptions.file = myFile;
        var myFootage =app.project.importFile(myImportOptions);
        myFootage.parentFolder = helperFolder;
        convertedSources.push({c:currentSource,r:myFootage});
        AssetsManager.createLayerSource(myFile,currentLayerInfo,currentSource);
        //currentLayerInfo.replaceSource(myFootage, false); //NOT REPLACING FOOTAGE. NOT SURE IF NEEDED.
        if(tempConverterComp!=null){
            tempConverterComp.remove();
        }
    }

    function setCallback(cb){
        callback = cb;
    }

    var ob = {};
    ob.convertComposition = convertComposition;
    ob.setCallback = setCallback;

    LayerConverter = ob;
}());
/****** END LayerConverter ******/