/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, renderingData, folderData, bodymovin, LocalStorageManager, Mustache */
var compRenderController = (function () {
    'use strict';
    var view, renders, csInterface, compositions, cancelButton, returnButton;
    var ob = {};
    
    var fontsStorage, textHelper;
    
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
        compositions = messageParser.parse(ev.data);
        var i, len = compositions.length, elem;
        for (i = 0; i < len; i += 1) {
            var template = document.getElementById('elementTemplate').innerHTML;
            var output = Mustache.render(template, compositions[i]);
            elem = $(output);
            //elem.find('.compName').html(compositions[i].name);
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
        var id = messageData.compId.toString();
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
            fPath : '',
            fClass : '',
            fOrigin: 'p'
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
            fontOb.fName = fonts[index].name;
            fontOb.fPath = $(item).find('.fontPath')[0].value;
            fontOb.fClass = $(item).find('.fontClass')[0].value;
            fontOb.fFamily = $(item).find('.fontFamily')[0].value;
            fontOb.fWeight = $(item).find('.fontWeight')[0].value;
            fontOb.fStyle = $(item).find('.fontStyle')[0].value;
            var checked = $(item).find('input[type=radio]:checked');
            var radioVal = checked.val();
            fontOb.fOrigin = radioVal || 'n';
            var storedOb = getStoredFontData(fonts[index].name);
            storedOb.fPath = fontOb.fPath;
            storedOb.fClass = fontOb.fClass;
            storedOb.fFamily = fontOb.fFamily;
            storedOb.fWeight = fontOb.fontWeight;
            storedOb.fStyle = fontOb.fontStyle;
            storedOb.fOrigin = fontOb.fOrigin;
            list.push(fontOb);
        });
        LocalStorageManager.setItem('fonts', fontsStorage);
        var fontsInfoString = JSON.stringify(fontsInfo);
        var eScript = 'bm_renderManager.setFontData(' + fontsInfoString + ')';
        csInterface.evalScript(eScript);
    }
    
    function renderFontsHandler(ev) {
        var messageData = ev.data;
        var id = messageData.compId.toString();
        var i = 0, len = compositions.length;
        while (i < len) {
            if (id === compositions[i].id.toString()) {
                break;
            }
            i += 1;
        }
        var compData = compositions[i];
        var elem = compData.elem;
        var fonts = messageParser.parse(messageData.fonts);
        elem.find('.statusText').html('Select font families and font paths if necessary.');
        var fontsContainer = elem.find('.fontsContainer');
        fontsContainer.show();
        var fontsList = fontsContainer.find('.fontsList');
        len = fonts.length;
        var fontElem, storedData, template, output;
        for (i = 0; i < len; i += 1) {
            fonts[i].__index = i;
            storedData = getStoredFontData(fonts[i].name);
            
            template = document.getElementById('fontTemplate').innerHTML;
            output = Mustache.render(template, {fontData: fonts[i], storedData: storedData});
            fontElem = $(output);
            if (storedData.fOrigin) {
                fontElem.find("input[type=radio][value=" + storedData.fOrigin + "]").prop('checked', true);
            }
            fontsList.append(fontElem);
        }
        fontsContainer.find('button.continue').on('click', function () {
            saveFontsData(fontsContainer, fonts);
            fontsContainer.hide();
        });
    }
    
    function renderCharsHandler(ev) {
        var messageData = ev.data;
        var chars = messageParser.parse(messageData.chars);
        
        var i, len = chars.length;
        for (i = 0; i < len; i += 1) {
            var styles = chars[i].style.split(' ');
            var j, jLen = styles.length;
            var fStyle = 'normal';
            var fWeight = 'normal';
            for (j = 0; j < jLen; j += 1) {
                if (styles[j].toLowerCase() === 'italic') {
                    fStyle = 'italic';
                } else if (styles[j].toLowerCase() === 'black') {
                    fWeight = '900';
                } else if (styles[j].toLowerCase() === 'extrabold') {
                    fWeight = '800';
                } else if (styles[j].toLowerCase() === 'bold') {
                    fWeight = '700';
                } else if (styles[j].toLowerCase() === 'semibold') {
                    fWeight = '600';
                } else if (styles[j].toLowerCase() === 'medium') {
                    fWeight = '500';
                } else if (styles[j].toLowerCase() === 'regular' || styles[j].toLowerCase() === 'normal') {
                    fWeight = '400';
                } else if (styles[j].toLowerCase() === 'extralight') {
                    fWeight = '300';
                } else if (styles[j].toLowerCase() === 'light' || styles[j].toLowerCase() === 'thin') {
                    fWeight = '200';
                }
            }
            
            textHelper.setAttribute('font-style', fStyle);
            textHelper.setAttribute('font-weight', fWeight);
            textHelper.setAttribute('font-family', chars[i].fFamily);
            textHelper.setAttribute('font-size', chars[i].size);
            textHelper.setAttribute('font-size', 100);
            textHelper.textContent = chars[i].ch === ' ' ? '\u00A0' : chars[i].ch;
            /* Not using this for now.
            var cLength = textHelper.getComputedTextLength();
            chars[i].w = cLength;
            */
            delete chars[i].font;
        }
        var charsInfoString = JSON.stringify(chars);
        var eScript = 'bm_renderManager.setCharsData(' + charsInfoString + ')';
        csInterface.evalScript(eScript);
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
        csInterface.addEventListener('bm:render:chars', renderCharsHandler);
        
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
        textHelper = document.getElementById('textHelper');
        textHelper.setAttributeNS("http://www.w3.org/XML/1998/namespace",  "xml:space", "preserve");
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