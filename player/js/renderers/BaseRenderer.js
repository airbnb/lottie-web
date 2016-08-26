function BaseRenderer(){}
BaseRenderer.prototype.checkLayer = function(pos, num, container){
    var data = this.layers[pos];
    if(data.ip - data.st <= num && data.op - data.st > num)
    {
        this.buildItem(pos, container);
    }
};

BaseRenderer.prototype.buildItem = function(pos, container){
    var elements = this.elements;
    var element = this.createItem(this.layers[pos],container,this);
    elements[pos] = element;
    element.initExpressions();
    this.appendElementInPos(element,pos);
};