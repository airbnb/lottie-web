var registeredEffects = {};

function CVEffects(elem) {
  var i;
  var len = elem.data.ef ? elem.data.ef.length : 0;
  this.filters = [];
  var filterManager;
  for (i = 0; i < len; i += 1) {
    filterManager = null;
    var type = elem.data.ef[i].ty;
    if (registeredEffects[type]) {
      var Effect = registeredEffects[type].effect;
      filterManager = new Effect(elem.effectsManager.effectElements[i], elem);
    }
    if (filterManager) {
      this.filters.push(filterManager);
    }
  }
  if (this.filters.length) {
    elem.addRenderableComponent(this);
  }
}

CVEffects.prototype.renderFrame = function (_isFirstFrame) {
  var i;
  var len = this.filters.length;
  for (i = 0; i < len; i += 1) {
    this.filters[i].renderFrame(_isFirstFrame);
  }
};

CVEffects.prototype.getEffects = function (type) {
  var i;
  var len = this.filters.length;
  var effects = [];
  for (i = 0; i < len; i += 1) {
    if (this.filters[i].type === type) {
      effects.push(this.filters[i]);
    }
  }
  return effects;
};

export function registerEffect(id, effect) {
  registeredEffects[id] = {
    effect,
  };
}

export default CVEffects;
