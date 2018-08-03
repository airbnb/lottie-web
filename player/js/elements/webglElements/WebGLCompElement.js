function WCompElement(data, globalData, comp) {
    this.completeLayers = false;
    this.layers = data.layers;
    this.pendingElements = [];
    this.gl = globalData.canvasContext;
    this.elements = createSizedArray(this.layers.length);
    this.initElement(data, globalData, comp);
    this.tm = data.tm ? PropertyFactory.getProp(this,data.tm,0,globalData.frameRate, this) : {_placeholder:true};


    //buffer and texture that represent this PreComp
    this.bufferData = this.createFrameBufferWithTexture(this.globalData.canvasContext, this.data.w, this.data.h);
    this.bufferData.name = this.data.nm;

    //program to draw composition in parent buffer
    var vsh = get_shader('comp_layer_shader_vert');
    var fsh = get_shader('comp_layer_shader_frag');
    var gl = this.gl;
    var vertexShader = WebGLProgramFactory.createShader(gl, gl.VERTEX_SHADER, vsh);
    var fragmentShader = WebGLProgramFactory.createShader(gl, gl.FRAGMENT_SHADER, fsh);
    this.program = WebGLProgramFactory.createProgram(gl, vertexShader, fragmentShader);

    this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
    gl.enableVertexAttribArray(this.positionAttributeLocation);
    gl.vertexAttribPointer(this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    this.mat4UniformLoc = gl.getUniformLocation(this.program, "uMatrix");
    this.localmat4UniformLoc = gl.getUniformLocation(this.program, "localMatrix");
    this.texcoordLocation = gl.getAttribLocation(this.program, "a_texCoord");

    //Passing width and height of composition as local matrix operation.
    var localMatrix = new Matrix();
    localMatrix.scale(this.data.w, this.data.h);
    gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.localmat4UniformLoc, false, localMatrix.props);

    //This is reading from the WebGLRenderer general Array Buffer
    gl.vertexAttribPointer(this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(this.texcoordLocation);
    gl.vertexAttribPointer(this.texcoordLocation, 2, gl.FLOAT, false, 0, 0);

    this.transformMat = new Matrix();
    this.transformMat.scale(1 / this.data.w, 1 / this.data.h);
    this.transformMat.scale(2, 2);
    this.transformMat.translate(-1, -1);

    this._finalTexture = this.texture = this.bufferData.texture;

}

extendPrototype([WebGLRenderer, ICompElement, WebGLBaseElement], WCompElement);

WCompElement.prototype.renderNestedLayers = function() {
    var gl = this.gl;

    gl.viewport(0, 0, this.data.w, this.data.h);
    // Binding this comp's FRAME BUFFER to draw nested elements
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.bufferData.framebuffer);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var i,len = this.layers.length;
    for( i = len - 1; i >= 0; i -= 1 ){
        if(this.completeLayers || this.elements[i]){
            this.elements[i].renderFrame();
        }
    }
    this.gl.bindTexture(gl.TEXTURE_2D, this.bufferData.texture);
}

WCompElement.prototype.renderInnerContent = function() {

    this.renderNestedLayers();
    this.renderEffects();
};

WCompElement.prototype.destroy = function(){
    var i,len = this.layers.length;
    for( i = len - 1; i >= 0; i -= 1 ){
        if(this.elements[i]) {
            this.elements[i].destroy();
        }
    }
    this.layers = null;
    this.elements = null;
};

WCompElement.prototype.getSize = function() {
    return this.data;
}