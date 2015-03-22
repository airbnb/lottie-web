function CVShapeItemElement(data,renderer){
    this.data = data;
    this.renderer = renderer;
    this.frameNum = -1;
    this.renderedPaths = {};
}

CVShapeItemElement.prototype.adjustTrim = function(){
    var trimData = this.data.trim;
    var i, len = trimData.length;
    for(i=0;i<len;i+=1){
        if(trimData[i].o){
            trimData[i].o -= 90;
        }
    }
};

CVShapeItemElement.prototype.renderShape = function(){
    var num = this.frameNum;
    var ctx = this.renderer.canvasContext;
    ctx.save();
    this.renderTransform(num);
    if(this.data.type=="pathShape"){
        if(this.data.trim){
            this.renderTrimPath(num);
        }else{
            this.renderPath(num);
        }
    }else if(this.data.type=="rectShape"){
        this.renderRect(num);
    }else if(this.data.type=="ellipseShape"){
        this.pathLength = this.renderEllipse(num);
    }
    this.renderFill(num);
    this.renderStroke(num);
    this.renderer.canvasContext.lineCap = 'round';
    this.renderer.canvasContext.lineJoin = 'round';
    if(this.renderedPaths[num]){
        if(supportsPath2D){
            this.renderer.canvasContext.fill(this.renderedPaths[num]);
            this.renderer.canvasContext.stroke(this.renderedPaths[num]);
        }else{
            this.renderedPaths[num].drawToContext(this.renderer.canvasContext);
            this.renderer.canvasContext.fill();
            this.renderer.canvasContext.stroke();
        }
    }else{
        this.renderer.canvasContext.fill();
        this.renderer.canvasContext.stroke();
    }
    delete this.renderedPaths[num];
    ctx.restore();
};

CVShapeItemElement.prototype.prepareFrame = function(num){
    this.frameNum = num;
};

CVShapeItemElement.prototype.renderTransform = function(num){
    var animData = this.data.an;
    if(animData.tr){
        var ctx = this.renderer.canvasContext;
        var tr = animData.tr[animData.tr[num].forwardFrame];
        animData.renderedFrame.tr = tr.forwardFrame;
        var matrixValue = tr.mtArr;
        //ctx.translate(tr.a[0],tr.a[1]);
        ctx.transform(matrixValue[0], matrixValue[1], matrixValue[2], matrixValue[3], matrixValue[4], matrixValue[5]);
        ctx.translate(-tr.a[0],-tr.a[1]);
        //ctx.translate(-tr.a[0],-tr.a[1]);
        //ctx.translate(-tr.a[0],-tr.a[1]);

    }
};

CVShapeItemElement.prototype.renderTrimPath = function(num){
    var trimData = this.data.trim.an[this.data.trim.an[num].forwardFrame];
    if(trimData.e == trimData.s){
        return;
    }
    if(this.renderedPaths[num]){
        return;
    }
    var path2d = new Path2D();
    var animData = this.data.an;
    var path = animData.path[animData.path[num].forwardFrame];
    var pathNodes = path.pathNodes;
    var segments = [];
    var totalLength = 0;
    var i, len = pathNodes.v.length;
    for(i = 0; i < len - 1; i += 1){
        segments.push(dataManager.drawBezierCurve([pathNodes.v[i],pathNodes.v[i+1],pathNodes.o[i],pathNodes.i[i+1]]));
        totalLength += segments[i].segmentLength;
    }
    if(path.closed){
        segments.push(dataManager.drawBezierCurve([pathNodes.v[len - 1],pathNodes.v[0],pathNodes.o[len - 1],pathNodes.i[0]]));
        totalLength += segments[i].segmentLength;
    }
    len = segments.length;
    var segmentLength = totalLength*(trimData.e - trimData.s)/100;
    var offset = ((trimData.s/100 + (trimData.o%360)/360)%1)*totalLength;
    var trims = [];
    if(offset + segmentLength - totalLength > 0.00001){
        var secondarySegment = offset + segmentLength - totalLength;
        trims.push({
            s: offset,
            e: offset + segmentLength - secondarySegment
        });
        trims.push({
            s: 0,
            e: offset + segmentLength - totalLength
        })
    }else{
        trims.push({
            s: offset,
            e: offset + segmentLength
        })
    }
    var addedLength = 0;
    var j, jLen,perc,flag, ended = false;
    var k, kLen = trims.length;

    for(i = 0; i < len; i += 1){
        if(ended){
            break;
        }
        jLen = segments[i].points.length;
        flag = true;
        for(k = 0; k < kLen; k+=1){
            if(addedLength + segments[i].segmentLength > trims[k].s){
                flag = false;
            }
        }
        if(flag){
            addedLength += segments[i].segmentLength;
            continue;
        }
        for(j = 0; j < jLen-1 ; j += 1){
            if(ended){
                break;
            }
            kLen = trims.length;
            addedLength += segments[i].points[j].partialLength;
            for(k = 0; k < kLen; k+=1){
                if(trims[k].s >= addedLength && trims[k].s < addedLength + segments[i].points[j+1].partialLength){
                    perc = ( trims[k].s - addedLength)/segments[i].points[j+1].partialLength;
                    path2d.moveTo(segments[i].points[j].point[0]+(segments[i].points[j+1].point[0] - segments[i].points[j].point[0])*perc
                        ,segments[i].points[j].point[1]+(segments[i].points[j+1].point[1] - segments[i].points[j].point[1])*perc);
                }
                if(trims[k].e > addedLength && trims[k].e <= addedLength + segments[i].points[j+1].partialLength){
                    perc = ( trims[k].e - addedLength)/segments[i].points[j+1].partialLength;
                    path2d.lineTo(segments[i].points[j].point[0]+(segments[i].points[j+1].point[0] - segments[i].points[j].point[0])*perc
                        ,segments[i].points[j].point[1]+(segments[i].points[j+1].point[1] - segments[i].points[j].point[1])*perc);
                    trims.splice(k,1);
                    k -= 1;
                    kLen -= 1;
                    if(kLen == 0){
                        ended = true;
                        break;
                    }
                }else if(addedLength > trims[k].s && addedLength < trims[k].e){
                    path2d.lineTo(segments[i].points[j].point[0],segments[i].points[j].point[1]);
                }
            }
        }
        this.renderedPaths[num] = path2d;
    }
};

