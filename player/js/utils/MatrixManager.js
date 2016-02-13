function matrixManagerFunction(){

    var mat = new Matrix();

    var returnMatrix2D = function(rX, scaleX, scaleY, tX, tY){
        return mat.reset().translate(tX,tY).rotate(rX).scale(scaleX,scaleY).toCSS();
    };

    var getMatrix = function(animData){
        return returnMatrix2D(animData.tr.r[2],animData.tr.s[0],animData.tr.s[1],animData.tr.p[0],animData.tr.p[1]);
    };

    return {
        getMatrix : getMatrix
    };

}
var MatrixManager = matrixManagerFunction;