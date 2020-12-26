var lottiejs = (function (window) {
  'use strict';
  /* <%= contents %> */
  var lottiejsLibrary = {};

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
        default:
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

  lottiejsLibrary.play = animationManager.play;
  lottiejsLibrary.pause = animationManager.pause;
  lottiejsLibrary.togglePause = animationManager.togglePause;
  lottiejsLibrary.setSpeed = animationManager.setSpeed;
  lottiejsLibrary.setDirection = animationManager.setDirection;
  lottiejsLibrary.stop = animationManager.stop;
  lottiejsLibrary.registerAnimation = animationManager.registerAnimation;
  lottiejsLibrary.loadAnimation = loadAnimation;
  lottiejsLibrary.resize = animationManager.resize;
  lottiejsLibrary.goToAndStop = animationManager.goToAndStop;
  lottiejsLibrary.destroy = animationManager.destroy;
  lottiejsLibrary.setQuality = setQuality;
  lottiejsLibrary.freeze = animationManager.freeze;
  lottiejsLibrary.unfreeze = animationManager.unfreeze;
  lottie.setVolume = animationManager.setVolume;
  lottie.mute = animationManager.mute;
  lottie.unmute = animationManager.unmute;
  lottiejsLibrary.getRegisteredAnimations = animationManager.getRegisteredAnimations;
  lottiejsLibrary.version = '[[BM_VERSION]]';

  var renderer = '';
  return lottiejsLibrary;
}({}));

var animations = [];

var onmessage = function (evt) {
  var canvas = evt.data.canvas;
  var params = evt.data.params;
  var ctx = canvas.getContext('2d');
  var animation = lottiejs.loadAnimation({
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
