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
            get: function(){
                if(transform.r) {
                    return ExpressionValue(transform.r, 1/degToRads);
                } else {
                    return ExpressionValue(transform.rz, 1/degToRads);
                }
            }
        });

        Object.defineProperty(_thisFunction, "xRotation", {
            get: function(){
                    return ExpressionValue(transform.rx, 1/degToRads);
            }
        });

        Object.defineProperty(_thisFunction, "yRotation", {
            get: function(){
                    return ExpressionValue(transform.ry, 1/degToRads);
            }
        });
        Object.defineProperty(_thisFunction, "scale", {
            get: function () {
                return ExpressionValue(transform.s, 100);
            }
        });

        Object.defineProperty(_thisFunction, "position", {
            get: function () {
                if(transform.p) {
                    return ExpressionValue(transform.p);
                } else {
                    return [transform.px.v, transform.py.v, transform.pz ? transform.pz.v : 0];
                }
            }
        });

        Object.defineProperty(_thisFunction, "xPosition", {
            get: function () {
                return ExpressionValue(transform.px);
            }
        });

        Object.defineProperty(_thisFunction, "yPosition", {
            get: function () {
                return ExpressionValue(transform.py);
            }
        });

        Object.defineProperty(_thisFunction, "zPosition", {
            get: function () {
                return ExpressionValue(transform.pz);
            }
        });

        Object.defineProperty(_thisFunction, "anchorPoint", {
            get: function () {
                return ExpressionValue(transform.a);
            }
        });

        Object.defineProperty(_thisFunction, "opacity", {
            get: function () {
                return ExpressionValue(transform.o, 100);
            }
        });

        Object.defineProperty(_thisFunction, "skew", {
            get: function () {
                return ExpressionValue(transform.sk);
            }
        });

        Object.defineProperty(_thisFunction, "skewAxis", {
            get: function () {
                return ExpressionValue(transform.sa);
            }
        });

        Object.defineProperty(_thisFunction, "orientation", {
            get: function () {
                return ExpressionValue(transform.or);
            }
        });

        return _thisFunction;
    };
}());