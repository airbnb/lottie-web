(function(){
    var rqCollection;
    var proj = null;

    var queueItem;
    var moduleItem;
    var destinationFile;
    var counter = 0;
    var templateName = 'HTML_bodyMoving_template';
    var filesDirectory;
    function addComposition(comp){
        filesDirectory = new Folder(exportFolder.fullName+'/temp');
        if(!filesDirectory.exists){
            filesDirectory.create();
        }
        unqueueAllItems();
        queueItem = rqCollection.add(comp);
        queueItem.render = true;
        moduleItem = queueItem.outputModule(1);
        moduleItem.applyTemplate(templateName);
        destinationFile = new File(filesDirectory.fullName+'/'+'tempFile_'+counter+'.png');
        moduleItem.file = destinationFile;
        proj.renderQueue.render();
        counter++;
    }

    function importHelperProject(){
        var i=0, len = helperFootage.items.length;
        var helperComp;
        while(i<len){
            if(extrasInstance.getprojectItemType(helperFootage.item(i+1)) == 'Comp'){
                helperComp = helperFootage.item(i+1);
                break;
            }
            i += 1;
        }
        var renderer = searchHelperRenderer(helperComp);
        var helperModule = renderer.outputModule(1);
        var templates = helperModule.templates;
        i = 0;
        len = templates.length;
        var found = false;
        while(i<len){
            if(templates[i] === templateName){
                found = true;
                break;
            }
            i+=1;
        }
        if(found === false){
            helperModule.saveAsTemplate(templateName);
        }
        renderer.remove();
    }

    function searchHelperRenderer(helperComp){
        var i=0,len = proj.renderQueue.items.length;
        var item;
        while(i<len){
            item =  proj.renderQueue.items[i+1];
            if(item.comp == helperComp){
                return item;
            }
            i++;
        }
    }

    function unqueueAllItems(){
        var item;
        var i,len = proj.renderQueue.items.length;
        for(i=0;i<len;i++){
            item =  proj.renderQueue.items[i+1];
            if(verifyIfRenderable(item.status)){
                proj.renderQueue.items[i+1].render = false;
            }
        }
    }

    function verifyIfRenderable(status){
        switch(status){
            case RQItemStatus.USER_STOPPED:
            case RQItemStatus.ERR_STOPPED:
            case RQItemStatus.DONE:
            case RQItemStatus.RENDERING:
                return false;
        }
        return true;
    }

    function getStatus(){
        var status = queueItem.status;
        if(status==RQItemStatus.DONE){
            queueItem.remove();
            renameFile();
        }
        return status;
    }

    function renameFile(){
        if(destinationFile.exists){
            if(destinationFile.remove()){
                var renamingFile = new File(destinationFile.fullName+'00000');
                renamingFile.rename(destinationFile.name);
            }else{
                //TODO handle error when removing file
            }
        }else{
            var renamingFile = new File(destinationFile.fullName+'00000');
            renamingFile.rename(destinationFile.name);
        }
    }

    function getFile(){
        return destinationFile;
    }

    function setProject(project){
        if(proj == null){
             proj = project;
            rqCollection = project.renderQueue.items;
            importHelperProject();
        }
    }

    var ob = {};
    ob.addComposition = addComposition;
    ob.getStatus = getStatus;
    ob.getFile = getFile;
    ob.setProject = setProject;

    rqManager = ob;
}());
/****** END rqManager ******/