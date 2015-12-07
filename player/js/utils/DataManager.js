function dataFunctionManager(){

    //var tSpanHelper = document.createElementNS(svgNS,'text');
    var tCanvasHelper = document.createElement('canvas').getContext('2d');
    var matrixHelper = new Matrix();

    function completeLayers(layers, comps, fontManager){
        var layerData;
        var animArray, lastFrame;
        var i, len = layers.length;
        var j, jLen, k, kLen;
        for(i=0;i<len;i+=1){
            layerData = layers[i];
            if(!('ks' in layerData) || layerData.completed){
                continue;
            }
            layerData.completed = true;
            if(layerData.tt){
                layers[i-1].td = layerData.tt;
            }
            animArray = [];
            lastFrame = -1;
            if(layerData.hasMask){
                var maskProps = layerData.masksProperties;
                jLen = maskProps.length;
                for(j=0;j<jLen;j+=1){
                    if(maskProps[j].pt.k.i){
                        convertPathsToAbsoluteValues(maskProps[j].pt.k);
                    }else{
                        kLen = maskProps[j].pt.k.length;
                        for(k=0;k<kLen;k+=1){
                            if(maskProps[j].pt.k[k].s){
                                convertPathsToAbsoluteValues(maskProps[j].pt.k[k].s[0]);
                            }
                            if(maskProps[j].pt.k[k].e){
                                convertPathsToAbsoluteValues(maskProps[j].pt.k[k].e[0]);
                            }
                        }
                    }
                }
            }
            if(layerData.ty===0){
                layerData.layers = findCompLayers(layerData.refId, comps);
                completeLayers(layerData.layers,comps, fontManager);
            }else if(layerData.ty === 4){
                layerData.bounds = {
                    t:99999,
                    r:-99999,
                    b:-99999,
                    l:99999
                };
                completeShapes(layerData.shapes, false,layerData.bounds, [],[],{data:{st:0},globalData:{frameId:0},comp:{renderedFrame:-1}});
            }else if(layerData.ty == 5){
                completeText(layerData, fontManager);
            }
        }
    }

    function findCompLayers(id,comps){
        var i = 0, len = comps.length;
        while(i<len){
            if(comps[i].id === id){
                return JSON.parse(JSON.stringify(comps[i].layers));
            }
            i += 1;
        }
    }

    function getPoint(p1,p2,p3,p4,t){
        var a = p1[0],b = p2[0],c=p3[0],d=p4[0];
        var x = a*Math.pow(1-t,3)+b*3*Math.pow(1-t,2)*t+c*3*(1-t)*Math.pow(t,2)+d*Math.pow(t,3);
        a = p1[1];
        b = p2[1];
        c = p3[1];
        d = p4[1];
        var y = a*Math.pow(1-t,3)+b*3*Math.pow(1-t,2)*t+c*3*(1-t)*Math.pow(t,2)+d*Math.pow(t,3);
        return [x,y];
    }

    function getTPos(p1,p2,p3,p4, arr){
        var i;
        for(i=0;i<2;i+=1){
            var c1 = p1[i], c2 = p2[i], c3 = p3[i], c4=p4[i];
            var a = 3*(-c1 + 3*c2 - 3*c3 + c4);
            var b = 6*(c1 - 2*c2 + c3);
            var c = 3*(c2 - c1);
            var toSquareTerm = Math.pow(b,2)-4*a*c;
            if(toSquareTerm >= 0){
                var t1 = (-b + Math.sqrt(toSquareTerm))/(2*a);
                var t2 = (-b - Math.sqrt(toSquareTerm))/(2*a);
                if(t1>= 0 && t1 <= 1){
                    arr.push(getPoint(p1,p2,p3,p4,t1));
                }
                if(t2>= 0 && t2 <= 1){
                    arr.push(getPoint(p1,p2,p3,p4,t2));
                }
            }
        }
    }

    function getBoundingBox(p1,p2,p3,p4,bounds){
        var pts = [p1,p4];
        getTPos(p1,p2,p3,p4,pts);

        var minX = bounds.l,minY = bounds.t,maxX = bounds.r,maxY = bounds.b,pt;
        var i, len = pts.length;
        for(i=1;i<len;i+=1){
            pt = pts[i];
            if(minX > pt[0]){
                minX = pt[0];
            }
            if(maxX < pt[0]){
                maxX = pt[0];
            }
            if(minY > pt[1]){
                minY = pt[1];
            }
            if( maxY < pt[1]){
                maxY = pt[1];
            }
        }
        bounds.l = minX;
        bounds.t = minY;
        bounds.r = maxX;
        bounds.b = maxY;
    }

    function setBounds(shapeData,bounds,matrices,strokes,data){
        var arr = [];
        var i, len = matrices.length;
        for(i=0;i<len;i+=1){
            matrices[i].getKeys(arr);
        }
        var shapeProp;
        if(shapeData.ty === 'sh'){
            shapeProp = PropertyFactory.getShapeProp(data,shapeData,4,[], [], this.comp);
        }else if(shapeData.ty === 'rc'){
            shapeProp = PropertyFactory.getShapeProp(data,shapeData,5,[], [], this.comp);
        }else if(shapeData.ty === 'el'){
            shapeProp = PropertyFactory.getShapeProp(data,shapeData,6,[], [], this.comp);
        }
        shapeProp.getKeys(arr);
        var j, jLen = arr.length, matr = new Matrix();
        for(j=0;j<jLen;j+=1){
            data.globalData.frameId += 1;
            data.comp.renderedFrame = arr[j];
            matr.reset();
            for(i=0;i<len;i+=1){
                matrices[i].getValue();
                matr.transform(matrices[i].v.props[0],matrices[i].v.props[1],matrices[i].v.props[2],matrices[i].v.props[3],matrices[i].v.props[4],matrices[i].v.props[5]);
            }
            if(shapeProp.k){
                shapeProp.getValue();
            }
            var points = shapeProp.v;
            var k, kLen = points.v.length;
            for(k=0;k<kLen-1;k+=1){
                getBoundingBox(matr.applyToPointArray(points.v[k][0],points.v[k][1]),matr.applyToPointArray(points.o[k][0],points.o[k][1]),matr.applyToPointArray(points.i[k+1][0],points.i[k+1][1]),matr.applyToPointArray(points.v[k+1][0],points.v[k+1][1]),bounds);
            }
            getBoundingBox(matr.applyToPointArray(points.v[k][0],points.v[k][1]),matr.applyToPointArray(points.o[k][0],points.o[k][1]),matr.applyToPointArray(points.i[0][0],points.i[0][1]),matr.applyToPointArray(points.v[0][0],points.v[0][1]),bounds);
        }
        len = strokes.length;
        arr = [];
        for(i=0;i<len;i+=1){
            strokes[i].getKeys(arr);
        }
        jLen = arr.length;
        var maxStroke = 0;
        for(j=0;j<jLen;j+=1){
            data.globalData.frameId += 1;
            data.comp.renderedFrame = arr[j];
            for(i=0;i<len;i+=1){
                if(strokes[i].k){
                    strokes[i].getValue();
                }
                maxStroke = strokes[i].v > maxStroke ? strokes[i].v :  maxStroke;
            }
        }
        if(maxStroke){
            bounds.t -= maxStroke/2;
            bounds.l -= maxStroke/2;
            bounds.b += maxStroke/2;
            bounds.r += maxStroke/2;
        }
        bounds.t = Math.floor(bounds.t);
        bounds.l = Math.floor(bounds.l);
        bounds.b = Math.ceil(bounds.b);
        bounds.r = Math.ceil(bounds.r);
    }

    function completeShapes(arr,trimmedFlag,bounds, matrices,strokes, data){
        var i, len = arr.length;
        var j, jLen;
        var matr = [];
        var strk = [];
        matr = matr.concat(matrices);
        strk = strk.concat(strokes);
        var isTrimmed = trimmedFlag ? trimmedFlag : false;
        for(i=len-1;i>=0;i-=1){
            if(arr[i].ty == 'tm'){
                isTrimmed = true;
            }
            if(arr[i].ty == 'sh'){
                arr[i].trimmed = isTrimmed;
                if(arr[i].ks.k.i){
                    convertPathsToAbsoluteValues(arr[i].ks.k);
                }else{
                    jLen = arr[i].ks.k.length;
                    for(j=0;j<jLen;j+=1){
                        if(arr[i].ks.k[j].s){
                            convertPathsToAbsoluteValues(arr[i].ks.k[j].s[0]);
                        }
                        if(arr[i].ks.k[j].e){
                            convertPathsToAbsoluteValues(arr[i].ks.k[j].e[0]);
                        }
                    }
                }
                setBounds(arr[i],bounds,matr,strk, data);
            }else if(arr[i].ty == 'gr'){
                completeShapes(arr[i].it,isTrimmed, bounds, matr,strk, data);
            }else if(arr[i].ty == 'tr'){
                matr.push(PropertyFactory.getProp(data,arr[i],2,0,[]));
            }else if(arr[i].ty == 'st'){
                strk.push(PropertyFactory.getProp(data,arr[i].w,0,0,[]));
            }else if(arr[i].ty == 'el' || arr[i].ty == 'rc'){
                setBounds(arr[i],bounds,matr,strk, data);
            }
        }
    }

    function convertPathsToAbsoluteValues(path){
        var i, len = path.i.length;
        for(i=0;i<len;i+=1){
            path.i[i][0] += path.v[i][0];
            path.i[i][1] += path.v[i][1];
            path.o[i][0] += path.v[i][0];
            path.o[i][1] += path.v[i][1];
        }
    }

    function completeData(animationData, fontManager){
        completeLayers(animationData.layers, animationData.assets, fontManager);
    }

    function completeText(data, fontManager){
        var letters = [];
        var documentData = data.t.d;
        var i, len;
        var newLineFlag, index = 0, val;
        var anchorGrouping = data.t.m.g;
        var currentSize = 0, currentPos = 0, currentLine = 0, lineWidths = [];
        var lineWidth = 0;
        var maxLineWidth = 0;
        var j, jLen;
        var fontData = fontManager.getFontByName(documentData.f);
        var charData, cLength;
        var styles = fontData.fStyle.split(' ');

        var fWeight = 'normal', fStyle = 'normal';
        len = styles.length;
        for(i=0;i<len;i+=1){
            if (styles[i].toLowerCase() === 'italic') {
                fStyle = 'italic';
            }else if (styles[i].toLowerCase() === 'bold') {
                fWeight = '700';
            } else if (styles[i].toLowerCase() === 'black') {
                fWeight = '900';
            } else if (styles[i].toLowerCase() === 'medium') {
                fWeight = '500';
            } else if (styles[i].toLowerCase() === 'regular' || styles[i].toLowerCase() === 'normal') {
                fWeight = '400';
            } else if (styles[i].toLowerCase() === 'light' || styles[i].toLowerCase() === 'thin') {
                fWeight = '200';
            }
        }
        documentData.fWeight = fWeight;
        documentData.fStyle = fStyle;
        len = documentData.t.length;
        for (i = 0;i < len ;i += 1) {
            newLineFlag = false;
            if(documentData.t.charAt(i) === ' '){
                val = '\u00A0';
            }else if(documentData.t.charCodeAt(i) === 13){
                lineWidths.push(lineWidth);
                maxLineWidth = lineWidth > maxLineWidth ? lineWidth : maxLineWidth;
                lineWidth = 0;
                val = '';
                newLineFlag = true;
                currentLine += 1;
            }else{
                val = documentData.t.charAt(i);
            }
            if(fontManager.chars){
                charData = fontManager.getCharData(documentData.t.charAt(i), fontData.fStyle, fontManager.getFontByName(documentData.f).fFamily);
                cLength = newLineFlag ? 0 : charData.w*documentData.s/100;
            }else{
                tCanvasHelper.font = documentData.s + 'px '+ fontManager.getFontByName(documentData.f).fFamily;
                cLength = tCanvasHelper.measureText(val).width;
            }
            //
            lineWidth += cLength;
            letters.push({l:cLength,an:cLength,add:currentSize,n:newLineFlag, anIndexes:[], val: val, line: currentLine});
            if(anchorGrouping == 2){
                currentSize += cLength;
                if(val == '' || val == '\u00A0' || i == len - 1){
                    if(val == '' || val == '\u00A0'){
                        currentSize -= cLength;
                    }
                    while(currentPos<=i){
                        letters[currentPos].an = currentSize;
                        letters[currentPos].ind = index;
                        letters[currentPos].extra = cLength;
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
                        letters[currentPos].an = currentSize;
                        letters[currentPos].ind = index;
                        letters[currentPos].extra = cLength;
                        currentPos += 1;
                    }
                    currentSize = 0;
                    index += 1;
                }
            }else{
                letters[index].ind = index;
                letters[index].extra = 0;
                index += 1;
            }
        }
        documentData.l = letters;
        maxLineWidth = lineWidth > maxLineWidth ? lineWidth : maxLineWidth;
        lineWidths.push(lineWidth);
        documentData.boxWidth = maxLineWidth;
        documentData.lineWidths = lineWidths;
        switch(documentData.j){
            case 1:
                data.t.d.justifyOffset = - documentData.boxWidth;
                break;
            case 2:
                data.t.d.justifyOffset = - documentData.boxWidth/2;
                break;
            default:
                data.t.d.justifyOffset = 0;
        }

        var animators = data.t.a;
        jLen = animators.length;
        var based, ind, indexes = [];
        for(j=0;j<jLen;j+=1){
            if(animators[j].a.sc){
                documentData.strokeColorAnim = true;
            }
            if(animators[j].a.sw){
                documentData.strokeWidthAnim = true;
            }
            if(animators[j].a.fc){
                documentData.fillColorAnim = true;
            }
            ind = 0;
            based = animators[j].s.b;
            for(i=0;i<len;i+=1){
                letters[i].anIndexes[j] = ind;
                if((based == 1 && letters[i].val != '') || (based == 2 && letters[i].val != '' && letters[i].val != '\u00A0') || (based == 3 && (letters[i].n || letters[i].val == '\u00A0' || i == len - 1)) || (based == 4 && (letters[i].n || i == len - 1))){
                    if(animators[j].s.rn === 1){
                        indexes.push(ind);
                    }
                    ind += 1;
                }
            }
            data.t.a[j].s.totalChars = ind;
            var currentInd = -1, newInd;
            if(animators[j].s.rn === 1){
                for(i = 0; i < len; i += 1){
                    if(currentInd != letters[i].anIndexes[j]){
                        currentInd = letters[i].anIndexes[j];
                        newInd = indexes.splice(Math.floor(Math.random()*indexes.length),1)[0];
                    }
                    letters[i].anIndexes[j] = newInd;
                }
            }
        }
        if(jLen === 0 && !('m' in data.t.p)){
            data.singleShape = true;
        }
        documentData.yOffset = documentData.s*1.2;
    }

















    function iterateText(item,offsettedFrameNum,renderType){
        var renderedData = item.renderedData[offsettedFrameNum];
        renderedData.t = {
        };
        if(item.t.p && 'm' in item.t.p) {
            renderedData.t.p = [];
            getInterpolatedValue(item.t.p.f,offsettedFrameNum, item.st,renderedData.t.p,0,1);
        }
        renderedData.t.m = {
            a: getInterpolatedValue(item.t.m.a,offsettedFrameNum, item.st)
        };
    }

    var moduleOb = {};
    moduleOb.completeData = completeData;

    return moduleOb;
}

var dataManager = dataFunctionManager();