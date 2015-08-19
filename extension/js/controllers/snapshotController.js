/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, alertData, successData, bodymovin, mainController */
var snapshotController = (function () {
    'use strict';
    var ob = {}, view, csInterface, anim, animContainer;
    
    function showSelection() {
        mainController.showView('selection');
    }
    
    function displayCurrentRenders() {
        
    }
    
    function browseFiles() {
        var eScript = 'bm_main.browseFile()';
        csInterface.evalScript(eScript);
    }
    
    function handleFilePath(ev) {
        var jsonData = JSON.parse(ev.data.substr(7));
        //var result = window.cep.fs.readFile(path);
        if (anim) {
            console.log('entrotort');
            anim.destroy();
        }
        var params = {
                animType: 'svg',
                wrapper: animContainer,
                loop: false,
                autoplay: false,
                prerender: true,
                animationData: jsonData
            };
        anim = bodymovin.loadAnimation(params);
    }
    
    function init(csIntfc) {
        csInterface = csIntfc;
        view = $('#snapshot');
        view.hide();
        view.find('.buttons .current').on('click', displayCurrentRenders);
        view.find('.buttons .browse').on('click', browseFiles);
        view.find('.return').on('click', showSelection);
        animContainer = view.find('.animContainer')[0];
        csInterface.addEventListener('bm:file:path', handleFilePath);
    }
    
    function show() {
        view.show();
    }
    
    function hide() {
        view.hide();
    }
    
    ob.show = show;
    ob.hide = hide;
    ob.init = init;
    return ob;
}());