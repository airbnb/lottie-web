function SVGShapeData(transformers, level, shape) {
    this.caches = [];
    this.styles = [];
    this.transformers = transformers;
    this.lStr = '';
    this.sh = shape;
    this.lvl = level;
    this._isAnimated = !!shape.k;
    var i = 0, len = transformers.length;
    while(i < len) {
    	if(transformers[i].k) {
    		this._isAnimated = true;
    		break;
    	}
    	i += 1;
    }
}