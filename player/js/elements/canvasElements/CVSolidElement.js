function CVSolidElement(data,globalData){
    this.parent.constructor.call(this,data,globalData);
}
createElement(CVBaseElement, CVSolidElement);

CVSolidElement.prototype.draw = function(parentMatrix){
    if(this.parent.draw.call(this, parentMatrix)===false){
        return;
    }
    var ctx = this.canvasContext;
    if(!this.data.hasMask){
        this.globalData.renderer.save();
        ///ctx.save();
        var finalMat = this.finalTransform.mat.props;
        this.globalData.renderer.ctxTransform('',finalMat);
        ///ctx.transform(finalMat[0], finalMat[1], finalMat[2], finalMat[3], finalMat[4], finalMat[5]);
    }
    this.globalData.renderer.ctxOpacity(this.finalTransform.opacity);
    ///ctx.globalAlpha = ctx.globalAlpha*this.finalTransform.opacity;

    ctx.fillStyle=this.data.color;
    ctx.fillRect(0,0,this.data.width,this.data.height);
    this.globalData.renderer.restore(this.data.hasMask);
};