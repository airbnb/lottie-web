function SVGTextElement(data,parentContainer,globalData,comp, placeholder){
    this.textSpans = [];
    this.renderType = 'svg';
    this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
}
createElement(SVGBaseElement, SVGTextElement);

SVGTextElement.prototype.init = ITextElement.prototype.init;
SVGTextElement.prototype.createPathShape = ITextElement.prototype.createPathShape;
SVGTextElement.prototype.getMeasures = ITextElement.prototype.getMeasures;

SVGTextElement.prototype.createElements = function(){

    this._parent.createElements.call(this);
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
    if(fontData.fClass){
        this.innerElem.setAttribute('class',fontData.fClass);
    } else {
        this.innerElem.setAttribute('font-family', fontData.fFamily);
        var fWeight = documentData.fWeight, fStyle = documentData.fStyle;
        this.innerElem.setAttribute('font-style', fStyle);
        this.innerElem.setAttribute('font-weight', fWeight);
    }
    var i, len;
    if(this.layerElement === this.parentContainer){
        this.appendNodeToParent(this.innerElem);
    }else{
        this.layerElement.appendChild(this.innerElem);
    }



    var letters = documentData.l;
    len = letters.length;
    if(!len){
        return;
    }
    var tSpan;
    var matrixHelper = this.mHelper;
    var shapes, shapeStr = '', singleShape = this.data.singleShape;
    if (singleShape) {
        var xPos = 0, yPos = 0, lineWidths = documentData.lineWidths, boxWidth = documentData.boxWidth, firstLine = true;
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
        if(singleShape && letters[i].n) {
            xPos = 0;
            yPos += documentData.yOffset;
            yPos += firstLine ? 1 : 0;
            firstLine = false;
        }
        matrixHelper.reset();
        if(this.globalData.fontManager.chars) {
            matrixHelper.scale(documentData.s / 100, documentData.s / 100);
        }
        if (singleShape) {
            if(documentData.ps){
                matrixHelper.translate(documentData.ps[0],documentData.ps[1] + documentData.ascent,0);
            }
            switch(documentData.j){
                case 1:
                    matrixHelper.translate(documentData.justifyOffset + (boxWidth - lineWidths[letters[i].line]),0,0);
                    break;
                case 2:
                    matrixHelper.translate(documentData.justifyOffset + (boxWidth - lineWidths[letters[i].line])/2,0,0);
                    break;
            }
            matrixHelper.translate(xPos, yPos, 0);
        }
        if(this.globalData.fontManager.chars){
            var charData = this.globalData.fontManager.getCharData(documentData.t.charAt(i), fontData.fStyle, this.globalData.fontManager.getFontByName(documentData.f).fFamily);
            var shapeData;
            if(charData){
                shapeData = charData.data;
            } else {
                shapeData = null;
            }
            if(shapeData && shapeData.shapes){
                shapes = shapeData.shapes[0].it;
                if(!singleShape){
                    shapeStr = '';
                }
                shapeStr += this.createPathShape(matrixHelper,shapes);
                if(!singleShape){

                    tSpan.setAttribute('d',shapeStr);
                }
            }
            if(!singleShape){
                this.innerElem.appendChild(tSpan);
            }
        }else{
            tSpan.textContent = letters[i].val;
            tSpan.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space","preserve");
            this.innerElem.appendChild(tSpan);
            if(singleShape){
                tSpan.setAttribute('transform',matrixHelper.to2dCSS());
            }
        }
        if(singleShape) {
            xPos += letters[i].l;
        }
        //
        this.textSpans.push(tSpan);
    }
    if(singleShape && this.globalData.fontManager.chars){
        tSpan.setAttribute('d',shapeStr);
        this.innerElem.appendChild(tSpan);
    }
};

SVGTextElement.prototype.hide = function(){
    if(!this.hidden){
        this.innerElem.style.display = 'none';
        this.hidden = true;
    }
};

SVGTextElement.prototype.renderFrame = function(parentMatrix){

    var renderParent = this._parent.renderFrame.call(this,parentMatrix);
    if(renderParent===false){
        this.hide();
        return;
    }
    if(this.hidden){
        this.hidden = false;
        this.innerElem.style.display = 'block';
    }
    if(!this.data.hasMask){
        if(this.finalTransform.matMdf){
            this.innerElem.setAttribute('transform',this.finalTransform.mat.to2dCSS());
        }
        if(this.finalTransform.opMdf){
            this.innerElem.setAttribute('opacity',this.finalTransform.opacity);
        }
    }

    if(this.data.singleShape){
        return;
    }

    this.getMeasures();
    if(!this.lettersChangedFlag){
        return;
    }
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
    if(this.firstFrame) {
        this.firstFrame = false;
    }
}


SVGTextElement.prototype.destroy = function(){
    this._parent.destroy.call();
    this.innerElem =  null;
};