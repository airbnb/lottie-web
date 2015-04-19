function matrixManagerFunction(){

    var mat = new Matrix('2d');
    var mat3d = new Matrix('3d');

    var returnMatrix3D = function(rX, rY, rZ, scaleX, scaleY, scaleZ, tX, tY, tZ,aX, aY, aZ) {
        console.log(tX, tY, tZ,aX, aY, aZ);
        return mat3d.reset().translate(-aX,-aY,-aZ).rotateX(rX).rotateY(-rY).rotateZ(-rZ).scale(scaleX,scaleY,scaleZ).translate(tX,tY,-tZ).toCSS();
    };

    /*var returnMatrix2D = function(rX, scaleX, scaleY, tX, tY){
        var rotationMatrix,  s, scaleMatrix, transformationMatrix, translationMatrix;
        //cos(X), sin(X), -sin(X), cos(X)
        rotationMatrix = $M([
            [Math.cos(-rX), Math.sin(-rX), 0],
            [Math.sin(rX), Math.cos(-rX), 0],
            [0, 0, 1]
        ]);
        scaleMatrix = $M([[scaleX, 0, 0], [0, scaleY, 0], [0, 0, 1]]);
        transformationMatrix = rotationMatrix.x(scaleMatrix);
        transformationMatrix = transformationMatrix.transpose();
        translationMatrix = $M([[1, 0, 0], [0, 1, 0], [tX, tY, 1]]);
        transformationMatrix = transformationMatrix.x(translationMatrix);

        s = "matrix(";
        s += transformationMatrix.e(1, 1).toFixed(5) + "," + transformationMatrix.e(1, 2).toFixed(5) + ",";
        s += transformationMatrix.e(2, 1).toFixed(5) + "," + transformationMatrix.e(2, 2).toFixed(5) + ",";
        s += transformationMatrix.e(3, 1).toFixed(5) + "," + transformationMatrix.e(3, 2).toFixed(5);
        s += ")";

        return s;
    };*/

    var returnMatrix2D = function(rX, scaleX, scaleY, tX, tY){
        return mat.reset().translate(tX,tY).rotate(rX).scale(scaleX,scaleY).toCSS();
    };

    /*var returnMatrix2DArray = function(rX, scaleX, scaleY, tX, tY){
        var rotationMatrix,  scaleMatrix, transformationMatrix, translationMatrix;
        //cos(X), sin(X), -sin(X), cos(X)
        rotationMatrix = $M([
            [Math.cos(-rX), Math.sin(-rX), 0],
            [Math.sin(rX), Math.cos(-rX), 0],
            [0, 0, 1]
        ]);
        scaleMatrix = $M([[scaleX, 0, 0], [0, scaleY, 0], [0, 0, 1]]);
        transformationMatrix = rotationMatrix.x(scaleMatrix);
        transformationMatrix = transformationMatrix.transpose();
        translationMatrix = $M([[1, 0, 0], [0, 1, 0], [tX, tY, 1]]);
        transformationMatrix = transformationMatrix.x(translationMatrix);

        return [transformationMatrix.e(1, 1).toFixed(5),transformationMatrix.e(1, 2).toFixed(5)
            ,transformationMatrix.e(2, 1).toFixed(5),transformationMatrix.e(2, 2).toFixed(5)
            ,transformationMatrix.e(3, 1).toFixed(5),transformationMatrix.e(3, 2).toFixed(5)];
    };*/

    var returnMatrix2DArray = function(rX, scaleX, scaleY, tX, tY){
        return mat.reset().translate(tX,tY).rotate(rX).scale(scaleX,scaleY).toArray();
    };

    var get2DMatrix = function(animData){
        return returnMatrix2D(animData.r
            ,animData.s[0],animData.s[1]
            ,animData.p[0],animData.p[1]);
    };

    var getMatrix = function(animData, isThreeD){
        if(!isThreeD){
            return returnMatrix2D(animData.tr.r[2]
                ,animData.tr.s[0],animData.tr.s[1]
                ,animData.tr.p[0],animData.tr.p[1]);
        }
        return returnMatrix3D(-animData.tr.r[0],animData.tr.r[1],animData.tr.r[2]
            ,animData.tr.s[0],animData.tr.s[1],animData.tr.s[2]
            ,animData.tr.p[0],animData.tr.p[1],animData.tr.p[2])
    };

    var getMatrix2 = function(animData, isThreeD){
        if(!isThreeD){
            return returnMatrix2D(animData.r[2]
                ,animData.s[0],animData.s[1]
                ,animData.p[0],animData.p[1]);
        }
        return returnMatrix3D(-animData.rx[0],animData.ry[1],animData.rz[2]
            ,animData.s[0],animData.s[1],animData.s[2]
            ,animData.p[0],animData.p[1],animData.p[2]
            ,animData.a[0],animData.a[1],animData.a[2])
    };

    var getMatrixArray = function(animData, isThreeD){
        if(!isThreeD){
            return returnMatrix2DArray(animData.r[2]
                ,animData.s[0],animData.s[1]
                ,animData.p[0],animData.p[1]);
        }
        return null;
    };

    return {
        get2DMatrix : get2DMatrix,
        getMatrix : getMatrix,
        getMatrix2 : getMatrix2,
        getMatrixArray : getMatrixArray,
        getMatrixArrayFromParams : returnMatrix2DArray,
        getMatrix2FromParams : returnMatrix2D
    }

};
var MatrixManager = matrixManagerFunction;
