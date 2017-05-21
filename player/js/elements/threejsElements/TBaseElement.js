function TBaseElement(data,parentContainer,globalData,comp, placeholder){
    this.globalData = globalData;
    this.elementType = 'three';
    this.comp = comp;
    this.data = data;
    this.matteElement = null;
    this.parentContainer = parentContainer;
    this.layerId = placeholder ? placeholder.layerId : 'ly_'+randomString(10);
    this.placeholder = placeholder;
    this.init();
};

createElement(BaseElement, TBaseElement);
TBaseElement.prototype.checkBlendMode = function(){

};
TBaseElement.prototype.setBlendMode = BaseElement.prototype.setBlendMode;


TBaseElement.prototype.getBaseElement = function(){
    return this.baseElement;
};

TBaseElement.prototype.createElements = function(){
    if(this.data.hasMask){
        this.layerElement = document.createElementNS(svgNS,'svg');
        styleDiv(this.layerElement);
        //this.appendNodeToParent(this.layerElement);
        this.baseElement = this.layerElement;
        this.maskedElement = this.layerElement;
    }else{
        this.layerElement = this.parentContainer;
    }
    this.transformedElement = this.layerElement;
    if(this.data.ln && (this.data.ty === 4 || this.data.ty === 0)){
        if(this.layerElement === this.parentContainer){
            this.layerElement = document.createElementNS(svgNS,'g');
            //this.appendNodeToParent(this.layerElement);
            this.baseElement = this.layerElement;
        }
        this.layerElement.setAttribute('id',this.data.ln);
    }
    this.setBlendMode();
    if(this.layerElement !== this.parentContainer){
        this.placeholder = null;
    }
    this.checkParenting();
};

TBaseElement.prototype.renderFrame = function(parentTransform){
    if(this.data.ty === 3){
        return false;
    }

    if(this.currentFrameNum === this.lastNum || !this.isVisible){
        return this.isVisible;
    }
    this.lastNum = this.currentFrameNum;

    this.finalTransform.opMdf = this.finalTransform.op.mdf;
    this.finalTransform.matMdf = this.finalTransform.mProp.mdf;
    this.finalTransform.opacity = this.finalTransform.op.v;
    if(this.firstFrame){
        this.finalTransform.opMdf = true;
        this.finalTransform.matMdf = true;
    }

    var mat;
    var finalMat = this.finalTransform.mat;

    if(this.hierarchy){
        var i, len = this.hierarchy.length;

        mat = this.finalTransform.mProp.v.props;
        finalMat.cloneFromProps(mat);
        for(i=0;i<len;i+=1){
            this.finalTransform.matMdf = this.hierarchy[i].finalTransform.mProp.mdf ? true : this.finalTransform.matMdf;
            mat = this.hierarchy[i].finalTransform.mProp.v.props;
            finalMat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5],mat[6],mat[7],mat[8],mat[9],mat[10],mat[11],mat[12],mat[13],mat[14],mat[15]);
        }
    }else{
        if(this.isVisible && this.finalTransform.matMdf){
            if(!parentTransform){
                finalMat.cloneFromProps(this.finalTransform.mProp.v.props);
            }else{
                mat = this.finalTransform.mProp.v.props;
                finalMat.cloneFromProps(mat);
            }
        }
    }
    if(this.data.hasMask){
        this.maskManager.renderFrame(finalMat);
    }

    if(parentTransform){
        mat = parentTransform.mat.props;
        finalMat.cloneFromProps(mat);
        this.finalTransform.opacity *= parentTransform.opacity;
        this.finalTransform.opMdf = parentTransform.opMdf ? true : this.finalTransform.opMdf;
        this.finalTransform.matMdf = parentTransform.matMdf ? true : this.finalTransform.matMdf
    }

    if(this.finalTransform.matMdf){
        var threeFinalMat = new Matrix();
        threeFinalMat.translate(-this.globalData.compSize.w/2,-this.globalData.compSize.h/2,0);
        mat = finalMat.props;
        threeFinalMat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5],mat[6],mat[7],mat[8],mat[9],mat[10],mat[11],mat[12],mat[13],mat[14],mat[15]);
        this.finalMat = finalMat;
    }
    if(this.finalTransform.opMdf){
        //this.transformedElement.style.opacity = this.finalTransform.opacity;
    }
    return this.isVisible;
};

TBaseElement.prototype.destroy = function(){
    this.layerElement = null;
    this.transformedElement = null;
    this.parentContainer = null;
    if(this.matteElement) {
        this.matteElement = null;
    }
    if(this.maskManager) {
        this.maskManager.destroy();
        this.maskManager = null;
    }
};

TBaseElement.prototype.getDomElement = function(){
    return this.layerElement;
};
TBaseElement.prototype.addMasks = function(data){
    this.maskManager = new MaskElement(data,this,this.globalData);
};

TBaseElement.prototype.hide = function(){
};

TBaseElement.prototype.addMasks = function(data){
    this.maskManager = new TMaskElement(data,this,this.globalData);
};

TBaseElement.prototype.setMatte = function(){

}

TBaseElement.prototype.buildElementParenting = ThreejsRenderer.prototype.buildElementParenting;