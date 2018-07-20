function WShapeElement(data, globalData, comp) {
    this.initElement(data,globalData,comp);
    var _localGlobalData = {};
    for(var prop in globalData) {
        if(globalData.hasOwnProperty(prop)) {
            _localGlobalData[prop] = globalData[prop];
        }
    }
    _localGlobalData.renderer = this;
    this._localGlobalData = _localGlobalData;
    // Replacing transform data with generic object
    var canvas_data = {}
    for(var s in data) {
        if(data.hasOwnProperty(s)) {
            canvas_data[s] = data[s];
        }
    }
    canvas_data.ks = {a:{k:[0,0],a:0},p:{k:[0,0],a:0},r:{k:0,a:0},s:{k:[0,0],a:0},o:{k:0,a:0}};
    this.canvasElement = new CVShapeElement(canvas_data,_localGlobalData,comp);
    this.renderConfig = {
        clearCanvas: true
    }
    this.transformMat = new Matrix();
    this.contextData = new CVContextData();
    this.canvas = createTag('canvas');
    /*document.body.appendChild(this.canvas);
    this.canvas.style.position = 'absolute';
    this.canvas.style.zIndex = '1000';
    this.canvas.style.top = '500px';*/
    this.canvasContext = this.canvas.getContext('2d');
    _localGlobalData.canvasContext = this.canvasContext;
    var max = 999999;
    this.currentBox = {
        x: max,
        y: max,
        xMax: -max,
        yMax: -max
    }


    this.gl = globalData.canvasContext;
    var vsh = get_shader('image_layer_shader_vert');
    var fsh = get_shader('image_layer_shader_frag');

    var vertexShader = WebGLProgramFactory.createShader(this.gl, this.gl.VERTEX_SHADER, vsh);
    var fragmentShader = WebGLProgramFactory.createShader(this.gl, this.gl.FRAGMENT_SHADER, fsh);
    this.program = WebGLProgramFactory.createProgram(this.gl, vertexShader, fragmentShader);
    this.positionAttributeLocation = this.gl.getAttribLocation(this.program, "a_position");
    this.gl.enableVertexAttribArray(this.positionAttributeLocation);
    this.mat4UniformLoc = this.gl.getUniformLocation(this.program, "uMatrix");
    this.localmat4UniformLoc = this.gl.getUniformLocation(this.program, "localMatrix");
    this.texcoordLocation = this.gl.getAttribLocation(this.program, "a_texCoord");
    this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);


}
extendPrototype([BaseElement, TransformElement, WebGLBaseElement, HierarchyElement, FrameElement, RenderableElement], WShapeElement);

WShapeElement.prototype.initElement = SVGShapeElement.prototype.initElement;

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
        var tempBoundingBox = this.canvasElement.tempBoundingBox;
        var max = 999999;
        tempBoundingBox.x = max;
        tempBoundingBox.xMax = -max;
        tempBoundingBox.y = max;
        tempBoundingBox.yMax = -max;
        this.canvasElement.calculateBoundingBox(this.canvasElement.itemsData, tempBoundingBox);
        if(this.currentBox.x !== tempBoundingBox.x
            || this.currentBox.y !== tempBoundingBox.y
            || this.currentBox.xMax !== tempBoundingBox.xMax
            || this.currentBox.yMax !== tempBoundingBox.yMax) {
            this.currentBox.x = tempBoundingBox.x;
            this.currentBox.y = tempBoundingBox.y;
            this.currentBox.xMax = tempBoundingBox.xMax;
            this.currentBox.yMax = tempBoundingBox.yMax;
            this.currentBox.w = this.currentBox.xMax - this.currentBox.x;
            this.currentBox.h = this.currentBox.yMax - this.currentBox.y;
            this.canvas.width = this.currentBox.w;
            this.canvas.height = this.currentBox.h;
            this.texture = textureFactory(gl);
            // Upload the image into the texture.
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            // creating frame buffers
            if(this.renderableEffectsManager.filters.length) {
                this.createFramebuffers(this.gl, this.currentBox.w, this.currentBox.h);
            }
        } else {
            this.canvasContext.clearRect(this.currentBox.x, this.currentBox.y, this.currentBox.xMax - this.currentBox.x, this.currentBox.yMax - this.currentBox.y);
        }
        //this.transformMat.reset();
        this.ctxTransform([1,0,0,0,0,1,0,0,0,0,0,0,-this.currentBox.x, -this.currentBox.y,0,0]);
        var localMatrix = new Matrix();
        localMatrix.scale(this.currentBox.xMax - this.currentBox.x, this.currentBox.yMax - this.currentBox.y);

        gl.useProgram(this.program);
        gl.uniformMatrix4fv(this.localmat4UniformLoc, false, localMatrix.props);

        gl.enableVertexAttribArray(this.texcoordLocation);

        gl.vertexAttribPointer(this.texcoordLocation, 2, gl.FLOAT, false, 0, 0);
    }
};

WShapeElement.prototype.renderInnerContent = function() {

    var gl = this.gl;


    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    if(this._localGlobalData._mdf) {
        this.canvasElement.renderInnerContent();
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvas);
    }

    this.renderEffects();
    //

    gl.useProgram(this.program);
    
    //Parent comp transform + localTransform
    var tr = this.comp.getTransform();
    var newTransform = new Matrix();
    this.finalTransform.mat.clone(newTransform);
    var p = tr.props;
    newTransform.translate(this.currentBox.x,this.currentBox.y);
    newTransform.transform(p[0],p[1],p[2],p[3],p[4],p[5],p[6],p[7],p[8],p[9],p[10],p[11],p[12],p[13],p[14],p[15]);
    this.gl.uniformMatrix4fv(this.mat4UniformLoc, false, newTransform.props);
    //
    gl.drawArrays(gl.TRIANGLES, 0, 6);
};

WShapeElement.prototype.updateModifiedState = function() {
    this.globalData._mdf = true;
}

WShapeElement.prototype.getSize = function() {
    return this.currentBox;
}

WShapeElement.prototype.getCenter = function() {
    return {x: this.currentBox.w * 0.5, y: this.currentBox.h * 0.5};
}

WShapeElement.prototype.save = CanvasRenderer.prototype.save;
WShapeElement.prototype.restore = CanvasRenderer.prototype.restore;
WShapeElement.prototype.ctxTransform = CanvasRenderer.prototype.ctxTransform;
WShapeElement.prototype.ctxOpacity = CanvasRenderer.prototype.ctxOpacity;