import {
  extendPrototype,
} from '../utils/functionExtensions';

import audioControllerFactory from '../utils/audio/AudioController';
import {
  getSubframeEnabled,
  BMEnterFrameEvent,
  BMCompleteEvent,
  BMCompleteLoopEvent,
  BMSegmentStartEvent,
  BMDestroyEvent,
  BMRenderFrameErrorEvent,
  BMConfigErrorEvent,
  createElementID,
  getExpressionsPlugin,
} from '../utils/common';
import ImagePreloader from '../utils/imagePreloader';
import BaseEvent from '../utils/BaseEvent';
import dataManager from '../utils/DataManager';
import markerParser from '../utils/markers/markerParser';
import ProjectInterface from '../utils/expressions/ProjectInterface';
import { getRenderer, getRegisteredRenderer } from '../renderers/renderersManager';

const AnimationItem = function () {
  this._cbs = [];
  this.name = '';
  this.path = '';
  this.isLoaded = false;
  this.currentFrame = 0;
  this.currentRawFrame = 0;
  this.firstFrame = 0;
  this.totalFrames = 0;
  this.frameRate = 0;
  this.frameMult = 0;
  this.playSpeed = 1;
  this.playDirection = 1;
  this.playCount = 0;
  this.animationData = {};
  this.assets = [];
  this.isPaused = true;
  this.autoplay = false;
  this.loop = true;
  this.renderer = null;
  this.animationID = createElementID();
  this.assetsPath = '';
  this.timeCompleted = 0;
  this.segmentPos = 0;
  this.isSubframeEnabled = getSubframeEnabled();
  this.segments = [];
  this._idle = true;
  this._completedLoop = false;
  this.projectInterface = ProjectInterface();
  this.imagePreloader = new ImagePreloader();
  this.audioController = audioControllerFactory();
  this.markers = [];
  this.configAnimation = this.configAnimation.bind(this);
  this.onSetupError = this.onSetupError.bind(this);
  this.onSegmentComplete = this.onSegmentComplete.bind(this);
  this.drawnFrameEvent = new BMEnterFrameEvent('drawnFrame', 0, 0, 0);
};

extendPrototype([BaseEvent], AnimationItem);

AnimationItem.prototype.setParams = function (params) {
  if (params.wrapper || params.container) {
    this.wrapper = params.wrapper || params.container;
  }
  var animType = 'svg';
  if (params.animType) {
    animType = params.animType;
  } else if (params.renderer) {
    animType = params.renderer;
  }
  const RendererClass = getRenderer(animType);
  this.renderer = new RendererClass(this, params.rendererSettings);
  this.imagePreloader.setCacheType(animType, this.renderer.globalData.defs);
  this.renderer.setProjectInterface(this.projectInterface);
  this.animType = animType;
  if (params.loop === ''
        || params.loop === null
        || params.loop === undefined
        || params.loop === true) {
    this.loop = true;
  } else if (params.loop === false) {
    this.loop = false;
  } else {
    this.loop = parseInt(params.loop, 10);
  }
  this.autoplay = 'autoplay' in params ? params.autoplay : true;
  this.name = params.name ? params.name : '';
  this.autoloadSegments = Object.prototype.hasOwnProperty.call(params, 'autoloadSegments') ? params.autoloadSegments : true;
  this.assetsPath = params.assetsPath;
  this.initialSegment = params.initialSegment;
  if (params.audioFactory) {
    this.audioController.setAudioFactory(params.audioFactory);
  }
  if (params.animationData) {
    this.setupAnimation(params.animationData);
  } else if (params.path) {
    if (params.path.lastIndexOf('\\') !== -1) {
      this.path = params.path.substr(0, params.path.lastIndexOf('\\') + 1);
    } else {
      this.path = params.path.substr(0, params.path.lastIndexOf('/') + 1);
    }
    this.fileName = params.path.substr(params.path.lastIndexOf('/') + 1);
    this.fileName = this.fileName.substr(0, this.fileName.lastIndexOf('.json'));
    dataManager.loadAnimation(
      params.path,
      this.configAnimation,
      this.onSetupError
    );
  }
};

