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
    if(documentData.fc) {
        this.textElem.setAttribute('fill', 'rgb(' + documentData.fc[0] + ',' + documentData.fc[1] + ',' + documentData.fc[2] + ')');
    }else{
        this.textElem.setAttribute('fill', 'rgba(0,0,0,0)');
    }
    if(documentData.sc){
        this.textElem.setAttribute('stroke', 'rgb(' + documentData.sc[0] + ',' + documentData.sc[1] + ',' + documentData.sc[2] + ')');
        this.textElem.setAttribute('stroke-width', documentData.sw);
    }
    this.textElem.setAttribute('font-size', documentData.s);
    var fontData = this.globalData.fontManager.getFontByName(documentData.f);
    this.textElem.setAttribute('font-family', fontData.fFamily);
    var i, len;
    var fWeight = documentData.fWeight, fStyle = documentData.fStyle;
    this.textElem.setAttribute('font-style', fStyle);
    this.textElem.setAttribute('font-weight', fWeight);
    this.layerElement.appendChild(this.textElem);



    var letters = documentData.l;
    len = letters.length;
    var tSpan, tShapeG;
    var matrixHelper = this.mHelper;
    var shapes, shapeStr = '', j, jLen, k, kLen, pathNodes;
    for (i = 0;i < len ;i += 1) {
        if(this.globalData.fontManager.chars){
            if(this.data.t.a.length || i === 0 || 1 === 1){
                tSpan = document.createElementNS(svgNS,'path');
            }
        }else{
            tSpan = document.createElementNS(svgNS,'text');
        }
        tSpan.setAttribute('stroke-linecap', 'butt');
        tSpan.setAttribute('stroke-linejoin','round');
        tSpan.setAttribute('stroke-miterlimit','4');
        //tSpan.setAttribute('visibility', 'hidden');
        if(this.globalData.fontManager.chars){
            if(this.data.t.a.length || i === 0 || 1 === 1) {
                //tShapeG = document.createElementNS(svgNS, 'g');
                //tShapeG.appendChild(tSpan);
            }
            var charData = this.globalData.fontManager.getCharData(documentData.t.charAt(i), fontData.fStyle, this.globalData.fontManager.getFontByName(documentData.f).fFamily);
            var shapeData = charData.data;
            matrixHelper.reset();
            matrixHelper.scale(documentData.s/100,documentData.s/100);
            if(shapeData){
                shapes = shapeData.shapes[0].it;
                if(this.data.t.a.length || 1 === 1){
                    shapeStr = '';
                }
                jLen = shapes.length;
                for(j=0;j<jLen;j+=1){
                    kLen = shapes[j].ks.i.length;
                    pathNodes = shapes[j].ks;
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
                tSpan.setAttribute('d',shapeStr);
            }
            this.textElem.appendChild(tSpan);
        }else{
            tSpan.textContent = letters[i].val;
            tSpan.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space","preserve");
            this.textElem.appendChild(tSpan);
        }
        //
        this.textSpans.push(tSpan);
    }
};

ITextElement.prototype.hide = function(){
    if(!this.hidden){
        this.textElem.setAttribute('visibility','hidden');
        this.hidden = true;
    }
};


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

    var renderedLetters = this.data.renderedData[num].t.l;

    var letters = this.data.t.d.l;

    len = letters.length;
    var renderedLetter;
    for(i=0;i<len;i+=1){
        if(letters[i].n){
            continue;
        }
        renderedLetter = renderedLetters[i];
        this.textSpans[i].setAttribute('transform',renderedLetter.m);
        this.textSpans[i].setAttribute('opacity',renderedLetter.o);
        if(renderedLetter.sw){
            this.textSpans[i].setAttribute('stroke-width',renderedLetter.sw);
        }
        if(renderedLetter.sc){
            this.textSpans[i].setAttribute('stroke',renderedLetter.sc);
        }
        if(renderedLetter.fc){
            this.textSpans[i].setAttribute('fill',renderedLetter.fc);
        }
    }


};

ITextElement.prototype.destroy = function(){
    this.parent.destroy.call();
    this.textElem =  null;
};
