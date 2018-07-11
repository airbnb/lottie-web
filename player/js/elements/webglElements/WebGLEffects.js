function WEffects(elem){
    var i, len = elem.data.ef ? elem.data.ef.length : 0;
    this.filters = [];
    var filterManager;
    for(i=0;i<len;i+=1){
        filterManager = null;
        if(elem.data.ef[i].ty === 20){
            filterManager = new WTintFilter(elem.effectsManager.effectElements[i], elem.globalData.canvasContext);
        }
        if(filterManager) {
            this.filters.push(filterManager);
        }
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