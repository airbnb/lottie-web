function DShapeElement(data, animationItem){
    this.shapes = [];
    this.parent.constructor.call(this,data, animationItem);
}
createElement(DBaseElement, DShapeElement);

DShapeElement.prototype.createElements = function(){
    //TODO check if I can use symbol so i can set its viewBox

    this.parent.createElements.call(this);

    this.layerElement.setAttribute('width',2000);
    this.layerElement.setAttribute('height',2000);
    this.layerElement.setAttribute('viewBox',-this.data.compWidth/2 + ' '+ -this.data.compHeight/2+' '+2000+' '+2000);
    this.layerElement.setAttribute('preserveAspectRatio','xMidYMid meet');

    var i, len = this.data.shapes.length;
    var shapeItem;
    for(i=len-1;i>=0;i--){
        if(this.data.trim){
            this.data.shapes[i].trim = this.data.trim;
        }
        shapeItem = new ShapeItemElement(this.data.shapes[i]);
        this.layerElement.appendChild(shapeItem.getElement());
        this.shapes.push(shapeItem);
    }
};

DShapeElement.prototype.renderFrame = function(num){
    var renderParent = this.parent.renderFrame.call(this,num);
    this.layerElement.style.transform = this.fullTransform + ' translate('+ -this.data.compWidth/2 +'px, '+ -this.data.compHeight/2 +'px )';
    if(renderParent===false){
        return;
    }

    this.renderShapes(num);
};

DShapeElement.prototype.renderShapes = function(num){
    var i,len = this.data.shapes.length,shapeData;
    var shapeItem;
    for(i=len-1;i>=0;i--){
        shapeData = this.data.shapes[i];
        shapeItem = this.shapes[len - 1 - i];
        shapeItem.renderShape(num);
    }
};