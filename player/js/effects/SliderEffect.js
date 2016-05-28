function SliderEffect(data,elem, dynamicProperties){
    this.p = PropertyFactory.getProp(elem,data.v,0,0,dynamicProperties);
}
function AngleEffect(data,elem, dynamicProperties){
    this.p = PropertyFactory.getProp(elem,data.v,0,0,dynamicProperties);
}
function ColorEffect(data,elem, dynamicProperties){
    this.p = PropertyFactory.getProp(elem,data.v,1,0,dynamicProperties);
}
function PointEffect(data,elem, dynamicProperties){
    this.p = PropertyFactory.getProp(elem,data.v,1,0,dynamicProperties);
}
function CheckboxEffect(data,elem, dynamicProperties){
    this.p = PropertyFactory.getProp(elem,data.v,1,0,dynamicProperties);
}
function NoValueEffect(data,elem, dynamicProperties){
    this.p = {};
}

function groupEffectFunction(num){

}

function GroupEffect() {
    var fn = groupEffectFunction;
    return fn;
}

SliderEffect.prototype.proxyFunction = function(){
    if(this.p.k){
        this.p.getValue();
    }
    if(typeof this.p.v === 'number'){
        return this.p.v;
    }
    var i, len = this.p.v.length;
    var arr = Array.apply(null,{length:len});
    for(i=0;i<len;i+=1){
        arr[i] = this.p.v[i];
    }
    return arr;
}

AngleEffect.prototype.proxyFunction = SliderEffect.prototype.proxyFunction;
ColorEffect.prototype.proxyFunction = SliderEffect.prototype.proxyFunction;
PointEffect.prototype.proxyFunction = SliderEffect.prototype.proxyFunction;
CheckboxEffect.prototype.proxyFunction = SliderEffect.prototype.proxyFunction;