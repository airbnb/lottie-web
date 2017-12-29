function RenderableDOMElement() {

}
extendPrototype([RenderableElement], RenderableDOMElement);

RenderableDOMElement.prototype.initElement = function(data,globalData,comp) {
    this.initFrame();
    this.initBaseData(data, globalData, comp);
    this.initTransform(data, globalData, comp);
    this.initHierarchy();
    this.initRenderable();
    this.initRendererElement();
    this.createContainerElements();
    this.addMasks();
    this.createContent();
    this.hide();
}

RenderableDOMElement.prototype.hide = function(){
    if (!this.hidden && (!this.isInRange || this.isTransparent)) {
        this.layerElement.style.display = 'none';
        this.hidden = true;
    }
};

RenderableDOMElement.prototype.show = function(){
    if (this.isInRange && !this.isTransparent){
        if (!this.data.hd) {
            this.layerElement.style.display = 'block';
        }
        this.hidden = false;
        this._isFirstFrame = true;
        this.maskManager._isFirstFrame = true;
    }
};

RenderableDOMElement.prototype.renderFrame = function() {
    //If it is exported as hidden (data.hd === true) no need to render
    //If it is not visible no need to render
    if (this.data.hd || this.hidden) {
        return;
    }
    this.renderTransform();
    this.renderRenderable();
    this.renderElement();
    this.renderInnerContent();
    if (this._isFirstFrame) {
        this._isFirstFrame = false;
    }
};

RenderableDOMElement.prototype.renderInnerContent = function() {};

RenderableDOMElement.prototype.destroy = function(){
    this.innerElem =  null;
    this.destroyBaseElement();
};

RenderableDOMElement.prototype.prepareFrame = function(num) {
    this._mdf = false;
    this.prepareRenderableFrame(num);
    this.prepareProperties(num, this.isInRange);
};