var messageParser = (function(){
    
    var ob = {};
    ob.parse = parse;

    function parse(message) {
        if ((typeof message) === 'string') {
            return JSON.parse(message);
        } else {
            return JSON.parse(JSON.stringify(message));
        }
    }
    
    return ob;
}());