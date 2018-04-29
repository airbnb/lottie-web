function SVGGradientStrokeStyleData(elem, data, styleOb){
	this.initDynamicPropertyContainer(elem);
	this.getValue = this.iterateDynamicProperties;
	this.w = PropertyFactory.getProp(elem,data.w,0,null,this);
	this.d = new DashProperty(elem,data.d||{},'svg',this);
    this.initGradientData(elem, data, styleOb);
    this._isAnimated = !!this._isAnimated;
}

extendPrototype([SVGGradientFillStyleData, DynamicPropertyContainer], SVGGradientStrokeStyleData);