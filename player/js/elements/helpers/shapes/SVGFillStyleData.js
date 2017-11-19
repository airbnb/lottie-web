function SVGFillStyleData(elem, data, dynamicProperties, styleOb){
	this.o = PropertyFactory.getProp(elem,data.o,0,0.01,dynamicProperties);
	this.c = PropertyFactory.getProp(elem,data.c,1,255,dynamicProperties);
	this.style = styleOb;
}