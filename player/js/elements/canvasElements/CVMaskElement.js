
function CVMaskElement(data,element){
    this.data = data;
    this.element = element;
    this.dynamicProperties = [];
    this.masksProperties = this.data.masksProperties;
    this.viewData = Array.apply(null,{length:this.masksProperties.length});
    var i, len = this.masksProperties.length;
    for (i = 0; i < len; i++) {
        this.viewData[i] = ShapePropertyFactory.getShapeProp(this.element,this.masksProperties[i],3,this.dynamicProperties,null);
    }
}

CVMaskElement.prototype.prepareFrame = function(num){
    var i, len = this.dynamicProperties.length;
    for(i=0;i<len;i+=1){
        this.dynamicProperties[i].getValue(num);
        if(this.dynamicProperties[i].mdf){
            this.element.globalData.mdf = true;
        }
    }
};

CVMaskElement.prototype.renderFrame = function (transform) {
    var ctx = this.element.canvasContext;
    var i, len = this.data.masksProperties.length;
    var pt,pt2,pt3,data, hasMasks = false;
    for (i = 0; i < len; i++) {
        if(this.masksProperties[i].mode === 'n'){
            continue;
        }
        if(hasMasks === false){
            ctx.beginPath();
            hasMasks = true;
        }
        if (this.masksProperties[i].inv) {
            ctx.moveTo(0, 0);
            ctx.lineTo(this.element.globalData.compWidth, 0);
            ctx.lineTo(this.element.globalData.compWidth, this.element.globalData.compHeight);
            ctx.lineTo(0, this.element.globalData.compHeight);
            ctx.lineTo(0, 0);
        }
        data = this.viewData[i].v;
        pt = transform ? transform.applyToPointArray(data.v[0][0],data.v[0][1],0):data.v[0];
        ctx.moveTo(pt[0], pt[1]);
        var j, jLen = data._length;
        for (j = 1; j < jLen; j++) {
            pt = transform ? transform.applyToPointArray(data.o[j - 1][0],data.o[j - 1][1],0) : data.o[j - 1];
            pt2 = transform ? transform.applyToPointArray(data.i[j][0],data.i[j][1],0) : data.i[j];
            pt3 = transform ? transform.applyToPointArray(data.v[j][0],data.v[j][1],0) : data.v[j];
            ctx.bezierCurveTo(pt[0], pt[1], pt2[0], pt2[1], pt3[0], pt3[1]);
        }
        pt = transform ? transform.applyToPointArray(data.o[j - 1][0],data.o[j - 1][1],0) : data.o[j - 1];
        pt2 = transform ? transform.applyToPointArray(data.i[0][0],data.i[0][1],0) : data.i[0];
        pt3 = transform ? transform.applyToPointArray(data.v[0][0],data.v[0][1],0) : data.v[0];
        ctx.bezierCurveTo(pt[0], pt[1], pt2[0], pt2[1], pt3[0], pt3[1]);
    }
    if(hasMasks){
        ctx.clip();
    }
};

CVMaskElement.prototype.getMaskProperty = MaskElement.prototype.getMaskProperty;

CVMaskElement.prototype.destroy = function(){
    this.element = null;
};