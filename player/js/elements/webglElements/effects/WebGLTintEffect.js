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
    fsh += 'uniform float u_kernel[9];';
    fsh += 'uniform float u_kernelWeight;';

    fsh += 'void main() {';
    fsh += 'vec2 resolution = vec2(278.0, 278.0);';
    fsh += 'vec2 onePixel = vec2(1.0, 1.0) / resolution;';
    fsh += 'vec4 colorSum = texture2D(u_image, v_texCoord + onePixel * vec2(-1, -1)) * u_kernel[0] +'
    fsh += 'texture2D(u_image, v_texCoord + onePixel * vec2( 0, -1)) * u_kernel[1] +'
    fsh += 'texture2D(u_image, v_texCoord + onePixel * vec2( 1, -1)) * u_kernel[2] +'
    fsh += 'texture2D(u_image, v_texCoord + onePixel * vec2(-1,  0)) * u_kernel[3] +'
    fsh += 'texture2D(u_image, v_texCoord + onePixel * vec2( 0,  0)) * u_kernel[4] +'
    fsh += 'texture2D(u_image, v_texCoord + onePixel * vec2( 1,  0)) * u_kernel[5] +'
    fsh += 'texture2D(u_image, v_texCoord + onePixel * vec2(-1,  1)) * u_kernel[6] +'
    fsh += 'texture2D(u_image, v_texCoord + onePixel * vec2( 0,  1)) * u_kernel[7] +'
    fsh += 'texture2D(u_image, v_texCoord + onePixel * vec2( 1,  1)) * u_kernel[8] ;'
    fsh += 'gl_FragColor = vec4((colorSum / u_kernelWeight).rgb, 1);'
    fsh += '}';

    var vertexShader = WebGLProgramFactory.createShader(gl, gl.VERTEX_SHADER, vsh);
    var fragmentShader = WebGLProgramFactory.createShader(gl, gl.FRAGMENT_SHADER, fsh);
    this.program = WebGLProgramFactory.createProgram(gl, vertexShader, fragmentShader);

    var kernel = [-1, -1, -1,
        2,  2,  2,
       -1, -1, -1];
    gl.useProgram(this.program);
    this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
    gl.enableVertexAttribArray(this.positionAttributeLocation);
    var kernelLocation = gl.getUniformLocation(this.program, "u_kernel");
    gl.uniform1fv(kernelLocation, kernel);
    var kernelWeightLocation = gl.getUniformLocation(this.program, "u_kernelWeight");
    gl.uniform1f(kernelWeightLocation, computeKernelWeight(kernel));
    var textureSizeLocation = gl.getUniformLocation(this.program, "u_textureSize");
    gl.uniform2f(textureSizeLocation, 278, 278);
    ////

    ////
    gl.vertexAttribPointer(this.positionAttributeLocation, 2,gl.FLOAT, false, 0, 0);

    this.filterManager = filterManager;
    this.gl = gl;
    
}

function computeKernelWeight(kernel) {
    var weight = kernel.reduce(function(prev, curr) {
        return prev + curr;
    });
    return weight <= 0 ? 1 : weight;
  }

WTintFilter.prototype.renderFrame = function(forceRender, buffer){
    this.gl.useProgram(this.program);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
         
    //drawWithKernel();
    if(forceRender || this.filterManager._mdf){

    }
};