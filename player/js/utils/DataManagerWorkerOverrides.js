/* global dataManager */

dataManager.completeData = function (animationData) {
  if (animationData.__complete) {
    return;
  }
  this.checkColors(animationData);
  this.checkChars(animationData);
  this.checkPathProperties(animationData);
  this.checkShapes(animationData);
  this.completeLayers(animationData.layers, animationData.assets);
  animationData.__complete = true;
};
