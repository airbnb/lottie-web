function ShapeCollection(){
	this._length = 0;
	this._actualArrayLength = 8;
	this._shapes = Array.apply(null,{length:this._actualArrayLength});
}

ShapeCollection.prototype.addShape = function(shapeData){
	if(this._length === this._actualArrayLength){
		this._shapes = this._shapes.concat(Array.apply(null,{length:this._actualArrayLength}));
		this._actualArrayLength *= 2;
	}
	this._shapes[this._length] = shapeData;
	this._length += 1;
}

ShapeCollection.prototype.releaseShapes = function(){
	var i;
	for(i = 0; i < this._length; i += 1) {
		shape_pool.release(this._shapes[i]);
	}
	this._length = 0;
}