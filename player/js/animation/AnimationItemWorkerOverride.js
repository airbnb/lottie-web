/* global CanvasRenderer, dataManager, expressionsPlugin, AnimationItem */

AnimationItem.prototype.setParams = function (params) {
  if (params.context) {
    this.context = params.context;
  }
  var animType = 'svg';
  if (params.animType) {
    animType = params.animType;
  } else if (params.renderer) {
    animType = params.renderer;
  }
  switch (animType) {
    case 'canvas':
      this.renderer = new CanvasRenderer(this, params.rendererSettings);
      break;
    default:
      throw new Error('Only canvas renderer is supported when using worker.');
  }
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
  this.assetsPath = null;
  if (params.animationData) {
    this.configAnimation(params.animationData);
  } else if (params.path) {
    throw new Error('Canvas worker renderer cannot load animation from url');
  }
};

AnimationItem.prototype.setData = function () {
  throw new Error('Cannot set data on wrapper for canvas worker renderer');
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
  this.animationData.__complete = false;
  dataManager.completeData(this.animationData, this.renderer.globalData.fontManager);
  this.renderer.includeLayers(data.layers);
  if (expressionsPlugin) {
    expressionsPlugin.initExpressions(this);
  }
  this.loadNextSegment();
};

AnimationItem.prototype.loadNextSegment = function () {
  var segments = this.animationData.segments;
  if (!segments || segments.length === 0 || !this.autoloadSegments) {
    this.timeCompleted = this.totalFrames;
    return;
  }
  throw new Error('Cannot load multiple segments in worker.');
};

AnimationItem.prototype.loadSegments = function () {
  var segments = this.animationData.segments;
  if (!segments) {
    this.timeCompleted = this.totalFrames;
  }
  this.loadNextSegment();
};

AnimationItem.prototype.imagesLoaded = null;

AnimationItem.prototype.preloadImages = null;

AnimationItem.prototype.configAnimation = function (animData) {
  if (!this.renderer) {
    return;
  }
  this.animationData = animData;
  this.totalFrames = Math.floor(this.animationData.op - this.animationData.ip);
  this.renderer.configAnimation(animData);
  if (!animData.assets) {
    animData.assets = [];
  }
  this.renderer.searchExtraCompositions(animData.assets);

  this.assets = this.animationData.assets;
  this.frameRate = this.animationData.fr;
  this.firstFrame = Math.round(this.animationData.ip);
  this.frameMult = this.animationData.fr / 1000;
  this.loadSegments();
  this.updaFrameModifier();
  this.checkLoaded();
};

AnimationItem.prototype.waitForFontsLoaded = null;

AnimationItem.prototype.checkLoaded = function () {
  if (!this.isLoaded) {
    this.isLoaded = true;
    dataManager.completeData(this.animationData, null);
    if (expressionsPlugin) {
      expressionsPlugin.initExpressions(this);
    }
    this.renderer.initItems();
    this.gotoFrame();
  }
};

AnimationItem.prototype.destroy = function (name) {
  if ((name && this.name !== name) || !this.renderer) {
    return;
  }
  this.renderer.destroy();
  this._cbs = null;
  this.onEnterFrame = null;
  this.onLoopComplete = null;
  this.onComplete = null;
  this.onSegmentStart = null;
  this.onDestroy = null;
  this.renderer = null;
};

AnimationItem.prototype.getPath = null;
