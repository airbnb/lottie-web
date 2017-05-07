var makePathExpressionProperty = (function() {
  return function(pathValue) {
    var p = pathValue.keyframes;
    if (p.__pathPropertyDefined) {
      return p;
    }
    p.__pathPropertyDefined = true;
    Object.defineProperty(p, 'key', {
      get: function() {
        var frameRate = pathValue.comp.globalData.frameRate;
        return function(index) {
          //this index starts from 1
          var k = p[index - 1];
          k.time = k.t / frameRate;
          k.index = index;
          if (index === p.length) {
            k.value = p[index - 2].e;
          } else {
            k.value = k.s;
          }
          return k;
        }
      },
    });
    Object.defineProperty(p, 'numKeys', {
      get: function() {
        return p.length;
      }
    });
    Object.defineProperty(p, 'value', {
      get: function() {
        return p;
      }
    });
    return p;
  };
})();

var makeTimeRemapExpressionProperty = (function() {
  return function(tmValue) {
    var p = tmValue.keyframes;
    if (p.__tmPropertyDefined) {
      return p;
    }
    p.__tmPropertyDefined = true;
    Object.defineProperty(p, 'key', {
      get: function() {
        var frameRate = tmValue.comp.globalData.frameRate;
        return function(index) {
          //this index starts from 1
          var k = p[index - 1];
          k.time = k.t / frameRate;
          //  console.log(`k.time=${k.time}, k.t=${k.t}, frameRate=${frameRate}`)
          k.index = index;
          if (index === p.length) {
            k.value = p[index - 2].e;
          } else {
            k.value = k.s;
          }
          return k;
        }
      },
    });
    Object.defineProperty(p, 'numKeys', {
      get: function() {
        return p.length;
      }
    });
    Object.defineProperty(p, 'value', {
      get: function() {
        return p;
      }
    });
    return p;
  }
})();
