function PIXIGaussianBlurEffect(filterManager){
    this.filterManager = filterManager;
    this.pixiFilter = new PIXI.filters.BlurFilter(0, 10, 1, 5);
}

PIXIGaussianBlurEffect.prototype.renderFrame = function(forceRender){
    if(forceRender || this.filterManager._mdf){
        if(forceRender || this.filterManager.effectElements[0]._mdf || this.filterManager.effectElements[1]._mdf) {
            var blurStrength = this.filterManager.effectElements[0].p.v;
            switch(this.filterManager.effectElements[1].p.v) {
                case 1:
                    this.pixiFilter.blurX = blurStrength;
                    this.pixiFilter.blurY = blurStrength;
                    break;
                case 2:
                    this.pixiFilter.blurX = blurStrength;
                    this.pixiFilter.blurY = 0;
                    break;
                case 3:
                    this.pixiFilter.blurX = 0;
                    this.pixiFilter.blurY = blurStrength;
                    break;
            }
        }
    }
};