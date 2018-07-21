function WSolidElement(data, globalData, comp) {
    this.gl = globalData.canvasContext;
    this.initElement(data,globalData,comp);
    var rgbColor = hexToRgb(this.data.sc);
    var vsh = get_shader('base_layer_shader_vert');
    var fsh = get_shader('solid_layer_shader_frag');

    var vertexShader = WebGLProgramFactory.createShader(this.gl, this.gl.VERTEX_SHADER, vsh);
    var fragmentShader = WebGLProgramFactory.createShader(this.gl, this.gl.FRAGMENT_SHADER, fsh);
    this.program = WebGLProgramFactory.createProgram(this.gl, vertexShader, fragmentShader);


    this.positionAttributeLocation = this.gl.getAttribLocation(this.program, "a_position");
    this.gl.enableVertexAttribArray(this.positionAttributeLocation);
    this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
    this.mat4UniformLoc = this.gl.getUniformLocation(this.program, "uMatrix");
    this.localmat4UniformLoc = this.gl.getUniformLocation(this.program, "localMatrix");

    this.gl.useProgram(this.program);
    var localMatrix = new Matrix();
    localMatrix.scale(this.data.sw, this.data.sh);
    this.layerSize = {
        w: this.data.sw,
        h: this.data.sh
    }
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

    this.renderEffects();
    this.renderLayer();
    //
};

WSolidElement.prototype.getSize = function() {
    return this.layerSize;
}