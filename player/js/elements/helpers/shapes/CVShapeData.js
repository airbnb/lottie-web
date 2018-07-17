function CVShapeData(transformers, level, shape) {
    this.nodes = [];
    this.trNodes = [];
    this.transformers = transformers;
    this.lvl = level;
    this.tr = [0,0,0,0,0,0];
    this.sh = shape;
    this.st = false;
    this.fl = false;
}

CVShapeData.prototype.setAsAnimated = SVGShapeData.prototype.setAsAnimated;