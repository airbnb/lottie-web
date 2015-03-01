function MaskElement() {}

MaskElement.prototype.init = function () {
    this.registeredEffects = [];
    this.masksProperties = this.data.masksProperties;
    this.totalMasks = this.masksProperties.length;
    var maskingGroup = this.element.maskingGroup;
    var maskedElement = this.element.maskedElement;
    var defs = document.createElementNS(svgNS, 'defs');
    maskingGroup.appendChild(defs);
    var i, len = this.masksProperties.length;

    /*var invertedCount = 0;

    for(i=0;i<len;i+=1){
        if(this.data.masksProperties[i].inv){
            invertedCount += 1;
            if(invertedCount>10){
                this.usePaths = false;
                break;
            }
        }
    }*/
    this.layerSize = this.element.getLayerSize();
    if(this.usePaths){
        this.maskElement = document.createElementNS(svgNS, 'clipPath');
        var path, properties = this.data.masksProperties;
        for (i = 0; i < len; i++) {
            path = document.createElementNS(svgNS, 'path');
            if (properties[i].cl) {
                path.setAttribute('fill', '#ffffff');
            } else {
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', '#ffffff');
                path.setAttribute('stroke-width', '1');
                path.setAttribute('stroke-miterlimit', '10');
            }
            path.setAttribute('clip-rule','nonezero');
            this.maskElement.appendChild(path);
            properties[i].elem = path;
            properties[i].lastPath = '';
        }

        var layerId = randomString(10);

        this.maskElement.setAttribute('id', layerId);
        maskedElement.setAttribute("clip-path", "url(#" + layerId + ")");

    } else {
        this.maskElement = document.createElementNS(svgNS, 'mask');
        this.canvas = document.createElement('canvas');
        this.imageElement = document.createElementNS(svgNS, 'image');
        this.imageElement.setAttribute('width', this.layerSize.w);
        this.imageElement.setAttribute('height', this.layerSize.h);
        this.imageElement.setAttribute('x', '0');
        this.imageElement.setAttribute('y', '0');
        //this.helperCanvas = document.createElement('canvas');
        this.canvasContext = this.canvas.getContext('2d');
        this.canvas.width = this.layerSize.w;
        this.canvas.height = this.layerSize.h;
        /*document.getElementsByTagName('BODY')[0].appendChild(this.canvas);
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.opacity = '0';*/

        this.maskElement.appendChild(this.imageElement);

        var layerId = randomString(10);

        this.maskElement.setAttribute('id', layerId);

        maskedElement.setAttribute("mask", "url(#" + layerId + ")");
    }
    defs.appendChild(this.maskElement);
};

MaskElement.prototype.createInvertedMask = function (properties, num) {

    this.helperCanvas.width = this.layerSize.w;
    this.helperCanvas.height = this.layerSize.h;
    //this.helperCanvas.width = this.helperCanvas.width;
    var invCtx = this.invertedContext;
    invCtx.globalCompositeOperation = "source-over";
    var opacity = properties.o[num];
    if (properties.mode == 'a') {
        invCtx.fillStyle = "rgba(255, 255, 255, " + properties.o[num] + ")";
        this.canvasContext.globalCompositeOperation = 'source-over';
    } else if (properties.mode == 's') {
        invCtx.fillStyle = "rgba(0, 0, 0, " + opacity + ")";
        this.canvasContext.globalCompositeOperation = 'source-over';
    } else if (properties.mode == 'f') {
        invCtx.fillStyle = "rgba(255, 255, 255, " + opacity + ")";
        this.canvasContext.globalCompositeOperation = 'xor';
    } else if (properties.mode == 'i') {
        invCtx.fillStyle = "rgba(255, 255, 255, " + opacity + ")";
        this.canvasContext.globalCompositeOperation = 'destination-in';
    } else {
        return;
    }
    invCtx.fillRect(0, 0, this.helperCanvas.width, this.helperCanvas.height);
    invCtx.fillStyle = "rgba(255, 255, 255, 1)";
    invCtx.globalCompositeOperation = 'destination-out';
    invCtx.beginPath();
    this.drawShape(invCtx, properties.pathVertices[num][0]);
    this.canvasContext.drawImage(this.helperCanvas, 0, 0);
};

