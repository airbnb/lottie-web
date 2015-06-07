function CVSolidElement(data,globalData){
    this.parent.constructor.call(this,data,globalData);
}
createElement(CVBaseElement, CVSolidElement);

CVSolidElement.prototype.draw = function(){
    this.canvasContext.save();
    if(this.parent.draw.call(this, false)===false){
        this.canvasContext.restore();
        return;
    }
    var ctx = this.canvasContext;
    ctx.fillStyle=this.data.color;
    ctx.fillRect(0,0,this.data.width,this.data.height);
    this.canvasContext.restore();
};