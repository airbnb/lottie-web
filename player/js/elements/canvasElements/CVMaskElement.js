function CVMaskElement(){}

CVMaskElement.prototype.init = function () {
    this.registeredEffects = [];
    this.masksProperties = this.data.masksProperties;
    this.totalMasks = this.masksProperties.length;
    this.ctx = this.element.renderer.canvasContext;
    this.layerSize = this.element.getLayerSize();
};

CVMaskElement.prototype.prepareFrame = function (num) {
    this.frameNum = num;
};

CVMaskElement.prototype.draw = function () {
    var i, len = this.data.masksProperties.length;
    for (i = 0; i < len; i++) {
        if (this.masksProperties[i].inv) {
            this.createInvertedMask(this.ctx,this.masksProperties[i].pathVertices[this.frameNum][0]);
        } else {
            this.drawShape(this.ctx, this.data.masksProperties[i].pathVertices[this.frameNum][0]);
        }
    }
};

CVMaskElement.prototype.createInvertedMask = function (ctx, data) {
    ctx.beginPath();
    var w = ctx.canvas.width;
    var h = ctx.canvas.height;
    var j, jLen = data.v.length;
    ctx.moveTo(0,0);
    ctx.lineTo(w,0);
    ctx.lineTo(w,h);
    ctx.lineTo(0,h);
    ctx.lineTo(0,0);
    ctx.moveTo(data.v[0][0], data.v[0][1]);
    for (j = 1; j < jLen; j++) {
        ctx.bezierCurveTo(data.o[j - 1][0], data.o[j - 1][1], data.i[j][0], data.i[j][1], data.v[j][0], data.v[j][1]);
    }
    ctx.bezierCurveTo(data.o[j - 1][0], data.o[j - 1][1], data.i[0][0], data.i[0][1], data.v[0][0], data.v[0][1]);
    ctx.closePath();
    ctx.clip();
};

CVMaskElement.prototype.drawShape = function (ctx, data) {
    /* TODO see if i can improve feathering of masks. This solution doesn't work'
     ctx.shadowOffsetX = 0;
     ctx.shadowOffsetY = 0;
     ctx.shadowColor = '#fff';
     ctx.shadowBlur = 14;*/
    ctx.beginPath();
    /*ctx.moveTo(-this.layerSize.w/2,-this.layerSize.h/2);
    ctx.lineTo(this.layerSize.w-this.layerSize.w/2,-this.layerSize.h/2);
    ctx.lineTo(this.layerSize.w-this.layerSize.w/2,this.layerSize.h-this.layerSize.h/2);
    ctx.lineTo(-this.layerSize.w/2,this.layerSize.h-this.layerSize.h/2);
    ctx.lineTo(-this.layerSize.w/2,-this.layerSize.h/2);*/
    var j, jLen = data.v.length;
    ctx.moveTo(data.v[0][0], data.v[0][1]);
    for (j = 1; j < jLen; j++) {
        ctx.bezierCurveTo(data.o[j - 1][0], data.o[j - 1][1], data.i[j][0], data.i[j][1], data.v[j][0], data.v[j][1]);
    }
    ctx.bezierCurveTo(data.o[j - 1][0], data.o[j - 1][1], data.i[0][0], data.i[0][1], data.v[0][0], data.v[0][1]);
    ctx.closePath();
    ctx.clip();
};