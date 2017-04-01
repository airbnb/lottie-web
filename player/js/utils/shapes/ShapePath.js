function ShapePath(){
	this.c = false;
	this._length = 0;
	this._actualArrayLength = 8;
	this.v = Array.apply(null,{length:this._actualArrayLength});
	this.o = Array.apply(null,{length:this._actualArrayLength});
	this.i = Array.apply(null,{length:this._actualArrayLength});
}

ShapePath.prototype.setPathData = function(closed, len) {
	this.c = closed;
	while(len > this._actualArrayLength){
		this.doubleArrayLength();
	}
	var i = 0;
	while(i < len){
		this.v[i] = point_pool.newPoint();
		this.o[i] = point_pool.newPoint();
		this.i[i] = point_pool.newPoint();
		i += 1;
	}
	this._length = len;
}

ShapePath.prototype.doubleArrayLength = function() {
	this.v = this.v.concat(Array.apply(null,{length:this._actualArrayLength}))
	this.i = this.i.concat(Array.apply(null,{length:this._actualArrayLength}))
	this.o = this.o.concat(Array.apply(null,{length:this._actualArrayLength}))
	this._actualArrayLength *= 2;
}

ShapePath.prototype.setPointAt = function(point, type, pos) {
	this.setXYAt(point[0],point[1],type,pos);
}

ShapePath.prototype.setTriplePointAt = function(v,o,i,pos) {
	this.setTripleAt(v[0],v[1],o[0],[1],i[0],i[1],pos);
}

ShapePath.prototype.setXYAt = function(x, y, type, pos) {
	var arr;
	this._length = Math.max(this._length, pos + 1);
	if(this._length >= this._actualArrayLength) {
		this.doubleArrayLength();
	}
	switch(type){
		case 'v':
			arr = this.v;
			break;
		case 'i':
			arr = this.i;
			break;
		case 'o':
			arr = this.o;
			break;
	}
	arr[pos] = point_pool.newPoint();
	arr[pos][0] = x;
	arr[pos][1] = y;
}

ShapePath.prototype.setTripleAt = function(vX,vY,oX,oY,iX,iY,pos) {
	this.setXYAt(vX,vY,'v',pos);
	this.setXYAt(oX,oY,'o',pos);
	this.setXYAt(iX,iY,'i',pos);
}