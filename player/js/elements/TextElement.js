function ITextElement(data, animationItem,parentContainer,globalData){
    this.textSpans = [];
    this.yOffset = 0;
    this.fillColorAnim = false;
    this.strokeColorAnim = false;
    this.strokeWidthAnim = false;
    this.parent.constructor.call(this,data, animationItem,parentContainer,globalData);
    this.renderedLetters = [];
}
createElement(BaseElement, ITextElement);

ITextElement.prototype.createElements = function(){

    this.parent.createElements.call(this);
    //console.log('this.data: ',this.data);
    var documentData = this.data.t.d;

    this.textElem = document.createElementNS(svgNS,'g');
    var hasFill = false;
    if(documentData.fc) {
        hasFill = true;
        this.textElem.setAttribute('fill', 'rgb(' + documentData.fc[0] + ',' + documentData.fc[1] + ',' + documentData.fc[2] + ')');
    }else{
        this.textElem.setAttribute('fill', 'rgba(0,0,0,0)');
    }
    var hasStroke = false;
    if(documentData.sc){
        hasStroke = true;
        this.textElem.setAttribute('stroke', 'rgb(' + documentData.sc[0] + ',' + documentData.sc[1] + ',' + documentData.sc[2] + ')');
        this.textElem.setAttribute('stroke-width', documentData.sw);
    }
    this.textElem.setAttribute('font-size', documentData.s);
    this.textElem.setAttribute('font-family', this.globalData.fontManager.getFontByName(documentData.f));
    this.layerElement.appendChild(this.textElem);
    var i, len = documentData.t.length,tSpan, tShape, j, jLen, k, kLen;
    var newLineFlag, index = 0, val;
    var anchorGrouping = this.data.t.m.g;
    var currentSize = 0, currentPos = 0;
    for (i = 0;i < len ;i += 1) {
        newLineFlag = false;
        tSpan = document.createElementNS(svgNS,'text');
        tShape = document.createElementNS(svgNS,'path');
        //tSpan.setAttribute('visibility', 'hidden');
        if(documentData.t.charAt(i) === ' '){
            val = '\u00A0';
        }else if(documentData.t.charCodeAt(i) === 13){
            val = '';
            newLineFlag = true;
        }else{
            val = documentData.t.charAt(i);
        }
        tSpan.textContent = val;
        var charData = this.globalData.fontManager.getCharData(documentData.t.charAt(i), documentData.s, this.globalData.fontManager.getFontByName(documentData.f));
        var shapeData = charData.data;
        if(shapeData){
            var shapes = shapeData.shapes[0].it;
            var shapeStr = '';
            jLen = shapes.length;
            for(j=0;j<jLen;j+=1){
                kLen = shapes[j].ks.i.length;
                var pathNodes = shapes[j].ks;
                for(k=1;k<kLen;k+=1){
                    if(k==1){
                        shapeStr += " M"+pathNodes.v[0][0]+','+pathNodes.v[0][1];
                    }
                    shapeStr += " C"+pathNodes.o[k-1][0]+','+pathNodes.o[k-1][1] + " "+pathNodes.i[k][0]+','+pathNodes.i[k][1] + " "+pathNodes.v[k][0]+','+pathNodes.v[k][1];
                }
                shapeStr += " C"+pathNodes.o[k-1][0]+','+pathNodes.o[k-1][1] + " "+pathNodes.i[0][0]+','+pathNodes.i[0][1] + " "+pathNodes.v[0][0]+','+pathNodes.v[0][1];
            }
            tShape.setAttribute('d',shapeStr);
        }
        tSpan.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space","preserve");
        //this.textElem.appendChild(tSpan);
        this.textElem.appendChild(tShape);
        var cLength = charData.w;
        //var cLength = tSpan.getComputedTextLength();
        this.textSpans.push({elem:tSpan,shape:tShape,l:cLength,an:cLength,add:currentSize,n:newLineFlag, anIndexes:[], val: val});
        if(anchorGrouping == 2){
            currentSize += cLength;
            if(val == '' || val == '\u00A0' || i == len - 1){
                if(val == '' || val == '\u00A0'){
                    currentSize -= cLength;
                }
                while(currentPos<=i){
                    this.textSpans[currentPos].an = currentSize;
                    this.textSpans[currentPos].ind = index;
                    this.textSpans[currentPos].extra = cLength;
                    currentPos += 1;
                }
                index += 1;
                currentSize = 0;
            }
        }else if(anchorGrouping == 3){
            currentSize += cLength;
            if(val == '' || i == len - 1){
                if(val == ''){
                    currentSize -= cLength;
                }
                while(currentPos<=i){
                    this.textSpans[currentPos].an = currentSize;
                    this.textSpans[currentPos].ind = index;
                    this.textSpans[currentPos].extra = cLength;
                    currentPos += 1;
                }
                currentSize = 0;
                index += 1;
            }
        }else{
            this.textSpans[index].ind = index;
            this.textSpans[index].extra = 0;
            index += 1;
        }
    }
    var animators = this.data.t.a;
    var j, jLen = animators.length, based, ind, indexes = [];
    for(j=0;j<jLen;j+=1){
        if(animators[j].a.sc && hasStroke){
            this.strokeColorAnim = true;
        }
        if(animators[j].a.sw && hasStroke){
            this.strokeWidthAnim = true;
        }
        if(animators[j].a.fc && hasFill){
            this.fillColorAnim = true;
        }
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

    /*this.pathElem = document.createElementNS(svgNS,'path');
    this.pathElem.setAttribute('stroke', '#ff0000');
    this.pathElem.setAttribute('stroke-width', '1');
    this.pathElem.setAttribute('fill', 'none');
    this.pathElem.setAttribute('d','');
    this.layerElement.appendChild(this.pathElem);

    this.pointsElem = document.createElementNS(svgNS,'path');
    this.pointsElem.setAttribute('stroke', '#00ff00');
    this.pointsElem.setAttribute('stroke-width', '1');
    this.pointsElem.setAttribute('fill', 'none');
    this.layerElement.appendChild(this.pointsElem);*/
};

ITextElement.prototype.hide = function(){
    if(!this.hidden){
        this.textElem.setAttribute('visibility','hidden');
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
        this.textElem.setAttribute('visibility', 'visible');
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

    if(this.renderedLetters[num]){
        len = this.textSpans.length;
        var renderedLetter;
        for(i=0;i<len;i+=1){
            renderedLetter = this.renderedLetters[num][i];
            this.textSpans[i].elem.setAttribute('transform',renderedLetter.m);
            this.textSpans[i].elem.setAttribute('opacity',renderedLetter.o);
            this.textSpans[i].shape.setAttribute('transform',renderedLetter.m);
            this.textSpans[i].shape.setAttribute('opacity',renderedLetter.o);
            if(renderedLetter.sw){
                this.textSpans[i].shape.setAttribute('stroke-width',renderedLetter.sw);
                this.textSpans[i].elem.setAttribute('stroke-width',renderedLetter.sw);
            }
            if(renderedLetter.sc){
                this.textSpans[i].shape.setAttribute('stroke',renderedLetter.sc);
                this.textSpans[i].elem.setAttribute('stroke',renderedLetter.sc);
            }
            if(renderedLetter.fc){
                this.textSpans[i].shape.setAttribute('fill',renderedLetter.fc);
                this.textSpans[i].elem.setAttribute('fill',renderedLetter.fc);
            }
        }
        return;
    }

    var matrixHelper = this.mHelper;
    var xPos,yPos;
    var lettersValue = [], letterValue;
    if('m' in this.data.t.p) {
        var mask = this.data.masksProperties[this.data.t.p.m];
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

        /*///// DEBUG
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
        ////*/

        len = this.textSpans.length;
        var currentLength = this.data.renderedData[num].t.p[0], segmentInd = 0, pointInd = 1, currentSegment, currentPoint, prevPoint, points;
        var segmentLength = 0, flag = true, contador = 0;
        var segments = pathInfo.segments;
        if (currentLength < 0 && mask.cl) {
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

    var mult, ind = -1, offf, xPathPos, yPathPos;
    var initPathPos = currentLength,initSegmentInd = segmentInd, initPointInd = pointInd;
    var elemOpacity;
    var sc,sw,fc,k;

    for( i = 0; i < len; i += 1) {
        matrixHelper.reset();
        elemOpacity = 1;
        letterValue = {};
        if(this.textSpans[i].n) {
            xPos = 0;
            yPos += this.yOffset;
            yPos += firstLine ? 1 : 0;
            currentLength = initPathPos ;
            firstLine = false;
            segmentInd = initSegmentInd;
            pointInd = initPointInd;
            points = segments[segmentInd].bezierData.points;
            prevPoint = points[pointInd - 1];
            currentPoint = points[pointInd];
            partialLength = currentPoint.partialLength;
            segmentLength = 0;
        }else{
            if('m' in this.data.t.p) {
                if(ind !== this.textSpans[i].ind){
                    if(this.textSpans[ind]){
                        currentLength += this.textSpans[ind].extra;
                    }
                    currentLength += this.textSpans[i].an/2;
                    ind = this.textSpans[i].ind;
                }
                currentLength += renderedData.m.a[0]*this.textSpans[i].an/200;
                var animatorOffset = 0;
                for(j=0;j<jLen;j+=1){
                    animatorProps = renderedData.a[j].a;
                    if ('p' in animatorProps && 's' in ranges[j]) {
                        mult = this.getMult(this.textSpans[i].anIndexes[j],ranges[j].s,ranges[j].e,this.data.t.a[j].s.sh);

                        animatorOffset += animatorProps.p[0] * mult;
                    }
                }

                flag = true;
                while (flag) {
                    if (segmentLength + partialLength >= currentLength + animatorOffset || !points) {
                        perc = (currentLength + animatorOffset - segmentLength) / currentPoint.partialLength;
                        xPathPos = prevPoint.point[0] + (currentPoint.point[0] - prevPoint.point[0]) * perc;
                        yPathPos = prevPoint.point[1] + (currentPoint.point[1] - prevPoint.point[1]) * perc;
                        matrixHelper.translate(xPathPos,yPathPos);
                        if (this.data.t.p.p) {
                            tanAngle = (currentPoint.point[1] - prevPoint.point[1]) / (currentPoint.point[0] - prevPoint.point[0]);
                            var rot = Math.atan(tanAngle) * 180 / Math.PI;
                            if (currentPoint.point[0] < prevPoint.point[0]) {
                                rot += 180;
                            }
                            matrixHelper.rotate(rot*Math.PI/180);
                        }
                        matrixHelper.translate(0,(renderedData.m.a[1]*yOff/100 + yPos));
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
                offf = this.textSpans[i].an/2 - this.textSpans[i].add;
            }else{
                matrixHelper.translate(xPos,yPos);
                offf = this.textSpans[i].an/2 - this.textSpans[i].add;
                matrixHelper.translate(offf,0);

                matrixHelper.translate(renderedData.m.a[0]*this.textSpans[i].an/200, renderedData.m.a[1]*yOff/100);
            }

            for(j=0;j<jLen;j+=1){
                animatorProps = renderedData.a[j].a;
                if ('p' in animatorProps && 's' in ranges[j]) {
                    mult = this.getMult(this.textSpans[i].anIndexes[j],ranges[j].s,ranges[j].e,this.data.t.a[j].s.sh);

                    if('m' in this.data.t.p) {
                        matrixHelper.translate(0, animatorProps.p[1] * mult);
                    }else{
                        matrixHelper.translate(animatorProps.p[0] * mult, animatorProps.p[1] * mult);
                    }
                }
            }
            if(this.strokeWidthAnim) {
                sw = this.data.t.d.sw;
            }
            if(this.strokeColorAnim) {
                sc = [this.data.t.d.sc[0], this.data.t.d.sc[1], this.data.t.d.sc[2]];
            }
            if(this.fillColorAnim) {
                fc = [this.data.t.d.fc[0], this.data.t.d.fc[1], this.data.t.d.fc[2]];
            }
            for(j=0;j<jLen;j+=1) {
                animatorProps = renderedData.a[j].a;
                mult = this.getMult(this.textSpans[i].anIndexes[j],ranges[j].s,ranges[j].e,this.data.t.a[j].s.sh);
                if ('r' in animatorProps && 's' in ranges[j]) {
                    matrixHelper.rotate(animatorProps.r*mult*Math.PI/180);
                }
                if ('o' in animatorProps && 's' in ranges[j]) {
                    this.textSpans[i].elem.setAttribute('opacity',(1+((animatorProps.o/100-1)*mult)));
                    this.textSpans[i].shape.setAttribute('opacity',(1+((animatorProps.o/100-1)*mult)));
                    elemOpacity = (1+((animatorProps.o/100-1)*mult));
                }
                if (this.strokeWidthAnim && 'sw' in animatorProps && 's' in ranges[j]) {
                    sw += animatorProps.sw*mult;
                }
                if (this.strokeColorAnim && 'sc' in animatorProps && 's' in ranges[j]) {
                    for(k=0;k<3;k+=1){
                        sc[k] = Math.round(sc[k] + (animatorProps.sc[k] - sc[k])*mult);
                    }
                }
                if (this.fillColorAnim && 'fc' in animatorProps && 's' in ranges[j]) {
                    for(k=0;k<3;k+=1){
                        fc[k] = Math.round(fc[k] + (animatorProps.fc[k] - fc[k])*mult);
                    }
                }
                if ('t' in animatorProps && 's' in ranges[j]) {
                    if('m' in this.data.t.p) {
                        currentLength += animatorProps.t*mult;
                    }else{
                        xPos += animatorProps.t*mult;
                    }
                }
            }
            if(this.strokeWidthAnim){
                letterValue.sw = sw < 0 ? 0 : sw;
                this.textSpans[i].elem.setAttribute('stroke-width',letterValue.sw);
                this.textSpans[i].shape.setAttribute('stroke-width',letterValue.sw);
            }
            if(this.strokeColorAnim){
                letterValue.sc = 'rgb('+sc[0]+','+sc[1]+','+sc[2]+')';
                this.textSpans[i].elem.setAttribute('stroke',letterValue.sc);
                this.textSpans[i].shape.setAttribute('stroke',letterValue.sc);
            }
            if(this.fillColorAnim){
                letterValue.fc = 'rgb('+fc[0]+','+fc[1]+','+fc[2]+')';
                this.textSpans[i].elem.setAttribute('fill',letterValue.fc);
                this.textSpans[i].shape.setAttribute('fill',letterValue.fc);
            }
            for(j=0;j<jLen;j+=1){
                animatorProps = renderedData.a[j].a;
                if ('s' in animatorProps && 's' in ranges[j]) {
                    mult = this.getMult(this.textSpans[i].anIndexes[j],ranges[j].s,ranges[j].e,this.data.t.a[j].s.sh);
                    matrixHelper.scale(1+((animatorProps.s[0]/100-1)*mult),1+((animatorProps.s[1]/100-1)*mult));
                }
            }
            for(j=0;j<jLen;j+=1){
                animatorProps = renderedData.a[j].a;
                if ('a' in animatorProps && 's' in ranges[j]) {
                    mult = this.getMult(this.textSpans[i].anIndexes[j],ranges[j].s,ranges[j].e,this.data.t.a[j].s.sh);
                    matrixHelper.translate(-animatorProps.a[0]*mult, -animatorProps.a[1]*mult);
                }
            }

            if('m' in this.data.t.p) {
                matrixHelper.translate(-renderedData.m.a[0]*this.textSpans[i].an/200, -renderedData.m.a[1]*yOff/100);
                currentLength -= renderedData.m.a[0]*this.textSpans[i].an/200;
                if(this.textSpans[i+1] && ind !== this.textSpans[i+1].ind){
                    currentLength += this.textSpans[i].an / 2;
                }
                matrixHelper.translate(-offf,0);
            }else{
                matrixHelper.translate(-offf,0);
                matrixHelper.translate(-renderedData.m.a[0]*this.textSpans[i].an/200,-renderedData.m.a[1]*yOff/100);
                xPos += this.textSpans[i].l;
            }
            letterValue.m = matrixHelper.toCSS();
            letterValue.o = elemOpacity;
            lettersValue.push(letterValue);
            this.textSpans[i].elem.setAttribute('transform',letterValue.m);
            this.textSpans[i].shape.setAttribute('transform',letterValue.m);
        }
    }
    this.renderedLetters[num] = lettersValue;
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
};

ITextElement.prototype.destroy = function(){
    this.parent.destroy.call();
    this.textElem =  null;
};
