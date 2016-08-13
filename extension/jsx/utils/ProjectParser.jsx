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

    function getGradientData(shapeNavigation){
        if(!fileString){
            getProjectData();
        }
        var gradientIndex = 0;
        var i = 0, len = shapeNavigation.length;
        while(i<len){
            gradientIndex = fileString.indexOf(shapeNavigation[i],gradientIndex);
            i += 1;
        }
        gradientIndex = fileString.indexOf('ADBE Vector Grad Colors',gradientIndex);
        var limitIndex = fileString.indexOf('ADBE Vector Grad Colors',gradientIndex+1);
        if(limitIndex === -1){
            limitIndex = Number.MAX_VALUE;
        }
        //var regEx = /<prop.map>/g;
        gradientIndex = fileString.indexOf('<prop.map',gradientIndex);
        var gradientData = {};
        if(gradientIndex > limitIndex){

        } else {
            var endMatch = '</prop.map>';
            var lastIndex = fileString.indexOf(endMatch,gradientIndex);
            var xmlString = fileString.substr(gradientIndex,lastIndex+endMatch.length-gradientIndex);
            xmlString = xmlString.replace(/\n/g,'');
            //bm_eventDispatcher.log('xmlStringxmlString:'+xmlString);
            var XML_Ob = new XML(xmlString);
            //bm_eventDispatcher.log(XML_Ob['prop.list'][0]['prop.pair'][0]['prop.list'][0]['prop.pair'][0]['prop.list'][0]['prop.pair'][0]['prop.list'][0]['prop.pair'].toString());
            //bm_eventDispatcher.log(XML_Ob['prop.list'][0]['prop.pair'][0]['prop.list'][0]['prop.pair'][0]['prop.list'][0]['prop.pair'][0]['prop.list'][0]['prop.pair'].length());
            var stops = XML_Ob['prop.list'][0]['prop.pair'][0]['prop.list'][0]['prop.pair'][0]['prop.list'][0]['prop.pair'][0]['prop.list'][0]['prop.pair'];
            var colors = XML_Ob['prop.list'][0]['prop.pair'][0]['prop.list'][0]['prop.pair'][1]['prop.list'][0]['prop.pair'][0]['prop.list'][0]['prop.pair'];
            i = 0;
            len = stops.length();
            var opacitiesArr = [],op, floats, nextFloats, midPoint, midPosition, hasOpacity = false;
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
                if(i<len-1 && midPosition !== 0.5){
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
            if(!hasOpacity){
                opacitiesArr.length = 0;
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
                if(i<len-1 && midPosition !== 0.5){
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
            //var jsonData = bm_xml2json(XML_Ob);
            //bm_eventDispatcher.log(jsonData);
        }
        //var regEx = /<prop\.map[\w\s\W\D\S]+map>/;
        //var match = regEx.exec(fileString);
        /*var regEx = /<prop\.map[\w\s\W\D\S]+map>/;
        regEx.lastIndex = gradientIndex;
        var match = regEx.exec(fileString);
        if(match.length){
            bm_eventDispatcher.log('match: ' + match[0]);
        } else {
            bm_eventDispatcher.log('no match: ');
        }
        bm_eventDispatcher.log('gradientIndex: ' + gradientIndex);*/
        return gradientData;
    }
    
    return ob;
}())