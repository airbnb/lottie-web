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

    var positions = [];
    var i, j, len = 10, jlen = 10;
    for(j = 0; j < jlen; j += 1) {
        for(i = 0; i < len; i += 1) {
            /*positions.push(i/10);
            positions.push(j/10);
            positions.push((i+1)/10);
            positions.push(j/10);
            positions.push(i/10);
            positions.push((j+1)/10);
            positions.push((i+1)/10);
            positions.push(j/10);
            positions.push((i+1)/10);
            positions.push((j+1)/10);
            positions.push(i/10);
            positions.push((j+1)/10);*/
            positions.push(Math.random());
            positions.push(Math.random());
            positions.push(Math.random());
            positions.push(Math.random());
            positions.push(Math.random());
            positions.push(Math.random());
            positions.push(Math.random());
            positions.push(Math.random());
            positions.push(Math.random());
            positions.push(Math.random());
            positions.push(Math.random());
            positions.push(Math.random());
        }   
    }
    this.positions = new Float32Array(positions);
    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    var texture_positions = [];
    var i, j, len = 10, jlen = 10;
    for(j = 0; j < jlen; j += 1) {
        for(i = 0; i < len; i += 1) {
            /*texture_positions.push(Math.random());
            texture_positions.push(Math.random());
            texture_positions.push(Math.random());
            texture_positions.push(Math.random());
            texture_positions.push(Math.random());
            texture_positions.push(Math.random());
            texture_positions.push(Math.random());
            texture_positions.push(Math.random());
            texture_positions.push(Math.random());
            texture_positions.push(Math.random());
            texture_positions.push(Math.random());
            texture_positions.push(Math.random());*/
            texture_positions.push(i/10);
            texture_positions.push(j/10);
            texture_positions.push((i+1)/10);
            texture_positions.push(j/10);
            texture_positions.push(i/10);
            texture_positions.push((j+1)/10);
            texture_positions.push((i+1)/10);
            texture_positions.push(j/10);
            texture_positions.push((i+1)/10);
            texture_positions.push((j+1)/10);
            texture_positions.push(i/10);
            texture_positions.push((j+1)/10);
        }   
    }
    this.texture_positions = new Float32Array(texture_positions);
    this.textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.texture_positions, gl.STATIC_DRAW);
}

WPuppetPinEffect.prototype.renderFrame = function(forceRender, buffer){
    var effectElements = this.filterManager.effectElements;
    var gl = this.gl;
    this.gl.useProgram(this.program);
    
    //POSITION
    var positions = [];
    var i, j, len = 10, jlen = 10;
    for(j = 0; j < jlen; j += 1) {
        for(i = 0; i < len; i += 1) {
            /*positions.push(i/10);
            positions.push(j/10);
            positions.push((i+1)/10);
            positions.push(j/10);
            positions.push(i/10);
            positions.push((j+1)/10);
            positions.push((i+1)/10);
            positions.push(j/10);
            positions.push((i+1)/10);
            positions.push((j+1)/10);
            positions.push(i/10);
            positions.push((j+1)/10);*/
            positions.push(Math.random());
            positions.push(Math.random());
            positions.push(Math.random());
            positions.push(Math.random());
            positions.push(Math.random());
            positions.push(Math.random());
            positions.push(Math.random());
            positions.push(Math.random());
            positions.push(Math.random());
            positions.push(Math.random());
            positions.push(Math.random());
            positions.push(Math.random());
        }   
    }
    this.positions = new Float32Array(positions);
    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(this.positionAttributeLocation);
    gl.vertexAttribPointer(this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    //TEXTURE
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
    gl.enableVertexAttribArray(this.texcoordLocation);
    gl.vertexAttribPointer(this.texcoordLocation, 2, gl.FLOAT, false, 0, 0);
    //DRAWING
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6 * 100);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.elem.globalData.positionBuffer);
};