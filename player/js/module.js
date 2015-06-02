(function (window){

    var bodymovinjs = {};

    function play(animation){
        animationManager.play(animation);
    }
    function pause(animation){
        animationManager.pause(animation);
    }
    function togglePause(animation){
        animationManager.togglePause(animation);
    }
    function setSpeed(value,animation){
        animationManager.setSpeed(value, animation);
    }
    function setDirection(value,animation){
        animationManager.setDirection(value, animation);
    }
    function stop(animation){
        animationManager.stop(animation);
    }
    function moveFrame(value){
        animationManager.moveFrame(value);
    }
    function searchAnimations(){
        animationManager.searchAnimations();
    }
    function registerAnimation(elem){
        return animationManager.registerAnimation(elem);
    }
    function resize(){
        animationManager.resize();
    }
    function start(){
        animationManager.start();
    }
    function goToAndStop(val,isFrame, animation){
        animationManager.goToAndStop(val,isFrame, animation);
    }
    function setSubframeRendering(flag){
        subframeEnabled = flag;
    }
    function loadAnimation(params){
        return animationManager.loadAnimation(params);
    }

    bodymovinjs.play = play;
    bodymovinjs.pause = pause;
    bodymovinjs.togglePause = togglePause;
    bodymovinjs.setSpeed = setSpeed;
    bodymovinjs.setDirection = setDirection;
    bodymovinjs.stop = stop;
    bodymovinjs.moveFrame = moveFrame;
    bodymovinjs.searchAnimations = searchAnimations;
    bodymovinjs.registerAnimation = registerAnimation;
    bodymovinjs.loadAnimation = loadAnimation;
    bodymovinjs.setSubframeRendering = setSubframeRendering;
    bodymovinjs.resize = resize;
    bodymovinjs.start = start;
    bodymovinjs.goToAndStop = goToAndStop;

    function checkReady(){
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);
                searchAnimations();
        }
    }

    bodymovinjs.checkReady = checkReady;

    window.bodymovin = bodymovinjs;

    var readyStateCheckInterval = setInterval(checkReady, 100);

    if(window.jQuery && jQuery.fn){

        var initializePlugin = (function(){
            var animationMap = [];

            var iterateElements = function(elements,params){
                elements.each(function(){
                    params.wrapper = this;
                    animationMap.push({
                        elem : this,
                        anim: bodymovin.loadAnimation(params)
                    });
                });
                /*this.each(function() {
                 // Do something to each element here.
                 });*/
            };

            var performAction = function(elements,action,params){
                var i, len = animationMap.length;
                elements.each(function(){
                    i = 0;
                    while(i<len){
                        if(animationMap[i].elem == this){
                            animationMap[i].anim[action].apply(animationMap[i].anim,params);
                            break;
                        }
                        i+=1;
                    }
                })
            };

            jQuery.fn.bodymovin = function(action,params){
                switch(action){
                    case 'pause':
                    case 'play':
                    case 'togglePause':
                    case 'setSpeed':
                    case 'setDirection':
                    case 'moveFrame':
                    case 'stop':
                    case 'resize':
                    case 'goToAndStop':
                    case 'gotoAndStop':
                        performAction(this,action,Array.prototype.slice.call(arguments,1));
                        break;
                    case 'registerAnimation':
                    case 'loadAnimation':
                        iterateElements(this,params);
                        break;
                    case 'setSubframeRendering':
                        setSubframeRendering(params);
                        break;
                    case 'start':
                        start();
                        break;
                }
            }
        }());
    }

}(window));