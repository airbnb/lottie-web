var DBaseElement = function (data, animationItem){
    this.animationItem = animationItem;
    this.data = data;
    this.transformChanged = false;
    this.forceRender = false;
    this.init();
};

DBaseElement.prototype.init = function(){
    this.createElements();
    if(this.data.hasMask){
        this.addMasks(this.data);
    }
    if(this.data.eff){
        this.createEffectsManager(this.data);
    }
};

DBaseElement.prototype.createElements = function(){
    this.layerElement = document.createElementNS(svgNS,'svg');
    this.layerElement.style.position = 'absolute';
    this.layerElement.style.top = 0;
    this.layerElement.style.left = 0;
    this.layerElement.style.backfaceVisibility  = this.layerElement.style.webkitBackfaceVisibility = 'hidden';
    this.layerElement.style.transformOrigin = "0 0";
    this.layerElement.setAttribute('id',this.data.layerName);


    this.maskingGroup = this.layerElement;

    this.maskedElement = this.layerElement;
    this.mainElement = this.layerElement;

};

DBaseElement.prototype.prepareFrame = function(num){
    this.currentAnimData = this.data.renderedData[num].an;
    if(this.data.renderedFrame.tr !== this.currentAnimData.matrixValue){
        this.transformChanged = true;
        this.data.renderedFrame.tr = this.currentAnimData.matrixValue;
    }else{
        this.transformChanged = false;
    }
};

DBaseElement.prototype.renderFrame = function(num){
    if(this.data.inPoint - this.data.startTime <= num && this.data.outPoint - this.data.startTime > num)
    {
        if(this.isVisible !== true){
            this.isVisible = true;
            this.forceRender = true;
            this.mainElement.style.opacity=1;
        }
    }else{
        if(this.isVisible !== false){
            this.isVisible = false;
            this.mainElement.style.opacity=0;
        }
    }

    if(this.data.eff){
        this.effectsManager.renderFrame(num,this.currentAnimData.mk);
    }

    if(num === this.data.renderedFrame.num){
        return this.isVisible;
    }

    if(this.data.hasMask){
        this.maskManager.renderFrame(num);
    }

    if(this.data.renderedFrame.o !== this.currentAnimData.tr.o){
        this.data.renderedFrame.o = this.currentAnimData.tr.o;
        if(this.isVisible){
            this.layerElement.style.opacity = this.currentAnimData.tr.o;
        }
    }

    var transformValue = '';


    if(this.data.parents){
        var changedFlag = false;
        var i = 0, len = this.data.parents.length, parentAnimData;
        if(!this.transformChanged){
            while(i<len){
                if(this.data.parents[i].elem.element.transformChanged){
                    changedFlag = true;
                    break;
                }
                i+=1;
            }
        }else{
            changedFlag = true;
        }
        if(changedFlag){
            for(i=len-1;i>=0;i-=1){
                parentAnimData = this.data.parents[i].elem.element.currentAnimData;
                transformValue += parentAnimData.matrixValue + ' ';
            }
            transformValue += this.currentAnimData.matrixValue;
            if(this.isVisible){
                this.layerElement.style.transform = transformValue;
            }
            this.fullTransform = transformValue;
        }
    }else if(this.transformChanged){
        transformValue += this.currentAnimData.matrixValue;
        if(this.isVisible){
            this.layerElement.style.transform = transformValue;
        }
        this.fullTransform = transformValue;
    }
    if(this.forceRender){
        this.forceRender = false;
        this.layerElement.style.opacity = this.currentAnimData.tr.o;
        this.layerElement.style.transform = this.fullTransform;
    }


    return this.isVisible;
};

DBaseElement.prototype.getDomElement = function(){
    return this.layerElement;
};
DBaseElement.prototype.setMainElement = function(value){
    this.mainElement = value;
};
DBaseElement.prototype.getMaskManager = function(){
    return this.maskManager;
};
DBaseElement.prototype.addMasks = function(data){
    var params = {
        'data':{value:data},
        'element':{value:this}
    };
    this.maskManager = createElement(MaskElement,null,params);
};
DBaseElement.prototype.createEffectsManager = function(data){
    var params = {
        'effects':{value:data.eff},
        'element':{value:this}
    };
    this.effectsManager = createElement(EffectsManager,null,params);
};
DBaseElement.prototype.getType = function(){
    return this.type;
};

DBaseElement.prototype.getLayerSize = function(){
    if(this.data.type == 'TextLayer'){
        return {w:this.data.textData.width,h:this.data.textData.height};
    }else{
        return {w:this.data.width,h:this.data.height};
    }
};
