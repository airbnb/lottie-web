/* global AnimationItem */
/* exported animationManager */

var animationManager = (function () {
  var moduleOb = {};
  var registeredAnimations = [];
  var initTime = 0;
  var len = 0;
  var playingAnimationsNum = 0;
  var _stopped = true;
  var _isFrozen = false;

  function removeElement(ev) {
    var i = 0;
    var animItem = ev.target;
    while (i < len) {
      if (registeredAnimations[i].animation === animItem) {
        registeredAnimations.splice(i, 1);
        i -= 1;
        len -= 1;
        if (!animItem.isPaused) {
          subtractPlayingCount();
        }
      }
      i += 1;
    }
  }

  function registerAnimation(element, animationData) {
    if (!element) {
      return null;
    }
    var i = 0;
    while (i < len) {
      if (registeredAnimations[i].elem === element && registeredAnimations[i].elem !== null) {
        return registeredAnimations[i].animation;
      }
      i += 1;
    }
    var animItem = new AnimationItem();
    setupAnimation(animItem, element);
    animItem.setData(element, animationData);
    return animItem;
  }

  function getRegisteredAnimations() {
    var i;
    var lenAnims = registeredAnimations.length;
    var animations = [];
    for (i = 0; i < lenAnims; i += 1) {
      animations.push(registeredAnimations[i].animation);
    }
    return animations;
  }

  function addPlayingCount() {
    playingAnimationsNum += 1;
    activate();
  }

  function subtractPlayingCount() {
    playingAnimationsNum -= 1;
  }

  function setupAnimation(animItem, element) {
    animItem.addEventListener('destroy', removeElement);
    animItem.addEventListener('_active', addPlayingCount);
    animItem.addEventListener('_idle', subtractPlayingCount);
    registeredAnimations.push({ elem: element, animation: animItem });
    len += 1;
  }

  function loadAnimation(params) {
    var animItem = new AnimationItem();
    setupAnimation(animItem, null);
    animItem.setParams(params);
    return animItem;
  }

  function setSpeed(val, animation) {
    var i;
    for (i = 0; i < len; i += 1) {
      registeredAnimations[i].animation.setSpeed(val, animation);
    }
  }

  function setDirection(val, animation) {
    var i;
    for (i = 0; i < len; i += 1) {
      registeredAnimations[i].animation.setDirection(val, animation);
    }
  }

  function play(animation) {
    var i;
    for (i = 0; i < len; i += 1) {
      registeredAnimations[i].animation.play(animation);
    }
  }
  function resume(nowTime) {
    var elapsedTime = nowTime - initTime;
    var i;
    for (i = 0; i < len; i += 1) {
      registeredAnimations[i].animation.advanceTime(elapsedTime);
    }
    initTime = nowTime;
    if (playingAnimationsNum && !_isFrozen) {
      requestAnimationFrame(resume);
    } else {
      _stopped = true;
    }
  }

  function first(nowTime) {
    initTime = nowTime;
    requestAnimationFrame(resume);
  }

  function pause(animation) {
    var i;
    for (i = 0; i < len; i += 1) {
      registeredAnimations[i].animation.pause(animation);
    }
  }

  function goToAndStop(value, isFrame, animation) {
    var i;
    for (i = 0; i < len; i += 1) {
      registeredAnimations[i].animation.goToAndStop(value, isFrame, animation);
    }
  }

  function stop(animation) {
    var i;
    for (i = 0; i < len; i += 1) {
      registeredAnimations[i].animation.stop(animation);
    }
  }

  function togglePause(animation) {
    var i;
    for (i = 0; i < len; i += 1) {
      registeredAnimations[i].animation.togglePause(animation);
    }
  }

  function destroy(animation) {
    var i;
    for (i = (len - 1); i >= 0; i -= 1) {
      registeredAnimations[i].animation.destroy(animation);
    }
  }

  function searchAnimations() {
    throw new Error('Cannot access DOM from worker thread');
  }

  function resize() {
    var i;
    for (i = 0; i < len; i += 1) {
      registeredAnimations[i].animation.resize();
    }
  }

  function activate() {
    if (!_isFrozen && playingAnimationsNum) {
      if (_stopped) {
        requestAnimationFrame(first);
        _stopped = false;
      }
    }
  }

  function freeze() {
    _isFrozen = true;
  }

  function unfreeze() {
    _isFrozen = false;
    activate();
  }

  moduleOb.registerAnimation = registerAnimation;
  moduleOb.loadAnimation = loadAnimation;
  moduleOb.setSpeed = setSpeed;
  moduleOb.setDirection = setDirection;
  moduleOb.play = play;
  moduleOb.pause = pause;
  moduleOb.stop = stop;
  moduleOb.togglePause = togglePause;
  moduleOb.searchAnimations = searchAnimations;
  moduleOb.resize = resize;
  // moduleOb.start = start;
  moduleOb.goToAndStop = goToAndStop;
  moduleOb.destroy = destroy;
  moduleOb.freeze = freeze;
  moduleOb.unfreeze = unfreeze;
  moduleOb.getRegisteredAnimations = getRegisteredAnimations;
  return moduleOb;
}());
