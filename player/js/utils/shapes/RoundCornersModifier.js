/* global extendPrototype, ShapeModifier, PropertyFactory, shapePool, roundCorner, ShapeModifiers */

function RoundCornersModifier() {}
extendPrototype([ShapeModifier], RoundCornersModifier);
RoundCornersModifier.prototype.initModifierProperties = function (elem, data) {
  this.getValue = this.processKeys;
  this.rd = PropertyFactory.getProp(elem, data.r, 0, null, this);
  this._isAnimated = !!this.rd.effectsSequence.length;
};

RoundCornersModifier.prototype.processPath = function (path, round) {
  var clonedPath = shapePool.newElement();
  clonedPath.c = path.c;
  var i;
  var len = path._length;
  var currentV;
  var currentI;
  var currentO;
  var closerV;
  var distance;
  var newPosPerc;
  var index = 0;
  var vX;
  var vY;
  var oX;
  var oY;
  var iX;
  var iY;
  for (i = 0; i < len; i += 1) {
    currentV = path.v[i];
    currentO = path.o[i];
    currentI = path.i[i];
    if (currentV[0] === currentO[0] && currentV[1] === currentO[1] && currentV[0] === currentI[0] && currentV[1] === currentI[1]) {
      if ((i === 0 || i === len - 1) && !path.c) {
        clonedPath.setTripleAt(currentV[0], currentV[1], currentO[0], currentO[1], currentI[0], currentI[1], index);
        /* clonedPath.v[index] = currentV;
                clonedPath.o[index] = currentO;
                clonedPath.i[index] = currentI; */
        index += 1;
      } else {
        if (i === 0) {
          closerV = path.v[len - 1];
        } else {
          closerV = path.v[i - 1];
        }
        distance = Math.sqrt(Math.pow(currentV[0] - closerV[0], 2) + Math.pow(currentV[1] - closerV[1], 2));
        newPosPerc = distance ? Math.min(distance / 2, round) / distance : 0;
        iX = currentV[0] + (closerV[0] - currentV[0]) * newPosPerc;
        vX = iX;
        iY = currentV[1] - (currentV[1] - closerV[1]) * newPosPerc;
        vY = iY;
        oX = vX - (vX - currentV[0]) * roundCorner;
        oY = vY - (vY - currentV[1]) * roundCorner;
        clonedPath.setTripleAt(vX, vY, oX, oY, iX, iY, index);
        index += 1;

        if (i === len - 1) {
          closerV = path.v[0];
        } else {
          closerV = path.v[i + 1];
        }
        distance = Math.sqrt(Math.pow(currentV[0] - closerV[0], 2) + Math.pow(currentV[1] - closerV[1], 2));
        newPosPerc = distance ? Math.min(distance / 2, round) / distance : 0;
        oX = currentV[0] + (closerV[0] - currentV[0]) * newPosPerc;
        vX = oX;
        oY = currentV[1] + (closerV[1] - currentV[1]) * newPosPerc;
        vY = oY;
        iX = vX - (vX - currentV[0]) * roundCorner;
        iY = vY - (vY - currentV[1]) * roundCorner;
        clonedPath.setTripleAt(vX, vY, oX, oY, iX, iY, index);
        index += 1;
      }
    } else {
      clonedPath.setTripleAt(path.v[i][0], path.v[i][1], path.o[i][0], path.o[i][1], path.i[i][0], path.i[i][1], index);
      index += 1;
    }
  }
  return clonedPath;
};

RoundCornersModifier.prototype.processShapes = function (_isFirstFrame) {
  var shapePaths;
  var i;
  var len = this.shapes.length;
  var j;
  var jLen;
  var rd = this.rd.v;

  if (rd !== 0) {
    var shapeData;
    var localShapeCollection;
    for (i = 0; i < len; i += 1) {
      shapeData = this.shapes[i];
      localShapeCollection = shapeData.localShapeCollection;
      if (!(!shapeData.shape._mdf && !this._mdf && !_isFirstFrame)) {
        localShapeCollection.releaseShapes();
        shapeData.shape._mdf = true;
        shapePaths = shapeData.shape.paths.shapes;
        jLen = shapeData.shape.paths._length;
        for (j = 0; j < jLen; j += 1) {
          localShapeCollection.addShape(this.processPath(shapePaths[j], rd));
        }
      }
      shapeData.shape.paths = shapeData.localShapeCollection;
    }
  }
  if (!this.dynamicProperties.length) {
    this._mdf = false;
  }
};

ShapeModifiers.registerModifier('rd', RoundCornersModifier);
