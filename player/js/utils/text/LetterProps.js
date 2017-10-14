function LetterProps(o, sw, sc, fc, m, p){
    this.o = o;
    this.sw = sw;
    this.sc = sc;
    this.fc = fc;
    this.m = m;
    this.p = p;
    this.mdf = {
    	o: true,
    	sw: !!sw,
    	sc: !!sc,
    	fc: !!fc,
    	m: true,
    	p: true
    };
}

LetterProps.prototype.update = function(o, sw, sc, fc, m, p) {
	this.mdf.o = false;
	this.mdf.sw = false;
	this.mdf.sc = false;
	this.mdf.fc = false;
	this.mdf.m = false;
	this.mdf.p = false;
	var updated = false;

	if(this.o !== o) {
		this.o = o;
		this.mdf.o = true;
		updated = true;
	}
	if(this.sw !== sw) {
		this.sw = sw;
		this.mdf.sw = true;
		updated = true;
	}
	if(this.sc !== sc) {
		this.sc = sc;
		this.mdf.sc = true;
		updated = true;
	}
	if(this.fc !== fc) {
		this.fc = fc;
		this.mdf.fc = true;
		updated = true;
	}
	if(this.m !== m) {
		this.m = m;
		this.mdf.m = true;
		updated = true;
	}
	if(p.length && (this.p[0] !== p[0] || this.p[1] !== p[1] || this.p[4] !== p[4] || this.p[5] !== p[5] || this.p[12] !== p[12] || this.p[13] !== p[13])) {
		this.p = p;
		this.mdf.p = true;
		updated = true;
	}
	return updated;
}