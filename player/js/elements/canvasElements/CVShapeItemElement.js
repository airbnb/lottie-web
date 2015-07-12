function CVShapeItemElement(data,mainFlag,globalData){
    this.data = data;
    this.globalData = globalData;
    this.canvasContext = globalData.canvasContext;
    this.frameNum = -1;
    this.dataLength = this.data.length;
    this.mainFlag = mainFlag;
    this.stylesList = [];
    this.ownStylesList = [];
    this.stylesPool = [];
    this.currentStylePoolPos = 0;
    this.transform = {
        opacity: 1,
        mat: new Matrix()
    };
    this.mat = new Matrix();
    var i,len=this.dataLength-1;
    this.renderedPaths = new Array(this.globalData.totalFrames);
    var styleData;
    for(i=len;i>=0;i-=1){
        if(this.data[i].ty == 'gr'){
            this.data[i].item = new CVShapeItemElement(this.data[i].it,false,this.globalData);
        }else if(this.data[i].ty == 'st' || this.data[i].ty == 'fl'){
            styleData = {
                type:'fill',
                /*path: new BM_Path2D(),*/
                styleOpacity: 0,
                opacity: 0,
                value:'rgba(0,0,0,0)',
                closed: false
            };
            if(this.data[i].ty == 'fl'){
                styleData.type = 'fill';
            }else{
                styleData.type = 'stroke';
                styleData.width = 0;
            }
            this.stylesPool.push(styleData);
        }
    }
}

