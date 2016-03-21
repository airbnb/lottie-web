var bm_svgImporter = (function(){
   'use strict';
    var ob = {};
    ob.createSvg = createSvg;
    
    function addPath(group,element) {
        var gr = group.property("Contents").addProperty("ADBE Vector Group");
        var path = gr.property("Contents").addProperty("ADBE Vector Shape - Group");
        var i, len = element.segments.length;
        var vertices = [];
        var inPoints = [];
        var outPoints = [];
        var segmentOb, lastOb, count = 1, lastX = 0, lastY = 0;
        for( i = 0; i < len; i += 1) {
            segmentOb = element.segments[i];
            if(segmentOb.ty === 7) {
                outPoints[count - 1] = [segmentOb.x1 + lastX,segmentOb.y1 + lastY];
                vertices[count] = [segmentOb.x + lastX,segmentOb.y + lastY];
                inPoints[count] = [segmentOb.x2 + lastX,segmentOb.y2 + lastY];
                count += 1;
                lastOb = segmentOb;
                lastX = lastX + segmentOb.x;
                lastY = lastY + segmentOb.y;
            } else if (segmentOb.ty === 6) {
                outPoints[count - 1] = [segmentOb.x1,segmentOb.y1];
                vertices[count] = [segmentOb.x,segmentOb.y];
                inPoints[count] = [segmentOb.x2,segmentOb.y2];
                count += 1;
                lastOb = segmentOb;
                lastX = lastX;
                lastY = lastY;
            } else if (segmentOb.ty === 2) {
                if(lastOb){
                    outPoints[count-1] = [vertices[0][0],vertices[0][1]];
                    inPoints[0] = [vertices[count-1][0],vertices[count-1][1]];
                    /*path.vertices = vertices;
                    path.inPoints = inPoints;
                    path.outPoints = outPoints;*/
                    var myShape = path.property('Path').value;
                    bm_eventDispatcher.log(vertices);
                    bm_eventDispatcher.log(inPoints);
                    bm_eventDispatcher.log(outPoints);
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
                vertices.push([segmentOb.x,segmentOb.y]);
                lastX = segmentOb.x;
                lastY = segmentOb.y;
                    count= 1;
            }
        }
        if(lastOb){
            outPoints[count-1] = [vertices[0][0],vertices[0][1]];
            inPoints[0] = [vertices[count-1][0],vertices[count-1][1]];
            /*path.vertices = vertices;
            path.inPoints = inPoints;
            path.outPoints = outPoints;*/
            bm_eventDispatcher.log(vertices);
            bm_eventDispatcher.log(inPoints);
            bm_eventDispatcher.log(outPoints);
            var myShape = path.property('Path').value;
            myShape.vertices = vertices;
            myShape.inTangents = inPoints;
            myShape.outTangents = outPoints;
            myShape.closed = true;
            path.property('Path').setValue(myShape);
        }
    }
    
    function addElements(group, elements){
        var gr = group.property("Contents").addProperty("ADBE Vector Group");
        var i, len = elements.length;
        for(i = 0; i < len; i += 1){
            if(elements[i].ty === 'g'){
                addElements(gr,elements[i].elems);
            } else if(elements[i].ty === 'path'){
                addPath(gr,elements[i]);
            }
        }
    }
    
    function createSvg(data) {
        var comp = app.project.items.addComp('svg', data.w, data.h, 1, 1, 1);
        var shapeLayer = comp.layers.addShape();
        var shapeGroup = shapeLayer.property("Contents").addProperty("ADBE Vector Group");
        var elements = data.elems;
        addElements(shapeGroup, elements);
        
    }
    
    return ob;
    
}())