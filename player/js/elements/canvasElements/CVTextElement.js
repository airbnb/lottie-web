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

CVTextElement.prototype.tHelper = document.createElement('canvas').getContext('2d');

CVTextElement.prototype.createElements = function(){

    this.parent.createElements.call(this);
    //console.log('this.data: ',this.data);
    var documentData = this.data.t.d;

    this.textElem = document.createElementNS(svgNS,'g');
    //this.textElem.textContent = documentData.t;
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
    var styles = fontData.fStyle.split(' ');
    var i, len = styles.length;
    var fWeight = 'normal', fStyle = 'normal';
    var matrixHelper = this.mHelper;
    for(i=0;i<len;i+=1){
        if (styles[i].toLowerCase() === 'italic') {
            fStyle = 'italic';
        }else if (styles[i].toLowerCase() === 'bold') {
            fWeight = '700';
        } else if (styles[i].toLowerCase() === 'black') {
            fWeight = '900';
        } else if (styles[i].toLowerCase() === 'medium') {
            fWeight = '500';
        } else if (styles[i].toLowerCase() === 'regular' || styles[i].toLowerCase() === 'normal') {
            fWeight = '400';
        } else if (styles[i].toLowerCase() === 'light' || styles[i].toLowerCase() === 'thin') {
            fWeight = '200';
        }
    }
    this.stroke = hasStroke;
    this.values.fValue = documentData.s + 'px '+ this.globalData.fontManager.getFontByName(documentData.f).fFamily;
    len = documentData.t.length;
    var newLineFlag, index = 0, val;
    var anchorGrouping = this.data.t.m.g;
    var currentSize = 0, currentPos = 0;
    this.tHelper.font = this.values.fValue;
    var charData, shapeData, k, kLen, shapes, j, jLen, path2d;
    var lineWidth = 0;
    var maxLineWidth = 0;
    for (i = 0;i < len ;i += 1) {
        newLineFlag = false;
        if(documentData.t.charAt(i) === ' '){
            val = '\u00A0';
        }else if(documentData.t.charCodeAt(i) === 13){
            maxLineWidth = lineWidth > maxLineWidth ? lineWidth : maxLineWidth;
            lineWidth = 0;
            val = '';
            newLineFlag = true;
        }else{
            val = documentData.t.charAt(i);
        }
        charData = this.globalData.fontManager.getCharData(documentData.t.charAt(i), fontData.fStyle, this.globalData.fontManager.getFontByName(documentData.f).fFamily);
        matrixHelper.reset();
        matrixHelper.scale(documentData.s/100,documentData.s/100);
        shapeData = charData.data;
        if(shapeData){
            shapes = shapeData.shapes[0].it;
            path2d = new BM_Path2D();
            jLen = shapes.length;
            var pt;
            for(j=0;j<jLen;j+=1){
                kLen = shapes[j].ks.i.length;
                var pathNodes = shapes[j].ks;
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
        var cLength = charData.w*documentData.s/100;
        lineWidth += cLength;
        this.textSpans.push({l:cLength,an:cLength,add:currentSize,n:newLineFlag, anIndexes:[], val: val, elem: path2d});
        if(anchorGrouping == 2){
            currentSize += cLength;
            if(val == '' || val == '\u00A0' || i == len - 1){
                if(val == '' || val == '\u00A0'){
                    currentSize -= cLength;
                }
                while(currentPos<=i){
                    this.textSpans[currentPos].an = currentSize;
                    this.textSpans[currentPos].ind = index;
                    this.textSpans[currentPos].extra = cLength;
                    currentPos += 1;
                }
                index += 1;
                currentSize = 0;
            }
        }else if(anchorGrouping == 3){
            currentSize += cLength;
            if(val == '' || i == len - 1){
                if(val == ''){
                    currentSize -= cLength;
                }
                while(currentPos<=i){
                    this.textSpans[currentPos].an = currentSize;
                    this.textSpans[currentPos].ind = index;
                    this.textSpans[currentPos].extra = cLength;
                    currentPos += 1;
                }
                currentSize = 0;
                index += 1;
            }
        }else{
            this.textSpans[index].ind = index;
            this.textSpans[index].extra = 0;
            index += 1;
        }
    }
    maxLineWidth = lineWidth > maxLineWidth ? lineWidth : maxLineWidth;
    this.boxWidth = maxLineWidth;
    switch(documentData.j){
        case 1:
            this.justifyOffset = - this.boxWidth;
            break;
        case 2:
            this.justifyOffset = - this.boxWidth/2;
            break;
    }
    var animators = this.data.t.a;
    jLen = animators.length;
    var based, ind, indexes = [];
    for(j=0;j<jLen;j+=1){
        if(animators[j].a.sc && hasStroke){
            this.strokeColorAnim = true;
        }
        if(animators[j].a.sw && hasStroke){
            this.strokeWidthAnim = true;
        }
        if(animators[j].a.fc && hasFill){
            this.fillColorAnim = true;
        }
        ind = 0;
        based = animators[j].s.b;
        for(i=0;i<len;i+=1){
            this.textSpans[i].anIndexes[j] = ind;
            if((based == 1 && this.textSpans[i].val != '') || (based == 2 && this.textSpans[i].val != '' && this.textSpans[i].val != '\u00A0') || (based == 3 && (this.textSpans[i].n || this.textSpans[i].val == '\u00A0' || i == len - 1)) || (based == 4 && (this.textSpans[i].n || i == len - 1))){
                if(animators[j].s.rn === 1){
                    indexes.push(ind);
                }
                ind += 1;
            }
        }
        this.data.t.a[j].totalChars = ind;
        var currentInd = -1, newInd;
        if(animators[j].s.rn === 1){
            for(i = 0; i < len; i += 1){
                if(currentInd != this.textSpans[i].anIndexes[j]){
                    currentInd = this.textSpans[i].anIndexes[j];
                    newInd = indexes.splice(Math.floor(Math.random()*indexes.length),1)[0];
                }
                this.textSpans[i].anIndexes[j] = newInd;
            }
        }
    }

    this.yOffset = documentData.s*1.2;
    this.fontSize = documentData.s;
};

CVTextElement.prototype.getMeasures = BaseTextElement.prototype.getMeasures;
CVTextElement.prototype.getMult = BaseTextElement.prototype.getMult;

CVTextElement.prototype.prepareFrame = function(num){
    var renderParent = this.parent.prepareFrame.call(this,num);
    if(renderParent===false){
        return;
    }
    if(!this.renderedLetters[num]){
        this.getMeasures(num);
    }
    this.currentRender = this.renderedLetters[num];
};

CVTextElement.prototype.draw = function(parentMatrix){
    if(this.parent.draw.call(this, parentMatrix)===false){
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


    var  i,len;

    len = this.textSpans.length;
    var renderedLetter;
    var lastFill = null, lastStroke = null, lastStrokeW = null;
    for(i=0;i<len;i+=1){
        renderedLetter = this.currentRender[i];
        if(this.textSpans[i].n){
            continue;
        }
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
            ///ctx.strokeText(this.textSpans[i].val,0,0);
        }
        this.globalData.renderer.restore();
    }
    /*if(this.data.hasMask){
        this.globalData.renderer.restore(true);
    }*/
    this.globalData.renderer.restore(this.data.hasMask);
};