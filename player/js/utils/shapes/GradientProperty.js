import {
  extendPrototype,
} from '../functionExtensions';
import DynamicPropertyContainer from '../helpers/dynamicProperties';
import {
  createTypedArray,
} from '../helpers/arrays';
import PropertyFactory from '../PropertyFactory';
import { lerp, lerpFactor } from '../common';

function GradientProperty(elem, data, container) {
  this.data = data;
  this.c = createTypedArray('uint8c', data.p * 4);
  var cLength = data.k.k[0].s ? (data.k.k[0].s.length - data.p * 4) : data.k.k.length - data.p * 4;
  this.o = createTypedArray('float32', cLength);
  this._cmdf = false;
  this._omdf = false;
  this._collapsable = this.checkCollapsable();
  this._hasOpacity = cLength;
  this.initDynamicPropertyContainer(container);
  this.prop = PropertyFactory.getProp(elem, data.k, 1, null, this);
  this.k = this.prop.k;
  this.getValue(true);
}

GradientProperty.prototype.comparePoints = function (values, points) {
  var i = 0;
  var len = this.o.length / 2;
  var diff;
  while (i < len) {
    diff = Math.abs(values[i * 4] - values[points * 4 + i * 2]);
    if (diff > 0.01) {
      return false;
    }
    i += 1;
  }
  return true;
};

GradientProperty.prototype.checkCollapsable = function () {
  if (this.o.length / 2 !== this.c.length / 4) {
    return false;
  }
  if (this.data.k.k[0].s) {
    var i = 0;
    var len = this.data.k.k.length;
    while (i < len) {
      if (!this.comparePoints(this.data.k.k[i].s, this.data.p)) {
        return false;
      }
      i += 1;
    }
  } else if (!this.comparePoints(this.data.k.k, this.data.p)) {
    return false;
  }
  return true;
};

const firstValueCmp = (a, b) => a[0] - b[0];

GradientProperty.prototype.mergeStops = function () {
  var len = this.data.p;
  var i = 0;

  if (this._mergedStops === undefined) {
    this._cSorted = new Array(len);
    this._oSorted = new Array(len);
    this._mergedStops = new Array(len * 2);

    for (i = 0; i < len; i += 1) {
      this._cSorted[i] = createTypedArray('uint8c', 4);
      this._oSorted[i] = createTypedArray('uint8c', 2);
      this._mergedStops[i * 2] = createTypedArray('uint8c', 5);
      this._mergedStops[i * 2 + 1] = createTypedArray('uint8c', 5);
    }
  }

  var cValues = this.c;
  var oValues = this.o;
  var cSorted = this._cSorted;
  var oSorted = this._oSorted;
  var stops = this._mergedStops;

  for (i = 0; i < len; i += 1) {
    cSorted[i][0] = cValues[i * 4];
    cSorted[i][1] = cValues[i * 4 + 1];
    cSorted[i][2] = cValues[i * 4 + 2];
    cSorted[i][3] = cValues[i * 4 + 3];

    oSorted[i][0] = Math.round(oValues[i * 2]);
    oSorted[i][1] = Math.round(oValues[i * 2 + 1] * 255);
  }
  cSorted.sort(firstValueCmp);
  oSorted.sort(firstValueCmp);

  i = 0;
  var ci = 0;
  var oi = 0;
  var factor;
  while (ci < len || oi < len) {
    if (oi === len || (ci < len && cSorted[ci][0] < oSorted[oi][0])) {
      stops[i][0] = cSorted[ci][0];
      stops[i][1] = cSorted[ci][1];
      stops[i][2] = cSorted[ci][2];
      stops[i][3] = cSorted[ci][3];
      if (oi === 0) {
        stops[i][4] = oSorted[0][1];
      } else if (oi === len) {
        stops[i][4] = oSorted[len - 1][1];
      } else {
        factor = lerpFactor(oSorted[oi - 1][0], oSorted[oi][0], cSorted[ci][0]);
        stops[i][4] = lerp(oSorted[oi - 1][1], oSorted[oi][1], factor);
      }
      ci += 1;
      i += 1;
    } else if (ci === len || cSorted[ci][0] > oSorted[oi][0]) {
      stops[i][0] = oSorted[oi][0];
      stops[i][4] = oSorted[oi][1];

      if (ci === 0) {
        stops[i][1] = cSorted[0][1];
        stops[i][2] = cSorted[0][2];
        stops[i][3] = cSorted[0][3];
      } else if (ci === len) {
        stops[i][1] = cSorted[len - 1][1];
        stops[i][2] = cSorted[len - 1][2];
        stops[i][3] = cSorted[len - 1][3];
      } else {
        factor = lerpFactor(cSorted[ci - 1][0], cSorted[ci][0], oSorted[oi][0]);
        stops[i][1] = lerp(cSorted[ci - 1][1], cSorted[ci][1], factor);
        stops[i][2] = lerp(cSorted[ci - 1][2], cSorted[ci][2], factor);
        stops[i][3] = lerp(cSorted[ci - 1][3], cSorted[ci][3], factor);
      }
      oi += 1;
      i += 1;
    } else if (cSorted[ci][0] === oSorted[oi][0]) {
      stops[i][0] = cSorted[ci][0];
      stops[i][1] = cSorted[ci][1];
      stops[i][2] = cSorted[ci][2];
      stops[i][3] = cSorted[ci][3];
      stops[i][4] = oSorted[oi][1];
      ci += 1;
      oi += 1;
      i += 1;
    }
  }
  this._mergedStopsLen = i;
};

GradientProperty.prototype.getValue = function (forceRender) {
  this.prop.getValue();
  this._mdf = false;
  this._cmdf = false;
  this._omdf = false;
  if (this.prop._mdf || forceRender) {
    var i;
    var len = this.data.p * 4;
    var mult;
    var val;
    for (i = 0; i < len; i += 1) {
      mult = i % 4 === 0 ? 100 : 255;
      val = Math.round(this.prop.v[i] * mult);
      if (this.c[i] !== val) {
        this.c[i] = val;
        this._cmdf = !forceRender;
      }
    }
    if (this.o.length) {
      len = this.prop.v.length;
      for (i = this.data.p * 4; i < len; i += 1) {
        mult = i % 2 === 0 ? 100 : 1;
        val = i % 2 === 0 ? Math.round(this.prop.v[i] * 100) : this.prop.v[i];
        if (this.o[i - this.data.p * 4] !== val) {
          this.o[i - this.data.p * 4] = val;
          this._omdf = !forceRender;
        }
      }
    }
    this._mdf = !forceRender;
  }
};

extendPrototype([DynamicPropertyContainer], GradientProperty);

export default GradientProperty;
