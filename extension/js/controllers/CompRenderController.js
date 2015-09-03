/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, renderingData, folderData, bodymovin, LocalStorageManager */
var compRenderController = (function () {
    'use strict';
    var view, renders, csInterface, compositions, cancelButton, returnButton;
    var ob = {};
    var elementTemplate = "<div class='renderingElement'><div class='header'><div class='compName'></div></div><div class='progressBar'></div><div class='status'><div class='compAnim'></div><div class='statusText'></div><div class='folder'></div><div class='buttonHover'></div></div><div class='fontsContainer'><div class='typekitContainer'><button class='generalButton typekitButton'>Include typekit path</button><div class='typekitElem'><span>Typekit path</span><input class='typekitPath' type='text'/></div></div><div class='fontsList'></div><div class='buttons'><button class='generalButton continue'>Continue</button></div></div></div>";
    var fontTemplate = "<div class='fontElement'><div class='fontTitle'></div><div class='fontFormItem'><span>Font path (optional)</span><input class='fontPath' type='text' /></div><div class='fontFormItem'><span>Font Family (optional)</span><input class='fontFamily' type='text' /></div><div class='fontFormItem'><span>Font Weight</span><input class='fontWeight' type='text' /></div><div class='fontFormItem'><span>Font Style</span><input class='fontStyle' type='text' list='browsers'/></div></div>";
    
    var fontsStorage;
    
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
        }
    }
    
    function getStoredFontData(name) {
        var i = 0, len = fontsStorage.length;
        while (i < len) {
            if (fontsStorage[i].fName === name) {
                return fontsStorage[i];
            }
            i += 1;
        }
        var ob = {
            fName : name,
            fFamily : name,
            fWeight : 'normal',
            fStyle : 'normal',
            fPath : ''
        };
        fontsStorage.push(ob);
        return ob;
    }
    
    function saveFontsData(fontsContainer, fonts) {
        var fontsList = fontsContainer.find('.fontsList');
        var fontsInfo = {
            list: []
        };
        var fontOb;
        var list = fontsInfo.list;
        var children = fontsList.children();
        children.each(function (index, item) {
            fontOb = {};
            fontOb.fName = fonts[index];
            fontOb.fPath = $(item).find('.fontPath')[0].value;
            fontOb.fFamily = $(item).find('.fontFamily')[0].value;
            fontOb.fWeight = $(item).find('.fontWeight')[0].value;
            fontOb.fStyle = $(item).find('.fontStyle')[0].value;
            var storedOb = getStoredFontData(fonts[index]);
            storedOb.fPath = fontOb.fPath;
            storedOb.fFamily = fontOb.fFamily;
            storedOb.fWeight = fontOb.fontWeight;
            storedOb.fStyle = fontOb.fontStyle;
            list.push(fontOb);
        });
        var typekitElem = fontsContainer.find('.typekitElem');
        if (typekitElem.hasClass('visible')) {
            fontsInfo.tk = $(typekitElem).find('.typekitPath')[0].value;
        }
        LocalStorageManager.setItem('fonts', fontsStorage);
        var fontsInfoString = JSON.stringify(fontsInfo);
        var eScript = 'bm_renderManager.setFontData(' + fontsInfoString + ')';
        csInterface.evalScript(eScript);
    }
    
    function renderFontsHandler(ev) {
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
        var fonts = JSON.parse(messageData.fonts);
        console.log(fonts);
        elem.find('.statusText').html('Select font families and font paths if necessary.');
        var fontsContainer = elem.find('.fontsContainer');
        fontsContainer.show();
        var fontsList = fontsContainer.find('.fontsList');
        var typekitElem = fontsContainer.find('.typekitElem');
        len = fonts.length;
        var fontElem, storedData;
        for (i = 0; i < len; i += 1) {
            storedData = getStoredFontData(fonts[i]);
            fontElem = $(fontTemplate);
            fontElem.find('.fontTitle').html(fonts[i]);
            fontElem.find('.fontFamily').val(storedData.fFamily);
            fontElem.find('.fontWeight').val(storedData.fWeight);
            fontElem.find('.fontPath').val(storedData.fPath);
            fontElem.find('.fontStyle').val(storedData.fStyle);
            fontsList.append(fontElem);
        }
        fontsContainer.find('button.continue').on('click', function () {
            saveFontsData(fontsContainer, fonts);
            fontsContainer.hide();
        });
        fontsContainer.find('button.typekitButton').on('click', function () {
            if (typekitElem.hasClass('visible')) {
                typekitElem.removeClass('visible');
                $(this).html('Include Typekit Path');
            } else {
                typekitElem.addClass('visible');
                $(this).html('Exclude Typekit Path');
            }
        });
    }
    
    function renderCompleteHandler() {
        cancelButton.hide();
        returnButton.show();
    }
    
    function init(csIntfc) {
        fontsStorage = LocalStorageManager.getItem('fonts');
        if (fontsStorage === null) {
            fontsStorage = [];
            LocalStorageManager.setItem('fonts', fontsStorage);
        }
        view = $('#compsRender');
        renders = view.find('.renders');
        view.hide();
        csInterface = csIntfc;
        csInterface.addEventListener('bm:render:start', renderStartHandler);
        csInterface.addEventListener('bm:render:update', renderUpdateHandler);
        csInterface.addEventListener('bm:render:complete', renderCompleteHandler);
        csInterface.addEventListener('bm:render:fonts', renderFontsHandler);
        
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
    
    ob.init = init;
    ob.show = show;
    ob.hide = hide;
    
    return ob;
}());