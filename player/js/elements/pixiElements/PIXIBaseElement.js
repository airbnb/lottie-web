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
        this.transformedElement = this.layerElement;
        this.maskedElement = this.layerElement;
        this._sizeChanged = false;
        var layerElementParent = null;
        //If this layer acts as a mask for the following layer
        var filId, fil, gg;
        if (this.data.td) {
            if (this.data.td == 3 || this.data.td == 1) {
            } else if(this.data.td == 2) {
            }
        } else if (this.data.tt) {
        } else {
            this.baseElement = this.layerElement;
        }
        //Clipping compositions to hide content that exceeds boundaries. If collapsed transformations is on, component should not be clipped
        if (this.data.ty === 0 && !this.data.hd) {
            //Todo Clip compositions

            if (this.checkMasks()) {
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
            //this.setBlendMode();
        }
        this.renderableEffectsManager = new PIXIEffects(this);
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
    return this.baseElement;
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

PIXIBaseElement.prototype.show = function(){
    if (this.isInRange && !this.isTransparent){
        this.hidden = false;
        this._isFirstFrame = true;
        this.layerElement.visible = true;
    }
};

PIXIBaseElement.prototype.hide = function(){
    if (!this.hidden && (!this.isInRange || this.isTransparent)) {
        this.layerElement.visible = false;
        this.hidden = true;
    }
};