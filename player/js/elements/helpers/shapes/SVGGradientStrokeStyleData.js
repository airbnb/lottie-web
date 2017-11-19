function SVGGradientStrokeStyleData(elem, data, dynamicProperties, styleOb){
	this.w = PropertyFactory.getProp(elem,data.w,0,null,dynamicProperties);
	this.d = new DashProperty(elem,data.d||{},'svg',dynamicProperties);
    this.initGradientData(elem, data, dynamicProperties, styleOb);
}

SVGGradientStrokeStyleData.prototype.initGradientData = SVGGradientFillStyleData.prototype.initGradientData;
SVGGradientStrokeStyleData.prototype.setGradientData = SVGGradientFillStyleData.prototype.setGradientData;
SVGGradientStrokeStyleData.prototype.setGradientOpacity = SVGGradientFillStyleData.prototype.setGradientOpacity;