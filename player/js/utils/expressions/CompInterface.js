var CompExpressionInterface = (function (){
    return function(comp){
        function _thisLayerFunction(name){
            var i=0, len = comp.layers.length;
            while(i<len){
                if(comp.layers[i].nm === name || comp.layers[i].ind === name){
                    return comp.elements[i].layerInterface;
                }
                i += 1;
            }
            return {active:false};
        }
        Object.defineProperty(_thisLayerFunction, "_name", { value:comp.data.nm });
        _thisLayerFunction.layer = _thisLayerFunction;
        _thisLayerFunction.pixelAspect = 1;
        _thisLayerFunction.height = comp.globalData.compSize.h;
        _thisLayerFunction.width = comp.globalData.compSize.w;
        _thisLayerFunction.pixelAspect = 1;
        _thisLayerFunction.frameDuration = 1/comp.globalData.frameRate;
        return _thisLayerFunction;
    };
}());