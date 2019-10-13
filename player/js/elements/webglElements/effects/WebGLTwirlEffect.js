function WTwirlEffect(filterManager, elem, WebGLProgramFactory){
    var glContext = elem.globalData.glContext;
    
    var vsh = get_shader('twirl_shader_vert');

    var fsh = get_shader('twirl_shader_frag');

    var vertexShader = WebGLProgramFactory.createShader(glContext, glContext.VERTEX_SHADER, vsh);
    var fragmentShader = WebGLProgramFactory.createShader(glContext, glContext.FRAGMENT_SHADER, fsh);
    this.program = WebGLProgramFactory.createProgram(glContext, vertexShader, fragmentShader);

    glContext.useProgram(this.program);
    this.radiusLocation = glContext.getUniformLocation(this.program, "radius");
    this.angleLocation = glContext.getUniformLocation(this.program, "angle");
    this.centerLocation = glContext.getUniformLocation(this.program, "center");


    this.filterManager = filterManager;
    this.glContext = glContext;
    this.elem = elem;
}

WTwirlEffect.prototype.renderFrame = function(forceRender, buffer){
    console.log('TWI')
    var effectElements = this.filterManager.effectElements;
    this.glContext.useProgram(this.program);
    this.glContext.uniform1f(this.angleLocation, effectElements[0].p.v);
    this.glContext.uniform1f(this.radiusLocation, effectElements[1].p.v / 100);

    var elemSize = this.elem.getSize();
    var _x = elemSize.w * 0.5;
    var _y = elemSize.h * 0.5;
   
    this.glContext.uniform2fv(this.centerLocation
        , [ 0.5 * ((effectElements[2].p.v[0] - _x) / _x)
        , 0.5 * ((effectElements[2].p.v[1] - _y) / _y)] );

    this.glContext.drawArrays(this.glContext.TRIANGLES, 0, 6);
         
    if(forceRender || this.filterManager._mdf){
    }
};