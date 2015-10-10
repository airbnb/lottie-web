function CVSolidElement(data,globalData){
    this.parent.constructor.call(this,data,globalData);
}
createElement(CVBaseElement, CVSolidElement);

CVSolidElement.prototype.draw = function(parentMatrix){
    if(this.parent.draw.call(this, parentMatrix)===false){
        return;
    }
    var ctx = this.canvasContext;
    this.globalData.renderer.save();
    var finalMat = this.finalTransform.mat.props;
    this.globalData.renderer.ctxTransform(finalMat);
    this.globalData.renderer.ctxOpacity(this.finalTransform.opacity);

    ctx.fillStyle=this.sc;
    ctx.fillRect(0,0,this.sw,this.sh);
    this.globalData.renderer.restore(this.data.hasMask);
};