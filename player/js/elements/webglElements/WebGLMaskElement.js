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
        var compSize = this.element.getSize();
        this.canvas.width = compSize.w;
        this.canvas.height = compSize.h;
        this.canvasContext = this.canvas.getContext('2d');
        /*document.body.appendChild(this.canvas);
        this.canvas.style.position = 'absolute';
        this.canvas.style.zIndex = '1000';
        this.canvas.style.top = '500px';*/

        var gl = this.element.globalData.canvasContext;
        this.texture = textureFactory(gl);

        this.element.renderableEffectsManager.spliceEffect(0, this);

        var vsh = get_shader('mask_shader_vert');
        var fsh = get_shader('mask_shader_frag');

        var vertexShader = WebGLProgramFactory.createShader(gl, gl.VERTEX_SHADER, vsh);
        var fragmentShader = WebGLProgramFactory.createShader(gl, gl.FRAGMENT_SHADER, fsh);
        this.program = WebGLProgramFactory.createProgram(gl, vertexShader, fragmentShader);
        gl.useProgram(this.program);
        this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
        gl.enableVertexAttribArray(this.positionAttributeLocation);
        gl.vertexAttribPointer(this.positionAttributeLocation, 2,gl.FLOAT, false, 0, 0);
        this.texcoordLocation = gl.getAttribLocation(this.program, "a_texCoord");
        gl.enableVertexAttribArray(this.texcoordLocation);
        gl.vertexAttribPointer(this.texcoordLocation, 2, gl.FLOAT, false, 0, 0);
        //
        var origin_image = gl.getUniformLocation(this.program, "origin_image");
        var mask_image = gl.getUniformLocation(this.program, "mask_image");
        gl.uniform1i(origin_image, 0);  // texture unit 0
        gl.uniform1i(mask_image, 1);  // texture unit 1
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
    var gl = this.element.globalData.canvasContext;
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvas);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.element._finalTexture);
    gl.useProgram(this.program);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
};

WMaskElement.prototype.getMaskProperty = MaskElement.prototype.getMaskProperty;

WMaskElement.prototype.destroy = function(){
    this.element = null;
};