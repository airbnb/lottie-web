function CVShapeElement(data, renderer,globalData){
    this.shapes = [];
    this.parent.constructor.call(this,data, renderer,globalData);
}
createElement(CVBaseElement, CVShapeElement);

CVShapeElement.prototype.createElements = function(){

    this.parent.createElements.call(this);
    this.mainShape = new CVShapeItemElement(this.data.shapes,this.renderer,true,this.globalData);
};

CVShapeElement.prototype.prepareFrame = function(num){
    var renderParent = this.parent.prepareFrame.call(this,num);
    if(renderParent===false){
        return;
    }
    this.mainShape.prepareFrame(num);
};

CVShapeElement.prototype.draw = function(){
    this.renderer.canvasContext.save();
    if(this.parent.draw.call(this, false)===false){
        this.renderer.canvasContext.restore();
        return;
    }
    this.drawShapes();
    this.renderer.canvasContext.restore();
};

CVShapeElement.prototype.drawShapes = function(){
    this.mainShape.renderShape();
};