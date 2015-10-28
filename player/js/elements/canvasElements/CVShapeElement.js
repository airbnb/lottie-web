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

CVShapeElement.prototype.renderFrame = function(parentMatrix){
    if(this.parent.renderFrame.call(this, parentMatrix)===false){
        return;
    }
    this.drawShapes(this.finalTransform);
    if(this.data.hasMask){
        this.globalData.renderer.restore(true);
    }
};

CVShapeElement.prototype.drawShapes = function(parentTransform){
    this.mainShape.renderShape(parentTransform);
};

CVShapeElement.prototype.destroy = function(){
    this.mainShape.destroy();
    this.parent.destroy.call();
};