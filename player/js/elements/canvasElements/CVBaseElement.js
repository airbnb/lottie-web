function CVBaseElement(data,animationItem){
    this.animationItem = animationItem;
    this.data = data;
    this.currentAnimData = {
        renderedFrame : -1,
        data: null
    };
    this.init();
};

CVBaseElement.prototype.init = function(){
    this.createElements();
    if(this.data.hasMask){
        this.addMasks(this.data);
    }
    if(this.data.eff){
        this.createEffectsManager(this.data);
    }
};

CVBaseElement.prototype.createElements = function(){

};

CVBaseElement.prototype.getCurrentAnimData = function(){
    
}

CVBaseElement.prototype.renderFrame = function(num){
    if(this.data.inPoint - this.data.startTime <= num && this.data.outPoint - this.data.startTime > num)
    {
        if(this.isVisible !== true){
            this.isVisible = true;
        }
    }else{
        if(this.isVisible !== false){
            this.isVisible = false;
        }
        return false;
    }
    var animData = this.data.an[this.data.an[num].forwardFrame];

    if(this.data.eff){
        this.effectsManager.renderFrame(num,animData.mk);
    }

    if(this.data.an[num].forwardFrame === this.data.renderedFrame.num){
        return true;
    }

    if(this.data.hasMask){
        this.maskManager.renderFrame(num);
    }

    this.data.renderedFrame.num = animData.forwardFrame;

    if(this.data.renderedFrame.o !== animData.tr.o){
        this.data.renderedFrame.o = animData.tr.o;
        this.anchorElement.setAttribute('opacity',animData.tr.o);
    }
    var anchorChanged = false;
    if(!this.data.renderedFrame.a || (this.data.renderedFrame.a[0] !== animData.tr.a[0] && this.data.renderedFrame.a[1] !== animData.tr.a[1])){
        this.data.renderedFrame.a = [animData.tr.a[0],animData.tr.a[1]];
        this.anchorElement.setAttribute('transform','translate('+ -animData.tr.a[0]+" "+ -animData.tr.a[1]+")");
        anchorChanged = true;
    }
    var transformChanged = false;
    if(this.data.renderedFrame.tr !== animData.matrixValue){
        this.layerElement.setAttribute('transform',animData.matrixValue);
        this.data.renderedFrame.tr = animData.matrixValue;
        transformChanged = true;
    }

    if(this.data.relateds && (transformChanged || anchorChanged)){
        var relateds = this.data.relateds, i, len = relateds.length, item, itemCont;
        for(i=0;i<len;i++){
            item = relateds[i].item;
            itemCont = relateds[i].itemCont;
            if(anchorChanged){
                item.setAttribute('transform','translate('+ -animData.tr.a[0]+" "+ -animData.tr.a[1]+")");
            }
            if(transformChanged){
                itemCont.setAttribute('transform',animData.matrixValue);
            }
        }
    }
    return true;
};

CVBaseElement.prototype.getDomElement = function(){
    return this.layerElement;
};
CVBaseElement.prototype.setMainElement = function(value){
    this.mainElement = value;
};
CVBaseElement.prototype.getMaskManager = function(){
    return this.maskManager;
};
CVBaseElement.prototype.addMasks = function(data){
    var params = {
        'data':{value:data},
        'element':{value:this}
    };
    this.maskManager = createElement(MaskElement,null,params);
};
CVBaseElement.prototype.createEffectsManager = function(data){
    var params = {
        'effects':{value:data.eff},
        'element':{value:this}
    };
    this.effectsManager = createElement(EffectsManager,null,params);
};
CVBaseElement.prototype.getType = function(){
    return this.type;
};

CVBaseElement.prototype.getLayerSize = function(){
    if(this.data.type == 'TextLayer'){
        return {w:this.data.textData.width,h:this.data.textData.height};
    }else{
        return {w:this.data.width,h:this.data.height};
    }
};

