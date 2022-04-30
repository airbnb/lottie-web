const markerParser = (

  function () {
    function parsePayloadLines(payload) {
      var lines = payload.split('\r\n');
      var keys = {};
      var line;
      var keysCount = 0;
      for (var i = 0; i < lines.length; i += 1) {
        line = lines[i].split(':');
        if (line.length === 2) {
          keys[line[0]] = line[1].trim();
          keysCount += 1;
        }
      }
      if (keysCount === 0) {
        throw new Error();
      }
      return keys;
    }

    return function (_markers) {
      var markers = [];
      for (var i = 0; i < _markers.length; i += 1) {
        var _marker = _markers[i];
        var markerData = {
          time: _marker.tm,
          duration: _marker.dr,
        };
        try {
          markerData.payload = JSON.parse(_markers[i].cm);
        } catch (_) {
          try {
            markerData.payload = parsePayloadLines(_markers[i].cm);
          } catch (__) {
            markerData.payload = {
              name: _markers[i].cm,
            };
          }
        }
        markers.push(markerData);
      }
      return markers;
    };
  }());

export default markerParser;
