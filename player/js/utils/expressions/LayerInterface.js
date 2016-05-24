var buildLayerExpressionInterface = (function (){
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
    function _hasParent(){
        return this._elem.hierarchy;
    }
    function _parent(){
        return this._elem.hierarchy[0].elemInterface;
    }
    function _rotation() {
        return this._elem.transform.rotation;
    }
    function _scale() {
        return this._elem.transform.scale;
    }
    function _position() {
        return this._elem.transform.position;
    }
    function _anchorPoint() {
        return this._elem.transform.anchorPoint;
    }
    function _effect(nm){
        return this._elem.effectsManager(nm);
    }
    function _layer(){
    }

    return function(elem){
        var shapeInterface;

        function _registerShapeExpressionInterface(shInterface){
            shapeInterface = shInterface;
        }

        function _thisLayerFunction(name){
            switch(name){
                case "ADBE Root Vectors Group":
                    return shapeInterface;
                    //
                    break;
            }
            console.log(name);
        }
        _thisLayerFunction.toWorld = toWorld;
        _thisLayerFunction.toComp = toWorld;
        _thisLayerFunction._elem = elem;
        Object.defineProperty(_thisLayerFunction, 'hasParent', {
            get: _hasParent
        });
        Object.defineProperty(_thisLayerFunction, 'parent', {
            get: _parent
        });
        Object.defineProperty(_thisLayerFunction, "rotation", {
            get: _rotation
        });
        Object.defineProperty(_thisLayerFunction, "scale", {
            get: _scale
        });

        Object.defineProperty(_thisLayerFunction, "position", {
            get: _position
        });

        Object.defineProperty(_thisLayerFunction, "anchorPoint", {
            get: _anchorPoint
        });

        Object.defineProperty(_thisLayerFunction, "name", {
            get: function(){
                return elem.data.nm;
            }
        });

        _thisLayerFunction.effect = _effect;
        _thisLayerFunction.layer = _layer;
        _thisLayerFunction.registerShapeExpressionInterface = _registerShapeExpressionInterface;
        return _thisLayerFunction;
    }
}());
