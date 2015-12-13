function HCameraElement(data,parentContainer,globalData,comp, placeholder){
    this.parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
    this.pe = PropertyFactory.getProp(this,data.pe,0,0,this.dynamicProperties);
    this.p = PropertyFactory.getProp(this,data.ks.p,1,0,this.dynamicProperties);
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
    this.translateCamera = ' translate3d('+ this.globalData.compSize.w/2+'px, '+ this.globalData.compSize.h/2+'px, 0) ';

    this.comp.animationItem.wrapper.style.perspective = this.pe.v+'px';
    this.comp.animationItem.container.style.transformOrigin =
    this.comp.animationItem.container.style.mozTransformOrigin =
    this.comp.animationItem.container.style.webkitTransformOrigin =
    this.comp.animationItem.container.style['-webkit-transform'] = this.globalData.compSize.w/2 + "px " + this.globalData.compSize.h/2 + "px "+this.pe.v+"px";
}
createElement(HBaseElement, HCameraElement);

HCameraElement.prototype.createElements = function(){
};



HCameraElement.prototype.hide = function(){
};

HCameraElement.prototype.renderFrame = function(){
    if(this.hierarchy){
    }
    if(this.pe.mdf){
        this.comp.animationItem.wrapper.style.perspective = this.pe.v+'px';
        this.comp.animationItem.container.style.transformOrigin =
        this.comp.animationItem.container.style.mozTransformOrigin =
        this.comp.animationItem.container.style.webkitTransformOrigin =
        this.comp.animationItem.container.style['-webkit-transform'] = this.globalData.compSize.w/2 + "px " + this.globalData.compSize.h/2 + "px "+this.pe.v+"px";
    }
    if(this.finalTransform.mProp.mdf) {
    }
    var mt = new Matrix();
    mt.rotateX(-this.or.v[0]).rotateY(-this.or.v[1]).rotateZ(this.or.v[2]);
    mt.rotateX(-this.rx.v).rotateY(-this.ry.v).rotateZ(this.rz.v);
    mt.translate(-this.p.v[0],-this.p.v[1],this.pe.v+this.p.v[2]);
    //renderedData.an.cameraValue = matrixInstance.getMatrix3FromParams(-matrixParams.rx,-matrixParams.ry,matrixParams.rz,matrixParams.sx,matrixParams.sy,matrixParams.sz,-matrixParams.px,-matrixParams.py,item.pe+matrixParams.pz) + ' translate3d('+ dataOb.a[0]+'px, '+ dataOb.a[1]+'px, 0)';
    //this.comp.animationItem.container.style.transform = this.finalTransform.mProp.v.toCSS() + this.translateCamera;
    this.comp.animationItem.container.style.transform = this.translateCamera + mt.toCSS();
};

HCameraElement.prototype.destroy = function(){
};