import { getLocationHref } from '../../../main';
import {
  createElementID,
  bmFloor,
} from '../../../utils/common';
import createNS from '../../../utils/helpers/svg_elements';

function SVGStrokeEffect(elem, filterManager) {
  this.initialized = false;
  this.filterManager = filterManager;
  this.elem = elem;
  this.paths = [];
}

SVGStrokeEffect.prototype.initialize = function () {
  var elemChildren = this.elem.layerElement.children || this.elem.layerElement.childNodes;
  var path;
  var groupPath;
  var i;
  var len;
  if (this.filterManager.effectElements[1].p.v === 1) {
    len = this.elem.maskManager.masksProperties.length;
    i = 0;
  } else {
    i = this.filterManager.effectElements[0].p.v - 1;
    len = i + 1;
  }
  groupPath = createNS('g');
  groupPath.setAttribute('fill', 'none');
  groupPath.setAttribute('stroke-linecap', 'round');
  groupPath.setAttribute('stroke-dashoffset', 1);
  for (i; i < len; i += 1) {
    path = createNS('path');
    groupPath.appendChild(path);
    this.paths.push({ p: path, m: i });
  }
  if (this.filterManager.effectElements[10].p.v === 3) {
    var mask = createNS('mask');
    var id = createElementID();
    mask.setAttribute('id', id);
    mask.setAttribute('mask-type', 'alpha');
    mask.appendChild(groupPath);
    this.elem.globalData.defs.appendChild(mask);
    var g = createNS('g');
    g.setAttribute('mask', 'url(' + getLocationHref() + '#' + id + ')');
    while (elemChildren[0]) {
      g.appendChild(elemChildren[0]);
    }
    this.elem.layerElement.appendChild(g);
    this.masker = mask;
    groupPath.setAttribute('stroke', '#fff');
  } else if (this.filterManager.effectElements[10].p.v === 1 || this.filterManager.effectElements[10].p.v === 2) {
    if (this.filterManager.effectElements[10].p.v === 2) {
      elemChildren = this.elem.layerElement.children || this.elem.layerElement.childNodes;
      while (elemChildren.length) {
        this.elem.layerElement.removeChild(elemChildren[0]);
      }
    }
    this.elem.layerElement.appendChild(groupPath);
    this.elem.layerElement.removeAttribute('mask');
    groupPath.setAttribute('stroke', '#fff');
  }
  this.initialized = true;
  this.pathMasker = groupPath;
};

SVGStrokeEffect.prototype.renderFrame = function (forceRender) {
  if (!this.initialized) {
    this.initialize();
  }
  var i;
  var len = this.paths.length;
  var mask;
  var path;
  for (i = 0; i < len; i += 1) {
    if (this.paths[i].m !== -1) {
      mask = this.elem.maskManager.viewData[this.paths[i].m];
      path = this.paths[i].p;
      if (forceRender || this.filterManager._mdf || mask.prop._mdf) {
        path.setAttribute('d', mask.lastPath);
      }
      if (forceRender || this.filterManager.effectElements[9].p._mdf || this.filterManager.effectElements[4].p._mdf || this.filterManager.effectElements[7].p._mdf || this.filterManager.effectElements[8].p._mdf || mask.prop._mdf) {
        var dasharrayValue;
        if (this.filterManager.effectElements[7].p.v !== 0 || this.filterManager.effectElements[8].p.v !== 100) {
          var s = Math.min(this.filterManager.effectElements[7].p.v, this.filterManager.effectElements[8].p.v) * 0.01;
          var e = Math.max(this.filterManager.effectElements[7].p.v, this.filterManager.effectElements[8].p.v) * 0.01;
          var l = path.getTotalLength();
          dasharrayValue = '0 0 0 ' + l * s + ' ';
          var lineLength = l * (e - s);
          var segment = 1 + this.filterManager.effectElements[4].p.v * 2 * this.filterManager.effectElements[9].p.v * 0.01;
          var units = Math.floor(lineLength / segment);
          var j;
          for (j = 0; j < units; j += 1) {
            dasharrayValue += '1 ' + this.filterManager.effectElements[4].p.v * 2 * this.filterManager.effectElements[9].p.v * 0.01 + ' ';
          }
          dasharrayValue += '0 ' + l * 10 + ' 0 0';
        } else {
          dasharrayValue = '1 ' + this.filterManager.effectElements[4].p.v * 2 * this.filterManager.effectElements[9].p.v * 0.01;
        }
        path.setAttribute('stroke-dasharray', dasharrayValue);
      }
    }
  }
  if (forceRender || this.filterManager.effectElements[4].p._mdf) {
    this.pathMasker.setAttribute('stroke-width', this.filterManager.effectElements[4].p.v * 2);
  }

  if (forceRender || this.filterManager.effectElements[6].p._mdf) {
    this.pathMasker.setAttribute('opacity', this.filterManager.effectElements[6].p.v);
  }
  if (this.filterManager.effectElements[10].p.v === 1 || this.filterManager.effectElements[10].p.v === 2) {
    if (forceRender || this.filterManager.effectElements[3].p._mdf) {
      var color = this.filterManager.effectElements[3].p.v;
      this.pathMasker.setAttribute('stroke', 'rgb(' + bmFloor(color[0] * 255) + ',' + bmFloor(color[1] * 255) + ',' + bmFloor(color[2] * 255) + ')');
    }
  }
};

export default SVGStrokeEffect;