CVShapeItemElement.prototype.drawPaths = function(cacheFlag){
    var stylesList,cache;
    if(cacheFlag){
        cache = [];
        stylesList = this.stylesList;
    }else{
        stylesList = this.renderedPaths[this.globalData.frameNum];
    }
    var i, len = stylesList.length;
    var ctx = this.canvasContext;
    this.globalData.renderer.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for(i=0;i<len;i+=1){
        if(stylesList[i].type == 'stroke'){
            if(stylesList[i].opacity != 1){
                this.globalData.renderer.save();
                this.globalData.renderer.ctxOpacity(stylesList[i].opacity);
                ///ctx.globalAlpha *= stylesList[i].opacity;
            }
            ctx.strokeStyle = stylesList[i].value;
            ctx.lineWidth = stylesList[i].width;
            if(stylesList[i].dasharray){
                ctx.setLineDash(stylesList[i].dasharray);
                ctx.lineDashOffset = stylesList[i].dashoffset;
            }else{
                ctx.setLineDash([]);
                ctx.lineDashOffset = 0;
            }
            this.globalData.bmCtx.stroke(stylesList[i].path);
            if(stylesList[i].opacity != 1){
                this.globalData.renderer.restore();
            }
            if(cacheFlag){
                cache.push({
                    type: stylesList[i].type,
                    opacity: stylesList[i].opacity,
                    value: stylesList[i].value,
                    width: stylesList[i].width,
                    path: stylesList[i].path
                });
                if(stylesList[i].dasharray){
                    cache[cache.length-1].dasharray = stylesList[i].dasharray;
                    cache[cache.length-1].dashoffset = stylesList[i].dashoffset;
                }
            }
        }else if(stylesList[i].type == 'fill'){
            if(stylesList[i].opacity != 1){
                this.globalData.renderer.save();
                this.globalData.renderer.ctxOpacity(stylesList[i].opacity);
                ///ctx.globalAlpha *= stylesList[i].opacity;
            }
            ctx.fillStyle = stylesList[i].value;
            this.globalData.bmCtx.fill(stylesList[i].path);
            if(stylesList[i].opacity != 1){
                this.globalData.renderer.restore();
            }
            if(cacheFlag){
                cache.push({
                    type: stylesList[i].type,
                    opacity: stylesList[i].opacity,
                    value: stylesList[i].value,
                    path: stylesList[i].path
                });
            }
        }
    }
    this.globalData.renderer.restore();
    if(cacheFlag){
        this.renderedPaths[this.globalData.frameNum] = cache;
    }
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

CVShapeItemElement.prototype.renderShape = function(parentTransform,parentStylesList){
    if(this.renderedPaths[this.globalData.frameNum]){
        this.drawPaths(false);
        return;
    }
    this.transform.opacity = 1;
    var i, len;
    this.ownStylesList.length = 0;
    this.currentStylePoolPos = 0;
    if(!parentStylesList){
        this.stylesList.length = 0;
    }else{
        this.stylesList = parentStylesList;
    }
    if(parentTransform){
        this.transform.mat.props[0] = parentTransform.mat.props[0];
        this.transform.mat.props[1] = parentTransform.mat.props[1];
        this.transform.mat.props[2] = parentTransform.mat.props[2];
        this.transform.mat.props[3] = parentTransform.mat.props[3];
        this.transform.mat.props[4] = parentTransform.mat.props[4];
        this.transform.mat.props[5] = parentTransform.mat.props[5];
        this.transform.opacity *= parentTransform.opacity;
    }else{
        this.transform.mat.props[0] = this.transform.mat.props[3] = 1;
        this.transform.mat.props[1] = this.transform.mat.props[2] = this.transform.mat.props[4] = this.transform.mat.props[5] = 0;
    }
    len = this.dataLength - 1;
    for(i=len;i>=0;i-=1){
        if(this.data[i].ty == 'gr'){
            this.data[i].item.renderShape(this.transform,this.stylesList);
        }else if(this.data[i].ty == 'tr'){
            this.renderTransform(this.data[i]);
        }else if(this.data[i].ty == 'sh'){
            this.renderPath(this.data[i]);
        }else if(this.data[i].ty == 'el'){
            this.renderEllipse(this.data[i]);
        }else if(this.data[i].ty == 'rc'){
            if(this.data[i].trimmed){
                this.renderPath(this.data[i]);
            }else{
                this.renderRect(this.data[i]);
            }
        }else if(this.data[i].ty == 'fl'){
            this.renderFill(this.data[i]);
        }else if(this.data[i].ty == 'st'){
            this.renderStroke(this.data[i]);
        }else{
            //console.log(this.data[i].ty);
        }
    }
    if(this.mainFlag){
        this.drawPaths(true);
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
    this.transform.mat.transform(matrixValue[0],matrixValue[1],matrixValue[2],matrixValue[3],matrixValue[4],matrixValue[5]).translate(-tr.a[0],-tr.a[1]);
    this.transform.opacity *= tr.o;
};

CVShapeItemElement.prototype.renderPath = function(data){
    if(data.trimmed){
        var ctx = this.canvasContext;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }
    var path = data.renderedData[this.frameNum].path;
    var path2d = new BM_Path2D();
    var pathNodes = path.pathNodes;
    if(pathNodes instanceof Array){
        pathNodes = pathNodes[0];
    }
    if(!pathNodes.v){
        return;
    }
    var i,len = pathNodes.v.length;
    var stops = pathNodes.s ? pathNodes.s : [];
    for(i=1;i<len;i+=1){
        if(stops[i-1]){
            path2d.moveTo(stops[i-1][0],stops[i-1][1]);
        }else if(i==1){
            path2d.moveTo(pathNodes.v[0][0],pathNodes.v[0][1]);
        }
        path2d.bezierCurveTo(pathNodes.o[i-1][0],pathNodes.o[i-1][1],pathNodes.i[i][0],pathNodes.i[i][1],pathNodes.v[i][0],pathNodes.v[i][1]);
    }
    if(path.closed && !(data.trimmed && !pathNodes.c)){
        path2d.bezierCurveTo(pathNodes.o[i-1][0],pathNodes.o[i-1][1],pathNodes.i[0][0],pathNodes.i[0][1],pathNodes.v[0][0],pathNodes.v[0][1]);
    }
    this.addPathToStyles(path2d);
};

CVShapeItemElement.prototype.renderEllipse = function(animData){
    var path2d = new BM_Path2D();
    var ell = animData.renderedData[this.frameNum];
    path2d.moveTo(ell.p[0]+ell.size[0]/2,ell.p[1]);
    path2d.ellipse(ell.p[0], ell.p[1], ell.size[0]/2, ell.size[1]/2, 0, 0, Math.PI*2, false);
    this.addPathToStyles(path2d);
};

CVShapeItemElement.prototype.renderRect = function(animData){
    var path2d = new BM_Path2D();
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
                    this.stylesList[i].path.addPath(path2d, this.transform.mat.props);
                }
                if(this.stylesList[i].styleOpacity == 1 && this.stylesList[i].opacity == 1){
                    strokeWidth = this.stylesList[i].width;
                }
            }else if(canFill && this.stylesList[i].type == 'fill'){
                this.stylesList[i].path.addPath(path2d, this.transform.mat.props);
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
        this.stylesPool[this.currentStylePoolPos].path = new BM_Path2D();
        this.stylesPool[this.currentStylePoolPos].closed = false;
        this.stylesPool[this.currentStylePoolPos].styleOpacity = fill.opacity < 1 ? fill.opacity : 1;
        this.stylesPool[this.currentStylePoolPos].opacity = this.transform.opacity;
        this.stylesPool[this.currentStylePoolPos].value = fill.opacity < 1 ? fillColorToString(fill.color, fill.opacity) : fillColorToString(fill.color);
        this.stylesList.push(this.stylesPool[this.currentStylePoolPos]);
        this.ownStylesList.push(this.stylesList[this.stylesList.length -1]);
        this.currentStylePoolPos += 1;
        return;
    }
    this.stylesList.push(this.stylesPool[this.currentStylePoolPos]);
    this.ownStylesList.push(this.stylesList[this.stylesList.length -1]);
    this.currentStylePoolPos += 1;
};

