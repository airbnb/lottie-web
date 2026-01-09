function CVGaussianBlurEffect(effectsManager, elem) {
  this.filterManager = effectsManager;
  this.elem = elem;
  this.globalData = elem.globalData;
}

CVGaussianBlurEffect.prototype.renderFrame = function () {
  var scale = this.globalData.transformCanvas.sx;
  // Empirical value, matching AE's blur appearance.
  var kBlurrinessToSigma = 0.3;
  var sigma = this.filterManager.effectElements[0].p.v * kBlurrinessToSigma * scale;

  // Dimensions mapping:
  //
  //   1 -> horizontal & vertical
  //   2 -> horizontal only
  //   3 -> vertical only
  //
  var dimensions = this.filterManager.effectElements[1].p.v;
  var sigmaX = (dimensions == 3) ? 0 : sigma; // eslint-disable-line eqeqeq
  var sigmaY = (dimensions == 2) ? 0 : sigma; // eslint-disable-line eqeqeq

  // Store filter string for combination with other effects
  if (sigmaX > 0 || sigmaY > 0) {
    // Canvas filter doesn't support separate X/Y blur like SVG, use maximum sigma
    var blurRadius = Math.max(sigmaX, sigmaY);
    this.filterString = 'blur(' + blurRadius + 'px)';
  } else {
    this.filterString = '';
  }
};

export default CVGaussianBlurEffect;
