function HShapeElement(data,parentContainer,globalData,comp, placeholder){
    this.shapes = [];
    this.shapesData = data.shapes;
    this.stylesList = [];
    this.viewData = [];
    this.parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
}
createElement(HBaseElement, HShapeElement);
var parent = HShapeElement.prototype.parent;
extendPrototype(IShapeElement, HShapeElement);
HShapeElement.prototype.parent = parent;

HShapeElement.prototype.createElements = function(){
    var parent = document.createElement('div');
    styleDiv(parent);
    var cont = document.createElementNS(svgNS,'svg');
    if(this.data.bounds.r - this.data.bounds.l < 0){
        console.log('dd: ',this.data.nm);
    }
    cont.setAttribute('width',this.data.bounds.r - this.data.bounds.l);
    cont.setAttribute('height',this.data.bounds.b - this.data.bounds.t);
    cont.setAttribute('viewBox',this.data.bounds.l+' '+this.data.bounds.t+' '+(this.data.bounds.r - this.data.bounds.l)+' '+(this.data.bounds.b - this.data.bounds.t));
    cont.style.transform = 'translate('+this.data.bounds.l+'px,'+this.data.bounds.t+'px)';
    if(this.data.hasMask){
        var g = document.createElementNS(svgNS,'g');
        parent.appendChild(cont);
        cont.appendChild(g);
        this.maskedElement = g;
        this.layerElement = g;
    }else{
        parent.appendChild(cont);
        this.layerElement = cont;
    }
    this.parentContainer.appendChild(parent);
    this.innerElem = parent;
    if(this.data.ln){
        this.innerElem.setAttribute('id',this.data.ln);
    }
    this.searchShapes(this.shapesData,this.viewData,this.dynamicProperties,[]);
    this.buildExpressionInterface();
    this.layerElement = parent;
};

HShapeElement.prototype.renderFrame = function(parentMatrix){
    var renderParent = this.parent.renderFrame.call(this,parentMatrix);
    if(renderParent===false){
        this.hide();
        return;
    }
    this.hidden = false;
    this.renderShape(this.transformHelper,null,null,true);
};