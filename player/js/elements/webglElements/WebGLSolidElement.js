function WSolidElement(data, globalData, comp) {
    this.initElement(data,globalData,comp);
    this.gl = globalData.canvasContext;
    var rgbColor = hexToRgb(this.data.sc);
    var vsh = 'attribute vec4 a_position;';
    vsh += 'uniform mat4 uMatrix;';
    vsh += 'uniform mat4 localMatrix;';
    vsh += 'void main() {';
    vsh += 'gl_Position = uMatrix * localMatrix * a_position;';
    vsh += '}';

    var fsh = 'precision mediump float;';
    fsh += 'void main() {';
    fsh += 'gl_FragColor = vec4(' + rgbColor.r / 255 +', ' + rgbColor.g / 255 +', ' + rgbColor.b / 255 +', 1.0); '; // Look into passing a uniform for the color
    fsh += '}';


    var vertexShader = WebGLProgramFactory.createShader(this.gl, this.gl.VERTEX_SHADER, vsh);
    var fragmentShader = WebGLProgramFactory.createShader(this.gl, this.gl.FRAGMENT_SHADER, fsh);
    this.program = WebGLProgramFactory.createProgram(this.gl, vertexShader, fragmentShader);


    this.positionAttributeLocation = this.gl.getAttribLocation(this.program, "a_position");
    this.gl.enableVertexAttribArray(this.positionAttributeLocation);
    this.mat4UniformLoc = this.gl.getUniformLocation(this.program, "uMatrix");
    this.localmat4UniformLoc = this.gl.getUniformLocation(this.program, "localMatrix");

    this.gl.useProgram(this.program);
    var localMatrix = new Matrix();
    localMatrix.scale(this.data.sw, this.data.sh);
    this.gl.uniformMatrix4fv(this.localmat4UniformLoc, false, localMatrix.props);

    this.gl.enableVertexAttribArray(this.positionAttributeLocation);
    this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
     

}
extendPrototype([BaseElement, TransformElement, WebGLBaseElement, HierarchyElement, FrameElement, RenderableElement], WSolidElement);

WSolidElement.prototype.initElement = SVGShapeElement.prototype.initElement;

WSolidElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame;

WSolidElement.prototype.renderInnerContent = function() {

    this.gl.useProgram(this.program);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    //var size = 2;          // 2 components per iteration
    //var type = this.gl.FLOAT;   // the data is 32bit floats
    //var normalize = false; // don't normalize the data
    //var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    //var offset = 0;        // start at the beginning of the buffer
    this.gl.uniformMatrix4fv(this.mat4UniformLoc, false, this.globalData.getTransform().props);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    //
};