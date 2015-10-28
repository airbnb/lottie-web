function CVMaskElement(data,element,globalData){
    this.data = data;
    this.element = element;
    this.globalData = globalData;
    this.registeredEffects = [];
    this.masksProperties = this.data.masksProperties;
    this.totalMasks = this.masksProperties.length;
    this.ctx = this.element.canvasContext;
    this.layerSize = this.element.getLayerSize();
    this.renderedFrames = new Array(this.globalData.totalFrames+1);
};

CVMaskElement.prototype.prepareFrame = function (num) {
    this.frameNum = num;
};

CVMaskElement.prototype.renderFrame = function (transform) {
    var path;
    if(this.renderedFrames[this.globalData.frameNum]){
        path = this.renderedFrames[this.globalData.frameNum];
    }else{
        var tmpPath = new BM_Path2D();
        var i, len = this.data.masksProperties.length;
        path = new BM_Path2D();
        for (i = 0; i < len; i++) {
            if (this.masksProperties[i].inv) {
                this.createInvertedMask(tmpPath, this.data.masksProperties[i].paths[this.frameNum].pathNodes);
            }
            this.drawShape(tmpPath, this.data.masksProperties[i].paths[this.frameNum].pathNodes);
        }
        path.addPath(tmpPath,transform.mat.props);
        this.renderedFrames[this.globalData.frameNum] = path;
    }
    this.globalData.bmCtx.clip(path);
};

CVMaskElement.prototype.drawShape = function (path, data) {
    var j, jLen = data.v.length;
    path.moveTo(bm_rnd(data.v[0][0]), bm_rnd(data.v[0][1]));
    //path.moveTo(data.v[0][0], data.v[0][1]);
    for (j = 1; j < jLen; j++) {
        //path.bezierCurveTo(data.o[j - 1][0], data.o[j - 1][1], data.i[j][0], data.i[j][1], data.v[j][0], data.v[j][1]);
        path.bezierCurveTo(bm_rnd(data.o[j - 1][0]), bm_rnd(data.o[j - 1][1]), bm_rnd(data.i[j][0]), bm_rnd(data.i[j][1]), bm_rnd(data.v[j][0]), bm_rnd(data.v[j][1]));
    }
    //path.bezierCurveTo(data.o[j - 1][0], data.o[j - 1][1], data.i[0][0], data.i[0][1], data.v[0][0], data.v[0][1]);
    path.bezierCurveTo(bm_rnd(data.o[j - 1][0]), bm_rnd(data.o[j - 1][1]), bm_rnd(data.i[0][0]), bm_rnd(data.i[0][1]), bm_rnd(data.v[0][0]), bm_rnd(data.v[0][1]));
};

CVMaskElement.prototype.createInvertedMask = function(path){
    path.moveTo(0, 0);
    path.lineTo(this.globalData.compWidth, 0);
    path.lineTo(this.globalData.compWidth, this.globalData.compHeight);
    path.lineTo(0, this.globalData.compHeight);
    path.lineTo(0, 0);
};

CVMaskElement.prototype.destroy = function(){
    this.ctx = null;
};