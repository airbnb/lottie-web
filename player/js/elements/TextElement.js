function ITextElement(data, animationItem,parentContainer,globalData){
}
ITextElement.prototype.init = function(){
    this.lettersChangedFlag = true;
    this.dynamicProperties = this.dynamicProperties || [];
    this.textAnimator = new TextAnimatorProperty(this.data.t, this.renderType, this);
    this.textProperty = new TextProperty(this, this.data.t, this.dynamicProperties);
    this._parent.init.call(this);
    this.textAnimator.searchProperties(this.dynamicProperties);
};

ITextElement.prototype.prepareFrame = function(num) {
    this._parent.prepareFrame.call(this, num);
    if(this.textProperty.mdf || this.textProperty.firstFrame) {
        this.buildNewText();
        this.textProperty.firstFrame = false;
    }
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
    this.textProperty.updateDocumentData(newData, index);
}

ITextElement.prototype.applyTextPropertiesToMatrix = function(documentData, matrixHelper, lineNumber, xPos, yPos) {
    if(documentData.ps){
        matrixHelper.translate(documentData.ps[0],documentData.ps[1] + documentData.ascent,0);
    }
    matrixHelper.translate(0,-documentData.ls,0);
    switch(documentData.j){
        case 1:
            matrixHelper.translate(documentData.justifyOffset + (documentData.boxWidth - documentData.lineWidths[lineNumber]),0,0);
            break;
        case 2:
            matrixHelper.translate(documentData.justifyOffset + (documentData.boxWidth - documentData.lineWidths[lineNumber] )/2,0,0);
            break;
    }
    matrixHelper.translate(xPos, yPos, 0);
}

ITextElement.prototype.buildColor = function(colorData) {
    return 'rgb(' + Math.round(colorData[0]*255) + ',' + Math.round(colorData[1]*255) + ',' + Math.round(colorData[2]*255) + ')';
}

ITextElement.prototype.buildShapeString = IShapeElement.prototype.buildShapeString;

ITextElement.prototype.emptyProp = new LetterProps();

ITextElement.prototype.destroy = function(){
    this._parent.destroy.call(this._parent);
};