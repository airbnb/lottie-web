function CVTextElement(data, globalData){
    this.textSpans = [];
    this.yOffset = 0;
    this.fillColorAnim = false;
    this.strokeColorAnim = false;
    this.strokeWidthAnim = false;
    this.stroke = false;
    this.fill = false;
    this.justifyOffset = 0;
    this.currentRender = null;
    this.values = {
        fill: 'rgba(0,0,0,0)',
        stroke: 'rgba(0,0,0,0)',
        sWidth: 0,
        fValue: ''
    }
    this.parent.constructor.call(this,data, globalData);
    this.renderedLetters = [];
}
createElement(CVBaseElement, CVTextElement);

CVTextElement.prototype.init = ITextElement.prototype.init;
CVTextElement.prototype.getMeasures = ITextElement.prototype.getMeasures;
CVTextElement.prototype.getMult = ITextElement.prototype.getMult;

CVTextElement.prototype.tHelper = document.createElement('canvas').getContext('2d');

CVTextElement.prototype.createElements = function(){

    this.parent.createElements.call(this);
    //console.log('this.data: ',this.data);
    var documentData = this.data.t.d;

    var hasFill = false;
    if(documentData.fc) {
        hasFill = true;
        this.values.fill = 'rgb(' + documentData.fc[0] + ',' + documentData.fc[1] + ',' + documentData.fc[2] + ')';
    }else{
        this.values.fill = 'rgba(0,0,0,0)';
    }
    this.fill = hasFill;
    var hasStroke = false;
    if(documentData.sc){
        hasStroke = true;
        this.values.stroke = 'rgb(' + documentData.sc[0] + ',' + documentData.sc[1] + ',' + documentData.sc[2] + ')';
        this.values.sWidth = documentData.sw;
    }
    var fontData = this.globalData.fontManager.getFontByName(documentData.f);
    var i, len;
    var matrixHelper = this.mHelper;
    this.stroke = hasStroke;
    this.values.fValue = documentData.s + 'px '+ this.globalData.fontManager.getFontByName(documentData.f).fFamily;
    len = documentData.t.length;
    this.tHelper.font = this.values.fValue;
    var charData, shapeData, k, kLen, shapes, j, jLen, path2d, pathNodes;
    for (i = 0;i < len ;i += 1) {
        charData = this.globalData.fontManager.getCharData(documentData.t.charAt(i), fontData.fStyle, this.globalData.fontManager.getFontByName(documentData.f).fFamily);
        matrixHelper.reset();
        matrixHelper.scale(documentData.s/100,documentData.s/100);
        shapeData = charData.data;
        if(shapeData){
            shapes = shapeData.shapes[0].it;
            path2d = new BM_Path2D();
            jLen = shapes.length;
            for(j=0;j<jLen;j+=1){
                kLen = shapes[j].ks.i.length;
                pathNodes = shapes[j].ks;
                for(k=1;k<kLen;k+=1){
                    if(k==1){
                        path2d.moveTo(matrixHelper.applyToX(pathNodes.v[0][0],pathNodes.v[0][1]),matrixHelper.applyToY(pathNodes.v[0][0],pathNodes.v[0][1]));
                        //path2d.moveTo(pathNodes.v[0][0],pathNodes.v[0][1]);
                    }
                    path2d.bezierCurveTo(matrixHelper.applyToX(pathNodes.o[k-1][0],pathNodes.o[k-1][1]),matrixHelper.applyToY(pathNodes.o[k-1][0],pathNodes.o[k-1][1]),matrixHelper.applyToX(pathNodes.i[k][0],pathNodes.i[k][1]),matrixHelper.applyToY(pathNodes.i[k][0],pathNodes.i[k][1]),matrixHelper.applyToX(pathNodes.v[k][0],pathNodes.v[k][1]),matrixHelper.applyToY(pathNodes.v[k][0],pathNodes.v[k][1]));
                    //path2d.bezierCurveTo(pathNodes.o[k-1][0],pathNodes.o[k-1][1],pathNodes.i[k][0],pathNodes.i[k][1],pathNodes.v[k][0],pathNodes.v[k][1]);
                }
                path2d.bezierCurveTo(matrixHelper.applyToX(pathNodes.o[k-1][0],pathNodes.o[k-1][1]),matrixHelper.applyToY(pathNodes.o[k-1][0],pathNodes.o[k-1][1]),matrixHelper.applyToX(pathNodes.i[0][0],pathNodes.i[0][1]),matrixHelper.applyToY(pathNodes.i[0][0],pathNodes.i[0][1]),matrixHelper.applyToX(pathNodes.v[0][0],pathNodes.v[0][1]),matrixHelper.applyToY(pathNodes.v[0][0],pathNodes.v[0][1]));
                //path2d.bezierCurveTo(pathNodes.o[k-1][0],pathNodes.o[k-1][1],pathNodes.i[0][0],pathNodes.i[0][1],pathNodes.v[0][0],pathNodes.v[0][1]);
                path2d.closePath();
            }
        }else{
            path2d = new BM_Path2D();
        }
        //var cLength = this.tHelper.measureText(val).width;
        this.textSpans.push({elem: path2d});
    }
};

