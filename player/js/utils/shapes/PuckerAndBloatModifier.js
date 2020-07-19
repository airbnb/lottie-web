function PuckerAndBloatModifier(){}
extendPrototype([ShapeModifier],PuckerAndBloatModifier);
PuckerAndBloatModifier.prototype.initModifierProperties = function(elem,data){
    this.getValue = this.processKeys;
    this.amount = PropertyFactory.getProp(elem,data.a,0,null,this);
    this._isAnimated = !!this.amount.effectsSequence.length;
};

PuckerAndBloatModifier.prototype.processPath = function(path, amount){
    var percent = amount / 100;
    var centerPoint = [0, 0];
    var pathLength = path._length, i = 0;
    for (i = 0; i < pathLength; i += 1) {
        centerPoint[0] += path.v[i][0];
        centerPoint[1] += path.v[i][1];
    }
    centerPoint[0] /= pathLength;
    centerPoint[1] /= pathLength;
    var cloned_path = shape_pool.newElement();
    cloned_path.c = path.c;
    var vX, vY, oX, oY, iX, iY;
    for(i = 0; i < pathLength; i += 1) {
        vX = path.v[i][0] + (centerPoint[0] - path.v[i][0]) * percent;
        vY = path.v[i][1] + (centerPoint[1] - path.v[i][1]) * percent;
        oX = path.o[i][0] + (centerPoint[0] - path.o[i][0]) * -percent;
        oY = path.o[i][1] + (centerPoint[1] - path.o[i][1]) * -percent;
        iX = path.i[i][0] + (centerPoint[0] - path.i[i][0]) * -percent;
        iY = path.i[i][1] + (centerPoint[1] - path.i[i][1]) * -percent;
        cloned_path.setTripleAt(vX, vY, oX, oY, iX, iY, i);
    }
    return cloned_path;
};

PuckerAndBloatModifier.prototype.processShapes = function(_isFirstFrame){
    var shapePaths;
    var i, len = this.shapes.length;
    var j, jLen;
    var amount = this.amount.v;

    if(amount !== 0){
        var shapeData, newPaths, localShapeCollection;
        for(i=0;i<len;i+=1){
            shapeData = this.shapes[i];
            newPaths = shapeData.shape.paths;
            localShapeCollection = shapeData.localShapeCollection;
            if(!(!shapeData.shape._mdf && !this._mdf && !_isFirstFrame)){
                localShapeCollection.releaseShapes();
                shapeData.shape._mdf = true;
                shapePaths = shapeData.shape.paths.shapes;
                jLen = shapeData.shape.paths._length;
                for(j=0;j<jLen;j+=1){
                    localShapeCollection.addShape(this.processPath(shapePaths[j], amount));
                }
            }
            shapeData.shape.paths = shapeData.localShapeCollection;
        }
    }
    if(!this.dynamicProperties.length){
        this._mdf = false;
    }
};
ShapeModifiers.registerModifier('pb',PuckerAndBloatModifier);