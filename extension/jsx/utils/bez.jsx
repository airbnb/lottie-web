function bezFunction(){

    var easingFunctions = [];
    var math = Math;
    var defaultCurveSegments = 200;
    var bm_abs = Math.abs;
    var bm_pow = Math.pow;
    var bm_sqrt = Math.sqrt;
    var bm_floor = Math.floor;

    function pointOnLine2D(x1,y1, x2,y2, x3,y3){
        return bm_abs(((x2 - x1) * (y3 - y1)) - ((x3 - x1) * (y2 - y1))) < 0.00001;
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
            while (++i < 20) {
                C0 = 3 * aa;
                B0 = 3 * (cc - aa) - C0;
                A0 = 1 - C0 - B0;
                z = (x * (C0 + x * (B0 + x * A0))) - tt;
                if (bm_abs(z) < 1e-3) break;
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

        function Segment(l,p){
            this.l = l;
            this.p = p;
        }

        return function(pt1,pt2,pt3,pt4){
            var bezierName = (pt1.join('_')+'_'+pt2.join('_')+'_'+pt3.join('_')+'_'+pt4.join('_')).replace(/\./g, 'p');
            if(storedBezierCurves[bezierName]){
                return storedBezierCurves[bezierName];
            }
            var curveSegments = defaultCurveSegments;
            var k;
            var i, len;
            var ptCoord,perc,addedLength = 0;
            var ptDistance;
            var point = [],lastPoint = [];
            var lengthData = {
                addedLength: 0,
                segments: []
            };
            if((pt1[0] != pt2[0] || pt1[1] != pt2[1]) && pointOnLine2D(pt1[0],pt1[1],pt2[0],pt2[1],pt3[0],pt3[1]) && pointOnLine2D(pt1[0],pt1[1],pt2[0],pt2[1],pt4[0],pt4[1])){
                curveSegments = 2;
            }
            len = pt3.length;
            for(k=0;k<curveSegments;k+=1){
                perc = k/(curveSegments-1);
                ptDistance = 0;
                for(i=0;i<len;i+=1){
                    ptCoord = bm_pow(1-perc,3)*pt1[i]+3*bm_pow(1-perc,2)*perc*pt3[i]+3*(1-perc)*bm_pow(perc,2)*pt4[i]+bm_pow(perc,3)*pt2[i];
                    point[i] = ptCoord;
                    if(lastPoint[i] !== null){
                        ptDistance += bm_pow(point[i] - lastPoint[i],2);
                    }
                    lastPoint[i] = point[i];
                }
                if(ptDistance){
                    ptDistance = bm_sqrt(ptDistance);
                    addedLength += ptDistance;
                }
                lengthData.segments.push(new Segment(addedLength,perc));
            }
            lengthData.addedLength = addedLength;
            storedBezierCurves[bezierName] = lengthData;
            return lengthData;
        };
    }());

    function BezierData(length){
        this.segmentLength = 0;
        this.points = new Array(length);
    }

    function PointData(partial,point){
        this.partialLength = partial;
        this.point = point;
    }

    var buildBezierData = (function(){

        var storedData = {};

        return function (keyData){
            var pt1 = keyData.s;
            var pt2 = keyData.e;
            var pt3 = keyData.to;
            var pt4 = keyData.ti;
            var bezierName = (pt1.join('_')+'_'+pt2.join('_')+'_'+pt3.join('_')+'_'+pt4.join('_')).replace(/\./g, 'p');
            if(storedData[bezierName]){
                return storedData[bezierName];
            }
        var curveSegments = defaultCurveSegments;
        var k, i, len;
            var ptCoord,perc,addedLength = 0;
            var ptDistance;
            var point,lastPoint = null;
            if((pt1[0] != pt2[0] || pt1[1] != pt2[1]) && pointOnLine2D(pt1[0],pt1[1],pt2[0],pt2[1],pt1[0]+pt3[0],pt1[1]+pt3[1]) && pointOnLine2D(pt1[0],pt1[1],pt2[0],pt2[1],pt2[0]+pt4[0],pt2[1]+pt4[1])){
                curveSegments = 2;
            }
            var bezierData = new BezierData(curveSegments);
            len = pt3.length;
            for(k=0;k<curveSegments;k+=1){
            point = new Array(len);
                perc = k/(curveSegments-1);
                ptDistance = 0;
                for(i=0;i<len;i+=1){
                ptCoord = bm_pow(1-perc,3)*pt1[i]+3*bm_pow(1-perc,2)*perc*(pt1[i] + pt3[i])+3*(1-perc)*bm_pow(perc,2)*(pt2[i] + pt4[i])+bm_pow(perc,3)*pt2[i];
                point[i] = ptCoord;
                    if(lastPoint !== null){
                    ptDistance += bm_pow(point[i] - lastPoint[i],2);
                    }
                }
            ptDistance = bm_sqrt(ptDistance);
                addedLength += ptDistance;
                bezierData.points[k] = new PointData(ptDistance,point);
                lastPoint = point;
            }
            bezierData.segmentLength = addedLength;
            storedData[bezierName] = bezierData;
            return bezierData;

        }
    }());

    function getDistancePerc(perc,bezierData){
        var segments = bezierData.segments;
        var len = segments.length;
        var initPos = bm_floor((len-1)*perc);
        var lengthPos = perc*bezierData.addedLength;
        var lPerc = 0;
        if(lengthPos == segments[initPos].l){
            return segments[initPos].p;
        }else{
            var dir = segments[initPos].l > lengthPos ? -1 : 1;
            var flag = true;
            while(flag){
                if(segments[initPos].l <= lengthPos && segments[initPos+1].l > lengthPos){
                    lPerc = (lengthPos - segments[initPos].l)/(segments[initPos+1].l-segments[initPos].l);
                    flag = false;
                }else{
                    initPos += dir;
                }
                if(initPos < 0 || initPos >= len - 1){
                    flag = false;
                }
            }
            return segments[initPos].p + (segments[initPos+1].p - segments[initPos].p)*lPerc;
        }
    }

    function SegmentPoints(){
        this.pt1 = new Array(2);
        this.pt2 = new Array(2);
        this.pt3 = new Array(2);
        this.pt4 = new Array(2);
    }

    function getNewSegment(pt1,pt2,pt3,pt4,startPerc,endPerc, bezierData){
        var pts = new SegmentPoints();
        startPerc = startPerc < 0 ? 0 : startPerc;
        var t0 = getDistancePerc(startPerc,bezierData);
        endPerc = endPerc > 1 ? 1 : endPerc;
        var t1 = getDistancePerc(endPerc,bezierData);
        var i, len = pt1.length;
        var u0 = 1 - t0;
        var u1 = 1 - t1;
        for(i=0;i<len;i+=1){
            pts.pt1[i] =  u0*u0*u0* pt1[i] + (t0*u0*u0 + u0*t0*u0 + u0*u0*t0) * pt3[i] + (t0*t0*u0 + u0*t0*t0 + t0*u0*t0)* pt4[i] + t0*t0*t0* pt2[i];
            pts.pt3[i] = u0*u0*u1*pt1[i] + (t0*u0*u1 + u0*t0*u1 + u0*u0*t1)* pt3[i] + (t0*t0*u1 + u0*t0*t1 + t0*u0*t1)* pt4[i] + t0*t0*t1* pt2[i];
            pts.pt4[i] = u0*u1*u1* pt1[i] + (t0*u1*u1 + u0*t1*u1 + u0*u1*t1)* pt3[i] + (t0*t1*u1 + u0*t1*t1 + t0*u1*t1)* pt4[i] + t0*t1*t1* pt2[i];
            pts.pt2[i] = u1*u1*u1* pt1[i] + (t1*u1*u1 + u1*t1*u1 + u1*u1*t1)* pt3[i] + (t1*t1*u1 + u1*t1*t1 + t1*u1*t1)*pt4[i] + t1*t1*t1* pt2[i];
        }
        return pts;
    }

    return {
        getEasingCurve : getEasingCurve,
        getBezierLength : getBezierLength,
        getNewSegment : getNewSegment,
        buildBezierData : buildBezierData
    };
}

var bez = bezFunction();