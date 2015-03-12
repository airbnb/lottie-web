function CVBaseElement(data,renderer){
    this.renderer = renderer;
    this.data = data;
    this.currentAnimData = null;
    this.init();
};

CVBaseElement.prototype.init = function(){
    this.createElements();
    if(this.data.hasMask){
        this.addMasks(this.data);
    }
    if(this.data.eff){
        this.createEffectsManager(this.data);
    }
};

CVBaseElement.prototype.createElements = function(){

};

CVBaseElement.prototype.prepareFrame = function(num){
    this.currentAnimData = this.data.an[this.data.an[num].forwardFrame];
};

CVBaseElement.prototype.initDraw = function(){
    this.renderer.canvasContext.save();

};

CVBaseElement.prototype.draw = function(){
    var ctx = this.renderer.canvasContext;
    /*console.log('this.data.layerName: ',this.data.layerName);
    console.log('this.data.width: ',this.data.width);
    console.log('this.data.height: ',this.data.height);*/
    //ctx.translate(-this.data.width/2,-this.data.height/2);
    if(this.data.parentHierarchy){
        var i, len = this.data.parentHierarchy.length, animData;
        for(i = len - 1; i>=0 ; i -= 1){
            animData = this.data.parentHierarchy[0].element.getCurrentAnimData();
            ctx.translate(animData.tr.a[0],animData.tr.a[1]);
            var matrixValue = animData.matrixArray;
            ctx.transform(matrixValue[0], matrixValue[1], matrixValue[2], matrixValue[3], matrixValue[4], matrixValue[5]);
            ctx.translate(-animData.tr.a[0],-animData.tr.a[1]);
        }
    }

     ctx.translate(this.currentAnimData.tr.a[0],this.currentAnimData.tr.a[1]);
    var matrixValue = this.currentAnimData.matrixArray;
     ctx.transform(matrixValue[0], matrixValue[1], matrixValue[2], matrixValue[3], matrixValue[4], matrixValue[5]);
     ctx.translate(-this.currentAnimData.tr.a[0],-this.currentAnimData.tr.a[1]);

};

CVBaseElement.prototype.endDraw = function(){
    this.renderer.canvasContext.restore();

};

CVBaseElement.prototype.getCurrentAnimData = function(){
    return this.currentAnimData;
};
CVBaseElement.prototype.addMasks = function(data){
    var params = {
        'data':{value:data},
        'element':{value:this}
    };
    this.maskManager = createElement(MaskElement,null,params);
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

CVBaseElement.prototype.getLayerSize = function(){
    if(this.data.type == 'TextLayer'){
        return {w:this.data.textData.width,h:this.data.textData.height};
    }else{
        return {w:this.data.width,h:this.data.height};
    }
};

