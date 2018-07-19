function WImageElement(data, globalData, comp) {
    this.assetData = globalData.getAssetData(data.refId);
    this.img = new Image();
    this.img.crossOrigin = 'anonymous';
    this.initElement(data,globalData,comp);
    this.gl = globalData.canvasContext;
    this.globalData.addPendingElement();

    var vsh = get_shader('image_layer_shader_vert');

    var fsh = get_shader('image_layer_shader_frag');


    var vertexShader = WebGLProgramFactory.createShader(this.gl, this.gl.VERTEX_SHADER, vsh);
    var fragmentShader = WebGLProgramFactory.createShader(this.gl, this.gl.FRAGMENT_SHADER, fsh);
    this.program = WebGLProgramFactory.createProgram(this.gl, vertexShader, fragmentShader);
    this.positionAttributeLocation = this.gl.getAttribLocation(this.program, "a_position");
    this.gl.enableVertexAttribArray(this.positionAttributeLocation);
    this.mat4UniformLoc = this.gl.getUniformLocation(this.program, "uMatrix");
    this.localmat4UniformLoc = this.gl.getUniformLocation(this.program, "localMatrix");
    this.texcoordLocation = this.gl.getAttribLocation(this.program, "a_texCoord");

    var localMatrix = new Matrix();
    localMatrix.scale(this.assetData.w, this.assetData.h);
    this.gl.useProgram(this.program);
    this.gl.uniformMatrix4fv(this.localmat4UniformLoc, false, localMatrix.props);
    this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

    this.texture = textureFactory(this.gl);
    // creating frame buffers
    if(this.renderableEffectsManager.filters.length) {
        this.createFramebuffers(this.gl, this.assetData.w, this.assetData.h);
    }
    
}

extendPrototype([BaseElement, TransformElement, WebGLBaseElement, HierarchyElement, FrameElement, RenderableElement], WImageElement);

WImageElement.prototype.initElement = SVGShapeElement.prototype.initElement;

WImageElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame;

WImageElement.prototype.imageLoaded = function() {

	var gl = this.gl;
	var image = this.img;

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.enableVertexAttribArray(this.texcoordLocation);

    gl.vertexAttribPointer(this.texcoordLocation, 2, gl.FLOAT, false, 0, 0);
    // Turn on the teccord attribute


    this.globalData.elementLoaded();
};

WImageElement.prototype.imageFailed = function() {

}

WImageElement.prototype.createContent = function(){
    var img = this.img;
    img.addEventListener('load', this.imageLoaded.bind(this), false);
    img.addEventListener('error', this.imageFailed.bind(this), false);
    var assetPath = this.globalData.getAssetsPath(this.assetData);
    img.src = assetPath;
    
};

WImageElement.prototype.renderInnerContent = function() {


	if(this.texture) {
        var gl = this.gl;


        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        
        //rendering effects
        var filters = this.renderableEffectsManager.filters;
        if(filters.length) {
            var i, len = filters.length;
            gl.viewport(0, 0, this.assetData.w, this.assetData.h);
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

        gl.useProgram(this.program);
        
        //Parent comp transform + localTransform
        var tr = this.comp.getTransform();
        var newTransform = new Matrix();
        this.finalTransform.mat.clone(newTransform);
        var p = tr.props;
        newTransform.transform(p[0],p[1],p[2],p[3],p[4],p[5],p[6],p[7],p[8],p[9],p[10],p[11],p[12],p[13],p[14],p[15]);
        this.gl.uniformMatrix4fv(this.mat4UniformLoc, false, newTransform.props);
        //
	    gl.drawArrays(gl.TRIANGLES, 0, 6);

	}
    //
};

WImageElement.prototype.getSize = function() {
    return this.assetData;
}