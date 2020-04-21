$.__bodymovin.bm_boundingBox = (function () {
	var ob = {
		getBoundingBox: getBoundingBox,
		isBoxInContainer: isBoxInContainer
	};

    function getPoint(p1, p2, p3, p4, t) {
        var a = p1[0], b = p2[0], c = p3[0], d = p4[0];
        var diffT = 1-t;
        var diffTSq = diffT*diffT;
        var diffTCu = diffTSq*diffT;
        var tSq = t * t;
        var tCu = tSq * t;
        var x = a * diffTCu + b * 3 * diffTSq * t + c * 3 * diffT * tSq + d * tCu;
        a = p1[1];
        b = p2[1];
        c = p3[1];
        d = p4[1];
        var y = a * diffTCu + b * 3 * diffTSq * t + c * 3 * diffT * tSq + d * tCu;
        return [x, y];
    }

    function getTPos(p1, p2, p3, p4, arr) {
        var i;
        for (i = 0; i < 2; i += 1) {
            var c1 = p1[i], c2 = p2[i], c3 = p3[i], c4 = p4[i];
            var a = 3 * (-c1 + 3 * c2 - 3 * c3 + c4);
            var b = 6 * (c1 - 2 * c2 + c3);
            var c = 3 * (c2 - c1);
            var toSquareTerm = b*b - 4 * a * c;
            if (toSquareTerm >= 0) {
                var sqRtToSquareTerm = Math.sqrt(toSquareTerm);
                var t1 = (-b + sqRtToSquareTerm) / (2 * a);
                var t2 = (-b - sqRtToSquareTerm) / (2 * a);
                if (t1 >= 0 && t1 <= 1) {
                    arr.push(getPoint(p1, p2, p3, p4, t1));
                }
                if (t2 >= 0 && t2 <= 1) {
                    arr.push(getPoint(p1, p2, p3, p4, t2));
                }
            }
        }
    }

    function getCurveBox(p1, p2, p3, p4) {
        var bounds = {
            l:10000000000,
        	r:-10000000000,
        	t:10000000000,
        	b:-10000000000
        }
        var pts = [p1,p4];
        getTPos(p1, p2, p3, p4, pts);

        var minX = bounds.l, minY = bounds.t, maxX = bounds.r, maxY = bounds.b, pt;
        var i, len = pts.length;
        for (i = 0; i < len; i += 1) {
            pt = pts[i];
            if (minX > pt[0]) {
                minX = pt[0];
            }
            if (maxX < pt[0]) {
                maxX = pt[0];
            }
            if (minY > pt[1]) {
                minY = pt[1];
            }
            if (maxY < pt[1]) {
                maxY = pt[1];
            }
        }
        bounds.l = minX;
        bounds.t = minY;
        bounds.r = maxX;
        bounds.b = maxY;
        return bounds;
    }

	function getBoundingBox(shapeData, matrix) {
        var i, len = shapeData.v.length;
        var pt1,pt2,pt3,pt4, curveBox, box;
        var box = {
        	l:10000000000,
        	r:-10000000000,
        	t:10000000000,
        	b:-10000000000
        }

        for(i=0;i<len-1;i+=1){
        	var pt1Tr = matrix.applyToPoint(shapeData.v[i][0], shapeData.v[i][1], 0);
            pt1 = [pt1Tr.x,pt1Tr.y];
        	var pt2Tr = matrix.applyToPoint(shapeData.o[i][0] + shapeData.v[i][0], shapeData.o[i][1] + shapeData.v[i][1], 0);
            pt2 = [pt2Tr.x,pt2Tr.y];
        	var pt3Tr = matrix.applyToPoint(shapeData.i[i+1][0] + shapeData.v[i+1][0], shapeData.i[i+1][1] + shapeData.v[i+1][1], 0);
            pt3 = [pt3Tr.x,pt3Tr.y];
        	var pt4Tr = matrix.applyToPoint(shapeData.v[i+1][0], shapeData.v[i+1][1], 0);
            pt4 = [pt4Tr.x,pt4Tr.y];

            /*pt1 = shapeData.v[i];
            pt2 = [shapeData.o[i][0] + shapeData.v[i][0], shapeData.o[i][1] + shapeData.v[i][1]];
            pt3 = [shapeData.i[i+1][0] + shapeData.v[i+1][0], shapeData.i[i+1][1] + shapeData.v[i+1][1]];
            pt4 = shapeData.v[i+1];*/

            curveBox = getCurveBox(pt1,pt2,pt3,pt4);
            box.l = Math.min(box.l, curveBox.l);
            box.r = Math.max(box.r, curveBox.r);
            box.t = Math.min(box.t, curveBox.t);
            box.b = Math.max(box.b, curveBox.b);
		}
        pt1 = shapeData.v[i];
        pt2 = [shapeData.o[i][0] + shapeData.v[i][0], shapeData.o[i][1] + shapeData.v[i][1]];
        pt3 = [shapeData.i[0][0] + shapeData.v[0][0], shapeData.i[0][1] + shapeData.v[0][1]];
        pt4 = shapeData.v[0];
        curveBox = getCurveBox(pt1,pt2,pt3,pt4);
        box.l = Math.min(box.l, curveBox.l);
        box.r = Math.max(box.r, curveBox.r);
        box.t = Math.min(box.t, curveBox.t);
        box.b = Math.max(box.b, curveBox.b);

        return box;
	}

	function isBoxInContainer(box, container) {
		return container.l <= box.l && container.r >= box.r && container.t <= box.t && container.b >= box.b
	}

	return ob;
}())