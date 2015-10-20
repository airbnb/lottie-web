/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global app, bm_eventDispatcher */

var bm_projectManager = (function () {
    'use strict';
    var commands = {};
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
        commands.shapesFromText = app.findMenuCommandId("Create Shapes from Text");
        commands.duplicate = app.findMenuCommandId("Duplicate");
    }
    
    function getCommandID(key) {
        return commands[key];
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
    
    var ob = {
        getCompositions: getCompositions,
        searchCommands: searchCommands,
        getCommandID: getCommandID
    };
    return ob;
}());