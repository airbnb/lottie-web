/* global defaultCurveSegments:writable, roundValues, animationManager, idPrefix:writable */
/* exported idPrefix, document */

function workerContent() {
  var localIdCounter = 0;
  var animations = {};

  var styleProperties = ['width', 'height', 'display', 'transform', 'opacity', 'contentVisibility'];
  function createElement(namespace, type) {
    var style = {
      serialize: function () {
        var obj = {};
        for (var i = 0; i < styleProperties.length; i += 1) {
          var propertyKey = styleProperties[i];
          var keyName = '_' + propertyKey;
          if (keyName in this) {
            obj[propertyKey] = this[keyName];
          }
        }
        return obj;
      },
    };
    styleProperties.forEach(function (propertyKey) {
      Object.defineProperty(style, propertyKey, {
        set: function (value) {
          if (!element._isDirty) {
            element._isDirty = true;
          }
          element._changedStyles.push(propertyKey);
          var keyName = '_' + propertyKey;
          this[keyName] = value;
        },
        get: function () {
          var keyName = '_' + propertyKey;
          return this[keyName];
        },
      });
    });
    localIdCounter += 1;
    var element = {
      _state: 'init',
      _isDirty: false,
      _changedStyles: [],
      _changedAttributes: [],
      _changedElements: [],
      type: type,
      namespace: namespace,
      children: [],
      attributes: {
        id: 'l_d_' + localIdCounter,
      },
      style: style,
      appendChild: function (child) {
        child.parentNode = this;
        this.children.push(child);
        this._isDirty = true;
        this._changedElements.push([child, this.attributes.id]);
      },
      insertBefore: function (newElement, nextElement) {
        var children = this.children;
        for (var i = 0; i < children.length; i += 1) {
          if (children[i] === nextElement) {
            children.splice(i, 0, newElement);
            this._isDirty = true;
            this._changedElements.push([newElement, this.attributes.id, nextElement.attributes.id]);
            return;
          }
        }
        children.push(nextElement);
      },
      setAttribute: function (attribute, value) {
        this.attributes[attribute] = value;
        if (!element._isDirty) {
          element._isDirty = true;
        }
        element._changedAttributes.push(attribute);
      },
      serialize: function () {
        return {
          type: this.type,
          namespace: this.namespace,
          style: this.style.serialize(),
          attributes: this.attributes,
          children: this.children.map(function (child) { return child.serialize(); }),
        };
      },
      getContext: function () { return { fillRect: function () {} }; },
      addEventListener: function (_, callback) {
        setTimeout(callback, 1);
      },
      setAttributeNS: function (_, attribute, value) {
        this.attributes[attribute] = value;
        if (!element._isDirty) {
          element._isDirty = true;
        }
        element._changedAttributes.push(attribute);
      },
    };
    element.style = style;
    return element;
  }

  var window = self; // eslint-disable-line no-redeclare, no-unused-vars

  var document = { // eslint-disable-line no-redeclare
    createElementNS: function (namespace, type) {
      return createElement(namespace, type);
    },
    createElement: function (type) {
      return createElement('', type);
    },
  };
  /* eslint-enable */
  var lottieInternal = (function () {
    'use strict';

    /* <%= contents %> */
    var lottiejs = {};

    function addElementToList(element, list) {
      list.push(element);
      element._isDirty = false;
      element._changedStyles.length = 0;
      element._changedAttributes.length = 0;
      element._changedElements.length = 0;
      element.children.forEach(function (child) {
        addElementToList(child, list);
      });
    }

    function addChangedAttributes(element) {
      var changedAttributes = element._changedAttributes;
      var attributes = [];
      var attribute;
      for (var i = 0; i < changedAttributes.length; i += 1) {
        attribute = changedAttributes[i];
        attributes.push([attribute, element.attributes[attribute]]);
      }
      return attributes;
    }

    function addChangedStyles(element) {
      var changedStyles = element._changedStyles;
      var styles = [];
      var style;
      for (var i = 0; i < changedStyles.length; i += 1) {
        style = changedStyles[i];
        styles.push([style, element.style[style]]);
      }
      return styles;
    }

    function addChangedElements(element, elements) {
      var changedElements = element._changedElements;
      var elementsList = [];
      var elementData;
      for (var i = 0; i < changedElements.length; i += 1) {
        elementData = changedElements[i];
        elementsList.push([elementData[0].serialize(), elementData[1], elementData[2]]);
        addElementToList(elementData[0], elements);
      }
      return elementsList;
    }

    function loadAnimation(payload) {
      var params = payload.params;
      var wrapper;
      var animation;
      var elements = [];
      if (params.renderer === 'svg') {
        wrapper = document.createElement('div');
        params.container = wrapper;
      } else {
        var canvas = params.rendererSettings.canvas;
        var ctx = canvas.getContext('2d');
        params.rendererSettings.context = ctx;
      }
      animation = animationManager.loadAnimation(params);
      animation.addEventListener('error', function (error) {
        console.log(error); // eslint-disable-line
      });
      animation.onError = function (error) {
        console.log('ERRORO', error); // eslint-disable-line
      };
      if (params.renderer === 'svg') {
        animation.addEventListener('DOMLoaded', function () {
          var serialized = wrapper.serialize();
          addElementToList(wrapper, elements);
          self.postMessage({
            type: 'loaded',
            payload: {
              id: payload.id,
              tree: serialized.children[0],
              totalFrames: animation.totalFrames,
              frameRate: animation.frameRate,
            },
          });
        });
        animation.addEventListener('drawnFrame', function (event) {
          var changedElements = [];
          var element;
          for (var i = 0; i < elements.length; i += 1) {
            element = elements[i];
            if (element._isDirty) {
              var changedElement = {
                id: element.attributes.id,
                styles: addChangedStyles(element),
                attributes: addChangedAttributes(element),
                elements: addChangedElements(element, elements),
              };
              changedElements.push(changedElement);
              element._isDirty = false;
              element._changedAttributes.length = 0;
              element._changedStyles.length = 0;
              element._changedElements.length = 0;
            }
          }
          self.postMessage({
            type: 'updated',
            payload: {
              elements: changedElements,
              id: payload.id,
              currentTime: event.currentTime,
            },
          });
        });
      }
      animations[payload.id] = animation;
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
  onmessage = function (evt) {
    var data = evt.data;
    var type = data.type;
    var payload = data.payload;
    if (type === 'load') {
      lottieInternal.loadAnimation(payload);
    } else if (type === 'pause') {
      if (animations[payload.id]) {
        animations[payload.id].pause();
      }
    } else if (type === 'play') {
      if (animations[payload.id]) {
        animations[payload.id].play();
      }
    } else if (type === 'stop') {
      if (animations[payload.id]) {
        animations[payload.id].stop();
      }
    } else if (type === 'setSpeed') {
      if (animations[payload.id]) {
        animations[payload.id].setSpeed(payload.value);
      }
    } else if (type === 'setDirection') {
      if (animations[payload.id]) {
        animations[payload.id].setDirection(payload.value);
      }
    } else if (type === 'setDirection') {
      if (animations[payload.id]) {
        animations[payload.id].setDirection(payload.value);
      }
    } else if (type === 'goToAndPlay') {
      if (animations[payload.id]) {
        animations[payload.id].goToAndPlay(payload.value, payload.isFrame);
      }
    } else if (type === 'goToAndStop') {
      if (animations[payload.id]) {
        animations[payload.id].goToAndStop(payload.value, payload.isFrame);
      }
    } else if (type === 'setSubframe') {
      if (animations[payload.id]) {
        animations[payload.id].setSubframe(payload.value);
      }
    } else if (type === 'addEventListener') {
      if (animations[payload.id]) {
        animations[payload.id].addEventListener(payload.eventName, function () {
          self.postMessage({
            type: 'event',
            payload: {
              id: payload.id,
              callbackId: payload.callbackId,
              argument: arguments[0],
            },
          });
        });
      }
    } else if (type === 'destroy') {
      if (animations[payload.id]) {
        animations[payload.id].destroy();
        animations[payload.id] = null;
      }
    } else if (type === 'resize') {
      if (animations[payload.id]) {
        animations[payload.id].resize();
      }
    }
  };
}

function createWorker(fn) {
  var blob = new Blob(['(' + fn.toString() + '())'], { type: 'text/javascript' });
  var url = URL.createObjectURL(blob);
  return new Worker(url);
}
// eslint-disable-next-line no-unused-vars
var lottie = (function () {
  'use strict';

  var workerInstance = createWorker(workerContent);
  var animationIdCounter = 0;
  var eventsIdCounter = 0;
  var animations = {};
  var defaultSettings = {
    rendererSettings: {},
  };

  function createTree(data, container, map, afterElement) {
    var elem;
    if (data.type === 'div') {
      elem = document.createElement('div');
    } else {
      elem = document.createElementNS(data.namespace, data.type);
    }
    for (var attr in data.attributes) {
      if (Object.prototype.hasOwnProperty.call(data.attributes, attr)) {
        if (attr === 'href') {
          elem.setAttributeNS('http://www.w3.org/1999/xlink', attr, data.attributes[attr]);
        } else {
          elem.setAttribute(attr, data.attributes[attr]);
        }
        if (attr === 'id') {
          map[data.attributes[attr]] = elem;
        }
      }
    }
    for (var style in data.style) {
      if (Object.prototype.hasOwnProperty.call(data.style, style)) {
        elem.style[style] = data.style[style];
      }
    }
    data.children.forEach(function (element) {
      createTree(element, elem, map);
    });
    if (!afterElement) {
      container.appendChild(elem);
    } else {
      container.insertBefore(elem, afterElement);
    }
  }

  var handleAnimationLoaded = (function () {
    return function (payload) {
      var animation = animations[payload.id];
      animation._loaded = true;
      // if callbacks have been added before the animation has loaded
      animation.pendingCallbacks.forEach(function (callbackData) {
        animation.animInstance.addEventListener(callbackData.eventName, callbackData.callback);
        if (callbackData.eventName === 'DOMLoaded') {
          callbackData.callback();
        }
      });
      animation.animInstance.totalFrames = payload.totalFrames;
      animation.animInstance.frameRate = payload.frameRate;
      var container = animation.container;
      var elements = animation.elements;
      createTree(payload.tree, container, elements);
    };
  }());

  function addNewElements(newElements, elements) {
    var element;
    for (var i = 0; i < newElements.length; i += 1) {
      element = newElements[i];
      var parent = elements[element[1]];
      if (parent) {
        var sibling;
        if (element[2]) {
          sibling = elements[element[2]];
        }
        createTree(element[0], parent, elements, sibling);
        newElements.splice(i, 1);
        i -= 1;
      }
    }
  }

  function updateElementStyles(element, styles) {
    var style;
    for (var i = 0; i < styles.length; i += 1) {
      style = styles[i];
      element.style[style[0]] = style[1];
    }
  }

  function updateElementAttributes(element, attributes) {
    var attribute;
    for (var i = 0; i < attributes.length; i += 1) {
      attribute = attributes[i];
      element.setAttribute(attribute[0], attribute[1]);
    }
  }

  function handleAnimationUpdate(payload) {
    var changedElements = payload.elements;
    var animation = animations[payload.id];
    if (animation) {
      var elements = animation.elements;
      var elementData;
      for (var i = 0; i < changedElements.length; i += 1) {
        elementData = changedElements[i];
        var element = elements[elementData.id];
        addNewElements(elementData.elements, elements);
        updateElementStyles(element, elementData.styles);
        updateElementAttributes(element, elementData.attributes);
      }
      animation.animInstance.currentFrame = payload.currentTime;
    }
  }

  function handleEvent(payload) {
    var animation = animations[payload.id];
    if (animation) {
      var callbacks = animation.callbacks;
      if (callbacks[payload.callbackId]) {
        callbacks[payload.callbackId](payload.argument);
      }
    }
  }

  workerInstance.onmessage = function (event) {
    if (event.data.type === 'loaded') {
      handleAnimationLoaded(event.data.payload);
    } else if (event.data.type === 'updated') {
      handleAnimationUpdate(event.data.payload);
    } else if (event.data.type === 'event') {
      handleEvent(event.data.payload);
    }
  };

  function resolveAnimationData(params) {
    return new Promise(function (resolve, reject) {
      var paramsCopy = Object.assign({}, defaultSettings, params);
      if (paramsCopy.animType && !paramsCopy.renderer) {
        paramsCopy.renderer = paramsCopy.animType;
      }
      if (paramsCopy.wrapper) {
        if (!paramsCopy.container) {
          paramsCopy.container = paramsCopy.wrapper;
        }
        delete paramsCopy.wrapper;
      }
      if (paramsCopy.animationData) {
        resolve(paramsCopy);
      } else if (paramsCopy.path) {
        fetch(paramsCopy.path)
          .then(function (response) {
            return response.json();
          })
          .then(function (animationData) {
            paramsCopy.animationData = animationData;
            delete paramsCopy.path;
            resolve(paramsCopy);
          });
      } else {
        reject();
      }
    });
  }

  function loadAnimation(params) {
    animationIdCounter += 1;
    var animationId = 'lottie_animationId_' + animationIdCounter;
    var animation = {
      elements: {},
      callbacks: {},
      pendingCallbacks: [],
    };
    var animInstance = {
      id: animationId,
      pause: function () {
        workerInstance.postMessage({
          type: 'pause',
          payload: {
            id: animationId,
          },
        });
      },
      play: function () {
        workerInstance.postMessage({
          type: 'play',
          payload: {
            id: animationId,
          },
        });
      },
      stop: function () {
        workerInstance.postMessage({
          type: 'stop',
          payload: {
            id: animationId,
          },
        });
      },
      setSpeed: function (value) {
        workerInstance.postMessage({
          type: 'setSpeed',
          payload: {
            id: animationId,
            value: value,
          },
        });
      },
      setDirection: function (value) {
        workerInstance.postMessage({
          type: 'setDirection',
          payload: {
            id: animationId,
            value: value,
          },
        });
      },
      goToAndStop: function (value, isFrame) {
        workerInstance.postMessage({
          type: 'goToAndStop',
          payload: {
            id: animationId,
            value: value,
            isFrame: isFrame,
          },
        });
      },
      goToAndPlay: function (value, isFrame) {
        workerInstance.postMessage({
          type: 'goToAndPlay',
          payload: {
            id: animationId,
            value: value,
            isFrame: isFrame,
          },
        });
      },
      setSubframe: function (value) {
        workerInstance.postMessage({
          type: 'setSubframe',
          payload: {
            id: animationId,
            value: value,
          },
        });
      },
      addEventListener: function (eventName, callback) {
        if (!animation._loaded) {
          animation.pendingCallbacks.push({
            eventName: eventName,
            callback: callback,
          });
        } else {
          eventsIdCounter += 1;
          var callbackId = 'callback_' + eventsIdCounter;
          animation.callbacks[callbackId] = callback;
          workerInstance.postMessage({
            type: 'addEventListener',
            payload: {
              id: animationId,
              callbackId: callbackId,
              eventName: eventName,
            },
          });
        }
      },
      destroy: function () {
        animations[animationId] = null;
        if (animation.container) {
          animation.container.innerHTML = '';
        }
        workerInstance.postMessage({
          type: 'destroy',
          payload: {
            id: animationId,
          },
        });
      },
      resize: function () {
        workerInstance.postMessage({
          type: 'resize',
          payload: {
            id: animationId,
          },
        });
      },
    };
    animation.animInstance = animInstance;
    resolveAnimationData(params)
      .then(function (animationParams) {
        var transferedObjects = [];
        if (animationParams.container) {
          animation.container = animationParams.container;
          delete animationParams.container;
        }
        if (animationParams.renderer === 'canvas' && !animationParams.rendererSettings.canvas) {
          var canvas = document.createElement('canvas');
          animation.container.appendChild(canvas);
          canvas.width = animationParams.animationData.w;
          canvas.height = animationParams.animationData.h;
          canvas.style.width = '100%';
          canvas.style.height = '100%';
          var offscreen = canvas.transferControlToOffscreen();
          transferedObjects.push(offscreen);
          animationParams.rendererSettings.canvas = offscreen;
        }
        animations[animationId] = animation;
        workerInstance.postMessage({
          type: 'load',
          payload: {
            params: animationParams,
            id: animationId,
          },
        }, transferedObjects);
      });
    return animInstance;
  }

  var lottiejs = {
    loadAnimation: loadAnimation,
  };
  return lottiejs;
}());
