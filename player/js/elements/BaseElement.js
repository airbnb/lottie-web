var BaseElement = function (data, animationItem,parentContainer,globalData){
    this.animationItem = animationItem;
    this.globalData = globalData;
    this.data = data;
    this.ownMatrix = new Matrix();
    this.finalTransform = {
        mat: new Matrix(),
        op: 1
    };
    this.matteElement = null;
    this.renderedFrames = [];
    this.lastData = {};
    this.parentContainer = parentContainer;
    this.layerId = randomString(10);
    this.hidden = false;
    this.init();
};

BaseElement.prototype.init = function(){
    this.createElements();
    if(this.data.hasMask){
        this.addMasks(this.data);
    }
    if(this.data.eff){
        //this.createEffectsManager(this.data);
    }
};

BaseElement.prototype.createElements = function(){
    if(this.data.td){
        if(this.data.td == 3){
            this.layerElement = document.createElementNS(svgNS,'mask');
            this.layerElement.setAttribute('id',this.layerId);
            this.layerElement.setAttribute('mask-type','luminance');
            this.globalData.defs.appendChild(this.layerElement);
        }else if(this.data.td == 2){
            var maskGroup = document.createElementNS(svgNS,'mask');
            maskGroup.setAttribute('id',this.layerId);
            maskGroup.setAttribute('mask-type','alpha');
            var maskGrouper = document.createElementNS(svgNS,'g');
            maskGroup.appendChild(maskGrouper);
            this.layerElement = document.createElementNS(svgNS,'g');
            var fil = document.createElementNS(svgNS,'filter');
            var filId = randomString(10);
            fil.setAttribute('id',filId);
            fil.setAttribute('filterUnits','objectBoundingBox');
            fil.setAttribute('x','0%');
            fil.setAttribute('y','0%');
            fil.setAttribute('width','100%');
            fil.setAttribute('height','100%');
            var feCTr = document.createElementNS(svgNS,'feComponentTransfer');
            feCTr.setAttribute('in','SourceGraphic');
            fil.appendChild(feCTr);
            var feFunc = document.createElementNS(svgNS,'feFuncA');
            feFunc.setAttribute('type','table');
            feFunc.setAttribute('tableValues','1.0 0.0');
            feCTr.appendChild(feFunc);
            this.globalData.defs.appendChild(fil);
            var alphaRect = document.createElementNS(svgNS,'rect');
            alphaRect.setAttribute('width','100%');
            alphaRect.setAttribute('height','100%');
            alphaRect.setAttribute('x','0');
            alphaRect.setAttribute('y','0');
            alphaRect.setAttribute('fill','#ffffff');
            alphaRect.setAttribute('opacity','0');
            maskGrouper.setAttribute('filter','url(#'+filId+')');
            maskGrouper.appendChild(alphaRect);
            maskGrouper.appendChild(this.layerElement);
            this.globalData.defs.appendChild(maskGroup);
        }else{
            this.layerElement = document.createElementNS(svgNS,'mask');
            this.layerElement.setAttribute('id',this.layerId);
            this.layerElement.setAttribute('mask-type','alpha');
            this.globalData.defs.appendChild(this.layerElement);
        }
        if(this.data.hasMask){
            this.maskedElement = this.layerElement;
        }
    }else if(this.data.hasMask){
        this.layerElement = document.createElementNS(svgNS,'g');
        if(this.data.tt){
            this.matteElement = document.createElementNS(svgNS,'g');
            this.matteElement.appendChild(this.layerElement);
            this.parentContainer.appendChild(this.matteElement);
        }else{
            this.parentContainer.appendChild(this.layerElement);
        }
        this.maskedElement = this.layerElement;
    }else if(this.data.tt){
        this.matteElement = document.createElementNS(svgNS,'g');
        this.matteElement.setAttribute('id',this.layerId);
        this.parentContainer.appendChild(this.matteElement);
        this.layerElement = this.matteElement;
    }else{
        this.layerElement = this.parentContainer;
    }
};

BaseElement.prototype.prepareFrame = function(num){
    this.currentAnimData = this.data.renderedData[num].an;
    var mat = this.currentAnimData.matrixArray;
    this.ownMatrix.reset().transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5]).translate(-this.currentAnimData.tr.a[0],-this.currentAnimData.tr.a[1]);
};

BaseElement.prototype.renderFrame = function(num,parentTransform){
    if(this.data.type == 'NullLayer'){
        return;
    }
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
       // this.effectsManager.renderFrame(num,this.currentAnimData.mk);
    }

    if(num === this.data.renderedFrame.num){
        return this.isVisible;
    }

    if(this.data.hasMask){
        this.maskManager.renderFrame(num);
    }
    this.finalTransform.opacity *= this.currentAnimData.tr.o;

    var mat;
    var finalMat = this.finalTransform.mat;

    if(parentTransform){
        mat = parentTransform.mat.props;
        finalMat.reset().transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5]);
        this.finalTransform.opacity *= parentTransform.opacity;
    }

    if(this.hierarchy){
        var i, len = this.hierarchy.length;
        if(!parentTransform){
            finalMat.reset();
        }
        for(i=len-1;i>=0;i-=1){
            mat = this.hierarchy[i].ownMatrix.props;
            finalMat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5]);
        }
        mat = this.ownMatrix.props;
        finalMat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5]);
    }else{
        if(this.isVisible){
            if(!parentTransform){
                this.finalTransform.mat.props[0] = this.ownMatrix.props[0];
                this.finalTransform.mat.props[1] = this.ownMatrix.props[1];
                this.finalTransform.mat.props[2] = this.ownMatrix.props[2];
                this.finalTransform.mat.props[3] = this.ownMatrix.props[3];
                this.finalTransform.mat.props[4] = this.ownMatrix.props[4];
                this.finalTransform.mat.props[5] = this.ownMatrix.props[5];
            }else{
                mat = this.ownMatrix.props;
                finalMat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5]);
            }
        }
    }
    if(this.data.hasMask){
        if(!this.renderedFrames[this.globalData.frameNum]){
            this.renderedFrames[this.globalData.frameNum] = {
                tr:'matrix('+finalMat.props.join(',')+')',
                o:this.finalTransform.opacity
            };
        }
        var renderedFrameData = this.renderedFrames[this.globalData.frameNum];
        if(this.lastData.tr != renderedFrameData.tr){
            this.lastData.tr = renderedFrameData.tr;
            this.layerElement.setAttribute('transform',renderedFrameData.tr);
        }
        if(this.lastData.o !== renderedFrameData.o){
            this.lastData.o = renderedFrameData.o;
            this.layerElement.setAttribute('opacity',renderedFrameData.o);
        }
    }

    return this.isVisible;
};

BaseElement.prototype.getDomElement = function(){
    return this.layerElement;
};
BaseElement.prototype.getMaskManager = function(){
    return this.maskManager;
};
BaseElement.prototype.addMasks = function(data){
    //this.maskManager = createElement(MaskElement,null,params);
    this.maskManager = new MaskElement(data,this,this.globalData);
    this.maskManager.init();
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

BaseElement.prototype.getHierarchy = function(){
    if(!this.hierarchy){
        this.hierarchy = [];
    }
    return this.hierarchy;
};

BaseElement.prototype.setMatte = function(id){
    this.matteElement.setAttribute("mask", "url(#" + id + ")");
};

BaseElement.prototype.hide = function(){

};