CVShapeItemElement.prototype.renderStroke = function(animData){
    var stroke = animData.renderedData[this.frameNum];
    if(this.data.strokeEnabled!==false){
        this.stylesPool[this.currentStylePoolPos].path = new BM_Path2D();
        this.stylesPool[this.currentStylePoolPos].closed = false;
        this.stylesPool[this.currentStylePoolPos].styleOpacity = stroke.opacity < 1 ? stroke.opacity : 1;
        this.stylesPool[this.currentStylePoolPos].width = stroke.width*Math.abs(Math.min(this.transform.mat.props[0],this.transform.mat.props[3]));
        this.stylesPool[this.currentStylePoolPos].opacity = this.transform.opacity;
        this.stylesPool[this.currentStylePoolPos].value = stroke.opacity < 1 ? fillColorToString(stroke.color, stroke.opacity) : fillColorToString(stroke.color);

        if(stroke.dashes){
            var d = stroke.dashes;
            var j, jLen = d.length;
            var dasharray = [];
            var dashoffset = '';
            for(j=0;j<jLen;j+=1){
                if(d[j].n != 'o'){
                    dasharray.push(d[j].v);
                }else{
                    dashoffset = d[j].v;
                }
            }
            this.stylesPool[this.currentStylePoolPos].dasharray = dasharray;
            this.stylesPool[this.currentStylePoolPos].dashoffset = dashoffset;
        }
        this.stylesList.push(this.stylesPool[this.currentStylePoolPos]);
        this.ownStylesList.push(this.stylesList[this.stylesList.length -1]);
        this.currentStylePoolPos += 1;
        return;
    }
    this.stylesList.push(this.stylesPool[this.currentStylePoolPos]);
    this.ownStylesList.push(this.stylesList[this.stylesList.length -1]);
    this.currentStylePoolPos += 1;
};