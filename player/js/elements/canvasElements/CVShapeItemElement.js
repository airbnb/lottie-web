function CVShapeItemElement(data,renderer){
    this.data = data;
    this.renderer = renderer;
    this.frameNum = -1;
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
    this.renderer.canvasContext.fill();
    this.renderer.canvasContext.stroke();
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
    var ctx = this.renderer.canvasContext;
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
    /*console.log('offset: ',offset);
    console.log('segmentLength: ',segmentLength);
    console.log('totalLength: ',totalLength);
    console.log('offset + segmentLength: ',offset + segmentLength);
    console.log('trimData.e: ',trimData.e);
    console.log('trimData.s: ',trimData.s);
    console.log('((trimData.s/100 + (trimData.o%360)/360)%1): ',((trimData.s/100 + (trimData.o%360)/360)%1));*/
    if(offset + segmentLength - totalLength > 0.00001){
        var secondarySegment = offset + segmentLength - totalLength;
        segmentLength -= secondarySegment;
        var secondaryPos = [segments[0].points[0].point[0],segments[0].points[0].point[1]];
    }else{
        trims.push({
            s: offset,
            e: segmentLength
        })
    }
    var addedLength = 0;
    var firstPoint = true;
    ctx.beginPath();
    var j, jLen,perc;

    for(i = 0; i < len; i += 1){
        if(offset>addedLength+segments[i].segmentLength && !secondarySegment){
            addedLength += segments[i].segmentLength;
            continue;
        }
        jLen = segments[i].points.length;
        for(j = 0; j < jLen ; j += 1){
            if(secondarySegment && addedLength < secondarySegment){
                ctx.moveTo(secondaryPos[0],secondaryPos[1]);
                if(addedLength + segments[i].points[j].partialLength >= offset + secondarySegment){
                    perc = 1-(((addedLength + segments[i].points[j].partialLength) - (offset + secondarySegment))/segments[i].points[j].partialLength);
                    ctx.lineTo(segments[i].points[j-1].point[0]+(segments[i].points[j].point[0]-segments[i].points[j-1].point[0])*perc
                        ,segments[i].points[j-1].point[1]+(segments[i].points[j].point[1]-segments[i].points[j-1].point[1])*perc);
                    secondaryPos[0] = segments[i].points[j-1].point[0]+(segments[i].points[j].point[0]-segments[i].points[j-1].point[0])*perc;
                    secondaryPos[1] = segments[i].points[j-1].point[1]+(segments[i].points[j].point[1]-segments[i].points[j-1].point[1])*perc;
                }else{
                    ctx.lineTo(segments[i].points[j].point[0],segments[i].points[j].point[1]);
                    secondaryPos[0] = segments[i].points[j].point[0];
                    secondaryPos[1] = segments[i].points[j].point[1];
                }
            }
            if(offset >= addedLength + segments[i].points[j].partialLength){
                if(offset < addedLength + segments[i].points[j].partialLength + segments[i].points[j+1].partialLength){
                    perc = ( offset - (addedLength + segments[i].points[j].partialLength))/segments[i].points[j+1].partialLength;
                    ctx.moveTo(segments[i].points[j].point[0]+(segments[i].points[j+1].point[0] - segments[i].points[j].point[0])*perc
                        ,segments[i].points[j].point[1]+(segments[i].points[j+1].point[1] - segments[i].points[j].point[1])*perc);
                }
                addedLength += segments[i].points[j].partialLength;
                continue;
            }
            if(addedLength + segments[i].points[j].partialLength >= offset + segmentLength){
                perc = 1 - (((addedLength + segments[i].points[j].partialLength) - (offset + segmentLength))/segments[i].points[j].partialLength);
                //ctx.lineTo(segments[i].points[j-1].point[0]+(segments[i].points[j].point[0]-segments[i].points[j-1].point[0])*perc,segments[i].points[j-1].point[1]+(segments[i].points[j].point[1]-segments[i].points[j-1].point[1])*perc);
            }else{
                //ctx.lineTo(segments[i].points[j].point[0],segments[i].points[j].point[1]);
            }
        }
        if(offset>addedLength+segments[i].segmentLength && secondarySegment){
            addedLength += segments[i].segmentLength;
        }
        if(addedLength > segmentLength + offset){
            console.log('breiking i',i);
            break;
        }
    }




    return;
    for(i = 0; i < len; i += 1){
        if(offset>addedLength+segments[i].segmentLength && !secondarySegment){
            addedLength += segments[i].segmentLength;
            continue;
        }
        jLen = segments[i].points.length;
        for(j = 0; j < jLen ; j += 1){
            console.log('j: ',j);
            if(secondarySegment && addedLength < secondarySegment){
                ctx.lineTo(segments[i].points[j].point[0],segments[i].points[j].point[1]);
            }else{
                if(offset>addedLength + segments[i].points[j].partialLength){
                    addedLength += segments[i].points[j].partialLength;
                    if(offset < addedLength + segments[i].points[j+1].partialLength){
                        perc = (offset - addedLength)/segments[i].points[j].partialLength;
                        ctx.moveTo(segments[i].points[j].point[0]+(segments[i].points[j+1].point[0]-segments[i].points[j].point[0])*perc,segments[i].points[j].point[1]+(segments[i].points[j+1].point[1]-segments[i].points[j].point[1])*perc);
                        firstPoint = false;
                    }
                    console.log('continue j',j);
                    console.log('addedLength: ',addedLength);
                    console.log('offset: ',offset);
                    continue;
                }
                if(addedLength> segmentLength + offset){
                    console.log('breiking j',j);
                    break;
                }
                if(firstPoint){
                    console.log('first point');
                    ctx.moveTo(segments[i].points[j].point[0],segments[i].points[j].point[1]);
                    firstPoint = false;
                }else{
                    /*console.log('llllegggo');
                    console.log('addedLength: ',addedLength);
                    console.log('segments[i].points[j].partialLength: ',segments[i].points[j].partialLength);
                    console.log('segmentLength: ',segmentLength);*/
                    console.log('addedLength + segments[i].points[j].partialLength - (segmentLength + offset): ',addedLength + segments[i].points[j].partialLength - (segmentLength + offset));
                    if(addedLength + segments[i].points[j].partialLength - (segmentLength + offset) >= 0){
                        perc = (segmentLength + offset - addedLength)/segments[i].points[j].partialLength;
                        //console.log('totalLength: ',totalLength);
                        console.log('trimData.e: ',trimData.e);
                        console.log('trimData.s: ',trimData.s);
                        console.log('perc: ',perc);
                        /*console.log('segmentLength: ',segmentLength);
                        console.log('offset: ',offset);
                        console.log('addedLength: ',addedLength);
                        console.log('segments[i].points[j].partialLength: ',segments[i].points[j].partialLength);*/
                        ctx.lineTo(segments[i].points[j-1].point[0]+(segments[i].points[j].point[0]-segments[i].points[j-1].point[0])*perc,segments[i].points[j-1].point[1]+(segments[i].points[j].point[1]-segments[i].points[j-1].point[1])*perc);

                    }else{
                        ctx.lineTo(segments[i].points[j].point[0],segments[i].points[j].point[1]);
                    }
                }
            }
            addedLength += segments[i].points[j].partialLength;
        }
        if(offset>addedLength+segments[i].segmentLength && secondarySegment){
            addedLength += segments[i].segmentLength;
        }
        if(addedLength > segmentLength + offset){
            console.log('breiking i',i);
            break;
        }
    }
    /*console.log('totalLength: ',totalLength);
    console.log('(this.pathLength*(trimData.o))/360: ',(trimData.o)%360);
    console.log('segmentLength: ',segmentLength);*/

};

