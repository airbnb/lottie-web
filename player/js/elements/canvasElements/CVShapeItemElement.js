function CVShapeItemElement(data,renderer,mainFlag){
    this.data = data;
    this.renderer = renderer;
    this.frameNum = -1;
    this.trims = [];
    this.dataLength = this.data.length;
    this.mainFlag = mainFlag;
    this.stylesList = [];
    this.ownStylesList = [];
    this.currentMatrix = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
    this.mat = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
    var i,len=this.dataLength;
    this.renderedPaths = [];
    for(i=0;i<len;i+=1){
        if(this.data[i].ty == 'gr'){
            this.data[i].item = new CVShapeItemElement(this.data[i].it, this.renderer,false);
        }
    }
}

CVShapeItemElement.prototype.drawPaths = function(){
    var i, len = this.stylesList.length;
    this.renderer.canvasContext.save();
    for(i=0;i<len;i+=1){
        if(this.stylesList[i].type == 'stroke'){
            //this.renderer.canvasContext.save();
            this.renderer.canvasContext.globalAlpha *= this.stylesList[i].opacity;
            this.renderer.canvasContext.strokeStyle = this.stylesList[i].value;
            this.renderer.canvasContext.lineWidth = this.stylesList[i].width;
            this.renderer.canvasContext.stroke(this.stylesList[i].path);
            //this.renderer.canvasContext.restore();
        }else if(this.stylesList[i].type == 'fill'){
            //this.renderer.canvasContext.save();
            this.renderer.canvasContext.globalAlpha *= this.stylesList[i].opacity;
            this.renderer.canvasContext.fillStyle=this.stylesList[i].value;
            this.renderer.canvasContext.fill(this.stylesList[i].path);
            //this.renderer.canvasContext.restore();
        }
    }
    this.renderer.canvasContext.restore();
};

CVShapeItemElement.prototype.prepareFrame = function(num){
    this.frameNum = num;
    var i,len=this.dataLength-1;
    for(i=len;i>=0;i-=1){
        if(this.data[i].ty == 'gr'){
            this.data[i].item.prepareFrame(num);
        }
    }
};

CVShapeItemElement.prototype.renderShape = function(parentStylesList, parentMatrix){
    this.opacityMultiplier = 1;
    var i, len;
    this.ownStylesList.length = 0;
    if(!parentStylesList){
        this.stylesList.length = 0;
    }else{
        this.stylesList = parentStylesList;
    }
    if(parentMatrix){
        this.currentMatrix = parentMatrix;
    }else{
        this.currentMatrix.a = this.currentMatrix.d = 1;
        this.currentMatrix.b = this.currentMatrix.c = this.currentMatrix.e = this.currentMatrix.f = 0;
    }
    len = this.dataLength - 1;
    var ctx = this.renderer.canvasContext;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for(i=len;i>=0;i-=1){
        if(this.data[i].ty == 'gr'){
            this.data[i].item.renderShape(this.stylesList,this.currentMatrix);
        }else if(this.data[i].ty == 'tr'){
            this.renderTransform(this.data[i]);
        }else if(this.data[i].ty == 'sh'){
            this.renderPath(this.data[i]);
        }else if(this.data[i].ty == 'el'){
            this.renderEllipse(this.data[i]);
        }else if(this.data[i].ty == 'rc'){
            this.renderRect(this.data[i]);
        }else if(this.data[i].ty == 'fl'){
            this.renderFill(this.data[i]);
        }else if(this.data[i].ty == 'st'){
            this.renderStroke(this.data[i]);
        }else{
            //console.log(this.data[i].ty);
        }
    }
    if(this.mainFlag){
        this.drawPaths();
    }else{
        len = this.ownStylesList.length;
        for(i=0;i<len;i+=1){
            this.ownStylesList[i].closed = true;
        }
    }
};

CVShapeItemElement.prototype.renderTransform = function(animData){
    var tr = animData.renderedData[this.frameNum];
    var matrixValue = tr.mtArr;
    this.mat.a = matrixValue[0];
    this.mat.b = matrixValue[1];
    this.mat.c = matrixValue[2];
    this.mat.d = matrixValue[3];
    this.mat.e = matrixValue[4];
    this.mat.f = matrixValue[5];
    this.mat = this.mat.translate(-tr.a[0],-tr.a[1]);
    this.opacityMultiplier *= animData.o;
    this.currentMatrix = this.currentMatrix.multiply(this.mat);
};

CVShapeItemElement.prototype.renderPath = function(data){
    var path = data.renderedData[this.frameNum].path;
    var path2d = new Path2D();

    var pathNodes = path.pathNodes;
    if(pathNodes instanceof Array){
        pathNodes = pathNodes[0];
    }
    var i,len = pathNodes.i.length;
    path2d.moveTo(pathNodes.v[0][0],pathNodes.v[0][1]);
    for(i=1;i<len;i+=1){
        path2d.bezierCurveTo(pathNodes.o[i-1][0],pathNodes.o[i-1][1],pathNodes.i[i][0],pathNodes.i[i][1],pathNodes.v[i][0],pathNodes.v[i][1]);
    }
    if(path.closed){
        path2d.bezierCurveTo(pathNodes.o[i-1][0],pathNodes.o[i-1][1],pathNodes.i[0][0],pathNodes.i[0][1],pathNodes.v[0][0],pathNodes.v[0][1]);
    }
    this.addPathToStyles(path2d);
};

