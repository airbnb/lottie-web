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
        animationManager.registerAnimation(elem);
    }
    function resize(){
        animationManager.resize();
    }
    function start(){
        animationManager.start();
    }
    function setSubframeRendering(flag){
        subframeEnabled = flag;
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
    bodymovinjs.setSubframeRendering = setSubframeRendering;
    bodymovinjs.resize = resize;
    bodymovinjs.start = start;

    function checkReady(){
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);
                searchAnimations();
                play();
        }
    }

    bodymovinjs.checkReady = checkReady;

    window.bodymovin = bodymovinjs;

    var readyStateCheckInterval = setInterval(checkReady, 0);

}(window));

//window.onkeyup = keyActive;