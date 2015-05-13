function IShapeElement(data, animationItem,parentContainer,globalData){
    this.shapes = [];
    this.parent.constructor.call(this,data, animationItem,parentContainer,globalData);
}
createElement(BaseElement, IShapeElement);

IShapeElement.prototype.createElements = function(){
    //TODO check if I can use symbol so i can set its viewBox
    this.parent.createElements.call(this);

    this.mainShape = new ShapeItemElement(this.data.shapes,this.layerElement,this.globalData);
};

IShapeElement.prototype.renderFrame = function(num,parentMatrix){
    var renderParent = this.parent.renderFrame.call(this,num,parentMatrix);
    if(renderParent===false){
        if(!this.hidden){
            this.hideShapes();
        }
        return;
    }

    this.renderShapes(num);
};

IShapeElement.prototype.hideShapes = function(){
    this.mainShape.hideShape();
    this.hidden = true;
};

IShapeElement.prototype.renderShapes = function(num){
    this.hidden = false;
    if(this.data.hasMask){
        this.mainShape.renderShape(num);
    }else{
        this.mainShape.renderShape(num,this.finalTransform);
    }
};