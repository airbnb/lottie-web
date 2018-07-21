function WebGLBaseElement(){
}

WebGLBaseElement.prototype = {
    createElements: function(){},
    initRendererElement: function(){},
    createContainerElements: function(){
        this.renderableEffectsManager = new WEffects(this);
        if(this.renderableEffectsManager.filters.length) {
            this.createFramebuffers(this.gl);
        }
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

        this.maskManager = new WMaskElement(this.data, this);
        if(this.maskManager.hasMasks) {
            this.createFramebuffers(this.gl);
        }
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
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                filters[i].renderFrame();
             
                // for the next draw, use the texture we just rendered to.
                //gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.framebuffersData.textures[i % 2]);
            }
            this.comp.switchBuffer();
            //TODO: if filters didn't change, skip processing them and bind directly the last binded texture in previous iteration.
        }
    },

    renderMasks: function() {
        if(this.maskManager.hasMasks) {
            this.maskManager.renderFrame();
        }
    },

    renderLayer: function() {
        var gl = this.gl;
        gl.useProgram(this.program);
        
        //Parent comp transform + localTransform
        var tr = this.comp.getTransform();
        var newTransform = new Matrix();
        this.finalTransform.mat.clone(newTransform);
        var p = tr.props;
        newTransform.transform(p[0],p[1],p[2],p[3],p[4],p[5],p[6],p[7],p[8],p[9],p[10],p[11],p[12],p[13],p[14],p[15]);
        //TODO: only update the uniform if needed. This is costly.
        this.gl.uniformMatrix4fv(this.mat4UniformLoc, false, newTransform.props);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    },

    destroy: function(){
        this.canvasContext = null;
        this.data = null;
        this.globalData = null;
        this.maskManager.destroy();
    },
    createFramebuffers: function(gl){
        if(this.framebuffersData) {
            return;
        }
        var compSize = this.getSize();
        // Frame buffer objects fof effects
        var textures = [];
        var framebuffers = [];
        for (var ii = 0; ii < 2; ++ii) {
            var bufferWithTexture = this.createFrameBufferWithTexture(gl, compSize.w, compSize.h);
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
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        
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