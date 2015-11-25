function ITextElement(data, animationItem,parentContainer,globalData){
}
ITextElement.prototype.init = function(){
    this.parent.init.call(this);
    var data = this.data;
    this.renderedLetters = [];
    this.viewData = {
        m:{
            a: PropertyFactory.getProp(this,data.t.m.a,1,0,this.dynamicProperties)
        }
    };
    var textData = this.data.t;
    if(textData.a.length){
        this.viewData.a = new Array(textData.a.length);
        var i, len = textData.a.length, animatorData, animatorProps;
        for(i=0;i<len;i+=1){
            animatorProps = textData.a[i];
            animatorData = {
                a: {},
                s: {}
            };
            if('r' in animatorProps.a) {
                animatorData.a.r = PropertyFactory.getProp(this,animatorProps.a.r,0,degToRads,this.dynamicProperties);
            }
            if('s' in animatorProps.a) {
                animatorData.a.s = PropertyFactory.getProp(this,animatorProps.a.s,1,0.01,this.dynamicProperties);
            }
            if('a' in animatorProps.a) {
                animatorData.a.a = PropertyFactory.getProp(this,animatorProps.a.a,1,0,this.dynamicProperties);
            }
            if('o' in animatorProps.a) {
                animatorData.a.o = PropertyFactory.getProp(this,animatorProps.a.o,0,0.01,this.dynamicProperties);
            }
            if('p' in animatorProps.a) {
                animatorData.a.p = PropertyFactory.getProp(this,animatorProps.a.p,1,0,this.dynamicProperties);
            }
            if('sw' in animatorProps.a) {
                animatorData.a.sw = PropertyFactory.getProp(this,animatorProps.a.sw,0,0,this.dynamicProperties);
            }
            if('sc' in animatorProps.a) {
                animatorData.a.sc = PropertyFactory.getProp(this,animatorProps.a.sc,1,0,this.dynamicProperties);
            }
            if('fc' in animatorProps.a) {
                animatorData.a.fc = PropertyFactory.getProp(this,animatorProps.a.fc,1,0,this.dynamicProperties);
            }
            if('t' in animatorProps.a) {
                animatorData.a.t = PropertyFactory.getProp(this,animatorProps.a.t,0,0,this.dynamicProperties);
            }
            if('s' in animatorProps.s) {
                animatorData.s.s = PropertyFactory.getProp(this,animatorProps.s.s,0,0,this.dynamicProperties);
            }else{
                animatorData.s.s = {v:0};
            }

            if('e' in animatorProps.s) {
                animatorData.s.e = PropertyFactory.getProp(this,animatorProps.s.e,0,0,this.dynamicProperties);
            }
            if('o' in animatorProps.s) {
                animatorData.s.o = PropertyFactory.getProp(this,animatorProps.s.o,0,0,this.dynamicProperties);
            }else{
                animatorData.s.o = {v:0};
            }
            if('xe' in animatorProps.s) {
                animatorData.s.xe = PropertyFactory.getProp(this,animatorProps.s.xe,0,0,this.dynamicProperties);
            }else{
                animatorData.s.xe = {v:0};
            }
            if('ne' in animatorProps.s) {
                animatorData.s.ne = PropertyFactory.getProp(this,animatorProps.s.ne,0,0,this.dynamicProperties);
            }else{
                animatorData.s.ne = {v:0};
            }
            this.viewData.a[i] = animatorData;
        }
    }else{
        this.viewData.a = [];
    }
    if(textData.p && 'm' in textData.p){
        this.viewData.p = {
            f: PropertyFactory.getProp(this,textData.p.f,0,0,this.dynamicProperties),
            l: PropertyFactory.getProp(this,textData.p.l,0,0,this.dynamicProperties),
            m: this.maskManager.getMaskProperty(textData.p.m)
        }

    }
};


