/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, bmData, bodymovin, mainController */
var infoController = (function () {
    'use strict';
    var ob = {}, view, anim, csInterface;
    
    function showSelection() {
        mainController.showView('selection');
    }
    
    function openBrowser() {
        csInterface.openURLInDefaultBrowser('http://github.com/bodymovin/bodymovin');
        return false;
    }
    
    function getZippedFile() {
        var eScript = 'bm_downloadManager.getPlayer(true)';
        csInterface.evalScript(eScript);
    }
    
    function getUnzippedFile() {
        var eScript = 'bm_downloadManager.getPlayer(false)';
        csInterface.evalScript(eScript);
    }
    
    function init(csIntfc) {
        csInterface = csIntfc;
        view = $('#info');
        view.hide();
        view.find('.return').on('click', showSelection);
        view.find('.link').on('click', openBrowser);
        view.find('.buttons .zipped').on('click', getZippedFile);
        view.find('.buttons .unzipped').on('click', getUnzippedFile);
    }
    
    function loadAnimation() {
        var animContainer = view.find('.animHeader')[0];
        var animData = JSON.parse(bmData);
        var params = {
            animType: 'svg',
            wrapper: animContainer,
            loop: true,
            autoplay: true,
            prerender: false,
            animationData: animData
        };
        anim = bodymovin.loadAnimation(params);
    }
    
    function show() {
        view.show();
        if (!anim) {
            loadAnimation();
        } else {
            anim.play();
        }
    }
    
    function hide() {
        if (anim) {
            anim.goToAndStop(0);
        }
        view.hide();
    }
    
    ob.init = init;
    ob.hide = hide;
    ob.show = show;
    
    return ob;
}());