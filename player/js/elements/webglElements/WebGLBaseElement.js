function WebGLBaseElement(){
}

WebGLBaseElement.prototype = {
    createElements: function(){},
    initRendererElement: function(){
        this.localTransform = new Matrix();
        this.framebuffersData = [];
    },
    createContainerElements: function(){
        this.renderableEffectsManager = new WEffects(this);
        if(this.renderableEffectsManager.filters.length) {
            this.createFramebuffers(this.glContext);
        }
    },
    createContent: function(){
    },
    setBlendMode: function(){
        var globalData = this.globalData;
        if(globalData.blendMode !== this.data.bm) {
            globalData.blendMode = this.data.bm;
            var blendModeValue = getBlendMode(this.data.bm);
            globalData.glContext.globalCompositeOperation = blendModeValue;
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
        console.log('RENDER FRAME')
        if (this.hidden || this.data.hd) {
            return;
        }
        this.renderTransform();
        this.renderRenderable();
        this.setBlendMode();
        this.renderInnerContent();
        this.renderLayer();
        if (this._isFirstFrame) {
            this._isFirstFrame = false;
        }
    },

    renderEffects: function() {
        var glContext = this.glContext;
        //rendering effects
        var filters = this.renderableEffectsManager.filters;
        if(filters.length) {
            var size = this.getSize();
            var i, len = filters.length;
            glContext.viewport(0, 0, size.w, size.h);
            this._finalTexture = this.texture;
            for (i = 0; i < len; i++) {
                // Setup to draw into one of the framebuffers.
                glContext.bindFramebuffer(glContext.FRAMEBUFFER, this.framebuffersData[i % 2].framebuffer);
                this.currentBuffer = this.framebuffersData[i % 2].framebuffer;
                glContext.clearColor(0, 0, 0, 0);
                glContext.clear(glContext.COLOR_BUFFER_BIT | glContext.DEPTH_BUFFER_BIT);
                filters[i].renderFrame();
             
                // for the next draw, use the texture we just rendered to.
                //glContext.activeTexture(glContext.TEXTURE0);
                glContext.bindTexture(glContext.TEXTURE_2D, this.framebuffersData[i % 2].texture);
                this._finalTexture = this.framebuffersData[i % 2].texture;
            }
            //TODO: if filters didn't change, skip processing them and bind directly the last binded texture in previous iteration.
        }
    },

    renderMasks: function() {
        if(this.maskManager.hasMasks) {
            this.maskManager.renderFrame();
        }
    },

    calculateTransform: function() {
        if(this.finalTransform._matMdf) {
            //Parent comp transform + localTransform
            var tr = this.comp.getTransform();
            var newTransform = this.localTransform;
            this.finalTransform.mat.clone(newTransform);
            var p = tr.props;
            newTransform.transform(p[0],p[1],p[2],p[3],p[4],p[5],p[6],p[7],p[8],p[9],p[10],p[11],p[12],p[13],p[14],p[15]);
            //TODO: only update the uniform if needed. This is costly.
            this.glContext.uniformMatrix4fv(this.mat4UniformLoc, false, this.localTransform.props);
        }
    },

    renderLayer: function() {
        // copy to comp's frame buffer
        // TODO: check if needed since WebGLCompElement is also changing buffers
        this.comp.switchBuffer();

        var glContext = this.glContext;
        glContext.useProgram(this.program);

        this.calculateTransform();
        // glContext.vertexAttribPointer(this.positionAttributeLocation, 2, glContext.FLOAT, false, 0, 0);
        // glContext.vertexAttribPointer(this.texcoordLocation, 2, glContext.FLOAT, false, 0, 0);
        glContext.drawArrays(glContext.TRIANGLES, 0, 6);
    },

    destroy: function(){
        this.glContext = null;
        this.data = null;
        this.globalData = null;
        this.maskManager.destroy();
    },
    
    createFramebuffers: function(glContext){
        if(this.framebuffersData.length) {
            return;
        }
        var layerSize = this.getSize();
        // Frame buffer objects fof effects
        for (var ii = 0; ii < 2; ++ii) {
            var bufferWithTexture = this.createFrameBufferWithTexture(glContext, layerSize.w, layerSize.h);
            this.framebuffersData.push(bufferWithTexture)
        }
    },
    createFrameBufferWithTexture: function(glContext, width, height) {

        // Create a framebuffer
        var framebuffer = glContext.createFramebuffer();
        glContext.bindFramebuffer(glContext.FRAMEBUFFER, framebuffer);

        // Attach a texture to it.
        var texture = textureFactory(glContext);

        // make the texture the same size as the image
        glContext.texImage2D(
            glContext.TEXTURE_2D, 0, glContext.RGBA, width, height, 0,
            glContext.RGBA, glContext.UNSIGNED_BYTE, null);
        glContext.framebufferTexture2D(glContext.FRAMEBUFFER, glContext.COLOR_ATTACHMENT0, glContext.TEXTURE_2D, texture, 0);
        this.comp.switchBuffer();
        
        return {
            texture: texture,
            framebuffer: framebuffer
        }
    },
    createRenderableComponents: function() {
        this.maskManager = new WMaskElement(this.data, this);
        if(this.maskManager.hasMasks || this.data.tt) {
            this.createFramebuffers(this.glContext);
        }
    },

    //
    mHelper: new Matrix()
};
WebGLBaseElement.prototype.hide = CVBaseElement.prototype.hideElement;
WebGLBaseElement.prototype.show = CVBaseElement.prototype.showElement;
