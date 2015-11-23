function SliderEffect(data,elem, dynamicProperties){
    this.p = PropertyFactory.getProp(elem,data.v,0,0,dynamicProperties);
}
function AngleEffect(data,elem, dynamicProperties){
    this.p = PropertyFactory.getProp(elem,data.v,0,0,dynamicProperties);
}
function ColorEffect(data,elem, dynamicProperties){
    this.p = PropertyFactory.getProp(elem,data.v,1,1/255,dynamicProperties);
}
function PointEffect(data,elem, dynamicProperties){
    this.p = PropertyFactory.getProp(elem,data.v,1,0,dynamicProperties);
}
function CheckboxEffect(data,elem, dynamicProperties){
    this.p = PropertyFactory.getProp(elem,data.v,1,0,dynamicProperties);
}

SliderEffect.prototype.proxyFunction = function(){
    return this.p.v;
}

AngleEffect.prototype.proxyFunction = SliderEffect.prototype.proxyFunction;
ColorEffect.prototype.proxyFunction = SliderEffect.prototype.proxyFunction;
PointEffect.prototype.proxyFunction = SliderEffect.prototype.proxyFunction;
CheckboxEffect.prototype.proxyFunction = SliderEffect.prototype.proxyFunction;