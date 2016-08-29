/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, SystemPath, radioData, gearData, checkData, bodymovin, messageController, mainController */
var compSelectionController = (function () {
    'use strict';
    var view, compsListContainer, csInterface, renderButton;
    var compositions;
    var compElements = {};
    var isDataSynced = false;
    var elementTemplate = '<tr><td class="td stateTd"><div class="hideExtra state"></div></td><td class="td settingsTd"><div class="hideExtra settings"></div></td><td class="td"><div class="hideExtra name"></div></td><td class="td destinationTd"><div class="hideExtra destination"></div></td></tr>';
    var stateData;
    var filterInput;

    function formatStringForEval(str) {
        return '"' + str.replace(/\\/g, '\\\\') + '"';
    }
    
    function checkCompositions() {
        var i = 0, len = compositions.length, comp, elem;
        for(i=0;i<len;i+=1){
            comp = compositions[i];
            elem = compElements[comp.id].elem;
            if(stateData.filterValue && comp.name.indexOf(stateData.filterValue) === -1){
                elem.hide();
            } else {
                elem.show();
            }
        }
        var flag = false;
        i = 0;
        while (i < len) {
            if (compositions[i].selected && compositions[i].destination) {
                flag = true;
                break;
            }
            i += 1;
        }
        if (flag) {
            renderButton.removeClass('disabled');
        } else {
            renderButton.addClass('disabled');
        }
    }
    
    var settingsManager;
    
    function addElemListeners(comp) {
        var elem = compElements[comp.id].elem;
        
        function handleStateClick() {
            comp.selected = !comp.selected;
            if (comp.selected) {
                elem.addClass('selected');
                compElements[comp.id].anim.play();
            } else {
                compElements[comp.id].anim.goToAndStop(0);
                elem.removeClass('selected');
            }
            var eScript = 'bm_compsManager.setCompositionSelectionState(' + comp.id + ',' + comp.selected + ')';
            csInterface.evalScript(eScript);
            checkCompositions();
            mainController.saveData();
        }
        
        function handleDestination() {
            if (!comp.selected) {
                handleStateClick();
            }
            var eScript = 'bm_compsManager.searchCompositionDestination(' + comp.id + ')';
            csInterface.evalScript(eScript);
        }
    
        function saveSettings(data) {
            comp.settings = data;
            var eScript = 'bm_compsManager.setCompositionSettings(' + comp.id + ',' + JSON.stringify(comp.settings) + ')';
            csInterface.evalScript(eScript);
            mainController.saveData();
        }
        
        function showElemSetings() {
            settingsManager.show(comp.settings, saveSettings, compositions);
        }
        
        function overElemSetings() {
            compElements[comp.id].gearAnim.play();
        }
        
        function outElemSetings() {
            compElements[comp.id].gearAnim.goToAndStop(0);
        }
        
        elem.find('.stateTd').on('click', handleStateClick);
        elem.find('.settingsTd').on('click', showElemSetings);
        elem.find('.settingsTd').hover(overElemSetings, outElemSetings);
        elem.find('.destinationTd').on('click', handleDestination);
    }
    
    function setCompositionData(item, pos) {
        var i = 0, len = compositions.length, comp, isAppended = true;
        while (i < len) {
            if (item.id === compositions[i].id) {
                comp = compositions[i];
                break;
            }
            i += 1;
        }
        if (!comp) {
            comp = {
                id: item.id,
                settings: {}
            };
            compositions.push(comp);
        } else if(!isDataSynced) {
            var eScript = 'bm_compsManager.syncCompositionData(' + comp.id + ',' + JSON.stringify(comp) + ')';
            csInterface.evalScript(eScript);
            
        }
        if(!compElements[comp.id]){
            isAppended = false;
            var compElementsData = {};
            compElementsData.elem = $(elementTemplate);
            var autoplay = false;
            if(!isDataSynced && comp.selected) {
                autoplay = true;
            }
            var animContainer = compElementsData.elem.find('.state')[0];
            var animData = JSON.parse(radioData);
            var params = {
                animType: 'svg',
                wrapper: animContainer,
                loop: false,
                autoplay: autoplay,
                prerender: true,
                animationData: animData
            };
            var anim = bodymovin.loadAnimation(params);
            compElementsData.anim = anim;

            animContainer = compElementsData.elem.find('.settings')[0];
            animData = JSON.parse(gearData);
            params = {
                animType: 'svg',
                wrapper: animContainer,
                loop: false,
                autoplay: false,
                prerender: true,
                animationData: animData
            };
            anim = bodymovin.loadAnimation(params);
            compElementsData.gearAnim = anim;
            compElements[comp.id] = compElementsData;
            addElemListeners(comp);
        }
        comp.active = true;
        comp.name = item.name;
        comp.selected = item.selected;
        comp.destination = item.destination;
        comp.absoluteURI = item.absoluteURI;
        comp.settings = item.settings;
        var elem = compElements[comp.id].elem;
        elem.find('.name').html(comp.name);
        elem.find('.destination').html(comp.destination ? comp.destination.replace(/\\/g, '/')  : '...');
        if (comp.selected) {
            elem.addClass('selected');
        } else {
            elem.removeClass('selected');
        }
        if(!isAppended) {
            if(pos === 0){
                compsListContainer.prepend(elem);
            } else {
                compsListContainer.find("tr").eq(pos - 1).after(elem);
            }
        }
    }
    
    function markCompsForRemoval() {
        var i, len = compositions.length;
        for (i = 0; i < len; i += 1) {
            compositions[i].active = false;
        }
    }
    
    function clearRemovedComps() {
        var i, len = compositions.length;
        for (i = 0; i < len; i += 1) {
            if (!compositions[i].active) {
                if(compElements[compositions[i].id]){
                    compElements[compositions[i].id].elem.detach();
                    compElements[compositions[i].id].anim.destroy();
                    compElements[compositions[i].id].gearAnim.destroy();
                }
                compElements[compositions[i].id] = null;
                compositions.splice(i, 1);
                i -= 1;
                len -= 1;
            }
        }
    }
    
    function updateCompositionsList(ev) {
        markCompsForRemoval();
        var list = messageParser.parse(ev.data);
        var i, len = list.length;
        for (i = 0; i < len; i += 1) {
            setCompositionData(list[i], i);
        }
        if(!isDataSynced) {
            isDataSynced = true;
            getCompositionsList();
        }
        clearRemovedComps();
        checkCompositions();
        mainController.saveData();
    }
    
    function getCompositionsList() {
        csInterface.evalScript('bm_compsManager.updateData()');
    }
    
    function renderCompositions() {
        if (renderButton.hasClass('disabled')) {
            messageController.showMessage({message: 'You have no compositions to render<br /> Please select a composition and a destination folder.', type: 'fail'});
            return;
        }
        csInterface.evalScript('bm_compsManager.render()');
    }
    
    function showSettings() {
        mainController.showView('settings');
    }
    
    function showSnapshotView() {
        mainController.showView('snapshot');
    }
    
    function updateFilter(ev){
        stateData.filterValue = ev.target.value;
        mainController.saveData();
        checkCompositions();
    }
    
    function removeAllCompositions(){
        if(!compositions){
            return;
        }
        var i, len = compositions.length;
        for (i = 0; i < len; i += 1) {
            if(compElements[compositions[i].id]){
                compElements[compositions[i].id].elem.detach();
                compElements[compositions[i].id].anim.destroy();
                compElements[compositions[i].id].gearAnim.destroy();
                compElements[compositions[i].id] = null;
            }
        }
    }
    
    function setData(data) {
        removeAllCompositions();
        if(!data.compsSelection.compositions){
            data.compsSelection.compositions = [];
            data.compsSelection.filterValue = "";
            isDataSynced = true;
        } else {
            isDataSynced = false;
        }
        stateData = data.compsSelection;
        compositions = stateData.compositions;
        filterInput.val(data.compsSelection.filterValue);
    }
    
    function init(csIntfc) {
        view = $('#compsSelection');
        settingsManager = SelectionSettings(view);
        compsListContainer = view.find('.compsList');
        csInterface = csIntfc;
        csInterface.addEventListener('bm:compositions:list', updateCompositionsList);
        view.find('.refresh').on('click', getCompositionsList);
        view.find('.snapshot').on('click', showSnapshotView);
        renderButton = view.find('.render');
        renderButton.on('click', renderCompositions);
        view.find('.settings').on('click', showSettings);
        filterInput = view.find('#compsFilter');
        filterInput.on('input change',updateFilter);
        view.hide();
        settingsManager.init();
    }
    
    function addFocusListener() {
        window.onfocus = getCompositionsList;
    }
    
    function removeFocusListener() {
        window.onfocus = null;
        
    }
    
    function show() {
        view.show();
        addFocusListener();
        getCompositionsList();
    }
    
    function hide() {
        view.hide();
        removeFocusListener();
    }
    
    var ob = {};
    ob.init = init;
    ob.setData = setData;
    ob.show = show;
    ob.hide = hide;
    
    return ob;
}());