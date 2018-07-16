function WSolidElement(data, globalData, comp) {
    this.initElement(data,globalData,comp);
    this.gl = globalData.canvasContext;
    var rgbColor = hexToRgb(this.data.sc);
    var vsh = get_shader('base_layer_shader_vert');
    var fsh = get_shader('solid_layer_shader_frag');

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

    var color_loc = this.gl.getUniformLocation(this.program, "colorUniform");
    this.gl.uniform4fv(color_loc, [rgbColor.r / 255,rgbColor.g / 255,rgbColor.b / 255,1]);

}
extendPrototype([BaseElement, TransformElement, WebGLBaseElement, HierarchyElement, FrameElement, RenderableElement], WSolidElement);

WSolidElement.prototype.initElement = SVGShapeElement.prototype.initElement;

WSolidElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame;

WSolidElement.prototype.renderInnerContent = function() {

    this.gl.useProgram(this.program);

    this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    //var size = 2;          // 2 components per iteration
    //var type = this.gl.FLOAT;   // the data is 32bit floats
    //var normalize = false; // don't normalize the data
    //var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    //var offset = 0;        // start at the beginning of the buffer
    var tr = this.comp.getTransform();
    var newTransform = new Matrix();
    this.finalTransform.mat.clone(newTransform);
    var p = tr.props;
    newTransform.transform(p[0],p[1],p[2],p[3],p[4],p[5],p[6],p[7],p[8],p[9],p[10],p[11],p[12],p[13],p[14],p[15]);
    //this.finalTransform.mat
    this.gl.uniformMatrix4fv(this.mat4UniformLoc, false, newTransform.props);
    //this.gl.uniformMatrix4fv(this.mat4UniformLoc, false, this.finalTransform.mat.props);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    
    //
};