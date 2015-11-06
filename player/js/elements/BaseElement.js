function BaseElement(){
};

BaseElement.prototype.prepareFrame = function(num){
    if(this.data.ip - this.data.st <= num && this.data.op - this.data.st > num)
    {
        if(this.isVisible !== true){
            this.isVisible = true;
            this.firstFrame = true;
            if(this.data.hasMask){
                this.maskManager.firstFrame = true;
            }
        }
    }else{
        if(this.isVisible !== false){
            this.isVisible = false;
        }
    }
    var i, len = this.dynamicProperties.length;
    for(i=0;i<len;i+=1){
        this.dynamicProperties[i].getInterpolatedValue(num);
    }
    if(this.data.hasMask){
        this.maskManager.prepareFrame(num);
    }
    this.currentFrameNum = num;
};

BaseElement.prototype.init = function(){
    this.hidden = false;
    this.firstFrame = true;
    this.isVisible = false;
    this.dynamicProperties = [];
    this.currentFrameNum = -99999;
    this.lastNum = -99999;

    this.finalTransform = {
        op: PropertyFactory.getProp(this.data,this.data.ks.o,0,0.01,this.dynamicProperties),
        mProp: PropertyFactory.getProp(this.data,this.data.ks,2,null,this.dynamicProperties),
        matMdf: false,
        opMdf: false,
        mat: new Matrix(),
        opacity: 1
    };
    this.createElements();
    if(this.data.hasMask){
        this.addMasks(this.data);
    }
};
BaseElement.prototype.getType = function(){
    return this.type;
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

BaseElement.prototype.getLayerSize = function(){
    if(this.data.ty === 5){
        return {w:this.data.textData.width,h:this.data.textData.height};
    }else{
        return {w:this.data.width,h:this.data.height};
    }
};