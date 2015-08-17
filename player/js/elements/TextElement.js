function ITextElement(data, animationItem,parentContainer,globalData){
    this.textSpans = [];
    this.parent.constructor.call(this,data, animationItem,parentContainer,globalData);
    this.renderedBeziers = [];
}
createElement(BaseElement, ITextElement);

ITextElement.prototype.createElements = function(){

    this.parent.createElements.call(this);

    var documentData = this.data.t.d;

    this.textElem = document.createElementNS(svgNS,'g');
    //this.textElem.textContent = documentData.t;
    this.textElem.setAttribute('fill', documentData.fc);
    this.textElem.setAttribute('font-size', documentData.s);
    this.textElem.setAttribute('font-family', documentData.f + ', sans-serif');
    this.layerElement.appendChild(this.textElem);
    var i, len = documentData.t.length,tSpan,tInner;
    for (i = 0;i < len ;i += 1) {
        tSpan = document.createElementNS(svgNS,'g');
        tInner = document.createElementNS(svgNS,'text');
        if(documentData.t.charAt(i) === ' '){
            tInner.textContent = '\u00A0';
        }else{
            tInner.textContent = documentData.t.charAt(i);
        }
        tSpan.appendChild(tInner);
        tSpan.setAttribute('x',0);
        tSpan.setAttribute('y',0);
        tSpan.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space","preserve");
        this.textElem.appendChild(tSpan);
        this.textSpans.push({elem:tSpan,l:tInner.getComputedTextLength(),i:tInner});
    }

    this.pathElem = document.createElementNS(svgNS,'path');
    this.pathElem.setAttribute('stroke', '#ff0000');
    this.pathElem.setAttribute('stroke-width', '1');
    this.pathElem.setAttribute('fill', 'none');
    this.pathElem.setAttribute('d','M0,0 h100 v100 h-100 v -100');
    this.layerElement.appendChild(this.pathElem);

    this.pointsElem = document.createElementNS(svgNS,'path');
    this.pointsElem.setAttribute('stroke', '#00ff00');
    this.pointsElem.setAttribute('stroke-width', '1');
    this.pointsElem.setAttribute('fill', 'none');
    this.pointsElem.setAttribute('d','M0,0 h100 v100 h-100 v -100');
    this.layerElement.appendChild(this.pointsElem);
};

ITextElement.prototype.hide = function(){
    if(!this.hidden){
        this.textElem.setAttribute('opacity','0');
        this.hidden = true;
    }
};

ITextElement.prototype.renderFrame = function(num,parentMatrix){
    var renderParent = this.parent.renderFrame.call(this,num,parentMatrix);
    if(renderParent===false){
        this.hide();
        return;
    }
    if(this.hidden){
        this.lastData.o = -1;
        this.hidden = false;
        this.textElem.setAttribute('opacity', '1');
    }
    if(!this.data.hasMask){
        if(!this.renderedFrames[this.globalData.frameNum]){
            this.renderedFrames[this.globalData.frameNum] = {
                tr: 'matrix('+this.finalTransform.mat.props.join(',')+')',
                o: this.finalTransform.opacity
            };
        }
        var renderedFrameData = this.renderedFrames[this.globalData.frameNum];
        if(this.lastData.tr != renderedFrameData.tr){
            this.lastData.tr = renderedFrameData.tr;
            this.textElem.setAttribute('transform',renderedFrameData.tr);
        }
        if(this.lastData.o !== renderedFrameData.o){
            this.lastData.o = renderedFrameData.o;
            this.textElem.setAttribute('opacity',renderedFrameData.o);
        }
    }
    if(this.data.t.p.m !== null) {
        var mask = this.data.masksProperties[this.data.t.p.m];
        //console.log(mask);
        var pathInfo, i,len;
        if(this.renderedBeziers[num]){
            pathInfo = this.renderedBeziers[num];
        }else{
            var paths = mask.paths[num].pathNodes;
            var pathInfo = {
                tLength: 0,
                segments: []
            };
            len = paths.v.length - 1;
            var pathData;

            for(i=0; i < len; i += 1){
                pathData = {
                    s: paths.v[i],
                    e: paths.v[i+1],
                    to: [paths.o[i][0]-paths.v[i][0],paths.o[i][1]-paths.v[i][1]],
                    ti: [paths.i[i+1][0]-paths.v[i+1][0],paths.i[i+1][1]-paths.v[i+1][1]]
                };
                bez.buildBezierData(pathData);
                pathInfo.tLength += pathData.bezierData.segmentLength;
                pathInfo.segments.push(pathData);
            }
            this.renderedBeziers[num] = pathInfo;


            var pathString = '';
            pathString += "M"+paths.v[0].join(',');
            len += 1;

            for(i=1; i < len; i += 1){
                pathString += " C"+paths.o[i-1].join(',') + " "+paths.i[i].join(',') + " "+paths.v[i].join(',');
            }
            this.pathElem.setAttribute('d',pathString);


            /* ptsString = 'M0,0';
            var segments = pathInfo.segments;
            for(var s = 0; s < segments.length; s += 1){
                var points = segments[s].bezierData.points;
                for(var p = 0; p < points.length; p += 1){
                    ptsString += ' L' + points[p].point.join(',');
                }
            }
            this.pointsElem.setAttribute('d',ptsString);*/
        }
        len = this.textSpans.length;
        //console.log(this.textSpans);
        var currentLength = 0, segmentInd = 0, pointInd = 0, currentSegment, currentPoint, prevPoint, points;
        var segmentLength = 0, flag = true, contador = 0;
        var segments = pathInfo.segments;
        points = segments[segmentInd].bezierData.points;
        currentPoint = prevPoint = points[pointInd];
        for( i = 0; i < len; i += 1){
            if(!points){
                break;
            }
            flag = true;
            while(flag){
                contador = 0;
                if(segmentLength + currentPoint.partialLength >= currentLength){
                    var prevPt = prevPoint.point;
                    var currPt = currentPoint.point;
                    var tanAngle = (currPt[1]-prevPt[1])/(currPt[0]-prevPt[0]);
                    if(isNaN(tanAngle)){
                        tanAngle = 1;
                    }
                   // console.log(Math.atan(tanAngle)*180/Math.PI);
                    //this.textSpans[i].elem.setAttribute('x',currentPoint.point[0]);
                    //this.textSpans[i].elem.setAttribute('y',currentPoint.point[1]);
                    this.textSpans[i].elem.setAttribute('transform','translate('+currentPoint.point[0]+','+currentPoint.point[1]+')');
                    this.textSpans[i].i.setAttribute('transform','rotate('+Math.atan(tanAngle)*180/Math.PI+')');
                    flag = false;
                }
                segmentLength += currentPoint.partialLength;
                pointInd += 1;
                if(pointInd >= points.length){
                    pointInd = 0;
                    segmentInd += 1;
                    if(!segments[segmentInd]){
                        points = null;
                        break;
                    }else{
                        points = segments[segmentInd].bezierData.points;
                    }
                }
                prevPoint = currentPoint;
                currentPoint = points[pointInd];
                contador += 1;
                if(contador == 2000){
                    console.log('breik');
                    flag = false;
                }
            }
            currentLength += this.textSpans[i].l/2;
            currentLength += this.textSpans[i].l/2;

        }
    }
};

ITextElement.prototype.destroy = function(){
    this.parent.destroy.call();
    this.textElem =  null;
};
