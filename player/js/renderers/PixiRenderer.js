import {
  extendPrototype,
} from '../utils/functionExtensions';
import PixiRendererBase from './PixiRendererBase';
import Matrix from '../3rd_party/transformation-matrix';
import AnimationItem from '../animation/AnimationItem';
import { getExpressionsPlugin } from '../utils/common';
import PXCompElement from '../elements/pixiElements/PXCompElement';

function PixiRenderer(animationItem, config) {
  console.log('PIXIRenderer::const', animationItem, config);
  this.animationItem = animationItem;
  this.layers = null;

  this.renderConfig = {
    dpr: (config && config.dpr) || window.devicePixelRatio || 1,
    progressiveLoad: (config && config.progressiveLoad) || false,
    preserveAspectRatio: config && config.preserveAspectRatio,
    pixiApplication: config && config.pixiApplication,
  };

  this.renderedFrame = -1;
  this.globalData = {
    frameNum: -1,
    _mdf: false,
    renderConfig: this.renderConfig,
    currentGlobalAlpha: -1,
  };
  this.elements = [];
  this.pendingElements = [];
  this.transformMat = new Matrix();
  this.completeLayers = false;
  this.rendererType = 'pixi';

  // Hook the loading process into Pixi Loader
  AnimationItem.prototype.checkLoaded = PixiRenderer.prototype.checkLoaded;
}

extendPrototype([PixiRendererBase], PixiRenderer);

PixiRenderer.prototype.createComp = function (data) {
  return new PXCompElement(data, this.globalData, this);
};

// AnimationItem.prototype.waitForFontsLoaded = function () {
//   console.log('AnimationItem::waitForFontsLoaded() *** Trying to hack this method', this.renderer);
//   // this.checkLoaded();
//   // setTimeout(this.waitForFontsLoaded.bind(this), 1000);
// };

PixiRenderer.prototype.checkLoaded = function () {
  console.log('AnimationItem::checkLoaded() ****', this, this.renderer);
  if (this.renderer.globalData.isAssetsLoaded) {
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
  }
};
export default PixiRenderer;
