function WMaskElement(data,element){
    this.data = data;
    this.element = element;
    this.masksProperties = this.data.masksProperties || [];
    this.viewData = createSizedArray(this.masksProperties.length);
    var i, len = this.masksProperties.length, hasMasks = false;
    for (i = 0; i < len; i++) {
        if(this.masksProperties[i].mode !== 'n'){
            hasMasks = true;
        }
        this.viewData[i] = ShapePropertyFactory.getShapeProp(this.element,this.masksProperties[i],3);
    }
    this.hasMasks = hasMasks;
    if(hasMasks) {

        this.canvas = createTag('canvas');
        var elemSize = this.element.getSize();
        this.canvas.width = elemSize.w;
        this.canvas.height = elemSize.h;
        this.canvasContext = this.canvas.getContext('2d');
        /*document.body.appendChild(this.canvas);
        this.canvas.style.position = 'absolute';
        this.canvas.style.zIndex = '1000';
        this.canvas.style.top = '500px';*/

        var glContext = this.element.globalData.glContext;
        this.texture = textureFactory(glContext);

        this.element.renderableEffectsManager.spliceEffect(0, this);

        var vsh = get_shader('mask_shader_vert');
        var fsh = get_shader('mask_shader_frag');

        var vertexShader = WebGLProgramFactory.createShader(glContext, glContext.VERTEX_SHADER, vsh);
        var fragmentShader = WebGLProgramFactory.createShader(glContext, glContext.FRAGMENT_SHADER, fsh);
        this.program = WebGLProgramFactory.createProgram(glContext, vertexShader, fragmentShader);
        glContext.useProgram(this.program);
        this.positionAttributeLocation = glContext.getAttribLocation(this.program, "a_position");
        glContext.enableVertexAttribArray(this.positionAttributeLocation);
        glContext.vertexAttribPointer(this.positionAttributeLocation, 2,glContext.FLOAT, false, 0, 0);
        this.texcoordLocation = glContext.getAttribLocation(this.program, "a_texCoord");
        glContext.enableVertexAttribArray(this.texcoordLocation);
        glContext.vertexAttribPointer(this.texcoordLocation, 2, glContext.FLOAT, false, 0, 0);
        //
        var origin_image = glContext.getUniformLocation(this.program, "origin_image");
        var mask_image = glContext.getUniformLocation(this.program, "mask_image");
        glContext.uniform1i(origin_image, 0);  // texture unit 0
        glContext.uniform1i(mask_image, 1);  // texture unit 1
    }
}

WMaskElement.prototype.renderFrame = function () {
    var ctx = this.canvasContext;
    var i, len = this.masksProperties.length;
    var pt,pts,data;
    this.canvas.width = this.canvas.width;
    ctx.beginPath();
    ctx.fillStyle = '#FFFFFF';
    for (i = 0; i < len; i++) {
        if(this.masksProperties[i].mode !== 'n'){
            data = this.viewData[i].v;
            pt = data.v[0];
            ctx.moveTo(pt[0], pt[1]);
            var j, jLen = data._length;
            for (j = 1; j < jLen; j++) {
                ctx.bezierCurveTo(data.o[j - 1][0], data.o[j - 1][1], data.i[j][0], data.i[j][1], data.v[j][0], data.v[j][1]);
            }
            ctx.bezierCurveTo(data.o[j - 1][0], data.o[j - 1][1], data.i[0][0], data.i[0][1], data.v[0][0], data.v[0][1]);
        }
    }
    ctx.fill();
    var glContext = this.element.globalData.glContext;
    glContext.activeTexture(glContext.TEXTURE1);
    glContext.bindTexture(glContext.TEXTURE_2D, this.texture);
    glContext.texImage2D(glContext.TEXTURE_2D, 0, glContext.RGBA, glContext.RGBA, glContext.UNSIGNED_BYTE, this.canvas);
    glContext.activeTexture(glContext.TEXTURE0);
    glContext.bindTexture(glContext.TEXTURE_2D, this.element._finalTexture);
    glContext.useProgram(this.program);
    glContext.drawArrays(glContext.TRIANGLES, 0, 6);
};

WMaskElement.prototype.getMaskProperty = MaskElement.prototype.getMaskProperty;

WMaskElement.prototype.destroy = function(){
    this.element = null;
};