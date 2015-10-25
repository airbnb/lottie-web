function IShapeElement(data,parentContainer,globalData, placeholder){
    this.shapes = [];
    this.parent.constructor.call(this,data,parentContainer,globalData, placeholder);
}
createElement(BaseElement, IShapeElement);

IShapeElement.prototype.transformHelper = {opacity:1,mat:new Matrix(),matMdf:false,opMdf:false};

IShapeElement.prototype.createElements = function(){
    //TODO check if I can use symbol so i can set its viewBox
    this.parent.createElements.call(this);
    this.mainShape = new ShapeItemElement(this.data,this.layerElement,this.parentContainer,this.placeholder,this.dynamicProperties,this.globalData);
};

IShapeElement.prototype.renderFrame = function(num,parentMatrix){
    var renderParent = this.parent.renderFrame.call(this,num,parentMatrix);
    if(renderParent===false){
        this.hide();
        return;
    }

    this.renderShapes(num);
};

IShapeElement.prototype.hide = function(){
    if(!this.hidden){
        this.mainShape.hideShape();
        this.hidden = true;
    }
};

IShapeElement.prototype.renderShapes = function(num){
    this.hidden = false;
    if(this.data.hasMask){
        this.mainShape.renderShape(num,this.transformHelper,null,null,true);
    }else{
        this.mainShape.renderShape(num,this.finalTransform,null,null,true);
    }
};

IShapeElement.prototype.destroy = function(){
    this.parent.destroy.call();
    this.mainShape.destroy();
};