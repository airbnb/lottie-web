function WPuppetPinEffect(filterManager, elem) {

	// build the grid out of triangles: try 1 / 10
	// define index buffer as pointers to vertices
	// calculate vertices positions on each frame
	//// try warping and mapping texture correctly
	// TODO: look into geometry instancing
	// interpolate on the graphics card
	// 

	// setup network of masses and springs

	var gl = elem.globalData.canvasContext;
    var vsh = get_shader('puppet_pin_shader_vert');
    var fsh = get_shader('puppet_pin_shader_frag');

    var vertexShader = WebGLProgramFactory.createShader(gl, gl.VERTEX_SHADER, vsh);
    var fragmentShader = WebGLProgramFactory.createShader(gl, gl.FRAGMENT_SHADER, fsh);
    this.program = WebGLProgramFactory.createProgram(gl, vertexShader, fragmentShader);

    this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
    gl.enableVertexAttribArray(this.positionAttributeLocation);
    this.texcoordLocation = gl.getAttribLocation(this.program, "a_texCoord");
    gl.enableVertexAttribArray(this.texcoordLocation);

    this.filterManager = filterManager;
    this.gl = gl;
    this.elem = elem;
}

WPuppetPinEffect.prototype.renderFrame = function(forceRender, buffer){
    var effectElements = this.filterManager.effectElements;
    var gl = this.gl;
    this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
    gl.vertexAttribPointer(this.texcoordLocation, 2, gl.FLOAT, false, 0, 4 * 12 * 1);
    gl.vertexAttribPointer(this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 4 * 12 * 1);
    this.gl.useProgram(this.program);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6 * 75);
};