function HShapeElement(data,parentContainer,globalData,comp, placeholder){
    this.shapes = [];
    this.shapeModifiers = [];
    this.shapesData = data.shapes;
    this.stylesList = [];
    this.viewData = [];
    this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
    this.addedTransforms = {
        mdf: false,
        mats: [this.finalTransform.mat]
    };
}
createElement(HBaseElement, HShapeElement);
var parent = HShapeElement.prototype._parent;
extendPrototype(IShapeElement, HShapeElement);
HShapeElement.prototype._parent = parent;

HShapeElement.prototype.createElements = function(){
    var parent = document.createElement('div');
    styleDiv(parent);
    var cont = document.createElementNS(svgNS,'svg');
    if(this.data.bounds.l === 999999){
    }
    cont.setAttribute('width',this.data.bounds.r - this.data.bounds.l);
    cont.setAttribute('height',this.data.bounds.b - this.data.bounds.t);
    cont.setAttribute('viewBox',this.data.bounds.l+' '+this.data.bounds.t+' '+(this.data.bounds.r - this.data.bounds.l)+' '+(this.data.bounds.b - this.data.bounds.t));
    cont.style.transform = cont.style.webkitTransform = 'translate('+this.data.bounds.l+'px,'+this.data.bounds.t+'px)';
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
        this.parentContainer.appendChild(parent);
    }
    this.innerElem = parent;
    if(this.data.ln){
        this.innerElem.setAttribute('id',this.data.ln);
    }
    this.searchShapes(this.shapesData,this.viewData,this.layerElement,this.dynamicProperties,0);
    this.buildExpressionInterface();
    this.layerElement = parent;
    if(this.data.bm !== 0){
        this.setBlendMode();
    }
};

HShapeElement.prototype.renderFrame = function(parentMatrix){
    var renderParent = this._parent.renderFrame.call(this,parentMatrix);
    if(renderParent===false){
        this.hide();
        return;
    }
    this.hidden = false;
    this.renderModifiers();
    this.addedTransforms.mdf = this.finalTransform.matMdf;
    this.addedTransforms.mats.length = 1;
    this.addedTransforms.mats[0] = this.finalTransform.mat;
    this.renderShape(this.transformHelper,null,null,true, null);
};