/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, alertData, successData, bm, mainController, compRenderController, messageController */
var snapshotController = (function () {
    'use strict';
    var ob = {}, view, csInterface, anim, header, controls, current, animContainer, slider, thumb, sliderBg, snapshotButton, $window, showing = false;
    var totalFrames, currentFrame, sliderWidth, rendersSelection, listContainer;
    
    function showSelection() {
        mainController.showView('selection');
    }
    
    function showControls() {
        controls.find('.snapshotButton').show();
        controls.find('.frames .total').show();
        current.show();
    }
    
    function hideControls() {
        controls.find('.snapshotButton').hide();
        controls.find('.frames .total').hide();
        current.hide();
    }
    
    function browseFiles() {
        var eScript = 'bm_main.browseFile()';
        csInterface.evalScript(eScript);
    }
    
    function updateControls(origin) {
        if (origin !== 'input') {
            controls.find('.frames .current').html(currentFrame);
        }
        if (anim) {
            anim.goToAndStop(currentFrame + 1, true);
        }
        var x = (currentFrame / totalFrames) * sliderWidth;
        thumb.css('left', x - 5 + 'px');
    }
    
    function handleWindowResize() {
        if (!showing) {
            return;
        }
        animContainer.css('height', $window.height() - 2 - header.outerHeight() - controls.outerHeight() + 'px');
        sliderWidth = slider.width();
        sliderBg.css('width', (sliderWidth + 10) + 'px');
        updateControls();
        
    }
    
    function setTotalFrames() {
        if (!anim) {
            return;
        }
        totalFrames = anim.totalFrames;
        controls.find('.frames .total .value').html(totalFrames);
        showControls();
        handleWindowResize();
    }
    
    function loadAnimation(uri) {
        currentFrame = 0;
        if (anim) {
            anim.destroy();
        }
        var params = {
                animType: 'svg',
                wrapper: animContainer[0],
                loop: false,
                autoplay: false,
                prerender: true,
                path: uri
            };
        anim = bm.loadAnimation(params);
        anim.addEventListener('config_ready', setTotalFrames);
    }
    
    function addSelectionListener(elem, data) {
        elem.on('click', function () {
            rendersSelection.hide();
            loadAnimation(data.fsPath);
        });
    }
    
    function displayCurrentRenders() {
        var compositions = compRenderController.getCompositions();
        if (!compositions || compositions.length === 0) {
            messageController.showMessage({type: 'alert', message: 'You have no recent renders.\n Try browsing your files'});
        } else if (compositions.length === 1) {
            loadAnimation(compositions[0].fsPath);
        } else {
            rendersSelection.show();
            listContainer.empty();
            var i, len = compositions.length;
            var li;
            for (i = 0; i < len; i += 1) {
                li = $('<button class="generalButton">');
                li.html(compositions[i].name);
                listContainer.append(li);
                addSelectionListener(li, compositions[i]);
            }
        }
    }
    
    function handleFileUri(ev) {
        loadAnimation(ev.data);
    }
    
    function frameChangeHandler() {
        var num = parseInt(current.html(), 10);
        if (isNaN(num)) {
            return;
        }
        if (num < 0) {
            num = 0;
        } else if (num >= totalFrames) {
            num = totalFrames - 1;
        }
        currentFrame = num;
        updateControls('input');
    }
    
    function updateSliderValue(pageX) {
        var x = Math.max(0, pageX - slider.offset().left);
        var perc = x / sliderWidth;
        if (perc < 0) {
            perc = 0;
        } else if (perc > 1) {
            perc = 1;
        }
        currentFrame = Math.round(perc * totalFrames);
        updateControls();
    }
    
    function sliderMove(ev) {
        updateSliderValue(ev.pageX);
    }
        
    function sliderUp(ev) {
        $window.off('mousemove', sliderMove);
        $window.off('mouseup', sliderUp);
    }
        
    function sliderDown(ev) {
        $window.on('mouseup', sliderUp);
        $window.on('mousemove', sliderMove);
        updateSliderValue(ev.pageX);
    }
    
    function addSliderListeners() {
        
        slider = controls.find('.slider');
        sliderBg = controls.find('.sliderBg');
        thumb = controls.find('.thumb');
        sliderBg.on('mousedown', sliderDown);
    }
    
    function saveSnapshot() {
        var svgData = animContainer[0].innerHTML;
        var result = window.cep.fs.showSaveDialogEx('Select location', '', ['*.svg'], 'snapshot.svg');
        var targetFilePath = result.data;
        var writeResult = window.cep.fs.writeFile(targetFilePath, svgData);
        if (0 !== writeResult.err) {
            console.log('faillled');
        }
    }
    
    function init(csIntfc) {
        csInterface = csIntfc;
        view = $('#snapshot');
        view.hide();
        view.find('.buttons .current').on('click', displayCurrentRenders);
        view.find('.buttons .browse').on('click', browseFiles);
        view.find('.return').on('click', showSelection);
        animContainer = view.find('.animContainer');
        controls = view.find('.controls');
        controls.find('.snapshotButton').on('click', saveSnapshot);
        current = controls.find('.frames .current');
        current.on('input', frameChangeHandler);
        header = view.find('.header');
        rendersSelection = view.find('.rendersSelection');
        listContainer = rendersSelection.find('.listContainer');
        rendersSelection.hide();
        $window = $(window);
        csInterface.addEventListener('bm:file:uri', handleFileUri);
        $(window).on('resize', handleWindowResize);
        addSliderListeners();
        hideControls();
    }
    
    function show() {
        if (!showing) {
            showing = true;
            view.show();
            handleWindowResize();
        }
    }
    
    function hide() {
        if (showing) {
            showing = false;
            view.hide();
            $window.off('mouseup', sliderUp);
            $window.off('mousemove', sliderMove);
        }
    }
    
    ob.show = show;
    ob.hide = hide;
    ob.init = init;
    return ob;
}());