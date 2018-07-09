function WImageElement(data, globalData, comp) {
    this.assetData = globalData.getAssetData(data.refId);
    this.img = new Image();
    this.img.crossOrigin = 'anonymous';
    this.initElement(data,globalData,comp);
    this.gl = globalData.canvasContext;
    this.globalData.addPendingElement();

    var vsh = 'attribute vec4 a_position;';
    vsh += 'uniform mat4 uMatrix;';
    vsh += 'uniform mat4 localMatrix;';
    vsh += 'varying vec2 v_texCoord;';
    vsh += 'attribute vec2 a_texCoord;';
    vsh += 'void main() {';
    vsh += 'gl_Position = uMatrix * localMatrix * a_position;';
    vsh += 'v_texCoord = a_texCoord;';
    vsh += '}';

    var fsh = 'precision mediump float;';
    fsh += 'uniform sampler2D u_image;';
    fsh += 'varying vec2 v_texCoord;';
    fsh += 'void main() {';
    fsh += 'gl_FragColor = texture2D(u_image, v_texCoord);';
    fsh += '}';


    var vertexShader = WebGLProgramFactory.createShader(this.gl, this.gl.VERTEX_SHADER, vsh);
    var fragmentShader = WebGLProgramFactory.createShader(this.gl, this.gl.FRAGMENT_SHADER, fsh);
    this.program = WebGLProgramFactory.createProgram(this.gl, vertexShader, fragmentShader);
    this.positionAttributeLocation = this.gl.getAttribLocation(this.program, "a_position");
    this.gl.enableVertexAttribArray(this.positionAttributeLocation);
    this.mat4UniformLoc = this.gl.getUniformLocation(this.program, "uMatrix");
    this.localmat4UniformLoc = this.gl.getUniformLocation(this.program, "localMatrix");
    this.texcoordLocation = this.gl.getAttribLocation(this.program, "a_texCoord");

    var localMatrix = new Matrix();
    localMatrix.scale(this.assetData.w, this.assetData.h);
    this.gl.useProgram(this.program);
    this.gl.uniformMatrix4fv(this.localmat4UniformLoc, false, localMatrix.props);
    this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
    
}

extendPrototype([BaseElement, TransformElement, WebGLBaseElement, HierarchyElement, FrameElement, RenderableElement], WImageElement);

WImageElement.prototype.initElement = SVGShapeElement.prototype.initElement;

WImageElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame;

WImageElement.prototype.imageLoaded = function() {

	var gl = this.gl;
	var image = this.img;

	this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.enableVertexAttribArray(this.texcoordLocation);

    gl.vertexAttribPointer(this.texcoordLocation, 2, gl.FLOAT, false, 0, 0);
    // Turn on the teccord attribute


    this.globalData.elementLoaded();
};

WImageElement.prototype.imageFailed = function() {

}

WImageElement.prototype.createContent = function(){
    var img = this.img;
    img.addEventListener('load', this.imageLoaded.bind(this), false);
    img.addEventListener('error', this.imageFailed.bind(this), false);
    var assetPath = this.globalData.getAssetsPath(this.assetData);
    img.src = assetPath;
    
};

WImageElement.prototype.renderInnerContent = function() {

    this.gl.useProgram(this.program);

	if(this.texture) {

	    var transform = this.globalData.getTransform();
	    this.gl.uniformMatrix4fv(this.mat4UniformLoc, false, transform.props);

        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
	    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
	}
    //
};