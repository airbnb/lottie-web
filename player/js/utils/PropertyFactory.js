import {
  degToRads,
} from './common';
import {
  createTypedArray,
} from './helpers/arrays';
import BezierFactory from '../3rd_party/BezierEaser';
import {
  initialDefaultFrame,
} from '../main';
import bez from './bez';

var initFrame = initialDefaultFrame;
var mathAbs = Math.abs;

function interpolateValue(frameNum, caching) {
  var offsetTime = this.offsetTime;
  var newValue;
  if (this.propType === 'multidimensional') {
    newValue = createTypedArray('float32', this.pv.length);
  }
  var iterationIndex = caching.lastIndex;
  var i = iterationIndex;
  var len = this.keyframes.length - 1;
  var flag = true;
  var keyData;
  var nextKeyData;
  var keyframeMetadata;

  while (flag) {
    keyData = this.keyframes[i];
    nextKeyData = this.keyframes[i + 1];
    if (i === len - 1 && frameNum >= nextKeyData.t - offsetTime) {
      if (keyData.h) {
        keyData = nextKeyData;
      }
      iterationIndex = 0;
      break;
    }
    if ((nextKeyData.t - offsetTime) > frameNum) {
      iterationIndex = i;
      break;
    }
    if (i < len - 1) {
      i += 1;
    } else {
      iterationIndex = 0;
      flag = false;
    }
  }
  keyframeMetadata = this.keyframesMetadata[i] || {};

  var k;
  var kLen;
  var perc;
  var jLen;
  var j;
  var fnc;
  var nextKeyTime = nextKeyData.t - offsetTime;
  var keyTime = keyData.t - offsetTime;
  var endValue;
  if (keyData.to) {
    if (!keyframeMetadata.bezierData) {
      keyframeMetadata.bezierData = bez.buildBezierData(keyData.s, nextKeyData.s || keyData.e, keyData.to, keyData.ti);
    }
    var bezierData = keyframeMetadata.bezierData;
    if (frameNum >= nextKeyTime || frameNum < keyTime) {
      var ind = frameNum >= nextKeyTime ? bezierData.points.length - 1 : 0;
      kLen = bezierData.points[ind].point.length;
      for (k = 0; k < kLen; k += 1) {
        newValue[k] = bezierData.points[ind].point[k];
      }
      // caching._lastKeyframeIndex = -1;
    } else {
      if (keyframeMetadata.__fnct) {
        fnc = keyframeMetadata.__fnct;
      } else {
        fnc = BezierFactory.getBezierEasing(keyData.o.x, keyData.o.y, keyData.i.x, keyData.i.y, keyData.n).get;
        keyframeMetadata.__fnct = fnc;
      }
      perc = fnc((frameNum - keyTime) / (nextKeyTime - keyTime));
      var distanceInLine = bezierData.segmentLength * perc;

      var segmentPerc;
      var addedLength = (caching.lastFrame < frameNum && caching._lastKeyframeIndex === i) ? caching._lastAddedLength : 0;
      j = (caching.lastFrame < frameNum && caching._lastKeyframeIndex === i) ? caching._lastPoint : 0;
      flag = true;
      jLen = bezierData.points.length;
      while (flag) {
        addedLength += bezierData.points[j].partialLength;
        if (distanceInLine === 0 || perc === 0 || j === bezierData.points.length - 1) {
          kLen = bezierData.points[j].point.length;
          for (k = 0; k < kLen; k += 1) {
            newValue[k] = bezierData.points[j].point[k];
          }
          break;
        } else if (distanceInLine >= addedLength && distanceInLine < addedLength + bezierData.points[j + 1].partialLength) {
          segmentPerc = (distanceInLine - addedLength) / bezierData.points[j + 1].partialLength;
          kLen = bezierData.points[j].point.length;
          for (k = 0; k < kLen; k += 1) {
            newValue[k] = bezierData.points[j].point[k] + (bezierData.points[j + 1].point[k] - bezierData.points[j].point[k]) * segmentPerc;
          }
          break;
        }
        if (j < jLen - 1) {
          j += 1;
        } else {
          flag = false;
        }
      }
      caching._lastPoint = j;
      caching._lastAddedLength = addedLength - bezierData.points[j].partialLength;
      caching._lastKeyframeIndex = i;
    }
  } else {
    var outX;
    var outY;
    var inX;
    var inY;
    var keyValue;
    len = keyData.s.length;
    endValue = nextKeyData.s || keyData.e;
    if (this.sh && keyData.h !== 1) {
      if (frameNum >= nextKeyTime) {
        newValue[0] = endValue[0];
        newValue[1] = endValue[1];
        newValue[2] = endValue[2];
      } else if (frameNum <= keyTime) {
        newValue[0] = keyData.s[0];
        newValue[1] = keyData.s[1];
        newValue[2] = keyData.s[2];
      } else {
        var quatStart = createQuaternion(keyData.s);
        var quatEnd = createQuaternion(endValue);
        var time = (frameNum - keyTime) / (nextKeyTime - keyTime);
        quaternionToEuler(newValue, slerp(quatStart, quatEnd, time));
      }
    } else {
      for (i = 0; i < len; i += 1) {
        if (keyData.h !== 1) {
          if (frameNum >= nextKeyTime) {
            perc = 1;
          } else if (frameNum < keyTime) {
            perc = 0;
          } else {
            if (keyData.o.x.constructor === Array) {
              if (!keyframeMetadata.__fnct) {
                keyframeMetadata.__fnct = [];
              }
              if (!keyframeMetadata.__fnct[i]) {
                outX = keyData.o.x[i] === undefined ? keyData.o.x[0] : keyData.o.x[i];
                outY = keyData.o.y[i] === undefined ? keyData.o.y[0] : keyData.o.y[i];
                inX = keyData.i.x[i] === undefined ? keyData.i.x[0] : keyData.i.x[i];
                inY = keyData.i.y[i] === undefined ? keyData.i.y[0] : keyData.i.y[i];
                fnc = BezierFactory.getBezierEasing(outX, outY, inX, inY).get;
                keyframeMetadata.__fnct[i] = fnc;
              } else {
                fnc = keyframeMetadata.__fnct[i];
              }
            } else if (!keyframeMetadata.__fnct) {
              outX = keyData.o.x;
              outY = keyData.o.y;
              inX = keyData.i.x;
              inY = keyData.i.y;
              fnc = BezierFactory.getBezierEasing(outX, outY, inX, inY).get;
              keyData.keyframeMetadata = fnc;
            } else {
              fnc = keyframeMetadata.__fnct;
            }
            perc = fnc((frameNum - keyTime) / (nextKeyTime - keyTime));
          }
        }

        endValue = nextKeyData.s || keyData.e;
        keyValue = keyData.h === 1 ? keyData.s[i] : keyData.s[i] + (endValue[i] - keyData.s[i]) * perc;

        if (this.propType === 'multidimensional') {
          newValue[i] = keyValue;
        } else {
          newValue = keyValue;
        }
      }
    }
  }
  caching.lastIndex = iterationIndex;
  return newValue;
}

