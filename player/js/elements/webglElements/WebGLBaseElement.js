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

    renderEffects: function() {
        var gl = this.gl;
        //rendering effects
        var filters = this.renderableEffectsManager.filters;
        if(filters.length) {
            var size = this.getSize();
            var i, len = filters.length;
            gl.viewport(0, 0, size.w, size.h);
            for (i = 0; i < len; i++) {
                // Setup to draw into one of the framebuffers.
                gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffersData.framebuffers[i % 2]);
                filters[i].renderFrame();
             
                // for the next draw, use the texture we just rendered to.
                gl.bindTexture(gl.TEXTURE_2D, this.framebuffersData.textures[i % 2]);
            }
            this.comp.switchBuffer();
            //TODO: if filters didn't change, skip processing them and bind directly the last binded texture in previous iteration.
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
            var bufferWithTexture = this.createFrameBufferWithTexture(gl, width, height);
            textures.push(bufferWithTexture.texture);
            framebuffers.push(bufferWithTexture.framebuffer);
        }
        this.framebuffersData = {
            textures: textures,
            framebuffers: framebuffers
        }
    },
    createFrameBufferWithTexture: function(gl, width, height) {

        // Create a framebuffer
        var framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

        // Attach a texture to it.
        var texture = textureFactory(gl);

        // make the texture the same size as the image
        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0,
            gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        //gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        
        return {
            texture: texture,
            framebuffer: framebuffer
        }
    },

    //
    mHelper: new Matrix()
};
WebGLBaseElement.prototype.hide = CVBaseElement.prototype.hideElement;
WebGLBaseElement.prototype.show = CVBaseElement.prototype.showElement;