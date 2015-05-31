function CVSolidElement(data, animationItem,globalData){
    this.parent.constructor.call(this,data, animationItem,globalData);
}
createElement(CVBaseElement, CVSolidElement);

CVSolidElement.prototype.draw = function(){
    this.renderer.canvasContext.save();
    if(this.parent.draw.call(this, false)===false){
        this.renderer.canvasContext.restore();
        return;
    }
    var ctx = this.renderer.canvasContext;
    ctx.fillStyle=this.data.color;
    ctx.fillRect(0,0,this.data.width,this.data.height);
    this.renderer.canvasContext.restore();
};