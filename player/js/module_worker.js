/* global defaultCurveSegments:writable, roundValues, animationManager, idPrefix:writable */
/* exported idPrefix */
var lottie = (function () {
  'use strict';

  /* <%= contents %> */
  var lottiejs = {};

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
        default:
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

  function setIDPrefix(prefix) {
    idPrefix = prefix;
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
  lottiejs.setVolume = animationManager.setVolume;
  lottiejs.mute = animationManager.mute;
  lottiejs.unmute = animationManager.unmute;
  lottiejs.getRegisteredAnimations = animationManager.getRegisteredAnimations;
  lottie.setIDPrefix = setIDPrefix;
  lottiejs.version = '[[BM_VERSION]]';

  return lottiejs;
}({}));

var animations = [];

onmessage = function (evt) {
  var canvas = evt.data.canvas;
  var ctx = canvas.getContext('2d');
  var animation = lottie.loadAnimation({
    renderer: 'canvas',
    loop: evt.data.loop,
    autoplay: true,
    animationData: evt.data.animationData,
    rendererSettings: {
      context: ctx,
      scaleMode: 'noScale',
      clearCanvas: true,
    },
  });
  animations.push(animation);
  animation.play();
};
