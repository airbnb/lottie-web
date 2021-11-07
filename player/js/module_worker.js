/* global defaultCurveSegments:writable, roundValues, animationManager, idPrefix:writable */
/* exported idPrefix, document */

function workerContent() {
  var localIdCounter = 0;
  var animations = [];

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
      type: type,
      namespace: namespace,
      children: [],
      attributes: {
        id: 'defaultId_' + localIdCounter,
      },
      style: style,
      appendChild: function (child) { this.children.push(child); },
      insertBefore: function (newElement, nextElement) {
        var children = this.children;
        for (var i = 0; i < children.length; i += 1) {
          if (children[i] === nextElement) {
            children.splice(i, 0, newElement);
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

    function loadAnimation(payload) {
      var params = payload.params;
      var wrapper;
      var animation;
      var elements = [];
      if (params.renderer === 'svg') {
        wrapper = document.createElement('div');
        params.container = wrapper;
      } else {
        var canvas = params.canvas;
        var ctx = canvas.getContext('2d');
        params.rendererSettings.context = ctx;
      }
      animation = animationManager.loadAnimation(params);
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
      if (params.renderer === 'svg') {
        animation.addEventListener('DOMLoaded', function () {
          var serialized = wrapper.serialize();
          addElementToList(wrapper, elements);
          self.postMessage({
            type: 'loaded',
            payload: {
              id: payload.id,
              tree: serialized.children[0],
            },
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
            payload: {
              elements: changedElements,
              id: payload.id,
            },
          });
        });
      }
      animations.push(animation);
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
    if (evt.data.type === 'load') {
      lottieInternal.loadAnimation(evt.data.payload);
    }
    // animation.play();
  };
}

function createWorker(fn) {
  var blob = new Blob(['(' + fn.toString()+ '())'], { type: 'text/javascript' });
  var url = URL.createObjectURL(blob);
  return new Worker(url);
}
var lottie = (function () {
  'use strict';

  var workerInstance = createWorker(workerContent);

  var handleAnimationLoaded = (function(payload) {
    function createTree(data, container, map) {
      var elem;
      if (data.type === 'div') {
          elem = document.createElement('div');
      } else {
          elem = document.createElementNS(data.namespace, data.type);
      }
      for (var s in data.attributes) {
          elem.setAttribute(s, data.attributes[s]);
          if (s === 'id') {
              map[data.attributes[s]] = elem;
          }
      }
      for (var s in data.style) {
          elem.style[s] = data.style[s];
      }
      data.children.forEach(function(element) {
          createTree(element, elem, map);
      });
      container.appendChild(elem);
    }
    return function(payload) {
      var animation = animations[payload.id];
      var container = animation.container;
      var elements = animation.elements;
      createTree(payload.tree, container, elements);
    }
  }());

  function handleAnimationUpdate(payload) {
    var changedElements = payload.elements;
    var animation = animations[payload.id];
    var elements = animation.elements;
    changedElements.forEach(function(elementData) {
        var element = elements[elementData.id];
        elementData.styles.forEach(function(style) {
            element.style[style[0]] = style[1];
        })
        elementData.attributes.forEach(function(attribute) {
            element.setAttribute(attribute[0], attribute[1]);
        })
    })
  }

  

  workerInstance.onmessage = function(event) {
    if (event.data.type === 'loaded') {
      handleAnimationLoaded(event.data.payload);
    } else if (event.data.type === 'updated') {
      handleAnimationUpdate(event.data.payload);
    }
}

  var animations = {}

  function resolveAnimationData(params) {
    return new Promise(function(resolve, reject){
      if (params.animationData) {
        resolve(params);
      } else if (params.path) {
        fetch(params.path)
        .then(function (response) {
            return response.json();
        })
        .then(function(animationData) {
          params.animationData = animationData;
          delete params.path;
          resolve(params);
        })
      } else {
        reject()
      }
    })
    
  }
  function loadAnimation(params) {
    resolveAnimationData(params)
    .then(function(params) {
      var animationId = Math.random().toString();
      var animation = {
        elements: {},
      }
      if (params.container) {
        animation.container = params.container;
        delete params.container;
      }
      animations[animationId] = animation;
      workerInstance.postMessage({
        type: 'load',
        payload: {
          params: params,
          id: animationId,
        }
      })
    });
  }

  var lottiejs = {
    loadAnimation: loadAnimation,
  };
  return lottiejs;
}());