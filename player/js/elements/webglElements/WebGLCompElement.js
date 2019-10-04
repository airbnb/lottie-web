function WCompElement(data, globalData, comp) {
    this.completeLayers = false;
    this.layers = data.layers;
    this.pendingElements = [];
    this.glContext = globalData.glContext;
    var glContext = this.glContext;
    this.elements = createSizedArray(this.layers.length);
    this.initElement(data, globalData, comp);
    this.tm = data.tm ? PropertyFactory.getProp(this,data.tm,0,globalData.frameRate, this) : {_placeholder:true};


    //buffer and texture that represent this PreComp
    this.bufferData = this.createFrameBufferWithTexture(glContext, this.data.w, this.data.h);
    this.bufferData.name = this.data.nm;

    //program to draw composition in parent buffer
    var vsh = get_shader('comp_layer_shader_vert');
    var fsh = get_shader('comp_layer_shader_frag');
    var vertexShader = WebGLProgramFactory.createShader(glContext, glContext.VERTEX_SHADER, vsh);
    var fragmentShader = WebGLProgramFactory.createShader(glContext, glContext.FRAGMENT_SHADER, fsh);
    this.program = WebGLProgramFactory.createProgram(glContext, vertexShader, fragmentShader);

    this.positionAttributeLocation = glContext.getAttribLocation(this.program, "a_position");
    glContext.enableVertexAttribArray(this.positionAttributeLocation);
    glContext.vertexAttribPointer(this.positionAttributeLocation, 2, glContext.FLOAT, false, 0, 0);
    this.mat4UniformLoc = glContext.getUniformLocation(this.program, "uMatrix");
    this.localmat4UniformLoc = glContext.getUniformLocation(this.program, "localMatrix");
    this.texcoordLocation = glContext.getAttribLocation(this.program, "a_texCoord");

    //Passing width and height of composition as local matrix operation.
    var localMatrix = new Matrix();
    localMatrix.scale(this.data.w, this.data.h);
    glContext.useProgram(this.program);
    glContext.uniformMatrix4fv(this.localmat4UniformLoc, false, localMatrix.props);

    //This is reading from the WebGLRenderer general Array Buffer
    glContext.vertexAttribPointer(this.positionAttributeLocation, 2, glContext.FLOAT, false, 0, 0);

    glContext.enableVertexAttribArray(this.texcoordLocation);
    glContext.vertexAttribPointer(this.texcoordLocation, 2, glContext.FLOAT, false, 0, 0);

    this.transformMat = new Matrix();
    this.transformMat.scale(1 / this.data.w, 1 / this.data.h);
    this.transformMat.scale(2, 2);
    this.transformMat.translate(-1, -1);

    this._finalTexture = this.texture = this.bufferData.texture;

}

extendPrototype([WebGLRenderer, ICompElement, WebGLBaseElement], WCompElement);

WCompElement.prototype.renderNestedLayers = function() {
    var glContext = this.glContext;

    glContext.viewport(0, 0, this.data.w, this.data.h);
    // Binding this comp's FRAME BUFFER to draw nested elements
    console.log('BIND COMP BUFFER', this.data)
    glContext.bindFramebuffer(glContext.FRAMEBUFFER, this.bufferData.framebuffer);
    glContext.clearColor(0, 0, 0, 0);
    glContext.clear(glContext.COLOR_BUFFER_BIT | glContext.DEPTH_BUFFER_BIT);

    var i,len = this.layers.length;
    for( i = len - 1; i >= 0; i -= 1 ){
        if(this.completeLayers || this.elements[i]){
            this.elements[i].renderFrame();
        }
    }
    this.glContext.bindTexture(glContext.TEXTURE_2D, this.bufferData.texture);
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