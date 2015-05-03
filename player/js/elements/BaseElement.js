var BaseElement = function (data, animationItem){
    this.animationItem = animationItem;
    this.data = data;
    this.transformChanged = false;
    this.forceRender = false;
    this.currentMatrix = new Matrix();
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
    this.layerElement = document.createElementNS(svgNS,'g');
    this.layerElement.setAttribute('id',this.data.layerName);
    this.maskingGroup = this.layerElement;
    this.maskedElement = this.layerElement;
};

BaseElement.prototype.prepareFrame = function(num){
    this.currentAnimData = this.data.renderedData[num].an;
    if(this.data.renderedFrame.tr !== this.currentAnimData.matrixValue){
        this.transformChanged = true;
        this.data.renderedFrame.tr = this.currentAnimData.matrixValue;
    }else{
        this.transformChanged = false;
    }
};

BaseElement.prototype.renderFrame = function(num){
    if(this.data.inPoint - this.data.startTime <= num && this.data.outPoint - this.data.startTime > num)
    {
        if(this.isVisible !== true){
            this.isVisible = true;
            this.forceRender = true;
            this.mainElement.setAttribute('opacity',1);
        }
    }else{
        if(this.isVisible !== false){
            this.isVisible = false;
            this.mainElement.setAttribute('opacity',0);
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
            this.layerElement.setAttribute('opacity',this.currentAnimData.tr.o);
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
                this.layerElement.setAttribute('transform',transformValue);
            }
            this.fullTransform = transformValue;
        }
    }else if(this.transformChanged){
        transformValue += this.currentAnimData.matrixValue;
        if(this.isVisible){
            var mat = this.currentAnimData.matrixArray;
            this.currentMatrix.reset();
            this.currentMatrix.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5]);
            this.currentMatrix.translate(-this.currentAnimData.tr.a[0],-this.currentAnimData.tr.a[1]);
            //this.layerElement.setAttribute('transform',transformValue);
        }
        this.fullTransform = transformValue;
    }
    if(this.forceRender){
        this.forceRender = false;
        this.layerElement.setAttribute('opacity',this.currentAnimData.tr.o);
        //this.layerElement.setAttribute('transform',this.fullTransform);
    }


    return this.isVisible;
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
