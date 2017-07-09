var ShapeModifiers = (function(){
    var ob = {};
    var modifiers = {};
    ob.registerModifier = registerModifier;
    ob.getModifier = getModifier;

    function registerModifier(nm,factory){
        if(!modifiers[nm]){
            modifiers[nm] = factory;
        }
    }

    function getModifier(nm,elem, data, dynamicProperties){
        return new modifiers[nm](elem, data, dynamicProperties);
    }

    return ob;
}());

function ShapeModifier(){}
ShapeModifier.prototype.initModifierProperties = function(){};
ShapeModifier.prototype.addShapeToModifier = function(){};
ShapeModifier.prototype.addShape = function(data){
    if(!this.closed){
        this.shapes.push({shape:data.sh, data: data, localShapeCollection:shapeCollection_pool.newShapeCollection()});
        this.addShapeToModifier(data.sh);
    }
}
ShapeModifier.prototype.init = function(elem,data,dynamicProperties){
    this.elem = elem;
    this.frameId = -1;
    this.shapes = [];
    this.dynamicProperties = [];
    this.mdf = false;
    this.closed = false;
    this.k = false;
    this.comp = elem.comp;
    this.initModifierProperties(elem,data);
    if(this.dynamicProperties.length){
        this.k = true;
        dynamicProperties.push(this);
    }else{
        this.getValue(true);
    }
}