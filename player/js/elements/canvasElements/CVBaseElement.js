function CVBaseElement(data,globalData){
    this.globalData = globalData;
    this.data = data;
    this.canvasContext = globalData.canvasContext;
    this.init();
}

createElement(BaseElement, CVBaseElement);

CVBaseElement.prototype.createElements = function(){

};

/*CVBaseElement.prototype.prepareFrame = function(num){
    if(!this.data.renderedData[num]){
        return false;
    }
    this.currentAnimData = this.data.renderedData[num].an;
    var mat = this.currentAnimData.m;
    this.ownMatrix.reset().transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5]).translate(-this.currentAnimData.a[0],-this.currentAnimData.a[1]);
    if(this.data.ip - this.data.st <= num && this.data.op - this.data.st >= num)
    {
        this.renderFrame = true;
        this.finalTransform.opacity = 1;
    }else{
        this.renderFrame = false;
        this.finalTransform.opacity = 0;
        return false;
    }

    if(this.data.hasMask){
        this.maskManager.prepareFrame(num);
    }
};*/

CVBaseElement.prototype.renderFrame = function(parentTransform){
    if(this.data.ty === 3){
        return false;
    }

    if(!this.isVisible){
        return this.isVisible;
    }
    this.finalTransform.opMdf = this.finalTransform.op.mdf;
    this.finalTransform.matMdf = this.finalTransform.mProp.mdf;
    this.finalTransform.opacity = this.finalTransform.op.v;
    if(this.firstFrame && this.isVisible){
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
    if(this.data.hasMask){
        this.globalData.renderer.save(true);
        this.maskManager.renderFrame(finalMat);
    }
    return this.isVisible;

};

CVBaseElement.prototype.getCurrentAnimData = function(){
    return this.currentAnimData;
};
CVBaseElement.prototype.addMasks = function(data){
    this.maskManager = new CVMaskElement(data,this,this.globalData);
};


CVBaseElement.prototype.destroy = function(){
    this.canvasContext = null;
    this.data = null;
    this.globalData = null;
    if(this.maskManager) {
        this.maskManager.destroy();
    }
};

