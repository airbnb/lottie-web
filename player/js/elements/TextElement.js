function ITextElement(data, animationItem,parentContainer,globalData){
}
ITextElement.prototype.init = function(){
    this._frameId = -1;
    this.lettersChangedFlag = true;
    this.currentTextDocumentData = this.data.t.d.k[0].s;
    this.dynamicProperties = this.dynamicProperties || [];
    this.textAnimator = new TextAnimatorProperty(this.data.t, this.renderType, this);
    this._parent.init.call(this);
    this.textAnimator.searchProperties(this.dynamicProperties);
    this.buildNewText();
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
        /*kLen = pathNodes.i.length;
        for(k=1;k<kLen;k+=1){
            if(k==1){
                shapeStr += " M"+matrixHelper.applyToPointStringified(pathNodes.v[0][0],pathNodes.v[0][1]);
            }
            shapeStr += " C"+matrixHelper.applyToPointStringified(pathNodes.o[k-1][0],pathNodes.o[k-1][1]) + " "+matrixHelper.applyToPointStringified(pathNodes.i[k][0],pathNodes.i[k][1]) + " "+matrixHelper.applyToPointStringified(pathNodes.v[k][0],pathNodes.v[k][1]);
        }
        shapeStr += " C"+matrixHelper.applyToPointStringified(pathNodes.o[k-1][0],pathNodes.o[k-1][1]) + " "+matrixHelper.applyToPointStringified(pathNodes.i[0][0],pathNodes.i[0][1]) + " "+matrixHelper.applyToPointStringified(pathNodes.v[0][0],pathNodes.v[0][1]);
        shapeStr += 'z';*/
    }
    return shapeStr;
};

ITextElement.prototype.buildShapeString = IShapeElement.prototype.buildShapeString;

ITextElement.prototype.emptyProp = new LetterProps();