ITextElement.prototype.getMeasures = function(){

    var matrixHelper = this.mHelper;
    var renderType = this.renderType;
    var data = this.data;
    var xPos,yPos;
    var i, len;
    var documentData = data.t.d;
    var letters = documentData.l;
    if('m' in data.t.p) {
        var mask = this.viewData.p.m;
        if(!this.viewData.p.n || this.viewData.p.mdf){
            var paths = mask.v;
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
            if (mask.closed) {
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
            this.viewData.p.pi = pathInfo;
        }
        var pathInfo = this.viewData.p.pi;

        var currentLength = this.viewData.p.f.v, segmentInd = 0, pointInd = 1, currentPoint, prevPoint, points;
        var segmentLength = 0, flag = true;
        var segments = pathInfo.segments;
        if (currentLength < 0 && mask.closed) {
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


    len = letters.length;
    xPos = 0;
    yPos = 0;
    var yOff = data.t.d.s*1.2*.714;
    var firstLine = true;
    var renderedData = this.viewData, animatorProps;
    var j, jLen;
    var lettersValue = new Array(len), letterValue, lettersChangedFlag = false;

    jLen = renderedData.a.length;
    var ranges = [], totalChars, divisor;
    var lastLetters = data._letters, lastLetter;
    for(j=0;j<jLen;j+=1){
        totalChars = data.t.a[j].totalChars;
        divisor = data.t.a[j].s.r === 2 ? 1 : 100/totalChars;
        if(!('e' in renderedData.a[j].s)){
            renderedData.a[j].s.e = {v:data.t.a[j].s.r === 2 ? totalChars : 100};
        }
        var o = renderedData.a[j].s.o.v/divisor;
        if(o === 0 && renderedData.a[j].s.s.v === 0 && renderedData.a[j].s.e.v === divisor){

        }
        var s = renderedData.a[j].s.s.v/divisor + o;
        var e = (renderedData.a[j].s.e.v/divisor) + o;
        if(s>e){
            var _s = s;
            s = e;
            e = _s;
        }
        ranges.push({s:s,e:e,ne:renderedData.a[j].s.ne.v,xe:renderedData.a[j].s.xe.v});
    }

    var mult, ind = -1, offf, xPathPos, yPathPos;
    var initPathPos = currentLength,initSegmentInd = segmentInd, initPointInd = pointInd;
    var elemOpacity;
    var sc,sw,fc,k;
    var lineLength = 0;
    var letterSw,letterSc,letterFc,letterM,letterP,letterO;

    for( i = 0; i < len; i += 1) {
        matrixHelper.reset();
        switch(documentData.j){
            case 1:
                matrixHelper.translate(documentData.justifyOffset + (documentData.boxWidth - documentData.lineWidths[letters[i].line]),0);
                break;
            case 2:
                matrixHelper.translate(documentData.justifyOffset + (documentData.boxWidth - documentData.lineWidths[letters[i].line])/2,0);
                break;
        }
        elemOpacity = 1;
        if(letters[i].n) {
            xPos = 0;
            yPos += documentData.yOffset;
            yPos += firstLine ? 1 : 0;
            currentLength = initPathPos ;
            firstLine = false;
            lineLength = 0;
            if('m' in data.t.p) {
                segmentInd = initSegmentInd;
                pointInd = initPointInd;
                points = segments[segmentInd].bezierData.points;
                prevPoint = points[pointInd - 1];
                currentPoint = points[pointInd];
                partialLength = currentPoint.partialLength;
                segmentLength = 0;
            }
            lettersValue[i] = this.emptyProp;
        }else{
            if('m' in data.t.p) {
                if(ind !== letters[i].ind){
                    if(letters[ind]){
                        currentLength += letters[ind].extra;
                    }
                    currentLength += letters[i].an/2;
                    ind = letters[i].ind;
                }
                currentLength += renderedData.m.a.v[0]*letters[i].an/200;
                var animatorOffset = 0;
                for(j=0;j<jLen;j+=1){
                    animatorProps = renderedData.a[j].a;
                    if ('p' in animatorProps && 's' in ranges[j]) {
                        mult = this.getMult(letters[i].anIndexes[j],ranges[j].s,ranges[j].e,ranges[j].ne,ranges[j].xe,data.t.a[j].s.sh);

                        animatorOffset += animatorProps.p.v[0] * mult;
                    }
                }
                flag = true;
                while (flag) {
                    if (segmentLength + partialLength >= currentLength + animatorOffset || !points) {
                        perc = (currentLength + animatorOffset - segmentLength) / currentPoint.partialLength;
                        xPathPos = prevPoint.point[0] + (currentPoint.point[0] - prevPoint.point[0]) * perc;
                        yPathPos = prevPoint.point[1] + (currentPoint.point[1] - prevPoint.point[1]) * perc;
                        matrixHelper.translate(xPathPos,yPathPos);
                        if (data.t.p.p) {
                            tanAngle = (currentPoint.point[1] - prevPoint.point[1]) / (currentPoint.point[0] - prevPoint.point[0]);
                            var rot = Math.atan(tanAngle) * 180 / Math.PI;
                            if (currentPoint.point[0] < prevPoint.point[0]) {
                                rot += 180;
                            }
                            matrixHelper.rotate(rot*Math.PI/180);
                        }
                        matrixHelper.translate(0,(renderedData.m.a.v[1]*yOff/100 + yPos));
                        flag = false;
                    } else if (points) {
                        segmentLength += currentPoint.partialLength;
                        pointInd += 1;
                        if (pointInd >= points.length) {
                            pointInd = 0;
                            segmentInd += 1;
                            if (!segments[segmentInd]) {
                                if (mask.closed) {
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
                offf = letters[i].an/2 - letters[i].add;
            }else{
                matrixHelper.translate(xPos,yPos);
                offf = letters[i].an/2 - letters[i].add;
                matrixHelper.translate(offf,0);

                matrixHelper.translate(renderedData.m.a.v[0]*letters[i].an/200, renderedData.m.a.v[1]*yOff/100);
            }

            lineLength += letters[i].l/2;
            for(j=0;j<jLen;j+=1){
                animatorProps = renderedData.a[j].a;
                if ('t' in animatorProps && 's' in ranges[j]) {
                    mult = this.getMult(letters[i].anIndexes[j],ranges[j].s,ranges[j].e,ranges[j].ne,ranges[j].xe,data.t.a[j].s.sh);
                    if('m' in data.t.p) {
                        currentLength += animatorProps.t*mult;
                    }else{
                        xPos += animatorProps.t.v*mult;
                    }
                }
            }
            lineLength += letters[i].l/2;

            for(j=0;j<jLen;j+=1){
                animatorProps = renderedData.a[j].a;
                if ('p' in animatorProps && 's' in ranges[j]) {
                    mult = this.getMult(letters[i].anIndexes[j],ranges[j].s,ranges[j].e,ranges[j].ne,ranges[j].xe,data.t.a[j].s.sh);
                    if('m' in data.t.p) {
                        matrixHelper.translate(0, animatorProps.p.v[1] * mult);
                    }else{
                        matrixHelper.translate(animatorProps.p.v[0] * mult, animatorProps.p.v[1] * mult);
                    }
                }
            }
            if(documentData.strokeWidthAnim) {
                sw = data.t.d.sw || 0;
            }
            if(documentData.strokeColorAnim) {
                if(data.t.d.sc){
                    sc = [data.t.d.sc[0], data.t.d.sc[1], data.t.d.sc[2]];
                }else{
                    sc = [0,0,0];
                }
            }
            if(documentData.fillColorAnim) {
                fc = [data.t.d.fc[0], data.t.d.fc[1], data.t.d.fc[2]];
            }
            for(j=0;j<jLen;j+=1) {
                animatorProps = renderedData.a[j].a;
                mult = this.getMult(letters[i].anIndexes[j],ranges[j].s,ranges[j].e,ranges[j].ne,ranges[j].xe,data.t.a[j].s.sh);
                if ('r' in animatorProps && 's' in ranges[j]) {
                    matrixHelper.rotate(animatorProps.r.v*mult);
                }
                if ('o' in animatorProps && 's' in ranges[j]) {
                    elemOpacity += ((animatorProps.o.v)*mult - elemOpacity)*mult;
                }
                if (documentData.strokeWidthAnim && 'sw' in animatorProps && 's' in ranges[j]) {
                    sw += animatorProps.sw.v*mult;
                }
                if (documentData.strokeColorAnim && 'sc' in animatorProps && 's' in ranges[j]) {
                    for(k=0;k<3;k+=1){
                        sc[k] = Math.round(sc[k] + (animatorProps.sc.v[k] - sc[k])*mult);
                    }
                }
                if (documentData.fillColorAnim && 'fc' in animatorProps && 's' in ranges[j]) {
                    for(k=0;k<3;k+=1){
                        fc[k] = Math.round(fc[k] + (animatorProps.fc.v[k] - fc[k])*mult);
                    }
                }
            }
            if(documentData.strokeWidthAnim){
                letterSw = sw < 0 ? 0 : sw;
            }
            if(documentData.strokeColorAnim){
                letterSc = 'rgb('+sc[0]+','+sc[1]+','+sc[2]+')';
            }
            if(documentData.fillColorAnim){
                letterFc = 'rgb('+fc[0]+','+fc[1]+','+fc[2]+')';
            }
            for(j=0;j<jLen;j+=1){
                animatorProps = renderedData.a[j].a;
                if ('s' in animatorProps && 's' in ranges[j]) {
                    mult = this.getMult(letters[i].anIndexes[j],ranges[j].s,ranges[j].e,ranges[j].ne,ranges[j].xe,data.t.a[j].s.sh);
                    matrixHelper.scale(1+((animatorProps.s.v[0]-1)*mult),1+((animatorProps.s.v[1]-1)*mult));
                }
            }
            for(j=0;j<jLen;j+=1){
                animatorProps = renderedData.a[j].a;
                if ('a' in animatorProps && 's' in ranges[j]) {
                    mult = this.getMult(letters[i].anIndexes[j],ranges[j].s,ranges[j].e,ranges[j].ne,ranges[j].xe,data.t.a[j].s.sh);
                    matrixHelper.translate(-animatorProps.a.v[0]*mult, -animatorProps.a.v[1]*mult);
                }
            }

            if('m' in data.t.p) {
                matrixHelper.translate(-renderedData.m.a.v[0]*letters[i].an/200, -renderedData.m.a.v[1]*yOff/100);
                currentLength -= renderedData.m.a.v[0]*letters[i].an/200;
                if(letters[i+1] && ind !== letters[i+1].ind){
                    currentLength += letters[i].an / 2;
                    currentLength += documentData.tr/1000*data.t.d.s;
                }
                matrixHelper.translate(-offf,0);
            }else{
                matrixHelper.translate(-offf,0);
                matrixHelper.translate(-renderedData.m.a.v[0]*letters[i].an/200,-renderedData.m.a.v[1]*yOff/100);
                xPos += letters[i].l + documentData.tr/1000*data.t.d.s;
            }
            if(renderType === 'svg'){
                letterM = matrixHelper.toCSS();
            }else{
                letterP = [matrixHelper.props[0],matrixHelper.props[1],matrixHelper.props[2],matrixHelper.props[3],matrixHelper.props[4],matrixHelper.props[5]];
            }
            letterO = elemOpacity;
            if(lastLetters){
                lastLetter = lastLetters[i];
                if(lastLetter.o !== letterO || lastLetter.sw !== letterSw || lastLetter.sc !== letterSc || lastLetter.fc !== letterFc){
                    lettersChangedFlag = true;
                    letterValue = new LetterProps(letterO,letterSw,letterSc,letterFc,letterM,letterP);
                }else{
                    if(renderType === 'svg' && lastLetter.m !== letterM){
                        lettersChangedFlag = true;
                        letterValue = new LetterProps(letterO,letterSw,letterSc,letterFc,letterM);
                    }else if(renderType !== 'svg' && (lastLetter.props[1] !== matrixHelper.props[1] || lastLetter.props[2] !== matrixHelper.props[2] || lastLetter.props[3] !== matrixHelper.props[3] || lastLetter.props[4] !== matrixHelper.props[4] || lastLetter.props[5] !== matrixHelper.props[5])){
                        lettersChangedFlag = true;
                        letterValue = new LetterProps(letterO,letterSw,letterSc,letterFc,null,[matrixHelper.props[0],matrixHelper.props[1],matrixHelper.props[2],matrixHelper.props[3],matrixHelper.props[4],matrixHelper.props[5]]);
                    }else{
                        letterValue = lastLetter;
                    }
                }

            }else{
                lettersChangedFlag = true;
                letterValue = new LetterProps(letterO,letterSw,letterSc,letterFc,letterM,letterP);
            }
            lettersValue[i] = letterValue;
        }
    }
    if(lettersChangedFlag){
        this.renderedLetters = lettersValue;
    }
};

ITextElement.prototype.getMult = function(ind,s,e,ne,xe,type){
    var easer = bez.getEasingCurve(ne/100,0,1-xe/100,1);
    var mult = 0;
    if(type == 2){
        if(e === s){
            mult = ind >= e ? 1 : 0;
        }else{
            mult = Math.max(0,Math.min(0.5/(e-s) + (ind-s)/(e-s),1));
        }
        mult = easer('',mult,0,1,1);
    }else if(type == 3){
        if(e === s){
            mult = ind >= e ? 0 : 1;
        }else{
            mult = 1 - Math.max(0,Math.min(0.5/(e-s) + (ind-s)/(e-s),1));
        }

        mult = easer('',mult,0,1,1);
    }else if(type == 4){
        if(e === s){
            mult = ind >= e ? 0 : 1;
        }else{
            mult = Math.max(0,Math.min(0.5/(e-s) + (ind-s)/(e-s),1));
            if(mult<.5){
                mult *= 2;
            }else{
                mult = 1 - mult;
            }
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

ITextElement.prototype.emptyProp = new LetterProps();
