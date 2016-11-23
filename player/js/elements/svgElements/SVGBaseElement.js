function SVGBaseElement(data,parentContainer,globalData,comp, placeholder){
    this.globalData = globalData;
    this.comp = comp;
    this.data = data;
    this.matteElement = null;
    this.parentContainer = parentContainer;
    this.layerId = placeholder ? placeholder.layerId : 'ly_'+randomString(10);
    this.placeholder = placeholder;
    this.init();
};

createElement(BaseElement, SVGBaseElement);

SVGBaseElement.prototype.createElements = function(){
    if(this.data.td){
        if(this.data.td == 3 || this.data.td == 1){
            this.layerElement = document.createElementNS(svgNS,'g');
            var masker = document.createElementNS(svgNS,'mask');
            masker.setAttribute('id',this.layerId);
            masker.setAttribute('mask-type',this.data.td == 3 ? 'luminance':'alpha');
            masker.appendChild(this.layerElement);
            this.globalData.defs.appendChild(masker);
            ////// This is only for IE and Edge when mask if of type alpha
            if(!featureSupport.maskType && this.data.td == 1){
                masker.setAttribute('mask-type','luminance');
                var filId = randomString(10);
                var fil = filtersFactory.createFilter(filId);
                this.globalData.defs.appendChild(fil);
                fil.appendChild(filtersFactory.createAlphaToLuminanceFilter());
                var gg = document.createElementNS(svgNS,'g');
                gg.appendChild(this.layerElement);
                masker.appendChild(gg);
                gg.setAttribute('filter','url(#'+filId+')');
            }
        }else if(this.data.td == 2){
            var maskGroup = document.createElementNS(svgNS,'mask');
            maskGroup.setAttribute('id',this.layerId);
            maskGroup.setAttribute('mask-type','alpha');
            var maskGrouper = document.createElementNS(svgNS,'g');
            maskGroup.appendChild(maskGrouper);
            this.layerElement = document.createElementNS(svgNS,'g');
            var filId = randomString(10);
            var fil = filtersFactory.createFilter(filId);
            ////

            var feColorMatrix = document.createElementNS(svgNS,'feColorMatrix');
            feColorMatrix.setAttribute('type','matrix');
            feColorMatrix.setAttribute('color-interpolation-filters','sRGB');
            feColorMatrix.setAttribute('values','1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 -1 1');
            fil.appendChild(feColorMatrix);

            ////
            /*var feCTr = document.createElementNS(svgNS,'feComponentTransfer');
            feCTr.setAttribute('in','SourceGraphic');
            fil.appendChild(feCTr);
            var feFunc = document.createElementNS(svgNS,'feFuncA');
            feFunc.setAttribute('type','table');
            feFunc.setAttribute('tableValues','1.0 0.0');
            feCTr.appendChild(feFunc);*/
            this.globalData.defs.appendChild(fil);
            var alphaRect = document.createElementNS(svgNS,'rect');
            alphaRect.setAttribute('width',this.comp.data ? this.comp.data.w : this.globalData.compSize.w);
            alphaRect.setAttribute('height',this.comp.data ? this.comp.data.h : this.globalData.compSize.h);
            alphaRect.setAttribute('x','0');
            alphaRect.setAttribute('y','0');
            alphaRect.setAttribute('fill','#ffffff');
            alphaRect.setAttribute('opacity','0');
            maskGrouper.setAttribute('filter','url(#'+filId+')');
            maskGrouper.appendChild(alphaRect);
            maskGrouper.appendChild(this.layerElement);
            if(!featureSupport.maskType){
                maskGroup.setAttribute('mask-type','luminance');
                fil.appendChild(filtersFactory.createAlphaToLuminanceFilter());
                var gg = document.createElementNS(svgNS,'g');
                maskGrouper.appendChild(alphaRect);
                gg.appendChild(this.layerElement);
                maskGrouper.appendChild(gg);
            }
            this.globalData.defs.appendChild(maskGroup);
        }else{
            this.layerElement = document.createElementNS(svgNS,'g');
        }
        if(this.data.hasMask){
            this.maskedElement = this.layerElement;
        }
    }else if(this.data.hasMask || this.data.tt){
        this.layerElement = document.createElementNS(svgNS,'g');
        if(this.data.tt){
            this.matteElement = document.createElementNS(svgNS,'g');
            this.matteElement.appendChild(this.layerElement);
            this.baseElement = this.matteElement;
            //this.appendNodeToParent(this.matteElement);
        }else{
            this.baseElement = this.layerElement;
            //this.appendNodeToParent(this.layerElement);
        }
        if(this.data.hasMask){
            this.maskedElement = this.layerElement;
        }
    }else{
        this.layerElement = document.createElementNS(svgNS,'g');
        this.baseElement = this.layerElement;
        //this.appendNodeToParent(this.layerElement);
    }
    if((this.data.ln || this.data.cl) && (this.data.ty === 4 || this.data.ty === 0)){
        if(this.data.ln){
            this.layerElement.setAttribute('id',this.data.ln);
        }
        if(this.data.cl){
            this.layerElement.setAttribute('class',this.data.cl);
        }
    }
    if(this.data.ty === 0 && !this.checkMasks()){
        var cp = document.createElementNS(svgNS, 'clipPath');
        var pt = document.createElementNS(svgNS,'path');
        pt.setAttribute('d','M0,0 L'+this.data.w+',0'+' L'+this.data.w+','+this.data.h+' L0,'+this.data.h+'z');
        var clipId = 'cp_'+randomString(8);
        cp.setAttribute('id',clipId);
        this.layerElement.setAttribute('clip-path','url(#'+clipId+')');
        cp.appendChild(pt);
        this.globalData.defs.appendChild(cp);
    }
    if(this.data.bm !== 0){
        this.setBlendMode();
    }
    if(this.layerElement !== this.parentContainer){
        this.placeholder = null;
    }
    /* Todo performance killer
    if(this.data.sy){
        var filterID = 'st_'+randomString(10);
        var c = this.data.sy[0].c.k;
        var r = this.data.sy[0].s.k;
        var expansor = document.createElementNS(svgNS,'filter');
        expansor.setAttribute('id',filterID);
        var feFlood = document.createElementNS(svgNS,'feFlood');
        this.feFlood = feFlood;
        if(!c[0].e){
            feFlood.setAttribute('flood-color','rgb('+c[0]+','+c[1]+','+c[2]+')');
        }
        feFlood.setAttribute('result','base');
        expansor.appendChild(feFlood);
        var feMorph = document.createElementNS(svgNS,'feMorphology');
        feMorph.setAttribute('operator','dilate');
        feMorph.setAttribute('in','SourceGraphic');
        feMorph.setAttribute('result','bigger');
        this.feMorph = feMorph;
        if(!r.length){
            feMorph.setAttribute('radius',this.data.sy[0].s.k);
        }
        expansor.appendChild(feMorph);
        var feColorMatrix = document.createElementNS(svgNS,'feColorMatrix');
        feColorMatrix.setAttribute('result','mask');
        feColorMatrix.setAttribute('in','bigger');
        feColorMatrix.setAttribute('type','matrix');
        feColorMatrix.setAttribute('values','0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0');
        expansor.appendChild(feColorMatrix);
        var feComposite = document.createElementNS(svgNS,'feComposite');
        feComposite.setAttribute('result','drop');
        feComposite.setAttribute('in','base');
        feComposite.setAttribute('in2','mask');
        feComposite.setAttribute('operator','in');
        expansor.appendChild(feComposite);
        var feBlend = document.createElementNS(svgNS,'feBlend');
        feBlend.setAttribute('in','SourceGraphic');
        feBlend.setAttribute('in2','drop');
        feBlend.setAttribute('mode','normal');
        expansor.appendChild(feBlend);
        this.globalData.defs.appendChild(expansor);
        var cont = document.createElementNS(svgNS,'g');
        if(this.layerElement === this.parentContainer){
            this.layerElement = cont;
        }else{
            cont.appendChild(this.layerElement);
        }
        cont.setAttribute('filter','url(#'+filterID+')');
        if(this.data.td){
            cont.setAttribute('data-td',this.data.td);
        }
        if(this.data.td == 3){
            this.globalData.defs.appendChild(cont);
        }else if(this.data.td == 2){
            maskGrouper.appendChild(cont);
        }else if(this.data.td == 1){
            masker.appendChild(cont);
        }else{
            if(this.data.hasMask && this.data.tt){
                this.matteElement.appendChild(cont);
            }else{
                this.appendNodeToParent(cont);
            }
        }
    }*/
    if(this.data.ef){
        this.effectsManager = new SVGEffects(this);
    }
    this.checkParenting();
};


