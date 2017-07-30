function SVGMatte3Effect(filterElem, filterManager, elem){
    this.initialized = false;
    this.filterManager = filterManager;
    this.filterElem = filterElem;
    this.elem = elem;
    elem.matteElement = document.createElementNS(svgNS,'g');
    elem.matteElement.appendChild(elem.layerElement);
    elem.matteElement.appendChild(elem.transformedElement);
    elem.baseElement = elem.matteElement;
}

SVGMatte3Effect.prototype.setElementAsMask = function(elem, mask) {
    var masker = document.createElementNS(svgNS,'mask');
    masker.setAttribute('id',mask.layerId);
    masker.setAttribute('mask-type','alpha');
    masker.appendChild(mask.layerElement);
    elem.setMatte(mask.layerId);
    mask.data.hd = false;
    var defs = elem.globalData.defs;
    defs.appendChild(masker);
}

SVGMatte3Effect.prototype.initialize = function() {
    var ind = this.filterManager.effectElements[0].p.v;
    var i = 0, len = this.elem.comp.elements.length;
    while(i < len) {
    	if(this.elem.comp.elements[i].data.ind === ind) {
    		this.setElementAsMask(this.elem, this.elem.comp.elements[i]);
    	}
    	i += 1;
    }
    this.initialized = true;
}

SVGMatte3Effect.prototype.renderFrame = function() {
	if(!this.initialized) {
		this.initialize();
	}
}