AnimationItem.prototype.onSetupError = function () {
  this.trigger('data_failed');
};

AnimationItem.prototype.setupAnimation = function (data) {
  dataManager.completeAnimation(
    data,
    this.configAnimation
  );
};

AnimationItem.prototype.setData = function (wrapper, animationData) {
  if (animationData) {
    if (typeof animationData !== 'object') {
      animationData = JSON.parse(animationData);
    }
  }
  var params = {
    wrapper: wrapper,
    animationData: animationData,
  };
  var wrapperAttributes = wrapper.attributes;

  params.path = wrapperAttributes.getNamedItem('data-animation-path') // eslint-disable-line no-nested-ternary
    ? wrapperAttributes.getNamedItem('data-animation-path').value
    : wrapperAttributes.getNamedItem('data-bm-path') // eslint-disable-line no-nested-ternary
      ? wrapperAttributes.getNamedItem('data-bm-path').value
      : wrapperAttributes.getNamedItem('bm-path')
        ? wrapperAttributes.getNamedItem('bm-path').value
        : '';
  params.animType = wrapperAttributes.getNamedItem('data-anim-type') // eslint-disable-line no-nested-ternary
    ? wrapperAttributes.getNamedItem('data-anim-type').value
    : wrapperAttributes.getNamedItem('data-bm-type') // eslint-disable-line no-nested-ternary
      ? wrapperAttributes.getNamedItem('data-bm-type').value
      : wrapperAttributes.getNamedItem('bm-type') // eslint-disable-line no-nested-ternary
        ? wrapperAttributes.getNamedItem('bm-type').value
        : wrapperAttributes.getNamedItem('data-bm-renderer') // eslint-disable-line no-nested-ternary
          ? wrapperAttributes.getNamedItem('data-bm-renderer').value
          : wrapperAttributes.getNamedItem('bm-renderer')
            ? wrapperAttributes.getNamedItem('bm-renderer').value
            : getRegisteredRenderer() || 'canvas';

  var loop = wrapperAttributes.getNamedItem('data-anim-loop') // eslint-disable-line no-nested-ternary
    ? wrapperAttributes.getNamedItem('data-anim-loop').value
    : wrapperAttributes.getNamedItem('data-bm-loop') // eslint-disable-line no-nested-ternary
      ? wrapperAttributes.getNamedItem('data-bm-loop').value
      : wrapperAttributes.getNamedItem('bm-loop')
        ? wrapperAttributes.getNamedItem('bm-loop').value
        : '';
  if (loop === 'false') {
    params.loop = false;
  } else if (loop === 'true') {
    params.loop = true;
  } else if (loop !== '') {
    params.loop = parseInt(loop, 10);
  }
  var autoplay = wrapperAttributes.getNamedItem('data-anim-autoplay') // eslint-disable-line no-nested-ternary
    ? wrapperAttributes.getNamedItem('data-anim-autoplay').value
    : wrapperAttributes.getNamedItem('data-bm-autoplay') // eslint-disable-line no-nested-ternary
      ? wrapperAttributes.getNamedItem('data-bm-autoplay').value
      : wrapperAttributes.getNamedItem('bm-autoplay')
        ? wrapperAttributes.getNamedItem('bm-autoplay').value
        : true;
  params.autoplay = autoplay !== 'false';

  params.name = wrapperAttributes.getNamedItem('data-name') // eslint-disable-line no-nested-ternary
    ? wrapperAttributes.getNamedItem('data-name').value
    : wrapperAttributes.getNamedItem('data-bm-name') // eslint-disable-line no-nested-ternary
      ? wrapperAttributes.getNamedItem('data-bm-name').value
      : wrapperAttributes.getNamedItem('bm-name')
        ? wrapperAttributes.getNamedItem('bm-name').value
        : '';
  var prerender = wrapperAttributes.getNamedItem('data-anim-prerender') // eslint-disable-line no-nested-ternary
    ? wrapperAttributes.getNamedItem('data-anim-prerender').value
    : wrapperAttributes.getNamedItem('data-bm-prerender') // eslint-disable-line no-nested-ternary
      ? wrapperAttributes.getNamedItem('data-bm-prerender').value
      : wrapperAttributes.getNamedItem('bm-prerender')
        ? wrapperAttributes.getNamedItem('bm-prerender').value
        : '';

  if (prerender === 'false') {
    params.prerender = false;
  }
  if (!params.path) {
    this.trigger('destroy');
  } else {
    this.setParams(params);
  }
};

