function SVGGradientStrokeStyleData(elem, data, dynamicProperties, styleOb){
	this.o = PropertyFactory.getProp(elem,data.o,0,0.01,dynamicProperties);
	this.w = PropertyFactory.getProp(elem,data.w,0,null,dynamicProperties);
	this.d = new DashProperty(elem,data.d||{},'svg',dynamicProperties);
	this.s = PropertyFactory.getProp(elem,data.s,1,null,dynamicProperties);
    this.e = PropertyFactory.getProp(elem,data.e,1,null,dynamicProperties);
    this.h = PropertyFactory.getProp(elem,data.h||{k:0},0,0.01,dynamicProperties);
    this.a = PropertyFactory.getProp(elem,data.a||{k:0},0,degToRads,dynamicProperties);
    this.g = new GradientProperty(elem,data.g,dynamicProperties);
	this.style = styleOb;
	this.setGradientData(styleOb.pElem, data);
	this.setGradientOpacity(data, styleOb);
}

SVGGradientStrokeStyleData.prototype.setGradientData = SVGGradientFillStyleData.prototype.setGradientData;
SVGGradientStrokeStyleData.prototype.setGradientOpacity = SVGGradientFillStyleData.prototype.setGradientOpacity;