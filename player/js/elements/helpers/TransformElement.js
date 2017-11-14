function TransformElement(){}

TransformElement.prototype.initTransform = function(){
	//TODO remove this condition to maitain transform map
    if(this.data.ks){
        this.finalTransform = {
            mProp: TransformPropertyFactory.getTransformProperty(this,this.data.ks,this.dynamicProperties),
            matMdf: false,
            opMdf: false,
            mat: new Matrix(),
            opacity: 1
        };
        if(this.data.ao){
            this.finalTransform.mProp.autoOriented = true;
        }
        this.finalTransform.op = this.finalTransform.mProp.o;
        this.transform = this.finalTransform.mProp;

        //TODO: check TYPE 11
        if(this.data.ty !== 11){
            //this.createElements();
        }
        if(this.data.hasMask){
            this.addMasks(this.data);
        }

        this.finalMat = new Matrix();
    }
}

TransformElement.prototype.renderTransform = function(){

	var mat;
    var finalMat = this.finalTransform.mat;

	this.finalTransform.opMdf = this.firstFrame || this.finalTransform.op.mdf;
    this.finalTransform.matMdf = this.firstFrame || this.finalTransform.mProp.mdf;
    this.finalTransform.opacity = this.finalTransform.op.v;

    if(this.hierarchy){
        var i = 0, len = this.hierarchy.length;
        if(!this.finalTransform.matMdf) {
            while(i < len) {
                if(this.hierarchy[i].finalTransform.mProp.mdf) {
                    this.finalTransform.matMdf = true;
                    break;
                }
                i += 1;
            }
        }
        
        if(this.finalTransform.matMdf) {
            mat = this.finalTransform.mProp.v.props;
            finalMat.cloneFromProps(mat);
            for(i=0;i<len;i+=1){
                mat = this.hierarchy[i].finalTransform.mProp.v.props;
                finalMat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5],mat[6],mat[7],mat[8],mat[9],mat[10],mat[11],mat[12],mat[13],mat[14],mat[15]);
            }
        }
        
    }else if(this.isVisible){
        finalMat = this.finalTransform.mProp.v;
    }

    this.finalMat = finalMat;
}