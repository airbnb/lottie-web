function LayerInterface(){}

LayerInterface.prototype.toWorld = function(arr) {
    if(this.hierarchy && this.hierarchy.length){
        var finalMat = new Matrix();
        var i, len = this.hierarchy.length;
        this.finalTransform.mProp.applyToMatrix(finalMat,false);
        for(i=0;i<len;i+=1){
            this.hierarchy[i].finalTransform.mProp.applyToMatrix(finalMat,true);
        }
        var retArr = finalMat.applyToPointArray(arr[0],arr[1],arr[2]||0);
        return retArr;
    }
    return arr;
};

LayerInterface.prototype.effect = function(num) {
    console.log(this.effectsManager);
    console.log(num);
}