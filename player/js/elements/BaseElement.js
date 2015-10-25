var BaseElement = function (data,parentContainer,globalData, placeholder){
    this.globalData = globalData;
    this.data = data;
    this.dynamicProperties = [];

    this.finalTransform = {
        op: PropertyFactory.getProp(this.data,this.data.ks.o,0,0.01,this.dynamicProperties),
        mProp: PropertyFactory.getProp(this.data,this.data.ks,2,null,this.dynamicProperties),
        matMdf: false,
        opMdf: false,
        mat: new Matrix(),
        opacity: 1
    };
    this.matteElement = null;
    this.lastData = {};
    this.renderedFrames = [];
    this.parentContainer = parentContainer;
    this.layerId = placeholder ? placeholder.layerId : 'ly_'+randomString(10);
    this.hidden = false;
    this.firstFrame = true;
    this.placeholder = placeholder;
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

BaseElement.prototype.appendNodeToParent = function(node) {
    if(this.placeholder){
        var g = this.placeholder.phElement;
        g.parentNode.insertBefore(node, g);
        //g.parentNode.removeChild(g);
    }else{
        this.parentContainer.appendChild(node);
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
            this.layerElement = document.createElementNS(svgNS,'g');
            var masker = document.createElementNS(svgNS,'mask');
            masker.setAttribute('id',this.layerId);
            masker.setAttribute('mask-type','alpha');
            masker.appendChild(this.layerElement);
            this.globalData.defs.appendChild(masker);
        }
        if(this.data.hasMask){
            this.maskedElement = this.layerElement;
        }
    }else if(this.data.hasMask){
        this.layerElement = document.createElementNS(svgNS,'g');
        if(this.data.tt){
            this.matteElement = document.createElementNS(svgNS,'g');
            this.matteElement.appendChild(this.layerElement);
            this.appendNodeToParent(this.matteElement);
        }else{
            this.appendNodeToParent(this.layerElement);
        }
        this.maskedElement = this.layerElement;
    }else if(this.data.tt){
        this.matteElement = document.createElementNS(svgNS,'g');
        this.matteElement.setAttribute('id',this.layerId);
        this.appendNodeToParent(this.matteElement);
        this.layerElement = this.matteElement;
    }else{
        this.layerElement = this.parentContainer;
    }
};

BaseElement.prototype.prepareFrame = function(num){
    if(!this.data.renderedData[num]){
        return;
    }
    var i, len = this.dynamicProperties.length;
    for(i=0;i<len;i+=1){
        this.dynamicProperties[i].getInterpolatedValue(num);
    }
    this.currentAnimData = this.data.renderedData[num].an;
    if(this.data.hasMask){
        this.maskManager.prepareFrame(num);
    }
};

BaseElement.prototype.renderFrame = function(num,parentTransform){
    if(!this.data.renderedData[num] || this.data.ty === 3){
        return false;
    }
    if(this.data.ip - this.data.st <= num && this.data.op - this.data.st > num)
    {
        if(this.isVisible !== true){
            this.isVisible = true;
        }
    }else{
        if(this.isVisible !== false){
            this.isVisible = false;
        }
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
    this.finalTransform.opMdf = this.finalTransform.op.mdf;
    this.finalTransform.matMdf = this.finalTransform.mProp.mdf;
    this.finalTransform.opacity = this.finalTransform.op.v;
    if(this.firstFrame){
        this.finalTransform.opMdf = true;
        this.finalTransform.matMdf = true;
        this.firstFrame = false;
    }

    var mat;
    var finalMat = this.finalTransform.mat;

    if(parentTransform){
        mat = parentTransform.mat.props;
        finalMat.reset().transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5]);
        this.finalTransform.opacity *= parentTransform.opacity;
        this.finalTransform.opMdf = parentTransform.opMdf ? true : this.finalTransform.opMdf;
        this.finalTransform.matMdf = parentTransform.matMdf ? true : this.finalTransform.matMdf
    }

    if(this.hierarchy){
        var i, len = this.hierarchy.length;
        if(!parentTransform){
            finalMat.reset();
        }
        for(i=len-1;i>=0;i-=1){
            this.finalTransform.matMdf = this.hierarchy[i].finalTransform.mProp.mdf ? true : this.finalTransform.matMdf;
            mat = this.hierarchy[i].finalTransform.mProp.v.props;
            finalMat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5]);
        }
        mat = this.finalTransform.mProp.v.props;
        finalMat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5]);
    }else{
        if(this.isVisible){
            if(!parentTransform){
                finalMat.props[0] = this.finalTransform.mProp.v.props[0];
                finalMat.props[1] = this.finalTransform.mProp.v.props[1];
                finalMat.props[2] = this.finalTransform.mProp.v.props[2];
                finalMat.props[3] = this.finalTransform.mProp.v.props[3];
                finalMat.props[4] = this.finalTransform.mProp.v.props[4];
                finalMat.props[5] = this.finalTransform.mProp.v.props[5];
            }else{
                mat = this.finalTransform.mProp.v.props;
                finalMat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5]);
            }
        }
    }
    if(this.data.hasMask){
        if(this.finalTransform.matMdf){
            this.layerElement.setAttribute('transform','matrix('+finalMat.props.join(',')+')');
        }
        if(this.finalTransform.opMdf){
            this.layerElement.setAttribute('opacity',this.finalTransform.opacity);
        }
    }

    return this.isVisible;
};

BaseElement.prototype.destroy = function(){
    this.layerElement = null;
    this.parentContainer = null;
    if(this.matteElement) {
        this.matteElement = null;
    }
    if(this.maskManager) {
        this.maskManager.destroy();
    }
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
    if(this.data.ty === 5){
        return {w:this.data.textData.width,h:this.data.textData.height};
    }else{
        return {w:this.data.width,h:this.data.height};
    }
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

BaseElement.prototype.setMatte = function(id){
    if(!this.matteElement){
        return;
    }
    this.matteElement.setAttribute("mask", "url(#" + id + ")");
};

BaseElement.prototype.hide = function(){

};
