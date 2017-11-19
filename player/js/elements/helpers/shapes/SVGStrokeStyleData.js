function SVGStrokeStyleData(elem, data, dynamicProperties, styleOb){
	this.o = PropertyFactory.getProp(elem,data.o,0,0.01,dynamicProperties);
	this.w = PropertyFactory.getProp(elem,data.w,0,null,dynamicProperties);
	this.d = new DashProperty(elem,data.d||{},'svg',dynamicProperties);
	this.c = PropertyFactory.getProp(elem,data.c,1,255,dynamicProperties);
	this.style = styleOb;
}