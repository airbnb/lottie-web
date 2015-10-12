/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, renderingData, folderData, bodymovin */
var compRenderController = (function () {
    'use strict';
    var view, renders, csInterface, compositions, cancelButton, returnButton;
    var ob = {};
    var elementTemplate = "<div class='renderingElement'><div class='header'><div class='compName'></div></div><div class='progressBar'></div><div class='status'><div class='compAnim'></div><div class='statusText'></div><div class='folder'></div><div class='buttonHover'></div></div></div>";
    
    function addFolderEvent(elem, data) {
        elem.on('click', function () {
            var eScript = 'bm_compsManager.browseFolder(' + data.id + ')';
            csInterface.evalScript(eScript);
        });
        elem.on('mouseover', function () {
            data.folderAnim.goToAndStop(0);
            data.folderAnim.play();
        });
    }
    
    function destroyCompositions() {
        if (compositions) {
            var i, len = compositions.length;
            for (i = 0; i < len; i += 1) {
                compositions[i].anim.destroy();
                compositions[i].folderAnim.destroy();
            }
        }
    }
    
    function renderStartHandler(ev) {
        renders.empty();
        compositions = JSON.parse(ev.data);
        var i, len = compositions.length, elem;
        for (i = 0; i < len; i += 1) {
            elem = $(elementTemplate);
            elem.find('.compName').html(compositions[i].name);
            elem.find('.statusText').html('Queued');
            addFolderEvent(elem.find('.buttonHover'), compositions[i]);
            
            compositions[i].elem = elem;
            renders.append(elem);
            
            var animContainer = elem.find('.compAnim')[0];
            var animData = JSON.parse(renderingData);
            var params = {
                animType: 'svg',
                wrapper: animContainer,
                loop: true,
                autoplay: true,
                prerender: true,
                animationData: animData
            };
            var anim = bodymovin.loadAnimation(params);
            compositions[i].anim = anim;
            
            animContainer = elem.find('.folder')[0];
            animData = JSON.parse(folderData);
            params = {
                animType: 'svg',
                wrapper: animContainer,
                loop: false,
                autoplay: false,
                prerender: true,
                animationData: animData
            };
            anim = bodymovin.loadAnimation(params);
            compositions[i].folderAnim = anim;
        }
        cancelButton.show();
        returnButton.hide();
    }
    
    function renderUpdateHandler(ev) {
        var messageData = ev.data;
        var id = messageData.compId;
        var i = 0, len = compositions.length;
        while (i < len) {
            if (id === compositions[i].id.toString()) {
                break;
            }
            i += 1;
        }
        var compData = compositions[i];
        var elem = compData.elem;
        if (messageData.type === 'update') {
            elem.find('.statusText').html(messageData.message);
            if (messageData.progress) {
                elem.find('.progressBar').css('width', (messageData.progress * 100) + '%');
            }
        }
        if (messageData.isFinished) {
            elem.addClass('rendered');
            compData.fsPath = messageData.fsPath;
        }
    }
    
    function renderCompleteHandler() {
        cancelButton.hide();
        returnButton.show();
    }
    
    function init(csIntfc) {
        view = $('#compsRender');
        renders = view.find('.renders');
        view.hide();
        csInterface = csIntfc;
        csInterface.addEventListener('bm:render:start', renderStartHandler);
        csInterface.addEventListener('bm:render:update', renderUpdateHandler);
        csInterface.addEventListener('bm:render:complete', renderCompleteHandler);
        
        cancelButton = view.find('.cancel');
        returnButton = view.find('.return');
        cancelButton.on('click', function () {
            var eScript = 'bm_compsManager.cancel()';
            csInterface.evalScript(eScript);
        });
        returnButton.on('click', function () {
            var eScript = 'bm_compsManager.cancel()';
            csInterface.evalScript(eScript);
        });
        returnButton.hide();
    }
    
    function show() {
        view.show();
    }
    
    function hide() {
        if (compositions) {
            var i, len = compositions.length;
            for (i = 0; i < len; i += 1) {
                compositions[i].anim.goToAndStop(0);
            }
        }
        view.hide();
    }
    
    function getCompositions() {
        return compositions;
    }
    
    ob.init = init;
    ob.show = show;
    ob.hide = hide;
    ob.getCompositions = getCompositions;
    
    return ob;
}());