function HBaseElement(data,parentContainer,globalData,comp, placeholder){
    this.globalData = globalData;
    this.comp = comp;
    this.data = data;
    this.matteElement = null;
    this.parentContainer = parentContainer;
    this.layerId = placeholder ? placeholder.layerId : 'ly_'+randomString(10);
    this.placeholder = placeholder;
    this.init();
};

createElement(BaseElement, HBaseElement);

HBaseElement.prototype.appendNodeToParent = function(node) {
    if(this.placeholder){
        var g = this.placeholder.phElement;
        g.parentNode.insertBefore(node, g);
        //g.parentNode.removeChild(g);
    }else{
        this.parentContainer.appendChild(node);
    }
};

HBaseElement.prototype.createElements = function(){
    if(this.data.hasMask){
        this.layerElement = document.createElementNS(svgNS,'svg');
        this.appendNodeToParent(this.layerElement);
        this.maskedElement = this.layerElement;
    }else{
        this.layerElement = this.parentContainer;
    }
    if(this.data.ln && (this.data.ty === 4 || this.data.ty === 0)){
        if(this.layerElement === this.parentContainer){
            this.layerElement = document.createElementNS(svgNS,'g');
            this.appendNodeToParent(this.layerElement);
        }
        this.layerElement.setAttribute('id',this.data.ln);
    }
    if(this.layerElement !== this.parentContainer){
        this.placeholder = null;
    }
};

HBaseElement.prototype.renderFrame = function(parentTransform){
    if(this.data.ty === 3){
        return false;
    }

    if(this.currentFrameNum === this.lastNum || !this.isVisible){
        return this.isVisible;
    }
    this.lastNum = this.currentFrameNum;

    if(this.data.hasMask){
        this.maskManager.renderFrame();
    }
    this.finalTransform.opMdf = this.finalTransform.op.mdf;
    this.finalTransform.matMdf = this.finalTransform.mProp.mdf;
    this.finalTransform.opacity = this.finalTransform.op.v;
    if(this.firstFrame){
        this.finalTransform.opMdf = true;
        this.finalTransform.matMdf = true;
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
    this.layerElement.style.transform = 'matrix3d('+finalMat.props[0]+','+finalMat.props[1]+',0,0, '+finalMat.props[2]+','+finalMat.props[3]+',0,0, 0,0,1,0, '+finalMat.props[4]+','+finalMat.props[5]+',0,1)';
    this.layerElement.style.opacity = this.finalTransform.opacity;
    return this.isVisible;
};

HBaseElement.prototype.destroy = function(){
    this.layerElement = null;
    this.parentContainer = null;
    if(this.matteElement) {
        this.matteElement = null;
    }
    if(this.maskManager) {
        this.maskManager.destroy();
    }
};

HBaseElement.prototype.getDomElement = function(){
    return this.layerElement;
};
HBaseElement.prototype.addMasks = function(data){
    this.maskManager = new MaskElement(data,this,this.globalData);
};

HBaseElement.prototype.hide = function(){

};
