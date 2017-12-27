function BasicPlayer(){}

BasicPlayer.prototype.setAnimationItem = function(item){
};

BasicPlayer.prototype.playStarted = function(){
    this.playButton.style.display = 'none';
    this.pauseButton.style.display = 'block';
    this.pauseAnimation.goToAndStop(0);
    this.pauseAnimation.play();
};

BasicPlayer.prototype.pauseStarted = function(){
    this.playButton.style.display = 'block';
    this.pauseButton.style.display = 'none';
    this.playAnimation.goToAndStop(0);
    this.playAnimation.play();
};

BasicPlayer.prototype.buildControls = function(item, wrapper){

    var self = this;
    this.animationItem = item;
    wrapper.addEventListener('bmPlay',function(){self.playStarted();});
    wrapper.addEventListener('bmPause',function(){self.pauseStarted();});

    this.controls = createTag('div');
    this.controls.style.width = '100%';
    this.controls.style.height = '70px';
    this.controls.style.position = 'absolute';
    this.controls.style.left = 0;
    this.controls.style.bottom = 0;
    this.controls.style.backgroundColor = 'rgba(0,0,0,.3)';
    wrapper.appendChild(this.controls);

    this.scrollBar = createTag('div');
    this.scrollBar.style.width = '100%';
    this.scrollBar.style.height = '14px';
    this.scrollBar.style.backgroundColor = 'rgba(25,25,25,1)';
    this.controls.appendChild(this.scrollBar);

    this.scrollBarThumb = createTag('div');
    this.scrollBarThumb.style.width = '18px';
    this.scrollBarThumb.style.height = '18px';
    this.scrollBarThumb.style.position = 'absolute';
    this.scrollBarThumb.style.transform = this.scrollBarThumb.style.webkitTransform = 'translate(-7px,0px)';
    this.scrollBarThumb.style.top = '-3px';
    this.scrollBarThumb.style.left = '0px';
    this.scrollBarThumb.style.borderRadius = '11px';
    this.scrollBarThumb.style.border = 'solid 2px #000000';
    this.scrollBarThumb.style.backgroundColor = 'rgba(255,255,255,1)';
    this.scrollBarThumb.style.cursor = 'pointer';
    this.controls.appendChild(this.scrollBarThumb);

    this.scrollBar.addEventListener('mousedown', function (ev) {
        var mousePos = ev.layerX;
        var width = self.scrollBar.clientWidth;
        self.scrollAnimation(mousePos / width);
    });
    this.scrollBarThumb.addEventListener('mousedown', function (ev) {
        self.scrollAnimation();
    });

    this.playButton = createTag('div');
    this.playButton.style.width = '40px';
    this.playButton.style.height = '30px';
    this.playButton.style.marginTop = '12px';
    this.playButton.style.marginLeft = '10px';
    this.playButton.style.backgroundColor = 'rgba(25,25,25,1)';
    this.playButton.style.cursor = 'pointer';
    this.playButton.setAttribute('data-animation-path','exports/pause');
    this.playButton.setAttribute('data-bm-player','0');
    this.playButton.setAttribute('data-anim-type','svg');
    this.playButton.setAttribute('data-anim-name','play');
    this.playButton.setAttribute('data-anim-repeat','0');
    this.playButton.style.display = 'none';
    this.playAnimation = animationManager.registerAnimation(this.playButton);
    this.playAnimation.loop = false;
    this.controls.appendChild(this.playButton);
    this.playButton.addEventListener('click', function () {
        self.animationItem.play();
    });

    this.pauseButton = createTag('div');
    this.pauseButton.style.width = '40px';
    this.pauseButton.style.height = '30px';
    this.pauseButton.style.marginTop = '12px';
    this.pauseButton.style.marginLeft = '10px';
    this.pauseButton.style.backgroundColor = 'rgba(25,25,25,1)';
    this.pauseButton.style.cursor = 'pointer';
    this.pauseButton.setAttribute('data-animation-path','exports/play');
    this.pauseButton.setAttribute('data-bm-player','0');
    this.pauseButton.setAttribute('data-anim-type','svg');
    this.pauseButton.setAttribute('data-anim-name','pause');
    this.pauseButton.setAttribute('data-anim-repeat','0');
    this.pauseAnimation = animationManager.registerAnimation(this.pauseButton);
    this.pauseAnimation.wrapper.addEventListener('bmLoaded',function(){self.pauseAnimation.goToAndStop(self.pauseAnimation.totalFrames - 1);});
    this.pauseAnimation.loop = false;
    this.controls.appendChild(this.pauseButton);
    this.pauseButton.addEventListener('click', function () {
        self.animationItem.pause();
    });
};

BasicPlayer.prototype.setProgress = function(val){
    this.progress = val;
    this.scrollBarThumb.style.left = (this.progress) * 100 + '%';
};

BasicPlayer.prototype.scrollAnimation = function (perc) {
    this.animationItem.isScrolling = true;
    this.boundingRect = this.scrollBar.getBoundingClientRect();
    this.scrollBarWidth = this.scrollBar.clientWidth;
    var self = this;
    var mouseMoveFunc = function(ev){
        var mousePos = ev.pageX - self.boundingRect.left;
        if(mousePos < 0){
            mousePos = 0;
        }else if(mousePos >= self.scrollBarWidth){
            mousePos = self.scrollBarWidth-1;
        }
        self.animationItem.updateAnimation(mousePos / self.scrollBarWidth);
    };
    var mouseUpFunc = function(){
        window.removeEventListener('mousemove', mouseMoveFunc);
        window.removeEventListener('mouseup', mouseUpFunc);
        self.animationItem.isScrolling = false;
    };
    window.addEventListener('mousemove',mouseMoveFunc);
    window.addEventListener('mouseup', mouseUpFunc);
    if(perc !== undefined){
        self.animationItem.updateAnimation(perc);
    }
};