var PlaceHolderElement = function (data,parentContainer,globalData){
    this.data = data;
    this.globalData = globalData;
    if(parentContainer){
        this.parentContainer = parentContainer;
        var g = document.createElementNS(svgNS,'g');
        g.setAttribute('id',this.data.id);
        parentContainer.appendChild(g);
        this.phElement = g;
    }
    this.layerId = 'ly_'+randomString(10);
};
PlaceHolderElement.prototype.prepareFrame = function(){};
PlaceHolderElement.prototype.renderFrame = function(){};
PlaceHolderElement.prototype.draw = function(){};