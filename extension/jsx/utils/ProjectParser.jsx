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
        bm_eventDispatcher.log('limitIndexlimitIndex:'+limitIndex);
        //var regEx = /<prop.map>/g;
        bm_eventDispatcher.log('gradientIndex:'+gradientIndex);
        gradientIndex = fileString.indexOf('<prop.map',gradientIndex);
        if(gradientIndex > limitIndex){

        } else {
            var endMatch = '</prop.map>';
            var lastIndex = fileString.indexOf(endMatch,gradientIndex);
            var xmlString = fileString.substr(gradientIndex,lastIndex+endMatch.length-gradientIndex);
            xmlString = xmlString.replace(/\n/g,'');
            bm_eventDispatcher.log('xmlStringxmlString:'+xmlString);
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
        return '';
    }
    
    return ob;
}())