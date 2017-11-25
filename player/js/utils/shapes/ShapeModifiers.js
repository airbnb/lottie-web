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
        var shapeData = {shape:data.sh, data: data, localShapeCollection:shapeCollection_pool.newShapeCollection()};
        this.shapes.push(shapeData);
        this.addShapeToModifier(shapeData);
    }
}
ShapeModifier.prototype.init = function(elem,data,dynamicProperties){
    this.dynamicProperties = [];
    this.shapes = [];
    this.elem = elem;
    this.initModifierProperties(elem,data);
    this.frameId = initialDefaultFrame;
    this.mdf = false;
    this.closed = false;
    this.k = false;
    if(this.dynamicProperties.length){
        this.k = true;
        dynamicProperties.push(this);
    }else{
        this.getValue(true);
    }
}