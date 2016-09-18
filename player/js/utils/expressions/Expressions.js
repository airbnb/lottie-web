var Expressions = (function(){
    var ob = {};
    ob.initExpressions = initExpressions;
    ob.getEffectsManager = getEffectsManager;


    function initExpressions(animation){
        animation.renderer.compInterface = CompExpressionInterface(animation.renderer);
        animation.renderer.globalData.projectInterface.registerComposition(animation.renderer);
    }

    function getEffectsManager(data,element,dynamicProperties){
        return new EffectsManager(data,element,dynamicProperties);
    }
   return ob;
}());

expressionsPlugin = Expressions;
