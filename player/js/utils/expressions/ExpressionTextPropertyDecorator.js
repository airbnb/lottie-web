(function addTextPropertyDecorator() {

    function searchExpressions(){
        if(this.data.d.x){
            this.comp = this.elem.comp;
            if(this.getValue) {
                this.getPreValue = this.getValue;
            }
            this.calculateExpression = ExpressionManager.initiateExpression.bind(this)(this.elem,this.data.d,this);
            this.getValue = this.getExpressionValue;
            return true;
        }
        return false;
    }

    TextProperty.prototype.searchProperty = function(){
        this.kf = this.searchExpressions() || this.data.d.k.length > 1;
        return this.kf;
    }

    TextProperty.prototype.getExpressionValue = function(num){
        this.calculateExpression();
        if(this.mdf) {
            this.currentData.t = this.v.toString();
            this.completeTextData(this.currentData);
        }
    }

    TextProperty.prototype.searchExpressions = searchExpressions;
    
}());