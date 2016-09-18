/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global app, bm_eventDispatcher */

var bm_projectManager = (function () {
    'use strict';
    var commands = {};
    var projectId = '';
    var project;
    function getItemType(item) {
        var getType = {};
        var type = getType.toString.call(item);
        var itemType = '';
        switch (type) {
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
    
    function searchCommands() {
        //commands.shapesFromText = app.findMenuCommandId("Create Shapes from Text");
        //commands.duplicate = app.findMenuCommandId("Duplicate");
        commands.shapesFromText = 3781;
        commands.duplicate = 2080;
    }
    
    function getCommandID(key) {
        return commands[key];
    }
    
    function checkProject() {
        //bm:application:id
        var storedProjectId;
        if(!bm_XMPHelper.created){
        } else {
            storedProjectId = bm_XMPHelper.getMetadata('project_id');
        }
        if(!storedProjectId) {
            storedProjectId = bm_generalUtils.random(20);
            bm_XMPHelper.setMetadata('project_id',storedProjectId);
        }
        if(projectId !== storedProjectId){
            projectId = storedProjectId;
            bm_eventDispatcher.sendEvent('bm:project:id', {id:projectId});
        }
    }
    
    function getCompositions() {
    
        project = app.project;
        var arr = [];
        if (!project) {
            return;
        }
        var i, numItems = project.numItems;
        for (i = 0; i < numItems; i += 1) {
            if (getItemType(project.item(i + 1)) === 'Comp') {
                arr.push(project.item(i + 1));
            }
        }
        return arr;
    }

    function getCompositionById(id){
        var i, numItems = project.numItems;
        for (i = 0; i < numItems; i += 1) {
            if (getItemType(project.item(i + 1)) === 'Comp') {
                if(project.item(i + 1).id == id){
                    return project.item(i + 1);
                }
            }
        }
    }
    
    var ob = {
        checkProject: checkProject,
        getCompositions: getCompositions,
        getCompositionById: getCompositionById,
        searchCommands: searchCommands,
        getCommandID: getCommandID
    };
    return ob;
}());