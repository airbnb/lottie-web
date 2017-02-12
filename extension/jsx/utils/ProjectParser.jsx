var bm_ProjectHelper = (function(){

    var fileString = '';

    var ob = {};
    ob.init = init;
    ob.getGradientData = getGradientData;
    ob.end = end;

    function init(){
        fileString = '';
    }

    function end(){
        fileString = '';
    }

    function getProjectData(){
        var proj = app.project;
        var ff = proj.file;
        var demoFile = new File(ff.absoluteURI);
        demoFile.open('r', 'TEXT', '????');
        fileString = demoFile.read(demoFile.length);
    }

    function getGradientData(shapeNavigation, numKeys){
        if(!fileString){
            getProjectData();
        }
        var hasNoGradColorData = false;
        if(fileString.indexOf('ADBE Vector Grad Colors') === -1) {
            hasNoGradColorData = true;
        }
        numKeys = numKeys ? numKeys : 1;
        var gradientIndex = 0, navigationIndex = 0;
        var i = 0, len = shapeNavigation.length;
        while(i<len){
            navigationIndex = fileString.indexOf(shapeNavigation[i],navigationIndex);
            i += 1;
        }
        gradientIndex = fileString.indexOf('ADBE Vector Grad Colors',navigationIndex);
        var gradFillIndex = fileString.indexOf('ADBE Vector Graphic - G-Fill',navigationIndex);
        var gradStrokeIndex = fileString.indexOf('ADBE Vector Graphic - G-Stroke',navigationIndex);
        var limitIndex;
        if(gradStrokeIndex !== -1 && gradFillIndex !== -1){
            limitIndex = Math.min(gradFillIndex,gradStrokeIndex);
        } else {
            limitIndex = Math.max(gradFillIndex,gradStrokeIndex);
        }
        if(limitIndex === -1){
            limitIndex = Number.MAX_VALUE;
        }
        //var regEx = /<prop.map>/g;
        var currentKey = 0, keyframes = [], hasOpacity = false, maxOpacities = 0, maxColors = 0;
        while(currentKey < numKeys){
            var gradientData = {};
            gradientIndex = fileString.indexOf('<prop.map',gradientIndex);
            if(hasNoGradColorData || gradientIndex > limitIndex || (gradientIndex == -1 && limitIndex == Number.MAX_VALUE)){
                gradientData.c = [[0,1,1,1],[1,0,0,0]];
                maxColors = Math.max(maxColors,2);
            } else {
                var endMatch = '</prop.map>';
                var lastIndex = fileString.indexOf(endMatch,gradientIndex);
                var xmlString = fileString.substr(gradientIndex,lastIndex+endMatch.length-gradientIndex);
                xmlString = xmlString.replace(/\n/g,'');
                var XML_Ob = new XML(xmlString);
                var stops = XML_Ob['prop.list'][0]['prop.pair'][0]['prop.list'][0]['prop.pair'][0]['prop.list'][0]['prop.pair'][0]['prop.list'][0]['prop.pair'];
                var colors = XML_Ob['prop.list'][0]['prop.pair'][0]['prop.list'][0]['prop.pair'][1]['prop.list'][0]['prop.pair'][0]['prop.list'][0]['prop.pair'];
                i = 0;
                len = stops.length();
                var opacitiesArr = [],op, floats, nextFloats, midPoint, midPosition;
                while(i<len){
                    floats = stops[i]['prop.list'][0]['prop.pair'][0]['array'][0].float;
                    op = [];
                    op.push(bm_generalUtils.roundNumber(Number(floats[0].toString()),3));
                    op.push(bm_generalUtils.roundNumber(Number(floats[2].toString()),3));
                    if(op[1] !== 1){
                        hasOpacity = true;
                    }
                    opacitiesArr.push(op);
                    midPosition = bm_generalUtils.roundNumber(Number(floats[1].toString()),3);
                    if(i<len-1 /*&& midPosition !== 0.5*/){
                        op = [];
                        nextFloats = stops[i+1]['prop.list'][0]['prop.pair'][0]['array'][0].float;
                        midPoint = Number(floats[0].toString()) + (Number(nextFloats[0].toString())-Number(floats[0].toString()))*midPosition;
                        var midPointValue = Number(floats[2].toString()) + (Number(nextFloats[2].toString())-Number(floats[2].toString()))*0.5;
                        op.push(bm_generalUtils.roundNumber(midPoint,3));
                        op.push(bm_generalUtils.roundNumber(midPointValue,3));
                        opacitiesArr.push(op);
                    }
                    i += 1;
                }
                i = 0;
                len = colors.length();
                var colorsArr = [];
                while(i<len){
                    floats = colors[i]['prop.list'][0]['prop.pair'][0]['array'][0].float;
                    op = [];
                    op.push(bm_generalUtils.roundNumber(Number(floats[0].toString()),3));
                    op.push(bm_generalUtils.roundNumber(Number(floats[2].toString()),3));
                    op.push(bm_generalUtils.roundNumber(Number(floats[3].toString()),3));
                    op.push(bm_generalUtils.roundNumber(Number(floats[4].toString()),3));
                    colorsArr.push(op);
                    midPosition = bm_generalUtils.roundNumber(Number(floats[1].toString()),3);
                    if(i<len-1 /*&& midPosition !== 0.5*/){
                        op = [];
                        nextFloats = colors[i+1]['prop.list'][0]['prop.pair'][0]['array'][0].float;
                        midPoint = Number(floats[0].toString()) + (Number(nextFloats[0].toString())-Number(floats[0].toString()))*midPosition;
                        var midPointValueR = Number(floats[2].toString()) + (Number(nextFloats[2].toString())-Number(floats[2].toString()))*0.5;
                        var midPointValueG = Number(floats[3].toString()) + (Number(nextFloats[3].toString())-Number(floats[3].toString()))*0.5;
                        var midPointValueB = Number(floats[4].toString()) + (Number(nextFloats[4].toString())-Number(floats[4].toString()))*0.5;
                        op.push(bm_generalUtils.roundNumber(midPoint,3));
                        op.push(bm_generalUtils.roundNumber(midPointValueR,3));
                        op.push(bm_generalUtils.roundNumber(midPointValueG,3));
                        op.push(bm_generalUtils.roundNumber(midPointValueB,3));
                        colorsArr.push(op);
                    }
                    i += 1;
                }
                gradientData.c = colorsArr;
                gradientData.o = opacitiesArr;
                maxOpacities = Math.max(maxOpacities,opacitiesArr.length);
                maxColors = Math.max(maxColors,colorsArr.length);
            }

            gradientIndex = lastIndex;

            keyframes.push(gradientData);
            currentKey += 1;
        }
        i = 0;
        var arr, arrayLength,count,lastValue,offsetValue, mergedKeys = [], mergedArr, j;
        while(i<numKeys){
            mergedArr = [];
            if(keyframes[i].c.length < maxColors){
                arr = keyframes[i].c;
                arrayLength = arr.length;
                lastValue = arr[arrayLength - 1];
                offsetValue = lastValue[0];
                count = 0;
                while(arrayLength + count<maxColors){
                    offsetValue -= 0.001;
                    arr.splice(arrayLength-1,0,[offsetValue,lastValue[1],lastValue[2],lastValue[3]]);
                    count += 1;
                }
            }
            for(j=0;j<maxColors;j+=1){
                for(var k = 0; k < 4; k += 1){
                    mergedArr.push(keyframes[i].c[j][k]);
                }
            }
            if(!hasOpacity){
                delete keyframes[i].o;
            } else {
                if(keyframes[i].o.length < maxOpacities){
                    arr = keyframes[i].o;
                    arrayLength = arr.length;
                    lastValue = arr[arrayLength - 1];
                    offsetValue = lastValue[0];
                    count = 0;
                    while(arrayLength + count<maxOpacities){
                        offsetValue -= 0.001;
                        arr.splice(arrayLength-1,0,[offsetValue,lastValue[1],lastValue[2],lastValue[3]]);
                        count += 1;
                    }
                }
                for(j=0;j<maxOpacities;j+=1){
                    for(var k = 0; k < 2; k += 1){
                        mergedArr.push(keyframes[i].o[j][k]);
                    }
                }
            }
            if(numKeys <= 1){
                mergedKeys = mergedArr;
            } else {
                mergedKeys.push(mergedArr);
            }
            i += 1;
        }

        return {
            m:mergedKeys,
            p: maxColors
        };

    }
    
    return ob;
}())