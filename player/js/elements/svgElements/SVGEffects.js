import { getLocationHref } from '../../main';
import {
  createElementID,
} from '../../utils/common';
import filtersFactory from '../../utils/filters';

var registeredEffects = {};
var idPrefix = 'filter_result_';

function SVGEffects(elem) {
  var i;
  var source = 'SourceGraphic';
  var len = elem.data.ef ? elem.data.ef.length : 0;
  var filId = createElementID();
  var fil = filtersFactory.createFilter(filId, true);
  var count = 0;
  this.filters = [];
  var filterManager;
  for (i = 0; i < len; i += 1) {
    filterManager = null;
    var type = elem.data.ef[i].ty;
    if (registeredEffects[type]) {
      var Effect = registeredEffects[type].effect;
      filterManager = new Effect(fil, elem.effectsManager.effectElements[i], elem, idPrefix + count, source);
      source = idPrefix + count;
      if (registeredEffects[type].countsAsEffect) {
        count += 1;
      }
    }
    if (filterManager) {
      this.filters.push(filterManager);
    }
  }
  if (count) {
    elem.globalData.defs.appendChild(fil);
    elem.layerElement.setAttribute('filter', 'url(' + getLocationHref() + '#' + filId + ')');
  }
  if (this.filters.length) {
    elem.addRenderableComponent(this);
  }
}

SVGEffects.prototype.renderFrame = function (_isFirstFrame) {
  var i;
  var len = this.filters.length;
  for (i = 0; i < len; i += 1) {
    this.filters[i].renderFrame(_isFirstFrame);
  }
};

export function registerEffect(id, effect, countsAsEffect) {
  registeredEffects[id] = {
    effect,
    countsAsEffect,
  };
}

export default SVGEffects;
