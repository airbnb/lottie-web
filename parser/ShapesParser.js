/****** INIT shapesParser ******/
(function (){
    var currentShape;
    var currentOb;
    var currentFrame;

    function parsePaths(paths,array,lastData,time){
        var i, len = paths.length;
        var frames =[];
        var framesI =[];
        var framesO =[];
        var framesV =[];
        for(i=0;i<len;i+=1){
            var path = paths[i].property('Path').valueAtTime(time,false);
            var frame = {};
            var frameI = {};
            var frameO = {};
            var frameV = {};
            frame.v = extrasInstance.roundNumber(path.vertices,3);
            frame.i = extrasInstance.roundNumber(path.inTangents,3);
            frame.o = extrasInstance.roundNumber(path.outTangents,3);
            frameI = extrasInstance.roundNumber(path.inTangents,3);
            frameO = extrasInstance.roundNumber(path.outTangents,3);
            frameV = extrasInstance.roundNumber(path.vertices,3);
            frames .push(frame);
            framesI .push(frameI);
            framesO .push(frameO);
            framesV .push(frameV);
        }
        /*if(lastData.path == null || extrasInstance.compareObjects(lastData.path,frames) == false){
         array[currentFrame]=frames;
         lastData.path = frames;
         }*/
        if(lastData.pathI == null || extrasInstance.compareObjects(lastData.pathI,framesI) == false){
            array.i[currentFrame]=framesI;
            lastData.pathI = framesI;
        }
        if(lastData.pathO == null || extrasInstance.compareObjects(lastData.pathO,framesO) == false){
            array.o[currentFrame]=framesO;
            lastData.pathO = framesO;
        }
        if(lastData.pathV== null || extrasInstance.compareObjects(lastData.pathV,framesV) == false){
            array.v[currentFrame]=framesV;
            lastData.pathV = framesV;
        }
    }
    function parseStar(){

    }
    function parseRect(info,array, lastData, time){
        //Todo Use this when property has expressions
        return;
        var frame = {};
        frame.size = info.property('Size').valueAtTime(time,false);
        frame.p = extrasInstance.roundNumber(info.property('Position').valueAtTime(time,false),3);
        frame.roundness = extrasInstance.roundNumber(info.property('Roundness').valueAtTime(time,false),3);
        if(lastData.rect == null || extrasInstance.compareObjects(lastData.rect,frame) == false){
            array[currentFrame]=frame;
            lastData.rect = frame;
        }else{
            //array.push(new Object());
        }
    }
    function parseEllipse(info,array, lastData, time){
        //Todo Use this when property has expressions
        return;
        var frame = {};
        frame.size = info.property('Size').valueAtTime(time,false);
        frame.p = extrasInstance.roundNumber(info.property('Position').valueAtTime(time,false),3);
        if(lastData.rect == null || extrasInstance.compareObjects(lastData.rect,frame) == false){
            array[currentFrame]=frame;
            lastData.rect = frame;
        }else{
            //array.push(new Object());
        }
        return frame.size;
    }
    function parseStroke(info,array, lastData, time){
        //Todo Use this when property has expressions
        return;
        var frame = {};
        var color = info.property('Color').valueAtTime(time,false);
        frame.color =extrasInstance.rgbToHex(Math.round(color[0]*255),Math.round(color[1]*255),Math.round(color[2]*255));
        frame.opacity = extrasInstance.roundNumber(info.property('Opacity').valueAtTime(time,false),3);
        frame.width = info.property('Stroke Width').valueAtTime(time,false);
        if(lastData.stroke == null || extrasInstance.compareObjects(lastData.stroke,frame) == false){
            array[currentFrame]=frame;
            lastData.stroke = frame;
        }else{
            //array.push(new Object());
        }
    }
    function parseFill(info,array, lastData, time){
        //Todo Use this when property has expressions
        return;

        var frame = {};
        var color = info.property('Color').valueAtTime(time,false);
        frame.color =extrasInstance.rgbToHex(Math.round(color[0]*255),Math.round(color[1]*255),Math.round(color[2]*255));
        frame.opacity = extrasInstance.roundNumber(info.property('Opacity').valueAtTime(time,false),3);
        if(lastData.fill == null || extrasInstance.compareObjects(lastData.fill,frame) == false){
            array[currentFrame]=frame;
            lastData.fill = frame;
        }else{
            //array.push(new Object());
        }
    }
    function parseTransform(info,array, lastData, time){
        //Todo Use this when property has expressions
        return;
        var frame = {};
        frame.p = extrasInstance.roundNumber(info.property('Position').valueAtTime(time,false),3);
        frame.a = extrasInstance.roundNumber(info.property('Anchor Point').valueAtTime(time,false),3);
        frame.s = [];
        frame.s[0] = extrasInstance.roundNumber(info.property('Scale').valueAtTime(time,false)[0]/100,3);
        frame.s[1] = extrasInstance.roundNumber(info.property('Scale').valueAtTime(time,false)[1]/100,3);
        frame.r = extrasInstance.roundNumber(info.property('Rotation').valueAtTime(time,false)*Math.PI/180,3);
        frame.o = extrasInstance.roundNumber(info.property('Opacity').valueAtTime(time,false),3);
        if(lastData.transform == null || extrasInstance.compareObjects(lastData.transform,frame) == false){
            array[currentFrame]=frame;
            lastData.transform = frame;
        }else{
            //array.push(new Object());
        }
    }

    function parseTrim(info,trim,lastData,time){
        //Todo Use this when property has expressions
        return;
        var frame = {};
        var trimS = extrasInstance.roundNumber(info.property('Start').valueAtTime(time,false),3);
        var trimE = extrasInstance.roundNumber(info.property('End').valueAtTime(time,false),3);
        var trimO = extrasInstance.roundNumber(info.property('Offset').valueAtTime(time,false),3);
        if(lastData.trimS == null || extrasInstance.compareObjects(trimS,lastData.trimS)==false){
            trim.s[currentFrame] = trimS;
            lastData.trimS = trimS;
        }
        if(lastData.trimE == null || extrasInstance.compareObjects(trimE,lastData.trimE)==false){
            trim.e[currentFrame] = trimE;
            lastData.trimE = trimE;
        }
        if(lastData.trimO  == null || extrasInstance.compareObjects(trimO ,lastData.trimO )==false){
            trim.o[currentFrame] = trimO ;
            lastData.trimO = trimO ;
        }
    }

    function parseShape(shapeInfo, shapeOb, time){
        //iterateProperty(shapeInfo,0);
        var shapeContents = shapeInfo.property('Contents');

        var paths = [];
        var numProperties = shapeContents.numProperties;
        for(var i = 0;i<numProperties;i+=1){
            if(shapeContents(i+1).matchName == 'ADBE Vector Shape - Group'){
                paths.push(shapeContents(i+1));
            }
        }

        if(shapeContents.property('ADBE Vector Graphic - Stroke')){
            parseStroke(shapeContents.property('ADBE Vector Graphic - Stroke'),shapeOb.an.stroke, shapeOb.lastData, time);
        }
        if(shapeContents.property('ADBE Vector Graphic - Fill')){
            parseFill(shapeContents.property('ADBE Vector Graphic - Fill'),shapeOb.an.fill, shapeOb.lastData, time);
        }
        if(paths.length>0){
            if(shapeOb.an.path){
                parsePaths(paths,shapeOb.an.path, shapeOb.lastData, time);
            }
        }
        if(shapeContents.property('ADBE Vector Shape - Rect')){
            parseRect(shapeContents.property('ADBE Vector Shape - Rect'),shapeOb.an.rect, shapeOb.lastData, time);
        }
        if(shapeContents.property('ADBE Vector Shape - Ellipse')){
            parseEllipse(shapeContents.property('ADBE Vector Shape - Ellipse'),shapeOb.an.ell, shapeOb.lastData, time);
        }
        if(shapeContents.property('ADBE Vector Filter - Trim')){
            parseTrim(shapeContents.property('ADBE Vector Filter - Trim'),shapeOb.trim, shapeOb.lastData, time);
        }
        parseTransform(shapeInfo.property('Transform'),shapeOb.an.tr, shapeOb.lastData, time);
    }

    function addFrameData(layerInfo,layerOb, frameNum, time){
        currentFrame = frameNum;
        var contents = layerInfo.property('Contents');
        /** Todo Use for expressions
        if(contents.property('ADBE Vector Filter - Trim')){
            var trim = layerOb.trim;
            var trimS = extrasInstance.roundNumber(contents.property('ADBE Vector Filter - Trim').property('Start').valueAtTime(time,false),3);
            var trimE = extrasInstance.roundNumber(contents.property('ADBE Vector Filter - Trim').property('End').valueAtTime(time,false),3);
            var trimO = extrasInstance.roundNumber(contents.property('ADBE Vector Filter - Trim').property('Offset').valueAtTime(time,false),3);
            if(layerOb.lastData.trimS == null || extrasInstance.compareObjects(trimS,layerOb.lastData.trimS)==false){
                trim.s[currentFrame] = trimS;
                layerOb.lastData.trimS = trimS;
            }
            if(layerOb.lastData.trimE == null || extrasInstance.compareObjects(trimE,layerOb.lastData.trimE)==false){
                trim.e[currentFrame] = trimE;
                layerOb.lastData.trimE = trimE;
            }
            if(layerOb.lastData.trimO  == null || extrasInstance.compareObjects(trimO ,layerOb.lastData.trimO )==false){
                trim.o[currentFrame] = trimO ;
                layerOb.lastData.trimO = trimO ;
            }
        }
        **/
        var shapes = layerOb.shapes;
        var i,len = shapes.length;
        for(i=0;i<len;i++){
            parseShape(contents.property(shapes[i].name), shapes[i], time);
        }
    }

    function iterateProperties(iteratable,array,frameRate){
        var i, len = iteratable.numProperties;
        var ob, prop;
        for(i=0;i<len;i+=1){
            prop = iteratable.property(i+1);
            if(!prop.enabled){
                continue;
            }
            var itemType = getItemType(prop.matchName);
            if(itemType == 'sh'){
                ob = {};
                ob.ty = itemType;
                ob.closed = prop.property('Path').value.closed;
                extrasInstance.convertToBezierValues(prop.property('Path'), frameRate, ob,'ks');
                array.push(ob);
            }else if(itemType == 'rc'){
                ob = {};
                ob.ty = itemType;
                extrasInstance.convertToBezierValues(prop.property('Size'), frameRate, ob,'s');
                extrasInstance.convertToBezierValues(prop.property('Position'), frameRate, ob,'p');
                extrasInstance.convertToBezierValues(prop.property('Roundness'), frameRate, ob,'r');
                array.push(ob);
            }else if(itemType == 'el'){
                ob = {};
                ob.ty = itemType;
                extrasInstance.convertToBezierValues(prop.property('Size'), frameRate, ob,'s');
                extrasInstance.convertToBezierValues(prop.property('Position'), frameRate, ob,'p');
                array.push(ob);
            }else if(itemType == 'fl'){
                ob = {};
                ob.ty = itemType;
                ob.fillEnabled = prop.enabled;
                extrasInstance.convertToBezierValues(prop.property('Color'), frameRate, ob,'c');
                extrasInstance.convertToBezierValues(prop.property('Opacity'), frameRate, ob,'o');
                array.push(ob);
            }else if(itemType == 'st'){
                ob = {};
                ob.ty = itemType;
                ob.fillEnabled = prop.enabled;
                extrasInstance.convertToBezierValues(prop.property('Color'), frameRate, ob,'c');
                extrasInstance.convertToBezierValues(prop.property('Opacity'), frameRate, ob,'o');
                extrasInstance.convertToBezierValues(prop.property('Stroke Width'), frameRate, ob,'w');
                var j, jLen = prop.property('Dashes').numProperties;
                var dashesData = [];
                var changed = false;
                for(j=0;j<jLen;j+=1){
                    if(prop.property('Dashes').property(j+1).numKeys > 0 || (prop.property('Dashes').property(j+1).name == 'Offset' && changed)) {
                        changed = true;
                        var dashData = {};
                        var name = '';
                        if(prop.property('Dashes').property(j+1).name == 'Dash'){
                            name = 'd';
                        }else if(prop.property('Dashes').property(j+1).name == 'Gap'){
                            name = 'g';
                        }else if(prop.property('Dashes').property(j+1).name == 'Offset'){
                            name = 'o';
                        }
                        dashData.n = name;
                        extrasInstance.convertToBezierValues(prop.property('Dashes').property(j+1), frameRate, dashData,'v');
                        dashesData.push(dashData)
                    }
                    /*$.writeln('matchName: ',prop.property('Dashes').property(j+1).matchName);
                    $.writeln('value: ',prop.property('Dashes').property(j+1).value);
                    $.writeln('enabled: ',prop.property('Dashes').property(j+1).enabled);*/
                }
                if(changed){
                    ob.d = dashesData;
                }
                //extrasInstance.iterateProperty(prop);
                array.push(ob);
            }else if(itemType == 'mm'){
                ob = {};
                ob.ty = itemType;
                ob.mm = prop.property('ADBE Vector Merge Type').value;
                array.push(ob);
            }else if(itemType == 'tm'){
                ob = {};
                ob.ty = itemType;
                extrasInstance.convertToBezierValues(prop.property('Start'), frameRate, ob,'s');
                extrasInstance.convertToBezierValues(prop.property('End'), frameRate, ob,'e');
                extrasInstance.convertToBezierValues(prop.property('Offset'), frameRate, ob,'o');
                ob.m = prop.property('Trim Multiple Shapes').value;
                //extrasInstance.iterateProperty(prop);
                array.push(ob);
            }else if(itemType == 'gr'){
                ob = {
                    ty : itemType,
                    it: []
                };
                iterateProperties(prop.property('Contents'),ob.it,frameRate);
                var trOb = {};
                var transformProperty = prop.property('Transform');
                trOb.ty = 'tr';
                extrasInstance.convertToBezierValues(transformProperty.property('Position'), frameRate, trOb,'p');
                extrasInstance.convertToBezierValues(transformProperty.property('Anchor Point'), frameRate, trOb,'a');
                extrasInstance.convertToBezierValues(transformProperty.property('Scale'), frameRate, trOb,'s');
                extrasInstance.convertToBezierValues(transformProperty.property('Rotation'), frameRate, trOb,'r');
                extrasInstance.convertToBezierValues(transformProperty.property('Opacity'), frameRate, trOb,'o');
                ob.it.push(trOb);
                array.push(ob);
            }
        }
    }

    function createShapes(layerInfo,layerOb, frameRate){
        var shapes = [];
        layerOb.shapes = shapes;
        var contents = layerInfo.property('Contents');
        iterateProperties(contents,shapes,frameRate);
    }

    function getItemType(matchName){
        //$.writeln('matchName: ',matchName);
        switch(matchName){
            case 'ADBE Vector Shape - Group':
                return 'sh';
            case 'ADBE Vector Shape - Rect':
                return 'rc';
            case 'ADBE Vector Shape - Ellipse':
                return 'el';
            case 'ADBE Vector Graphic - Fill':
                return 'fl';
            case 'ADBE Vector Graphic - Stroke':
                return 'st';
            case 'ADBE Vector Graphic - Merge':
                return 'mm';
            case 'ADBE Vector Graphic - Trim':
            case 'ADBE Vector Filter - Trim':
                return 'tm';
            case 'ADBE Vector Group':
                return 'gr';
            default:
                //$.writeln('unsupported: ',matchName);
                return '';
        }
    }

    var ob = {};
    ob.createShapes = createShapes;
    ob.addFrameData = addFrameData;

    ShapesParser = ob;
}());

/****** END shapesParser ******/