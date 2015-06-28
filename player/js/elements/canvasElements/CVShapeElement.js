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

CVShapeElement.prototype.draw = function(parentMatrix){
    if(this.parent.draw.call(this, parentMatrix)===false){
        return;
    }
    if(!this.data.hasMask){
        this.drawShapes(this.finalTransform);
    }else{
        this.globalData.renderer.ctxOpacity(this.finalTransform.opacity);
        ///this.canvasContext.globalAlpha = this.canvasContext.globalAlpha*this.finalTransform.opacity;
        this.drawShapes();
        this.globalData.renderer.restore(true);
    }
};

CVShapeElement.prototype.drawShapes = function(parentTransform){
    this.mainShape.renderShape(parentTransform);
};