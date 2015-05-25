function bezFunction(){

    var easingFunctions = [];
    var len = 0;
    var math = Math;

    function pointOnLine2D(x1,y1, x2,y2, x3,y3){
        return math.abs(((x2 - x1) * (y3 - y1)) - ((x3 - x1) * (y2 - y1))) < 0.00001;
    }

    function getEasingCurveByIndex(index){
        return easingFunctions[index].fnc;
    }

    function getEasingCurve(aa,bb,cc,dd,encodedFuncName) {
        if(!encodedFuncName){
            encodedFuncName = ('bez_' + aa+'_'+bb+'_'+cc+'_'+dd).replace(/\./g, 'p');
        }
        if(easingFunctions[encodedFuncName]){
            return easingFunctions[encodedFuncName];
        }
        var A0, B0, C0;
        var A1, B1, C1;
        easingFunctions[encodedFuncName] = function(x, t, b, c, d) {
            var tt = t/d;
            x = tt;
            var i = 0, z;
            while (++i < 14) {
                C0 = 3 * aa;
                B0 = 3 * (cc - aa) - C0;
                A0 = 1 - C0 - B0;
                z = (x * (C0 + x * (B0 + x * A0))) - tt;
                if (Math.abs(z) < 1e-3) break;
                x -= z / (C0 + x * (2 * B0 + 3 * A0 * x));
            }
            C1 = 3 * bb;
            B1 = 3 * (dd - bb) - C1;
            A1 = 1 - C1 - B1;
            var polyB = x * (C1 + x * (B1 + x * A1));
            return c * polyB + b;
        };
        return easingFunctions[encodedFuncName];
    }
    var getBezierLength = (function(){
        var storedBezierCurves = {};

        return function(pt1,pt2,pt3,pt4){
            ///return 0;
            var bezierName = (pt1.join('_')+'_'+pt2.join('_')+'_'+pt3.join('_')+'_'+pt4.join('_')).replace(/\./g, 'p');
            if(storedBezierCurves[bezierName]){
                return storedBezierCurves[bezierName];
            }
            var curveSegments = 100;
            var k;
            var i, len;
            var ptCoord,perc,addedLength = 0;
            var ptDistance;
            var point = [],lastPoint = [];
            if((pt1[0] != pt2[0] || pt1[1] != pt2[1]) && pointOnLine2D(pt1[0],pt1[1],pt2[0],pt2[1],pt3[0],pt3[1]) && pointOnLine2D(pt1[0],pt1[1],pt2[0],pt2[1],pt4[0],pt4[1])){
                curveSegments = 2;
            }
            len = pt3.length;
            for(k=0;k<curveSegments;k+=1){
                perc = k/(curveSegments-1);
                ptDistance = 0;
                for(i=0;i<len;i+=1){
                    ptCoord = Math.pow(1-perc,3)*pt1[i]+3*Math.pow(1-perc,2)*perc*pt3[i]+3*(1-perc)*Math.pow(perc,2)*pt4[i]+Math.pow(perc,3)*pt2[i];
                    point[i] = ptCoord;
                    if(lastPoint[i] !== null){
                        ptDistance += Math.pow(point[i] - lastPoint[i],2);
                    }
                    lastPoint[i] = point[i];
                }
                if(ptDistance){
                    ptDistance = Math.sqrt(ptDistance);
                    addedLength += ptDistance;
                }
            }
            storedBezierCurves[bezierName] = addedLength;
            return addedLength;
        }
    }());

    function createBezierPath(pt1,pt2,pt3,pt4){
        var curveStr = 'M'+pt1[0]+','+pt1[1];
        curveStr += 'C'+(pt1[0]+pt3[0])+','+(pt1[1]+pt3[1]);
        curveStr += ' '+(pt2[0]+pt4[0])+','+(pt2[1]+pt4[1]);
        curveStr += ' '+pt2[0]+','+pt2[1];
        return curveStr;
    }

    function createAbsolutePath(pt1,pt2,pt3,pt4){
        var curveStr = 'M'+pt1[0]+','+pt1[1];
        curveStr += 'C'+(pt3[0])+','+(pt3[1]);
        curveStr += ' '+(pt4[0])+','+(pt4[1]);
        curveStr += ' '+pt2[0]+','+pt2[1];
        return curveStr;
    }

    function buildBezierData(keyData){
        var pt1 = keyData.s;
        var pt2 = keyData.e;
        var pt3 = keyData.to;
        var pt4 = keyData.ti;
        var curveSegments = 500;
        var k;
        var i, len;
        var triCoord1,triCoord2,triCoord3,liCoord1,liCoord2,ptCoord,perc,addedLength = 0;
        var ptDistance;
        var point,lastPoint = null;
        var bezierData = {
            points :[],
            segmentLength: 0
        };
        if((pt1[0] != pt2[0] || pt1[1] != pt2[1]) && pointOnLine2D(pt1[0],pt1[1],pt2[0],pt2[1],pt1[0]+pt3[0],pt1[1]+pt3[1]) && pointOnLine2D(pt1[0],pt1[1],pt2[0],pt2[1],pt2[0]+pt4[0],pt2[1]+pt4[1])){
            curveSegments = 2;
        }
        len = pt3.length;
        for(k=0;k<curveSegments;k+=1){
            point = [];
            perc = k/(curveSegments-1);
            ptDistance = 0;
            for(i=0;i<len;i+=1){
                // DON'T ERASE. MIGHT BE USEFUL FOR DRAWING PARTIAL BEZIER CURVES.
                /*triCoord1 = pt1[i] + (pt3[i])*perc;
                triCoord2 = pt1[i] + pt3[i] + (pt2[i] + pt4[i] - (pt1[i] + pt3[i]))*perc;
                triCoord3 = pt2[i] + pt4[i] + -pt4[i]*perc;
                liCoord1 = triCoord1 + (triCoord2 - triCoord1)*perc;
                liCoord2 = triCoord2 + (triCoord3 - triCoord2)*perc;
                ptCoord = liCoord1 + (liCoord2 - liCoord1)*perc;*/
                //DON'T ERASE. SHOULD BE MORE PERFORMANT
                ptCoord = Math.pow(1-perc,3)*pt1[i]+3*Math.pow(1-perc,2)*perc*(pt1[i] + pt3[i])+3*(1-perc)*Math.pow(perc,2)*(pt2[i] + pt4[i])+Math.pow(perc,3)*pt2[i];
                //ptCoord = Math.pow(1-perc,3)*pt1[i]+3*Math.pow(1-perc,2)*perc*pt3[i]+3*(1-perc)*Math.pow(perc,2)*pt4[i]+Math.pow(perc,3)*pt2[i];
                point.push(ptCoord);
                if(lastPoint !== null){
                    ptDistance += Math.pow(point[i] - lastPoint[i],2);
                }
            }
            ptDistance = Math.sqrt(ptDistance);
            addedLength += ptDistance;
            bezierData.points.push({partialLength: ptDistance,cumulatedLength:addedLength, point: point});
            lastPoint = point;
        }
        bezierData.segmentLength = addedLength;
        keyData.bezierData = bezierData;
    }

    function getNewSegment(pt1,pt2,pt3,pt4,startPerc,endPerc){
        var pts = {
            pt1:[],
            pt2:[],
            pt3:[],
            pt4:[]
        };
        var pth = document.createElementNS(svgNS,'path');
        pth.setAttribute('d','M'+pt1[0]+','+pt1[1]+' C'+pt3[0]+','+pt3[1]+' '+pt4[0]+','+pt4[1]+' '+pt2[0]+','+pt2[1]);
        startPerc = startPerc < 0 ? 0 : startPerc;
        endPerc = endPerc > 1 ? 1 : endPerc;
        console.log('pth: ',pth.getPointAtLength(pth.getTotalLength()*endPerc));
        var pto = pth.getPointAtLength(pth.getTotalLength()*endPerc);
        console.log('startPerc: ',startPerc);
        console.log('endPerc: ',endPerc);
        var triCoord1,triCoord2,triCoord3,liCoord1,liCoord2,ptCoord,perc;
        var i, len = pt1.length;
        perc = startPerc;
        /*
         triCoord1 = pt1[i] + (pt3[i])*perc;
         triCoord2 = pt1[i] + pt3[i] + (pt2[i] + pt4[i] - (pt1[i] + pt3[i]))*perc;
         triCoord3 = pt2[i] + pt4[i] + -pt4[i]*perc;
         liCoord1 = triCoord1 + (triCoord2 - triCoord1)*perc;
         liCoord2 = triCoord2 + (triCoord3 - triCoord2)*perc;
         ptCoord = liCoord1 + (liCoord2 - liCoord1)*perc;*/
        for(i=0;i<len;i+=1){
            triCoord1 = pt1[i] + (pt3[i] - pt1[i])*perc;
            triCoord2 = pt3[i] + (pt4[i] - (pt3[i]))*perc;
            triCoord3 = pt4[i] + (pt2[i] - pt4[i])*perc;
            liCoord1 = triCoord1 + (triCoord2 - triCoord1)*perc;
            liCoord2 = triCoord2 + (triCoord3 - triCoord2)*perc;
            ptCoord = liCoord1 + (liCoord2 - liCoord1)*perc;
            pts.pt1[i] = ptCoord;
            pts.pt3[i] = liCoord2;
        }
        perc = endPerc;
        for(i=0;i<len;i+=1){
            triCoord1 = pt1[i] + (pt3[i] - pt1[i])*perc;
            triCoord2 = pt3[i] + (pt4[i] - (pt3[i]))*perc;
            triCoord3 = pt4[i] + (pt2[i] - pt4[i])*perc;
            liCoord1 = triCoord1 + (triCoord2 - triCoord1)*perc;
            liCoord2 = triCoord2 + (triCoord3 - triCoord2)*perc;
            ptCoord = liCoord1 + (liCoord2 - liCoord1)*perc;
            pts.pt2[i] = ptCoord;
            pts.pt4[i] = liCoord2;
        }
        pts.pt2[0] = pto.x;
        pts.pt2[1] = pto.y;
        return pts;
    }

    return {
        getEasingCurve : getEasingCurve,
        getEasingCurveByIndex : getEasingCurveByIndex,
        getBezierLength : getBezierLength,
        getNewSegment : getNewSegment,
        buildBezierData : buildBezierData
    };
}

var bez = bezFunction();