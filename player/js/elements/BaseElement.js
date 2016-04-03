function BaseElement(){
};
BaseElement.prototype.checkMasks = function(){
    if(!this.data.hasMask){
        return false;
    }
    var i = 0, len = this.data.masksProperties.length;
    while(i<len) {
        if((this.data.masksProperties[i].mode !== 'n' && this.data.masksProperties[i].cl !== false)) {
            return true;
        }
        i += 1;
    }
    return false;
}

BaseElement.prototype.prepareFrame = function(num){
    if(this.data.ip - this.data.st <= num && this.data.op - this.data.st > num)
    {
        if(this.isVisible !== true){
            this.isVisible = true;
            this.firstFrame = true;
            if(this.data.hasMask){
                this.maskManager.firstFrame = true;
            }
        }
    }else{
        if(this.isVisible !== false){
            this.isVisible = false;
        }
    }
    var i, len = this.dynamicProperties.length;
    for(i=0;i<len;i+=1){
        this.dynamicProperties[i].getValue(num);
    }
    if(this.data.hasMask){
        this.maskManager.prepareFrame(num);
    }
    /* TODO check this
    if(this.data.sy){
        if(this.data.sy[0].renderedData[num]){
            if(this.data.sy[0].renderedData[num].c){
                this.feFlood.setAttribute('flood-color','rgb('+Math.round(this.data.sy[0].renderedData[num].c[0])+','+Math.round(this.data.sy[0].renderedData[num].c[1])+','+Math.round(this.data.sy[0].renderedData[num].c[2])+')');
            }
            if(this.data.sy[0].renderedData[num].s){
                this.feMorph.setAttribute('radius',this.data.sy[0].renderedData[num].s);
            }
        }
    }
    */

    this.currentFrameNum = num;
    return this.isVisible;
};

BaseElement.prototype.init = function(){
    this.hidden = false;
    this.firstFrame = true;
    this.isVisible = false;
    this.dynamicProperties = [];
    this.currentFrameNum = -99999;
    this.lastNum = -99999;
    if(this.data.ef){
        this.effectsManager = new EffectsManager(this.data,this,this.dynamicProperties);
        this.effect = this.effectsManager.bind(this.effectsManager);
    }
    this.finalTransform = {
        mProp: PropertyFactory.getProp(this,this.data.ks,2,null,this.dynamicProperties),
        matMdf: false,
        opMdf: false,
        mat: new Matrix(),
        opacity: 1
    };
    this.finalTransform.op = this.finalTransform.mProp.o;
    this.transform = this.finalTransform.mProp;
    this.createElements();
    if(this.data.hasMask){
        this.addMasks(this.data);
    }
};
BaseElement.prototype.getType = function(){
    return this.type;
};

BaseElement.prototype.resetHierarchy = function(){
    if(!this.hierarchy){
        this.hierarchy = [];
    }else{
        this.hierarchy.length = 0;
    }
};

BaseElement.prototype.getHierarchy = function(){
    if(!this.hierarchy){
        this.hierarchy = [];
    }
    return this.hierarchy;
};

BaseElement.prototype.getLayerSize = function(){
    if(this.data.ty === 5){
        return {w:this.data.textData.width,h:this.data.textData.height};
    }else{
        return {w:this.data.width,h:this.data.height};
    }
};

BaseElement.prototype.hide = function(){

};


BaseElement.prototype.mHelper = new Matrix();
BaseElement.prototype.mask = function(nm){
    return this.maskManager.getMask(nm);
}

extendPrototype(LayerInterface,BaseElement);

Object.defineProperty(BaseElement.prototype, "anchorPoint", {
    get: function anchorPoint() {
        return this.finalTransform.mProp.anchorPoint;
    }
});