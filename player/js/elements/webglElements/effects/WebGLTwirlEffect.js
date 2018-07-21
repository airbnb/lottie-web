function WTwirlEffect(filterManager, elem){
    var gl = elem.globalData.canvasContext;
    
    var vsh = get_shader('twirl_shader_vert');

    var fsh = get_shader('twirl_shader_frag');

    var vertexShader = WebGLProgramFactory.createShader(gl, gl.VERTEX_SHADER, vsh);
    var fragmentShader = WebGLProgramFactory.createShader(gl, gl.FRAGMENT_SHADER, fsh);
    this.program = WebGLProgramFactory.createProgram(gl, vertexShader, fragmentShader);

    gl.useProgram(this.program);
    this.radiusLocation = gl.getUniformLocation(this.program, "radius");
    this.angleLocation = gl.getUniformLocation(this.program, "angle");
    this.centerLocation = gl.getUniformLocation(this.program, "center");


    this.filterManager = filterManager;
    this.gl = gl;
    this.elem = elem;
}

WTwirlEffect.prototype.renderFrame = function(forceRender, buffer){
    var effectElements = this.filterManager.effectElements;
    this.gl.useProgram(this.program);
    this.gl.uniform1f(this.angleLocation, effectElements[0].p.v);
    this.gl.uniform1f(this.radiusLocation, effectElements[1].p.v / 100);

    var elemSize = this.elem.getSize();
    var _x = elemSize.w * 0.5;
    var _y = elemSize.h * 0.5;
   
    this.gl.uniform2fv(this.centerLocation
        , [ 0.5 * ((effectElements[2].p.v[0] - _x) / _x)
        , 0.5 * ((effectElements[2].p.v[1] - _y) / _y)] );

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
         
    if(forceRender || this.filterManager._mdf){
    }
};