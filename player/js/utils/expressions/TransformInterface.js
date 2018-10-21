var TransformExpressionInterface = (function (){
    return function(transform){
        function _thisFunction(name){
            switch(name){
                case "scale":
                case "Scale":
                case "ADBE Scale":
                case 6:
                    return _thisFunction.scale;
                case "rotation":
                case "Rotation":
                case "ADBE Rotation":
                case "ADBE Rotate Z":
                case 10:
                    return _thisFunction.rotation;
                case "ADBE Rotate X":
                    return _thisFunction.xRotation;
                case "ADBE Rotate Y":
                    return _thisFunction.yRotation;
                case "position":
                case "Position":
                case "ADBE Position":
                case 2:
                    return _thisFunction.position;
                case 'ADBE Position_0':
                    return _thisFunction.xPosition;
                case 'ADBE Position_1':
                    return _thisFunction.yPosition;
                case 'ADBE Position_2':
                    return _thisFunction.zPosition;
                case "anchorPoint":
                case "AnchorPoint":
                case "Anchor Point":
                case "ADBE AnchorPoint":
                case 1:
                    return _thisFunction.anchorPoint;
                case "opacity":
                case "Opacity":
                case 11:
                    return _thisFunction.opacity;
            }
        }

        Object.defineProperty(_thisFunction, "rotation", {
            get: ExpressionUnidimensionalValueFactory(transform.r || transform.rz, 1 / degToRads)
        });

        Object.defineProperty(_thisFunction, "xRotation", {
            get: ExpressionUnidimensionalValueFactory(transform.rx, 1 / degToRads)
        });

        Object.defineProperty(_thisFunction, "yRotation", {
            get: ExpressionUnidimensionalValueFactory(transform.ry, 1 / degToRads)
        });
        Object.defineProperty(_thisFunction, "scale", {
            get: ExpressionMultidimensionalValueFactory(transform.s, 100)
        });

        if(transform.p) {
            var _transformFactory = ExpressionMultidimensionalValueFactory(transform.p, 1);
        }
        Object.defineProperty(_thisFunction, "position", {
            get: function () {
                if(transform.p) {
                    return _transformFactory();
                } else {
                    return [transform.px.v, transform.py.v, transform.pz ? transform.pz.v : 0];
                }
            }
        });

        Object.defineProperty(_thisFunction, "xPosition", {
            get: ExpressionUnidimensionalValueFactory(transform.px, 1)
        });

        Object.defineProperty(_thisFunction, "yPosition", {
            get: ExpressionUnidimensionalValueFactory(transform.py, 1)
        });

        Object.defineProperty(_thisFunction, "zPosition", {
            get: ExpressionUnidimensionalValueFactory(transform.pz, 1)
        });

        Object.defineProperty(_thisFunction, "anchorPoint", {
            get: ExpressionMultidimensionalValueFactory(transform.a, 1)
        });

        Object.defineProperty(_thisFunction, "opacity", {
            get: ExpressionUnidimensionalValueFactory(transform.o, 100)
        });

        Object.defineProperty(_thisFunction, "skew", {
            get: ExpressionUnidimensionalValueFactory(transform.sk, 1)
        });

        Object.defineProperty(_thisFunction, "skewAxis", {
            get: ExpressionUnidimensionalValueFactory(transform.sa, 1)
        });

        Object.defineProperty(_thisFunction, "orientation", {
            get: ExpressionMultidimensionalValueFactory(transform.or, 1)
            //TODO: check if multi or unidimensional
            /*get: function () {
                return ExpressionValue(transform.or);
            }*/
        });

        return _thisFunction;
    };
}());