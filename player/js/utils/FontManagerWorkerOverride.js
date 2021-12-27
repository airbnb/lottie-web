import FontManager from './FontManager';

// TODO: fix overwrite

FontManager = (function () {
  var Font = function () {
    this.fonts = [];
    this.chars = null;
    this.typekitLoaded = 0;
    this.isLoaded = false;
    this.initTime = Date.now();
  };
  return Font;
}());

export default FontManager;
