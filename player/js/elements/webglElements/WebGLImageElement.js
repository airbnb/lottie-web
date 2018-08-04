function WImageElement(data, globalData, comp) {
    this.assetData = globalData.getAssetData(data.refId);
    this.gl = globalData.canvasContext;
    var gl = this.gl;
    this.texture = textureFactory(gl);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
              new Uint8Array([0, 0, 0, 0]));

    this.initElement(data,globalData,comp);

    var vsh = get_shader('image_layer_shader_vert');

    var fsh = get_shader('image_layer_shader_frag');

    var vertexShader = WebGLProgramFactory.createShader(gl, gl.VERTEX_SHADER, vsh);
    var fragmentShader = WebGLProgramFactory.createShader(gl, gl.FRAGMENT_SHADER, fsh);
    this.program = WebGLProgramFactory.createProgram(gl, vertexShader, fragmentShader);
    this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
    gl.enableVertexAttribArray(this.positionAttributeLocation);
    this.mat4UniformLoc = gl.getUniformLocation(this.program, "uMatrix");
    this.localmat4UniformLoc = gl.getUniformLocation(this.program, "localMatrix");
    this.texcoordLocation = gl.getAttribLocation(this.program, "a_texCoord");
    gl.enableVertexAttribArray(this.texcoordLocation);
    gl.vertexAttribPointer(this.texcoordLocation, 2, gl.FLOAT, false, 0, 0);

    var localMatrix = new Matrix();
    localMatrix.scale(this.assetData.w, this.assetData.h);
    gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.localmat4UniformLoc, false, localMatrix.props);
    gl.vertexAttribPointer(this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    this._finalTexture = this.texture;
    
}

extendPrototype([BaseElement, TransformElement, WebGLBaseElement, HierarchyElement, FrameElement, RenderableElement], WImageElement);

WImageElement.prototype.initElement = SVGShapeElement.prototype.initElement;

WImageElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame;

WImageElement.prototype.imageLoaded = function() {

	var gl = this.gl;
	var image = this.img;

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    // Turn on the teccord attribute


    this.globalData.elementLoaded();
};

WImageElement.prototype.imageFailed = function() {

}

WImageElement.prototype.createContent = function(){
    var img = this.globalData.imagePreloader.getImageById(this.assetData.id);
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
        this.globalData.addPendingElement();
    
};

WImageElement.prototype.renderInnerContent = function() {

    var gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    this.renderEffects();
    //
};

WImageElement.prototype.getSize = function() {
    return this.assetData;
}