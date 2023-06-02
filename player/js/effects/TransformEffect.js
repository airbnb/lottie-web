import effectTypes from '../utils/helpers/effectTypes';
import Matrix from '../3rd_party/transformation-matrix';
import { degToRads } from '../utils/common';

function TransformEffect() {
}

TransformEffect.prototype.init = function (effectsManager) {
  this.effectsManager = effectsManager;
  this.type = effectTypes.TRANSFORM_EFFECT;
  this.matrix = new Matrix();
  this.opacity = -1;
  this._mdf = false;
  this._opMdf = false;
};

TransformEffect.prototype.renderFrame = function (forceFrame) {
  this._opMdf = false;
  this._mdf = false;
  if (forceFrame || this.effectsManager._mdf) {
    var effectElements = this.effectsManager.effectElements;
    var anchor = effectElements[0].p.v;
    var position = effectElements[1].p.v;
    var isUniformScale = effectElements[2].p.v === 1;
    var scaleHeight = effectElements[3].p.v;
    var scaleWidth = isUniformScale ? scaleHeight : effectElements[4].p.v;
    var skew = effectElements[5].p.v;
    var skewAxis = effectElements[6].p.v;
    var rotation = effectElements[7].p.v;
    this.matrix.reset();
    this.matrix.translate(-anchor[0], -anchor[1], anchor[2]);
    this.matrix.scale(scaleWidth * 0.01, scaleHeight * 0.01, 1);
    this.matrix.rotate(-rotation * degToRads);
    this.matrix.skewFromAxis(-skew * degToRads, (skewAxis + 90) * degToRads);
    this.matrix.translate(position[0], position[1], 0);
    this._mdf = true;
    if (this.opacity !== effectElements[8].p.v) {
      this.opacity = effectElements[8].p.v;
      this._opMdf = true;
    }
  }
};

export default TransformEffect;
