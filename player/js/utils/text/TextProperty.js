function TextProperty(elem, data){
	this._frameId = initialDefaultFrame;
	this.pv = '';
	this.v = '';
	this.kf = false;
	this._isFirstFrame = true;
	this._mdf = false;
	this.data = data;
	this.elem = elem;
    this.comp = this.elem.comp;
	this.keysIndex = -1;
    this.canResize = false;
    this.minimumFontSize = 1;
    this.effectsSequence = [];
	this.currentData = {
		ascent: 0,
        boxWidth: this.defaultBoxWidth,
        f: '',
        fStyle: '',
        fWeight: '',
        fc: '',
        j: '',
        justifyOffset: '',
        l: [],
        lh: 0,
        lineWidths: [],
        ls: '',
        of: '',
        s: '',
        sc: '',
        sw: 0,
        t: 0,
        tr: 0,
        sz:0,
        ps:null,
        fillColorAnim: false,
        strokeColorAnim: false,
        strokeWidthAnim: false,
        yOffset: 0,
        finalSize:0,
        finalText:[],
        finalLineHeight: 0,
        __test: true

	};
    this.copyFromDocumentData(this.data.d.k[0].s);
    
    if(!this.searchProperty()) {
        this.completeTextData(this.currentData);
        this.keysIndex = 0;
    }
}

TextProperty.prototype.defaultBoxWidth = [0,0];

TextProperty.prototype.copyFromDocumentData = function(data) {
    for(var s in data) {
        this.currentData[s] = data[s];
    }
}

TextProperty.prototype.setCurrentData = function(data, currentTextValue){
        if(this.currentData !== data) {
            if(!data.__complete) {
                this.completeTextData(data);
            }
            this.copyFromDocumentData(data);
            this.currentData.boxWidth = this.currentData.boxWidth || this.defaultBoxWidth;
            this.currentData.fillColorAnim = data.fillColorAnim || this.currentData.fillColorAnim;
            this.currentData.strokeColorAnim = data.strokeColorAnim || this.currentData.strokeColorAnim;
            this.currentData.strokeWidthAnim = data.strokeWidthAnim || this.currentData.strokeWidthAnim;
            this._mdf = true;
        } else if(currentTextValue !== this.currentData.t) {
            this._mdf = true;
            this.completeTextData(data);
        }
		/*var currentData = this.currentData;
        currentData.ascent = data.ascent;
        currentData.boxWidth = data.boxWidth ? data.boxWidth : currentData.boxWidth;
        currentData.f = data.f;
        currentData.fStyle = data.fStyle;
        currentData.fWeight = data.fWeight;
        currentData.fc = data.fc;
        currentData.j = data.j;
        currentData.justifyOffset = data.justifyOffset;
        currentData.l = data.l;
        currentData.lh = data.lh;
        currentData.lineWidths = data.lineWidths;
        currentData.ls = data.ls;
        currentData.of = data.of;
        currentData.s = data.s;
        currentData.sc = data.sc;
        currentData.sw = data.sw;
        currentData.sz = data.sz;
        currentData.ps = data.ps;
        currentData.t = data.t;
        currentData.tr = data.tr;
        currentData.fillColorAnim = data.fillColorAnim || currentData.fillColorAnim;
        currentData.strokeColorAnim = data.strokeColorAnim || currentData.strokeColorAnim;
        currentData.strokeWidthAnim = data.strokeWidthAnim || currentData.strokeWidthAnim;
        currentData.yOffset = data.yOffset;
        currentData.finalSize = data.finalSize;
        currentData.finalLineHeight = data.finalLineHeight;
        currentData.finalText = data.finalText;*/
};

TextProperty.prototype.searchProperty = function() {
    return this.searchKeyframes();
};

TextProperty.prototype.searchKeyframes = function() {
    this.kf = this.data.d.k.length > 1;
    if(this.kf) {
        this.addEffect(this.getKeyframeValue.bind(this));
    }
    return this.kf;
}

TextProperty.prototype.addEffect = function(effectFunction) {
	this.effectsSequence.push(effectFunction);
    this.elem.addDynamicProperty(this);
};