// based on @Toji's https://github.com/toji/gl-matrix/
function slerp(a, b, t) {
  var out = [];
  var ax = a[0];
  var ay = a[1];
  var az = a[2];
  var aw = a[3];
  var bx = b[0];
  var by = b[1];
  var bz = b[2];
  var bw = b[3];

  var omega;
  var cosom;
  var sinom;
  var scale0;
  var scale1;

  cosom = ax * bx + ay * by + az * bz + aw * bw;
  if (cosom < 0.0) {
    cosom = -cosom;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  }
  if ((1.0 - cosom) > 0.000001) {
    omega = Math.acos(cosom);
    sinom = Math.sin(omega);
    scale0 = Math.sin((1.0 - t) * omega) / sinom;
    scale1 = Math.sin(t * omega) / sinom;
  } else {
    scale0 = 1.0 - t;
    scale1 = t;
  }
  out[0] = scale0 * ax + scale1 * bx;
  out[1] = scale0 * ay + scale1 * by;
  out[2] = scale0 * az + scale1 * bz;
  out[3] = scale0 * aw + scale1 * bw;

  return out;
}

function quaternionToEuler(out, quat) {
  var qx = quat[0];
  var qy = quat[1];
  var qz = quat[2];
  var qw = quat[3];
  var heading = Math.atan2(2 * qy * qw - 2 * qx * qz, 1 - 2 * qy * qy - 2 * qz * qz);
  var attitude = Math.asin(2 * qx * qy + 2 * qz * qw);
  var bank = Math.atan2(2 * qx * qw - 2 * qy * qz, 1 - 2 * qx * qx - 2 * qz * qz);
  out[0] = heading / degToRads;
  out[1] = attitude / degToRads;
  out[2] = bank / degToRads;
}

