var bm_svgImporter = (function () {
    'use strict';
    var ob = {};
    ob.createSvg = createSvg;
    
    function hexToR(h) {return parseInt((cutHex(h)).substring(0, 2), 16)}
    function hexToG(h) {return parseInt((cutHex(h)).substring(2, 4), 16)}
    function hexToB(h) {return parseInt((cutHex(h)).substring(4, 6), 16)}
    function cutHex(h) {return (h.charAt(0) === "#") ? h.substring(1, 7) : h}
    
    function addAttributes(group, data, inherited){
        bm_eventDispatcher.log(inherited);
        var color = data.co || inherited.co;
        var R = hexToR(color);
        var G = hexToG(color);
        var B = hexToB(color);
        var co = group.property("Contents").addProperty("ADBE Vector Graphic - Fill");
        var prop = co.property('Color');
        prop.setValue([R/255,G/255,B/255,1]);
        var fop = data.fop || inherited.fop;
        var opacityProperty = co.property('Opacity');
        opacityProperty.setValue(fop*100);
        if(data.st || inherited.st){
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
        addTransformAttributes(group, data, inherited);
    }
    
    function addTransformAttributes(group, data, inherited) {
        var transformProperty = group.property('Transform');
        var trOp = transformProperty.property('Opacity');
        var op = data.op || inherited.op;
        trOp.setValue(op*100);
    }
    
    function addPath(group, element, offsetX, offsetY, inherited) {
        var gr = group.property("Contents").addProperty("ADBE Vector Group");
        var path, i, len = element.segments.length;
        var vertices = [], inPoints = [], outPoints = [];
        var segmentOb, lastOb, count = 1, lastX = 0, lastY = 0;
        //offsetX = offsetY = 0;
        for( i = 0; i < len; i += 1) {
            segmentOb = element.segments[i];
            if (segmentOb.ty === 8) {
                /*Control1X = StartX + (.66 * (ControlX - StartX))
                Control2X = EndX + (.66 * (ControlX - EndX))*/
                var c1x = lastX + (2/3*(segmentOb.x1 - lastX));
                var c1y = lastY + (2/3*(segmentOb.y1 - lastY));
                var c2x = segmentOb.x + (2/3*(segmentOb.x1 - segmentOb.x));
                var c2y = segmentOb.y + (2/3*(segmentOb.y1 - segmentOb.y));
                outPoints[count - 1] = [c1x - lastX,c1y - lastY];
                vertices[count] = [segmentOb.x - offsetX,segmentOb.y - offsetY];
                inPoints[count] = [c2x - segmentOb.x,c2y - segmentOb.y];
                count += 1;
                lastOb = segmentOb;
                lastX = segmentOb.x;
                lastY =  segmentOb.y;
            } else if (segmentOb.ty === 9) {
                var x = segmentOb.x + lastX;
                var y = segmentOb.y + lastY;
                var x1 = segmentOb.x1 + lastX;
                var y1 = segmentOb.y1 + lastY;
                var c1x = lastX + (2/3*(x1 - lastX));
                var c1y = lastY + (2/3*(y1 - lastY));
                var c2x = x + (2/3*(x1 - x));
                var c2y = y + (2/3*(y1 - y));
                outPoints[count - 1] = [c1x - lastX,c1y - lastY];
                vertices[count] = [x - offsetX,y - offsetY];
                inPoints[count] = [c2x - x,c2y - y];
                count += 1;
                lastOb = segmentOb;
                lastX = lastX + segmentOb.x;
                lastY = lastY + segmentOb.y;
            } else if (segmentOb.ty === 4) {
                outPoints[count - 1] = [0,0];
                vertices[count] = [segmentOb.x - offsetX,segmentOb.y  - offsetY];
                inPoints[count] = [0,0];
                count += 1;
                lastOb = segmentOb;
                lastX = segmentOb.x;
                lastY = segmentOb.y;
            } else if (segmentOb.ty === 5) {
                outPoints[count - 1] = [0,0];
                vertices[count] = [lastX + segmentOb.x  - offsetX,lastY + segmentOb.y  - offsetY];
                inPoints[count] = [0,0];
                count += 1;
                lastOb = segmentOb;
                lastX = lastX + segmentOb.x;
                lastY = lastY + segmentOb.y;
            } else if (segmentOb.ty === 12) {
                outPoints[count - 1] = [0,0];
                vertices[count] = [segmentOb.x - offsetX, lastY - offsetY];
                inPoints[count] = [0,0];
                count += 1;
                lastOb = segmentOb;
                lastX = segmentOb.x;
                lastY = lastY;
            } else if (segmentOb.ty === 13) {
                outPoints[count - 1] = [0,0];
                vertices[count] = [lastX + segmentOb.x  - offsetX, lastY - offsetY];
                inPoints[count] = [0,0];
                count += 1;
                lastOb = segmentOb;
                lastX = lastX + segmentOb.x;
                lastY = lastY;
            } else if (segmentOb.ty === 14) {
                outPoints[count - 1] = [0,0];
                vertices[count] = [lastX - offsetX,segmentOb.y  - offsetY];
                inPoints[count] = [0,0];
                count += 1;
                lastOb = segmentOb;
                lastX = lastX;
                lastY = segmentOb.y;
            } else if (segmentOb.ty === 15) {
                outPoints[count - 1] = [0,0];
                vertices[count] = [lastX - offsetX,lastY + segmentOb.y  - offsetY];
                inPoints[count] = [0,0];
                count += 1;
                lastOb = segmentOb;
                lastX = lastX;
                lastY = lastY + segmentOb.y;
            } else if(segmentOb.ty === 7) {
                outPoints[count - 1] = [segmentOb.x1,segmentOb.y1];
                vertices[count] = [segmentOb.x + lastX - offsetX,segmentOb.y + lastY  - offsetY];
                inPoints[count] = [lastX - (segmentOb.x + lastX) + segmentOb.x2, lastY - (segmentOb.y + lastY) + segmentOb.y2];
                count += 1;
                lastOb = segmentOb;
                lastX = lastX + segmentOb.x;
                lastY = lastY + segmentOb.y;
            } else if (segmentOb.ty === 16) {
                outPoints[count - 1] = [-inPoints[count - 1][0],-inPoints[count - 1][1]];
                vertices[count] = [segmentOb.x - offsetX,segmentOb.y - offsetY];
                inPoints[count] = [segmentOb.x2 - segmentOb.x,segmentOb.y2 - segmentOb.y];
                count += 1;
                lastOb = segmentOb;
                lastX = segmentOb.x;
                lastY =  segmentOb.y;
            } else if(segmentOb.ty === 17) {
                outPoints[count - 1] = [-inPoints[count - 1][0],-inPoints[count - 1][1]];
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
    
    function addPolygon(group, element, offsetX, offsetY, inherited){
        var gr = group.property("Contents").addProperty("ADBE Vector Group");
        var points = element.points;
        var i, len = points.length;
        var vertices = [];
        var inPoints = [];
        var outPoints = [];
        for (i = 0; i < len; i += 1) {
            vertices.push([points[i][0] - offsetX, points[i][1] - offsetY]);
            inPoints.push([0, 0]);
            outPoints.push([0, 0]);
        }
        var path = gr.property("Contents").addProperty("ADBE Vector Shape - Group");
        var myShape = path.property('Path').value;
        myShape.vertices = vertices;
        myShape.inTangents = inPoints;
        myShape.outTangents = outPoints;
        myShape.closed = element.ty === 'polygon';
        path.property('Path').setValue(myShape);
        addAttributes(gr, element, inherited);
    }
    
    function addRect(group, element, offsetX, offsetY, inherited){
        var gr = group.property("Contents").addProperty("ADBE Vector Group");
        var rect = gr.property("Contents").addProperty("ADBE Vector Shape - Rect");
        rect.property('Size').setValue([element.width,element.height]);
        rect.property('Position').setValue([element.x - offsetX + element.width/2,element.y - offsetY + element.height/2]);
        rect.property('Roundness').setValue(element.rx);
        addAttributes(gr, element, inherited);
        
    }
    
    function addEllipse(group, element, offsetX, offsetY, inherited){
        var gr = group.property("Contents").addProperty("ADBE Vector Group");
        var ell = gr.property("Contents").addProperty("ADBE Vector Shape - Ellipse");
        ell.property('Size').setValue([element.rx*2,element.ry*2]);
        ell.property('Position').setValue([element.cx - offsetX,element.cy - offsetY]);
        addAttributes(gr, element, inherited);
        
    }
    
    function addElements(group, data,offsetX,offsetY, inheritedData, isFirst){
        var inherited = {
            co: data.co || inheritedData.co,
            fop: data.fop || inheritedData.fop,
            stCo: data.stCo || inheritedData.stCo,
            stOp: data.stOp || inheritedData.stOp,
            stW: data.stW || inheritedData.stW,
            st: data.st || inheritedData.st,
            op: data.op || inheritedData.op
        }
        var elements = data.elems;
        var gr;
        var i, len = elements.length;
        if(!isFirst){
            gr = group.property("Contents").addProperty("ADBE Vector Group");
            for(i = len - 1; i >= 0; i -= 1){
                if(isFirst){
                    gr = group.layers.addShape();
                }
                if(elements[i].ty === 'g'){
                    addElements(gr,elements[i],offsetX,offsetY, inherited, false);
                } else if(elements[i].ty === 'path'){
                    addPath(gr,elements[i],offsetX,offsetY, inherited);
                } else if(elements[i].ty === 'polygon' || elements[i].ty === 'polyline'){
                    addPolygon(gr,elements[i],offsetX,offsetY, inherited);
                } else if(elements[i].ty === 'rect'){
                    addRect(gr,elements[i],offsetX,offsetY, inherited);
                } else if(elements[i].ty === 'ellipse'){
                    addEllipse(gr,elements[i],offsetX,offsetY, inherited);
                }
            }
            addTransformAttributes(gr, data, inherited);
        } else {
            for(i = 0; i < len; i += 1){
                gr = group.layers.addShape();
                if(elements[i].ty === 'g'){
                    addElements(gr,elements[i],offsetX,offsetY, inherited, false);
                } else if(elements[i].ty === 'path'){
                    addPath(gr,elements[i],offsetX,offsetY, inherited);
                } else if(elements[i].ty === 'polygon' || elements[i].ty === 'polyline'){
                    addPolygon(gr,elements[i],offsetX,offsetY, inherited);
                } else if(elements[i].ty === 'rect'){
                    addRect(gr,elements[i],offsetX,offsetY, inherited);
                } else if(elements[i].ty === 'ellipse'){
                    addEllipse(gr,elements[i],offsetX,offsetY, inherited);
                }
                if(elements[i].id){
                    gr.name = elements[i].id;
                }
            }
        }
    }
    
    function createSvg(data) {
        var comp = app.project.items.addComp('svg', data.w, data.h, 1, 1, 1);
        comp.name = data.name;
        //var shapeLayer = comp.layers.addShape();
        var inheritedData = {
            co: "#000000",
            fop: 1,
            stCo: "#000000",
            stOp: 1,
            stW: 1,
            st: false,
            op: 1,
        }
        addElements(comp, data, data.w/2,data.h/2, inheritedData, true);
        
    }
    
    return ob;
    
}())