AnimationItem.prototype.includeLayers = function (data) {
  if (data.op > this.animationData.op) {
    this.animationData.op = data.op;
    this.totalFrames = Math.floor(data.op - this.animationData.ip);
  }
  var layers = this.animationData.layers;
  var i;
  var len = layers.length;
  var newLayers = data.layers;
  var j;
  var jLen = newLayers.length;
  for (j = 0; j < jLen; j += 1) {
    i = 0;
    while (i < len) {
      if (layers[i].id === newLayers[j].id) {
        layers[i] = newLayers[j];
        break;
      }
      i += 1;
    }
  }
  if (data.chars || data.fonts) {
    this.renderer.globalData.fontManager.addChars(data.chars);
    this.renderer.globalData.fontManager.addFonts(data.fonts, this.renderer.globalData.defs);
  }
  if (data.assets) {
    len = data.assets.length;
    for (i = 0; i < len; i += 1) {
      this.animationData.assets.push(data.assets[i]);
    }
  }
  this.animationData.__complete = false;
  dataManager.completeAnimation(
    this.animationData,
    this.onSegmentComplete
  );
};

AnimationItem.prototype.onSegmentComplete = function (data) {
  this.animationData = data;
  var expressionsPlugin = getExpressionsPlugin();
  if (expressionsPlugin) {
    expressionsPlugin.initExpressions(this);
  }
  this.loadNextSegment();
};

AnimationItem.prototype.loadNextSegment = function () {
  var segments = this.animationData.segments;
  if (!segments || segments.length === 0 || !this.autoloadSegments) {
    this.trigger('data_ready');
    this.timeCompleted = this.totalFrames;
    return;
  }
  var segment = segments.shift();
  this.timeCompleted = segment.time * this.frameRate;
  var segmentPath = this.path + this.fileName + '_' + this.segmentPos + '.json';
  this.segmentPos += 1;
  dataManager.loadData(segmentPath, this.includeLayers.bind(this), function () {
    this.trigger('data_failed');
  }.bind(this));
};

AnimationItem.prototype.loadSegments = function () {
  var segments = this.animationData.segments;
  if (!segments) {
    this.timeCompleted = this.totalFrames;
  }
  this.loadNextSegment();
};

AnimationItem.prototype.imagesLoaded = function () {
  this.trigger('loaded_images');
  this.checkLoaded();
};

AnimationItem.prototype.preloadImages = function () {
  this.imagePreloader.setAssetsPath(this.assetsPath);
  this.imagePreloader.setPath(this.path);
  this.imagePreloader.loadAssets(this.animationData.assets, this.imagesLoaded.bind(this));
};

