function SVGBaseElement(data,parentContainer,globalData,comp){
    /*this.globalData = globalData;
    this.comp = comp;
    this.data = data;
    this.matteElement = null;
    this.transformedElement = null;
    this.isTransparent = false;
    this.parentContainer = parentContainer;
    this._sizeChanged = false;
    this.init();*/
};

//createElement(BaseElement, SVGBaseElement);

SVGBaseElement.prototype.initSvgElement = function(parentContainer) {
    this.matteElement = createNS('g');
    this.layerElement = createNS('g');
    this.transformedElement = this.layerElement;
    this._sizeChanged = false;
    this.parentContainer = parentContainer;
}

SVGBaseElement.prototype.createContainerElements = function(){
    this.transformedElement = this.layerElement;
    this.maskedElement = this.layerElement;
    var layerElementParent = null;
    //If this layer acts as a mask for the following layer
    if(this.data.td){
        if(this.data.td == 3 || this.data.td == 1){
            var masker = createNS('mask');
            masker.setAttribute('id',this.layerId);
            masker.setAttribute('mask-type',this.data.td == 3 ? 'luminance':'alpha');
            masker.appendChild(this.layerElement);
            layerElementParent = masker;
            this.globalData.defs.appendChild(masker);
            // This is only for IE and Edge when mask if of type alpha
            if(!featureSupport.maskType && this.data.td == 1){
                masker.setAttribute('mask-type','luminance');
                var filId = randomString(10);
                var fil = filtersFactory.createFilter(filId);
                this.globalData.defs.appendChild(fil);
                fil.appendChild(filtersFactory.createAlphaToLuminanceFilter());
                var gg = createNS('g');
                gg.appendChild(this.layerElement);
                layerElementParent = gg;
                masker.appendChild(gg);
                gg.setAttribute('filter','url(' + locationHref + '#'+filId+')');
            }
        }else if(this.data.td == 2){
            var maskGroup = createNS('mask');
            maskGroup.setAttribute('id',this.layerId);
            maskGroup.setAttribute('mask-type','alpha');
            var maskGrouper = createNS('g');
            maskGroup.appendChild(maskGrouper);
            var filId = randomString(10);
            var fil = filtersFactory.createFilter(filId);
            ////

            var feColorMatrix = createNS('feColorMatrix');
            feColorMatrix.setAttribute('type','matrix');
            feColorMatrix.setAttribute('color-interpolation-filters','sRGB');
            feColorMatrix.setAttribute('values','1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 -1 1');
            fil.appendChild(feColorMatrix);

            ////
            /*var feCTr = createNS('feComponentTransfer');
            feCTr.setAttribute('in','SourceGraphic');
            fil.appendChild(feCTr);
            var feFunc = createNS('feFuncA');
            feFunc.setAttribute('type','table');
            feFunc.setAttribute('tableValues','1.0 0.0');
            feCTr.appendChild(feFunc);*/
            this.globalData.defs.appendChild(fil);
            var alphaRect = createNS('rect');
            alphaRect.setAttribute('width',this.comp.data.w);
            alphaRect.setAttribute('height',this.comp.data.h);
            alphaRect.setAttribute('x','0');
            alphaRect.setAttribute('y','0');
            alphaRect.setAttribute('fill','#ffffff');
            alphaRect.setAttribute('opacity','0');
            maskGrouper.setAttribute('filter','url(' + locationHref + '#'+filId+')');
            maskGrouper.appendChild(alphaRect);
            maskGrouper.appendChild(this.layerElement);
            layerElementParent = maskGrouper;
            if(!featureSupport.maskType){
                maskGroup.setAttribute('mask-type','luminance');
                fil.appendChild(filtersFactory.createAlphaToLuminanceFilter());
                var gg = createNS('g');
                maskGrouper.appendChild(alphaRect);
                gg.appendChild(this.layerElement);
                layerElementParent = gg;
                maskGrouper.appendChild(gg);
            }
            this.globalData.defs.appendChild(maskGroup);
        }
    }else if(this.data.tt){
        this.matteElement.appendChild(this.layerElement);
        layerElementParent = this.matteElement;
        this.baseElement = this.matteElement;
    }else{
        this.baseElement = this.layerElement;
    }
    if((this.data.ln || this.data.cl) && (this.data.ty === 4 || this.data.ty === 0)){
        if(this.data.ln){
            this.layerElement.setAttribute('id',this.data.ln);
        }
        if(this.data.cl){
            this.layerElement.setAttribute('class',this.data.cl);
        }
    }
    //Clipping compositions to hide content that exceeds boundaries. If collapsed transformations is on, component should not be clipped
    if(this.data.ty === 0){
        var cp = createNS( 'clipPath');
        var pt = createNS('path');
        pt.setAttribute('d','M0,0 L'+this.data.w+',0'+' L'+this.data.w+','+this.data.h+' L0,'+this.data.h+'z');
        var clipId = 'cp_'+randomString(8);
        cp.setAttribute('id',clipId);
        cp.appendChild(pt);
        this.globalData.defs.appendChild(cp);
        if(this.checkMasks()){
            var cpGroup = createNS('g');
            cpGroup.setAttribute('clip-path','url(' + locationHref + '#'+clipId+')');
            cpGroup.appendChild(this.layerElement);
            this.transformedElement = cpGroup;
            if(layerElementParent){
                layerElementParent.appendChild(this.transformedElement);
            } else {
                this.baseElement = this.transformedElement;
            }
        } else {
            this.layerElement.setAttribute('clip-path','url(' + locationHref + '#'+clipId+')');
        }
        
    }
    if(this.data.bm !== 0){
        this.setBlendMode();
    }
    this.effectsManager = new SVGEffects(this);
    this.checkParenting();
};


SVGBaseElement.prototype.setBlendMode = BaseElement.prototype.setBlendMode;

SVGBaseElement.prototype.renderElement = function(){
    //If this layer is of type Null Object (ty === 3) no need to render
    //If it is exported as hidden (data.hd === true) no need to render
    //If it is not visible no need to render
    if(this.data.ty === 3 || this.data.hd || this.hidden){
        return false;
    }

    this.lastNum = this.currentFrameNum;

    var finalMat = this.finalTransform.mat;
    
    if(this.finalTransform.matMdf && this.transformedElement){
        this.transformedElement.setAttribute('transform',finalMat.to2dCSS());
    }
    if(this.finalTransform.opMdf && this.transformedElement){
        this.transformedElement.setAttribute('opacity',this.finalTransform.op.v);
    }
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
SVGBaseElement.prototype.addMasks = function(){
    this.maskManager = new MaskElement(this.data,this,this.globalData);
};

SVGBaseElement.prototype.setMatte = function(id){
    if(!this.matteElement){
        return;
    }
    this.matteElement.setAttribute("mask", "url(" + locationHref + "#" + id + ")");
};

SVGBaseElement.prototype.hideElement = function(){
    if(!this.hidden && (!this.isVisible || this.isTransparent)){
        this.layerElement.style.display = 'none';
        this.hidden = true;
    }
};

SVGBaseElement.prototype.showElement = function(){
    if(this.isVisible && !this.isTransparent){
        this.layerElement.style.display = 'block';
        this.hidden = false;
    }
};
