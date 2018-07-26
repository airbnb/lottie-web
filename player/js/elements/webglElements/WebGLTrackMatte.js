function WTrackMatte(element, mask) {
	this.element = element;
	this.mask = mask;
    this.gl = this.element.globalData.canvasContext;

	var gl = this.gl;
    var vsh = get_shader('track_matte_shader_vert');
    var fsh = get_shader('track_matte_shader_frag');
    var vertexShader = WebGLProgramFactory.createShader(gl, gl.VERTEX_SHADER, vsh);
    var fragmentShader = WebGLProgramFactory.createShader(gl, gl.FRAGMENT_SHADER, fsh);
    this.program = WebGLProgramFactory.createProgram(gl, vertexShader, fragmentShader);
    
    var layerSize = this.element.getSize();
    this.texture = textureFactory(gl);
    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, layerSize.w, layerSize.h, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.useProgram(this.program);
    this.texcoordLocation = gl.getAttribLocation(this.program, "a_texCoord");
    gl.enableVertexAttribArray(this.texcoordLocation);
    gl.vertexAttribPointer(this.texcoordLocation, 2, gl.FLOAT, false, 0, 0);
    this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
    gl.enableVertexAttribArray(this.positionAttributeLocation);
    gl.vertexAttribPointer(this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    var origin_image = gl.getUniformLocation(this.program, "original_image");
    var mask_image = gl.getUniformLocation(this.program, "mask_image");
    var matte_type = gl.getUniformLocation(this.program, "matte_type");
    gl.uniform1f(matte_type, this.element.data.tt);
    this.mat4UniformLoc = gl.getUniformLocation(this.program, "uMatrix");
    gl.uniform1i(origin_image, 0);  // texture unit 0
    gl.uniform1i(mask_image, 1);  // texture unit 1
}

WTrackMatte.prototype.renderFrame = function() {

    if(!this.mask) {
        this.element.comp.getTrackMatteElement(this.element);
    }

    // activate texture unit 1
    // bind mask texture / framebuffer to texture unit 1
    // 

	var gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    //Rendering mask content
    gl.bindTexture(gl.TEXTURE_2D, this.mask.texture);
    this.mask.renderEffects();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.element.currentBuffer);
    //Resetting textures and buffers to element texture and buffer
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.mask._finalTexture);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.element._finalTexture);
    gl.useProgram(this.program);
    var layerSize = this.element.getSize();
    // Creating Mask Texture transformation matrix 
    var localMatrix = new Matrix();
    // Scaling matrix by layer size
    localMatrix.scale(layerSize.w, layerSize.h);
    // Cloning mask transformation matrix
    var maskTransform = new Matrix();
    this.mask.finalTransform.mProp.v.clone(maskTransform);
    var maskSize = this.mask.getSize();
    // multiplying mask transformation matrix by inverse of layer matrix
    var layerInverseTransform = this.element.finalTransform.mProp.v.getInverse();
    var p = layerInverseTransform.props;
    maskTransform.transform(p[0],p[1],p[2],p[3],p[4],p[5],p[6],p[7],p[8],p[9],p[10],p[11],p[12],p[13],p[14],p[15]);
    // Getting inverse of mask matrix to find coordinate in texture
    var inverse = maskTransform.getInverse();
    var p = inverse.props;
    localMatrix.transform(p[0],p[1],p[2],p[3],p[4],p[5],p[6],p[7],p[8],p[9],p[10],p[11],p[12],p[13],p[14],p[15]);
    // Scaling matrix by inverse of layer size
    localMatrix.scale(1 / layerSize.w, 1 / layerSize.h);
    localMatrix.scale(layerSize.w / maskSize.w, layerSize.h / maskSize.h);

    gl.uniformMatrix4fv(this.mat4UniformLoc, false, localMatrix.props);
    //
    gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    /*
	var gl = this.gl;
	this.gl.useProgram(this.program);
    //gl.activeTexture(gl.TEXTURE1);
    //gl.bindTexture(gl.TEXTURE_2D, this.texture);
	this.mask.renderFrame();
    //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvas);
    //gl.activeTexture(gl.TEXTURE0);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);*/
}