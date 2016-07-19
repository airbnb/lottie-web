/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager, compSelectionController, compRenderController, messageController, infoController, snapshotController*/

var mainController = (function () {
    'use strict';
    var ob = {};
    var stateData;

    var csInterface = new CSInterface();
    var mainViews = [];
    
    function showView(view) {
        var i, len = mainViews.length;
        for (i = 0; i < len; i += 1) {
            if (mainViews[i].id === view) {
                mainViews[i].controller.show();
            } else {
                mainViews[i].controller.hide();
            }
        }
    }
        
    csInterface.addEventListener('bm:render:start', function (ev) {
        showView('render');
    });
        
    csInterface.addEventListener('bm:render:cancel', function (ev) {
        showView('selection');
    });
        
    csInterface.addEventListener('console:log', function (ev) {
        console.log(JSON.stringify(ev.data));
    });
    
    function loadCommands() {
        var eScript = 'bm_projectManager.searchCommands()';
        csInterface.evalScript(eScript);
    }
    
    function loadJSX(fileName, cb) {
        var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) + "/jsx/";
        csInterface.evalScript('$.evalFile("' + extensionRoot + fileName + '")', cb);
    }
    
    function getAppData(id) {
        
    }
    
    function setApplicationId(ev){
        var response = messageParser.parse(ev.data);
        var id = response.id;
        var storedData = LocalStorageManager.getItem(id+'_appData');
        if(storedData){
            stateData = storedData;
        } else {
            stateData = {
                compsSelection: {}
            };
        }
        stateData.appId = response.id;
        compSelectionController.setData(stateData);
        saveData();
    }
    
    function saveData(){
        LocalStorageManager.setItem(stateData.appId+'_appData',stateData);
    }
    
    function init() {
        csInterface.addEventListener('bm:project:id', setApplicationId);
        themeManager.init();
        compSelectionController.init(csInterface);
        mainViews.push({id: 'selection', controller: compSelectionController});
        compRenderController.init(csInterface);
        mainViews.push({id: 'render', controller: compRenderController});
        messageController.init(csInterface);
        mainViews.push({id: 'settings', controller: infoController});
        infoController.init(csInterface);
        mainViews.push({id: 'snapshot', controller: snapshotController});
        snapshotController.init(csInterface);
        loadJSX('initializer.jsx');
        
        loadCommands();
        
        showView('selection');
        
    }
    
    ob.showView = showView;
    ob.saveData = saveData;
    ob.init = init;
        
    return ob;

}());

mainController.init();
