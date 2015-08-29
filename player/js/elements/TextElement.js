function ITextElement(data, animationItem,parentContainer,globalData){
    this.textSpans = [];
    this.yOffset = 0;
    this.parent.constructor.call(this,data, animationItem,parentContainer,globalData);
    this.renderedBeziers = [];
    this.renderedLetters = [];
}
createElement(BaseElement, ITextElement);

ITextElement.prototype.createElements = function(){

    this.parent.createElements.call(this);

    var documentData = this.data.t.d;

    this.textElem = document.createElementNS(svgNS,'g');
    this.textElem.setAttribute('fill', documentData.fc);
    this.textElem.setAttribute('font-size', documentData.s);
    this.textElem.setAttribute('font-family', documentData.f + ', sans-serif');
    //this.textElem.setAttribute('font-family', 'grafolita-script, sans-serif');
    this.layerElement.appendChild(this.textElem);
    var i, len = documentData.t.length,tSpan;
    var newLineFlag, index = 0, val;
    var anchorGrouping = this.data.t.m.g;
    var currentSize = 0, currentPos = 0, groupIndex = 0;
    for (i = 0;i < len ;i += 1) {
        newLineFlag = false;
        tSpan = document.createElementNS(svgNS,'text');
        if(documentData.t.charAt(i) === ' '){
            val = '\u00A0';
        }else if(documentData.t.charCodeAt(i) === 13){
            val = '';
            newLineFlag = true;
        }else{
            val = documentData.t.charAt(i);
        }
        tSpan.textContent = val;
        tSpan.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space","preserve");
        this.textElem.appendChild(tSpan);
        var cLength = tSpan.getComputedTextLength();
        this.textSpans.push({elem:tSpan,l:cLength,an:cLength,add:currentSize,n:newLineFlag, anIndexes:[], val: val});
        if(!newLineFlag){
            index += 1;
        }
        if(anchorGrouping == 2){
            currentSize += cLength;
            if(val == '' || val == '\u00A0' || i == len - 1){
                while(currentPos<=i){
                    this.textSpans[currentPos].an = currentSize;
                    this.textSpans[currentPos].ind = groupIndex;
                    currentPos += 1;
                }
                currentSize = 0;
                groupIndex += 1;
            }
        }else if(anchorGrouping == 3){
            currentSize += cLength;
            if(val == '' || i == len - 1){
                while(currentPos<=i){
                    this.textSpans[currentPos].an = currentSize;
                    this.textSpans[currentPos].ind = groupIndex;
                    currentPos += 1;
                }
                currentSize = 0;
                groupIndex += 1;
            }
        }else{
            this.textSpans[i].ind = groupIndex;
            groupIndex += 1;
        }
    }
    var animators = this.data.t.a;
    var j, jLen = animators.length, based, ind, indexes = [];
    for(j=0;j<jLen;j+=1){
        ind = 0;
        based = animators[j].s.b;
        for(i=0;i<len;i+=1){
            this.textSpans[i].anIndexes[j] = ind;
            if((based == 1 && this.textSpans[i].val != '') || (based == 2 && this.textSpans[i].val != '' && this.textSpans[i].val != '\u00A0') || (based == 3 && (this.textSpans[i].n || this.textSpans[i].val == '\u00A0' || i == len - 1)) || (based == 4 && (this.textSpans[i].n || i == len - 1))){
                if(animators[j].s.rn === 1){
                    indexes.push(ind);
                }
                ind += 1;
            }
        }
        this.data.t.a[j].totalChars = ind;
        var currentInd = -1, newInd;
        if(animators[j].s.rn === 1){
            for(i = 0; i < len; i += 1){
                if(currentInd != this.textSpans[i].anIndexes[j]){
                    currentInd = this.textSpans[i].anIndexes[j];
                    newInd = indexes.splice(Math.floor(Math.random()*indexes.length),1)[0];
                }
                this.textSpans[i].anIndexes[j] = newInd;
            }
        }
    }

    this.yOffset = documentData.s*1.2;
    this.fontSize = documentData.s;

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
    var  i,len;
    var xPos,yPos, letterTransform;
    if('m' in this.data.t.p) {
        var lettersValue;
        var mask = this.data.masksProperties[this.data.t.p.m];
        lettersValue = [];
        var paths = mask.paths[num].pathNodes;
        var pathInfo = {
            tLength: 0,
            segments: []
        };
        len = paths.v.length - 1;
        var pathData;

        for (i = 0; i < len; i += 1) {
            pathData = {
                s: paths.v[i],
                e: paths.v[i + 1],
                to: [paths.o[i][0] - paths.v[i][0], paths.o[i][1] - paths.v[i][1]],
                ti: [paths.i[i + 1][0] - paths.v[i + 1][0], paths.i[i + 1][1] - paths.v[i + 1][1]]
            };
            bez.buildBezierData(pathData);
            pathInfo.tLength += pathData.bezierData.segmentLength;
            pathInfo.segments.push(pathData);
        }
        i = len;
        if (mask.cl) {
            pathData = {
                s: paths.v[i],
                e: paths.v[0],
                to: [paths.o[i][0] - paths.v[i][0], paths.o[i][1] - paths.v[i][1]],
                ti: [paths.i[0][0] - paths.v[0][0], paths.i[0][1] - paths.v[0][1]]
            };
            bez.buildBezierData(pathData);
            pathInfo.tLength += pathData.bezierData.segmentLength;
            pathInfo.segments.push(pathData);
        }
        this.renderedBeziers[num] = pathInfo;

        ////// DEBUG
        var pathString = '';
        pathString += "M" + paths.v[0].join(',');
        len += 1;

        for (i = 1; i < len; i += 1) {
            pathString += " C" + paths.o[i - 1].join(',') + " " + paths.i[i].join(',') + " " + paths.v[i].join(',');
        }
        i = len - 1;
        if (mask.cl) {
            pathString += " C" + paths.o[i].join(',') + " " + paths.i[0].join(',') + " " + paths.v[0].join(',');
        }
        this.pathElem.setAttribute('d', pathString);
        /////

        len = this.textSpans.length;
        //console.log(this.textSpans);
        var currentLength = this.data.renderedData[num].t.p[0], segmentInd = 0, pointInd = 1, currentSegment, currentPoint, prevPoint, points;
        var segmentLength = 0, flag = true, contador = 0;
        var segments = pathInfo.segments;
        if (currentLength < 0 && mask.cl) {
            //console.log(currentLength);
            if (pathInfo.tLength < Math.abs(currentLength)) {
                currentLength = -Math.abs(currentLength) % pathInfo.tLength;
            }
            segmentInd = segments.length - 1;
            points = segments[segmentInd].bezierData.points;
            pointInd = points.length - 1;
            while (currentLength < 0) {
                currentLength += points[pointInd].partialLength;
                pointInd -= 1;
                if (pointInd < 0) {
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
        var perc, tanAngle;
        /*for (i = 0; i < len; i += 1) {
            currentLength += this.textSpans[i].l / 2;
            flag = true;
            while (flag) {
                contador = 0;
                if (segmentLength + partialLength >= currentLength || !points) {
                    perc = (currentLength - segmentLength) / currentPoint.partialLength;
                    xPos = prevPoint.point[0] + (currentPoint.point[0] - prevPoint.point[0]) * perc;
                    yPos = prevPoint.point[1] + (currentPoint.point[1] - prevPoint.point[1]) * perc;
                    letterTransform = 'translate(' + xPos + ',' + yPos + ')';
                    if (this.data.t.p.p) {
                        tanAngle = (currentPoint.point[1] - prevPoint.point[1]) / (currentPoint.point[0] - prevPoint.point[0]);
                        var rot = Math.atan(tanAngle) * 180 / Math.PI;
                        if (currentPoint.point[0] < prevPoint.point[0]) {
                            rot += 180;
                        }
                        letterTransform += ' rotate(' + rot + ')';
                    }
                    letterTransform += ' translate(-' + this.textSpans[i].l / 2 + ',0)';
                    lettersValue.push(letterTransform);
                    flag = false;
                } else if (points) {
                    segmentLength += currentPoint.partialLength;
                    pointInd += 1;
                    if (pointInd >= points.length) {
                        pointInd = 0;
                        segmentInd += 1;
                        if (!segments[segmentInd]) {
                            if (mask.cl) {
                                pointInd = 0;
                                segmentInd = 0;
                                points = segments[segmentInd].bezierData.points;
                            } else {
                                points = null;
                            }
                        } else {
                            points = segments[segmentInd].bezierData.points;
                        }
                    }
                    if (points) {
                        prevPoint = currentPoint;
                        currentPoint = points[pointInd];
                        partialLength = currentPoint.partialLength;
                    }
                }
            }
            currentLength += this.textSpans[i].l / 2;
            this.renderedLetters[num] = lettersValue;

        }*/
    }







    len = this.textSpans.length;
    xPos = 0;
    yPos = 0;
    var yOff = this.yOffset*.714;
    var firstLine = true;
    var renderedData = this.data.renderedData[num].t, animatorProps;
    var j, jLen;

    jLen = renderedData.a.length;
    var ranges = [], totalChars, divisor;
    for(j=0;j<jLen;j+=1){
        totalChars = this.data.t.a[j].totalChars;
        divisor = this.data.t.a[j].s.r === 2 ? 1 : 100/totalChars;
        if(!('e' in renderedData.a[j].s)){
            renderedData.a[j].s.e = this.data.t.a[j].s.r === 2 ? totalChars : 100;
        }
        var o = renderedData.a[j].s.o/divisor;
        if(o === 0 && renderedData.a[j].s.s === 0 && renderedData.a[j].s.e === divisor){

        }
        var s = renderedData.a[j].s.s/divisor + o;
        var e = (renderedData.a[j].s.e/divisor) + o;
        if(s>e){
            var _s = s;
            s = e;
            e = _s;
        }
        ranges.push({s:s,e:e});
    }

    var k, kLen, mult, ind = -1, offf;

    for( i = 0; i < len; i += 1) {
        letterTransform = '';
        if(this.textSpans[i].n && !('m' in this.data.t.p)) {
            xPos = 0;
            yPos += this.yOffset;
            yPos += firstLine ? 1 : 0;
            firstLine = false;
        }else{
            if('m' in this.data.t.p) {
                if(this.textSpans[i].ind !== ind){
                    currentLength += this.textSpans[i].an / 2;
                }
                letterTransform += 'translate(' + -this.textSpans[i].an / 2 + ',' + 0 + ')';
                flag = true;
                while (flag) {
                    if (segmentLength + partialLength >= currentLength || !points) {
                        perc = (currentLength - segmentLength) / currentPoint.partialLength;
                        xPos = prevPoint.point[0] + (currentPoint.point[0] - prevPoint.point[0]) * perc;
                        yPos = prevPoint.point[1] + (currentPoint.point[1] - prevPoint.point[1]) * perc;
                        letterTransform += 'translate(' + xPos + ',' + yPos + ')';
                        if (this.data.t.p.p) {
                            tanAngle = (currentPoint.point[1] - prevPoint.point[1]) / (currentPoint.point[0] - prevPoint.point[0]);
                            var rot = Math.atan(tanAngle) * 180 / Math.PI;
                            if (currentPoint.point[0] < prevPoint.point[0]) {
                                rot += 180;
                            }
                            letterTransform += ' rotate(' + rot + ')';
                        }
                        //letterTransform += ' translate(-' + this.textSpans[i].an / 2 + ',0)';
                        lettersValue.push(letterTransform);
                        flag = false;
                    } else if (points) {
                        segmentLength += currentPoint.partialLength;
                        pointInd += 1;
                        if (pointInd >= points.length) {
                            pointInd = 0;
                            segmentInd += 1;
                            if (!segments[segmentInd]) {
                                if (mask.cl) {
                                    pointInd = 0;
                                    segmentInd = 0;
                                    points = segments[segmentInd].bezierData.points;
                                } else {
                                    points = null;
                                }
                            } else {
                                points = segments[segmentInd].bezierData.points;
                            }
                        }
                        if (points) {
                            prevPoint = currentPoint;
                            currentPoint = points[pointInd];
                            partialLength = currentPoint.partialLength;
                        }
                    }
                }
                if(this.textSpans[i].ind !== ind){
                    currentLength += this.textSpans[i].an / 2;
                    ind = this.textSpans[i].ind;
                }else{
                }
                //this.textSpans[i].elem.setAttribute('transform',letterTransform);
                //continue;
            }else{
                letterTransform += ' translate('+xPos+','+yPos+')';
            }
            offf = this.textSpans[i].an/2 - this.textSpans[i].add;
            letterTransform += ' translate('+offf+',0)';

            letterTransform += ' translate('+renderedData.m.a[0]*this.textSpans[i].an/200+','+ renderedData.m.a[1]*yOff/100+')';

            for(j=0;j<jLen;j+=1){
                animatorProps = renderedData.a[j].a;
                if ('p' in animatorProps && 's' in ranges[j]) {
                    mult = this.getMult(this.textSpans[i].anIndexes[j],ranges[j].s,ranges[j].e,this.data.t.a[j].s.sh);
                    letterTransform += ' translate('+ animatorProps.p[0]*mult+','+ animatorProps.p[1]*mult+')';
                }
            }

            for(j=0;j<jLen;j+=1) {
                animatorProps = renderedData.a[j].a;
                if ('r' in animatorProps && 's' in ranges[j]) {
                    mult = this.getMult(this.textSpans[i].anIndexes[j],ranges[j].s,ranges[j].e,this.data.t.a[j].s.sh);
                    letterTransform += ' rotate(' + animatorProps.r*mult + ')';
                }
                if ('o' in animatorProps && 's' in ranges[j]) {
                    mult = this.getMult(this.textSpans[i].anIndexes[j],ranges[j].s,ranges[j].e,this.data.t.a[j].s.sh);
                    this.textSpans[i].elem.setAttribute('opacity',(1+((animatorProps.o/100-1)*mult)));
                }
            }
            for(j=0;j<jLen;j+=1){
                animatorProps = renderedData.a[j].a;
                if ('s' in animatorProps && 's' in ranges[j]) {
                    mult = this.getMult(this.textSpans[i].anIndexes[j],ranges[j].s,ranges[j].e,this.data.t.a[j].s.sh);
                    letterTransform += ' scale('+(1+((animatorProps.s[0]/100-1)*mult))+','+(1+((animatorProps.s[1]/100-1)*mult))+')';
                }
            }
            for(j=0;j<jLen;j+=1){
                animatorProps = renderedData.a[j].a;
                if ('a' in animatorProps && 's' in ranges[j]) {
                    mult = this.getMult(this.textSpans[i].anIndexes[j],ranges[j].s,ranges[j].e,this.data.t.a[j].s.sh);
                    letterTransform += ' translate('+ -animatorProps.a[0]*mult+','+ -animatorProps.a[1]*mult+')';
                }
            }


            letterTransform += ' translate(' + -offf + ',0)';
            letterTransform += ' translate(' + -renderedData.m.a[0]*this.textSpans[i].an/200+','+ -renderedData.m.a[1]*yOff/100+')';
            xPos += this.textSpans[i].l;
            this.textSpans[i].elem.setAttribute('transform',letterTransform);
        }
    }
};

ITextElement.prototype.getMult = function(ind,s,e,type){
    var mult = 0;
    if(type == 2){
        if(e === s){
            mult = ind >= e ? 1 : 0;
        }else{
            mult = Math.max(0,Math.min(0.5/(e-s) + (ind-s)/(e-s),1));
        }
    }else if(type == 3){
        if(e === s){
            mult = ind >= e ? 0 : 1;
        }else{
            mult = 1 - Math.max(0,Math.min(0.5/(e-s) + (ind-s)/(e-s),1));
        }
    }else {
        if(ind >= Math.floor(s)){
            if(ind-s < 0){
                mult = 1 - (s - ind);
            }else{
                mult = Math.max(0,Math.min(e-ind,1));
            }
        }
    }
    return mult;
}

ITextElement.prototype.destroy = function(){
    this.parent.destroy.call();
    this.textElem =  null;
};
