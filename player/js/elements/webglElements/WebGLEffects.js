function WEffects(elem){
    var i, len = elem.data.ef ? elem.data.ef.length : 0;
    this.filters = [];
    var filterManager;
    for(i=0;i<len;i+=1){
        filterManager = null;
        var effect = effectsRegisterer.getEffect(elem.data.ef[i].mn) || effectsRegisterer.getEffect(elem.data.ef[i].nm);

        if(effect) {
            filterManager = new effect(elem.effectsManager.effectElements[i], elem, WebGLProgramFactory);
            this.filters.push(filterManager);
        }
        /*if(effectsRegisterer.getEffect(elem.data.ef[i].mn)) {
            console.log('ENCON')
            filterManager = new WTintFilter(elem.effectsManager.effectElements[i], elem);
        }
        if(elem.data.ef[i].ty === 20){
            filterManager = new WTintFilter(elem.effectsManager.effectElements[i], elem);
        } else if(elem.data.ef[i].ty === 29){
            filterManager = new WGaussianBlurEffect(elem.effectsManager.effectElements[i], elem);
        } else if(elem.data.ef[i].ty === 30){
            filterManager = new WTwirlEffect(elem.effectsManager.effectElements[i], elem);
        } else if(elem.data.ef[i].ty === 32){
            filterManager = new WRippleEffect(elem.effectsManager.effectElements[i], elem);
        } else if(elem.data.ef[i].ty === 33){
            filterManager = new WSpherizeEffect(elem.effectsManager.effectElements[i], elem);
        } else if(elem.data.ef[i].ty === 34){
            filterManager = new WPuppetPinEffect(elem.effectsManager.effectElements[i], elem);
        }
        if(filterManager) {
            this.filters.push(filterManager);
        }*/
    }
    /*if (this.filters.length) {
        elem.addRenderableComponent(this);
    }*/
}

WEffects.prototype.renderFrame = function(_isFirstFrame){
    var i, len = this.filters.length;
    for(i=0;i<len;i+=1){
        this.filters[i].renderFrame(_isFirstFrame);
    }
};

WEffects.prototype.spliceEffect = function(pos, effect){
    this.filters.splice(pos,0,effect);
};

WEffects.prototype.pushEffect = function(effect){
    this.filters.push(effect);
};