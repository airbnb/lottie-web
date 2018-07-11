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

    // creating frame buffers
    if(this.renderableEffectsManager.filters.length) {
        this.createFramebuffers(this.gl, this.assetData.w, this.assetData.h);
    }
    
}

extendPrototype([BaseElement, TransformElement, WebGLBaseElement, HierarchyElement, FrameElement, RenderableElement], WImageElement);

WImageElement.prototype.initElement = SVGShapeElement.prototype.initElement;

WImageElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame;

WImageElement.prototype.imageLoaded = function() {

	var gl = this.gl;
	var image = this.img;

	this.texture = textureFactory(gl);
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


	if(this.texture) {
        var gl = this.gl;

        gl.useProgram(this.program);
        this.globalData.pushTransform(this.finalTransform.mat);

	    var transform = this.globalData.getTransform();
	    gl.uniformMatrix4fv(this.mat4UniformLoc, false, transform.props);

        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        //rendering effects
        var filters = this.renderableEffectsManager.filters;
        if(filters.length) {
            var i, len = filters.length;
            for (i = 0; i < len; ++i) {
                // Setup to draw into one of the framebuffers.
                gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffersData.framebuffers[i % 2]);
                gl.viewport(0, 0, this.assetData.w, this.assetData.h);
                filters[i].renderFrame();
             
                // for the next draw, use the texture we just rendered to.
                gl.bindTexture(gl.TEXTURE_2D, this.framebuffersData.textures[i % 2]);
            }
            gl.useProgram(this.program);
        }

        //
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this.globalData.resetViewport();
	    gl.drawArrays(gl.TRIANGLES, 0, 6);

        this.globalData.popTransform();
	}
    //
};

function setFramebuffer(gl, fbo, width, height) {
    // make this the framebuffer we are rendering to.
 
    // Tell the shader the resolution of the framebuffer.
    // gl.uniform2f(resolutionLocation, width, height);
 
    // Tell webgl the viewport setting needed for framebuffer.
  }