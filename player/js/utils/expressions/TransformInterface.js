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
                case "position":
                case "Position":
                case "ADBE Position":
                case 2:
                    return transform.position;
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
                return transform.rotation;
            }
        });
        Object.defineProperty(_thisFunction, "scale", {
            get: function () {
                return transform.scale;
            }
        });

        Object.defineProperty(_thisFunction, "position", {
            get: function () {
                return transform.position;
            }
        });

        Object.defineProperty(_thisFunction, "xPosition", {
            get: function () {
                return transform.xPosition;
            }
        });

        Object.defineProperty(_thisFunction, "yPosition", {
            get: function () {
                return transform.yPosition;
            }
        });

        Object.defineProperty(_thisFunction, "anchorPoint", {
            get: function () {
                return transform.anchorPoint;
            }
        });

        Object.defineProperty(_thisFunction, "opacity", {
            get: function () {
                return transform.opacity;
            }
        });

        Object.defineProperty(_thisFunction, "skew", {
            get: function () {
                return transform.skew;
            }
        });

        Object.defineProperty(_thisFunction, "skewAxis", {
            get: function () {
                return transform.skewAxis;
            }
        });

        return _thisFunction;
    }
}());