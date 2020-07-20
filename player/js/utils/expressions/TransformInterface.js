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
            get: ExpressionPropertyInterface(transform.r || transform.rz)
        });

        Object.defineProperty(_thisFunction, "zRotation", {
            get: ExpressionPropertyInterface(transform.rz || transform.r)
        });

        Object.defineProperty(_thisFunction, "xRotation", {
            get: ExpressionPropertyInterface(transform.rx)
        });

        Object.defineProperty(_thisFunction, "yRotation", {
            get: ExpressionPropertyInterface(transform.ry)
        });
        Object.defineProperty(_thisFunction, "scale", {
            get: ExpressionPropertyInterface(transform.s)
        });

        if(transform.p) {
            var _transformFactory = ExpressionPropertyInterface(transform.p);
        } else {
            var _px = ExpressionPropertyInterface(transform.px);
            var _py = ExpressionPropertyInterface(transform.py);
            var _pz;
            if (transform.pz) {
                _pz = ExpressionPropertyInterface(transform.pz);
            }
        }
        Object.defineProperty(_thisFunction, "position", {
            get: function () {
                if(transform.p) {
                    return _transformFactory();
                } else {
                    return [
                        _px(),
                        _py(),
                        _pz ? _pz() : 0];
                }
            }
        });

        Object.defineProperty(_thisFunction, "xPosition", {
            get: ExpressionPropertyInterface(transform.px)
        });

        Object.defineProperty(_thisFunction, "yPosition", {
            get: ExpressionPropertyInterface(transform.py)
        });

        Object.defineProperty(_thisFunction, "zPosition", {
            get: ExpressionPropertyInterface(transform.pz)
        });

        Object.defineProperty(_thisFunction, "anchorPoint", {
            get: ExpressionPropertyInterface(transform.a)
        });

        Object.defineProperty(_thisFunction, "opacity", {
            get: ExpressionPropertyInterface(transform.o)
        });

        Object.defineProperty(_thisFunction, "skew", {
            get: ExpressionPropertyInterface(transform.sk)
        });

        Object.defineProperty(_thisFunction, "skewAxis", {
            get: ExpressionPropertyInterface(transform.sa)
        });

        Object.defineProperty(_thisFunction, "orientation", {
            get: ExpressionPropertyInterface(transform.or)
        });

        return _thisFunction;
    };
}());