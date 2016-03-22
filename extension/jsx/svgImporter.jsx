var bm_svgImporter = (function(){
   'use strict';
    var ob = {};
    ob.createSvg = createSvg;
    
    function addPath(group,element,offsetX,offsetY, inherited) {
        var gr = group.property("Contents").addProperty("ADBE Vector Group");
        var path;
        var i, len = element.segments.length;
        var vertices = [];
        var inPoints = [];
        var outPoints = [];
        var segmentOb, lastOb, count = 1, lastX = 0, lastY = 0;
        //offsetX = offsetY = 0;
        for( i = 0; i < len; i += 1) {
            segmentOb = element.segments[i];
            if(segmentOb.ty === 7) {
                outPoints[count - 1] = [segmentOb.x1,segmentOb.y1];
                vertices[count] = [segmentOb.x + lastX - offsetX,segmentOb.y + lastY  - offsetY];
                inPoints[count] = [lastX - (segmentOb.x + lastX) + segmentOb.x2, lastY - (segmentOb.y + lastY) + segmentOb.y2];
                count += 1;
                lastOb = segmentOb;
                lastX = lastX + segmentOb.x;
                lastY = lastY + segmentOb.y;
            } else if (segmentOb.ty === 6) {
                outPoints[count - 1] = [segmentOb.x1 - lastX,segmentOb.y1 - lastY];
                vertices[count] = [segmentOb.x - offsetX,segmentOb.y - offsetY];
                inPoints[count] = [segmentOb.x2 - segmentOb.x,segmentOb.y2 - segmentOb.y];
                count += 1;
                lastOb = segmentOb;
                lastX = segmentOb.x;
                lastY =  segmentOb.y;
            } else if (segmentOb.ty === 2) {
                if(lastOb){
                    outPoints[count-1] = [0,0];
                    inPoints[0] = [0,0];
                    /*path.vertices = vertices;
                    path.inPoints = inPoints;
                    path.outPoints = outPoints;*/
                    var myShape = path.property('Path').value;
                    /*bm_eventDispatcher.log(vertices);
                    bm_eventDispatcher.log(inPoints);
                    bm_eventDispatcher.log(outPoints);*/
                    myShape.vertices = vertices;
                    myShape.inTangents = inPoints;
                    myShape.outTangents = outPoints;
                    myShape.closed = true;
                    path.property('Path').setValue(myShape);
                }
                path = gr.property("Contents").addProperty("ADBE Vector Shape - Group");
                vertices = [];
                inPoints = [];
                outPoints = [];
                vertices.push([segmentOb.x - offsetX,segmentOb.y - offsetY]);
                lastX = segmentOb.x;
                lastY = segmentOb.y;
                    count= 1;
            }
        }
        if(lastOb){
            outPoints[count-1] = [0,0];
            inPoints[0] = [0,0];
            /*path.vertices = vertices;
            path.inPoints = inPoints;
            path.outPoints = outPoints;*/
            /*vertices = [[100,100],[200,100]];
            outPoints = [[0,-100],[0,0]];
            inPoints = [[0,0],[0,-100]];*/
            /*bm_eventDispatcher.log(vertices);
            bm_eventDispatcher.log(outPoints);
            bm_eventDispatcher.log(inPoints);*/
            var myShape = path.property('Path').value;
            myShape.vertices = vertices;
            myShape.inTangents = inPoints;
            myShape.outTangents = outPoints;
            myShape.closed = true;
            path.property('Path').setValue(myShape);
        }
        addAttributes(gr, element, inherited);
    }
    
    function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
    function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
    function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
    function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
    
    function addAttributes(group, data, inherited){
        bm_eventDispatcher.log(inherited);
        var color = data.co || inherited.co;
        var R = hexToR(color);
        var G = hexToG(color);
        var B = hexToB(color);
        var co = group.property("Contents").addProperty("ADBE Vector Graphic - Fill");
        var prop = co.property('Color');
        prop.setValue([R/255,G/255,B/255,1]);
        var op = data.op || inherited.op;
        var opacityProperty = co.property('Opacity');
        opacityProperty.setValue(op*100);
        if(data.stW || inherited.stW){
            var st = group.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
            color = data.stCo || inherited.stCo;
            R = hexToR(color);
            G = hexToG(color);
            B = hexToB(color);
            prop = st.property('Color');
            prop.setValue([R/255,G/255,B/255,1]);
            op = data.stOp || inherited.stOp;
            opacityProperty = st.property('Opacity');
            opacityProperty.setValue(op*100);
            var strokeWidthProperty = st.property('Stroke Width');
            var stW = data.stW || inherited.stW;
            strokeWidthProperty.setValue(stW);
        }
    }
    
    function addElements(group, data,offsetX,offsetY, inheritedData){
        var inherited = {
            co: data.co || inheritedData.co,
            op: data.op || inheritedData.op,
            stCo: data.stCo || inheritedData.stCo,
            stOp: data.stOp || inheritedData.stOp,
            stW: data.stW || inheritedData.stW
        }
        var elements = data.elems;
        var gr = group.property("Contents").addProperty("ADBE Vector Group");
        var i, len = elements.length;
        for(i = 0; i < len; i += 1){
            if(elements[i].ty === 'g'){
                addElements(gr,elements[i],offsetX,offsetY, inherited);
            } else if(elements[i].ty === 'path'){
                addPath(gr,elements[i],offsetX,offsetY, inherited);
            }
        }
        //addAttributes(gr, data, inherited);
    }
    
    function createSvg(data) {
        var comp = app.project.items.addComp('svg', data.w, data.h, 1, 1, 1);
        var shapeLayer = comp.layers.addShape();
        var inheritedData = {
            co: "#000000",
            op: 1,
            stCo: "#000000",
            stOp: 0,
            stW: 0
        }
        addElements(shapeLayer, data, data.w/2,data.h/2, inheritedData);
        
    }
    
    return ob;
    
}())