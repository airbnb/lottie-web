function WCompElement(data, globalData, comp) {
    this.completeLayers = false;
    this.layers = data.layers;
    this.pendingElements = [];
    this.elements = createSizedArray(this.layers.length);
    this.initElement(data, globalData, comp);
    this.tm = data.tm ? PropertyFactory.getProp(this,data.tm,0,globalData.frameRate, this) : {_placeholder:true};

    this.gl = this.globalData.canvasContext;

    //buffer and texture that represent this PreComp
    this.bufferData = this.createFrameBufferWithTexture(this.globalData.canvasContext, this.data.w, this.data.h);
    this.bufferData.name = this.data.nm;

    //program to draw composition in parent buffer
    var vsh = get_shader('comp_layer_shader_vert');
    var fsh = get_shader('comp_layer_shader_frag');
    var vertexShader = WebGLProgramFactory.createShader(this.gl, this.gl.VERTEX_SHADER, vsh);
    var fragmentShader = WebGLProgramFactory.createShader(this.gl, this.gl.FRAGMENT_SHADER, fsh);
    this.program = WebGLProgramFactory.createProgram(this.gl, vertexShader, fragmentShader);

    this.positionAttributeLocation = this.gl.getAttribLocation(this.program, "a_position");
    this.gl.enableVertexAttribArray(this.positionAttributeLocation);
    this.mat4UniformLoc = this.gl.getUniformLocation(this.program, "uMatrix");
    this.localmat4UniformLoc = this.gl.getUniformLocation(this.program, "localMatrix");
    this.texcoordLocation = this.gl.getAttribLocation(this.program, "a_texCoord");

    //Passing width and height of composition as local matrix operation.
    var localMatrix = new Matrix();
    localMatrix.scale(this.data.w, this.data.h);
    this.gl.useProgram(this.program);
    this.gl.uniformMatrix4fv(this.localmat4UniformLoc, false, localMatrix.props);

    //This is reading from the WebGLRenderer general Array Buffer
    this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

    this.gl.enableVertexAttribArray(this.texcoordLocation);
    this.gl.vertexAttribPointer(this.texcoordLocation, 2, this.gl.FLOAT, false, 0, 0);

    this.transformMat = new Matrix();
    this.transformMat.scale(1 / this.data.w, 1 / this.data.h);
    this.transformMat.scale(2, 2);
    this.transformMat.translate(-1, -1);

}

extendPrototype([WebGLRenderer, ICompElement, WebGLBaseElement], WCompElement);

WCompElement.prototype.renderInnerContent = function() {

    var gl = this.gl;

    gl.viewport(0, 0, this.data.w, this.data.h);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.bufferData.framebuffer);
    //this.globalData.pushPrecomp(this.data.w, this.data.h, this.bufferData.framebuffer, this.bufferData.texture);
    //gl.clearColor(0, 0, 0, 0);
    //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var i,len = this.layers.length;
    for( i = len - 1; i >= 0; i -= 1 ){
        if(this.completeLayers || this.elements[i]){
            this.elements[i].renderFrame();
        }
    }

    //this.comp.focusBuffer();
    //this.globalData.popPrecomp();
    gl.useProgram(this.program);
    this.comp.switchBuffer();

    gl.vertexAttribPointer(this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    var tr = this.comp.getTransform();
    var newTransform = new Matrix();
    this.finalTransform.mat.clone(newTransform);
    var p = tr.props;
    newTransform.transform(p[0],p[1],p[2],p[3],p[4],p[5],p[6],p[7],p[8],p[9],p[10],p[11],p[12],p[13],p[14],p[15]);
    this.gl.uniformMatrix4fv(this.mat4UniformLoc, false, newTransform.props);
    //this.gl.bindTexture(this.gl.FRAMEBUFFER, this.bufferData.texture);
    if(this.data.nm === 'webgl_precomp') {
        console.log('DRAWING webgl_precomp')
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    } else {
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
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