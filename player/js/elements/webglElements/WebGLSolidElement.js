function WSolidElement(data, globalData, comp) {
    this.gl = globalData.canvasContext;
    this.layerSize = {
        w: data.sw,
        h: data.sh
    }
    this.initElement(data,globalData,comp);
    var rgbColor = hexToRgb(this.data.sc);
    var vsh = get_shader(this.maskManager.hasMasks ? 'base_layer_with_mask_shader_vert' : 'base_layer_shader_vert');
    var fsh = get_shader(this.maskManager.hasMasks ? 'solid_layer_with_mask_shader_frag' : 'solid_layer_shader_frag');

    var vertexShader = WebGLProgramFactory.createShader(this.gl, this.gl.VERTEX_SHADER, vsh);
    var fragmentShader = WebGLProgramFactory.createShader(this.gl, this.gl.FRAGMENT_SHADER, fsh);
    this.program = WebGLProgramFactory.createProgram(this.gl, vertexShader, fragmentShader);

    var gl = this.gl;
    this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
    gl.enableVertexAttribArray(this.positionAttributeLocation);
    gl.vertexAttribPointer(this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    this.mat4UniformLoc = gl.getUniformLocation(this.program, "uMatrix");
    this.localmat4UniformLoc = gl.getUniformLocation(this.program, "localMatrix");

    gl.useProgram(this.program);
    var localMatrix = new Matrix();
    localMatrix.scale(this.data.sw, this.data.sh);
    gl.uniformMatrix4fv(this.localmat4UniformLoc, false, localMatrix.props);

    gl.enableVertexAttribArray(this.positionAttributeLocation);
    gl.vertexAttribPointer(this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    var color_loc = gl.getUniformLocation(this.program, "colorUniform");
    gl.uniform4fv(color_loc, [rgbColor.r / 255,rgbColor.g / 255,rgbColor.b / 255,1]);

    if(this.maskManager.hasMasks) {
        this.texcoordLocation = gl.getAttribLocation(this.program, "a_texCoord");
        gl.enableVertexAttribArray(this.texcoordLocation);
        gl.vertexAttribPointer(this.texcoordLocation, 2, gl.FLOAT, false, 0, 0);
    }

}
extendPrototype([BaseElement, TransformElement, WebGLBaseElement, HierarchyElement, FrameElement, RenderableElement], WSolidElement);

WSolidElement.prototype.initElement = SVGShapeElement.prototype.initElement;

WSolidElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame;

WSolidElement.prototype.renderInnerContent = function() {
    
    this.renderLayer();
    this.renderEffects();
    //
};

WSolidElement.prototype.getSize = function() {
    return this.layerSize;
}