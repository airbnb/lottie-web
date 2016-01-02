function HTextElement(data,parentContainer,globalData,comp, placeholder){
    this.textSpans = [];
    this.textPaths = [];
    this.currentBBox = {
        x:999999,
        y: -999999,
        h: 0,
        w: 0
    }
    this.renderType = 'svg';
    this.isMasked = false;
    this.parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);

}
createElement(HBaseElement, HTextElement);

HTextElement.prototype.init = ITextElement.prototype.init;
HTextElement.prototype.getMeasures = ITextElement.prototype.getMeasures;

HTextElement.prototype.createElements = function(){
    this.isMasked = this.checkMasks();
    var documentData = this.data.t.d;
    var parent = document.createElement('div');
    styleDiv(parent);
    this.layerElement = parent;
    if(this.isMasked){
        this.renderType = 'svg';
        var cont = document.createElementNS(svgNS,'svg');
        this.cont = cont;
        this.compW = this.comp.data ? this.comp.data.w : this.globalData.compSize.w;
        this.compH = this.comp.data ? this.comp.data.h : this.globalData.compSize.h;
        cont.setAttribute('width',this.compW);
        cont.setAttribute('height',this.compH);
        var g = document.createElementNS(svgNS,'g');
        cont.appendChild(g);
        parent.appendChild(cont);
        this.maskedElement = g;
        this.innerElem = g;
    } else {
        this.renderType = 'html';
        this.innerElem = parent;
    }
    this.parentContainer.appendChild(parent);

    if(documentData.fc) {
        this.innerElem.style.color = this.innerElem.style.fill = 'rgb(' + documentData.fc[0] + ',' + documentData.fc[1] + ',' + documentData.fc[2] + ')';
        ////this.innerElem.setAttribute('fill', 'rgb(' + documentData.fc[0] + ',' + documentData.fc[1] + ',' + documentData.fc[2] + ')');
    }else{
        this.innerElem.style.color = this.innerElem.style.fill = 'rgba(0,0,0,0)';
        ////this.innerElem.setAttribute('fill', 'rgba(0,0,0,0)');
    }
    if(documentData.sc){
        ////this.innerElem.setAttribute('stroke', 'rgb(' + documentData.sc[0] + ',' + documentData.sc[1] + ',' + documentData.sc[2] + ')');
        this.innerElem.style.stroke = 'rgb(' + documentData.sc[0] + ',' + documentData.sc[1] + ',' + documentData.sc[2] + ')';
        ////this.innerElem.setAttribute('stroke-width', documentData.sw);
        this.innerElem.style.strokeWidth = documentData.sw+'px';
    }
    ////this.innerElem.setAttribute('font-size', documentData.s);
    this.innerElem.style.fontSize = documentData.s+'px';
    this.innerElem.style.lineHeight = documentData.s+'px';
    var fontData = this.globalData.fontManager.getFontByName(documentData.f);
    ////this.innerElem.setAttribute('font-family', fontData.fFamily);
    this.innerElem.style.fontFamily = fontData.fFamily;
    var i, len;
    var fWeight = documentData.fWeight, fStyle = documentData.fStyle;
    ////this.innerElem.setAttribute('font-style', fStyle);
    this.innerElem.style.fontStyle = fStyle;
    ////this.innerElem.setAttribute('font-weight', fWeight);
    this.innerElem.style.fontWeight = fWeight;



    var letters = documentData.l;
    len = letters.length;
    var tSpan,tParent,tCont;
    var matrixHelper = this.mHelper;
    var shapes, shapeStr = '', j, jLen, k, kLen, pathNodes, singleShape = this.data.singleShape;
    for (i = 0;i < len ;i += 1) {
        if(this.globalData.fontManager.chars){
            tSpan = document.createElementNS(svgNS,'path');
            if(!this.isMasked){
                tParent = document.createElement('div');
                tCont = document.createElementNS(svgNS,'svg');
                tParent.appendChild(tCont);
                tCont.appendChild(tSpan);
                styleDiv(tParent);
            }
            tSpan.setAttribute('stroke-linecap', 'butt');
            tSpan.setAttribute('stroke-linejoin','round');
            tSpan.setAttribute('stroke-miterlimit','4');
        }else{
            if(!this.isMasked){
                tParent = document.createElement('span');
                styleDiv(tParent);
                tSpan = document.createElement('span');
                styleDiv(tSpan);
                tParent.appendChild(tSpan);
            } else {
                tSpan = document.createElementNS(svgNS,'text');
            }
        }
        //tSpan.setAttribute('visibility', 'hidden');
        if(this.globalData.fontManager.chars){
            var charData = this.globalData.fontManager.getCharData(documentData.t.charAt(i), fontData.fStyle, this.globalData.fontManager.getFontByName(documentData.f).fFamily);
            var shapeData;
            if(charData){
                shapeData = charData.data;
            } else {
                shapeData = null;
            }
            matrixHelper.reset();
            if(shapeData && shapeData.shapes){
                shapes = shapeData.shapes[0].it;
                shapeStr = '';
                jLen = shapes.length;
                matrixHelper.scale(documentData.s/100,documentData.s/100);
                for(j=0;j<jLen;j+=1){
                    kLen = shapes[j].ks.k.i.length;
                    pathNodes = shapes[j].ks.k;
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
                //shapeStr = 'M -10 -10 H20 V20 H-20 V-20z';
                tSpan.setAttribute('d',shapeStr);
            }
            if(!this.isMasked){
                this.innerElem.appendChild(tParent);
                var scale = documentData.s/100;
                if(shapeData && shapeData.shapes){
                    var rBound = Math.ceil(shapeData.bounds.r*scale);
                    var tBound = Math.floor(shapeData.bounds.t*scale);
                    var lBound = Math.floor(shapeData.bounds.l*scale);
                    var bBound = Math.ceil(shapeData.bounds.b*scale);
                    tCont.setAttribute('width',rBound - lBound);
                    tCont.setAttribute('height',bBound - tBound);
                    tCont.setAttribute('viewBox',lBound+' '+tBound+' '+(rBound - lBound)+' '+(bBound - tBound));
                    tCont.style.transform = tCont.style.webkitTransform = 'translate('+lBound+'px,'+ tBound+'px)';
                    letters[i].yOffset = tBound;


                    /*tCont.setAttribute('width','20');
                    tCont.setAttribute('height','20');
                    tCont.setAttribute('viewBox','-10 -10 20 20');
                    tCont.style.transform = 'translate(0px, 0px)';*/
                } else{
                    tCont.setAttribute('width',1);
                    tCont.setAttribute('height',1);
                }
            }else{
                this.innerElem.appendChild(tSpan);
            }
        }else{
            tSpan.textContent = letters[i].val;
            tSpan.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space","preserve");
            if(!this.isMasked){
                this.innerElem.appendChild(tParent);
                //
                tSpan.style.transform = tSpan.style.webkitTransform = 'translate3d(0,'+ -documentData.s/1.2+'px,0)';
            } else {
                this.innerElem.appendChild(tSpan);
            }
        }
        //
        if(!this.isMasked){
            this.textSpans.push(tParent);
        }else{
            this.textSpans.push(tSpan);
        }
        this.textPaths.push(tSpan);
    }
};

HTextElement.prototype.hide = SVGTextElement.prototype.hide;

HTextElement.prototype.renderFrame = function(parentMatrix){

    var renderParent = this.parent.renderFrame.call(this,parentMatrix);
    if(renderParent===false){
        this.hide();
        return;
    }
    if(this.hidden){
        this.hidden = false;
        this.innerElem.style.display = 'block';
    }

    if(this.data.singleShape){
        if(!this.firstFrame){
            return;
        } else {
            // Todo Benchmark if using this is better than getBBox
             if(this.isMasked && this.finalTransform.matMdf){
                 this.cont.setAttribute('viewBox',-this.finalTransform.mProp.p.v[0]+' '+ -this.finalTransform.mProp.p.v[1]+' '+this.compW+' '+this.compH);
                this.cont.style.transform = this.cont.style.webkitTransform = 'translate(' + -this.finalTransform.mProp.p.v[0] + 'px,' + -this.finalTransform.mProp.p.v[1] + 'px)';
             }
        }
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
        if(!this.isMasked){
            this.textSpans[i].style.transform = this.textSpans[i].style.webkitTransform = renderedLetter.m;
        }else{
            this.textSpans[i].setAttribute('transform',renderedLetter.m);
        }
        ////this.textSpans[i].setAttribute('opacity',renderedLetter.o);
        this.textSpans[i].style.opacity = renderedLetter.o;
        if(renderedLetter.sw){
            this.textPaths[i].setAttribute('stroke-width',renderedLetter.sw);
        }
        if(renderedLetter.sc){
            this.textPaths[i].setAttribute('stroke',renderedLetter.sc);
        }
        if(renderedLetter.fc){
            this.textPaths[i].setAttribute('fill',renderedLetter.fc);
            this.textPaths[i].style.color = renderedLetter.fc;
        }
    }
    if(this.isMasked){

        var boundingBox = this.innerElem.getBBox();
        if(this.currentBBox.w !== boundingBox.width){
            this.currentBBox.w = boundingBox.width;
            this.cont.setAttribute('width',boundingBox.width);
        }
        if(this.currentBBox.h !== boundingBox.height){
            this.currentBBox.h = boundingBox.height;
            this.cont.setAttribute('height',boundingBox.height);
        }
        if(this.currentBBox.w !== boundingBox.width || this.currentBBox.h !== boundingBox.height  || this.currentBBox.x !== boundingBox.x  || this.currentBBox.y !== boundingBox.y){
            this.currentBBox.w = boundingBox.width;
            this.currentBBox.h = boundingBox.height;
            this.currentBBox.x = boundingBox.x;
            this.currentBBox.y = boundingBox.y;

            this.cont.setAttribute('viewBox',this.currentBBox.x+' '+this.currentBBox.y+' '+this.currentBBox.w+' '+this.currentBBox.h);
            this.cont.style.transform = this.cont.style.webkitTransform = 'translate(' + this.currentBBox.x + 'px,' + this.currentBBox.y + 'px)';
        }
    }
    if(this.firstFrame){
        this.firstFrame = false;
    }
}


HTextElement.prototype.destroy = SVGTextElement.prototype.destroy;