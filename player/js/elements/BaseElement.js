var BaseElement = function (data,parentType, animationItem){
    this.animationItem = animationItem;
    this.type = parentType;
    this.parentType = parentType;
    this.data = data;
    this.init();
};

BaseElement.prototype.init = function(){
    this.createElements();
    if(this.data.hasMask){
        this.addMasks(this.data);
    }
    if(this.data.eff){
        this.createEffectsManager(this.data);
    }
};

BaseElement.prototype.createElements = function(){
    if(this.type=='svg'){
        if(this.parentType=='svg'){
            this.layerElement = document.createElementNS(svgNS,'g');
        }else{
            this.layerElement = document.createElementNS(svgNS,'svg');
        }
        this.anchorElement = document.createElementNS(svgNS,'g');
    }else{
        this.layerElement = document.createElement('div');
        styleDiv(this.layerElement);
        this.anchorElement = document.createElement('div');
        styleDiv(this.anchorElement);
        //this.anchorElement.style.width = this.data.width+'px';
        //this.anchorElement.style.height = this.data.height+'px';
    }

    this.anchorElement.setAttribute('id',this.data.layerName);
    this.layerElement.appendChild(this.anchorElement);

    if(this.type=='svg'){
        this.maskingGroup = this.anchorElement;
    }else{
        this.maskingGroup = this.svgElem;
    }
    this.maskedElement = this.svgElem;

};

BaseElement.prototype.renderFrame = function(num){
    if(this.data.inPoint - this.data.startTime <= num && this.data.outPoint - this.data.startTime > num)
    {
        if(this.isVisible !== true){
            this.isVisible = true;
            this.mainElement.setAttribute('opacity',1);
        }
    }else{
        if(this.isVisible !== false){
            this.isVisible = false;
            this.mainElement.setAttribute('opacity',0);
        }
        return false;
    }
    if(!this.data.an[num]){
        console.log('num: ',num);
        console.log('this.data: ',this.data);
    }
    var animData = this.data.an[this.data.an[num].forwardFrame];

    if(this.data.eff){
        this.effectsManager.renderFrame(num,animData.mk);
    }

    if(this.data.an[num].forwardFrame == this.data.renderedFrame){
        return true;
    }

    if(this.data.hasMask){
        this.maskManager.renderFrame(num);
    }

    this.data.renderedFrame = animData.forwardFrame;

    this.anchorElement.setAttribute('opacity',animData.tr.o);
    this.anchorElement.setAttribute('transform','translate('+ -animData.tr.a[0]+" "+ -animData.tr.a[1]+")");
    this.layerElement.setAttribute('transform',animData.matrixValue);

    if(this.data.relateds){
        var relateds = this.data.relateds, i, len = relateds.length, item, itemCont, type;
        for(i=0;i<len;i++){
            item = relateds[i].item;
            itemCont = relateds[i].itemCont;
            type = relateds[i].type;

            item.setAttribute('transform','translate('+ -animData.tr.a[0]+" "+ -animData.tr.a[1]+")");
            itemCont.setAttribute('transform',animData.matrixValue);
        }
    }
    return true;
};

BaseElement.prototype.getDomElement = function(){
    return this.layerElement;
};
BaseElement.prototype.setMainElement = function(value){
    this.mainElement = value;
};
BaseElement.prototype.getMaskManager = function(){
    return this.maskManager;
};
BaseElement.prototype.addMasks = function(data){
    var params = {
        'data':{value:data},
        'element':{value:this}
    };
    this.maskManager = createElement(MaskElement,null,params);
};
BaseElement.prototype.createEffectsManager = function(data){
    var params = {
        'effects':{value:data.eff},
        'element':{value:this}
    };
    this.effectsManager = createElement(EffectsManager,null,params);
};
BaseElement.prototype.getType = function(){
    return this.type;
};

BaseElement.prototype.getLayerSize = function(){
    if(this.data.type == 'TextLayer'){
        return {w:this.data.textData.width,h:this.data.textData.height};
    }else{
        return {w:this.data.width,h:this.data.height};
    }
};
defineDescriptor(BaseElement,'svgElem', null,{writable:true});
defineDescriptor(BaseElement,'layerElement', null,{writable:true});
defineDescriptor(BaseElement,'mainElement', null,{writable:true});
defineDescriptor(BaseElement,'anchorElement', null,{writable:true});
defineDescriptor(BaseElement,'maskingGroup', null,{writable:true});
defineDescriptor(BaseElement,'maskedElement', null,{writable:true});
defineDescriptor(BaseElement,'maskManager', null,{writable:true});
defineDescriptor(BaseElement,'effectsManager', null,{writable:true});
defineDescriptor(BaseElement,'isVisible', null,{writable:true});
defineDescriptor(BaseElement,'animationItem', null,{writable:true});
defineDescriptor(BaseElement,'localFrameNum', null,{writable:true});
/*defineAccessor(BaseElement,'maskingGroup', {get:function(){return this.anchorElement}});
defineAccessor(BaseElement,'maskedElement', {get:function(){return this.svgElem}});
defineBasicAccessor(BaseElement,'maskElement');
*/