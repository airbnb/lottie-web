/* global dataManager */

dataManager.completeData = function (animationData, fontManager) {
  if (animationData.__complete) {
    return;
  }
  this.checkColors(animationData);
  this.checkChars(animationData);
  this.checkShapes(animationData);
  this.completeLayers(animationData.layers, animationData.assets, fontManager);
  animationData.__complete = true;
};
