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
        ctx.save();
        var finalMat = this.finalTransform.mat.props;
        ctx.transform(finalMat[0], finalMat[1], finalMat[2], finalMat[3], finalMat[4], finalMat[5]);
    }
    ctx.globalAlpha = ctx.globalAlpha*this.finalTransform.opacity;

    ctx.fillStyle=this.data.color;
    ctx.fillRect(0,0,this.data.width,this.data.height);
    ctx.restore();

    ////
};