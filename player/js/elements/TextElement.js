function ITextElement(data, animationItem,parentContainer,globalData){
    this.textSpans = [];
    this.parent.constructor.call(this,data, animationItem,parentContainer,globalData);
    this.renderedBeziers = [];
    this.renderedLetters = [];
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
    var i, len = documentData.t.length,tSpan;
    for (i = 0;i < len ;i += 1) {
        tSpan = document.createElementNS(svgNS,'text');
        if(documentData.t.charAt(i) === ' '){
            tSpan.textContent = '\u00A0';
        }else{
            tSpan.textContent = documentData.t.charAt(i);
        }
        tSpan.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space","preserve");
        this.textElem.appendChild(tSpan);
        this.textSpans.push({elem:tSpan,l:tSpan.getComputedTextLength()});
    }

    this.pathElem = document.createElementNS(svgNS,'path');
    this.pathElem.setAttribute('stroke', '#ff0000');
    this.pathElem.setAttribute('stroke-width', '1');
    this.pathElem.setAttribute('fill', 'none');
    this.pathElem.setAttribute('d','');
    this.layerElement.appendChild(this.pathElem);

    this.pointsElem = document.createElementNS(svgNS,'path');
    this.pointsElem.setAttribute('stroke', '#00ff00');
    this.pointsElem.setAttribute('stroke-width', '1');
    this.pointsElem.setAttribute('fill', 'none');
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
    if('m' in this.data.t.p){
        var  i,len,lettersValue;
        if(!this.renderedLetters[num]){
            var mask = this.data.masksProperties[this.data.t.p.m];
            lettersValue = [];
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
            i = len;
            if(mask.cl){
                pathData = {
                    s: paths.v[i],
                    e: paths.v[0],
                    to: [paths.o[i][0]-paths.v[i][0],paths.o[i][1]-paths.v[i][1]],
                    ti: [paths.i[0][0]-paths.v[0][0],paths.i[0][1]-paths.v[0][1]]
                };
                bez.buildBezierData(pathData);
                pathInfo.tLength += pathData.bezierData.segmentLength;
                pathInfo.segments.push(pathData);
            }
            this.renderedBeziers[num] = pathInfo;

            /*** DEBUG ***/
            var pathString = '';
            pathString += "M"+paths.v[0].join(',');
            len += 1;

            for(i=1; i < len; i += 1){
                pathString += " C"+paths.o[i-1].join(',') + " "+paths.i[i].join(',') + " "+paths.v[i].join(',');
            }
            i = len - 1;
            if(mask.cl){
                pathString += " C"+paths.o[i].join(',') + " "+paths.i[0].join(',') + " "+paths.v[0].join(',');
            }
            this.pathElem.setAttribute('d',pathString);
            /*******/

            len = this.textSpans.length;
            //console.log(this.textSpans);
            var currentLength = this.data.renderedData[num].t.p[0], segmentInd = 0, pointInd = 1, currentSegment, currentPoint, prevPoint, points;
            var segmentLength = 0, flag = true, contador = 0;
            var segments = pathInfo.segments;
            if(currentLength < 0 && mask.cl) {
                //console.log(currentLength);
                if(pathInfo.tLength < Math.abs(currentLength)){
                    currentLength = -Math.abs(currentLength)%pathInfo.tLength;
                }
                segmentInd = segments.length - 1;
                points = segments[segmentInd].bezierData.points;
                pointInd = points.length - 1;
                while(currentLength < 0){
                    currentLength += points[pointInd].partialLength;
                    pointInd -= 1;
                    if(pointInd<0){
                        segmentInd -= 1;
                        points = segments[segmentInd].bezierData.points;
                        pointInd = points.length - 1;
                    }
                }

            }
            points = segments[segmentInd].bezierData.points;
            prevPoint = points[pointInd - 1];
            currentPoint = points[pointInd];
            var partialLength = currentPoint.partialLength;
            var perc, xPos,yPos, tanAngle, letterTransform;
            for( i = 0; i < len; i += 1){
                currentLength += this.textSpans[i].l/2;
                flag = true;
                while(flag){
                    contador = 0;
                    if(segmentLength + partialLength >= currentLength || !points){
                        perc = (currentLength - segmentLength)/currentPoint.partialLength;
                        xPos = prevPoint.point[0] + (currentPoint.point[0] - prevPoint.point[0])*perc;
                        yPos = prevPoint.point[1] + (currentPoint.point[1] - prevPoint.point[1])*perc;
                        letterTransform = 'translate('+xPos+','+yPos+')';
                        if(this.data.t.p.p){
                            tanAngle = (currentPoint.point[1]-prevPoint.point[1])/(currentPoint.point[0]-prevPoint.point[0]);
                            /*if(currentPoint.point[0] < prevPoint.point[0]){
                                tanAngle += Math.PI*2;
                            }*/
                            var rot = Math.atan(tanAngle)*180/Math.PI;
                            if(currentPoint.point[0] < prevPoint.point[0]){
                                rot += 180;
                            }
                            letterTransform += ' rotate('+rot+')';
                        }
                        letterTransform += ' translate(-'+this.textSpans[i].l/2+',0)';
                        lettersValue.push(letterTransform);
                        flag = false;
                    }else if(points){
                        segmentLength += currentPoint.partialLength;
                        pointInd += 1;
                        if(pointInd >= points.length){
                            pointInd = 0;
                            segmentInd += 1;
                            if(!segments[segmentInd]){
                                if(mask.cl){
                                    pointInd = 0;
                                    segmentInd = 0;
                                    points = segments[segmentInd].bezierData.points;
                                }else{
                                    points = null;
                                }
                            }else{
                                points = segments[segmentInd].bezierData.points;
                            }
                        }
                        if(points){
                            prevPoint = currentPoint;
                            currentPoint = points[pointInd];
                            partialLength = currentPoint.partialLength;
                        }
                    }
                }
                currentLength += this.textSpans[i].l/2;
                this.renderedLetters[num] = lettersValue;

            }
        }
        lettersValue = this.renderedLetters[num];
        len = lettersValue.length;
        for( i = 0; i < len; i += 1){
            this.textSpans[i].elem.setAttribute('transform',lettersValue[i]);
        }
    }
};

ITextElement.prototype.destroy = function(){
    this.parent.destroy.call();
    this.textElem =  null;
};
