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
        if (animation === undefined) {
            registeredAnimations.forEach(function(item){
                item.animation.setSpeed(val);
            });
        }
    }

    function setDirection(val, animation){
        registeredAnimations.forEach(function(item){
            if (animation === undefined) {
                item.animation.setDirection(val);
            }
        });
    }

    function play(animation){
        initTime = Date.now();
        registeredAnimations.forEach(function(item){
            item.animation.play(animation);
        });
        resume();
    }

    function moveFrame (value, animation) {
        isPaused = false;
        initTime = Date.now();
        registeredAnimations.forEach(function(item){
            item.animation.moveFrame(value,animation);
        });
    }

    function resume() {
        if(requested){
            return;
        }
        requested = true;
        nowTime = Date.now();
        elapsedTime = nowTime - initTime;
        registeredAnimations.forEach(function(item){
            item.animation.advanceTime(elapsedTime);
        });
        initTime = nowTime;
        requestAnimationFrame(function(){
            requested = false;
            resume();
        });
    }

    function pause(animation) {
        registeredAnimations.forEach(function(item){
            item.animation.pause(animation);
        })
    }

    function stop(animation) {
        registeredAnimations.forEach(function(item){
            item.animation.stop(animation);
        })
    }

    function togglePause(animation) {
        registeredAnimations.forEach(function(item){
            item.animation.togglePause(animation);
        })
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