CVShapeItemElement.prototype.renderPath = function(num){
    var animData = this.data.an;
    var path = animData.path[animData.path[num].forwardFrame];

    if(this.renderedPaths[num]){
        return;
    }
    var path2d = new Path2D();

    animData.renderedFrame.path = path.pathString;
    var ctx = this.renderer.canvasContext;

    var pathNodes = path.pathNodes;
    if(pathNodes instanceof Array){
        pathNodes = pathNodes[0];
    }
    var i,len = pathNodes.i.length;
    ctx.beginPath();
    for(i=0;i<len;i+=1){
        if(i == 0){
            path2d.moveTo(pathNodes.v[i][0],pathNodes.v[i][1]);
        }else{
            path2d.bezierCurveTo(pathNodes.o[i-1][0]+pathNodes.v[i-1][0],pathNodes.o[i-1][1]+pathNodes.v[i-1][1]
                ,pathNodes.i[i][0]+pathNodes.v[i][0],pathNodes.i[i][1]+pathNodes.v[i][1]
                ,pathNodes.v[i][0],pathNodes.v[i][1]);
        }
    }
    if(path.closed){
        path2d.bezierCurveTo(pathNodes.o[i-1][0]+pathNodes.v[i-1][0],pathNodes.o[i-1][1]+pathNodes.v[i-1][1]
        ,pathNodes.i[0][0]+pathNodes.v[0][0],pathNodes.i[0][1]+pathNodes.v[0][1]
        ,pathNodes.v[0][0],pathNodes.v[0][1]);
    }
    this.renderedPaths[num] = path2d;
};

CVShapeItemElement.prototype.renderEllipse = function(num){
    var animData = this.data.an;
    var ell = animData.ell[animData.ell[num].forwardFrame];
    animData.renderedFrame.ell = ell.forwardFrame;

    var ctx = this.renderer.canvasContext;

    ctx.beginPath();
    ctx.ellipse(ell.p[0], ell.p[1], ell.size[0]/2, ell.size[1]/2, 0, 0, Math.PI*2, true);
    ctx.closePath();
};

CVShapeItemElement.prototype.renderRect = function(num){
    var animData = this.data.an;
    var rect = animData.rect[animData.rect[num].forwardFrame];
    var roundness = rect.roundness;
    var ctx = this.renderer.canvasContext;
    ctx.beginPath();
    if(roundness == 0){
        ctx.rect(rect.position[0] - rect.size[0]/2,rect.position[1] - rect.size[1]/2,rect.size[0],rect.size[1]);
    }else{
        var x = rect.position[0] - rect.size[0]/2;
        var y = rect.position[1] - rect.size[1]/2;
        var w = rect.size[0];
        var h = rect.size[1];
        ctx.moveTo(x + roundness, y);
        ctx.lineTo(x + w - roundness, y);
        ctx.quadraticCurveTo(x+w, y, x+w, y+roundness);
        ctx.lineTo(x+w, y+h-roundness);
        ctx.quadraticCurveTo(x+w, y+h, x+w-roundness, y+h);
        ctx.lineTo(x+roundness, y+h);
        ctx.quadraticCurveTo(x, y+h, x, y+h-roundness);
        ctx.lineTo(x, y+roundness);
        ctx.quadraticCurveTo(x, y, x+roundness, y);
    }
};

CVShapeItemElement.prototype.renderFill = function(num){
    var animData = this.data.an;
    if(animData.fill){
        var fill = animData.fill[animData.fill[num].forwardFrame];
        animData.renderedFrame.fill = {color:fill.color,opacity:fill.opacity};
        if(this.data.fillEnabled!==false){
            var rgbColor = hexToRgb(fill.color);
            this.renderer.canvasContext.fillStyle='rgba('+rgbColor.r+','+rgbColor.g+','+rgbColor.b+','+fill.opacity+')';
        }else{
            this.renderer.canvasContext.fillStyle='rgba(0,0,0,0)';
        }
    }else{
        this.renderer.canvasContext.fillStyle='rgba(0,0,0,0)';
    }
    //this.renderer.canvasContext.fillStyle='rgba(255,0,0,0)';
    //this.renderer.canvasContext.globalAlpha = .3;
};

CVShapeItemElement.prototype.renderStroke = function(num){
    var animData = this.data.an;
    if(animData.stroke){
        var stroke = animData.stroke[animData.stroke[num].forwardFrame];
        animData.renderedFrame.stroke = stroke.forwardFrame;
        /*ctx.strokeStyle="red";
         */
        this.renderer.canvasContext.lineWidth=stroke.width;
        if(this.data.strokeEnabled!==false){
            var rgbColor = hexToRgb(stroke.color);
            this.renderer.canvasContext.strokeStyle='rgba('+rgbColor.r+','+rgbColor.g+','+rgbColor.b+','+stroke.opacity+')';
        }else{
            this.renderer.canvasContext.strokeStyle='rgba(0,0,0,0)';
        }
    }else{
        this.renderer.canvasContext.strokeStyle = 'rgba(0,0,0,0)';
    }
};
