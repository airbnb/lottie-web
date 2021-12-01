const assetLoader = (function () {
  function formatResponse(xhr) {
    // using typeof doubles the time of execution of this method,
    // so if available, it's better to use the header to validate the type
    var contentTypeHeader = xhr.getResponseHeader('content-type');
    if (contentTypeHeader && xhr.responseType === 'json' && contentTypeHeader.indexOf('json') !== -1) {
      return xhr.response;
    }
    if (xhr.response && typeof xhr.response === 'object') {
      return xhr.response;
    } if (xhr.response && typeof xhr.response === 'string') {
      return JSON.parse(xhr.response);
    } if (xhr.responseText) {
      return JSON.parse(xhr.responseText);
    }
    return null;
  }

  function loadAsset(path, callback, errorCallback) {
    var response;
    var xhr = new XMLHttpRequest();
    // set responseType after calling open or IE will break.
    try {
      // This crashes on Android WebView prior to KitKat
      xhr.responseType = 'json';
    } catch (err) {} // eslint-disable-line no-empty
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          response = formatResponse(xhr);
          callback(response);
        } else {
          try {
            response = formatResponse(xhr);
            callback(response);
          } catch (err) {
            if (errorCallback) {
              errorCallback(err);
            }
          }
        }
      }
    };
    xhr.open('GET', path, true);
    xhr.send();
  }
  return {
    load: loadAsset,
  };
}());

export default assetLoader;
