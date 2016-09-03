function CVBaseElement(data, comp,globalData){
    this.globalData = globalData;
    this.data = data;
    this.comp = comp;
    this.canvasContext = globalData.canvasContext;
    this.init();
}

createElement(BaseElement, CVBaseElement);

CVBaseElement.prototype.createElements = function(){
    this.checkParenting();
};

CVBaseElement.prototype.checkBlendMode = function(globalData){
    if(globalData.blendMode !== this.data.bm) {
        globalData.blendMode = this.data.bm;

        var blendModeValue = '';
        switch (this.data.bm) {
            case 0:
                blendModeValue = 'normal';
                break;
            case 1:
                blendModeValue = 'multiply';
                break;
            case 2:
                blendModeValue = 'screen';
                break;
            case 3:
                blendModeValue = 'overlay';
                break;
            case 4:
                blendModeValue = 'darken';
                break;
            case 5:
                blendModeValue = 'lighten';
                break;
            case 6:
                blendModeValue = 'color-dodge';
                break;
            case 7:
                blendModeValue = 'color-burn';
                break;
            case 8:
                blendModeValue = 'hard-light';
                break;
            case 9:
                blendModeValue = 'soft-light';
                break;
            case 10:
                blendModeValue = 'difference';
                break;
            case 11:
                blendModeValue = 'exclusion';
                break;
            case 12:
                blendModeValue = 'hue';
                break;
            case 13:
                blendModeValue = 'saturation';
                break;
            case 14:
                blendModeValue = 'color';
                break;
            case 15:
                blendModeValue = 'luminosity';
                break;
        }
        globalData.canvasContext.globalCompositeOperation = blendModeValue;
    }
};


CVBaseElement.prototype.renderFrame = function(parentTransform){
    if(this.data.ty === 3){
        return false;
    }
        this.checkBlendMode(this.data.ty === 0?this.parentGlobalData:this.globalData);

    if(!this.isVisible){
        return this.isVisible;
    }
    this.finalTransform.opMdf = this.finalTransform.op.mdf;
    this.finalTransform.matMdf = this.finalTransform.mProp.mdf;
    this.finalTransform.opacity = this.finalTransform.op.v;

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
        if(!parentTransform){
            finalMat.cloneFromProps(this.finalTransform.mProp.v.props);
        }else{
            mat = this.finalTransform.mProp.v.props;
            finalMat.cloneFromProps(mat);
        }
    }

    if(parentTransform){
        mat = parentTransform.mat.props;
        finalMat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5],mat[6],mat[7],mat[8],mat[9],mat[10],mat[11],mat[12],mat[13],mat[14],mat[15]);
        this.finalTransform.opacity *= parentTransform.opacity;
        this.finalTransform.opMdf = parentTransform.opMdf ? true : this.finalTransform.opMdf;
        this.finalTransform.matMdf = parentTransform.matMdf ? true : this.finalTransform.matMdf
    }

    if(this.data.hasMask){
        this.globalData.renderer.save(true);
        this.maskManager.renderFrame(this.data.ty === 0?null:finalMat);
    }
    if(this.data.hd){
        this.isVisible = false;
    }
    return this.isVisible;

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

CVBaseElement.prototype.mHelper = new Matrix();
