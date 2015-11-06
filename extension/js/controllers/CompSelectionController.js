/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, SystemPath, radioData, gearData, bodymovin, messageController, mainController */
var compSelectionController = (function () {
    'use strict';
    var view, compsListContainer, csInterface, renderButton;
    var compositions = [];
    var elementTemplate = '<tr><td class="td stateTd"><div class="hideExtra state"></div></td><td class="td settingsTd"><div class="hideExtra settings"></div></td><td class="td"><div class="hideExtra name"></div></td><td class="td destinationTd"><div class="hideExtra destination"></div></td></tr>';
    
    function formatStringForEval(str) {
        return '"' + str.replace(/\\/g, '\\\\') + '"';
    }
    
    function checkCompositions() {
        var i = 0, len = compositions.length;
        var flag = false;
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
    
    var settingsManager = (function () {
        
        var ob = {}, settingsView, compData, tempData = {}, callback;
        var segments, segmentsCheckbox, segmentsTextBox;
        
        function updateSegmentsData() {
            if (tempData.segmented) {
                segments.addClass('active');
                segmentsCheckbox.addClass('selected');
                segmentsTextBox.prop('disabled', '');
            } else {
                segments.removeClass('active');
                segmentsCheckbox.removeClass('selected');
                segmentsTextBox.prop('disabled', 'disabled');
            }
            segmentsTextBox.val(tempData.segmentTime);
        }
        
        function handleSegmentCheckboxClick() {
            tempData.segmented = !tempData.segmented;
            updateSegmentsData();
        }
        
        function cancelSettings() {
            settingsView.hide();
        }
        
        function saveSettings() {
            tempData.segmentTime = segmentsTextBox.val();
            compData = JSON.parse(JSON.stringify(tempData));
            callback.apply(null, [compData]);
            settingsView.hide();
        }
        
        function init() {
            settingsView = view.find('.settingsView');
            settingsView.hide();
            segments = settingsView.find('.segments');
            segments.find('.checkboxCombo').on('click', handleSegmentCheckboxClick);
            segmentsCheckbox = segments.find('.checkbox');
            segmentsTextBox = segments.find('.inputText');
            settingsView.find('.buttons .cancel').on('click', cancelSettings);
            settingsView.find('.buttons .return').on('click', saveSettings);
            updateSegmentsData();
        }
        
        function show(data, cb) {
            settingsView.show();
            compData = data;
            tempData = JSON.parse(JSON.stringify(compData));
            callback = cb;
            updateSegmentsData();
        }
        
        ob.init = init;
        ob.show = show;
        return ob;
    }());
    
    function addElemListeners(comp) {
        var elem = comp.elem;
        
        function handleStateClick() {
            comp.selected = !comp.selected;
            if (comp.selected) {
                elem.addClass('selected');
                comp.anim.play();
            } else {
                comp.anim.goToAndStop(0);
                elem.removeClass('selected');
            }
            var eScript = 'bm_compsManager.setCompositionSelectionState(' + comp.id + ',' + comp.selected + ')';
            csInterface.evalScript(eScript);
            checkCompositions();
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
        }
        
        function showElemSetings() {
            settingsManager.show(comp.settings, saveSettings);
        }
        
        function overElemSetings() {
            comp.gearAnim.play();
        }
        
        function outElemSetings() {
            comp.gearAnim.goToAndStop(0);
        }
        
        elem.find('.stateTd').on('click', handleStateClick);
        elem.find('.settingsTd').on('click', showElemSetings);
        elem.find('.settingsTd').hover(overElemSetings, outElemSetings);
        /*elem.find('.settingsTd').on('rollover', overElemSetings);
        elem.find('.settingsTd').on('rollout', outElemSetings);*/
        elem.find('.destinationTd').on('click', handleDestination);
    }
    
    function setCompositionData(item) {
        var i = 0, len = compositions.length, comp;
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
                elem: $(elementTemplate),
                settings: {}
            };
            var animContainer = comp.elem.find('.state')[0];
            var animData = JSON.parse(radioData);
            var params = {
                animType: 'svg',
                wrapper: animContainer,
                loop: false,
                autoplay: false,
                prerender: true,
                animationData: animData
            };
            var anim = bodymovin.loadAnimation(params);
            comp.anim = anim;
            
            
            animContainer = comp.elem.find('.settings')[0];
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
            comp.gearAnim = anim;
            
            comp.resized = false;
            compositions.push(comp);
            addElemListeners(comp);
        }
        comp.active = true;
        comp.name = item.name;
        comp.selected = item.selected;
        comp.destination = item.destination;
        comp.settings = item.settings;
        var elem = comp.elem;
        elem.find('.name').html(comp.name);
        elem.find('.destination').html(comp.destination ? comp.destination.replace(/\\/g, '/')  : '...');
        if (comp.selected) {
            elem.addClass('selected');
        } else {
            elem.removeClass('selected');
        }
        compsListContainer.append(comp.elem);
        /*if (!comp.resized) {
            //comp.anim.resize();
            //comp.resized = true;
        }*/
    }
    
    function markCompsForRemoval() {
        var i, len = compositions.length;
        for (i = 0; i < len; i += 1) {
            compositions[i].active = false;
            compositions[i].elem.detach();
        }
    }
    
    function clearRemovedComps() {
        var i, len = compositions.length;
        for (i = 0; i < len; i += 1) {
            if (!compositions[i].active) {
                compositions[i].anim.destroy();
                compositions.splice(i, 1);
                i -= 1;
                len -= 1;
            }
        }
    }
    
    function updateCompositionsList(ev) {
        markCompsForRemoval();
        var list = JSON.parse(ev.data);
        var i, len = list.length;
        for (i = 0; i < len; i += 1) {
            setCompositionData(list[i]);
        }
        clearRemovedComps();
        checkCompositions();
    }
    
    function getCompositionsList() {
        csInterface.evalScript('bm_compsManager.getCompositions()');
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
    
    function init(csIntfc) {
        view = $('#compsSelection');
        compsListContainer = view.find('.compsList');
        csInterface = csIntfc;
        csInterface.addEventListener('bm:compositions:list', updateCompositionsList);
        view.find('.refresh').on('click', getCompositionsList);
        view.find('.snapshot').on('click', showSnapshotView);
        renderButton = view.find('.render');
        renderButton.on('click', renderCompositions);
        view.find('.settings').on('click', showSettings);
        view.hide();
        settingsManager.init();
    }
    
    function show() {
        view.show();
    }
    
    function hide() {
        view.hide();
    }
    
    var ob = {};
    ob.init = init;
    ob.show = show;
    ob.hide = hide;
    
    return ob;
}());