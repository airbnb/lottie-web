function PIXISolidElement(data,parentContainer,globalData,comp, placeholder){
    this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
}
createElement(PIXIBaseElement, PIXISolidElement);

PIXISolidElement.prototype.createElements = function(){
    this._parent.createElements.call(this);

    var rect = document.createElementNS(svgNS,'rect');
    ////rect.style.width = this.data.sw;
    ////rect.style.height = this.data.sh;
    ////rect.style.fill = this.data.sc;
    rect.setAttribute('width',this.data.sw);
    rect.setAttribute('height',this.data.sh);
    rect.setAttribute('fill',this.data.sc);
    this.layerElement.appendChild(rect);
    this.innerElem = rect;
    if(this.data.ln){
        this.innerElem.setAttribute('id',this.data.ln);
    }
    if(this.data.cl){
        this.innerElem.setAttribute('class',this.data.cl);
    }

    var graphics = new PIXI.Graphics();
    graphics.beginFill(this.data.sc.replace('#','0x'));
    graphics.drawRect(0, 0, this.data.sw, this.data.sh);
    this.PLayerElement.addChild(graphics);
};

PIXISolidElement.prototype.hide = PIXIImageElement.prototype.hide;
PIXISolidElement.prototype.renderFrame = PIXIImageElement.prototype.renderFrame;
PIXISolidElement.prototype.destroy = PIXIImageElement.prototype.destroy;
