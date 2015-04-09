/****** INIT CompConverter ******/
(function(){
    var isExportDirectoryCreated = false;
    var directoryCreationFailed = false;
    var currentExportingComposition = 0;
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
            dataFile.write(JSON.stringify(compositionData)); //DO NOT ERASE, JSON UNFORMATTED
            //dataFile.write(JSON.stringify(compositionData, null, '  ')); //DO NOT ERASE, JSON FORMATTED
            dataFile.close();
        }
        currentExportingComposition+=1;
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
        mainComp = compositionsList[currentExportingComposition].comp;
        createExportDirectory();
        waitForDirectoryCreated();
    }

    function searchNextComposition(){
        if(!renderCancelled){
            var len = compositionsList.length;
            while(currentExportingComposition < len){
                if(compositionsList[currentExportingComposition].queued === true){
                    currentCompositionData = compositionsList[currentExportingComposition];
                    exportNextComposition();
                    return;
                }
                currentExportingComposition+=1;
            }
        }
        //If it gets here there are no more compositions to render and callback is executed
        //helperSolid.remove();
        helperFootage.remove();
        endCallback.apply();
    }

    function renderCompositions(list){
        var helperFile = new File(scriptPath+'/helperProject.aep');
        var helperImportOptions = new ImportOptions();
        helperImportOptions.file = helperFile;
        helperFootage = mainProject.importFile(helperImportOptions);
        var helperFolder = helperFootage.item(2);
        var helperComp = helperFootage.item(1);
        //helperSolid = helperComp.layers.addSolid([1.0,1.0,0], "helperSolid", 10, 10, 1);
        //helperSolid = helperComp.layers.addNull(2);
        //helperSolid.layerInfo.transform['Anchor Point']
        //helperSolid.transform['Anchor Point'].expression = "velocityAtTime(time)";
        //helperSolid.parentFolder = helperFolder;

        rqManager.setProject(app.project);
        LayerConverter.setCallback(layersConverted);
        currentExportingComposition = 0;
        compositionsList = list;
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