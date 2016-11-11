/*jslint vars: true , plusplus: true, continue:true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global bm_keyframeHelper, bm_eventDispatcher, bm_generalUtils, PropertyFactory, Matrix*/
var bm_shapeHelper = (function () {
    'use strict';
    var ob = {}, shapeItemTypes = {
        shape: 'sh',
        rect: 'rc',
        ellipse: 'el',
        star: 'sr',
        fill: 'fl',
        gfill: 'gf',
        gStroke: 'gs',
        stroke: 'st',
        merge: 'mm',
        trim: 'tm',
        group: 'gr',
        roundedCorners: 'rd'
    };
    var navigationShapeTree = [];

    function getItemType(matchName) {
        switch (matchName) {
        case 'ADBE Vector Shape - Group':
            return shapeItemTypes.shape;
        case 'ADBE Vector Shape - Star':
            return shapeItemTypes.star;
        case 'ADBE Vector Shape - Rect':
            return shapeItemTypes.rect;
        case 'ADBE Vector Shape - Ellipse':
            return shapeItemTypes.ellipse;
        case 'ADBE Vector Graphic - Fill':
            return shapeItemTypes.fill;
        case 'ADBE Vector Graphic - Stroke':
            return shapeItemTypes.stroke;
        case 'ADBE Vector Graphic - Merge':
        case 'ADBE Vector Filter - Merge':
            return shapeItemTypes.merge;
        case 'ADBE Vector Graphic - Trim':
        case 'ADBE Vector Filter - Trim':
            return shapeItemTypes.trim;
        case 'ADBE Vector Filter - RC':
            return shapeItemTypes.roundedCorners;
        case 'ADBE Vector Group':
            return shapeItemTypes.group;
        case 'ADBE Vector Graphic - G-Fill':
            return shapeItemTypes.gfill;
        case 'ADBE Vector Graphic - G-Stroke':
            return shapeItemTypes.gStroke;
        default:
            bm_eventDispatcher.log(matchName);
            return '';
        }
    }
    
    function reverseShape(ks) {
        var newI = [], newO = [], newV = [];
        var i, len,isClosed;
        if (ks.i) {
            var init = 0;
            isClosed = ks.c;

            if (isClosed) {
                newI[0] = ks.o[0];
                newO[0] = ks.i[0];
                newV[0] = ks.v[0];
                init = 1;
            }
            len = ks.i.length;
            var cnt = len - 1;
            
            for (i = init; i < len; i += 1) {
                newI.push(ks.o[cnt]);
                newO.push(ks.i[cnt]);
                newV.push(ks.v[cnt]);
                cnt -= 1;
            }
            
            ks.i = newI;
            ks.o = newO;
            ks.v = newV;
        } else {
            len = ks.length;
            for (i = 0; i < len; i += 1) {
                if(ks[i].s){
                    reverseShape(ks[i].s[0]);
                }
                if(ks[i].e){
                    reverseShape(ks[i].e[0]);
                }
            }
        }
    }

    function sliceBezier(pt1,pt2,pt3,pt4, t){
        var x1 = pt1[0], y1 = pt1[1];
        var x2 = pt2[0]+pt1[0], y2 = pt2[1]+pt1[1];
        var x3 = pt3[0]+pt4[0], y3 = pt3[1]+pt4[1];
        var x4 = pt4[0], y4 = pt4[1];
        var x12 = (x2-x1)*t+x1;
        var y12 = (y2-y1)*t+y1;

        var x23 = (x3-x2)*t+x2;
        var y23 = (y3-y2)*t+y2;

        var x34 = (x4-x3)*t+x3;
        var y34 = (y4-y3)*t+y3;

        var x123 = (x23-x12)*t+x12;
        var y123 = (y23-y12)*t+y12;

        var x234 = (x34-x23)*t+x23;
        var y234 = (y34-y23)*t+y23;

        var x1234 = (x234-x123)*t+x123;
        var y1234 = (y234-y123)*t+y123;

        return [[x1, y1], [x12, y12], [x123, y123], [x1234, y1234]];

    }

    function getCurvesAtPerc(pt1,pt2,pt3,pt4, t){
        var A = [pt1[0],pt1[1]];
        var B = [pt2[0],pt2[1]];
        var C = [pt3[0],pt3[1]];
        var D = [pt4[0],pt4[1]];
        var E = [A[0]+(B[0]-A[0])*t, A[1]+(B[1]-A[1])*t];
        var F = [B[0]+(C[0]-B[0])*t, B[1]+(C[1]-B[1])*t];
        var G = [C[0]+(D[0]-C[0])*t, C[1]+(D[1]-C[1])*t];
        var H = [E[0]+(F[0]-E[0])*t, E[1]+(F[1]-E[1])*t];
        var I = [F[0]+(G[0]-F[0])*t, F[1]+(G[1]-F[1])*t];
        var J = [H[0]+(I[0]-H[0])*t, H[1]+(I[1]-H[1])*t];
        if(A[0] === B[0] && A[1] === B[1] && C[0] === D[0] && C[1] === D[1]){
            return {
                c1: [A,A,J,J],
                c2:[J,J,D,D]
            }
        } else {
            return {
                c1: [A,E,H,J],
                c2: [J,I,G,D]
            };
        }
    }

    function addVertices(shape, totalVertices){
        var iterations = [1,2,4,7,14, 28, 56, 112, 224, 448];
        var shapeVertices = shape.i.length;
        var closed = shape.c;
        var sides = shapeVertices;
        var interpolatableSides = closed ? sides : sides - 1;
        var missingVertices = totalVertices - shapeVertices;
        var i;
        var currentIteration = 0;
        var nodesPerSide = [];
        for(i=0;i<sides;i+=1){
            nodesPerSide[i] = 0;
        }
        while(missingVertices>0){
            for(i=0;i<interpolatableSides;i+=1){
                if(missingVertices>0){
                    nodesPerSide[i] += Math.min(missingVertices,iterations[currentIteration]);
                }
                missingVertices -= iterations[currentIteration];
            }
            currentIteration += 1;
        }

        var count = 0;
        var newV = [];
        var newI = [];
        var newO = [];

        var pt1, pt2, pt3, pt4, curves;
        var j;
        for(i = 0; i < sides; i +=1){
            if(nodesPerSide[i] === 0){
                newV[count] = [shape.v[i][0],shape.v[i][1]];
                newO[count] = [shape.o[i][0],shape.o[i][1]];
                if(i === sides - 1){
                    newI[0] = [shape.i[0][0],shape.i[0][1]];
                } else {
                    newI[count+1] = [shape.i[i+1][0],shape.i[i+1][1]];
                }
                count += 1;
            } else {
                if(i === sides - 1 && closed){
                    pt1 = [shape.v[i][0],shape.v[i][1]];
                    pt2 = [shape.o[i][0] + shape.v[i][0],shape.o[i][1] + shape.v[i][1]];
                    pt3 = [shape.i[0][0] + shape.v[0][0],shape.i[0][1] + shape.v[0][1]];
                    pt4 = [shape.v[0][0],shape.v[0][1]];
                } else {
                    pt1 = [shape.v[i][0],shape.v[i][1]];
                    pt2 = [shape.o[i][0] + shape.v[i][0],shape.o[i][1] + shape.v[i][1]];
                    pt3 = [shape.i[i+1][0] + shape.v[i+1][0],shape.i[i+1][1] + shape.v[i+1][1]];
                    pt4 = [shape.v[i+1][0],shape.v[i+1][1]];
                }

                var sideNodes = nodesPerSide[i] + 1;

                for(j=0;j<sideNodes;j+=1){
                    if(j<sideNodes - 1){
                        curves = getCurvesAtPerc(pt1,pt2,pt3,pt4, 1/(sideNodes-j));
                        newV[count] = [curves.c1[0][0],curves.c1[0][1]];
                        newO[count] = [curves.c1[1][0]-curves.c1[0][0],curves.c1[1][1] - curves.c1[0][1]];
                        if(count === totalVertices - 1){
                            newI[0] = [curves.c2[2][0]-curves.c2[0][0],curves.c2[2][1] - curves.c2[0][1]];
                        } else {
                            newI[count+1] = [curves.c1[2][0]-curves.c1[3][0],curves.c1[2][1] - curves.c1[3][1]];
                        }
                        pt1 = [curves.c2[0][0],curves.c2[0][1]];
                        pt2 = [curves.c2[1][0],curves.c2[1][1]];
                        pt3 = [curves.c2[2][0],curves.c2[2][1]];
                        pt4 = [curves.c2[3][0],curves.c2[3][1]];
                    } else {
                        newV[count] = [curves.c2[0][0],curves.c2[0][1]];
                        newO[count] = [curves.c2[1][0]-curves.c2[0][0],curves.c2[1][1] - curves.c2[0][1]];
                        if(count === totalVertices - 1){
                            newI[0] = [curves.c2[2][0]-curves.c2[3][0],curves.c2[2][1] - curves.c2[3][1]];
                        } else {
                            newI[count+1] = [curves.c2[2][0]-curves.c2[3][0],curves.c2[2][1] - curves.c2[3][1]];
                        }
                    }
                    count += 1;
                }
            }
        }
        shape.v = newV;
        shape.o = newO;
        shape.i = newI;
    }

    function checkVertexCount(shape){
        if(shape.i){
            return;
        }
        var i, len = shape.length;
        var maxVertextCount = shape[0].s[0].i.length;
        var variesCount = false;
        for (i = 0; i < len; i += 1) {
            if(shape[i].s && shape[i].s[0]){
                if(maxVertextCount !== shape[i].s[0].i.length){
                    maxVertextCount = Math.max(maxVertextCount, shape[i].s[0].i.length);
                    variesCount = true;
                }
            }
            if(shape[i].e && shape[i].e[0]){
                if(maxVertextCount !== shape[i].e[0].i.length){
                    maxVertextCount = Math.max(maxVertextCount, shape[i].e[0].i.length);
                    variesCount = true;
                }
            }
        }
        for (i = 0; i < len; i += 1) {
            if(shape[i].s && shape[i].s[0] && maxVertextCount !== shape[i].s[0].i.length){
                addVertices(shape[i].s[0], maxVertextCount);
            }
            if(shape[i].e && shape[i].e[0] && maxVertextCount !== shape[i].e[0].i.length){
                addVertices(shape[i].e[0], maxVertextCount);
            }
        }
    }
    
    function iterateProperties(iteratable, array, frameRate, isText) {
        var i, len = iteratable.numProperties, ob, prop, itemType;
        for (i = 0; i < len; i += 1) {
            ob = null;
            prop = iteratable.property(i + 1);
            if (prop.enabled) {
                itemType = getItemType(prop.matchName);
                if (isText && itemType !== shapeItemTypes.shape && itemType !== shapeItemTypes.group && itemType !== shapeItemTypes.merge) {
                    continue;
                }
                if (itemType === shapeItemTypes.shape) {
                    ob = {};
                    ob.ind = i;
                    ob.ty = itemType;
                    ob.ks = bm_keyframeHelper.exportKeyframes(prop.property('Path'), frameRate);
                    checkVertexCount(ob.ks.k);
                    if (prop.property("Shape Direction").value === 3) {
                        reverseShape(ob.ks.k);
                    }
                    //bm_generalUtils.convertPathsToAbsoluteValues(ob.ks.k);
                } else if (itemType === shapeItemTypes.rect && !isText) {
                    ob = {};
                    ob.ty = itemType;
                    ob.d = prop.property("Shape Direction").value;
                    ob.s = bm_keyframeHelper.exportKeyframes(prop.property('Size'), frameRate);
                    ob.p = bm_keyframeHelper.exportKeyframes(prop.property('Position'), frameRate);
                    ob.r = bm_keyframeHelper.exportKeyframes(prop.property('Roundness'), frameRate);
                } else if(itemType === shapeItemTypes.star && !isText) {
                    ob = {};
                    bm_generalUtils.iterateProperty(prop);
                    ob.ty = itemType;
                    ob.sy = prop.property("Type").value;
                    ob.d = prop.property("Shape Direction").value;
                    ob.pt = bm_keyframeHelper.exportKeyframes(prop.property('Points'), frameRate);
                    ob.pt.ix = prop.property('Points').propertyIndex;
                    ob.p = bm_keyframeHelper.exportKeyframes(prop.property('Position'), frameRate);
                    ob.p.ix = prop.property('Position').propertyIndex;
                    ob.r = bm_keyframeHelper.exportKeyframes(prop.property('Rotation'), frameRate);
                    ob.r.ix = prop.property('Rotation').propertyIndex;
                    if(ob.sy === 1) {
                        ob.ir = bm_keyframeHelper.exportKeyframes(prop.property('Inner Radius'), frameRate);
                        ob.ir.ix = prop.property('Inner Radius').propertyIndex;
                        ob.is = bm_keyframeHelper.exportKeyframes(prop.property('Inner Roundness'), frameRate);
                        ob.is.ix = prop.property('Inner Roundness').propertyIndex;
                    }
                    ob.or = bm_keyframeHelper.exportKeyframes(prop.property('Outer Radius'), frameRate);
                    ob.or.ix = prop.property('Outer Radius').propertyIndex;
                    ob.os = bm_keyframeHelper.exportKeyframes(prop.property('Outer Roundness'), frameRate);
                    ob.os.ix = prop.property('Outer Roundness').propertyIndex;
                    ob.ix = prop.propertyIndex;
                } else if (itemType === shapeItemTypes.ellipse) {
                    ob = {};
                    ob.d = prop.property("Shape Direction").value;
                    ob.ty = itemType;
                    ob.s = bm_keyframeHelper.exportKeyframes(prop.property('Size'), frameRate);
                    ob.p = bm_keyframeHelper.exportKeyframes(prop.property('Position'), frameRate);
                } else if (itemType === shapeItemTypes.fill) {
                    ob = {};
                    ob.ty = itemType;
                    ob.fillEnabled = prop.enabled;
                    ob.c = bm_keyframeHelper.exportKeyframes(prop.property('Color'), frameRate);
                    ob.o = bm_keyframeHelper.exportKeyframes(prop.property('Opacity'), frameRate);
                } else if (itemType === shapeItemTypes.gfill) {
                    ob = {};
                    ob.ty = itemType;
                    ob.o = bm_keyframeHelper.exportKeyframes(prop.property('Opacity'), frameRate);
                    navigationShapeTree.push(prop.name);
                    exportGradientData(ob,prop,frameRate, navigationShapeTree);
                    navigationShapeTree.pop();

                } else if (itemType === shapeItemTypes.gStroke) {
                    ob = {};
                    ob.ty = itemType;
                    ob.o = bm_keyframeHelper.exportKeyframes(prop.property('Opacity'), frameRate);
                    ob.w = bm_keyframeHelper.exportKeyframes(prop.property('Stroke Width'), frameRate);
                    navigationShapeTree.push(prop.name);
                    exportGradientData(ob,prop,frameRate, navigationShapeTree);
                    navigationShapeTree.pop();
                    ob.lc = prop.property('Line Cap').value;
                    ob.lj = prop.property('Line Join').value;
                    if (ob.lj === 1) {
                        ob.ml = prop.property('Miter Limit').value;
                    }
                    getDashData(ob,prop, frameRate);

                } else if (itemType === shapeItemTypes.stroke) {
                    ob = {};
                    ob.ty = itemType;
                    ob.fillEnabled = prop.enabled;
                    ob.c = bm_keyframeHelper.exportKeyframes(prop.property('Color'), frameRate);
                    ob.o = bm_keyframeHelper.exportKeyframes(prop.property('Opacity'), frameRate);
                    ob.w = bm_keyframeHelper.exportKeyframes(prop.property('Stroke Width'), frameRate);
                    ob.lc = prop.property('Line Cap').value;
                    ob.lj = prop.property('Line Join').value;
                    if (ob.lj === 1) {
                        ob.ml = prop.property('Miter Limit').value;
                    }
                    getDashData(ob,prop, frameRate);

                } else if (itemType === shapeItemTypes.merge) {
                    ob = {};
                    ob.ty = itemType;
                    ob.mm = prop.property('ADBE Vector Merge Type').value;
                } else if (itemType === shapeItemTypes.trim) {
                    ob = {};
                    ob.ty = itemType;
                    ob.s = bm_keyframeHelper.exportKeyframes(prop.property('Start'), frameRate);
                    ob.s.ix = prop.property('Start').propertyIndex;
                    ob.e = bm_keyframeHelper.exportKeyframes(prop.property('End'), frameRate);
                    ob.e.ix = prop.property('End').propertyIndex;
                    ob.o = bm_keyframeHelper.exportKeyframes(prop.property('Offset'), frameRate);
                    ob.o.ix = prop.property('Offset').propertyIndex;
                    ob.m = prop.property('Trim Multiple Shapes').value;
                    ob.ix = prop.propertyIndex;
                } else if (itemType === shapeItemTypes.group) {
                    ob = {
                        ty : itemType,
                        it: [],
                        nm: prop.name
                    };
                    navigationShapeTree.push(prop.name);
                    iterateProperties(prop.property('Contents'), ob.it, frameRate, isText);
                    if (!isText) {
                        var trOb = {};
                        var transformProperty = prop.property('Transform');
                        trOb.ty = 'tr';
                        trOb.p = bm_keyframeHelper.exportKeyframes(transformProperty.property('Position'), frameRate);
                        trOb.p.ix = transformProperty.property('Position').propertyIndex;
                        trOb.a = bm_keyframeHelper.exportKeyframes(transformProperty.property('Anchor Point'), frameRate);
                        trOb.a.ix = transformProperty.property('Anchor Point').propertyIndex;
                        trOb.s = bm_keyframeHelper.exportKeyframes(transformProperty.property('Scale'), frameRate);
                        trOb.s.ix = transformProperty.property('Scale').propertyIndex;
                        trOb.r = bm_keyframeHelper.exportKeyframes(transformProperty.property('Rotation'), frameRate);
                        trOb.r.ix = transformProperty.property('Rotation').propertyIndex;
                        trOb.o = bm_keyframeHelper.exportKeyframes(transformProperty.property('Opacity'), frameRate);
                        trOb.o.ix = transformProperty.property('Opacity').propertyIndex;
                        if(transformProperty.property('Skew').canSetExpression) {
                            trOb.sk = bm_keyframeHelper.exportKeyframes(transformProperty.property('Skew'), frameRate);
                            trOb.sk.ix = transformProperty.property('Skew').propertyIndex;
                            trOb.sa = bm_keyframeHelper.exportKeyframes(transformProperty.property('Skew Axis'), frameRate);
                            trOb.sa.ix = transformProperty.property('Skew Axis').propertyIndex;
                        }
                        trOb.nm = transformProperty.name;
                        ob.it.push(trOb);
                    }
                    navigationShapeTree.pop();
                } else if (itemType === shapeItemTypes.roundedCorners) {
                    ob = {
                        ty : itemType,
                        nm: prop.name
                    };
                    ob.r = bm_keyframeHelper.exportKeyframes(prop.property('Radius'), frameRate);
                }
                if (ob) {
                    ob.nm = prop.name;
                    var layerAttributes = bm_generalUtils.findAttributes(prop.name);
                    if(layerAttributes.ln){
                        ob.ln = layerAttributes.ln;
                    }
                    if(layerAttributes.cl){
                        ob.cl = layerAttributes.cl;
                    }
                    array.push(ob);
                }
            }
            
        }
    }

    function exportGradientData(ob,prop,frameRate, navigationShapeTree){
        var property = prop.property('Colors');
        var gradientData = bm_ProjectHelper.getGradientData(navigationShapeTree, property.numKeys);
        ob.g = {
            p:gradientData.p,
            k:bm_keyframeHelper.exportKeyframes(property, frameRate, gradientData.m)
        };
        ob.s = bm_keyframeHelper.exportKeyframes(prop.property('Start Point'), frameRate);
        ob.e = bm_keyframeHelper.exportKeyframes(prop.property('End Point'), frameRate);
        ob.t = prop.property('Type').value;
        if(ob.t === 2){
            ob.h = bm_keyframeHelper.exportKeyframes(prop.property('Highlight Length'), frameRate);
            ob.a = bm_keyframeHelper.exportKeyframes(prop.property('Highlight Angle'), frameRate);
        }
    }
    
    function getDashData(ob,prop, frameRate){
        var j, jLen = prop.property('Dashes').numProperties;
        var dashesData = [];
        var changed = false;
        for (j = 0; j < jLen; j += 1) {
            if (prop.property('Dashes').property(j + 1).canSetExpression) {
                changed = true;
                var dashData = {};
                var name = '';
                if (prop.property('Dashes').property(j + 1).matchName.indexOf('ADBE Vector Stroke Dash') !== -1) {
                    name = 'd';
                } else if (prop.property('Dashes').property(j + 1).matchName.indexOf('ADBE Vector Stroke Gap') !== -1) {
                    name = 'g';
                } else if (prop.property('Dashes').property(j + 1).matchName === 'ADBE Vector Stroke Offset') {
                    name = 'o';
                }
                dashData.n = name;
                dashData.nm = prop.property('Dashes').property(j + 1).name.toLowerCase().split(' ').join('');
                dashData.v = bm_keyframeHelper.exportKeyframes(prop.property('Dashes').property(j + 1), frameRate);
                dashesData.push(dashData);
            }
        }
        if (changed) {
            ob.d = dashesData;
        }
    }
    
    
    

    function getPoint(p1, p2, p3, p4, t) {
        var a = p1[0], b = p2[0], c = p3[0], d = p4[0];
        var x = a * Math.pow(1 - t, 3) + b * 3 * Math.pow(1 - t, 2) * t + c * 3 * (1 - t) * Math.pow(t, 2) + d * Math.pow(t, 3);
        a = p1[1];
        b = p2[1];
        c = p3[1];
        d = p4[1];
        var y = a * Math.pow(1 - t, 3) + b * 3 * Math.pow(1 - t, 2) * t + c * 3 * (1 - t) * Math.pow(t, 2) + d * Math.pow(t, 3);
        return [x, y];
    }

    function getTPos(p1, p2, p3, p4, arr) {
        var i;
        for (i = 0; i < 2; i += 1) {
            var c1 = p1[i], c2 = p2[i], c3 = p3[i], c4 = p4[i];
            var a = 3 * (-c1 + 3 * c2 - 3 * c3 + c4);
            var b = 6 * (c1 - 2 * c2 + c3);
            var c = 3 * (c2 - c1);
            var toSquareTerm = Math.pow(b, 2) - 4 * a * c;
            if (toSquareTerm >= 0) {
                var t1 = (-b + Math.sqrt(toSquareTerm)) / (2 * a);
                var t2 = (-b - Math.sqrt(toSquareTerm)) / (2 * a);
                if (t1 >= 0 && t1 <= 1) {
                    arr.push(getPoint(p1, p2, p3, p4, t1));
                }
                if (t2 >= 0 && t2 <= 1) {
                    arr.push(getPoint(p1, p2, p3, p4, t2));
                }
            }
        }
    }

    function getBoundingBox(p1, p2, p3, p4, bounds) {
        var pts = [p1,p4];
        getTPos(p1, p2, p3, p4, pts);

        var minX = bounds.l, minY = bounds.t, maxX = bounds.r, maxY = bounds.b, pt;
        var i, len = pts.length;
        for (i = 1; i < len; i += 1) {
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
    }

    function setBounds(shapeData, bounds, matrices, strokes, data) {
        var arr = [];
        var i, len = matrices.length;
        for (i = 0; i < len; i += 1) {
            matrices[i].getKeys(arr);
        }
        var shapeProp;
        if (shapeData.ty === 'sh') {
            shapeProp = PropertyFactory.getShapeProp(data, shapeData, 4, [], []);
        } else if (shapeData.ty === 'rc') {
            shapeProp = PropertyFactory.getShapeProp(data, shapeData, 5, [], []);
        } else if (shapeData.ty === 'el') {
            shapeProp = PropertyFactory.getShapeProp(data, shapeData, 6, [], []);
        } else if (shapeData.ty === 'sr') {
            shapeProp = PropertyFactory.getShapeProp(data, shapeData, 7, [], []);
        }
        shapeProp.getKeys(arr);
        var j, jLen = arr.length, matr = new Matrix();
        for (j = 0; j < jLen; j += 1) {
            data.globalData.frameId += 1;
            data.comp.renderedFrame = arr[j];
            matr.reset();
            for (i = 0; i < len; i += 1) {
                matrices[i].getValue();
                matr.transform(matrices[i].v.props[0], matrices[i].v.props[1], matrices[i].v.props[2], matrices[i].v.props[3], matrices[i].v.props[4], matrices[i].v.props[5]);
            }
            if (shapeProp.k) {
                shapeProp.getValue();
            }
            var points = shapeProp.v;
            var k, kLen = points.v.length;
            for (k = 0; k < kLen - 1; k += 1) {
                getBoundingBox(matr.applyToPointArray(points.v[k][0], points.v[k][1]), matr.applyToPointArray(points.o[k][0]+points.v[k][0], points.o[k][1]+points.v[k][1]), matr.applyToPointArray(points.i[k + 1][0]+points.v[k + 1][0], points.i[k + 1][1]+points.v[k + 1][1]), matr.applyToPointArray(points.v[k + 1][0], points.v[k + 1][1]), bounds);
            }
            getBoundingBox(matr.applyToPointArray(points.v[k][0], points.v[k][1]), matr.applyToPointArray(points.o[k][0]+points.v[k][0], points.o[k][1]+points.v[k][1]), matr.applyToPointArray(points.i[0][0]+points.v[0][0], points.i[0][1]+points.v[0][1]), matr.applyToPointArray(points.v[0][0], points.v[0][1]), bounds);
        }
        len = strokes.length;
        arr = [];
        for (i = 0; i < len; i += 1) {
            strokes[i].getKeys(arr);
        }
        jLen = arr.length;
        var maxStroke = 0;
        for (j = 0; j < jLen; j += 1) {
            data.globalData.frameId += 1;
            data.comp.renderedFrame = arr[j];
            for (i = 0; i < len; i += 1) {
                if (strokes[i].k) {
                    strokes[i].getValue();
                }
                maxStroke = strokes[i].v > maxStroke ? strokes[i].v :  maxStroke;
            }
        }
        if (maxStroke) {
            bounds.t -= maxStroke / 2;
            bounds.l -= maxStroke / 2;
            bounds.b += maxStroke / 2;
            bounds.r += maxStroke / 2;
        }
        bounds.t = Math.floor(bounds.t);
        bounds.l = Math.floor(bounds.l);
        bounds.b = Math.ceil(bounds.b);
        bounds.r = Math.ceil(bounds.r);
    }
    

    function completeShapes(arr, bounds, matrices, strokes, data) {
        var i, len = arr.length;
        var j, jLen;
        var matr = [];
        var strk = [];
        matr = matr.concat(matrices);
        strk = strk.concat(strokes);
        for (i = len - 1; i >= 0; i -= 1) {
            if (arr[i].ty === 'sh' || arr[i].ty === 'el' || arr[i].ty === 'rc' || arr[i].ty === 'sr') {
                setBounds(arr[i], bounds, matr, strk, data);
            } else if (arr[i].ty === 'gr') {
                completeShapes(arr[i].it, bounds, matr, strk, data);
            } else if (arr[i].ty === 'tr') {
                matr.push(PropertyFactory.getProp(data, arr[i], 2, 0, []));
            } else if (arr[i].ty === 'st') {
                strk.push(PropertyFactory.getProp(data, arr[i].w, 0, 0, []));
            }
        }
    }
    
    function getShapeBounds(data) {
        data.bounds = {
            l: 999999,
            t: 999999,
            b: -999999,
            r: -999999
        };
        completeShapes(data.shapes, data.bounds, [], [], {data: {st: 0}, globalData: {frameId: 0}, comp: {renderedFrame: -1}});
    }
    
    
    function exportShape(layerInfo, layerOb, frameRate, isText) {
        var containingComp = layerInfo.containingComp;
        navigationShapeTree.length = 0;
        navigationShapeTree.push(containingComp.name);
        navigationShapeTree.push(layerInfo.name);
        var shapes = [], contents = layerInfo.property('Contents');
        layerOb.shapes = shapes;
        iterateProperties(contents, shapes, frameRate, isText);
        /*if (!isText) {
            getShapeBounds(layerOb);
        }*/
        //getShapeBounds(layerOb);
    }
    
    ob.exportShape = exportShape;
    ob.checkVertexCount = checkVertexCount;

    return ob;
}());