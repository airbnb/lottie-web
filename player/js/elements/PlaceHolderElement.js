var PlaceHolderElement = function (data,parentContainer,globalData){
    this.data = data;
    this.parentContainer = parentContainer;
    this.globalData = globalData;
    var g = document.createElementNS(svgNS,'g');
    g.setAttribute('id',this.data.loadId);
    parentContainer.appendChild(g);
    this.phElement = g;
};
PlaceHolderElement.prototype.prepareFrame = function(){};
PlaceHolderElement.prototype.renderFrame = function(){};