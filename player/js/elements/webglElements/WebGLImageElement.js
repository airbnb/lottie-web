function WImageElement(data, globalData, comp) {
    this.assetData = globalData.getAssetData(data.refId);
    this.glContext = globalData.glContext;
    this.gl = globalData.canvasContext;
    var glContext = this.glContext;
    this.texture = textureFactory(glContext);
    glContext.texImage2D(glContext.TEXTURE_2D, 0, glContext.RGBA, 1, 1, 0, glContext.RGBA, glContext.UNSIGNED_BYTE,
              new Uint8Array([0, 0, 0, 0]));

    this.initElement(data,globalData,comp);

    var vsh = get_shader('image_layer_shader_vert');

    var fsh = get_shader('image_layer_shader_frag');

    var vertexShader = WebGLProgramFactory.createShader(glContext, glContext.VERTEX_SHADER, vsh);
    var fragmentShader = WebGLProgramFactory.createShader(glContext, glContext.FRAGMENT_SHADER, fsh);
    this.program = WebGLProgramFactory.createProgram(glContext, vertexShader, fragmentShader);
    this.positionAttributeLocation = glContext.getAttribLocation(this.program, "a_position");
    glContext.enableVertexAttribArray(this.positionAttributeLocation);
    this.mat4UniformLoc = glContext.getUniformLocation(this.program, "uMatrix");
    this.localmat4UniformLoc = glContext.getUniformLocation(this.program, "localMatrix");

    var localMatrix = new Matrix();
    localMatrix.scale(this.assetData.w, this.assetData.h);
    glContext.useProgram(this.program);
    glContext.uniformMatrix4fv(this.localmat4UniformLoc, false, localMatrix.props);
    glContext.vertexAttribPointer(this.positionAttributeLocation, 2, glContext.FLOAT, false, 0, 0);

    this._finalTexture = this.texture;
    
}

extendPrototype([BaseElement, TransformElement, WebGLBaseElement, HierarchyElement, FrameElement, RenderableElement], WImageElement);

WImageElement.prototype.initElement = SVGShapeElement.prototype.initElement;

WImageElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame;

WImageElement.prototype.imageLoaded = function() {

	var glContext = this.glContext;
	var image = this.img;

    glContext.bindTexture(glContext.TEXTURE_2D, this.texture);
    // Upload the image into the texture.
    glContext.texImage2D(glContext.TEXTURE_2D, 0, glContext.RGBA, glContext.RGBA, glContext.UNSIGNED_BYTE, image);
    // Turn on the teccord attribute


    // this.globalData.elementLoaded();
};

WImageElement.prototype.imageFailed = function() {

}

WImageElement.prototype.createContent = function(){
    var img = this.globalData.imageLoader.getImage(this.assetData);
    if(img) {
        this.img = img;
        this.imageLoaded();
    } else {
        this.img = new Image();
        this.img.crossOrigin = 'anonymous';
        this.img.addEventListener('load', this.imageLoaded.bind(this), false);
        this.img.addEventListener('error', this.imageFailed.bind(this), false);
        var assetPath = this.globalData.getAssetsPath(this.assetData);
        this.img.src = assetPath;
    }
        // this.globalData.addPendingElement();
    
};

WImageElement.prototype.renderInnerContent = function() {

    var glContext = this.glContext;
    glContext.bindTexture(glContext.TEXTURE_2D, this.texture);
    this.renderEffects();
    //
};

WImageElement.prototype.getSize = function() {
    return this.assetData;
}