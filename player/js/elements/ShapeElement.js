function IShapeElement(data,parentContainer,globalData, placeholder){
    this.shapes = [];
    this.parent.constructor.call(this,data,parentContainer,globalData, placeholder);
}
createElement(SVGBaseElement, IShapeElement);

IShapeElement.prototype.transformHelper = {opacity:1,mat:new Matrix(),matMdf:false,opMdf:false};

IShapeElement.prototype.createElements = function(){
    //TODO check if I can use symbol so i can set its viewBox
    this.parent.createElements.call(this);
    this.mainShape = new ShapeItemElement(this.data,this.layerElement,this.parentContainer,this.placeholder,this.dynamicProperties,this.globalData);
};

IShapeElement.prototype.renderFrame = function(parentMatrix){

    var renderParent = this.parent.renderFrame.call(this,parentMatrix);
    if(renderParent===false){
        this.hide();
        return;
    }

    this.hidden = false;
    if(this.firstFrame){
        this.mainShape.firstFrame = true;
        this.firstFrame = false;
    }
    if(this.data.hasMask){
        this.mainShape.renderShape(this.transformHelper,null,null,true);
    }else{
        this.mainShape.renderShape(this.finalTransform,null,null,true);
    }
};

IShapeElement.prototype.hide = function(){
    if(!this.hidden){
        this.mainShape.hideShape();
        this.hidden = true;
    }
};

IShapeElement.prototype.destroy = function(){
    this.parent.destroy.call();
    this.mainShape.destroy();
};