SVGBaseElement.prototype.setBlendMode = BaseElement.prototype.setBlendMode;

SVGBaseElement.prototype.renderFrame = function(parentTransform){
    if(this.data.ty === 3 || this.data.hd){
        return false;
    }

    if(!this.isVisible){
        return this.isVisible;
    }
    this.lastNum = this.currentFrameNum;
    this.finalTransform.opMdf = this.finalTransform.op.mdf;
    this.finalTransform.matMdf = this.finalTransform.mProp.mdf;
    this.finalTransform.opacity = this.finalTransform.op.v;
    if(this.firstFrame){
        this.finalTransform.opMdf = true;
        this.finalTransform.matMdf = true;
    }

    var mat;
    var finalMat = this.finalTransform.mat;

    if(this.hierarchy){
        var i, len = this.hierarchy.length;

        mat = this.finalTransform.mProp.v.props;
        finalMat.cloneFromProps(mat);
        for(i=0;i<len;i+=1){
            this.finalTransform.matMdf = this.hierarchy[i].finalTransform.mProp.mdf ? true : this.finalTransform.matMdf;
            mat = this.hierarchy[i].finalTransform.mProp.v.props;
            finalMat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5],mat[6],mat[7],mat[8],mat[9],mat[10],mat[11],mat[12],mat[13],mat[14],mat[15]);
        }
    }else{
        if(this.isVisible){
            finalMat.cloneFromProps(this.finalTransform.mProp.v.props);
        }
    }
    if(parentTransform){
        mat = parentTransform.mat.props;
        finalMat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5],mat[6],mat[7],mat[8],mat[9],mat[10],mat[11],mat[12],mat[13],mat[14],mat[15]);
        this.finalTransform.opacity *= parentTransform.opacity;
        this.finalTransform.opMdf = parentTransform.opMdf ? true : this.finalTransform.opMdf;
        this.finalTransform.matMdf = parentTransform.matMdf ? true : this.finalTransform.matMdf;
    }
    if(this.finalTransform.matMdf && this.layerElement){
        this.layerElement.setAttribute('transform',finalMat.to2dCSS());
    }
    if(this.finalTransform.opMdf && this.layerElement){
        this.layerElement.setAttribute('opacity',this.finalTransform.opacity);
    }

    if(this.data.hasMask){
        this.maskManager.renderFrame(finalMat);
    }
    if(this.effectsManager){
        this.effectsManager.renderFrame(this.firstFrame);
    }
    return this.isVisible;
};

SVGBaseElement.prototype.destroy = function(){
    this.layerElement = null;
    this.parentContainer = null;
    if(this.matteElement) {
        this.matteElement = null;
    }
    if(this.maskManager) {
        this.maskManager.destroy();
    }
};

SVGBaseElement.prototype.getBaseElement = function(){
    return this.baseElement;
};
SVGBaseElement.prototype.addMasks = function(data){
    this.maskManager = new MaskElement(data,this,this.globalData);
};

SVGBaseElement.prototype.setMatte = function(id){
    if(!this.matteElement){
        return;
    }
    this.matteElement.setAttribute("mask", "url(#" + id + ")");
};

SVGBaseElement.prototype.setMatte = function(id){
    if(!this.matteElement){
        return;
    }
    this.matteElement.setAttribute("mask", "url(#" + id + ")");
};

SVGBaseElement.prototype.hide = function(){

};
