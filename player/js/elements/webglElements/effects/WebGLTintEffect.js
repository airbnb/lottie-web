function WTintFilter(filterManager, gl){
    
    var vsh = 'attribute vec4 a_position;';
    vsh += 'varying vec2 v_texCoord;';
    vsh += 'attribute vec2 a_texCoord;';
    vsh += 'void main() {';
    vsh += 'vec4 zeroToOne = a_position / 1.0;';
    vsh += 'vec4 zeroToTwo = zeroToOne * 2.0;';
    vsh += 'vec4 clipSpace = zeroToTwo - 1.0;';
    vsh += 'gl_Position = vec4(clipSpace);';
    vsh += 'v_texCoord = a_texCoord;';
    vsh += '}';

    var fsh = 'precision mediump float;';
    fsh += 'uniform sampler2D u_image;';
    fsh += 'varying vec2 v_texCoord;';
    fsh += 'uniform vec2 u_textureSize;';
    fsh += 'uniform float color_amount;';
    fsh += 'uniform vec4 whiteToColor;';
    fsh += 'uniform vec4 blackToColor;';

    fsh += 'void main() {';
    fsh += 'vec4 textureValue = texture2D(u_image, v_texCoord);'
    fsh += 'float saturation = (textureValue.r + textureValue.g + textureValue.b) / 3.0;'
    fsh += 'float r_component = blackToColor.r + (whiteToColor.r - blackToColor.r) * saturation;'
    fsh += 'float g_component = blackToColor.g + (whiteToColor.g - blackToColor.g) * saturation;'
    fsh += 'float b_component = blackToColor.b + (whiteToColor.b - blackToColor.b) * saturation;'
    fsh += 'gl_FragColor = vec4(r_component * color_amount + textureValue.r * (1.0 - color_amount),'
    fsh += 'g_component * color_amount + textureValue.g * (1.0 - color_amount),'
    fsh += 'b_component * color_amount + textureValue.b * (1.0 - color_amount),'
    fsh += '1);'
    fsh += '}';

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