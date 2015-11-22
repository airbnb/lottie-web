function ExpressionComp(){}
(function(){

    ExpressionComp.prototype.layer = function(nm){
        var i=0, len = this.layers.length;
        while(i<len){
            if(this.layers[i].nm === nm){
                return this.elements[i];
            }
            i += 1;
        }
    }
}());