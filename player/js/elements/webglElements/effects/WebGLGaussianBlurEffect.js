function WGaussianBlurEffect(filterManager, elem){

    var gl = elem.globalData.canvasContext;
    
    // var vsh = get_shader('gaussian_blur_shader_vert');
    var vsh = '// gaussian_blur_shader.vert\nattribute vec4 a_position;\nattribute vec2 a_texCoord;\nvarying vec2 v_texCoord;\nvarying vec2 vUv;\nvoid main() {\n   vec4 zeroToOne = a_position / 1.0;\n    vec4 zeroToTwo = zeroToOne * 2.0;\n vec4 clipSpace = zeroToTwo - 1.0;\n gl_Position = vec4(clipSpace);\n    vUv = a_texCoord;\n}';

    // var fsh = get_shader('gaussian_blur_shader_frag');
    var fsh = '// gaussian_blur_shader.frag\nprecision mediump float;\nuniform sampler2D u_image;\nuniform float weights[100];\nuniform int blurriness;\nvarying vec2 vUv;\n\nvec4 calculateColorSum(vec2 onePixel) {\n // vec4 colorSum = vec4(0.0, 0.0, 0.0, 1.0);\n  vec4 colorSum = vec4(0.0, 0.0, 0.0, 1.0);\n // vec4 colorSum = texture2D(u_image, vUv);\n   for(int i = 0; i < 50; i += 1) {\n      if(i >= blurriness / 2) {\n         return colorSum;\n      }\n     colorSum += texture2D(u_image, vUv + onePixel * vec2(-1 * ((blurriness / 2) - i), 0)) * weights[i];\n       colorSum += texture2D(u_image, vUv + onePixel * vec2(1 * ((blurriness / 2) - i), 0)) * weights[i];\n\n      // colorSum += vec4(0.0, 1.0, 0.0, 1.0) * weights[i];\n     // colorSum += vec4(0.0, 1.0, 0.0, 1.0) * weights[i];\n     // colorSum += texture2D(u_image, vUv) * weights[i];\n      // colorSum += texture2D(u_image, vUv + onePixel * vec2(1 * ((blurriness / 2) - i), 0)) * weights[i];\n     /* vec4 texturePoint = texture2D(u_image, vUv);\n       if(texturePoint.r == 1.0) {\n           colorSum = vec4(0.0, 0.0, 1.0, 1.0);\n      } */\n  }\n return colorSum;\n}\n\nvoid main() {\n  vec2 u_textureSize = vec2(1200.0 * 2.5, 600.0 * 2.5);\n vec2 onePixel = vec2(1.0, 0.0) / u_textureSize;\n   gl_FragColor = calculateColorSum(onePixel);\n   // gl_FragColor = texture2D(u_image, vUv);\n}';

    var vertexShader = WebGLProgramFactory.createShader(gl, gl.VERTEX_SHADER, vsh);
    var fragmentShader = WebGLProgramFactory.createShader(gl, gl.FRAGMENT_SHADER, fsh);
    this.program = WebGLProgramFactory.createProgram(gl, vertexShader, fragmentShader);

    gl.useProgram(this.program);
    this.blurrinessLocation = gl.getUniformLocation(this.program, "blurriness");
    this.weightsLocation = gl.getUniformLocation(this.program, "weights");

    this.filterManager = filterManager;
    this.gl = gl;
    this.elem = elem;
    this.weights = new Float32Array(100);
}

WGaussianBlurEffect.prototype.getFactorial = function( num ) {
    var i, result = 1;
    for(i = 1; i <= num;  i++) {
        result *= i;
    }
    return result;
}

WGaussianBlurEffect.prototype.getWeight = function( pos, row ) {
    var rowF = this.getFactorial(row);
    var posF = this.getFactorial(pos);
    var diffF = this.getFactorial(row - pos);
    return (rowF/(posF*diffF));
}

WGaussianBlurEffect.prototype.createWeights = function( num, weights ) {
    num = Math.round(Math.min(num, 100));
    var i = 0;
    var cont = 0;
    while(i < num) {
        weights[i] = this.getWeight(i, (num - 1)) / Math.pow(2, (num - 1));
        cont += weights[i];
        // weights[i] = this.getWeight(i, (num - 1));
        i += 1;
    }
}

WGaussianBlurEffect.prototype.renderFrame = function(forceRender) {
    var effectElements = this.filterManager.effectElements;
    var blurriness = this.filterManager.getEffectByName('Blurriness');
    this.gl.useProgram(this.program);
    if(forceRender || effectElements[0].p._mdf) {
        var blurriness = Math.round(effectElements[0].p.v) * window.devicePixelRatio;
        blurriness = blurriness % 2 === 1 ? blurriness - 1 : blurriness;
        this.createWeights(blurriness, this.weights);
        this.gl.uniform1i(this.blurrinessLocation, blurriness);
        this.gl.uniform1fv(this.weightsLocation, this.weights);
    }
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
};

lottie.registerEffect('ADBE Gaussian Blur 2', WGaussianBlurEffect);