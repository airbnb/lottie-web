var TransformExpressionInterface = (function (){
    return function(transform){
        function _thisFunction(name){
            switch(name){
                case "scale":
                case "Scale":
                    console.log('transformtransform', transform);
                    console.log('_thisFunction', _thisFunction.scale);
                    return _thisFunction.scale;
                case "rotation":
                case "Rotation":
                    return _thisFunction.rotation;
                case "position":
                case "Position":
                    return _thisFunction.position;
                case "anchorPoint":
                case "AnchorPoint":
                    return _thisFunction.anchorPoint;
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

        Object.defineProperty(_thisFunction, "anchorPoint", {
            get: function () {
                return transform.anchorPoint;
            }
        });

        return _thisFunction;
    }
}());