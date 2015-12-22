function HCameraElement(data,parentContainer,globalData,comp, placeholder){
    this.parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
    this.pe = PropertyFactory.getProp(this,data.pe,0,0,this.dynamicProperties);
    if(data.ks.p.s){
        this.px = PropertyFactory.getProp(this,data.ks.p.x,1,0,this.dynamicProperties);
        this.py = PropertyFactory.getProp(this,data.ks.p.y,1,0,this.dynamicProperties);
        this.pz = PropertyFactory.getProp(this,data.ks.p.z,1,0,this.dynamicProperties);
    }else{
        this.p = PropertyFactory.getProp(this,data.ks.p,1,0,this.dynamicProperties);
    }
    if(data.ks.or.k.length){
        var i,len = data.ks.or.k.length;
        for(i=0;i<len;i+=1){
            data.ks.or.k[i].to = null;
            data.ks.or.k[i].ti = null;
        }
    }
    this.or = PropertyFactory.getProp(this,data.ks.or,1,degToRads,this.dynamicProperties);
    this.or.sh = true;
    this.rx = PropertyFactory.getProp(this,data.ks.rx,0,degToRads,this.dynamicProperties);
    this.ry = PropertyFactory.getProp(this,data.ks.ry,0,degToRads,this.dynamicProperties);
    this.rz = PropertyFactory.getProp(this,data.ks.rz,0,degToRads,this.dynamicProperties);

    this.comp.animationItem.wrapper.style.perspective = this.comp.animationItem.wrapper.style.webkitPerspective = this.pe.v+'px';
    this.comp.animationItem.container.style.transformOrigin =
    this.comp.animationItem.container.style.mozTransformOrigin =
    //this.comp.animationItem.container.style.webkitTransformOrigin = "0px " + "0px " + this.pe.v +'px'; // Not working on Safari
    this.comp.animationItem.container.style.webkitTransformOrigin = "0px 0px 0px";
    this.mat = new Matrix();
}
createElement(HBaseElement, HCameraElement);

HCameraElement.prototype.createElements = function(){
};



HCameraElement.prototype.hide = function(){
};

HCameraElement.prototype.renderFrame = function(){
    var mdf = this.firstFrame;
    if(this.hierarchy){
        var i, len = this.hierarchy.length;
        for(i=0;i<len;i+=1){
            mdf = this.hierarchy[i].finalTransform.mProp.mdf ? true : mdf;
        }
    }
    if(mdf || (this.p && this.p.mdf) || (this.px && (this.px.mdf || this.py.mdf || this.pz.mdf)) || this.rx.mdf || this.ry.mdf || this.rz.mdf) {
        this.mat.reset();
        this.mat.translate(0,0,-this.pe.v);
        //this.mat.rotateX(-this.or.v[0]).rotateY(-this.or.v[1]).rotateZ(this.or.v[2]);
        if(this.p){
            this.mat.translate(-this.p.v[0],-this.p.v[1],this.pe.v+this.p.v[2]);
        }else{
            this.mat.translate(-this.px.v,-this.py.v,this.pe.v+this.pz.v);
        }
        this.mat.rotateX(-this.rx.v).rotateY(-this.ry.v).rotateZ(this.rz.v);
        this.mat.translate(this.globalData.compSize.w/2,this.globalData.compSize.h/2,0);
        this.mat.translate(0,0,this.pe.v);
        if(this.hierarchy){
            var mat;
            len = this.hierarchy.length;
            for(i=0;i<len;i+=1){
                mat = this.hierarchy[i].finalTransform.mProp.v.props;
                this.mat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5],mat[6],mat[7],mat[8],mat[9],mat[10],mat[11],-mat[12],-mat[13],mat[14],mat[15]);
            }
        }
        this.comp.animationItem.container.style.transform = this.comp.animationItem.container.style.webkitTransform = this.mat.toCSS();
    }
    this.firstFrame = false;
};

HCameraElement.prototype.destroy = function(){
};