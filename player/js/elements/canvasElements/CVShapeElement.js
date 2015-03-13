function CVShapeElement(data, renderer){
    this.shapes = [];
    this.parent.constructor.call(this,data, renderer);
}
createElement(CVBaseElement, CVShapeElement);

CVShapeElement.prototype.createElements = function(){

    this.parent.createElements.call(this);

    var i, len = this.data.shapes.length;
    var shapeItem;
    for(i=len-1;i>=0;i--){
        if(this.data.trim){
            this.data.shapes[i].trim = this.data.trim;
        }
        shapeItem = new CVShapeItemElement(this.data.shapes[i], this.renderer);
        this.shapes.push(shapeItem);
    }
};

CVShapeElement.prototype.prepareFrame = function(num){
    var renderParent = this.parent.prepareFrame.call(this,num);
    if(renderParent===false){
        return;
    }
    var i,len = this.data.shapes.length,shapeData;
    var shapeItem;
    for(i=len-1;i>=0;i--){
        shapeData = this.data.shapes[i];
        shapeItem = this.shapes[len - 1 - i];
        shapeItem.prepareFrame(num);
    }
};

CVShapeElement.prototype.draw = function(){
    var renderParent = this.parent.draw.call(this);
    if(renderParent===false){
        return;
    }
    this.drawShapes();
};

CVShapeElement.prototype.drawShapes = function(){
    var i,len = this.data.shapes.length,shapeData;
    var shapeItem;
    for(i=len-1;i>=0;i--){
        shapeData = this.data.shapes[i];
        shapeItem = this.shapes[len - 1 - i];
        shapeItem.renderShape();
    }
};