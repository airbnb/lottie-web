function HShapeElement(data,parentContainer,globalData,comp, placeholder){
    this.shapes = [];
    this.shapesData = data.shapes;
    this.stylesList = [];
    this.itemsData = [];
    this.prevViewData = [];
    this.shapeModifiers = [];
    this.processedElements = [];
    this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
    this.currentBBox = {
        x:999999,
        y: -999999,
        h: 0,
        w: 0
    };
}
createElement(HBaseElement, HShapeElement);
var parent = HShapeElement.prototype._parent;
extendPrototype(IShapeElement, HShapeElement);
HShapeElement.prototype._parent = parent;
HShapeElement.prototype._renderShapeFrame = HShapeElement.prototype.renderFrame;

HShapeElement.prototype.createElements = function(){
    var parent = document.createElement('div');
    styleDiv(parent);
    var cont = document.createElementNS(svgNS,'svg');
    styleDiv(cont);
    var size = this.comp.data ? this.comp.data : this.globalData.compSize;
    cont.setAttribute('width',size.w);
    cont.setAttribute('height',size.h);
    if(this.data.hasMask){
        var g = document.createElementNS(svgNS,'g');
        parent.appendChild(cont);
        cont.appendChild(g);
        this.maskedElement = g;
        this.layerElement = g;
        this.shapesContainer = g;
    }else{
        parent.appendChild(cont);
        this.layerElement = cont;
        this.shapesContainer = document.createElementNS(svgNS,'g');
        this.layerElement.appendChild(this.shapesContainer);
    }
    if(!this.data.hd){
        //this.parentContainer.appendChild(parent);
        this.baseElement = parent;
    }
    this.innerElem = parent;
    if(this.data.ln){
        this.innerElem.setAttribute('id',this.data.ln);
    }

    this.searchShapes(this.shapesData,this.itemsData,this.prevViewData,this.layerElement,this.dynamicProperties,0, [], true);
    this.buildExpressionInterface();
    this.layerElement = parent;
    this.transformedElement = parent;
    this.shapeCont = cont;
    if(this.data.bm !== 0){
        this.setBlendMode();
    }
    this.checkParenting();
};

HShapeElement.prototype.renderFrame = function(parentMatrix){
    var firstFrame = this.firstFrame;
    this._renderShapeFrame();

    if(this.isVisible && (this.elemMdf || firstFrame)){
        var boundingBox = this.shapeCont.getBBox();
        var changed = false;
        if(this.currentBBox.w !== boundingBox.width){
            this.currentBBox.w = boundingBox.width;
            this.shapeCont.setAttribute('width',boundingBox.width);
            changed = true;
        }
        if(this.currentBBox.h !== boundingBox.height){
            this.currentBBox.h = boundingBox.height;
            this.shapeCont.setAttribute('height',boundingBox.height);
            changed = true;
        }
        if(changed  || this.currentBBox.x !== boundingBox.x  || this.currentBBox.y !== boundingBox.y){
            this.currentBBox.w = boundingBox.width;
            this.currentBBox.h = boundingBox.height;
            this.currentBBox.x = boundingBox.x;
            this.currentBBox.y = boundingBox.y;

            this.shapeCont.setAttribute('viewBox',this.currentBBox.x+' '+this.currentBBox.y+' '+this.currentBBox.w+' '+this.currentBBox.h);
            this.shapeCont.style.transform = this.shapeCont.style.webkitTransform = 'translate(' + this.currentBBox.x + 'px,' + this.currentBBox.y + 'px)';
        }
    }

};