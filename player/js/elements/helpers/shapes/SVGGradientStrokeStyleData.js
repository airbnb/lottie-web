function SVGGradientStrokeStyleData(elem, data, styleOb){
	this.w = PropertyFactory.getProp(elem,data.w,0,null,elem);
	this.d = new DashProperty(elem,data.d||{},'svg',elem);
    this.initGradientData(elem, data, styleOb);
    this._isAnimated = !!this._isAnimated 
        || this.w.effectsSequence.length
        || this.d._isAnimated;
}

SVGGradientStrokeStyleData.prototype.initGradientData = SVGGradientFillStyleData.prototype.initGradientData;
SVGGradientStrokeStyleData.prototype.setGradientData = SVGGradientFillStyleData.prototype.setGradientData;
SVGGradientStrokeStyleData.prototype.setGradientOpacity = SVGGradientFillStyleData.prototype.setGradientOpacity;