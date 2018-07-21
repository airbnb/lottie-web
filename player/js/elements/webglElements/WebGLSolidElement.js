function WSolidElement(data, globalData, comp) {
    this.gl = globalData.canvasContext;
    this.layerSize = {
        w: data.sw,
        h: data.sh
    }
    this.initElement(data,globalData,comp);
    var vsh = get_shader('image_layer_shader_vert');
    var fsh = get_shader('image_layer_shader_frag');

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

    this.texture = textureFactory(gl);
    var canvas = createTag('canvas');
    canvas.width = this.data.sw;
    canvas.height = this.data.sh;
    var canvasContext = canvas.getContext('2d');
    canvasContext.fillStyle = this.data.sc;
    canvasContext.rect(0,0,this.data.sw, this.data.sh);
    canvasContext.fill();
    /*document.body.appendChild(canvas);
    canvas.style.position = 'absolute';
    canvas.style.zIndex = '1000';
    canvas.style.top = '500px';*/
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

}
extendPrototype([BaseElement, TransformElement, WebGLBaseElement, HierarchyElement, FrameElement, RenderableElement], WSolidElement);

WSolidElement.prototype.initElement = SVGShapeElement.prototype.initElement;

WSolidElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame;

WSolidElement.prototype.renderInnerContent = function() {

    var gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    this.renderEffects();
    this.renderLayer();
    //
};

WSolidElement.prototype.getSize = function() {
    return this.layerSize;
}