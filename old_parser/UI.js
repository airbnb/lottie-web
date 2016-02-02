(function(){
    var UITextsData = {
        generalButtons : {render:'Render'},
        alertMessages : {
            noComps:'You don\'t have compositions to render',
            directoryCreationFailed:'Error trying to create directory'
        },
        tabs : {comps:'Compositions',images:'Images'},
        compsButtons : {add:'Add to render queue',remove:'Remove from render queue',destination:'Destination Folder',refresh:'Refresh'},
        compsColumns : {name:'Name',queue:'In Queue',destination:'Destination Path'},
        imagesButtons : {refresh:'Refresh', exportTxt:'Export', notExportTxt:'Do not export'},
        imagesColumns : {name:'Name',exportTxt:'Export'},
        renderTexts : {cancel:'Cancel Render'}
    }
    var availableCompositions = [];
    var bodyMovinPanel;
    var settingsGroup;
    var renderGroup;
    var compsList;
    var imagesList;
    var compTab;
    var imagesTab;
    var compsSelectionButton;
    var compsDestinationButton;
    var imagesCompsDropDown;
    var toggleImagesExportButton;
    var isPanelFocused = false;
    var ignoreEvent = true;



    function myScript_buildUI(thisObj){
        bodyMovinPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Body Movin Exporter", undefined, {resizeable:true});
        ////bodyMovinPanel.addEventListener('focus', panelFocusHandler, true);
        bodyMovinPanel.onActivate = panelFocusHandler;
        ////bodyMovinPanel.addEventListener('blur', panelBlurHandler, true);
        bodyMovinPanel.onDeactivate = panelBlurHandler;
        ////bodyMovinPanel.addEventListener('close',closePanel);
        bodyMovinPanel.onClose = closePanel;

        /****  WINDOW VIEW *****/

        var mainGroupRes = "group{orientation:'stack',alignment:['fill','fill'],alignChildren:['fill',fill']}";
        bodyMovinPanel.mainGroup = bodyMovinPanel.add(mainGroupRes);

        /**** SETTINGS GROUP ****/
        var settingsGroupRes = "group{orientation:'column',alignment:['fill','fill'],alignChildren:['fill',fill'],\
            myTabbedPanel: Panel{type:'tabbedpanel', text:'',alignment:['fill','fill'],alignChildren:['fill',fill'],\
               compTab: Panel{type:'tab', text:'"+UITextsData.tabs.comps+"',orientation:'columns',\
               },\
               imagesTab: Panel{type:'tab', text: '"+UITextsData.tabs.images+"',\
               },\
            },\
            generalButtonsGroup: Group{orientation:'row',alignment:['fill','bottom'],alignChildren:['fill',fill'],\
                renderButton: Button{text:'"+UITextsData.generalButtons.render+"',alignment:['right','bottom']},\
            }\
         }";
        settingsGroup = bodyMovinPanel.mainGroup.add(settingsGroupRes);
        ////settingsGroup.myTabbedPanel.addEventListener('change',tabChangedHandler);
        settingsGroup.myTabbedPanel.onChange = tabChangedHandler;
        ////settingsGroup.generalButtonsGroup.renderButton.addEventListener('click', startRender);
        settingsGroup.generalButtonsGroup.renderButton.onClick = startRender;
        /**** COMPOSITION TAB  VIEW *****/
        var compGroup = "Group{orientation:'column',alignment:['fill','fill'],alignChildren:['fill',fill'],\
            buttonGroup: Group{orientation:'row',alignment:['fill','top'],alignChildren:['left',top'],\
                compsSelectionButton: Button{text:'"+UITextsData.compsButtons.remove+"'},\
                compsDestinationButton: Button{text:'"+UITextsData.compsButtons.destination+"'},\
                compsRefreshButton: Button{text:'"+UITextsData.compsButtons.refresh+"',alignment:['right','top']},\
            }\
            list: ListBox{text:'Components List',alignment:['fill','fill'],alignChildren:['fill',fill'],\
            properties:{numberOfColumns: 3,multiselect:true, showHeaders: true,columnTitles: ['"+UITextsData.compsColumns.name+"', '"+UITextsData.compsColumns.queue+"','"+UITextsData.compsColumns.destination+"']}\
            }\
        }";
        settingsGroup.myTabbedPanel.compTab.compGroup = settingsGroup.myTabbedPanel.compTab.add(compGroup);
        compsList = settingsGroup.myTabbedPanel.compTab.compGroup.list;
        compsSelectionButton = settingsGroup.myTabbedPanel.compTab.compGroup.buttonGroup.compsSelectionButton;
        compsDestinationButton = settingsGroup.myTabbedPanel.compTab.compGroup.buttonGroup.compsDestinationButton;
        ////compsSelectionButton.addEventListener('click',compRenderButtonClickHandler);
        compsSelectionButton.onClick = compRenderButtonClickHandler;
        ////compsDestinationButton.addEventListener('click',compDestinationButtonClickHandler);
        compsDestinationButton.onClick = compDestinationButtonClickHandler;
        ////settingsGroup.myTabbedPanel.compTab.compGroup.buttonGroup.compsRefreshButton.addEventListener('click',compRefreshButtonClickHandler);
        settingsGroup.myTabbedPanel.compTab.compGroup.buttonGroup.compsRefreshButton.onClick = compRefreshButtonClickHandler;
        compsSelectionButton.hide();
        compsDestinationButton.hide();
        ////compsList.addEventListener('change',listChangeHandler);
        compsList.onChange = listChangeHandler;
        /**** IMAGES TAB  VIEW *****/
        var imagesGroup = "Group{orientation:'column',alignment:['fill','fill'],alignChildren:['fill',fill'],\
            optionsGroup: Group{orientation:'row',alignment:['fill','top'],alignChildren:['left',top'],\
                whichCompo : DropDownList { alignment:'left',properties: {items: ['Dummy text']} }, \
                toggleExportButton: Button{text:'"+UITextsData.imagesButtons.notExportTxt+"',alignment:['right','top']},\
                refreshButton: Button{text:'"+UITextsData.imagesButtons.refresh+"',alignment:['right','top']},\
            }\
            list: ListBox{text:'Images List',alignment:['fill','fill'],alignChildren:['fill',fill'],\
            properties:{numberOfColumns: 2,multiselect:true, showHeaders: true,columnTitles: ['"+UITextsData.imagesColumns.name+"', '"+UITextsData.imagesColumns.exportTxt+"']}\
            }\
        }";
        settingsGroup.myTabbedPanel.imagesTab.imagesGroup = settingsGroup.myTabbedPanel.imagesTab.add(imagesGroup);
        imagesCompsDropDown = settingsGroup.myTabbedPanel.imagesTab.imagesGroup.optionsGroup.whichCompo;
        toggleImagesExportButton = settingsGroup.myTabbedPanel.imagesTab.imagesGroup.optionsGroup.toggleExportButton;
        toggleImagesExportButton.hide();
        //toggleImagesExportButton.addEventListener('click',toggleExportImagesHandler);
        imagesList = settingsGroup.myTabbedPanel.imagesTab.imagesGroup.list;
        //imagesList.addEventListener('change',imagesListChangeHandler);
        //imagesCompsDropDown.addEventListener('change',imagesCompsDDChangeHandler);
        //settingsGroup.myTabbedPanel.imagesTab.imagesGroup.optionsGroup.refreshButton.addEventListener('click',imagesRefreshButtonClickHandler);

        /**** RENDER GROUP ****/
        var renderGroupRes = "group{orientation:'column',alignment:['fill','fill'],alignChildren:['fill',fill'],\
            componentText:StaticText{text:'Rendering Composition ',alignment:['left','top']},\
            infoText:StaticText{text:'Exporting images ',alignment:['fill','top']},\
            progress:Progressbar{value:50,alignment:['fill','top']},\
            cancelButton: Button{text:'"+UITextsData.renderTexts.cancel+"',alignment:['center','top']},\
         }";
        bodyMovinPanel.mainGroup.renderGroup = bodyMovinPanel.mainGroup.add(renderGroupRes);
        renderGroup = bodyMovinPanel.mainGroup.renderGroup;
        ////renderGroup.cancelButton.addEventListener('click',cancelRender);
        renderGroup.cancelButton.onClick = cancelRender;
        renderGroup.hide();

        bodyMovinPanel.layout.layout(true);
        settingsGroup.minimumSize = settingsGroup.size;

        bodyMovinPanel.onResizing = bodyMovinPanel.onResize = function () { this.layout.resize(); }
        //panelManager.setPanel(bodyMovinPanel);

        settingsGroup.myTabbedPanel.imagesTab.enabled = false;

        settingsGroup.myTabbedPanel.imagesTab.hide();

        return bodyMovinPanel;
    }

    function closePanel(){
        bodyMovinPanel.removeEventListener('focus', panelFocusHandler);
        bodyMovinPanel.removeEventListener('blur', panelBlurHandler);
        bodyMovinPanel.removeEventListener('close',closePanel);
        settingsGroup.myTabbedPanel.removeEventListener('change',tabChangedHandler);
        settingsGroup.generalButtonsGroup.renderButton.removeEventListener('click', startRender);
        compsSelectionButton.removeEventListener('click',compRenderButtonClickHandler);
        compsDestinationButton.removeEventListener('click',compDestinationButtonClickHandler);
        compsList.removeEventListener('change',listChangeHandler);
        //toggleImagesExportButton.removeEventListener('click',toggleExportImagesHandler);
        //imagesList.removeEventListener('change',imagesListChangeHandler);
        //imagesCompsDropDown.removeEventListener('change',imagesCompsDDChangeHandler);
        //settingsGroup.myTabbedPanel.imagesTab.imagesGroup.optionsGroup.refreshButton.removeEventListener('click',imagesRefreshButtonClickHandler);
        renderGroup.cancelButton.removeEventListener('click',cancelRender);
        settingsGroup.myTabbedPanel.compTab.compGroup.buttonGroup.compsRefreshButton.removeEventListener('click',compRefreshButtonClickHandler);
        bodyMovinPanel.onResizing = bodyMovinPanel.onResize = null;
    }

    function panelFocusHandler(ev){
        if(app.project === null || app.project === undefined){
            return;
        }
        if(isPanelFocused === true){
            return;
        }
        isPanelFocused = true;
        tabChangedHandler(null); //Uncomment this por production
    }

    function panelBlurHandler(ev){
        if(isPanelFocused === false){
            return;
        }
        isPanelFocused = false;
    }

    function setProgress(value){
        renderGroup.progress.value = (1 - value)*100;
        renderGroup.infoText.text = ((1 - value)*100).toFixed(2) + '%';
    }

    function cancelRender(){
        renderCancelled = true;
        renderFinished();
    }

    function renderFinished(){
        renderGroup.hide();
        settingsGroup.show();
        //app.endUndoGroup();
    }

    function startRender(){
        renderCancelled = false;
        var foundComps = false,i=0, len = availableCompositions.length;
        while(i<len){
            if(availableCompositions[i].queued){
                foundComps = true;
                getCompositionImages(availableCompositions[i]);
            }
            i+=1;
        }
        if(foundComps === false){
            alert(UITextsData.alertMessages.noComps);
            return;
        }
        //TODO handle full undo
        //app.beginUndoGroup("Undo Render");
        renderGroup.show();
        settingsGroup.hide();
        CompConverter.setFinishCallback(renderFinished);
        CompConverter.renderCompositions(availableCompositions);
    }

    function getCompositionImages(compositionData){
        if(compositionData.exportableImages === null || compositionData.exportableImages === undefined){
            compositionData.exportableImages = [];
        }
        addImagesFromComposition(compositionData.comp,compositionData.exportableImages);
    }

    function addImagesFromComposition(compo,imagesList){
        var i, len = compo.layers.length;
        for(i = 0;i<len;i+=1){
            var layerInfo = compo.layers[i+1];
            var lType = extrasInstance.layerType(layerInfo);
            if(lType == 'StillLayer'){
                addLayerToImagesList(layerInfo,imagesList);
            }else if(lType == 'PreCompLayer'){
                addImagesFromComposition(layerInfo.source,imagesList);
            }
        }
    }

    function addLayerToImagesList(layer,list){
        var i = 0, len = list.length, existingItem= null;
        while(i<len){
            if(list[i].item === layer){
                existingItem = list.splice(i,1)[0];
                break;
            }
            i+=1;
        }
        var listItem;
        if(existingItem === null){
            listItem = {item: layer, exportable: true, uiItem: null};
        }else{
            listItem = {item:layer, exportable:existingItem.exportable,uiItem:null}
        }
        list.push(listItem);
    }

    function tabChangedHandler(ev){
        if(!settingsGroup || !settingsGroup.myTabbedPanel || !settingsGroup.myTabbedPanel.selection){
            return;
        }
        if(ev !== null && ev.target !== settingsGroup.myTabbedPanel){
            return;
        }
        switch(settingsGroup.myTabbedPanel.selection.text){
            case UITextsData.tabs.comps:
                updateCompositionsTab();
                break;
            case UITextsData.tabs.images:
                //updateImagesTab();
                break;
        }
    }

    function compRefreshButtonClickHandler(ev){
        updateCompositionsTab();
    }

    function compDestinationButtonClickHandler(ev){
        var f = new Folder();
        var outputFolder = f.selectDlg();
        if(outputFolder !== null){
            var selection = compsList.selection;
            var i, len = selection.length;
            var j, jLen = availableCompositions.length;
            for(i=0;i<len;i++){
                selection[i].subItems[1].text = outputFolder.absoluteURI;
                j = 0;
                while(j<jLen){
                    if(availableCompositions[j].item === selection[i]){
                        availableCompositions[j].destination = outputFolder.absoluteURI;
                        break;
                    }
                    j++;
                }
            }
            updateCompView();
        }
    }

    function compRenderButtonClickHandler(ev){
        updateCompositionsTab();
        var sendToQueue;
        if(compsSelectionButton.text === UITextsData.compsButtons.add){
            sendToQueue = true;
        }else{
            sendToQueue = false;
        }
        var selection = compsList.selection;
        var i, len = selection.length;
        var j, jLen = availableCompositions.length;
        for(i=0;i<len;i++){
            j = 0;
            while(j<jLen){
                if(availableCompositions[j].item === selection[i]){
                    availableCompositions[j].queued = sendToQueue;
                    break;
                }
                j++;
            }
        }
        listChangeHandler();
    }

    function searchRemovedElements(){
        compsList.selection = null;
        compsList.removeAll();
        var i=0, len = availableCompositions.length;
        while(i<len){
            if(!isValid(availableCompositions[i].comp)){
                availableCompositions.splice(i,1);
                i-=1;
                len-=1;
            }else{
                if(!isValid(availableCompositions[i].imageDdItem)){
                    delete availableCompositions[i].imageDdItem;
                }
            }
            i+=1;
        }
        i = 0;
        var j, jLen, images;
        while(i<len){
            if(availableCompositions[i].exportableImages){
                images = availableCompositions[i].exportableImages;
                jLen = images.length;
                j = 0;
                while(j<jLen){
                    if(!isValid(images[j].item)){
                        images.splice(j,1);
                        j-=1;
                        jLen-=1;
                    }
                    j+=1;
                }
            }
            i+=1;
        }
    }

    function updateCompositionsTab(){
        ignoreEvent = true;
        searchRemovedElements();
        var project = app.project;

        var i,numItems = project.numItems;
        var count = 0;
        for(i=0;i<numItems;i+=1){
            if(extrasInstance.getprojectItemType(project.item(i+1))=='Comp'){
                addCompositionToList(project.item(i+1), count);
                count+=1;
            };
        }
        var numComps = availableCompositions.length;
        for(i=0;i<numComps;i++){
            availableCompositions[i].item = compsList.add('item',availableCompositions[i].comp.name);
            if(availableCompositions[i].selected){
                availableCompositions[i].item.selected = true;
            }
        }
        updateCompView();
        ignoreEvent = false;
    }

    function addCompositionToList(item,pos){
        var i=0, len = availableCompositions.length, compItem = null;
        while(i<len){
            if(availableCompositions[i].comp === item){
                compItem = availableCompositions[i];
                availableCompositions.splice(i,1);
                break;
            }
            i++;
        }
        if(compItem === null){
            //app.project.file.path
            compItem = {comp:item, queued:false, selected:false, destination: Folder.myDocuments.absoluteURI};
        }
        availableCompositions.splice(pos,0,compItem);
    }

    function listChangeHandler(ev){
        if(ignoreEvent){
            return;
        }
        var selection = compsList.selection;
        if(selection===null){
            compsSelectionButton.hide();
            compsDestinationButton.hide();
            return;
        }
        availableCompositions.forEach(function(compData){
            compData.selected = false;
        });
        compsSelectionButton.show();
        var i, len = selection.length;
        var j, jLen = availableCompositions.length;
        var areQueued = true;
        selection.forEach(function(selectionItem){
            j = 0;
            while(j<jLen){
                if(availableCompositions[j].item === selectionItem){
                    availableCompositions[j].selected = true;
                    if(availableCompositions[j].queued == false){
                        areQueued = false;
                    }
                    break;
                }
                j++;
            }
        });
        for(i=0;i<len;i++){
            j = 0;
            while(j<jLen){
                if(availableCompositions[j].item === selection[i]){
                    if(availableCompositions[j].queued == false){
                        areQueued = false;
                    }
                    break;
                }
                j++;
            }
        }
        if(areQueued === false){
            compsDestinationButton.hide();
            compsSelectionButton.text = UITextsData.compsButtons.add;
        }else{
            compsDestinationButton.show();
            compsSelectionButton.text = UITextsData.compsButtons.remove;
        }
        updateCompView();
    }

    function updateCompView(){
        var i, len = availableCompositions.length;
        for(i=0;i<len;i++){
            compsList.items[i].subItems[0].text = availableCompositions[i].queued;
            if(availableCompositions[i].queued == false){
                compsList.items[i].subItems[1].text = '';
            }else{
                compsList.items[i].subItems[1].text = availableCompositions[i].destination;
            }
        }
    }

    function setExportText(text){
        bodyMovinPanel.mainGroup.renderGroup.infoText.text = text;
    }

    myScript_buildUI(bodymovinWindow);
    if (bodyMovinPanel != null && bodyMovinPanel instanceof Window){
        bodyMovinPanel.center();
        bodyMovinPanel.show();
    }

    var ob ={};
    ob.setExportText = setExportText;
    ob.setProgress = setProgress;

    UI = ob;

}());