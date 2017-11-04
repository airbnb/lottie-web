function ITextElement(data, animationItem,parentContainer,globalData){
}
ITextElement.prototype.init = function(){
    this._frameId = -1;
    this.lettersChangedFlag = true;
    //this.currentTextDocumentData = this.data.t.d.k[0].s;
    this.dynamicProperties = this.dynamicProperties || [];
    this.textAnimator = new TextAnimatorProperty(this.data.t, this.renderType, this);
    this._parent.init.call(this);
    this.textAnimator.searchProperties(this.dynamicProperties);
    //this.buildNewText();
};

ITextElement.prototype.prepareFrame = function(num) {
    if(this._frameId === this.globalData.frameId) {
         return;
    }
    this._frameId = this.globalData.frameId;
    var textKeys = this.data.t.d.k;
    var i = 0, len = textKeys.length;
    while(i < len) {
        textDocumentData = textKeys[i].s;
        i += 1;
        if(i === len || textKeys[i].t > num){
            break;
        }
    } 
    this.lettersChangedFlag = false;
    if(textDocumentData !== this.currentTextDocumentData){
        if(!textDocumentData.__complete) {
            this.completeTextData(textDocumentData);
        }
        this.currentTextDocumentData = textDocumentData;
        this.lettersChangedFlag = true;
        this.buildNewText();
    }
    this._parent.prepareFrame.call(this, num);
}

ITextElement.prototype.createPathShape = function(matrixHelper, shapes) {
    var j,jLen = shapes.length;
    var k, kLen, pathNodes;
    var shapeStr = '';
    for(j=0;j<jLen;j+=1){
        pathNodes = shapes[j].ks.k;
        shapeStr += this.buildShapeString(pathNodes, pathNodes.i.length, true, matrixHelper);
    }
    return shapeStr;
};

ITextElement.prototype.updateDocumentData = function(newData, index) {
    var dData = index === undefined ? this.currentTextDocumentData : this.data.t.d.k[index].s;
    dData.__complete = false;
    dData.t = newData.t;
    if(dData === this.currentTextDocumentData) {
        this.currentTextDocumentData = null;
    }
}


