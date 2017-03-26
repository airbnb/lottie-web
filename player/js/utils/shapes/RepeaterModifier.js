function RepeaterModifier(){};
extendPrototype(ShapeModifier,RepeaterModifier);
RepeaterModifier.prototype.processKeys = function(forceRender){
    if(this.elem.globalData.frameId === this.frameId && !forceRender){
        return;
    }
    this.mdf = forceRender ? true : false;
    this.frameId = this.elem.globalData.frameId;
    var i, len = this.dynamicProperties.length;

    for(i=0;i<len;i+=1){
        this.dynamicProperties[i].getValue();
        if(this.dynamicProperties[i].mdf){
            this.mdf = true;
        }
    }
}
RepeaterModifier.prototype.initModifierProperties = function(elem,data){
    this.getValue = this.processKeys;
    this.c = PropertyFactory.getProp(elem,data.c,0,null,this.dynamicProperties);
    this.o = PropertyFactory.getProp(elem,data.o,0,null,this.dynamicProperties);
    this.tr = PropertyFactory.getProp(elem,data.tr,2,null,this.dynamicProperties);
    if(!this.dynamicProperties.length){
        this.getValue(true);
    }
};

RepeaterModifier.prototype.applyTransforms = function(pMatrix, rMatrix, sMatrix, transform, perc, inv){
    var dir = inv ? -1 : 1;
    var scaleX = transform.s.v[0] + (1 - transform.s.v[0]) * (1 - perc);
    var scaleY = transform.s.v[1] + (1 - transform.s.v[1]) * (1 - perc);
    pMatrix.translate(transform.p.v[0] * dir * perc, transform.p.v[1] * dir * perc, transform.p.v[2]);
    rMatrix.translate(-transform.a.v[0], -transform.a.v[1], transform.a.v[2]);
    rMatrix.rotate(-transform.r.v * dir * perc);
    rMatrix.translate(transform.a.v[0], transform.a.v[1], transform.a.v[2]);
    sMatrix.translate(-transform.a.v[0], -transform.a.v[1], transform.a.v[2]);
    sMatrix.scale(inv ? 1/scaleX : scaleX, inv ? 1/scaleY : scaleY);
    sMatrix.translate(transform.a.v[0], transform.a.v[1], transform.a.v[2]);
}

RepeaterModifier.prototype.processShapes = function(firstFrame){
    if(!this.dynamicProperties.length){
        this.mdf = false;
    }
    var i, len = this.shapes.length;
    var j, jLen;
    var shapeData, newPaths;
    var copies = Math.ceil(this.c.v);
    var offset = this.o.v;
    var k;
    for(i=0;i<len;i+=1){
        newPaths = [];
        shapeData = this.shapes[i];
        if(!shapeData.shape.mdf && !this.mdf && !firstFrame){
            shapeData.shape.paths = shapeData.last;
        } else {
            shapeData.shape.mdf = true;
            shapePaths = shapeData.shape.paths;
            jLen = shapePaths.length;
            var iteration = 0;
            var matrix = new Matrix();
            var tMat = this.tr.v.props;
            var pMatrix = new Matrix();
            var rMatrix = new Matrix();
            var sMatrix = new Matrix();
            var tMatrix = new Matrix();
            var pProps = pMatrix.props;
            var rProps = rMatrix.props;
            var sProps = sMatrix.props;

            var offsetModulo = 0;
            if(offset > 0) {
                offsetModulo = offset%1;
                offset=Math.floor(offset);
                while(iteration<offset){
                    this.applyTransforms(pMatrix, rMatrix, sMatrix, this.tr, 1, false);
                    iteration += 1;
                }
                if(offsetModulo){
                    this.applyTransforms(pMatrix, rMatrix, sMatrix, this.tr, offsetModulo, false);
                    iteration += offsetModulo;
                }
            } else if(offset < 0) {
                offsetModulo = offset%1;
                offset=Math.ceil(offset);
                while(iteration>offset){
                    this.applyTransforms(pMatrix, rMatrix, sMatrix, this.tr, 1, true);
                    iteration -= 1;
                }
                if(offsetModulo){
                    this.applyTransforms(pMatrix, rMatrix, sMatrix, this.tr, - offsetModulo, true);
                    iteration -= offsetModulo;
                }
            }
            var tProps;
            for(j=0;j<jLen;j+=1){
                for(k=0;k<copies;k+=1) {
                    if(k !== 0) {
                        this.applyTransforms(pMatrix, rMatrix, sMatrix, this.tr, 1, false);
                    }
                    if(shapeData.data.transformers) {
                        shapeData.data.lvl = 0;
                        var maxLvl = 0;
                        var l, lLen;
                        lLen = shapeData.data.elements.length;
                        for(l = 0; l < lLen; l += 1) {
                            maxLvl = Math.max(maxLvl, shapeData.data.elements[l].st.lvl);
                        } 
                        var transformers = shapeData.data.transformers;
                        lLen = transformers.length;
                        for(l = lLen - 1; l >= maxLvl; l -= 1) {
                            tProps = transformers[l].mProps.v.props;
                            matrix.transform(tProps[0],tProps[1],tProps[2],tProps[3],tProps[4],tProps[5],tProps[6],tProps[7],tProps[8],tProps[9],tProps[10],tProps[11],tProps[12],tProps[13],tProps[14],tProps[15]);
                        }
                    }
                    if(iteration !== 0){
                        matrix.transform(rProps[0],rProps[1],rProps[2],rProps[3],rProps[4],rProps[5],rProps[6],rProps[7],rProps[8],rProps[9],rProps[10],rProps[11],rProps[12],rProps[13],rProps[14],rProps[15]);
                        matrix.transform(sProps[0],sProps[1],sProps[2],sProps[3],sProps[4],sProps[5],sProps[6],sProps[7],sProps[8],sProps[9],sProps[10],sProps[11],sProps[12],sProps[13],sProps[14],sProps[15]);
                        matrix.transform(pProps[0],pProps[1],pProps[2],pProps[3],pProps[4],pProps[5],pProps[6],pProps[7],pProps[8],pProps[9],pProps[10],pProps[11],pProps[12],pProps[13],pProps[14],pProps[15]);
                    }
                    newPaths.push(this.processPath(shapePaths[j], matrix));
                    matrix.reset();
                    iteration += 1;
                }
            }
            shapeData.shape.paths = newPaths;
            shapeData.last = newPaths;
        }
    }
}

RepeaterModifier.prototype.processPath = function(path, transform) {
    var clonedPath = shape_helper.clone(path, transform);
    return clonedPath;
}


ShapeModifiers.registerModifier('rp',RepeaterModifier);