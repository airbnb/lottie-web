// TODO(myxvisual): Work
/* global extendPrototype, BaseElement, TransformElement, SVGBaseElement, HierarchyElement, FrameElement, RenderableDOMElement, createNS */

function VideoElement(data, globalData, comp) {
  this.assetData = globalData.getAssetData(data.refId);
  this.initElement(data, globalData, comp);
  this.sourceRect = {
    top: 0, left: 0, width: this.assetData.w, height: this.assetData.h,
  };
}

extendPrototype([BaseElement, TransformElement, SVGBaseElement, HierarchyElement, FrameElement, RenderableDOMElement], VideoElement);

VideoElement.prototype.createContent = function () {
  var assetPath = this.globalData.getAssetsPath(this.assetData);

  this.innerElem = createNS('image');
  this.innerElem.setAttribute('width', this.assetData.w + 'px');
  this.innerElem.setAttribute('height', this.assetData.h + 'px');
  this.innerElem.setAttribute('preserveAspectRatio', this.assetData.pr || this.globalData.renderConfig.imagePreserveAspectRatio);
  this.innerElem.setAttributeNS('http://www.w3.org/1999/xlink', 'href', assetPath);

  this.layerElement.appendChild(this.innerElem);
};

VideoElement.prototype.sourceRectAtTime = function () {
  return this.sourceRect;
};

{/* <foreignObject x="0" y="0" width="250" height="250">
<video controls width="250">
    <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm"
            type="video/webm">
    Sorry, your browser doesn't support embedded videos.
</video>
    <foreignObject> */}