AnimationItem.prototype.configAnimation = function (animData) {
  if (!this.renderer) {
    return;
  }
  try {
    this.animationData = animData;
    if (this.initialSegment) {
      this.totalFrames = Math.floor(this.initialSegment[1] - this.initialSegment[0]);
      this.firstFrame = Math.round(this.initialSegment[0]);
    } else {
      this.totalFrames = Math.floor(this.animationData.op - this.animationData.ip);
      this.firstFrame = Math.round(this.animationData.ip);
    }
    this.renderer.configAnimation(animData);
    if (!animData.assets) {
      animData.assets = [];
    }

    this.assets = this.animationData.assets;
    this.frameRate = this.animationData.fr;
    this.frameMult = this.animationData.fr / 1000;
    this.renderer.searchExtraCompositions(animData.assets);
    this.markers = markerParser(animData.markers || []);
    this.trigger('config_ready');
    this.preloadImages();
    this.loadSegments();
    this.updaFrameModifier();
    this.waitForFontsLoaded();
    if (this.isPaused) {
      this.audioController.pause();
    }
  } catch (error) {
    this.triggerConfigError(error);
  }
};

AnimationItem.prototype.waitForFontsLoaded = function () {
  if (!this.renderer) {
    return;
  }
  if (this.renderer.globalData.fontManager.isLoaded) {
    this.checkLoaded();
  } else {
    setTimeout(this.waitForFontsLoaded.bind(this), 20);
  }
};

AnimationItem.prototype.checkLoaded = function () {
  if (!this.isLoaded
        && this.renderer.globalData.fontManager.isLoaded
        && (this.imagePreloader.loadedImages() || this.renderer.rendererType !== 'canvas')
        && (this.imagePreloader.loadedFootages())
  ) {
    this.isLoaded = true;
    var expressionsPlugin = getExpressionsPlugin();
    if (expressionsPlugin) {
      expressionsPlugin.initExpressions(this);
    }
    this.renderer.initItems();
    setTimeout(function () {
      this.trigger('DOMLoaded');
    }.bind(this), 0);
    this.gotoFrame();
    if (this.autoplay) {
      this.play();
    }
  }
};

AnimationItem.prototype.resize = function (width, height) {
  // Adding this validation for backwards compatibility in case an event object was being passed down
  var _width = typeof width === 'number' ? width : undefined;
  var _height = typeof height === 'number' ? height : undefined;
  this.renderer.updateContainerSize(_width, _height);
};

AnimationItem.prototype.setSubframe = function (flag) {
  this.isSubframeEnabled = !!flag;
};

AnimationItem.prototype.gotoFrame = function () {
  this.currentFrame = this.isSubframeEnabled ? this.currentRawFrame : ~~this.currentRawFrame; // eslint-disable-line no-bitwise

  if (this.timeCompleted !== this.totalFrames && this.currentFrame > this.timeCompleted) {
    this.currentFrame = this.timeCompleted;
  }
  this.trigger('enterFrame');
  this.renderFrame();
  this.trigger('drawnFrame');
};

AnimationItem.prototype.renderFrame = function () {
  if (this.isLoaded === false || !this.renderer) {
    return;
  }
  try {
    this.renderer.renderFrame(this.currentFrame + this.firstFrame);
  } catch (error) {
    this.triggerRenderFrameError(error);
  }
};

AnimationItem.prototype.play = function (name) {
  if (name && this.name !== name) {
    return;
  }
  if (this.isPaused === true) {
    this.isPaused = false;
    this.trigger('_pause');
    this.audioController.resume();
    if (this._idle) {
      this._idle = false;
      this.trigger('_active');
    }
  }
};

AnimationItem.prototype.pause = function (name) {
  if (name && this.name !== name) {
    return;
  }
  if (this.isPaused === false) {
    this.isPaused = true;
    this.trigger('_play');
    this._idle = true;
    this.trigger('_idle');
    this.audioController.pause();
  }
};

AnimationItem.prototype.togglePause = function (name) {
  if (name && this.name !== name) {
    return;
  }
  if (this.isPaused === true) {
    this.play();
  } else {
    this.pause();
  }
};

AnimationItem.prototype.stop = function (name) {
  if (name && this.name !== name) {
    return;
  }
  this.pause();
  this.playCount = 0;
  this._completedLoop = false;
  this.setCurrentRawFrameValue(0);
};