function createQuaternion(values) {
  var heading = values[0] * degToRads;
  var attitude = values[1] * degToRads;
  var bank = values[2] * degToRads;
  var c1 = Math.cos(heading / 2);
  var c2 = Math.cos(attitude / 2);
  var c3 = Math.cos(bank / 2);
  var s1 = Math.sin(heading / 2);
  var s2 = Math.sin(attitude / 2);
  var s3 = Math.sin(bank / 2);
  var w = c1 * c2 * c3 - s1 * s2 * s3;
  var x = s1 * s2 * c3 + c1 * c2 * s3;
  var y = s1 * c2 * c3 + c1 * s2 * s3;
  var z = c1 * s2 * c3 - s1 * c2 * s3;

  return [x, y, z, w];
}

function getValueAtCurrentTime() {
  var frameNum = this.comp.renderedFrame - this.offsetTime;
  var initTime = this.keyframes[0].t - this.offsetTime;
  var endTime = this.keyframes[this.keyframes.length - 1].t - this.offsetTime;
  if (!(frameNum === this._caching.lastFrame || (this._caching.lastFrame !== initFrame && ((this._caching.lastFrame >= endTime && frameNum >= endTime) || (this._caching.lastFrame < initTime && frameNum < initTime))))) {
    if (this._caching.lastFrame >= frameNum) {
      this._caching._lastKeyframeIndex = -1;
      this._caching.lastIndex = 0;
    }

    var renderResult = this.interpolateValue(frameNum, this._caching);
    this.pv = renderResult;
  }
  this._caching.lastFrame = frameNum;
  return this.pv;
}

function setVValue(val) {
  var multipliedValue;
  if (this.propType === 'unidimensional') {
    multipliedValue = val * this.mult;
    if (mathAbs(this.v - multipliedValue) > 0.00001) {
      this.v = multipliedValue;
      this._mdf = true;
    }
  } else {
    var i = 0;
    var len = this.v.length;
    while (i < len) {
      multipliedValue = val[i] * this.mult;
      if (mathAbs(this.v[i] - multipliedValue) > 0.00001) {
        this.v[i] = multipliedValue;
        this._mdf = true;
      }
      i += 1;
    }
  }
}

function processEffectsSequence() {
  if (this.elem.globalData.frameId === this.frameId || !this.effectsSequence.length) {
    return;
  }
  if (this.lock) {
    this.setVValue(this.pv);
    return;
  }
  this.lock = true;
  this._mdf = this._isFirstFrame;
  var i;
  var len = this.effectsSequence.length;
  var finalValue = this.kf ? this.pv : this.data.k;
  for (i = 0; i < len; i += 1) {
    finalValue = this.effectsSequence[i](finalValue);
  }
  this.setVValue(finalValue);
  this._isFirstFrame = false;
  this.lock = false;
  this.frameId = this.elem.globalData.frameId;
}

function addEffect(effectFunction) {
  this.effectsSequence.push(effectFunction);
  this.container.addDynamicProperty(this);
}

function ValueProperty(elem, data, mult, container) {
  this.propType = 'unidimensional';
  this.mult = mult || 1;
  this.data = data;
  this.v = mult ? data.k * mult : data.k;
  this.pv = data.k;
  this._mdf = false;
  this.elem = elem;
  this.container = container;
  this.comp = elem.comp;
  this.k = false;
  this.kf = false;
  this.vel = 0;
  this.effectsSequence = [];
  this._isFirstFrame = true;
  this.getValue = processEffectsSequence;
  this.setVValue = setVValue;
  this.addEffect = addEffect;
}

function MultiDimensionalProperty(elem, data, mult, container) {
  this.propType = 'multidimensional';
  this.mult = mult || 1;
  this.data = data;
  this._mdf = false;
  this.elem = elem;
  this.container = container;
  this.comp = elem.comp;
  this.k = false;
  this.kf = false;
  this.frameId = -1;
  var i;
  var len = data.k.length;
  this.v = createTypedArray('float32', len);
  this.pv = createTypedArray('float32', len);
  this.vel = createTypedArray('float32', len);
  for (i = 0; i < len; i += 1) {
    this.v[i] = data.k[i] * this.mult;
    this.pv[i] = data.k[i];
  }
  this._isFirstFrame = true;
  this.effectsSequence = [];
  this.getValue = processEffectsSequence;
  this.setVValue = setVValue;
  this.addEffect = addEffect;
}

