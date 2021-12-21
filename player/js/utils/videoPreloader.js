/* global ImagePreloader */
/* exported VideoPreloader, preloadVideo */
function preloadVideo(url, success, error) {
  var xhr = new XMLHttpRequest();
  xhr.responseType = 'blob';
  xhr.open('GET', url);
  xhr.send();
  xhr.onload = function () {
    var blobUrl = URL.createObjectURL(xhr.response);
    if (success) {
      success(blobUrl);
    }
  };

  xhr.onerror = error;
}

var VideoPreloader = (function () {
  function loadAssets(assets, cb) {
    var _this = this;
    assets.forEach(function (asset) {
      var path = ImagePreloader.prototype.getAssetsPath.call(_this, asset, '', '');
      _this.videos.push(asset);
      preloadVideo(path, function (blobUrl) {
        videoLoaded.call(_this);
        asset.e = 1;
        asset.p = blobUrl;
        asset.u = '';
        if (cb) cb();
      }, function () {
        loadAssets([asset], cb);
      });
    });
  }

  function destroy() {
    this.imagesLoadedCb = null;
    this.videos.length = 0;
  }

  function loadedVideos() {
    var isAllLoaded = this.videos.length === this.loadedAssets;
    return isAllLoaded;
  }

  function videoLoaded() {
    this.loadedAssets += 1;
  }

  function VideoPreloaderFactory() {
    this._videoLoaded = videoLoaded.bind(this);
    this.loadedAssets = 0;
    this.videos = [];
  }

  VideoPreloaderFactory.prototype = {
    loadAssets: loadAssets,
    destroy: destroy,
    loadedVideos: loadedVideos,
    getAssetsPath: ImagePreloader.prototype.getAssetsPath,
  };

  return VideoPreloaderFactory;
}());
