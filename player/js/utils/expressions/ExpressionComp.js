function ExpressionComp(){}
(function(){
    ExpressionComp.prototype.content = function(name){
        var i = 0, len = data.shapes.length;
        while(i<len){
            if(data.shapes[i].nm === name){
                return getShapeProperties(data.shapes[i]);
            }
            i += 1;
        }
    }

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