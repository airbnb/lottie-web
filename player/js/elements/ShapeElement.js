function IShapeElement(data, animationItem){
    this.shapes = [];
    this.parent.constructor.call(this,data, animationItem);
}
createElement(BaseElement, IShapeElement);

IShapeElement.prototype.createElements = function(){
    //TODO check if I can use symbol so i can set its viewBox
    this.svgElem = document.createElementNS(svgNS,'g');
    //TODO don't erase next line, probably needed
    //this.svgElem.setAttribute('transform','translate(' +  Math.floor(this.data.rectData.l) + ',' + Math.floor(this.data.rectData.t) + ')');

    styleUnselectableDiv(this.svgElem);

    this.parent.createElements.call(this);
    this.anchorElement.appendChild(this.svgElem);

    var i, len = this.data.shapes.length;
    var shapeItem;
    for(i=len-1;i>=0;i--){
        if(this.data.trim){
            this.data.shapes[i].trim = this.data.trim;
        }
        shapeItem = new ShapeItemElement(this.data.shapes[i]);
        this.svgElem.appendChild(shapeItem.getElement());
        this.shapes.push(shapeItem);
    }
};

IShapeElement.prototype.renderFrame = function(num){
    var renderParent = this.parent.renderFrame.call(this,num);
    if(renderParent===false){
        return;
    }

    this.renderShapes(num);
};

IShapeElement.prototype.renderShapes = function(num){
    var i,len = this.data.shapes.length,shapeData;
    var shapeItem;
    for(i=len-1;i>=0;i--){
        shapeData = this.data.shapes[i];
        shapeItem = this.shapes[len - 1 - i];
        shapeItem.renderShape(num);
    }
};