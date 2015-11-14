function CVShapeElement(data,globalData){
    this.shapes = [];
    this.parent.constructor.call(this,data,globalData);
}
createElement(CVBaseElement, CVShapeElement);

CVShapeElement.prototype.createElements = function(){

    this.parent.createElements.call(this);
    this.mainShape = new CVShapeItemElement(this.data,this.dynamicProperties,this.globalData);
};

CVShapeElement.prototype.renderFrame = function(parentMatrix){
    if(this.parent.renderFrame.call(this, parentMatrix)===false){
        return;
    }
    if(this.firstFrame){
        this.mainShape.firstFrame = true;
        this.firstFrame = false;
    }
    this.mainShape.renderShape(this.finalTransform,null,null,true);
    if(this.data.hasMask){
        this.globalData.renderer.restore(true);
    }
};

CVShapeElement.prototype.destroy = function(){
    this.mainShape.destroy();
    this.parent.destroy.call();
};