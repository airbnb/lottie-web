function WebGLBaseElement(){
}

WebGLBaseElement.prototype = {
    createElements: function(){},
    initRendererElement: function(){},
    createContainerElements: function(){
        this.renderableEffectsManager = new WEffects(this);
    },
    createContent: function(){},
    setBlendMode: function(){
        var globalData = this.globalData;
        if(globalData.blendMode !== this.data.bm) {
            globalData.blendMode = this.data.bm;
            var blendModeValue = this.getBlendMode();
            globalData.canvasContext.globalCompositeOperation = blendModeValue;
        }
    },
    addMasks: function(){
        this.maskManager = new CVMaskElement(this.data, this);
    },
    hideElement: function(){
        if (!this.hidden && (!this.isInRange || this.isTransparent)) {
            this.hidden = true;
        }
    },
    showElement: function(){
        if (this.isInRange && !this.isTransparent){
            this.hidden = false;
            this._isFirstFrame = true;
            this.maskManager._isFirstFrame = true;
        }
    },
    renderFrame: function() {
        if (this.hidden || this.data.hd) {
            return;
        }
        this.renderTransform();
        this.renderRenderable();
        this.setBlendMode();
        this.renderInnerContent();
        if (this._isFirstFrame) {
            this._isFirstFrame = false;
        }
    },
    destroy: function(){
        this.canvasContext = null;
        this.data = null;
        this.globalData = null;
        this.maskManager.destroy();
    },
    createFramebuffers: function(gl, width, height){
        // Frame buffer objects fof effects
        var textures = [];
        var framebuffers = [];
        for (var ii = 0; ii < 2; ++ii) {
            var texture = textureFactory(gl);
            textures.push(texture);

            // make the texture the same size as the image
            gl.texImage2D(
                gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0,
                gl.RGBA, gl.UNSIGNED_BYTE, null);

            // Create a framebuffer
            var fbo = gl.createFramebuffer();
            framebuffers.push(fbo);
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

            // Attach a texture to it.
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this.framebuffersData = {
            textures: textures,
            framebuffers: framebuffers
        }
    },
    //
    mHelper: new Matrix()
};
WebGLBaseElement.prototype.hide = CVBaseElement.prototype.hideElement;
WebGLBaseElement.prototype.show = CVBaseElement.prototype.showElement;