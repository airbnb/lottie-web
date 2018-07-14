function WTintFilter(filterManager, elem){
    var gl = elem.globalData.canvasContext;
    var vsh = get_shader('base_effect_shader_vert');

    var fsh = get_shader('tint_shader_frag');

    var vertexShader = WebGLProgramFactory.createShader(gl, gl.VERTEX_SHADER, vsh);
    var fragmentShader = WebGLProgramFactory.createShader(gl, gl.FRAGMENT_SHADER, fsh);
    this.program = WebGLProgramFactory.createProgram(gl, vertexShader, fragmentShader);

    gl.useProgram(this.program);
    this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
    gl.enableVertexAttribArray(this.positionAttributeLocation);
    gl.vertexAttribPointer(this.positionAttributeLocation, 2,gl.FLOAT, false, 0, 0);


    this.blackToColorLoc = gl.getUniformLocation(this.program, "blackToColor");
    this.whiteToColorLoc = gl.getUniformLocation(this.program, "whiteToColor");
    this.amountLoc = gl.getUniformLocation(this.program, "color_amount");
    gl.uniform1f(this.amountLoc, 0.5);


    this.filterManager = filterManager;
    this.gl = gl;
    this.currentBlackColor = [-1,-1,-1,-1];
    this.currentWhiteColor = [-1,-1,-1,-1];
    this.currentAmount = -1;
}

WTintFilter.prototype.renderFrame = function(forceRender, buffer){
    this.gl.useProgram(this.program);
    var col = this.filterManager.effectElements[0].p.v;
    var currCol = this.currentBlackColor;
    if(currCol[0] !== col[0] || currCol[1] !== col[1] || currCol[2] !== col[2]) {
        this.gl.uniform4fv(this.blackToColorLoc, col);
        currCol[0] = col[0];
        currCol[1] = col[1];
        currCol[2] = col[2];
    }
    col = this.filterManager.effectElements[1].p.v;
    currCol = this.currentWhiteColor;
    if(currCol[0] !== col[0] || currCol[1] !== col[1] || currCol[2] !== col[2]) {
        this.gl.uniform4fv(this.whiteToColorLoc, col);
        currCol[0] = col[0];
        currCol[1] = col[1];
        currCol[2] = col[2];
    }
    if(this.currentAmount !== this.filterManager.effectElements[2].p.v/100) {
        this.gl.uniform1f(this.amountLoc, this.filterManager.effectElements[2].p.v/100);
        this.currentAmount = this.filterManager.effectElements[2].p.v/100;
    }
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
         
    //drawWithKernel();
    if(forceRender || this.filterManager._mdf){
    }
};