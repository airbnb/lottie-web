function PIXIBaseElement(data,parentContainer,globalData,comp, placeholder){
    this.globalData = globalData;
    this.comp = comp;
    this.data = data;
    this.matteElement = null;
    this.parentContainer = parentContainer;
    this.layerId = placeholder ? placeholder.layerId : 'ly_'+randomString(10);
    this.placeholder = placeholder;
    this.init();
};

PIXIBaseElement.prototype = {
    initRendererElement: function() {
        this.layerElement = new PIXI.DisplayObjectContainer();
    },
    createContainerElements: function(){
        this.matteElement = createNS('g');
        this.transformedElement = this.layerElement;
        this.maskedElement = this.layerElement;
        this._sizeChanged = false;
        var layerElementParent = null;
        //If this layer acts as a mask for the following layer
        var filId, fil, gg;
        if (this.data.td) {
            if (this.data.td == 3 || this.data.td == 1) {
                var masker = createNS('mask');
                masker.setAttribute('id', this.layerId);
                masker.setAttribute('mask-type', this.data.td == 3 ? 'luminance' : 'alpha');
                masker.appendChild(this.layerElement);
                layerElementParent = masker;
                this.globalData.defs.appendChild(masker);
                // This is only for IE and Edge when mask if of type alpha
                if (!featureSupport.maskType && this.data.td == 1) {
                    masker.setAttribute('mask-type', 'luminance');
                    filId = randomString(10);
                    fil = filtersFactory.createFilter(filId);
                    this.globalData.defs.appendChild(fil);
                    fil.appendChild(filtersFactory.createAlphaToLuminanceFilter());
                    gg = createNS('g');
                    gg.appendChild(this.layerElement);
                    layerElementParent = gg;
                    masker.appendChild(gg);
                    gg.setAttribute('filter','url(' + locationHref + '#' + filId + ')');
                }
            } else if(this.data.td == 2) {
                var maskGroup = createNS('mask');
                maskGroup.setAttribute('id', this.layerId);
                maskGroup.setAttribute('mask-type','alpha');
                var maskGrouper = createNS('g');
                maskGroup.appendChild(maskGrouper);
                filId = randomString(10);
                fil = filtersFactory.createFilter(filId);
                ////

                var feColorMatrix = createNS('feColorMatrix');
                feColorMatrix.setAttribute('type', 'matrix');
                feColorMatrix.setAttribute('color-interpolation-filters', 'sRGB');
                feColorMatrix.setAttribute('values','1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 -1 1');
                fil.appendChild(feColorMatrix);

                this.globalData.defs.appendChild(fil);
                var alphaRect = createNS('rect');
                alphaRect.setAttribute('width',  this.comp.data.w);
                alphaRect.setAttribute('height', this.comp.data.h);
                alphaRect.setAttribute('x','0');
                alphaRect.setAttribute('y','0');
                alphaRect.setAttribute('fill','#ffffff');
                alphaRect.setAttribute('opacity','0');
                maskGrouper.setAttribute('filter', 'url(' + locationHref + '#'+filId+')');
                maskGrouper.appendChild(alphaRect);
                maskGrouper.appendChild(this.layerElement);
                layerElementParent = maskGrouper;
                if (!featureSupport.maskType) {
                    maskGroup.setAttribute('mask-type', 'luminance');
                    fil.appendChild(filtersFactory.createAlphaToLuminanceFilter());
                    gg = createNS('g');
                    maskGrouper.appendChild(alphaRect);
                    gg.appendChild(this.layerElement);
                    layerElementParent = gg;
                    maskGrouper.appendChild(gg);
                }
                this.globalData.defs.appendChild(maskGroup);
            }
        } else if (this.data.tt) {
            this.matteElement.appendChild(this.layerElement);
            layerElementParent = this.matteElement;
            this.baseElement = this.matteElement;
        } else {
            this.baseElement = this.layerElement;
            this.PBaseElement = this.PLayerElement;
        }
        if (this.data.ln) {
            this.layerElement.setAttribute('id', this.data.ln);
        }
        if (this.data.cl) {
            this.layerElement.setAttribute('class', this.data.cl);
        }
        //Clipping compositions to hide content that exceeds boundaries. If collapsed transformations is on, component should not be clipped
        if (this.data.ty === 0 && !this.data.hd) {
            var cp = createNS( 'clipPath');
            var pt = createNS('path');
            pt.setAttribute('d','M0,0 L' + this.data.w + ',0' + ' L' + this.data.w + ',' + this.data.h + ' L0,' + this.data.h + 'z');
            var clipId = 'cp_'+randomString(8);
            cp.setAttribute('id',clipId);
            cp.appendChild(pt);
            this.globalData.defs.appendChild(cp);

            if (this.checkMasks()) {
                var cpGroup = createNS('g');
                cpGroup.setAttribute('clip-path','url(' + locationHref + '#'+clipId + ')');
                cpGroup.appendChild(this.layerElement);
                this.transformedElement = cpGroup;
                if (layerElementParent) {
                    layerElementParent.appendChild(this.transformedElement);
                } else {
                    this.baseElement = this.transformedElement;
                }
            } else {
                //this.layerElement.setAttribute('clip-path','url(' + locationHref + '#'+clipId+')');
            }
            
        }
        if (this.data.bm !== 0) {
            this.setBlendMode();
        }
        this.renderableEffectsManager = new SVGEffects(this);
    },
    renderInnerContent: function() {},
    renderFrame: function() {
        if (this.hidden) {
            return;
        }
        this.renderTransform();
        //this.setBlendMode();
        this.renderRenderable();
        this.renderElement();
        this.renderInnerContent();
        if (this._isFirstFrame) {
            this._isFirstFrame = false;
        }
    },
    renderElement: function() {
        if (this.finalTransform._matMdf) {
            var finalMat = this.finalTransform.mat;
            var mt = new PIXI.Matrix();
            mt.a = finalMat.props[0];
            mt.b = finalMat.props[1];
            mt.c = finalMat.props[4];
            mt.d = finalMat.props[5];
            mt.tx = finalMat.props[12];
            mt.ty = finalMat.props[13];
            this.transformedElement.transform.setFromMatrix(mt);
        }
        if (this.finalTransform._opMdf) {
            this.transformedElement.alpha = this.finalTransform.mProp.o.v;
        }
    },
}

PIXIBaseElement.prototype.destroy = function(){
    this.layerElement = null;
    this.parentContainer = null;
    if(this.matteElement) {
        this.matteElement = null;
    }
    if(this.maskManager) {
        this.maskManager.destroy();
    }
};

PIXIBaseElement.prototype.getBaseElement = function(){
    return this.PBaseElement;
};
PIXIBaseElement.prototype.addMasks = function(){
    this.maskManager = new PIXIMaskElement(this.data, this, this.globalData);
};

PIXIBaseElement.prototype.setMatte = function(id){
    if(!this.matteElement){
        return;
    }
    this.matteElement.setAttribute("mask", "url(#" + id + ")");
};

PIXIBaseElement.prototype.setMatte = function(id){
    if(!this.matteElement){
        return;
    }
    this.matteElement.setAttribute("mask", "url(#" + id + ")");
};

PIXIBaseElement.prototype.show = function(){
    if (this.isInRange && !this.isTransparent){
        this.hidden = false;
        this._isFirstFrame = true;
    }
};

PIXIBaseElement.prototype.hide = function(){

};

PIXIBaseElement.prototype.prepareFrame = function(num){
    this._mdf = false;
    this.prepareRenderableFrame(num);
    this.prepareProperties(num, this.isInRange);
    this.checkTransparency();
};