MaskElement.prototype.renderFrame = function (num) {
    var i, len = this.data.masksProperties.length;
    if (this.usePaths === true) {
        if(this.element.animationItem.animType !== 'fullSvg'){
            for (i = 0; i < len; i++) {
                this.drawPath(this.data.masksProperties[i],this.data.masksProperties[i].pathStrings[num]);//**//
            }
        }
    }else{
        this.canvas.width = this.canvas.width;
        var ctx = this.canvasContext;
        //TODO see if i have to create a full white rect iin case there are no masks
        /*ctx.fillStyle = "rgba(0, 0, 0, 1)";
         ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
         ctx.fill();*/
        for (i = 0; i < len; i++) {
            var opacity = this.data.masksProperties[i].opacity[num];
            if (this.masksProperties[i].inv) {
                this.createInvertedMask(this.masksProperties[i], num);
            } else {
                if (this.masksProperties[i].mode == 'a') {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.fillStyle = "rgba(255, 255, 255, " + opacity + ")";
                } else if (this.masksProperties[i].mode == 's') {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.fillStyle = "rgba(0, 0, 0, " + opacity + ")";
                } else if (this.masksProperties[i].mode == 'f') {
                    ctx.globalCompositeOperation = 'xor';
                    ctx.fillStyle = "rgba(255, 255, 255, " + opacity + ")";
                } else if (this.masksProperties[i].mode == 'i') {
                    ctx.globalCompositeOperation = 'destination-in';
                    ctx.fillStyle = "rgba(255, 255, 255, " + opacity + ")";
                } else {
                    continue;
                }
                this.drawShape(ctx, this.data.masksProperties[i].pathVertices[num][0]);
            }
        }
        //this.processMaskFromEffects(num, masks);
        var dataURL = this.canvas.toDataURL('image/png');
        this.imageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'href', dataURL);
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
            pathData.elem.setAttribute('d',this.createLayerSolidPath()+pathString);
        }else{
            pathData.elem.setAttribute('d',pathString);
        }
        pathData.lastPath = pathString;
    }
};

MaskElement.prototype.drawShape = function (ctx, data) {
    /* TODO see if i can improve feathering of masks. This solution doesn't work'
     ctx.shadowOffsetX = 0;
     ctx.shadowOffsetY = 0;
     ctx.shadowColor = '#fff';
     ctx.shadowBlur = 14;*/
    ctx.beginPath();
    var j, jLen = data.v.length;
    for (j = 0; j < jLen; j++) {
        if (j == 0) {
            ctx.moveTo(data.v[j][0], data.v[j][1]);
        } else {
            ctx.bezierCurveTo(data.o[j - 1][0] + data.v[j - 1][0], data.o[j - 1][1] + data.v[j - 1][1], data.i[j][0] + data.v[j][0], data.i[j][1] + data.v[j][1], data.v[j][0], data.v[j][1]);
        }
    }
    ctx.bezierCurveTo(data.o[j - 1][0] + data.v[j - 1][0], data.o[j - 1][1] + data.v[j - 1][1], data.i[0][0] + data.v[0][0], data.i[0][1] + data.v[0][1], data.v[0][0], data.v[0][1]);
    ctx.closePath();
    ctx.fill();
};

defineDescriptor(MaskElement, 'helperCanvas', document.createElement('canvas'));
defineDescriptor(MaskElement, 'helperContext', MaskElement.prototype.helperCanvas.getContext('2d'));
defineDescriptor(MaskElement, 'data', null, {writable:true});
defineDescriptor(MaskElement, 'element', null);
defineDescriptor(MaskElement, 'usePaths', true, {writable:true});
defineDescriptor(MaskElement, 'paths', [], {writable:true});
