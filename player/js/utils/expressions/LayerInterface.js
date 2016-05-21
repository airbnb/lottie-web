function LayerInterface(){}

LayerInterface.prototype.toWorld = function(arr) {
    var finalMat = new Matrix();
    this.finalTransform.mProp.applyToMatrix(finalMat);
    if(this.hierarchy && this.hierarchy.length){
        var i, len = this.hierarchy.length;
        for(i=0;i<len;i+=1){
            this.hierarchy[i].finalTransform.mProp.applyToMatrix(finalMat);
        }
        return finalMat.applyToPointArray(arr[0],arr[1],arr[2]||0);
    }
    return finalMat.applyToPointArray(arr[0],arr[1],arr[2]||0);
};

LayerInterface.prototype.effect = function(num) {
    console.log(this);
    console.log(this.effectsManager);
    console.log(num);
}