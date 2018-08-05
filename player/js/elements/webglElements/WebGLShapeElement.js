function WShapeElement(data, globalData, comp) {
    this.gl = globalData.canvasContext;

    // Replacing transform data with generic object
    var canvas_data = {}
    for(var s in data) {
        if(data.hasOwnProperty(s)) {
            canvas_data[s] = data[s];
        }
    }
    //TODO: might make sense to reset transform of canvas instead of transform of shape layer
    data.masksProperties = [];
    data.ks = {a:{k:[0,0,0],a:0},p:{k:[0,0,0],a:0},r:{k:0,a:0},s:{k:[100,100,100],a:0},o:{k:100,a:0}};


    this.initElement(data,globalData,comp);
    var _localGlobalData = {};
    for(var prop in globalData) {
        if(globalData.hasOwnProperty(prop)) {
            _localGlobalData[prop] = globalData[prop];
        }
    }
    _localGlobalData.renderer = this;
    this._localGlobalData = _localGlobalData;

    this.renderConfig = {
        clearCanvas: true
    }
    this.transformMat = new Matrix();
    this.contextData = new CVContextData();
    this.canvas = createTag('canvas');
    var compSize = this.comp.getSize();
    this.canvas.width = compSize.w;
    this.canvas.height = compSize.h;
    /*document.body.appendChild(this.canvas);
    this.canvas.style.position = 'absolute';
    this.canvas.style.zIndex = '1000';
    this.canvas.style.top = '500px';*/
    this.canvasContext = this.canvas.getContext('2d');
    _localGlobalData.canvasContext = this.canvasContext;
    this.canvasElement = new CVShapeElement(canvas_data,_localGlobalData,comp);
    this.finalTransform = this.canvasElement.finalTransform;
    this.canvasElement.hierarchy = this.hierarchy;

    var max = 999999;
    this.currentBox = {
        x: max,
        y: max,
        xMax: -max,
        yMax: -max
    }


    var vsh = get_shader('image_layer_shader_vert');
    var fsh = get_shader('image_layer_shader_frag');
    var gl = this.gl;

    var vertexShader = WebGLProgramFactory.createShader(gl, gl.VERTEX_SHADER, vsh);
    var fragmentShader = WebGLProgramFactory.createShader(gl, gl.FRAGMENT_SHADER, fsh);
    this.program = WebGLProgramFactory.createProgram(gl, vertexShader, fragmentShader);
    this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
    gl.enableVertexAttribArray(this.positionAttributeLocation);
    this.mat4UniformLoc = gl.getUniformLocation(this.program, "uMatrix");
    this.localmat4UniformLoc = gl.getUniformLocation(this.program, "localMatrix");
    this.texcoordLocation = gl.getAttribLocation(this.program, "a_texCoord");
    gl.vertexAttribPointer(this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    
    var localMatrix = new Matrix();
    localMatrix.scale(compSize.w, compSize.h);

    gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.localmat4UniformLoc, false, localMatrix.props);
    
    gl.enableVertexAttribArray(this.texcoordLocation);
    gl.vertexAttribPointer(this.texcoordLocation, 2, gl.FLOAT, false, 0, 0);

    this.texture = textureFactory(gl);
    this._finalTexture = this.texture;

}
extendPrototype([BaseElement, TransformElement, WebGLBaseElement, HierarchyElement, FrameElement, RenderableElement], WShapeElement);

WShapeElement.prototype.initElement = SVGShapeElement.prototype.initElement;

//Overwriting render transform taken care by the inner canvas element
WShapeElement.prototype.renderTransform = function() {}

WShapeElement.prototype.calculateTransform = function() {
    //Parent comp transform + localTransform
    var tr = this.comp.getTransform();
    var newTransform = this.localTransform;
    newTransform.cloneFromProps(tr.props);
    this.gl.uniformMatrix4fv(this.mat4UniformLoc, false, this.localTransform.props);
}

WShapeElement.prototype.prepareFrame = function(num) {
    this.prepareRenderableFrame(num);
    this.prepareProperties(num, this.isInRange);

    this._localGlobalData.frameId = this.globalData.frameId;
    this._localGlobalData._mdf = false;
    this.canvasElement.prepareFrame(num);
    this.hidden = this.canvasElement.hidden;
    this.globalData._mdf = this._localGlobalData._mdf ? true : this.globalData._mdf;
    var gl = this.gl;
    if(this._localGlobalData._mdf) {
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};

WShapeElement.prototype.renderInnerContent = function() {

    var gl = this.gl;

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    if(this._localGlobalData._mdf) {
        this.canvasElement.renderFrame();
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvas);
    }

    this.renderEffects();
    //
};

WShapeElement.prototype.getSize = function() {
    return this.comp.getSize();
}

WShapeElement.prototype.save = CanvasRenderer.prototype.save;
WShapeElement.prototype.restore = CanvasRenderer.prototype.restore;
WShapeElement.prototype.ctxTransform = CanvasRenderer.prototype.ctxTransform;
WShapeElement.prototype.ctxOpacity = CanvasRenderer.prototype.ctxOpacity;