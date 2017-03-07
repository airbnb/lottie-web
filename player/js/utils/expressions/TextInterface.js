var TextExpressionInterface = (function(){
	return function(elem){
        function _thisLayerFunction(){
        }
        Object.defineProperty(_thisLayerFunction, "sourceText", {
            get: function(){
            	if(!elem.currentTextDocumentData.t) {
            		return ''
            	}
                return elem.currentTextDocumentData.t;
            }
        });
        return _thisLayerFunction;
    }
}())