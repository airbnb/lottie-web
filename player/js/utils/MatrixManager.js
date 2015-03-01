var MatrixManager = function(){

    var returnMatrix3D = function(rX, rY, rZ, scaleX, scaleY, scaleZ, tX, tY, tZ) {

        var rotationXMatrix, rotationYMatrix, rotationZMatrix, s, scaleMatrix, transformationMatrix, translationMatrix;
        rotationXMatrix = $M([
            [1, 0, 0, 0],
            [0, Math.cos(rX), Math.sin(-rX), 0],
            [0, Math.sin(rX), Math.cos(rX), 0],
            [0, 0, 0, 1]]);

        rotationYMatrix = $M([
            [Math.cos(rY), 0, Math.sin(rY), 0],
            [0, 1, 0, 0],
            [Math.sin(-rY), 0, Math.cos(rY), 0],
            [0, 0, 0, 1]]);

        rotationZMatrix = $M([
            [Math.cos(rZ), Math.sin(-rZ), 0, 0],
            [Math.sin(rZ), Math.cos(rZ), 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]]);


        scaleMatrix = $M([[scaleX, 0, 0, 0], [0, scaleY, 0, 0], [0, 0, scaleZ, 0], [0, 0, 0, 1]]);

        transformationMatrix = rotationXMatrix.x(rotationYMatrix).x(rotationZMatrix).x(scaleMatrix);
        transformationMatrix = transformationMatrix.transpose();
        translationMatrix = $M([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [tX, tY, tZ, 1]]);
        transformationMatrix = transformationMatrix.x(translationMatrix); // Apply transformation matrix AFTER transposing rotation and scale

        s = "matrix3d(";
        s += transformationMatrix.e(1, 1).toFixed(5) + "," + transformationMatrix.e(1, 2).toFixed(5) + "," + transformationMatrix.e(1, 3).toFixed(5) + "," + transformationMatrix.e(1, 4).toFixed(5) + ",";
        s += transformationMatrix.e(2, 1).toFixed(5) + "," + transformationMatrix.e(2, 2).toFixed(5) + "," + transformationMatrix.e(2, 3).toFixed(5) + "," + transformationMatrix.e(2, 4).toFixed(5) + ",";
        s += transformationMatrix.e(3, 1).toFixed(5) + "," + transformationMatrix.e(3, 2).toFixed(5) + "," + transformationMatrix.e(3, 3).toFixed(5) + "," + transformationMatrix.e(3, 4).toFixed(5) + ",";
        s += transformationMatrix.e(4, 1).toFixed(5) + "," + transformationMatrix.e(4, 2).toFixed(5) + "," + transformationMatrix.e(4, 3).toFixed(5) + "," + transformationMatrix.e(4, 4).toFixed(5);
        s += ")";

        return s;
    };

    var returnMatrix2D = function(rX, scaleX, scaleY, tX, tY){
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
        return returnMatrix3D(-animData.r[0],animData.r[1],animData.r[2]
            ,animData.s[0],animData.s[1],animData.s[2]
            ,animData.p[0],animData.p[1],animData.p[2])
    };

    return {
        get2DMatrix : get2DMatrix,
        getMatrix : getMatrix,
        getMatrix2 : getMatrix2
    }

};