CVTextElement.prototype.renderFrame = function(parentMatrix){
    if(this.parent.renderFrame.call(this, parentMatrix)===false){
        return;
    }
    var ctx = this.canvasContext;
    var finalMat = this.finalTransform.mat.props;
    this.globalData.renderer.save();
    this.globalData.renderer.ctxTransform(finalMat);
    this.globalData.renderer.ctxOpacity(this.finalTransform.opacity);
    ctx.font = this.values.fValue;
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 4;


    this.getMeasures();

    var  i,len;
    var renderedLetters = this.renderedLetters;

    var letters = this.data.t.d.l;

    len = letters.length;
    var renderedLetter;
    var lastFill = null, lastStroke = null, lastStrokeW = null;
    for(i=0;i<len;i+=1){
        if(letters[i].n){
            continue;
        }
        renderedLetter = renderedLetters[i];
        this.globalData.renderer.save();
        this.globalData.renderer.ctxTransform(renderedLetter.props);
        this.globalData.renderer.ctxOpacity(renderedLetter.o);
        if(this.fill){
            if(renderedLetter.fc){
                if(lastFill !== renderedLetter.fc){
                    lastFill = renderedLetter.fc;
                    ctx.fillStyle = renderedLetter.fc;
                }
            }else if(lastFill !== this.values.fill){
                lastFill = this.values.fill;
                ctx.fillStyle = this.values.fill;
            }
            this.globalData.bmCtx.fill(this.textSpans[i].elem);
            ///ctx.fillText(this.textSpans[i].val,0,0);
        }
        if(this.stroke){
            if(renderedLetter.sw){
                if(lastStrokeW !== renderedLetter.sw){
                    lastStrokeW = renderedLetter.sw;
                    ctx.lineWidth = renderedLetter.sw;
                }
            }else if(lastStrokeW !== this.values.sWidth){
                lastStrokeW = this.values.sWidth;
                ctx.lineWidth = this.values.sWidth;
            }
            if(renderedLetter.sc){
                if(lastStroke !== renderedLetter.sc){
                    lastStroke = renderedLetter.sc;
                    ctx.strokeStyle = renderedLetter.sc;
                }
            }else if(lastStroke !== this.values.stroke){
                lastStroke = this.values.stroke;
                ctx.strokeStyle = this.values.stroke;
            }
            this.globalData.bmCtx.stroke(this.textSpans[i].elem);
            ///ctx.strokeText(letters[i].val,0,0);
        }
        this.globalData.renderer.restore();
    }
    /*if(this.data.hasMask){
     this.globalData.renderer.restore(true);
     }*/
    this.globalData.renderer.restore(this.data.hasMask);
};