ITextElement.prototype.completeTextData = function(documentData) {
    documentData.__complete = true;
    var fontManager = this.globalData.fontManager;
    var data = this.data;
    var letters = [];
    var i, len;
    var newLineFlag, index = 0, val;
    var anchorGrouping = data.t.m.g;
    var currentSize = 0, currentPos = 0, currentLine = 0, lineWidths = [];
    var lineWidth = 0;
    var maxLineWidth = 0;
    var j, jLen;
    var fontData = fontManager.getFontByName(documentData.f);
    var charData, cLength = 0;
    var styles = fontData.fStyle.split(' ');

    var fWeight = 'normal', fStyle = 'normal';
    len = styles.length;
    var styleName;
    for(i=0;i<len;i+=1){
        styleName = styles[i].toLowerCase();
        switch(styleName) {
            case 'italic':
            fStyle = 'italic';
            break;
            case 'bold':
            fWeight = '700';
            break;
            case 'black':
            fWeight = '900';
            break;
            case 'medium':
            fWeight = '500';
            break;
            case 'regular':
            case 'normal':
            fWeight = '400';
            case 'light':
            case 'thin':
            fWeight = '200';
            break;
        }
    }
    documentData.fWeight = fWeight;
    documentData.fStyle = fStyle;
    len = documentData.t.length;
    var trackingOffset = documentData.tr/1000*documentData.s;
    if(documentData.sz){
        var boxWidth = documentData.sz[0];
        var lastSpaceIndex = -1;
        for(i=0;i<len;i+=1){
            newLineFlag = false;
            if(documentData.t.charAt(i) === ' '){
                lastSpaceIndex = i;
            }else if(documentData.t.charCodeAt(i) === 13){
                lineWidth = 0;
                newLineFlag = true;
            }
            if(fontManager.chars){
                charData = fontManager.getCharData(documentData.t.charAt(i), fontData.fStyle, fontData.fFamily);
                cLength = newLineFlag ? 0 : charData.w*documentData.s/100;
            }else{
                //tCanvasHelper.font = documentData.s + 'px '+ fontData.fFamily;
                cLength = fontManager.measureText(documentData.t.charAt(i), documentData.f, documentData.s);
            }
            if(lineWidth + cLength > boxWidth){
                if(lastSpaceIndex === -1){
                    len += 1;
                } else {
                    i = lastSpaceIndex;
                }
                documentData.t = documentData.t.substr(0,i) + "\r" + documentData.t.substr(i === lastSpaceIndex ? i + 1 : i);
                lastSpaceIndex = -1;
                lineWidth = 0;
            }else {
                lineWidth += cLength;
                lineWidth += trackingOffset;
            }
        }
        len = documentData.t.length;
    }
    lineWidth = - trackingOffset;
    cLength = 0;
    for (i = 0;i < len ;i += 1) {
        newLineFlag = false;
        if(documentData.t.charAt(i) === ' '){
            val = '\u00A0';
        }else if(documentData.t.charCodeAt(i) === 13){
            lineWidths.push(lineWidth);
            maxLineWidth = lineWidth > maxLineWidth ? lineWidth : maxLineWidth;
            lineWidth = - 2 * trackingOffset;
            val = '';
            newLineFlag = true;
            currentLine += 1;
        }else{
            val = documentData.t.charAt(i);
        }
        if(fontManager.chars){
            charData = fontManager.getCharData(documentData.t.charAt(i), fontData.fStyle, fontManager.getFontByName(documentData.f).fFamily);
            cLength = newLineFlag ? 0 : charData.w*documentData.s/100;
        }else{
            //var charWidth = fontManager.measureText(val, documentData.f, documentData.s);
            //tCanvasHelper.font = documentData.s + 'px '+ fontManager.getFontByName(documentData.f).fFamily;
            cLength = fontManager.measureText(val, documentData.f, documentData.s);
        }

        //
        lineWidth += cLength + trackingOffset;
        letters.push({l:cLength,an:cLength,add:currentSize,n:newLineFlag, anIndexes:[], val: val, line: currentLine});
        if(anchorGrouping == 2){
            currentSize += cLength;
            if(val == '' || val == '\u00A0' || i == len - 1){
                if(val == '' || val == '\u00A0'){
                    currentSize -= cLength;
                }
                while(currentPos<=i){
                    letters[currentPos].an = currentSize;
                    letters[currentPos].ind = index;
                    letters[currentPos].extra = cLength;
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
                    letters[currentPos].an = currentSize;
                    letters[currentPos].ind = index;
                    letters[currentPos].extra = cLength;
                    currentPos += 1;
                }
                currentSize = 0;
                index += 1;
            }
        }else{
            letters[index].ind = index;
            letters[index].extra = 0;
            index += 1;
        }
    }
    documentData.l = letters;
    maxLineWidth = lineWidth > maxLineWidth ? lineWidth : maxLineWidth;
    lineWidths.push(lineWidth);
    if(documentData.sz){
        documentData.boxWidth = documentData.sz[0];
        documentData.justifyOffset = 0;
    }else{
        documentData.boxWidth = maxLineWidth;
        switch(documentData.j){
            case 1:
                documentData.justifyOffset = - documentData.boxWidth;
                break;
            case 2:
                documentData.justifyOffset = - documentData.boxWidth/2;
                break;
            default:
                documentData.justifyOffset = 0;
        }
    }
    documentData.lineWidths = lineWidths;

    var animators = data.t.a, animatorData, letterData;
    jLen = animators.length;
    var based, ind, indexes = [];
    for(j=0;j<jLen;j+=1){
        animatorData = animators[j];
        if(animatorData.a.sc){
            documentData.strokeColorAnim = true;
        }
        if(animatorData.a.sw){
            documentData.strokeWidthAnim = true;
        }
        if(animatorData.a.fc || animatorData.a.fh || animatorData.a.fs || animatorData.a.fb){
            documentData.fillColorAnim = true;
        }
        ind = 0;
        based = animatorData.s.b;
        for(i=0;i<len;i+=1){
            letterData = letters[i];
            letterData.anIndexes[j] = ind;
            if((based == 1 && letterData.val != '') || (based == 2 && letterData.val != '' && letterData.val != '\u00A0') || (based == 3 && (letterData.n || letterData.val == '\u00A0' || i == len - 1)) || (based == 4 && (letterData.n || i == len - 1))){
                if(animatorData.s.rn === 1){
                    indexes.push(ind);
                }
                ind += 1;
            }
        }
        data.t.a[j].s.totalChars = ind;
        var currentInd = -1, newInd;
        if(animatorData.s.rn === 1){
            for(i = 0; i < len; i += 1){
                if(currentInd != letterData.anIndexes[j]){
                    currentInd = letterData.anIndexes[j];
                    newInd = indexes.splice(Math.floor(Math.random()*indexes.length),1)[0];
                }
                letterData.anIndexes[j] = newInd;
            }
        }
    }
    documentData.yOffset = documentData.lh || documentData.s*1.2;
    documentData.ls = documentData.ls || 0;
    documentData.ascent = fontData.ascent*documentData.s/100;
}

ITextElement.prototype.buildShapeString = IShapeElement.prototype.buildShapeString;

ITextElement.prototype.emptyProp = new LetterProps();