TextProperty.prototype.getValue = function(_finalValue) {
    if((this.elem.globalData.frameId === this.frameId || !this.effectsSequence.length) && !_finalValue) {
        return;
    }
    var currentTextValue = this.currentData.t;        
    if(this.lock) {
        this.setCurrentData(this.currentData, currentTextValue);
        return;
    }
    this.lock = true;
    this._mdf = false;
    var multipliedValue;
    var i, len = this.effectsSequence.length;
    var finalValue = _finalValue || this.currentData;
    for(i = 0; i < len; i += 1) {
        finalValue = this.effectsSequence[i](finalValue);
    }
    this.setCurrentData(finalValue, currentTextValue);
    this.pv = this.v = this.currentData;
    this.lock = false;
    this.frameId = this.elem.globalData.frameId;
}

TextProperty.prototype.getKeyframeValue = function(currentValue) {
    var textKeys = this.data.d.k, textDocumentData;
    var frameNum = this.elem.comp.renderedFrame;
    var i = 0, len = textKeys.length;
    while(i <= len - 1) {
        textDocumentData = textKeys[i].s;
        if(i === len - 1 || textKeys[i+1].t > frameNum){
            break;
        }
        i += 1;
    }
    if(this.keysIndex !== i) {
        currentValue = textDocumentData;
        this.keysIndex = i;
    }
    return currentValue;
};

TextProperty.prototype.buildFinalText = function(text) {
    var combinedCharacters = FontManager.getCombinedCharacterCodes();
    var charactersArray = [];
    var i = 0, len = text.length;
    while (i < len) {
        if (combinedCharacters.indexOf(text.charCodeAt(i)) !== -1) {
            charactersArray[charactersArray.length - 1] += text.charAt(i);
        } else {
            charactersArray.push(text.charAt(i));
        }
        i += 1;
    }
    return charactersArray;
}

