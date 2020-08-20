var lottiejs = (function(window) {
    "use strict";
    /*<%= contents %>*/
    var lottiejs = {};

    var _isFrozen = false;

    function loadAnimation(params) {
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

    lottiejs.play = animationManager.play;
    lottiejs.pause = animationManager.pause;
    lottiejs.togglePause = animationManager.togglePause;
    lottiejs.setSpeed = animationManager.setSpeed;
    lottiejs.setDirection = animationManager.setDirection;
    lottiejs.stop = animationManager.stop;
    lottiejs.registerAnimation = animationManager.registerAnimation;
    lottiejs.loadAnimation = loadAnimation;
    lottiejs.resize = animationManager.resize;
    lottiejs.goToAndStop = animationManager.goToAndStop;
    lottiejs.destroy = animationManager.destroy;
    lottiejs.setQuality = setQuality;
    lottiejs.freeze = animationManager.freeze;
    lottiejs.unfreeze = animationManager.unfreeze;
    lottie.setVolume = animationManager.setVolume;
    lottie.mute = animationManager.mute;
    lottie.unmute = animationManager.unmute;
    lottiejs.getRegisteredAnimations = animationManager.getRegisteredAnimations;
    lottiejs.version = '[[BM_VERSION]]';

    var renderer = '';
    return lottiejs;
})({});

var animations = [];

var onmessage = function(evt) {
    var canvas = evt.data.canvas;
    var params = evt.data.params;
    var ctx = canvas.getContext("2d");
    var animation = lottiejs.loadAnimation({
        renderer: 'canvas',
        loop: evt.data.loop,
        autoplay: true,
        animationData: evt.data.animationData,
        rendererSettings: {
            context: ctx,
            scaleMode: 'noScale',
            clearCanvas: true
        }
    });
    animations.push(animation);
    animation.play();
};

