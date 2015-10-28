/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global bm_keyframeHelper, bm_eventDispatcher*/
var bm_shapeHelper = (function () {
    'use strict';
    var ob = {}, shapeItemTypes = {
        shape: 'sh',
        rect: 'rc',
        ellipse: 'el',
        fill: 'fl',
        stroke: 'st',
        merge: 'mm',
        trim: 'tm',
        group: 'gr'
    };

    function getItemType(matchName) {
        switch (matchName) {
        case 'ADBE Vector Shape - Group':
            return shapeItemTypes.shape;
        case 'ADBE Vector Shape - Rect':
            return shapeItemTypes.rect;
        case 'ADBE Vector Shape - Ellipse':
            return shapeItemTypes.ellipse;
        case 'ADBE Vector Graphic - Fill':
            return shapeItemTypes.fill;
        case 'ADBE Vector Graphic - Stroke':
            return shapeItemTypes.stroke;
        case 'ADBE Vector Graphic - Merge':
            return shapeItemTypes.merge;
        case 'ADBE Vector Graphic - Trim':
        case 'ADBE Vector Filter - Trim':
            return shapeItemTypes.trim;
        case 'ADBE Vector Group':
            return shapeItemTypes.group;
        default:
            return '';
        }
    }
    
    function reverseShape(ks, isClosed) {
        var newI = [], newO = [], newV = [];
        var i, len;
        if (ks.i) {
            var init = 0;
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
            for (i = 0; i < len - 1; i += 1) {
                reverseShape(ks[i].s[0], isClosed);
                reverseShape(ks[i].e[0], isClosed);
            }
        }
    }
    
    function iterateProperties(iteratable, array, frameRate) {
        var i, len = iteratable.numProperties, ob, prop, itemType;
        for (i = 0; i < len; i += 1) {
            prop = iteratable.property(i + 1);
            if (prop.enabled) {
                itemType = getItemType(prop.matchName);
                if (itemType === shapeItemTypes.shape) {
                    ob = {};
                    ob.ty = itemType;
                    ob.closed = prop.property('Path').value.closed;
                    ob.ks = bm_keyframeHelper.exportKeyframes(prop.property('Path'), frameRate);
                    if (prop.property("Shape Direction").value === 3) {
                        reverseShape(ob.ks, ob.closed);
                    }
                    array.push(ob);
                } else if (itemType === shapeItemTypes.rect) {
                    ob = {};
                    ob.ty = itemType;
                    ob.d = prop.property("Shape Direction").value;
                    ob.s = bm_keyframeHelper.exportKeyframes(prop.property('Size'), frameRate);
                    ob.p = bm_keyframeHelper.exportKeyframes(prop.property('Position'), frameRate);
                    ob.r = bm_keyframeHelper.exportKeyframes(prop.property('Roundness'), frameRate);
                    array.push(ob);
                } else if (itemType === shapeItemTypes.ellipse) {
                    ob = {};
                    ob.d = prop.property("Shape Direction").value;
                    ob.ty = itemType;
                    ob.s = bm_keyframeHelper.exportKeyframes(prop.property('Size'), frameRate);
                    ob.p = bm_keyframeHelper.exportKeyframes(prop.property('Position'), frameRate);
                    array.push(ob);
                } else if (itemType === shapeItemTypes.fill) {
                    ob = {};
                    ob.ty = itemType;
                    ob.fillEnabled = prop.enabled;
                    ob.c = bm_keyframeHelper.exportKeyframes(prop.property('Color'), frameRate);
                    ob.o = bm_keyframeHelper.exportKeyframes(prop.property('Opacity'), frameRate);
                    array.push(ob);
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
                    var j, jLen = prop.property('Dashes').numProperties;
                    var dashesData = [];
                    var changed = false;
                    for (j = 0; j < jLen; j += 1) {
                        if (prop.property('Dashes').property(j + 1).canSetExpression) {
                            changed = true;
                            var dashData = {};
                            var name = '';
                            if (prop.property('Dashes').property(j + 1).name === 'Dash') {
                                name = 'd';
                            } else if (prop.property('Dashes').property(j + 1).name === 'Gap') {
                                name = 'g';
                            } else if (prop.property('Dashes').property(j + 1).name === 'Offset') {
                                name = 'o';
                            }
                            dashData.n = name;
                            dashData.v = bm_keyframeHelper.exportKeyframes(prop.property('Dashes').property(j + 1), frameRate);
                            dashesData.push(dashData);
                        }
                    }
                    if (changed) {
                        ob.d = dashesData;
                    }
                    array.push(ob);
                } else if (itemType === shapeItemTypes.merge) {
                    ob = {};
                    ob.ty = itemType;
                    ob.mm = prop.property('ADBE Vector Merge Type').value;
                    array.push(ob);
                } else if (itemType === shapeItemTypes.trim) {
                    ob = {};
                    ob.ty = itemType;
                    ob.s = bm_keyframeHelper.exportKeyframes(prop.property('Start'), frameRate);
                    ob.e = bm_keyframeHelper.exportKeyframes(prop.property('End'), frameRate);
                    ob.o = bm_keyframeHelper.exportKeyframes(prop.property('Offset'), frameRate);
                    ob.m = prop.property('Trim Multiple Shapes').value;
                    array.push(ob);
                } else if (itemType === shapeItemTypes.group) {
                    ob = {
                        ty : itemType,
                        it: []
                    };
                    iterateProperties(prop.property('Contents'), ob.it, frameRate);
                    var trOb = {};
                    var transformProperty = prop.property('Transform');
                    trOb.ty = 'tr';
                    trOb.p = bm_keyframeHelper.exportKeyframes(transformProperty.property('Position'), frameRate);
                    trOb.a = bm_keyframeHelper.exportKeyframes(transformProperty.property('Anchor Point'), frameRate);
                    trOb.s = bm_keyframeHelper.exportKeyframes(transformProperty.property('Scale'), frameRate);
                    trOb.r = bm_keyframeHelper.exportKeyframes(transformProperty.property('Rotation'), frameRate);
                    trOb.o = bm_keyframeHelper.exportKeyframes(transformProperty.property('Opacity'), frameRate);
                    ob.it.push(trOb);
                    array.push(ob);
                }
            }
            
        }
    }
    
    function exportShape(layerInfo, layerOb, frameRate) {
        var shapes = [], contents = layerInfo.property('Contents');
        layerOb.shapes = shapes;
        iterateProperties(contents, shapes, frameRate);
    }
    
    ob.exportShape = exportShape;
    
    return ob;
}());