function ISolidElement(data,parentContainer,globalData){
    this.parent.constructor.call(this,data,parentContainer,globalData);
}
createElement(BaseElement, ISolidElement);

ISolidElement.prototype.createElements = function(){
    this.parent.createElements.call(this);

    var rect = document.createElementNS(svgNS,'rect');
    rect.setAttribute('width',this.data.width);
    rect.setAttribute('height',this.data.height);
    /*rect.setAttribute('width',1);
    rect.setAttribute('height',1);*/
    rect.setAttribute('fill',this.data.color);
    this.layerElement.appendChild(rect);
    this.rectElement = rect;
};

ISolidElement.prototype.hide = function(){
    if(!this.hidden){
        this.rectElement.setAttribute('visibility','hidden');
        this.hidden = true;
    }
};

ISolidElement.prototype.renderFrame = function(num,parentMatrix){
    var renderParent = this.parent.renderFrame.call(this,num,parentMatrix);
    if(renderParent===false){
        this.hide();
        return;
    }
    if(this.hidden){
        this.hidden = false;
        if(this.data.hasMask) {
            this.rectElement.setAttribute('visibility', 'visible');
        }
    }
    if(!this.data.hasMask){
        if(!this.renderedFrames[this.globalData.frameNum]){
            var tr = 'matrix('+this.finalTransform.mat.props.join(',')+')';
            if(this.lastData && this.lastData.tr === tr && this.lastData.o === this.finalTransform.opacity){
                this.renderedFrames[this.globalData.frameNum] = this.lastData;
            }else{
                this.renderedFrames[this.globalData.frameNum] = new RenderedFrame(tr,this.finalTransform.opacity);
            }
        }
        var renderedFrameData = this.renderedFrames[this.globalData.frameNum];
        if(this.lastData.tr != renderedFrameData.tr){
            this.rectElement.setAttribute('transform',renderedFrameData.tr);
        }
        if(this.lastData.o !== renderedFrameData.o){
            this.rectElement.setAttribute('opacity',renderedFrameData.o);
        }
        this.lastData = renderedFrameData;
    }
};

ICompElement.prototype.destroy = function(){
    this.parent.destroy.call();
    this.rectElement = null;
};