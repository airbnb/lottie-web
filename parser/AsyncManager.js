/**** Async Manager ****/
(function(){
    var ob = {};
    var asyncCount = 0;
    var callback;
    var asyncElements = [];
    function executeCall(item){
        item.call();
    }
    function executeAsyncCalls(){
        var executingElements = asyncElements.splice(0,asyncElements.length);
        asyncElements.length = 0;
        executingElements.forEach(executeCall);
        asyncCount -= 1;
        if(asyncCount == 0){
            callback.apply();
        }
    }
    function addAsyncCall(fn){
        asyncElements.push(fn);
        if(asyncElements.length == 1){
            asyncCount += 1;
            //Todo Create async call
            extrasInstance.setTimeout(executeAsyncCalls,1);
        }
    }
    function addAsyncCounter(){
        asyncCount += 1;
    }
    function removeAsyncCounter(){
        asyncCount -= 1;
        if(asyncCount == 0){
            callback.apply();
        }
    }
    function getAsyncCounter(){
        return asyncCount;
    }
    function setCallBack(cb){
        callback = cb;
    }
    ob.addAsyncCall = addAsyncCall;
    ob.addAsyncCount = addAsyncCounter;
    ob.removeAsyncCounter = removeAsyncCounter;
    ob.getAsyncCounter = getAsyncCounter;
    ob.setCallBack = setCallBack;
    AsyncManager = ob;
}());
/**** END Async Manager ****/