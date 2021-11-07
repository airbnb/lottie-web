/* global defaultCurveSegments:writable, roundValues, animationManager, idPrefix:writable */
/* exported idPrefix, document */

/*eslint-disable */
var localIdCounter = 0;

function insertBefore(element, nextElement) {
  var children = this.children;
  for(var i = 0; i < children.length; i += 1) {
    if(children[i] === nextElement) {
      children.splice(i, 0, element);
      return;
    }
  }
  children.push(nextElement);
}

var styleProperties = ['width', 'height', 'display', 'transform', 'opacity', 'contentVisibility'];
function createElement(namespace, type) {
  var style = {
    serialize: function() {
      var obj = {};
      for(var i = 0; i < styleProperties.length; i+= 1) {
        var propertyKey = styleProperties[i];
        var keyName = '_' + propertyKey;
        if (keyName in this) {
          obj[propertyKey] = this[keyName];
        }
      }
      return obj;
    }
  };
  styleProperties.forEach(function(propertyKey) {
    Object.defineProperty(style, propertyKey, {
      set: function(value) {
        if (!element._isDirty) {
          element._isDirty = true;
        }
        element._changedStyles.push(propertyKey);
        var keyName = '_' + propertyKey;
        this[keyName] = value;
      },
      get: function() {
        var keyName = '_' + propertyKey;
        return this[keyName];
      }
    })
  })
  var element = {
    _state: 'init',
    _isDirty: false,
    _changedStyles: [],
    _changedAttributes: [],
    type: type,
    namespace: namespace,
    children: [],
    attributes: {
      id: 'defaultId_' + localIdCounter++,
    },
    style: style,
    appendChild: function(child) {this.children.push(child)},
    insertBefore: function (element, nextElement) {
      var children = this.children;
      for(var i = 0; i < children.length; i += 1) {
        if(children[i] === nextElement) {
          children.splice(i, 0, element);
          return;
        }
      }
      children.push(nextElement);
    },
    setAttribute: function(attribute, value) {
      this.attributes[attribute] = value;
      if (!element._isDirty) {
        element._isDirty = true;
      }
      element._changedAttributes.push(attribute);
    },
    serialize: function() {
      return {
        type: this.type,
        namespace: this.namespace,
        style: this.style.serialize(),
        attributes: this.attributes,
        children: this.children.map(function(child){return child.serialize()}),
      }
    },
    getContext: function() {return {fillRect: function(){}}},
  }
  element.style = style;
  return element;
}

var document = {
  createElementNS: function(namespace, type) {
    return createElement(namespace, type);
  },
  createElement: function(type) {
    return createElement('', type);
  }
};
/* eslint-enable */
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
  lottiejs.setIDPrefix = setIDPrefix;
  lottiejs.version = '[[BM_VERSION]]';

  return lottiejs;
}({}));

var animations = [];
var wrapper;

onmessage = function (evt) {
  var animation;
  var elements = [];
  if (evt.data.renderer === 'svg') {
    wrapper = document.createElement('div');
    animation = lottie.loadAnimation({
      wrapper: wrapper,
      renderer: 'svg',
      loop: evt.data.loop,
      autoplay: evt.data.autoplay,
      animationData: evt.data.animationData,
      rendererSettings: {
        scaleMode: 'noScale',
      },
    });
  } else {
    var canvas = evt.data.canvas;
    var ctx = canvas.getContext('2d');
    animation = lottie.loadAnimation({
      renderer: 'canvas',
      loop: evt.data.loop,
      autoplay: evt.data.autoplay,
      animationData: evt.data.animationData,
      rendererSettings: {
        context: ctx,
        scaleMode: 'noScale',
        clearCanvas: true,
      },
    });
  }
  animation.setSubframe(false);
  animation.addEventListener('error', function (error) {
    console.log(error); // eslint-disable-line
  });
  animation.onError = function (error) {
    console.log('ERRORO', error); // eslint-disable-line
  };
  function addElementToList(element, list) {
    list.push(element);
    element._isDirty = false;
    element.children.forEach(function (child) {
      addElementToList(child, list);
    });
  }
  if (evt.data.renderer === 'svg') {
    animation.addEventListener('DOMLoaded', function () {
      var serialized = wrapper.serialize();
      addElementToList(wrapper, elements);
      self.postMessage({
        type: 'loaded',
        payload: serialized,
      });
    });
    animation.addEventListener('enterFrame', function () {
      var changedElements = [];
      var element;
      for (var i = 0; i < elements.length; i += 1) {
        element = elements[i];
        if (element._isDirty) {
          var changedElement = {
            id: element.attributes.id,
            styles: [],
            attributes: [],
          };
          /*eslint-disable */
          element._changedAttributes.forEach(function(attribute) {
            changedElement.attributes.push([attribute, element.attributes[attribute]]);
          });
          element._changedStyles.forEach(function(style) {
            changedElement.styles.push([style, element.style[style]]);
          });
          
          /*eslint-enabled */
          changedElements.push(changedElement);
          element._isDirty = false;
          element._changedAttributes.length = 0;
          element._changedStyles.length = 0;
        }
      }
      self.postMessage({
        type: 'updated',
        payload: changedElements,
      });
    });
  }
  animations.push(animation);
  // animation.play();
};
