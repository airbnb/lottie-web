(typeof navigator !== "undefined") && (function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define(function() {
            return factory(root);
        });
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory(root);
    } else {
        root.lottie = factory(root);
        root.bodymovin = root.lottie;
    }
}((window || {}), function(window) {
    "use strict";
    /*<%= contents %>*/
    var lottiejs = {};

    function setLocationHref (href) {
        locationHref = href;
    }
    function play(animation){
        animationManager.play(animation);
    }

    function pause(animation) {
        animationManager.pause(animation);
    }

    function togglePause(animation) {
        animationManager.togglePause(animation);
    }

    function setSpeed(value, animation) {
        animationManager.setSpeed(value, animation);
    }

    function setDirection(value, animation) {
        animationManager.setDirection(value, animation);
    }

    function stop(animation) {
        animationManager.stop(animation);
    }

    function searchAnimations() {
        if (standalone === true) {
            animationManager.searchAnimations(animationData, standalone, renderer);
        } else {
            animationManager.searchAnimations();
        }
    }

    function registerAnimation(elem) {
        return animationManager.registerAnimation(elem);
    }

    function resize() {
        animationManager.resize();
    }

    /*function start() {
        animationManager.start();
    }*/

    function goToAndStop(val, isFrame, animation) {
        animationManager.goToAndStop(val, isFrame, animation);
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

    function destroy(animation) {
        return animationManager.destroy(animation);
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
    lottiejs.play = play;
    lottiejs.pause = pause;
    lottiejs.setLocationHref = setLocationHref;
    lottiejs.togglePause = togglePause;
    lottiejs.setSpeed = setSpeed;
    lottiejs.setDirection = setDirection;
    lottiejs.stop = stop;
    lottiejs.searchAnimations = searchAnimations;
    lottiejs.registerAnimation = registerAnimation;
    lottiejs.loadAnimation = loadAnimation;
    lottiejs.setSubframeRendering = setSubframeRendering;
    lottiejs.resize = resize;
    //lottiejs.start = start;
    lottiejs.goToAndStop = goToAndStop;
    lottiejs.destroy = destroy;
    lottiejs.setQuality = setQuality;
    lottiejs.inBrowser = inBrowser;
    lottiejs.installPlugin = installPlugin;
    lottiejs.__getFactory = getFactory;
    lottiejs.version = '[[BM_VERSION]]';

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
    return lottiejs;
}));