AnimationItem.prototype.getMarkerData = function (markerName) {
  var marker;
  for (var i = 0; i < this.markers.length; i += 1) {
    marker = this.markers[i];
    if (marker.payload && marker.payload.name === markerName) {
      return marker;
    }
  }
  return null;
};

AnimationItem.prototype.goToAndStop = function (value, isFrame, name) {
  if (name && this.name !== name) {
    return;
  }
  var numValue = Number(value);
  if (isNaN(numValue)) {
    var marker = this.getMarkerData(value);
    if (marker) {
      this.goToAndStop(marker.time, true);
    }
  } else if (isFrame) {
    this.setCurrentRawFrameValue(value);
  } else {
    this.setCurrentRawFrameValue(value * this.frameModifier);
  }
  this.pause();
};

AnimationItem.prototype.goToAndPlay = function (value, isFrame, name) {
  if (name && this.name !== name) {
    return;
  }
  var numValue = Number(value);
  if (isNaN(numValue)) {
    var marker = this.getMarkerData(value);
    if (marker) {
      if (!marker.duration) {
        this.goToAndStop(marker.time, true);
      } else {
        this.playSegments([marker.time, marker.time + marker.duration], true);
      }
    }
  } else {
    this.goToAndStop(numValue, isFrame, name);
  }
  this.play();
};

AnimationItem.prototype.advanceTime = function (value) {
  if (this.isPaused === true || this.isLoaded === false) {
    return;
  }
  var nextValue = this.currentRawFrame + value * this.frameModifier;
  var _isComplete = false;
  // Checking if nextValue > totalFrames - 1 for addressing non looping and looping animations.
  // If animation won't loop, it should stop at totalFrames - 1. If it will loop it should complete the last frame and then loop.
  if (nextValue >= this.totalFrames - 1 && this.frameModifier > 0) {
    if (!this.loop || this.playCount === this.loop) {
      if (!this.checkSegments(nextValue > this.totalFrames ? nextValue % this.totalFrames : 0)) {
        _isComplete = true;
        nextValue = this.totalFrames - 1;
      }
    } else if (nextValue >= this.totalFrames) {
      this.playCount += 1;
      if (!this.checkSegments(nextValue % this.totalFrames)) {
        this.setCurrentRawFrameValue(nextValue % this.totalFrames);
        this._completedLoop = true;
        this.trigger('loopComplete');
      }
    } else {
      this.setCurrentRawFrameValue(nextValue);
    }
  } else if (nextValue < 0) {
    if (!this.checkSegments(nextValue % this.totalFrames)) {
      if (this.loop && !(this.playCount-- <= 0 && this.loop !== true)) { // eslint-disable-line no-plusplus
        this.setCurrentRawFrameValue(this.totalFrames + (nextValue % this.totalFrames));
        if (!this._completedLoop) {
          this._completedLoop = true;
        } else {
          this.trigger('loopComplete');
        }
      } else {
        _isComplete = true;
        nextValue = 0;
      }
    }
  } else {
    this.setCurrentRawFrameValue(nextValue);
  }
  if (_isComplete) {
    this.setCurrentRawFrameValue(nextValue);
    this.pause();
    this.trigger('complete');
  }
};

