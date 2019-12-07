"use strict";
/*<%= contents %>*/
var lottie = {};

var _isFrozen = false;

function setLocationHref (href) {
    locationHref = href;
}

function searchAnimations() {
    if (standalone === true) {
        animationManager.searchAnimations(animationData, standalone, renderer);
    } else {
        animationManager.searchAnimations();
    }
}

function setSubframeRendering(flag) {
    subframeEnabled = flag;
}

function loadAnimation(params) {
    if (standalone === true) {
        params.animationData = JSON.parse(animationData);
    }
    return animationManager.loadAnimation(params);
}

function setQuality(value) {
    if (typeof value === 'string') {
        switch (value) {
            case 'high':
                defaultCurveSegments = 200;
                break;
            case 'medium':
                defaultCurveSegments = 50;
                break;
            case 'low':
                defaultCurveSegments = 10;
                break;
        }
    } else if (!isNaN(value) && value > 1) {
        defaultCurveSegments = value;
    }
    if (defaultCurveSegments >= 50) {
        roundValues(false);
    } else {
        roundValues(true);
    }
}

function inBrowser() {
    return typeof navigator !== 'undefined';
}

function installPlugin(type, plugin) {
    if (type === 'expressions') {
        expressionsPlugin = plugin;
    }
}

function getFactory(name) {
    switch (name) {
        case "propertyFactory":
            return PropertyFactory;
        case "shapePropertyFactory":
            return ShapePropertyFactory;
        case "matrix":
            return Matrix;
    }
}

lottie.play = animationManager.play;
lottie.pause = animationManager.pause;
lottie.setLocationHref = setLocationHref;
lottie.togglePause = animationManager.togglePause;
lottie.setSpeed = animationManager.setSpeed;
lottie.setDirection = animationManager.setDirection;
lottie.stop = animationManager.stop;
lottie.searchAnimations = searchAnimations;
lottie.registerAnimation = animationManager.registerAnimation;
lottie.loadAnimation = loadAnimation;
lottie.setSubframeRendering = setSubframeRendering;
lottie.resize = animationManager.resize;
//lottie.start = start;
lottie.goToAndStop = animationManager.goToAndStop;
lottie.destroy = animationManager.destroy;
lottie.setQuality = setQuality;
lottie.inBrowser = inBrowser;
lottie.installPlugin = installPlugin;
lottie.freeze = animationManager.freeze;
lottie.unfreeze = animationManager.unfreeze;
lottie.getRegisteredAnimations = animationManager.getRegisteredAnimations;
lottie.__getFactory = getFactory;
lottie.version = '[[BM_VERSION]]';

function checkReady() {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);
        searchAnimations();
    }
}

function getQueryVariable(variable) {
    var vars = queryString.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
}
var standalone = '__[STANDALONE]__';
var animationData = '__[ANIMATIONDATA]__';
var renderer = '';
if (standalone) {
    var scripts = document.getElementsByTagName('script');
    var index = scripts.length - 1;
    var myScript = scripts[index] || {
        src: ''
    };
    var queryString = myScript.src.replace(/^[^\?]+\??/, '');
    renderer = getQueryVariable('renderer');
}
var readyStateCheckInterval = setInterval(checkReady, 100);