CVShapeItemElement.prototype.renderEllipse = function(animData){
    var path2d = new Path2D();
    var ell = animData.renderedData[this.frameNum];
    path2d.moveTo(ell.p[0]+ell.size[0]/2,ell.p[1]);
    path2d.ellipse(ell.p[0], ell.p[1], ell.size[0]/2, ell.size[1]/2, 0, 0, Math.PI*2, false);
    this.addPathToStyles(path2d);
};

CVShapeItemElement.prototype.renderRect = function(animData){
    var path2d = new Path2D();
    var rect = animData.renderedData[this.frameNum];
    var roundness = rect.roundness;
    if(roundness === 0){
        path2d.rect(rect.position[0] - rect.size[0]/2,rect.position[1] - rect.size[1]/2,rect.size[0],rect.size[1]);
    }else{
        var x = rect.position[0] - rect.size[0]/2;
        var y = rect.position[1] - rect.size[1]/2;
        var w = rect.size[0];
        var h = rect.size[1];
        if(roundness instanceof Array){
            roundness = roundness[0];
        }
        if(roundness > w/2){
            roundness = w/2;
        }
        if(roundness > h/2){
            roundness = h/2;
        }
        path2d.moveTo(x + roundness, y);
        path2d.lineTo(x + w - roundness, y);
        path2d.quadraticCurveTo(x+w, y, x+w, y+roundness);
        path2d.lineTo(x+w, y+h-roundness);
        path2d.quadraticCurveTo(x+w, y+h, x+w-roundness, y+h);
        path2d.lineTo(x+roundness, y+h);
        path2d.quadraticCurveTo(x, y+h, x, y+h-roundness);
        path2d.lineTo(x, y+roundness);
        path2d.quadraticCurveTo(x, y, x+roundness, y);
    }
    this.addPathToStyles(path2d);
};

CVShapeItemElement.prototype.addPathToStyles = function(path2d){
    var i, len = this.stylesList.length;
    var canFill = true, strokeWidth = 0;
    for(i=len-1;i>=0;i-=1){
        if(!this.stylesList[i].closed){
            if(this.stylesList[i].type == 'stroke'){
                if(this.stylesList[i].width > strokeWidth){
                    this.stylesList[i].path.addPath(path2d, this.currentMatrix);
                }
                if(this.stylesList[i].styleOpacity == 1 && this.stylesList[i].opacity == 1){
                    strokeWidth = this.stylesList[i].width;
                }
            }else if(canFill && this.stylesList[i].type == 'fill'){
                this.stylesList[i].path.addPath(path2d, this.currentMatrix);
                if(this.stylesList[i].styleOpacity == 1 && this.stylesList[i].opacity == 1){
                    canFill = false;
                }
            }
        }
    }
};

CVShapeItemElement.prototype.renderFill = function(animData){
    var fill = animData.renderedData[this.frameNum];
    if(animData.fillEnabled!==false){

        this.stylesList.push({
            type:'fill',
            path: new Path2D(),
            closed: false,
            styleOpacity: fill.opacity < 1 ? fill.opacity : 1,
            opacity: this.opacityMultiplier
        });
        this.stylesList[this.stylesList.length-1].value = fill.opacity < 1 ? fillColorToString(fill.color, fill.opacity) : fillColorToString(fill.color);
        this.ownStylesList.push(this.stylesList[this.stylesList.length -1]);
        return;
    }
    this.stylesList.push({
        type:'fill',
        value:'rgba(0,0,0,0)',
        path: new Path2D(),
        closed: false
    });
    this.ownStylesList.push(this.stylesList[this.stylesList.length -1]);
};

CVShapeItemElement.prototype.renderStroke = function(animData){
    var stroke = animData.renderedData[this.frameNum];
    //this.renderer.canvasContext.lineWidth=stroke.width;
    if(this.data.strokeEnabled!==false){
        if(stroke.opacity < 1){
            this.stylesList.push({
                type:'stroke',
                value:fillColorToString(stroke.color, stroke.opacity),
                width:stroke.width,
                path: new Path2D(),
                styleOpacity: stroke.opacity,
                opacity: this.opacityMultiplier,
                closed: false
            });
        }else{
            this.stylesList.push({
                type:'stroke',
                value:fillColorToString(stroke.color),
                width:stroke.width,
                path: new Path2D(),
                styleOpacity: 1,
                opacity: this.opacityMultiplier,
                closed: false
            });
        }
        this.ownStylesList.push(this.stylesList[this.stylesList.length -1]);
        return;
    }
    this.stylesList.push({
        type:'stroke',
        value:'rgba(0,0,0,0)',
        width:stroke.width,
        path: new Path2D(),
        closed: false,
        opacity: this.opacityMultiplier
    });
    this.ownStylesList.push(this.stylesList[this.stylesList.length -1]);
};