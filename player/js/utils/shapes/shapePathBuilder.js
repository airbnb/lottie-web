function isOnLine(p, v, w) {
    if (v[0] == w[0] && p[0] == v[0]
     || v[1] == w[1] && p[1] == w[1]
     || v[0] == w[0] && v[1] == w[1]) return true;
    var yDiff = Math.abs(p[1] - v[1] - (w[1] - v[1]) * ((p[0] - v[0]) / (w[0] - v[0])));
    var xDiff = Math.abs(p[0] - v[0] - (w[0] - v[0]) * ((p[1] - v[1]) / (w[1] - v[1])));

    var distance = yDiff < xDiff ? yDiff : xDiff; // off by a factor of at most ~0.707 = 1 / sqrt(2)
    return distance < 0.0017; // fp errors
}

var buildShapeString = function(pathNodes, length, closed, mat) {
        if(length === 0) {
            return '';
        }
        var _o = pathNodes.o;
        var _i = pathNodes.i;
        var _v = pathNodes.v;
        var i, shapeString = " M" + mat.applyToPointStringified(_v[0][0], _v[0][1]);
        var a, b, c, lineType, prevP;
        for(i = 1; i < length; i += 1) {
            a = mat.applyToPoint(_o[i - 1][0], _o[i - 1][1], 0);
            b = mat.applyToPoint(_i[i][0], _i[i][1], 0);
            c = mat.applyToPoint(_v[i][0], _v[i][1], 0);
            prevP = mat.applyToPoint(_v[i - 1][0], _v[i - 1][1], 0);

            a = [a.x, a.y];
            b = [b.x, b.y];
            c = [c.x, c.y];
            prevP = [prevP.x, prevP.y];

            shapeString += isOnLine(a, prevP, c) && isOnLine(b, prevP, c)
                ? " L" + c[0] + "," + c[1]
                : " C" + a[0] + "," + a[1] + " " + b[0] + "," + b[1] + " " + c[0] + "," + c[1];
        }
        if (closed && length) {
            prevP = mat.applyToPoint(_v[i - 1][0], _v[i - 1][1], 0);
            a = mat.applyToPoint(_o[i - 1][0], _o[i - 1][1], 0);
            b = mat.applyToPoint(_i[0][0], _i[0][1], 0);
            c = mat.applyToPoint(_v[0][0], _v[0][1], 0);

            prevP = [prevP.x, prevP.y];
            a = [a.x, a.y];
            b = [b.x, b.y];
            c = [c.x, c.y];

            shapeString += isOnLine(a, prevP, c) && isOnLine(b, prevP, c)
                ? " L" + c[0] + "," + c[1]
                : " C" + a[0] + "," + a[1] + " " + b[0] + "," + b[1] + " " + c[0] + "," + c[1];
            shapeString += 'z';
        }
        return shapeString;
}
