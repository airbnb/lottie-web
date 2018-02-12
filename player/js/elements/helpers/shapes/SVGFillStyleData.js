function SVGFillStyleData(elem, data, styleOb){
	this.o = PropertyFactory.getProp(elem,data.o,0,0.01,elem);
	this.c = PropertyFactory.getProp(elem,data.c,1,255,elem);
	this.style = styleOb;
}