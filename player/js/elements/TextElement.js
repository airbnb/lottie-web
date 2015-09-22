function ITextElement(data, animationItem,parentContainer,globalData){
    this.textSpans = [];
    this.yOffset = 0;
    this.boxWidth = 0;
    this.justifyOffset = 0;
    this.fillColorAnim = false;
    this.strokeColorAnim = false;
    this.strokeWidthAnim = false;
    this.parent.constructor.call(this,data, animationItem,parentContainer,globalData);
    this.renderedLetters = [];
}
createElement(BaseElement, ITextElement);

ITextElement.prototype.createElements = function(){

    this.parent.createElements.call(this);
    //console.log('this.data: ',this.data);
    var documentData = this.data.t.d;

    this.textElem = document.createElementNS(svgNS,'g');
    var hasFill = false;
    if(documentData.fc) {
        hasFill = true;
        this.textElem.setAttribute('fill', 'rgb(' + documentData.fc[0] + ',' + documentData.fc[1] + ',' + documentData.fc[2] + ')');
    }else{
        this.textElem.setAttribute('fill', 'rgba(0,0,0,0)');
    }
    var hasStroke = false;
    if(documentData.sc){
        hasStroke = true;
        this.textElem.setAttribute('stroke', 'rgb(' + documentData.sc[0] + ',' + documentData.sc[1] + ',' + documentData.sc[2] + ')');
        this.textElem.setAttribute('stroke-width', documentData.sw);
    }
    this.textElem.setAttribute('font-size', documentData.s);
    var fontData = this.globalData.fontManager.getFontByName(documentData.f);
    this.textElem.setAttribute('font-family', fontData.fFamily);
    var styles = fontData.fStyle.split(' ');
    var i, len = styles.length;
    var fWeight = 'normal', fStyle = 'normal';
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
    this.textElem.setAttribute('font-style', fStyle);
    this.textElem.setAttribute('font-weight', fWeight);
    this.layerElement.appendChild(this.textElem);
    len = documentData.t.length;
    var tSpan, tShape, j, jLen, k, kLen;
    var newLineFlag, index = 0, val;
    var anchorGrouping = this.data.t.m.g;
    var currentSize = 0, currentPos = 0;
    var matrixHelper = this.mHelper;
    var lineWidth = 0;
    var maxLineWidth = 0;
    for (i = 0;i < len ;i += 1) {
        newLineFlag = false;
        if(this.globalData.fontManager.chars){
            tShape = document.createElementNS(svgNS,'path');
            tShape.setAttribute('stroke-linecap', 'butt');
            tShape.setAttribute('stroke-linejoin','round');
            tShape.setAttribute('stroke-miterlimit','4');
        }else{
            tSpan = document.createElementNS(svgNS,'text');
            tSpan.setAttribute('stroke-linecap', 'butt');
            tSpan.setAttribute('stroke-linejoin','round');
            tSpan.setAttribute('stroke-miterlimit','4');
        }
        //tSpan.setAttribute('visibility', 'hidden');
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
        var cLength;
        if(this.globalData.fontManager.chars){
            var tShapeG = document.createElementNS(svgNS,'g');
            tShapeG.appendChild(tShape);
            var charData = this.globalData.fontManager.getCharData(documentData.t.charAt(i), fontData.fStyle, this.globalData.fontManager.getFontByName(documentData.f).fFamily);
            var shapeData = charData.data;
            matrixHelper.reset();
            matrixHelper.scale(documentData.s/100,documentData.s/100);
            if(shapeData){
                var shapes = shapeData.shapes[0].it;
                var shapeStr = '';
                jLen = shapes.length;
                for(j=0;j<jLen;j+=1){
                    kLen = shapes[j].ks.i.length;
                    var pathNodes = shapes[j].ks;
                    for(k=1;k<kLen;k+=1){
                        if(k==1){
                            shapeStr += " M"+matrixHelper.applyToPointStringified(pathNodes.v[0][0],pathNodes.v[0][1]);
                            //shapeStr += " M"+pathNodes.v[0][0]+','+pathNodes.v[0][1];
                        }
                        shapeStr += " C"+matrixHelper.applyToPointStringified(pathNodes.o[k-1][0],pathNodes.o[k-1][1]) + " "+matrixHelper.applyToPointStringified(pathNodes.i[k][0],pathNodes.i[k][1]) + " "+matrixHelper.applyToPointStringified(pathNodes.v[k][0],pathNodes.v[k][1]);
                        //shapeStr += " C"+pathNodes.o[k-1][0]+','+pathNodes.o[k-1][1] + " "+pathNodes.i[k][0]+','+pathNodes.i[k][1] + " "+pathNodes.v[k][0]+','+pathNodes.v[k][1];
                    }
                    shapeStr += " C"+matrixHelper.applyToPointStringified(pathNodes.o[k-1][0],pathNodes.o[k-1][1]) + " "+matrixHelper.applyToPointStringified(pathNodes.i[0][0],pathNodes.i[0][1]) + " "+matrixHelper.applyToPointStringified(pathNodes.v[0][0],pathNodes.v[0][1]);
                    //shapeStr += " C"+pathNodes.o[k-1][0]+','+pathNodes.o[k-1][1] + " "+pathNodes.i[0][0]+','+pathNodes.i[0][1] + " "+pathNodes.v[0][0]+','+pathNodes.v[0][1];
                    shapeStr += 'z';
                }
                tShape.setAttribute('d',shapeStr);
            }
            this.textElem.appendChild(tShapeG);
            cLength = charData.w*documentData.s/100;
        }else{
            tSpan.textContent = val;
            tSpan.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space","preserve");
            this.textElem.appendChild(tSpan);
            cLength = tSpan.getComputedTextLength();
        }
        //
        lineWidth += cLength;
        this.textSpans.push({elem:tSpan || tShapeG,l:cLength,an:cLength,add:currentSize,n:newLineFlag, anIndexes:[], val: val});
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

    /*this.pathElem = document.createElementNS(svgNS,'path');
    this.pathElem.setAttribute('stroke', '#ff0000');
    this.pathElem.setAttribute('stroke-width', '1');
    this.pathElem.setAttribute('fill', 'none');
    this.pathElem.setAttribute('d','');
    this.layerElement.appendChild(this.pathElem);

    this.pointsElem = document.createElementNS(svgNS,'path');
    this.pointsElem.setAttribute('stroke', '#00ff00');
    this.pointsElem.setAttribute('stroke-width', '1');
    this.pointsElem.setAttribute('fill', 'none');
    this.layerElement.appendChild(this.pointsElem);*/
};

ITextElement.prototype.hide = function(){
    if(!this.hidden){
        this.textElem.setAttribute('visibility','hidden');
        this.hidden = true;
    }
};



ITextElement.prototype.getMeasures = BaseTextElement.prototype.getMeasures;
ITextElement.prototype.getMult = BaseTextElement.prototype.getMult;

ITextElement.prototype.renderFrame = function(num,parentMatrix){
    var renderParent = this.parent.renderFrame.call(this,num,parentMatrix);

    if(renderParent===false){
        this.hide();
        return;
    }
    if(this.hidden){
        this.lastData.o = -1;
        this.hidden = false;
        this.textElem.setAttribute('visibility', 'visible');
    }
    if(!this.data.hasMask){
        if(!this.renderedFrames[this.globalData.frameNum]){
            this.renderedFrames[this.globalData.frameNum] = {
                tr: 'matrix('+this.finalTransform.mat.props.join(',')+')',
                o: this.finalTransform.opacity
            };
        }
        var renderedFrameData = this.renderedFrames[this.globalData.frameNum];
        if(this.lastData.tr != renderedFrameData.tr){
            this.lastData.tr = renderedFrameData.tr;
            this.textElem.setAttribute('transform',renderedFrameData.tr);
        }
        if(this.lastData.o !== renderedFrameData.o){
            this.lastData.o = renderedFrameData.o;
            this.textElem.setAttribute('opacity',renderedFrameData.o);
        }
    }

    var  i,len;
    if(!this.renderedLetters[num]){
        this.getMeasures(num, true);
    }

    len = this.textSpans.length;
    var renderedLetter;
    for(i=0;i<len;i+=1){
        if(this.textSpans[i].n){
            continue;
        }
        renderedLetter = this.renderedLetters[num][i];
        this.textSpans[i].elem.setAttribute('transform',renderedLetter.m);
        this.textSpans[i].elem.setAttribute('opacity',renderedLetter.o);
        if(renderedLetter.sw){
            this.textSpans[i].elem.setAttribute('stroke-width',renderedLetter.sw);
        }
        if(renderedLetter.sc){
            this.textSpans[i].elem.setAttribute('stroke',renderedLetter.sc);
        }
        if(renderedLetter.fc){
            this.textSpans[i].elem.setAttribute('fill',renderedLetter.fc);
        }
    }


};

ITextElement.prototype.destroy = function(){
    this.parent.destroy.call();
    this.textElem =  null;
};
