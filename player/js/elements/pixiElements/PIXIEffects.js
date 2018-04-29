function PIXIEffects(elem){
    var i, len = elem.data.ef ? elem.data.ef.length : 0;
    var count = 0;
    this.filters = [];
    var filterManager;
    for(i = 0; i < len; i += 1) {
        filterManager = null;
        if (elem.data.ef[i].ty === 29) {
            filterManager = new PIXIGaussianBlurEffect(elem.effectsManager.effectElements[i]);
        }
        if (filterManager) {
            this.filters.push(filterManager);
        }
    }
    if (this.filters.length) {
        var i, len = this.filters.length;
        var pixiFilters = [];
        for(i = 0; i < len ; i += 1) {
            pixiFilters.push(this.filters[i].pixiFilter);
        }
        elem.layerElement.filters = pixiFilters;
        elem.addRenderableComponent(this);
    }
}

PIXIEffects.prototype.renderFrame = function(_isFirstFrame){
    var i, len = this.filters.length;
    for(i=0;i<len;i+=1){
        this.filters[i].renderFrame(_isFirstFrame);
    }
};