function CVSolidElement(data, animationItem){
    this.parent.constructor.call(this,data, animationItem);
}
createElement(CVBaseElement, CVSolidElement);

CVSolidElement.prototype.draw = function(){
    this.renderer.canvasContext.save();
    var renderParent = this.parent.draw.call(this, false);
    if(renderParent===false){
        this.renderer.canvasContext.restore();
        return;
    }
    var ctx = this.renderer.canvasContext;
    ctx.fillStyle=this.data.color;
    ctx.fillRect(0,0,this.data.width,this.data.height);
    this.renderer.canvasContext.restore();
};