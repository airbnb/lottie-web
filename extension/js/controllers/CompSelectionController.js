/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, SystemPath, radioData, checkData, bodymovin, messageController, mainController */
var compSelectionController = (function () {
    'use strict';
    var view, compsListContainer, csInterface, renderButton;
    var compositions = [];
    var elementTemplate = '<tr><td class="td stateTd"><div class="hideExtra state"></div></td><td class="td standaloneTd"><div class="hideExtra standalone"></div></td><td class="td glyphsTd"><div class="hideExtra glyphs">Shape</div></td><td class="td"><div class="hideExtra name"></div></td><td class="td destinationTd"><div class="hideExtra destination"></div></td></tr>';
    
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
        
        function handleStandaloneClick() {
            if (!comp.selected && !comp.standalone) {
                handleStateClick();
            }
            comp.standalone = !comp.standalone;
            if (comp.standalone) {
                comp.animCheck.play();
            } else {
                comp.animCheck.goToAndStop(0);
            }
            var eScript = 'bm_compsManager.setCompositionStandaloneState(' + comp.id + ',' + comp.standalone + ')';
            csInterface.evalScript(eScript);
        }
        
        function handleGlyphsClick() {
            if (!comp.selected && !comp.standalone) {
                handleStateClick();
            }
            console.log('comp.glyphs: ', comp.glyphs);
            comp.glyphs = !comp.glyphs;
            if (comp.glyphs) {
                elem.find('.glyphsTd .glyphs').html('Shape');
            } else {
                elem.find('.glyphsTd .glyphs').html('Font');
            }
            var eScript = 'bm_compsManager.setCompositionGlyphsState(' + comp.id + ',' + comp.glyphs + ')';
            csInterface.evalScript(eScript);
        }
        elem.find('.stateTd').on('click', handleStateClick);
        elem.find('.standaloneTd').on('click', handleStandaloneClick);
        elem.find('.glyphsTd').on('click', handleGlyphsClick);
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
                elem: $(elementTemplate)
            };
            var animContainer = comp.elem.find('.state')[0];
            var animData = JSON.parse(radioData);
            var params = {
                animType: 'canvas',
                wrapper: animContainer,
                loop: false,
                autoplay: false,
                prerender: true,
                animationData: animData
            };
            var anim = bodymovin.loadAnimation(params);
            comp.anim = anim;
            
            animContainer = comp.elem.find('.standalone')[0];
            animData = JSON.parse(checkData);
            params = {
                animType: 'canvas',
                wrapper: animContainer,
                loop: false,
                autoplay: false,
                prerender: true,
                animationData: animData
            };
            anim = bodymovin.loadAnimation(params);
            comp.animCheck = anim;
            
            comp.resized = false;
            compositions.push(comp);
            addElemListeners(comp);
        }
        comp.active = true;
        comp.name = item.name;
        comp.selected = item.selected;
        comp.standalone = item.standalone;
        comp.glyphs = item.glyphs;
        comp.destination = item.destination;
        var elem = comp.elem;
        elem.find('.name').html(comp.name);
        elem.find('.destination').html(comp.destination ? comp.destination.replace(/\\/g, '/')  : '...');
        if (comp.selected) {
            elem.addClass('selected');
        } else {
            elem.removeClass('selected');
        }
        compsListContainer.append(comp.elem);
        if (!comp.resized) {
            comp.anim.resize();
            comp.animCheck.resize();
            comp.resized = true;
        }
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
    
    function init(csIntfc) {
        view = $('#compsSelection');
        compsListContainer = view.find('.compsList');
        csInterface = csIntfc;
        csInterface.addEventListener('bm:compositions:list', updateCompositionsList);
        view.find('.refresh').on('click', getCompositionsList);
        renderButton = view.find('.render');
        renderButton.on('click', renderCompositions);
        view.find('.settings').on('click', showSettings);
        view.hide();
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