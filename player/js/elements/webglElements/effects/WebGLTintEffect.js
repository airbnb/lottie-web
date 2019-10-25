function WTintFilter(filterManager, elem, WebGLProgramFactory){
    var glContext = elem.globalData.glContext;
    var vsh = get_shader('base_effect_shader_vert');

    var fsh = get_shader('tint_shader_frag');

    var vertexShader = WebGLProgramFactory.createShader(glContext, glContext.VERTEX_SHADER, vsh);
    var fragmentShader = WebGLProgramFactory.createShader(glContext, glContext.FRAGMENT_SHADER, fsh);
    this.program = WebGLProgramFactory.createProgram(glContext, vertexShader, fragmentShader);

    glContext.useProgram(this.program);
    this.positionAttributeLocation = glContext.getAttribLocation(this.program, "a_position");
    glContext.enableVertexAttribArray(this.positionAttributeLocation);
    glContext.vertexAttribPointer(this.positionAttributeLocation, 2,glContext.FLOAT, false, 0, 0);


    this.blackToColorLoc = glContext.getUniformLocation(this.program, "blackToColor");
    this.whiteToColorLoc = glContext.getUniformLocation(this.program, "whiteToColor");
    this.amountLoc = glContext.getUniformLocation(this.program, "color_amount");
    glContext.uniform1f(this.amountLoc, 0.5);


    this.filterManager = filterManager;
    this.glContext = glContext;
    this.currentBlackColor = [-1,-1,-1,-1];
    this.currentWhiteColor = [-1,-1,-1,-1];
    this.currentAmount = -1;
}

WTintFilter.prototype.renderFrame = function(forceRender, buffer){
    this.glContext.useProgram(this.program);
    var col = this.filterManager.effectElements[0].p.v;
    var currCol = this.currentBlackColor;
    if(currCol[0] !== col[0] || currCol[1] !== col[1] || currCol[2] !== col[2]) {
        this.glContext.uniform4fv(this.blackToColorLoc, col);
        currCol[0] = col[0];
        currCol[1] = col[1];
        currCol[2] = col[2];
    }
    col = this.filterManager.effectElements[1].p.v;
    currCol = this.currentWhiteColor;
    if(currCol[0] !== col[0] || currCol[1] !== col[1] || currCol[2] !== col[2]) {
        this.glContext.uniform4fv(this.whiteToColorLoc, col);
        currCol[0] = col[0];
        currCol[1] = col[1];
        currCol[2] = col[2];
    }
    if(this.currentAmount !== this.filterManager.effectElements[2].p.v/100) {
        this.glContext.uniform1f(this.amountLoc, this.filterManager.effectElements[2].p.v/100);
        this.currentAmount = this.filterManager.effectElements[2].p.v/100;
    }
    this.glContext.drawArrays(this.glContext.TRIANGLES, 0, 6);
         
    if(forceRender || this.filterManager._mdf){
    }
};