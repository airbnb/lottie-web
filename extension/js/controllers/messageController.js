/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, alertData, successData, bodymovin */
var messageController = (function () {
    'use strict';
    var ob = {}, csInterface, callback;
    var successElem, failElem, successAnim, failAnim;
    var view;
    
    function hide() {
        if (callback) {
            callback.apply();
            callback = null;
        }
        successAnim.goToAndStop(0);
        failAnim.goToAndStop(0);
        successElem.hide();
        failElem.hide();
        view.hide();
    }
    
    function showMessage(messageData, cb) {
        var text = messageData.message;
        callback = cb;
        view.find('.text').html(text);
        view.show();
        successAnim.resize();
        if (messageData.type === 'success') {
            successElem.show();
            successAnim.play();
        } else {
            failElem.show();
            failAnim.play();
        }
    }
    
    function messageEventHandler(ev) {
        showMessage(ev.data);
    }
    
    function init(csIntfc) {
        csInterface = csIntfc;
        view = $('#message');
        view.hide();
        var okButton = view.find('.ok');
        okButton.on('click', hide);
        csInterface.addEventListener('bm:alert', messageEventHandler);
        
        successElem = view.find('.sucessAnimation');
        var animData = JSON.parse(successData);
        var params = {
            animType: 'svg',
            wrapper: successElem[0],
            loop: true,
            autoplay: false,
            prerender: true,
            animationData: animData
        };
        failElem = view.find('.failAnimation');
        successAnim = bodymovin.loadAnimation(params);
        animData = JSON.parse(alertData);
        params = {
            animType: 'svg',
            wrapper: failElem[0],
            loop: true,
            autoplay: false,
            prerender: true,
            animationData: animData
        };
        failAnim = bodymovin.loadAnimation(params);
        successElem.hide();
        failElem.hide();
    }
    
    ob.init = init;
    ob.showMessage = showMessage;
    
    return ob;
    
}());