function SVGTextElement(data,parentContainer,globalData,comp, placeholder){
    this.textSpans = [];
    this.renderType = 'svg';
    this.parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
}
createElement(SVGBaseElement, SVGTextElement);

SVGTextElement.prototype.init = ITextElement.prototype.init;
SVGTextElement.prototype.getMeasures = ITextElement.prototype.getMeasures;
SVGTextElement.prototype.getMult = ITextElement.prototype.getMult;

SVGTextElement.prototype.createElements = function(){

    this.parent.createElements.call(this);
    var documentData = this.data.t.d;

    this.innerElem = document.createElementNS(svgNS,'g');
    if(documentData.fc) {
        this.innerElem.setAttribute('fill', 'rgb(' + documentData.fc[0] + ',' + documentData.fc[1] + ',' + documentData.fc[2] + ')');
    }else{
        this.innerElem.setAttribute('fill', 'rgba(0,0,0,0)');
    }
    if(documentData.sc){
        this.innerElem.setAttribute('stroke', 'rgb(' + documentData.sc[0] + ',' + documentData.sc[1] + ',' + documentData.sc[2] + ')');
        this.innerElem.setAttribute('stroke-width', documentData.sw);
    }
    this.innerElem.setAttribute('font-size', documentData.s);
    var fontData = this.globalData.fontManager.getFontByName(documentData.f);
    this.innerElem.setAttribute('font-family', fontData.fFamily);
    var i, len;
    var fWeight = documentData.fWeight, fStyle = documentData.fStyle;
    this.innerElem.setAttribute('font-style', fStyle);
    this.innerElem.setAttribute('font-weight', fWeight);
    this.layerElement.appendChild(this.innerElem);



    var letters = documentData.l;
    len = letters.length;
    var tSpan;
    var matrixHelper = this.mHelper;
    var shapes, shapeStr = '', j, jLen, k, kLen, pathNodes, singleShape = this.data.singleShape;
    if(this.globalData.fontManager.chars) {
        if (singleShape) {
            var xPos = 0, yPos = 0, lineWidths = documentData.lineWidths, boxWidth = documentData.boxWidth, firstLine = true;
        }
    }
    for (i = 0;i < len ;i += 1) {
        if(this.globalData.fontManager.chars){
            if(!singleShape || i === 0){
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
            var charData = this.globalData.fontManager.getCharData(documentData.t.charAt(i), fontData.fStyle, this.globalData.fontManager.getFontByName(documentData.f).fFamily);
            var shapeData = charData.data;
            matrixHelper.reset();
            if(singleShape && letters[i].n) {
                xPos = 0;
                yPos += documentData.yOffset;
                yPos += firstLine ? 1 : 0;
                firstLine = false;
            }
            if(shapeData){
                shapes = shapeData.shapes[0].it;
                if(!singleShape){
                    shapeStr = '';
                }else{
                    switch(documentData.j){
                        case 1:
                            matrixHelper.translate(documentData.justifyOffset + (boxWidth - lineWidths[letters[i].line]),0);
                            break;
                        case 2:
                            matrixHelper.translate(documentData.justifyOffset + (boxWidth - lineWidths[letters[i].line])/2,0);
                            break;
                    }
                    matrixHelper.translate(xPos,yPos);
                }
                jLen = shapes.length;
                matrixHelper.scale(documentData.s/100,documentData.s/100);
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
                if(!singleShape){

                    tSpan.setAttribute('d',shapeStr);
                }
            }
            if(singleShape){
                xPos += letters[i].l;
            }else{
                this.innerElem.appendChild(tSpan);
            }
        }else{
            tSpan.textContent = letters[i].val;
            tSpan.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space","preserve");
            this.innerElem.appendChild(tSpan);
        }
        //
        this.textSpans.push(tSpan);
    }
    if(singleShape){
        tSpan.setAttribute('d',shapeStr);
        this.innerElem.appendChild(tSpan);
    }
};

SVGTextElement.prototype.hide = function(){
    if(!this.hidden){
        this.innerElem.setAttribute('visibility','hidden');
        this.hidden = true;
    }
};

SVGTextElement.prototype.renderFrame = function(parentMatrix){

    var renderParent = this.parent.renderFrame.call(this,parentMatrix);
    if(renderParent===false){
        this.hide();
        return;
    }
    if(this.hidden){
        this.hidden = false;
        this.innerElem.setAttribute('visibility', 'visible');
    }
    if(!this.data.hasMask){
        if(this.finalTransform.matMdf){
            this.innerElem.setAttribute('transform','matrix('+this.finalTransform.mat.props.join(',')+')');
        }
        if(this.finalTransform.opMdf){
            this.innerElem.setAttribute('opacity',this.finalTransform.opacity);
        }
    }

    if(this.data.singleShape){
        return;
    }

    this.getMeasures();

    var  i,len;

    var renderedLetters = this.renderedLetters;

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
}


SVGTextElement.prototype.destroy = function(){
    this.parent.destroy.call();
    this.innerElem =  null;
};