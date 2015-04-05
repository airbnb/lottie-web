function CVShapeItemElement(data,renderer){
    this.data = data;
    this.renderer = renderer;
    this.frameNum = -1;
    this.renderedPaths = {};
    this.trims = [];
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
    if(this.data.type === ''){
        return;
    }
    var num = this.frameNum;
    this.currentData = this.data.renderedData[num];
    var ctx = this.renderer.canvasContext;
    var flag = this.renderTransform(num);
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
    if(flag){
        ctx.restore();
    }
};

CVShapeItemElement.prototype.prepareFrame = function(num){
    this.frameNum = num;
};

CVShapeItemElement.prototype.renderTransform = function(){
    var animData = this.currentData;
    if(animData.tr){
        var flag = false;
        var ctx = this.renderer.canvasContext;
        var tr = animData.tr;
        var matrixValue = tr.mtArr;
        if(matrixValue[0] !== 1 || matrixValue[1] !== 0 || matrixValue[2] !== 0 || matrixValue[3] !== 1 || matrixValue[4] !== 0 || matrixValue[5] !== 0){
            ctx.save();
            ctx.transform(matrixValue[0], matrixValue[1], matrixValue[2], matrixValue[3], matrixValue[4], matrixValue[5]);
            flag = true;
        }
        if(tr.a[0] != 0 || tr.a[1] != 0){
            ctx.translate(-tr.a[0],-tr.a[1]);
            if(!flag){
                ctx.save();
                flag = true;
            }
        }
        ///ctx.transform(matrixValue[0], matrixValue[1], matrixValue[2], matrixValue[3], matrixValue[4], matrixValue[5]);
        ///ctx.translate(-tr.a[0],-tr.a[1]);
        if(tr.o < 1){
            ctx.globalAlpha *= tr.o;
            if(!flag){
                ctx.save();
                flag = true;
            }
        }
        return flag;
    }
};

CVShapeItemElement.prototype.addToTrim = function(pos,s,e){
    if(!this.trims[pos]){
        this.trims.push({});
    }
    this.trims[pos].s = s;
    this.trims[pos].e = e;
    this.trims[pos].ended = false;
};

CVShapeItemElement.prototype.renderTrimPath = function(num){
    var trimData = this.currentData.trim;
    if(trimData.e == trimData.s){
        return;
    }
    if(this.renderedPaths[num]){
        return;
    }
    var path2d = new Path2D();
    var path = this.currentData.path;
    var pathNodes = path.pathNodes;
    var segments = [];
    var totalLength = 0;
    var i, len = pathNodes.v.length;
    for(i = 0; i < len - 1; i += 1){
        segments.push(bez.drawBezierCurve(pathNodes.v[i],pathNodes.v[i+1],pathNodes.o[i],pathNodes.i[i+1]));
        totalLength += segments[i].segmentLength;
    }
    if(path.closed){
        segments.push(bez.drawBezierCurve(pathNodes.v[i],pathNodes.v[0],pathNodes.o[i],pathNodes.i[0]));
        totalLength += segments[i].segmentLength;
    }
    len = segments.length;
    var segmentLength = totalLength*(trimData.e - trimData.s)/100;
    trimData.o = trimData.o%360;
    if(trimData.o<0){
        trimData.o += 360;
    }
    //this.trims.length = 0;
    var offset = ((trimData.s/100 + trimData.o/360)%1)*totalLength;
    var endedCount = 0;
    if(offset + segmentLength - totalLength > 0.00001){
        var secondarySegment = offset + segmentLength - totalLength;
        this.addToTrim(0,offset,offset + segmentLength - secondarySegment);
        this.addToTrim(1,0,offset + segmentLength - totalLength);
        endedCount += 2;
    }else{
        this.addToTrim(0,offset,offset + segmentLength);
        endedCount += 1;
    }
    var addedLength = 0;
    var j, jLen,perc,flag, ended = false;
    var k, kLen = this.trims.length;

    for(i = 0; i < len; i += 1){
        if(ended){
            break;
        }
        jLen = segments[i].points.length;
        flag = true;
        for(k = 0; k < kLen; k+=1){
            if(addedLength + segments[i].segmentLength > this.trims[k].s){
                flag = false;
            }
        }
        if(flag){
            addedLength += segments[i].segmentLength;
            continue;
        }
        var currentPt, nextPt;
        for(j = 0; j < jLen-1 ; j += 1){
            if(ended){
                break;
            }
            kLen = this.trims.length;
            currentPt = segments[i].points[j];
            nextPt = segments[i].points[j+1];
            addedLength += currentPt.partialLength;
            for(k = 0; k < kLen; k+=1){
                if(this.trims[k].ended){
                    continue;
                }
                if(this.trims[k].s >= addedLength && this.trims[k].s < addedLength + nextPt.partialLength){
                    perc = ( this.trims[k].s - addedLength)/nextPt.partialLength;
                    path2d.moveTo(currentPt.point[0]+(nextPt.point[0] - currentPt.point[0])*perc
                        ,currentPt.point[1]+(nextPt.point[1] - currentPt.point[1])*perc);
                }
                if(this.trims[k].e > addedLength && this.trims[k].e <= addedLength + nextPt.partialLength){
                    perc = ( this.trims[k].e - addedLength)/nextPt.partialLength;
                    path2d.lineTo(currentPt.point[0]+(nextPt.point[0] - currentPt.point[0])*perc
                        ,currentPt.point[1]+(nextPt.point[1] - currentPt.point[1])*perc);
                    endedCount -= 1;
                    this.trims[k].ended = true;
                    if(endedCount == 0){
                        ended = true;
                        break;
                    }
                }else if(addedLength > this.trims[k].s && addedLength < this.trims[k].e){
                    path2d.lineTo(currentPt.point[0],currentPt.point[1]);
                }
            }
        }
        this.renderedPaths[num] = path2d;
    }
};

