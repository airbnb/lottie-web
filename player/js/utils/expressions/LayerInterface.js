var LayerExpressionInterface = (function (){
    function toWorld(arr){
        var toWorldMat = new Matrix();
        toWorldMat.reset();
        this._elem.finalTransform.mProp.applyToMatrix(toWorldMat);
        if(this._elem.hierarchy && this._elem.hierarchy.length){
            var i, len = this._elem.hierarchy.length;
            for(i=0;i<len;i+=1){
                this._elem.hierarchy[i].finalTransform.mProp.applyToMatrix(toWorldMat);
            }
            return toWorldMat.applyToPointArray(arr[0],arr[1],arr[2]||0);
        }
        return toWorldMat.applyToPointArray(arr[0],arr[1],arr[2]||0);
    }


    return function(elem){

        var transformInterface = TransformExpressionInterface(elem.transform);

        function _registerMaskInterface(maskManager){
            _thisLayerFunction.mask = maskManager.getMask.bind(maskManager);
        }
        function _registerEffectsInterface(effects){
            _thisLayerFunction.effect = effects;
        }

        function _thisLayerFunction(name){
            switch(name){
                case "ADBE Root Vectors Group":
                case 2:
                    return _thisLayerFunction.shapeInterface;
                case "Transform":
                case "transform":
                case "ADBE Transform Group":
                    return transformInterface;
                case 4:
                case "ADBE Effect Parade":
                    return _thisLayerFunction.effect;
            }
        }
        _thisLayerFunction.toWorld = toWorld;
        _thisLayerFunction.toComp = toWorld;
        _thisLayerFunction._elem = elem;
        Object.defineProperty(_thisLayerFunction, 'hasParent', {
            get: function(){
                return !!elem.hierarchy;
            }
        });
        Object.defineProperty(_thisLayerFunction, 'parent', {
            get: function(){
                return elem.hierarchy[0].layerInterface;
            }
        });
        Object.defineProperty(_thisLayerFunction, "rotation", {
            get: function(){
                return transformInterface.rotation;
            }
        });
        Object.defineProperty(_thisLayerFunction, "scale", {
            get: function () {
                return transformInterface.scale;
            }
        });

        Object.defineProperty(_thisLayerFunction, "position", {
            get: function () {
                return transformInterface.position;
            }
        });

        Object.defineProperty(_thisLayerFunction, "anchorPoint", {
            get: function () {
                return transformInterface.anchorPoint;
            }
        });

        Object.defineProperty(_thisLayerFunction, "transform", {
            get: function () {
                return transformInterface;
            }
        });
        Object.defineProperty(_thisLayerFunction, "_name", { value:elem.data.nm });
        Object.defineProperty(_thisLayerFunction, "content", {
            get: function(){
                return _thisLayerFunction.shapeInterface;
            }
        });

        _thisLayerFunction.active = true;
        _thisLayerFunction.registerMaskInterface = _registerMaskInterface;
        _thisLayerFunction.registerEffectsInterface = _registerEffectsInterface;
        return _thisLayerFunction;
    }
}());
