function SVGStrokeStyleData(elem, data, styleOb){
	this.o = PropertyFactory.getProp(elem,data.o,0,0.01,elem);
	this.w = PropertyFactory.getProp(elem,data.w,0,null,elem);
	this.d = new DashProperty(elem,data.d||{},'svg',elem);
	this.c = PropertyFactory.getProp(elem,data.c,1,255,elem);
	this.style = styleOb;
}