function bezFunction(){

    var easingFunctions = [];
    var len = 0;
    var storedBezierCurves = {};
    window.polyCount = 0;
    window.curveCount = 0;
    window.retCount = 0;
    window.passCount = 0;
    var math = Math;

    function pointOnLine2D(x1,y1, x2,y2, x3,y3){
        return Math.abs(((x2 - x1) * (y3 - y1)) - ((x3 - x1) * (y2 - y1))) < 0.0000001;
    }

    function getEasingCurveByIndex(index){
        window.polyCount += 1;
        return easingFunctions[index].fnc;
    }

    function getEasingCurve(p1X,p1Y,p2X,p2Y) {
        //polyCount += 1;
        //encodedFuncName = ('bez_' + p1X+'_'+p1Y+'_'+p2X+'_'+p2Y).replace(/\./g, 'p');
        //encodedFuncName = p1X.replace(/\./g, 'p');
        var i = 0;
        while(i<len){
            if(easingFunctions[i].p1X == p1X && easingFunctions[i].p1Y == p1Y && easingFunctions[i].p2X == p2X && easingFunctions[i].p2Y == p2Y){
                window.retCount += 1;
                return easingFunctions[i].fnc;
            }
            i += 1;
        }
        window.passCount += 1;
        len += 1;
        var fnc = function(x, t, b, c, d) {
            t = t/d;
            var x2 = t, i = 0, z;
            var A1,B1,C1,A2,B2,C2;
            while (++i < 14) {
                C1 = 3 * p1X, B1 = 3 * (p2X - p1X) - C1, A1 = 1 - C1 - B1;
                z = t * (C1 + t * (B1 + t * A1));
                if (math.abs(z) < 1e-3) break;
                x2 -= z / (C1 + x2 * (2 * B1 + 3 * A1 * x2));
            }
            C2 = 3 * p1Y;
            B2 = 3 * (p2Y - p1Y) - C2;
            A2 = 1 - C2 - B2;
            var polybez =  t * (C2 + t * (B2 + t * A2));

            return c * polybez + b;
        };
        easingFunctions.push({
            p1X:p1X,
            p1Y:p1Y,
            p2X:p2X,
            p2Y:p2Y,
            fnc: fnc
        });
        fnc.__index = len - 1;
        return easingFunctions[len-1].fnc;
    }

    function drawBezierCurve(pt1,pt2,pt3,pt4){
        ///return 0;
        var bezierName = (pt1.join('_')+'_'+pt2.join('_')+'_'+pt3.join('_')+'_'+pt4.join('_')).replace(/\./g, 'p');
        if(storedBezierCurves[bezierName]){
            return storedBezierCurves[bezierName];
        }
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
        if(pointOnLine2D(pt1[0],pt1[1],pt2[0],pt2[1],pt1[0]+pt3[0],pt1[1]+pt3[1])
            && pointOnLine2D(pt1[0],pt1[1],pt2[0],pt2[1],pt2[0]+pt4[0],pt2[1]+pt4[1])){
            curveSegments = 2;
        }
        len = pt3.length;
        for(k=0;k<curveSegments;k+=1){
            point = [];
            perc = k/(curveSegments-1);
            ptDistance = 0;
            for(i=0;i<len;i+=1){
                triCoord1 = pt1[i] + (pt3[i])*perc;
                triCoord2 = pt1[i] + pt3[i] + (pt2[i] + pt4[i] - (pt1[i] + pt3[i]))*perc;
                triCoord3 = pt2[i] + pt4[i] + -pt4[i]*perc;
                liCoord1 = triCoord1 + (triCoord2 - triCoord1)*perc;
                liCoord2 = triCoord2 + (triCoord3 - triCoord2)*perc;
                ptCoord = liCoord1 + (liCoord2 - liCoord1)*perc;
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
        storedBezierCurves[bezierName] = bezierData;
        return bezierData;
    }

    function buildBezierData(keyData){
        ///return 0;
        keyData.bezierData = drawBezierCurve(keyData.s,keyData.e,keyData.to,keyData.ti);
    }

    var ob = {
        getEasingCurve : getEasingCurve,
        getEasingCurveByIndex : getEasingCurveByIndex,
        drawBezierCurve : drawBezierCurve,
        buildBezierData : buildBezierData
    };

    return ob;
};

var bez = bezFunction();