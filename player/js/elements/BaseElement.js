var BaseElement = function (data, animationItem,parentContainer,globalData){
    this.animationItem = animationItem;
    this.globalData = globalData;
    this.data = data;
    this.ownMatrix = new Matrix();
    this.finalTransform = {
        mat: new Matrix(),
        op: 1
    };
    this.renderedFrames = [];
    this.lastData = {};
    this.parentContainer = parentContainer;
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
    if(this.data.hasMask){
        this.layerElement = document.createElementNS(svgNS,'g');
        this.parentContainer.appendChild(this.layerElement);
        this.maskedElement = this.layerElement;
    }else{
        this.layerElement = this.parentContainer;
    }
};

BaseElement.prototype.prepareFrame = function(num){
    this.currentAnimData = this.data.renderedData[num].an;
    this.data.renderedFrame.tr = this.currentAnimData.matrixValue;
    var mat = this.currentAnimData.matrixArray;
    this.ownMatrix.reset();
    this.ownMatrix.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5]);
    this.ownMatrix.translate(-this.currentAnimData.tr.a[0],-this.currentAnimData.tr.a[1]);
};

BaseElement.prototype.renderFrame = function(num,parentTransform){
    if(this.data.inPoint - this.data.startTime <= num && this.data.outPoint - this.data.startTime >= num)
    {
        if(this.isVisible !== true){
            this.isVisible = true;
        }
        this.finalTransform.opacity = 1;
    }else{
        if(this.isVisible !== false){
            this.isVisible = false;
        }
        this.finalTransform.opacity = 0;
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

    this.finalTransform.opacity *= this.currentAnimData.tr.o;

    if(parentTransform){
        this.finalTransform.mat.reset();
        mat = parentTransform.mat.props;
        this.finalTransform.mat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5]);
        this.finalTransform.opacity *= parentTransform.opacity;
    }

    if(this.data.parents){
        var i, len = this.data.parents.length, parentAnimData,mat;
        if(!parentTransform){
            this.finalTransform.mat.reset();
        }
        for(i=len-1;i>=0;i-=1){
            mat = this.data.parents[i].elem.element.ownMatrix.props;
            this.finalTransform.mat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5]);
            parentAnimData = this.data.parents[i].elem.element.currentAnimData;
        }
        mat = this.ownMatrix.props;
        this.finalTransform.mat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5]);
    }else{
        if(this.isVisible){
            if(!parentTransform){
                this.finalTransform.mat = this.ownMatrix;
            }else{
                mat = this.ownMatrix.props;
                this.finalTransform.mat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5]);
            }
        }
    }
    if(this.data.hasMask){
        if(!this.renderedFrames[this.globalData.frameNum]){
            this.renderedFrames[this.globalData.frameNum] = {
                tr:'matrix('+this.finalTransform.mat.props.join(',')+')',
                o:this.finalTransform.opacity
            }
        }
        var renderedFrameData = this.renderedFrames[this.globalData.frameNum];
        if(this.lastData.tr != renderedFrameData.tr){
            this.lastData.tr = renderedFrameData.tr;
            this.layerElement.setAttribute('transform',renderedFrameData.tr);
        }
        if(this.lastData.o != renderedFrameData.o){
            this.lastData.o = renderedFrameData.o;
            this.layerElement.setAttribute('opacity',renderedFrameData.o);
        }
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
        'element':{value:this},
        'globalData':{value:this.globalData}
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

BaseElement.prototype.hide = function(){

}