CVShapeItemElement.prototype.renderPath = function(num){
    var animData = this.data.an;
    var path = animData.path[animData.path[num].forwardFrame];

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
            ctx.moveTo(pathNodes.v[i][0],pathNodes.v[i][1]);
        }else{
            ctx.bezierCurveTo(pathNodes.o[i-1][0]+pathNodes.v[i-1][0],pathNodes.o[i-1][1]+pathNodes.v[i-1][1]
                ,pathNodes.i[i][0]+pathNodes.v[i][0],pathNodes.i[i][1]+pathNodes.v[i][1]
                ,pathNodes.v[i][0],pathNodes.v[i][1]);
        }
    }
    if(path.closed){
    ctx.bezierCurveTo(pathNodes.o[i-1][0]+pathNodes.v[i-1][0],pathNodes.o[i-1][1]+pathNodes.v[i-1][1]
        ,pathNodes.i[0][0]+pathNodes.v[0][0],pathNodes.i[0][1]+pathNodes.v[0][1]
        ,pathNodes.v[0][0],pathNodes.v[0][1]);
    }
};

CVShapeItemElement.prototype.renderEllipse = function(num){
    var animData = this.data.an;
    var ell = animData.ell[animData.ell[num].forwardFrame];
    animData.renderedFrame.ell = ell.forwardFrame;

    var ctx = this.renderer.canvasContext;

    ctx.beginPath();
    if(ctx.ellipse){
        ctx.ellipse(ell.p[0], ell.p[1], ell.size[0]/2, ell.size[1]/2, 0, 0, Math.PI*2, true);
    }else{
        var kappa = .5522848,w = ell.size[0], h = ell.size[1],x=ell.p[0],y=ell.p[1];
            ox = (w / 2) * kappa, // control point offset horizontal
            oy = (h / 2) * kappa, // control point offset vertical
            xe = x + w,           // x-end
            ye = y + h,           // y-end
            xm = x + w / 2,       // x-middle
            ym = y + h / 2;       // y-middle

        ctx.moveTo(x, ym);
        ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    }
};

