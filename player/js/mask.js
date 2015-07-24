function MaskElement(data,element,globalData) {
    this.data = data;
    this.storedData = [];
    this.element = element;
    this.globalData = globalData;
    this.paths = [];
    this.registeredEffects = [];
    this.masksProperties = [];
    this.maskElement = document.createElementNS(svgNS, 'mask');
}

MaskElement.prototype.init = function () {
    this.masksProperties = this.data.masksProperties;
    var maskedElement = this.element.maskedElement;
    var defs = this.globalData.defs;
    var i=0, len = this.masksProperties.length;

    this.layerSize = this.element.getLayerSize();

    var path, properties = this.data.masksProperties;
    var count = 0;
    var currentMasks = [];
    var j, jLen;
    var layerId = randomString(10);
    for (i = 0; i < len; i++) {
        if(properties[i].inv && !this.solidPath){
            this.solidPath = this.createLayerSolidPath();
        }

        //console.log('properties[i].mode: ',properties[i].mode);

        if((properties[i].mode == 'f' && i > 0) || properties[i].mode == 'n' || (properties[i].mode == 's' && i == 0) || (properties[i].mode == 'i' && i == 0) ) {

            continue;
        }
        count += 1;
        path = document.createElementNS(svgNS, 'path');
        if (properties[i].cl) {
            if(properties[i].mode == 's'){
                path.setAttribute('fill', '#000000');
            }else{
                path.setAttribute('fill', '#ffffff');
            }
        } else {
            path.setAttribute('fill', 'none');
            if(properties[i].mode == 's'){
                path.setAttribute('fill', '#000000');
            }else{
                path.setAttribute('fill', '#ffffff');
            }
            path.setAttribute('stroke-width', '1');
            path.setAttribute('stroke-miterlimit', '10');
        }
        path.setAttribute('clip-rule','nonzero');
        this.storedData[i] = {
         elem: path,
            lastPath: ''
        };
        if(properties[i].mode == 'i'){
            jLen = currentMasks.length;
            var g = document.createElementNS(svgNS,'g');
            for(j=0;j<jLen;j+=1){
                g.appendChild(currentMasks[j]);
            }
            var mask = document.createElementNS(svgNS,'mask');
            mask.setAttribute('mask-type','alpha');
            mask.setAttribute('id',layerId+'_'+count);
            mask.appendChild(path);
            defs.appendChild(mask);
            g.setAttribute('mask','url(#'+layerId+'_'+count+')');

            currentMasks.length = 0;
            currentMasks.push(g);
        }else{
            currentMasks.push(path);
        }
    }

    len = currentMasks.length;
    for(i=0;i<len;i+=1){
        this.maskElement.appendChild(currentMasks[i]);
    }

    this.maskElement.setAttribute('id', layerId);
    if(count > 0){
        maskedElement.setAttribute("mask", "url(#" + layerId + ")");
    }

    defs.appendChild(this.maskElement);
};

MaskElement.prototype.renderFrame = function (num) {
    var i, len = this.data.masksProperties.length;
    for (i = 0; i < len; i++) {
        if((this.data.masksProperties[i].mode == 'f' && i > 0)  || this.data.masksProperties[i].mode == 'n' || (this.data.masksProperties[i].mode == 's' && i == 0) || (this.data.masksProperties[i].mode == 'i' && i == 0)){
            continue;
        }
        this.drawPath(this.data.masksProperties[i],this.data.masksProperties[i].paths[num].pathNodes,this.storedData[i],this.data.masksProperties[i].mode);
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

MaskElement.prototype.drawPath = function(pathData,pathNodes,storedData, mode){
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



    if(storedData.lastPath !== pathString){
        if(pathData.inv){
            storedData.elem.setAttribute('d',this.solidPath+pathString);
        }else{
            storedData.elem.setAttribute('d',pathString);
        }
        storedData.lastPath = pathString;
    }
};