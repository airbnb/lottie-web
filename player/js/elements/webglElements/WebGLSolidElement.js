function WSolidElement(data, globalData, comp) {
    this.glContext = globalData.glContext;
    this.layerSize = {
        w: data.sw,
        h: data.sh
    }
    var glContext = this.glContext;
    this.initElement(data, globalData, comp);
    
    var vsh = get_shader('image_layer_shader_vert');
    var fsh = get_shader('image_layer_shader_frag');

    var vertexShader = WebGLProgramFactory.createShader(glContext, glContext.VERTEX_SHADER, vsh);
    var fragmentShader = WebGLProgramFactory.createShader(glContext, glContext.FRAGMENT_SHADER, fsh);
    this.program = WebGLProgramFactory.createProgram(glContext, vertexShader, fragmentShader);

    this.positionAttributeLocation = glContext.getAttribLocation(this.program, "a_position");
    glContext.enableVertexAttribArray(this.positionAttributeLocation);
    glContext.vertexAttribPointer(this.positionAttributeLocation, 2, glContext.FLOAT, false, 0, 0);
    this.mat4UniformLoc = glContext.getUniformLocation(this.program, "uMatrix");
    this.localmat4UniformLoc = glContext.getUniformLocation(this.program, "localMatrix");

    glContext.useProgram(this.program);
    var localMatrix = new Matrix();
    localMatrix.scale(this.data.sw, this.data.sh);
    glContext.uniformMatrix4fv(this.localmat4UniformLoc, false, localMatrix.props);

    /*glContext.enableVertexAttribArray(this.positionAttributeLocation);
    glContext.vertexAttribPointer(this.positionAttributeLocation, 2, glContext.FLOAT, false, 0, 0);*/

    this.texture = textureFactory(glContext);
    var canvas = createTag('canvas');
    canvas.width = this.data.sw;
    canvas.height = this.data.sh;
    var canvasContext = canvas.getContext('2d');

    /*var grd=canvasContext.createLinearGradient(0,0,this.data.sw,this.data.sh);
    grd.addColorStop(0,"red");
    grd.addColorStop(1,"green");
    canvasContext.fillStyle=grd;*/
    canvasContext.fillStyle = this.data.sc;
    canvasContext.rect(0,0,this.data.sw, this.data.sh);
    canvasContext.fill();
    /*document.body.appendChild(canvas);
    canvas.style.position = 'absolute';
    canvas.style.zIndex = '1000';
    canvas.style.top = '500px';*/
    glContext.bindTexture(glContext.TEXTURE_2D, this.texture);
    this._finalTexture = this.texture;
    glContext.texImage2D(glContext.TEXTURE_2D, 0, glContext.RGBA, glContext.RGBA, glContext.UNSIGNED_BYTE, canvas);

}
extendPrototype([BaseElement, TransformElement, WebGLBaseElement, HierarchyElement, FrameElement, RenderableElement], WSolidElement);

WSolidElement.prototype.initElement = SVGShapeElement.prototype.initElement;

WSolidElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame;

WSolidElement.prototype.renderInnerContent = function() {
    var glContext = this.glContext;
    glContext.bindTexture(glContext.TEXTURE_2D, this.texture);
    this._finalTexture = this.texture;
    this.renderEffects();
    //
};

WSolidElement.prototype.getSize = function() {
    return this.layerSize;
}