AnimationItem.prototype.adjustSegment = function (arr, offset) {
  this.playCount = 0;
  if (arr[1] < arr[0]) {
    if (this.frameModifier > 0) {
      if (this.playSpeed < 0) {
        this.setSpeed(-this.playSpeed);
      } else {
        this.setDirection(-1);
      }
    }
    this.totalFrames = arr[0] - arr[1];
    this.timeCompleted = this.totalFrames;
    this.firstFrame = arr[1];
    this.setCurrentRawFrameValue(this.totalFrames - 0.001 - offset);
  } else if (arr[1] > arr[0]) {
    if (this.frameModifier < 0) {
      if (this.playSpeed < 0) {
        this.setSpeed(-this.playSpeed);
      } else {
        this.setDirection(1);
      }
    }
    this.totalFrames = arr[1] - arr[0];
    this.timeCompleted = this.totalFrames;
    this.firstFrame = arr[0];
    this.setCurrentRawFrameValue(0.001 + offset);
  }
  this.trigger('segmentStart');
};
AnimationItem.prototype.setSegment = function (init, end) {
  var pendingFrame = -1;
  if (this.isPaused) {
    if (this.currentRawFrame + this.firstFrame < init) {
      pendingFrame = init;
    } else if (this.currentRawFrame + this.firstFrame > end) {
      pendingFrame = end - init;
    }
  }

  this.firstFrame = init;
  this.totalFrames = end - init;
  this.timeCompleted = this.totalFrames;
  if (pendingFrame !== -1) {
    this.goToAndStop(pendingFrame, true);
  }
};

AnimationItem.prototype.playSegments = function (arr, forceFlag) {
  if (forceFlag) {
    this.segments.length = 0;
  }
  if (typeof arr[0] === 'object') {
    var i;
    var len = arr.length;
    for (i = 0; i < len; i += 1) {
      this.segments.push(arr[i]);
    }
  } else {
    this.segments.push(arr);
  }
  if (this.segments.length && forceFlag) {
    this.adjustSegment(this.segments.shift(), 0);
  }
  if (this.isPaused) {
    this.play();
  }
};

AnimationItem.prototype.resetSegments = function (forceFlag) {
  this.segments.length = 0;
  this.segments.push([this.animationData.ip, this.animationData.op]);
  if (forceFlag) {
    this.checkSegments(0);
  }
};
AnimationItem.prototype.checkSegments = function (offset) {
  if (this.segments.length) {
    this.adjustSegment(this.segments.shift(), offset);
    return true;
  }
  return false;
};

AnimationItem.prototype.destroy = function (name) {
  if ((name && this.name !== name) || !this.renderer) {
    return;
  }
  this.renderer.destroy();
  this.imagePreloader.destroy();
  this.trigger('destroy');
  this._cbs = null;
  this.onEnterFrame = null;
  this.onLoopComplete = null;
  this.onComplete = null;
  this.onSegmentStart = null;
  this.onDestroy = null;
  this.renderer = null;
  this.renderer = null;
  this.imagePreloader = null;
  this.projectInterface = null;
};

AnimationItem.prototype.setCurrentRawFrameValue = function (value) {
  this.currentRawFrame = value;
  this.gotoFrame();
};

AnimationItem.prototype.setSpeed = function (val) {
  this.playSpeed = val;
  this.updaFrameModifier();
};

AnimationItem.prototype.setDirection = function (val) {
  this.playDirection = val < 0 ? -1 : 1;
  this.updaFrameModifier();
};

AnimationItem.prototype.setLoop = function (isLooping) {
  this.loop = isLooping;
};

AnimationItem.prototype.setVolume = function (val, name) {
  if (name && this.name !== name) {
    return;
  }
  this.audioController.setVolume(val);
};

AnimationItem.prototype.getVolume = function () {
  return this.audioController.getVolume();
};

AnimationItem.prototype.mute = function (name) {
  if (name && this.name !== name) {
    return;
  }
  this.audioController.mute();
};

AnimationItem.prototype.unmute = function (name) {
  if (name && this.name !== name) {
    return;
  }
  this.audioController.unmute();
};

AnimationItem.prototype.updaFrameModifier = function () {
  this.frameModifier = this.frameMult * this.playSpeed * this.playDirection;
  this.audioController.setRate(this.playSpeed * this.playDirection);
};

AnimationItem.prototype.getPath = function () {
  return this.path;
};

