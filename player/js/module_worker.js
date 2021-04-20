/* global defaultCurveSegments:writable, roundValues, animationManager */
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
  lottiejs.version = '[[BM_VERSION]]';

  return lottiejs;
}({}));

var currentAnimation = null;

function initAnimation(data, params, canvas) {
  if (!data || !params) {
    return;
  }

  var context = canvas.getContext('2d');

  currentAnimation = lottie.loadAnimation({
    renderer: 'canvas',
    loop: params.loop,
    autoplay: params.autoplay,
    animationData: data,
    rendererSettings: {
      context: context,
      clearCanvas: params.rendererSettings.clearCanvas,
      preserveAspectRatio: params.rendererSettings.preserveAspectRatio,
    },
  });

  if (params.autoplay) {
    currentAnimation.play();
  }
}

function updateCanvasSize(canvas, size) {
  if (!size || !canvas) {
    return;
  }

  if (size.height > 0 && size.width > 0) {
    canvas.height = size.height;
    canvas.width = size.width;
  }

  if (currentAnimation) {
    currentAnimation.resize();
  }
}

function updateAnimationState(control, canvas) {
  if (!control || !currentAnimation) {
    return;
  }

  if (control.stop) {
    currentAnimation.stop();
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  if (control.play && currentAnimation.isPaused) {
    currentAnimation.play();
  } else if (!control.play && !currentAnimation.isPaused) {
    currentAnimation.pause();
  }
}

onmessage = function (evt) {
  if (!evt || !evt.data) {
    return;
  }

  var canvas = null;

  if (currentAnimation) {
    canvas = currentAnimation.renderer.canvasContext.canvas;
  } else if (evt.data.canvas) {
    canvas = evt.data.canvas;
  } else {
    return;
  }

  if (currentAnimation && evt.data.animationData) {
    currentAnimation.stop();
    currentAnimation = null;
  }

  updateCanvasSize(canvas, evt.data.drawSize);
  initAnimation(evt.data.animationData, evt.data.params, canvas);
  updateAnimationState(evt.data.control, canvas);
};
