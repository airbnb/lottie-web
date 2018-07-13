function WTwirlEffect(filterManager, gl){
    
    var vsh = get_shader('twirl_shader_vert');

    var fsh = get_shader('twirl_shader_frag');

    var vertexShader = WebGLProgramFactory.createShader(gl, gl.VERTEX_SHADER, vsh);
    var fragmentShader = WebGLProgramFactory.createShader(gl, gl.FRAGMENT_SHADER, fsh);
    this.program = WebGLProgramFactory.createProgram(gl, vertexShader, fragmentShader);

    gl.useProgram(this.program);
    this.radiusLocation = gl.getUniformLocation(this.program, "radius");
    this.angleLocation = gl.getUniformLocation(this.program, "angle");


    this.filterManager = filterManager;
    this.gl = gl;
}

WTwirlEffect.prototype.renderFrame = function(forceRender, buffer){
    this.gl.useProgram(this.program);
    // console.log(this.filterManager.effectElements);
    // console.log(this.filterManager.effectElements[0].p.v);
    this.gl.uniform1f(this.angleLocation, this.filterManager.effectElements[0].p.v);
    this.gl.uniform1f(this.radiusLocation, this.filterManager.effectElements[1].p.v * 0.70 /100);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
         
    //drawWithKernel();
    if(forceRender || this.filterManager._mdf){
    }
};