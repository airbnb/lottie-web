/****** INIT CompConverter ******/
(function(){
    var isExportDirectoryCreated = false;
    var directoryCreationFailed = false;
    var compositionsList;
    var currentCompositionData;
    var filesDirectory;
    var mainProject = app.project;
    var scriptPath = ((File($.fileName)).path);
    var mainComp;
    var endCallback;

    var compositionData = {};

    function saveData(){
        if(!renderCancelled){
            var dataFile = new File(exportFolder.fullName+'/data.json');
            dataFile.open('w','TEXT','????');
            var string = JSON.stringify(compositionData);
            string = string.replace(/\n/g,'')  ;
            dataFile.write(string); //DO NOT ERASE, JSON UNFORMATTED
            //dataFile.write(JSON.stringify(compositionData, null, '  ')); //DO NOT ERASE, JSON FORMATTED
            dataFile.close();
        }
        currentCompositionData.rendered = true;
        searchNextComposition();
    }

    function layersConverted(duplicateMainComp){
        DOMAnimationManager.setCallback(saveData);
        //FOR DOM
        DOMAnimationManager.getCompositionAnimationData(duplicateMainComp,compositionData,filesDirectory);
    }

    function animationSaved(){
        saveData();
    }

    function directoryRemoved(){
        filesDirectory = new Folder(exportFolder.fullName+'/files');
        if(filesDirectory.create()){
            isExportDirectoryCreated = true;
        }
    }

    function createExportDirectory(){
        exportFolder = new Folder(currentCompositionData.destination+'/'+currentCompositionData.comp.name+'/');
        filesDirectory = new Folder(exportFolder.fullName+'/files');
        if(filesDirectory.exists){
            isExportDirectoryCreated = true;
        }else{
            if(filesDirectory.create()){
                isExportDirectoryCreated = true;
            }else{
                directoryCreationFailed = true;
            }
        }
    }

    function waitForDirectoryCreated(){
        if(isExportDirectoryCreated){
            start();
        }else if(directoryCreationFailed){
            alert(UITextsData.alertMessages.directoryCreationFailed);
        }else{
            $.sleep(100);
            waitForDirectoryCreated();
        }
    }

    function searchHelperRenderer(helperComp){
        var i=0,len = app.project.renderQueue.items.length;
        var item;
        while(i<len){
            item =  app.project.renderQueue.items[i+1];
            if(item.comp == helperComp){
                return item;
            }
            i++;
        }
    }

    function start(){
        UI.setExportText('Starting export');
        LayerConverter.convertComposition(mainComp);
    }

    function exportNextComposition(){
        isExportDirectoryCreated = false;
        directoryCreationFailed = false;
        mainComp = currentCompositionData.comp;
        createExportDirectory();
        waitForDirectoryCreated();
    }

    function searchNextComposition(){
        if(!renderCancelled){
            var len = compositionsList.length;
            var i = 0;
            while(i < len){
                if(compositionsList[i].queued === true && compositionsList[i].rendered == false){
                    currentCompositionData = compositionsList[i];
                    exportNextComposition();
                    return;
                }
                i+=1;
            }
        }
        //If it gets here there are no more compositions to render and callback is executed
        helperFootage.remove();
        endCallback.apply();
    }

    function renderCompositions(list){
        var helperFile = new File(scriptPath+'/helperProject.aep');
        var helperImportOptions = new ImportOptions();
        helperImportOptions.file = helperFile;
        helperFootage = mainProject.importFile(helperImportOptions);
        var i=0, len = helperFootage.items.length;
        var helperFolder;
        while(i<len){
            if(extrasInstance.getprojectItemType(helperFootage.item(i+1)) == 'Folder'){
                helperFolder = helperFootage.item(i+1);
                break;
            }
            i += 1;
        }
        i = 0;
        len = helperFolder.items.length;
        while(i<len){
            if(helperFolder.item(i+1).name == 'helperSolidComp'){
                helperSolidComp = helperFolder.item(i+1);
            }
            i += 1;
        }
        helperSolid = helperSolidComp.layer(1);
        var helperPosition = helperSolid.transform["Anchor Point"];
        helperPosition.expression = "valueAtTime(time)";

        rqManager.setProject(app.project);
        LayerConverter.setCallback(layersConverted);
        compositionsList = list;
        len = compositionsList.length;
        for(i=0;i<len;i+=1){
            compositionsList[i].rendered = false;
        }
        searchNextComposition();
    }

    function setFinishCallback(cb){
        endCallback = cb;
    }

    var ob = {};
    ob.renderCompositions = renderCompositions;
    ob.setFinishCallback = setFinishCallback;

    CompConverter = ob;
}());
/****** END CompConverter ******/