CVShapeItemElement.prototype.renderRect = function(num){
    var animData = this.data.an;
    if(animData.rect[num].forwardFrame == animData.renderedFrame.rect){
        return;
    }
    var rect = animData.rect[animData.rect[num].forwardFrame];
    animData.renderedFrame.rect = rect.forwardFrame;

    this.shape.setAttribute('width',rect.size[0]);
    this.shape.setAttribute('height',rect.size[1]);
    this.shape.setAttribute('rx',rect.roundness);
    this.shape.setAttribute('ry',rect.roundness);
    this.shape.setAttribute('x',(rect.position[0] - rect.size[0]/2));
    this.shape.setAttribute('y',(rect.position[1] - rect.size[1]/2));
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

CVShapeItemElement.prototype.renderTrim = function(num){
    if(this.data.trim.an[num].forwardFrame == this.data.renderedData.trim){
        return;
    }
    var trimData = this.data.trim.an[this.data.trim.an[num].forwardFrame];
    this.data.renderedData.trim = trimData.forwardFrame;
    if(this.pathLength == 0){
        this.shape.setAttribute('stroke-opacity',0);
    }else{
        var dashLength = this.pathLength*(trimData.e - trimData.s)/100;
        var dashSpace = this.pathLength - dashLength;
        var dashOffset = this.pathLength*(trimData.s)/100+(this.pathLength*(trimData.o))/360;
        var strokeDashArray = dashLength+" , "+dashSpace;
        this.shape.setAttribute('stroke-dasharray',strokeDashArray);
        this.shape.setAttribute('stroke-dashoffset',-dashOffset);
        if(trimData.e == trimData.s){
            this.shape.setAttribute('stroke-opacity',0);
        }else{
            if(this.data.an.stroke){
                var stroke = this.data.an.stroke[this.data.an.stroke[num].forwardFrame];
                if(this.data.strokeEnabled!==false){
                    this.shape.setAttribute('stroke-opacity',stroke.opacity/100);
                }else{
                    this.shape.setAttribute('stroke-opacity',0);
                }
            }
        }
    }
};