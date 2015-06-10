function MaskElement(globalData) {
    this.data = null;
    this.element = null;
    this.globalData = globalData;
    this.paths = [];
}

MaskElement.prototype.init = function () {
    this.registeredEffects = [];
    this.masksProperties = this.data.masksProperties;
    this.totalMasks = this.masksProperties.length;
    var maskedElement = this.element.maskedElement;
    var defs = this.globalData.defs;
    var i=0, len = this.masksProperties.length;

    this.layerSize = this.element.getLayerSize();

    this.maskElement = document.createElementNS(svgNS, 'clipPath');
    var path, properties = this.data.masksProperties;
    for (i = 0; i < len; i++) {
        if(properties[i].inv && !this.solidPath){
            this.solidPath = this.createLayerSolidPath();
        }
        path = document.createElementNS(svgNS, 'path');
        if (properties[i].cl) {
            path.setAttribute('fill', '#ffffff');
        } else {
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#ffffff');
            path.setAttribute('stroke-width', '1');
            path.setAttribute('stroke-miterlimit', '10');
        }
        path.setAttribute('clip-rule','nonzero');
        this.maskElement.appendChild(path);
        properties[i].elem = path;
        properties[i].lastPath = '';
    }

    var layerId = randomString(10);

    this.maskElement.setAttribute('id', layerId);
    maskedElement.setAttribute("clip-path", "url(#" + layerId + ")");

    defs.appendChild(this.maskElement);
};

MaskElement.prototype.renderFrame = function (num) {
    var i, len = this.data.masksProperties.length;
    for (i = 0; i < len; i++) {
        this.drawPath(this.data.masksProperties[i],this.data.masksProperties[i].paths[num].pathString);
    }
};

MaskElement.prototype.processMaskFromEffects = function (num, masks) {
    var i, len = this.registeredEffects.length;
    for (i = 0; i < len; i++) {
        this.registeredEffects[i].renderMask(num, masks);
    }
};

MaskElement.prototype.registerEffect = function (effect) {
    this.registeredEffects.push(effect);
};

MaskElement.prototype.getMaskelement = function () {
    return this.maskElement;
};

MaskElement.prototype.createLayerSolidPath = function(){
    var path = 'M0,0 ';
    path += 'h' + this.layerSize.w;
    path += 'v' + this.layerSize.h;
    path += 'h' + -this.layerSize.w;
    path += 'v' + -this.layerSize.h;
    return path;
};

MaskElement.prototype.drawPath = function(pathData,pathString){
    if(pathData.lastPath !== pathString){
        if(pathData.inv){
            pathData.elem.setAttribute('d',this.solidPath+pathString);
        }else{
            pathData.elem.setAttribute('d',pathString);
        }
        pathData.lastPath = pathString;
    }
};