CVShapeItemElement.prototype.renderPath = function(num){
    var animData = this.currentData;
    var path = animData.path;

    if(this.renderedPaths[num]){
        return;
    }
    var path2d = new Path2D();

    var ctx = this.renderer.canvasContext;

    var pathNodes = path.pathNodes;
    if(pathNodes instanceof Array){
        pathNodes = pathNodes[0];
    }
    var i,len = pathNodes.i.length;
    ctx.beginPath();
    path2d.moveTo(pathNodes.v[0][0],pathNodes.v[0][1]);
    for(i=1;i<len;i+=1){
        path2d.bezierCurveTo(pathNodes.o[i-1][0],pathNodes.o[i-1][1]
            ,pathNodes.i[i][0],pathNodes.i[i][1]
            ,pathNodes.v[i][0],pathNodes.v[i][1]);
    }
    if(path.closed){
        path2d.bezierCurveTo(pathNodes.o[i-1][0],pathNodes.o[i-1][1]
        ,pathNodes.i[0][0],pathNodes.i[0][1]
        ,pathNodes.v[0][0],pathNodes.v[0][1]);
    }
    this.renderedPaths[num] = path2d;
};

CVShapeItemElement.prototype.renderEllipse = function(){
    var ell = this.currentData.ell;

    var ctx = this.renderer.canvasContext;

    ctx.beginPath();
    ctx.ellipse(ell.p[0], ell.p[1], ell.size[0]/2, ell.size[1]/2, 0, 0, Math.PI*2, true);
    ctx.closePath();
};

CVShapeItemElement.prototype.renderRect = function(){
    var rect = this.currentData.rect;
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
        if(roundness instanceof Array){
            roundness = roundness[0];
        }
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
    var animData = this.currentData;
    if(animData.fill){
        var fill = animData.fill;
        if(this.data.fillEnabled!==false){
            if(fill.opacity < 1){
                this.renderer.canvasContext.fillStyle=fillColorToString(fill.color, fill.opacity);
            }else{
                ///this.renderer.canvasContext.fillStyle='rgba('+fill.color.join(',')+')';
                this.renderer.canvasContext.fillStyle=fillColorToString(fill.color);
            }
            return;
        }
    }
    this.renderer.canvasContext.fillStyle='rgba(0,0,0,0)';
};

CVShapeItemElement.prototype.renderStroke = function(num){
    var animData = this.currentData;
    if(animData.stroke){
        var stroke = animData.stroke;
        /*ctx.strokeStyle="red";
         */
        this.renderer.canvasContext.lineWidth=stroke.width;
        if(this.data.strokeEnabled!==false){
            if(stroke.opacity < 1){
                this.renderer.canvasContext.strokeStyle=fillColorToString(stroke.color, stroke.opacity);
            }else{
                ///this.renderer.canvasContext.strokeStyle='rgba('+stroke.color.join(',')+')';
                this.renderer.canvasContext.strokeStyle=fillColorToString(stroke.color);
            }
            return;
        }
    }
    this.renderer.canvasContext.strokeStyle = 'rgba(0,0,0,0)';
};
