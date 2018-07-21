function WNoOpEffect(elem){
    var gl = elem.globalData.canvasContext;
    var vsh = get_shader('base_effect_shader_vert');

    var fsh = get_shader('noop_effect_shader_frag');

    var vertexShader = WebGLProgramFactory.createShader(gl, gl.VERTEX_SHADER, vsh);
    var fragmentShader = WebGLProgramFactory.createShader(gl, gl.FRAGMENT_SHADER, fsh);
    this.program = WebGLProgramFactory.createProgram(gl, vertexShader, fragmentShader);

    gl.useProgram(this.program);
    this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
    gl.enableVertexAttribArray(this.positionAttributeLocation);
    gl.vertexAttribPointer(this.positionAttributeLocation, 2,gl.FLOAT, false, 0, 0);

    this.gl = gl;
}

WNoOpEffect.prototype.renderFrame = function(forceRender, buffer){
    this.gl.useProgram(this.program);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
};