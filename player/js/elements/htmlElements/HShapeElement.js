function HShapeElement(data,globalData,comp){
    //List of drawable elements
    this.shapes = [];
    // Full shape data
    this.shapesData = data.shapes;
    //List of styles that will be applied to shapes
    this.stylesList = [];
    //List of modifiers that will be applied to shapes
    this.shapeModifiers = [];
    //List of items in shape tree
    this.itemsData = [];
    //List of items in previous shape tree
    this.processedElements = [];
    // List of animated components
    this.animatedContents = [];
    this.shapesContainer = createNS('g');
    this.initElement(data,globalData,comp);
    //Moving any property that doesn't get too much access after initialization because of v8 way of handling more than 10 properties.
    // List of elements that have been created
    this.prevViewData = [];
    this.currentBBox = {
        x:999999,
        y: -999999,
        h: 0,
        w: 0
    };
}
extendPrototype([BaseElement,TransformElement,HSolidElement,SVGShapeElement,HBaseElement,HierarchyElement,FrameElement,RenderableElement], HShapeElement);
HShapeElement.prototype._renderShapeFrame = HShapeElement.prototype.renderInnerContent;

HShapeElement.prototype.createContent = function(){
    var cont;
    this.baseElement.style.fontSize = 0;
    if (this.data.hasMask) {
        this.layerElement.appendChild(this.shapesContainer);
        cont = this.svgElement;
    } else {
        cont = createNS('svg');
        var size = this.comp.data ? this.comp.data : this.globalData.compSize;
        cont.setAttribute('width',size.w);
        cont.setAttribute('height',size.h);
        cont.appendChild(this.shapesContainer);
        this.layerElement.appendChild(cont);
    }

    this.searchShapes(this.shapesData,this.itemsData,this.prevViewData,this.shapesContainer,0, [], true);
    this.filterUniqueShapes();
    this.shapeCont = cont;
};

HShapeElement.prototype.currentBoxContains = function(box) {
    return this.currentBBox.x <= box.x 
    && this.currentBBox.y <= box.y 
    && this.currentBBox.width + this.currentBBox.x >= box.x + box.width
    && this.currentBBox.height + this.currentBBox.y >= box.y + box.height
}

HShapeElement.prototype.renderInnerContent = function() {
    this._renderShapeFrame();

    if(!this.hidden && (this._isFirstFrame || this._mdf)) {
        var tempBoundingBox = this.tempBoundingBox;
        var max = 999999;
        tempBoundingBox.x = max;
        tempBoundingBox.xMax = -max;
        tempBoundingBox.y = max;
        tempBoundingBox.yMax = -max;
        this.calculateBoundingBox(this.itemsData, tempBoundingBox);
        tempBoundingBox.width = tempBoundingBox.xMax < tempBoundingBox.x ? 0 : tempBoundingBox.xMax - tempBoundingBox.x;
        tempBoundingBox.height = tempBoundingBox.yMax < tempBoundingBox.y ? 0 : tempBoundingBox.yMax - tempBoundingBox.y;
        //var tempBoundingBox = this.shapeCont.getBBox();
        if(this.currentBoxContains(tempBoundingBox)) {
            return;
        }
        var changed = false;
        if(this.currentBBox.w !== tempBoundingBox.width){
            this.currentBBox.w = tempBoundingBox.width;
            this.shapeCont.setAttribute('width',tempBoundingBox.width);
            changed = true;
        }
        if(this.currentBBox.h !== tempBoundingBox.height){
            this.currentBBox.h = tempBoundingBox.height;
            this.shapeCont.setAttribute('height',tempBoundingBox.height);
            changed = true;
        }
        if(changed  || this.currentBBox.x !== tempBoundingBox.x  || this.currentBBox.y !== tempBoundingBox.y){
            this.currentBBox.w = tempBoundingBox.width;
            this.currentBBox.h = tempBoundingBox.height;
            this.currentBBox.x = tempBoundingBox.x;
            this.currentBBox.y = tempBoundingBox.y;

            this.shapeCont.setAttribute('viewBox',this.currentBBox.x+' '+this.currentBBox.y+' '+this.currentBBox.w+' '+this.currentBBox.h);
            this.shapeCont.style.transform = this.shapeCont.style.webkitTransform = 'translate(' + this.currentBBox.x + 'px,' + this.currentBBox.y + 'px)';
        }
    }

};