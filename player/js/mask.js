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

        if(properties[i].mode == 'f' && i > 0){
            continue;
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
        if(this.data.masksProperties[i].mode == 'f' && i > 0){
            continue;
        }
        this.drawPath(this.data.masksProperties[i],this.data.masksProperties[i].paths[num].pathNodes);
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

MaskElement.prototype.drawPath = function(pathData,pathNodes){
    var pathString = '';
    var i, len;
    if(pathNodes.constructor === Array){
        var j, jLen = pathNodes.length, node,str = '';
        for(j=0;j<jLen;j+=1){
            str = '';
            node = pathNodes[j];
            if(!node.__renderedString){
                len = node.v.length;
                for(i=1;i<len;i+=1){
                    if(i==1){
                        str += " M"+node.v[0][0]+','+node.v[0][1];
                    }
                    str += " C"+node.o[i-1][0]+','+node.o[i-1][1] + " "+node.i[i][0]+','+node.i[i][1] + " "+node.v[i][0]+','+node.v[i][1];
                }
                if(pathData.cl){
                    str += " C"+node.o[i-1][0]+','+node.o[i-1][1] + " "+node.i[0][0]+','+node.i[0][1] + " "+node.v[0][0]+','+node.v[0][1];
                }
                node.__renderedString = str;
            }
            pathString += node.__renderedString;
        }
    }else{
        if(!pathNodes.__renderedString){
            len = pathNodes.v.length;
            for(i=1;i<len;i+=1){
                if(i==1){
                    pathString += " M"+pathNodes.v[0][0]+','+pathNodes.v[0][1];
                }
                pathString += " C"+pathNodes.o[i-1][0]+','+pathNodes.o[i-1][1] + " "+pathNodes.i[i][0]+','+pathNodes.i[i][1] + " "+pathNodes.v[i][0]+','+pathNodes.v[i][1];
            }
            if(pathData.cl){
                pathString += " C"+pathNodes.o[i-1][0]+','+pathNodes.o[i-1][1] + " "+pathNodes.i[0][0]+','+pathNodes.i[0][1] + " "+pathNodes.v[0][0]+','+pathNodes.v[0][1];
            }
            pathNodes.__renderedString = pathString;
        }else{
            pathString = pathNodes.__renderedString;
        }
    }



    if(pathData.lastPath !== pathString){
        if(pathData.inv){
            pathData.elem.setAttribute('d',this.solidPath+pathString);
        }else{
            pathData.elem.setAttribute('d',pathString);
        }
        pathData.lastPath = pathString;
    }
};