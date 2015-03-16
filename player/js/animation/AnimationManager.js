var animationManager = (function(){
    var moduleOb = {};
    var requested = false;
    var registeredAnimations = [];
    var initTime = 0;
    var nowTime = 0;
    var elapsedTime = 0;
    var isPaused = true;

    function registerAnimation(element){
        if(!element){
            return;
        }
        var i=0, len = registeredAnimations.length;
        while(i<len){
            if(registeredAnimations[i].elem == element){
                return;
            }
            i+=1;
        }
        var animItem = new AnimationItem();
        animItem.setData(element);
        registeredAnimations.push({elem: element,animation:animItem});
        return animItem;
    }


    function setSpeed(val,animation){
        var i, len = registeredAnimations.length;
        for(i=0;i<len;i+=1){
            registeredAnimations[i].animation.setSpeed(val, animation);
        }
    }

    function setDirection(val, animation){
        var i, len = registeredAnimations.length;
        for(i=0;i<len;i+=1){
            registeredAnimations[i].animation.setDirection(val, animation);
        }
    }

    function play(animation){
        initTime = Date.now();
        var i, len = registeredAnimations.length;
        for(i=0;i<len;i+=1){
            registeredAnimations[i].animation.play(animation);
        }
        resume();
    }

    function moveFrame (value, animation) {
        isPaused = false;
        initTime = Date.now();
        var i, len = registeredAnimations.length;
        for(i=0;i<len;i+=1){
            registeredAnimations[i].animation.moveFrame(value,animation);
        }
    }

    function requestSingleAnimationFrame(){
        requested = false;
        resume();
    }

    function resume() {
        if(requested){
            return;
        }
        requested = true;
        nowTime = Date.now();
        elapsedTime = nowTime - initTime;
        var i, len = registeredAnimations.length;
        for(i=0;i<len;i+=1){
            registeredAnimations[i].animation.advanceTime(elapsedTime);
        }
        initTime = nowTime;
        requestAnimationFrame(requestSingleAnimationFrame);
    }

    function pause(animation) {
        var i, len = registeredAnimations.length;
        for(i=0;i<len;i+=1){
            registeredAnimations[i].animation.pause(animation);
        }
    }

    function stop(animation) {
        var i, len = registeredAnimations.length;
        for(i=0;i<len;i+=1){
            registeredAnimations[i].animation.stop(animation);
        }
    }

    function togglePause(animation) {
        var i, len = registeredAnimations.length;
        for(i=0;i<len;i+=1){
            registeredAnimations[i].animation.togglePause(animation);
        }
    }

    function searchAnimations(){
        var animElements = document.getElementsByClassName('bodymovin');
        Array.prototype.forEach.call(animElements,registerAnimation);
    }

    moduleOb.registerAnimation = registerAnimation;
    moduleOb.setSpeed = setSpeed;
    moduleOb.setDirection = setDirection;
    moduleOb.play = play;
    moduleOb.moveFrame = moveFrame;
    moduleOb.resume = resume;
    moduleOb.pause = pause;
    moduleOb.stop = stop;
    moduleOb.togglePause = togglePause;
    moduleOb.searchAnimations = searchAnimations;
    return moduleOb;
}());