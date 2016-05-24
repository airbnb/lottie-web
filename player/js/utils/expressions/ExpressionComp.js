function ExpressionComp(){}
(function(){

    ExpressionComp.prototype.layer = function(nm){
        var i=0, len = this.layers.length;
        while(i<len){
            if(this.layers[i].nm === nm){
                return this.elements[i].elemInterface;
            }
            i += 1;
        }
    }

    ExpressionComp.prototype.pixelAspect = 1;
}());

extendPrototype(ExpressionComp,SVGRenderer);
extendPrototype(ExpressionComp,HybridRenderer);
extendPrototype(ExpressionComp,CanvasRenderer);
extendPrototype(ExpressionComp,ICompElement);
extendPrototype(ExpressionComp,HCompElement);