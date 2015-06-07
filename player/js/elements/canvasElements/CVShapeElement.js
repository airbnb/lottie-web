function CVShapeElement(data,globalData){
    this.shapes = [];
    this.parent.constructor.call(this,data,globalData);
}
createElement(CVBaseElement, CVShapeElement);

CVShapeElement.prototype.createElements = function(){

    this.parent.createElements.call(this);
    this.mainShape = new CVShapeItemElement(this.data.shapes,true,this.globalData);
};

CVShapeElement.prototype.prepareFrame = function(num){
    var renderParent = this.parent.prepareFrame.call(this,num);
    if(renderParent===false){
        return;
    }
    this.mainShape.prepareFrame(num);
};

CVShapeElement.prototype.draw = function(){
    this.canvasContext.save();
    if(this.parent.draw.call(this, false)===false){
        this.canvasContext.restore();
        return;
    }
    this.drawShapes();
    this.canvasContext.restore();
};

CVShapeElement.prototype.drawShapes = function(){
    this.mainShape.renderShape();
};