function CVShapeElement(data, animationItem){
    this.shapes = [];
    this.parent.constructor.call(this,data, animationItem);
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
        shapeItem = new CVShapeItemElement(this.data.shapes[i]);
        this.shapes.push(shapeItem);
    }
};

CVShapeElement.prototype.renderFrame = function(num){
    var renderParent = this.parent.renderFrame.call(this,num);
    if(renderParent===false){
        return;
    }

    this.renderShapes(num);
};

CVShapeElement.prototype.renderShapes = function(num){
    var i,len = this.data.shapes.length,shapeData;
    var shapeItem;
    for(i=len-1;i>=0;i--){
        shapeData = this.data.shapes[i];
        shapeItem = this.shapes[len - 1 - i];
        shapeItem.renderShape(num);
    }
};