function WImageElement(data, globalData, comp) {
    this.assetData = globalData.getAssetData(data.refId);
    this.img = new Image();
    this.img.crossOrigin = 'anonymous';
    this.initElement(data,globalData,comp);
    this.gl = globalData.canvasContext;
    this.globalData.addPendingElement();

    var vsh = 'attribute vec4 a_position;';
    vsh += 'uniform mat4 uMatrix;';
    vsh += 'varying vec2 v_texCoord;';
    vsh += 'attribute vec2 a_texCoord;';
    vsh += 'void main() {';
    vsh += 'gl_Position = uMatrix * a_position;';
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
    this.mat4UniformLoc = this.gl.getUniformLocation(this.program, "uMatrix");
    this.texcoordLocation = this.gl.getAttribLocation(this.program, "a_texCoord");
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
    var texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
       0.0,  0.0,
      1,  1.0,
      0.0,  1,
      0.0,  0,
      1,  0.0,
      1,  1,
    ]), gl.STATIC_DRAW);

    gl.vertexAttribPointer(this.texcoordLocation, 2, gl.FLOAT, false, 0, 0);
    // Turn on the teccord attribute

    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    // three 2d points
    var positions = [
      0, 0,
      image.width, image.height,
      0, image.height,
      0, 0,
      image.width, 0,
      image.width, image.height,
    ];
    gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);


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
	    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
	    this.gl.enableVertexAttribArray(this.positionAttributeLocation);
	    this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

	    this.globalData.pushTransform(this.finalTransform.mat);
	    var transform = this.globalData.getTransform();
	    this.gl.uniformMatrix4fv(this.mat4UniformLoc, false, transform.props);
	    this.globalData.popTransform();

	    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
	}
    //
};