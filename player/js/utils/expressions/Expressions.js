var PropertyFactory = bodymovin.__getFactory('propertyFactory');
var Matrix = bodymovin.__getFactory('matrix');
var degToRads = Math.PI/180;

var Expressions = (function(){
    var ob = {};
    ob.initExpressions = initExpressions;

    function addLayersInterface(layers){
        var i, len = layers.length;
        for(i=0;i<len;i+=1){
            if(!layers[i].layerInterface){
                layers[i].layerInterface = LayerExpressionInterface(layers[i]);
                if(layers[i].data.hasMask){
                    layers[i].layerInterface.registerMaskInterface(layers[i].maskManager);
                }
                if(layers[i].data.ty === 0){
                    layers[i].compInterface = CompExpressionInterface(layers[i]);
                } else if(layers[i].data.ty === 4){
                    layers[i].layerInterface.shapeInterface = ShapeExpressionInterface.createShapeInterface(layers[i].shapesData,layers[i].viewData,layers[i].layerInterface);
                }
            }
            if(layers[i].data.ty === 0){
                addLayersInterface(layers[i].elements);
            }
        }
    }

    function initExpressions(animation){
        animation.renderer.compInterface = CompExpressionInterface(animation.renderer);
        addLayersInterface(animation.renderer.elements);
    }
   return ob;
}());



bodymovin.installPlugin('expressions',Expressions);
