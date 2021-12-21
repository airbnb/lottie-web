function preloadVideo(url, success, error) {
  var xhr = new XMLHttpRequest();
  xhr.responseType = 'blob';
  xhr.open('GET', URL);
  xhr.send();
  xhr.onload = function () {
    var blobUrl = URL.createObjectURL(xhr.response);
    if (success) {
      success(blobUrl);
    }
  };

  xhr.onerror = error;
}
