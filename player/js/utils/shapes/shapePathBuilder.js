var buildShapeString = function(pathNodes, length, closed, mat) {
	if(length === 0) {
            return '';
        }
        var _o = pathNodes.o;
        var _i = pathNodes.i;
        var _v = pathNodes.v;
        var i, shapeString = " M" + mat.applyToPointStringified(_v[0][0], _v[0][1]);
        for(i = 1; i < length; i += 1) {
            shapeString += " C" + mat.applyToPointStringified(_o[i - 1][0], _o[i - 1][1]) + " " + mat.applyToPointStringified(_i[i][0], _i[i][1]) + " " + mat.applyToPointStringified(_v[i][0], _v[i][1]);
        }
        if (closed && length) {
            shapeString += " C" + mat.applyToPointStringified(_o[i - 1][0], _o[i - 1][1]) + " " + mat.applyToPointStringified(_i[0][0], _i[0][1]) + " " + mat.applyToPointStringified(_v[0][0], _v[0][1]);
            shapeString += 'z';
        }
        return shapeString;
};

var buildPIXIShape = function(pathNodes, length, closed, mat) {
    if(length === 0) {
            return '';
    }
    var _o = pathNodes.o;
    var _i = pathNodes.i;
    var _v = pathNodes.v;
    var _PIXIcommands = [];
    _PIXIcommands.push({
        t:'m',
        c:mat.applyToPointArray(_v[0][0], _v[0][1], 0)
    })
    var i, shapeString = " M" + mat.applyToPointStringified(_v[0][0], _v[0][1]);
    for(i = 1; i < length; i += 1) {
        _PIXIcommands.push({
            t:'c',
            c:mat.applyToPointArray(_o[i - 1][0], _o[i - 1][1], 0).concat(mat.applyToPointArray(_i[i][0], _i[i][1], 0)).concat(mat.applyToPointArray(_v[i][0], _v[i][1], 0))
        })
    }
    if (closed && length) {
        _PIXIcommands.push({
            t:'c',
            c:mat.applyToPointArray(_o[i - 1][0], _o[i - 1][1], 0).concat(mat.applyToPointArray(_i[0][0], _i[0][1], 0)).concat(mat.applyToPointArray(_v[0][0], _v[0][1], 0))
        })
    }

    //Fix for shapes with no length.
    //Todo: search a better solution. AE draws a point on this cases so the shape can't be removed.
    if(_PIXIcommands.length === 2 
        && _PIXIcommands[0].c[0] === _PIXIcommands[1].c[0]
        && _PIXIcommands[0].c[1] === _PIXIcommands[1].c[1]
        && _PIXIcommands[0].c[0] === _PIXIcommands[1].c[3]
        && _PIXIcommands[0].c[1] === _PIXIcommands[1].c[4]
        && _PIXIcommands[0].c[0] === _PIXIcommands[1].c[6]
        && _PIXIcommands[0].c[1] === _PIXIcommands[1].c[7]
        ) {
        _PIXIcommands[1].c[6] += 0.5;
        _PIXIcommands[1].c[7] += 0.5;
    }
    return _PIXIcommands;
};