function KeyframedValueProperty(elem, data, mult, container) {
  this.propType = 'unidimensional';
  this.keyframes = data.k;
  this.keyframesMetadata = [];
  this.offsetTime = elem.data.st;
  this.frameId = -1;
  this._caching = {
    lastFrame: initFrame, lastIndex: 0, value: 0, _lastKeyframeIndex: -1,
  };
  this.k = true;
  this.kf = true;
  this.data = data;
  this.mult = mult || 1;
  this.elem = elem;
  this.container = container;
  this.comp = elem.comp;
  this.v = initFrame;
  this.pv = initFrame;
  this._isFirstFrame = true;
  this.getValue = processEffectsSequence;
  this.setVValue = setVValue;
  this.interpolateValue = interpolateValue;
  this.effectsSequence = [getValueAtCurrentTime.bind(this)];
  this.addEffect = addEffect;
}

function KeyframedMultidimensionalProperty(elem, data, mult, container) {
  this.propType = 'multidimensional';
  var i;
  var len = data.k.length;
  var s;
  var e;
  var to;
  var ti;
  for (i = 0; i < len - 1; i += 1) {
    if (data.k[i].to && data.k[i].s && data.k[i + 1] && data.k[i + 1].s) {
      s = data.k[i].s;
      e = data.k[i + 1].s;
      to = data.k[i].to;
      ti = data.k[i].ti;
      if ((s.length === 2 && !(s[0] === e[0] && s[1] === e[1]) && bez.pointOnLine2D(s[0], s[1], e[0], e[1], s[0] + to[0], s[1] + to[1]) && bez.pointOnLine2D(s[0], s[1], e[0], e[1], e[0] + ti[0], e[1] + ti[1])) || (s.length === 3 && !(s[0] === e[0] && s[1] === e[1] && s[2] === e[2]) && bez.pointOnLine3D(s[0], s[1], s[2], e[0], e[1], e[2], s[0] + to[0], s[1] + to[1], s[2] + to[2]) && bez.pointOnLine3D(s[0], s[1], s[2], e[0], e[1], e[2], e[0] + ti[0], e[1] + ti[1], e[2] + ti[2]))) {
        data.k[i].to = null;
        data.k[i].ti = null;
      }
      if (s[0] === e[0] && s[1] === e[1] && to[0] === 0 && to[1] === 0 && ti[0] === 0 && ti[1] === 0) {
        if (s.length === 2 || (s[2] === e[2] && to[2] === 0 && ti[2] === 0)) {
          data.k[i].to = null;
          data.k[i].ti = null;
        }
      }
    }
  }
  this.effectsSequence = [getValueAtCurrentTime.bind(this)];
  this.data = data;
  this.keyframes = data.k;
  this.keyframesMetadata = [];
  this.offsetTime = elem.data.st;
  this.k = true;
  this.kf = true;
  this._isFirstFrame = true;
  this.mult = mult || 1;
  this.elem = elem;
  this.container = container;
  this.comp = elem.comp;
  this.getValue = processEffectsSequence;
  this.setVValue = setVValue;
  this.interpolateValue = interpolateValue;
  this.frameId = -1;
  var arrLen = data.k[0].s.length;
  this.v = createTypedArray('float32', arrLen);
  this.pv = createTypedArray('float32', arrLen);
  for (i = 0; i < arrLen; i += 1) {
    this.v[i] = initFrame;
    this.pv[i] = initFrame;
  }
  this._caching = { lastFrame: initFrame, lastIndex: 0, value: createTypedArray('float32', arrLen) };
  this.addEffect = addEffect;
}

const PropertyFactory = (function () {
  function getProp(elem, data, type, mult, container) {
    if (data.sid) {
      data = elem.globalData.slotManager.getProp(data);
    }
    var p;
    if (!data.k.length) {
      p = new ValueProperty(elem, data, mult, container);
    } else if (typeof (data.k[0]) === 'number') {
      p = new MultiDimensionalProperty(elem, data, mult, container);
    } else {
      switch (type) {
        case 0:
          p = new KeyframedValueProperty(elem, data, mult, container);
          break;
        case 1:
          p = new KeyframedMultidimensionalProperty(elem, data, mult, container);
          break;
        default:
          break;
      }
    }
    if (p.effectsSequence.length) {
      container.addDynamicProperty(p);
    }
    return p;
  }

  var ob = {
    getProp: getProp,
  };
  return ob;
}());

export default PropertyFactory;
