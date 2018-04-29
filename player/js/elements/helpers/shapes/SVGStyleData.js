function SVGStyleData(data, level) {
	this.data = data;
	this.type = data.ty;
	this.d = '';
	this.lvl = level;
	this._mdf = false;
	this.closed = false;
	this.pElem = createNS('path');
	this.PpElem = new PIXI.Graphics();
	this.PD = [];
	this.msElem = null;
}

SVGStyleData.prototype.reset = function() {
	this.d = '';
	this.PD.length = 0;
	this._mdf = false;
};