var TransformExpressionInterface = (function (){
    return function(transform){
        function _thisFunction(name){
            switch(name){
                case "scale":
                case "Scale":
                case "ADBE Scale":
                    return _thisFunction.scale;
                case "rotation":
                case "Rotation":
                case "ADBE Rotation":
                    return _thisFunction.rotation;
                case "position":
                case "Position":
                case "ADBE Position":
                    return transform.position;
                case "anchorPoint":
                case "AnchorPoint":
                case "ADBE AnchorPoint":
                    return _thisFunction.anchorPoint;
                case "opacity":
                case "Opacity":
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
                var s = transform.scale;
                var i, len = s.length;
                var transformedS = Array.apply(null,{length:len});
                for(i=0;i<len;i+=1){
                    transformedS[i] = s[i]*100;
                }
                return transformedS;
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
                return transform.opacity*100;
            }
        });

        return _thisFunction;
    }
}());