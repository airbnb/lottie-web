function WTrackMatte(element, mask) {
	this.element = element;
	this.mask = mask;

	var gl = mask.globalData.canvasContext;
    var vsh = get_shader('track_matte_shader_vert');

    var fsh = get_shader('track_matte_shader_frag');

    var vertexShader = WebGLProgramFactory.createShader(gl, gl.VERTEX_SHADER, vsh);
    var fragmentShader = WebGLProgramFactory.createShader(gl, gl.FRAGMENT_SHADER, fsh);
    this.program = WebGLProgramFactory.createProgram(gl, vertexShader, fragmentShader);
    
    var compSize = this.element.getSize();
    this.texture = textureFactory(gl);
    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, compSize.w, compSize.h, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, null);
    console.log('compSize: ', compSize)
    gl.useProgram(this.program);
    this.texcoordLocation = gl.getAttribLocation(this.program, "a_texCoord");
    gl.enableVertexAttribArray(this.texcoordLocation);
    gl.vertexAttribPointer(this.texcoordLocation, 2, gl.FLOAT, false, 0, 0);
    this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
    gl.enableVertexAttribArray(this.positionAttributeLocation);
    gl.vertexAttribPointer(this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    var origin_image = gl.getUniformLocation(this.program, "origin_image");
    var mask_image = gl.getUniformLocation(this.program, "mask_image");
    gl.uniform1i(origin_image, 0);  // texture unit 0
    gl.uniform1i(mask_image, 1);  // texture unit 1


    /*this.canvas = createTag('canvas');
    this.canvas.width = compSize.w;
    this.canvas.height = compSize.h;
    this.canvasContext = this.canvas.getContext('2d');*/

    this.gl = gl;
}

WTrackMatte.prototype.renderFrame = function() {

    //activate texture 1


	var gl = this.gl;
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    //this.mask.renderFrame();
    //this.mask.renderEffects();
    this.mask.renderLayer();
    gl.activeTexture(gl.TEXTURE0);
    gl.useProgram(this.program);
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