function WRippleEffect(filterManager, elem){
    var gl = elem.globalData.canvasContext;
    
    var vsh = get_shader('ripple_shader_vert');

    var fsh = get_shader('ripple_shader_frag');

    var vertexShader = WebGLProgramFactory.createShader(gl, gl.VERTEX_SHADER, vsh);
    var fragmentShader = WebGLProgramFactory.createShader(gl, gl.FRAGMENT_SHADER, fsh);
    this.program = WebGLProgramFactory.createProgram(gl, vertexShader, fragmentShader);

    this.filterManager = filterManager;
    this.gl = gl;
    this.elem = elem;
}

WRippleEffect.prototype.renderFrame = function(forceRender, buffer){
    var effectElements = this.filterManager.effectElements;
    this.gl.useProgram(this.program);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
};