TextProperty.prototype.completeTextData = function(documentData) {
    documentData.__complete = true;
    var fontManager = this.elem.globalData.fontManager;
    var data = this.data;
    var letters = [];
    var i, len;
    var newLineFlag, index = 0, val;
    var anchorGrouping = data.m.g;
    var currentSize = 0, currentPos = 0, currentLine = 0, lineWidths = [];
    var lineWidth = 0;
    var maxLineWidth = 0;
    var j, jLen;
    var fontData = fontManager.getFontByName(documentData.f);
    var charData, cLength = 0;
    var styles = fontData.fStyle ? fontData.fStyle.split(' ') : [];

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
            break;
            case 'light':
            case 'thin':
            fWeight = '200';
            break;
        }
    }
    documentData.fWeight = fontData.fWeight || fWeight;
    documentData.fStyle = fStyle;
    len = documentData.t.length;
    documentData.finalSize = documentData.s;
    documentData.finalText = this.buildFinalText(documentData.t);
    documentData.finalLineHeight = documentData.lh;
    var trackingOffset = documentData.tr/1000*documentData.finalSize;
    if(documentData.sz){
        var flag = true;
        var boxWidth = documentData.sz[0];
        var boxHeight = documentData.sz[1];
        var currentHeight, finalText;
        while(flag) {
            finalText = this.buildFinalText(documentData.t);
            currentHeight = 0;
            lineWidth = 0;
            len = finalText.length;
            trackingOffset = documentData.tr/1000*documentData.finalSize;
            var lastSpaceIndex = -1;
            for(i=0;i<len;i+=1){
                newLineFlag = false;
                if(finalText[i] === ' '){
                    lastSpaceIndex = i;
                }else if(finalText[i].charCodeAt(0) === 13){
                    lineWidth = 0;
                    newLineFlag = true;
                    currentHeight += documentData.finalLineHeight || documentData.finalSize*1.2;
                }
                if(fontManager.chars){
                    charData = fontManager.getCharData(finalText[i], fontData.fStyle, fontData.fFamily);
                    cLength = newLineFlag ? 0 : charData.w*documentData.finalSize/100;
                }else{
                    //tCanvasHelper.font = documentData.s + 'px '+ fontData.fFamily;
                    cLength = fontManager.measureText(finalText[i], documentData.f, documentData.finalSize);
                }
                if(lineWidth + cLength > boxWidth && finalText[i] !== ' '){
                    if(lastSpaceIndex === -1){
                        len += 1;
                    } else {
                        i = lastSpaceIndex;
                    }
                    currentHeight += documentData.finalLineHeight || documentData.finalSize*1.2;
                    finalText.splice(i, lastSpaceIndex === i ? 1 : 0,"\r");
                    //finalText = finalText.substr(0,i) + "\r" + finalText.substr(i === lastSpaceIndex ? i + 1 : i);
                    lastSpaceIndex = -1;
                    lineWidth = 0;
                }else {
                    lineWidth += cLength;
                    lineWidth += trackingOffset;
                }
            }
            currentHeight += fontData.ascent*documentData.finalSize/100;
            if(this.canResize && documentData.finalSize > this.minimumFontSize && boxHeight < currentHeight) {
                documentData.finalSize -= 1;
                documentData.finalLineHeight = documentData.finalSize * documentData.lh / documentData.s;
            } else {
                documentData.finalText = finalText;
                len = documentData.finalText.length;
                flag = false;
            }
        }

    }
    lineWidth = - trackingOffset;
    cLength = 0;
    var uncollapsedSpaces = 0;
    var currentChar;
    for (i = 0;i < len ;i += 1) {
        newLineFlag = false;
        currentChar = documentData.finalText[i];
        if(currentChar === ' '){
            val = '\u00A0';
        }else if(currentChar.charCodeAt(0) === 13){
            uncollapsedSpaces = 0;
            lineWidths.push(lineWidth);
            maxLineWidth = lineWidth > maxLineWidth ? lineWidth : maxLineWidth;
            lineWidth = - 2 * trackingOffset;
            val = '';
            newLineFlag = true;
            currentLine += 1;
        }else{
            val = documentData.finalText[i];
        }
        if(fontManager.chars){
            charData = fontManager.getCharData(currentChar, fontData.fStyle, fontManager.getFontByName(documentData.f).fFamily);
            cLength = newLineFlag ? 0 : charData.w*documentData.finalSize/100;
        }else{
            //var charWidth = fontManager.measureText(val, documentData.f, documentData.finalSize);
            //tCanvasHelper.font = documentData.finalSize + 'px '+ fontManager.getFontByName(documentData.f).fFamily;
            cLength = fontManager.measureText(val, documentData.f, documentData.finalSize);
        }

        //
        if(currentChar === ' '){
            uncollapsedSpaces += cLength + trackingOffset;
        } else {
            lineWidth += cLength + trackingOffset + uncollapsedSpaces;
            uncollapsedSpaces = 0;
        }
        letters.push({l:cLength,an:cLength,add:currentSize,n:newLineFlag, anIndexes:[], val: val, line: currentLine, animatorJustifyOffset: 0});
        if(anchorGrouping == 2){
            currentSize += cLength;
            if(val === '' || val === '\u00A0' || i === len - 1){
                if(val === '' || val === '\u00A0'){
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
            if(val === '' || i === len - 1){
                if(val === ''){
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

    var animators = data.a, animatorData, letterData;
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
            if((based == 1 && letterData.val !== '') || (based == 2 && letterData.val !== '' && letterData.val !== '\u00A0') || (based == 3 && (letterData.n || letterData.val == '\u00A0' || i == len - 1)) || (based == 4 && (letterData.n || i == len - 1))){
                if(animatorData.s.rn === 1){
                    indexes.push(ind);
                }
                ind += 1;
            }
        }
        data.a[j].s.totalChars = ind;
        var currentInd = -1, newInd;
        if(animatorData.s.rn === 1){
            for(i = 0; i < len; i += 1){
                letterData = letters[i];
                if(currentInd != letterData.anIndexes[j]){
                    currentInd = letterData.anIndexes[j];
                    newInd = indexes.splice(Math.floor(Math.random()*indexes.length),1)[0];
                }
                letterData.anIndexes[j] = newInd;
            }
        }
    }
    documentData.yOffset = documentData.finalLineHeight || documentData.finalSize*1.2;
    documentData.ls = documentData.ls || 0;
    documentData.ascent = fontData.ascent*documentData.finalSize/100;
};

TextProperty.prototype.updateDocumentData = function(newData, index) {
	index = index === undefined 
    ? this.keysIndex === -1 
        ? 0 
        : this.keysIndex 
    : index;
    var dData = this.data.d.k[index].s;
    for(var s in newData) {
        dData[s] = newData[s];
    }
    this.recalculate(index);
};

TextProperty.prototype.recalculate = function(index) {
    var dData = this.data.d.k[index].s;
    dData.__complete = false;
    this.keysIndex = this.kf ? -1 : 0;
    this._isFirstFrame = true;
    this.getValue(dData);
}

TextProperty.prototype.canResizeFont = function(_canResize) {
    this.canResize = _canResize;
    this.recalculate(this.keysIndex);
};

TextProperty.prototype.setMinimumFontSize = function(_fontValue) {
    this.minimumFontSize = Math.floor(_fontValue) || 1;
    this.recalculate(this.keysIndex);
};
