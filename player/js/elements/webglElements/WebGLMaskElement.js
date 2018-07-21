
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
        document.body.appendChild(this.canvas);
        this.canvas.style.position = 'absolute';
        this.canvas.style.zIndex = '1000';
        this.canvas.style.top = '500px';

        var gl = this.element.globalData.canvasContext;
        this.texture = textureFactory(gl);

        this.element.renderableEffectsManager.spliceEffect(0, this);

        // this.element.addRenderableComponent(this);
    }
}

WMaskElement.prototype.renderFrame = function () {
    var ctx = this.canvasContext;
    var i, len = this.masksProperties.length;
    var pt,pts,data;
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
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvas);
};

WMaskElement.prototype.getMaskProperty = MaskElement.prototype.getMaskProperty;

WMaskElement.prototype.destroy = function(){
    this.element = null;
};