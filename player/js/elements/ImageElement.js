function IImageElement(data,globalData,comp){
    this.assetData = globalData.getAssetData(data.refId);
    this.initElement(data,globalData,comp);
}

extendPrototype([BaseElement,TransformElement,SVGBaseElement,HierarchyElement,FrameElement,RenderableDOMElement], IImageElement);

IImageElement.prototype.createContent = function(){

    var assetPath = this.globalData.getAssetsPath(this.assetData);

    this.innerElem = createNS('image');
    this.innerElem.setAttribute('width',this.assetData.w+"px");
    this.innerElem.setAttribute('height',this.assetData.h+"px");
    this.innerElem.setAttribute('preserveAspectRatio','xMidYMid slice');
    this.innerElem.setAttributeNS('http://www.w3.org/1999/xlink','href',assetPath);
    
    this.layerElement.appendChild(this.innerElem);
};
