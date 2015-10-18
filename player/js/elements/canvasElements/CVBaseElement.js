function CVBaseElement(data,globalData){
    this.data = data;
    this.globalData = globalData;
    this.canvasContext = globalData.canvasContext;
    this.currentAnimData = null;
    this.renderFrame = false;
    this.ownMatrix = new Matrix();
    this.finalTransform = {
        mat: new Matrix(),
        opacity: 1
    };
    this.init();
}

CVBaseElement.prototype.init = function(){
    this.createElements();
    if(this.data.hasMask){
        this.addMasks(this.data);
    }
    if(this.data.eff){
        //this.createEffectsManager(this.data);
    }
};

CVBaseElement.prototype.createElements = function(){

};

CVBaseElement.prototype.prepareFrame = function(num){
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
};

CVBaseElement.prototype.draw = function(parentTransform){
    if(this.data.ty === 3){
        return;
    }
    if(!this.renderFrame){
        return false;
    }
    var ctx = this.canvasContext;
    ////

    var mat, finalMat = this.finalTransform.mat;

    this.finalTransform.opacity *= this.currentAnimData.o;

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
        if(this.renderFrame){
            if(!parentTransform){
                this.finalTransform.mat = this.ownMatrix;
            }else{
                mat = this.ownMatrix.props;
                finalMat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5]);
            }
        }
        }

    ////
    if(this.data.hasMask){
        this.globalData.renderer.save(true);
        this.maskManager.draw(this.finalTransform);
    }

};

CVBaseElement.prototype.getCurrentAnimData = function(){
    return this.currentAnimData;
};
CVBaseElement.prototype.addMasks = function(data){
    var params = {
        'data':{value:data},
        'element':{value:this},
        'globalData':{value:this.globalData}
    };
    this.maskManager = createElement(CVMaskElement,null,params);
};
CVBaseElement.prototype.createEffectsManager = function(data){
    var params = {
        'effects':{value:data.eff},
        'element':{value:this}
    };
    this.effectsManager = createElement(EffectsManager,null,params);
};
CVBaseElement.prototype.getType = function(){
    return this.type;
};

CVBaseElement.prototype.resetHierarchy = function(){
    if(!this.hierarchy){
        this.hierarchy = [];
    }else{
        this.hierarchy.length = 0;
    }
};

CVBaseElement.prototype.getHierarchy = function(){
    if(!this.hierarchy){
        this.hierarchy = [];
    }
    return this.hierarchy;
};

CVBaseElement.prototype.getLayerSize = function(){
    if(this.data.ty === 5){
        return {w:this.data.textData.width,h:this.data.textData.height};
    }else{
        return {w:this.data.width,h:this.data.height};
    }
};


CVBaseElement.prototype.destroy = function(){
    this.canvasContext = null;
    this.data = null;
    this.globalData = null;
    if(this.maskManager) {
        this.maskManager.destroy();
    }
};