AnimationItem.prototype.getAssetsPath = function (assetData) {
  var path = '';
  if (assetData.e) {
    path = assetData.p;
  } else if (this.assetsPath) {
    var imagePath = assetData.p;
    if (imagePath.indexOf('images/') !== -1) {
      imagePath = imagePath.split('/')[1];
    }
    path = this.assetsPath + imagePath;
  } else {
    path = this.path;
    path += assetData.u ? assetData.u : '';
    path += assetData.p;
  }
  return path;
};

AnimationItem.prototype.getAssetData = function (id) {
  var i = 0;
  var len = this.assets.length;
  while (i < len) {
    if (id === this.assets[i].id) {
      return this.assets[i];
    }
    i += 1;
  }
  return null;
};

AnimationItem.prototype.hide = function () {
  this.renderer.hide();
};

AnimationItem.prototype.show = function () {
  this.renderer.show();
};

AnimationItem.prototype.getDuration = function (isFrame) {
  return isFrame ? this.totalFrames : this.totalFrames / this.frameRate;
};

AnimationItem.prototype.updateDocumentData = function (path, documentData, index) {
  try {
    var element = this.renderer.getElementByPath(path);
    element.updateDocumentData(documentData, index);
  } catch (error) {
    // TODO: decide how to handle catch case
  }
};

AnimationItem.prototype.trigger = function (name) {
  if (this._cbs && this._cbs[name]) {
    switch (name) {
      case 'enterFrame':
        this.triggerEvent(name, new BMEnterFrameEvent(name, this.currentFrame, this.totalFrames, this.frameModifier));
        break;
      case 'drawnFrame':
        this.drawnFrameEvent.currentTime = this.currentFrame;
        this.drawnFrameEvent.totalTime = this.totalFrames;
        this.drawnFrameEvent.direction = this.frameModifier;
        this.triggerEvent(name, this.drawnFrameEvent);
        break;
      case 'loopComplete':
        this.triggerEvent(name, new BMCompleteLoopEvent(name, this.loop, this.playCount, this.frameMult));
        break;
      case 'complete':
        this.triggerEvent(name, new BMCompleteEvent(name, this.frameMult));
        break;
      case 'segmentStart':
        this.triggerEvent(name, new BMSegmentStartEvent(name, this.firstFrame, this.totalFrames));
        break;
      case 'destroy':
        this.triggerEvent(name, new BMDestroyEvent(name, this));
        break;
      default:
        this.triggerEvent(name);
    }
  }
  if (name === 'enterFrame' && this.onEnterFrame) {
    this.onEnterFrame.call(this, new BMEnterFrameEvent(name, this.currentFrame, this.totalFrames, this.frameMult));
  }
  if (name === 'loopComplete' && this.onLoopComplete) {
    this.onLoopComplete.call(this, new BMCompleteLoopEvent(name, this.loop, this.playCount, this.frameMult));
  }
  if (name === 'complete' && this.onComplete) {
    this.onComplete.call(this, new BMCompleteEvent(name, this.frameMult));
  }
  if (name === 'segmentStart' && this.onSegmentStart) {
    this.onSegmentStart.call(this, new BMSegmentStartEvent(name, this.firstFrame, this.totalFrames));
  }
  if (name === 'destroy' && this.onDestroy) {
    this.onDestroy.call(this, new BMDestroyEvent(name, this));
  }
};

AnimationItem.prototype.triggerRenderFrameError = function (nativeError) {
  var error = new BMRenderFrameErrorEvent(nativeError, this.currentFrame);
  this.triggerEvent('error', error);

  if (this.onError) {
    this.onError.call(this, error);
  }
};

AnimationItem.prototype.triggerConfigError = function (nativeError) {
  var error = new BMConfigErrorEvent(nativeError, this.currentFrame);
  this.triggerEvent('error', error);

  if (this.onError) {
    this.onError.call(this, error);
  }
};

export default AnimationItem;
