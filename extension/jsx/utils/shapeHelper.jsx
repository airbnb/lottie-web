/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global bm_keyframeHelper*/
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
                    array.push(ob);
                } else if (itemType === shapeItemTypes.rect) {
                    ob = {};
                    ob.ty = itemType;
                    ob.s = bm_keyframeHelper.exportKeyframes(prop.property('Size'), frameRate);
                    ob.p = bm_keyframeHelper.exportKeyframes(prop.property('Position'), frameRate);
                    ob.r = bm_keyframeHelper.exportKeyframes(prop.property('Roundness'), frameRate);
                    array.push(ob);
                } else if (itemType === shapeItemTypes.ellipse) {
                    ob = {};
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
                    var j, jLen = prop.property('Dashes').numProperties;
                    var dashesData = [];
                    var changed = false;
                    for (j = 0; j < jLen; j += 1) {
                        if (prop.property('Dashes').property(j + 1).numKeys > 0 || (prop.property('Dashes').property(j + 1).name === 'Offset' && changed)) {
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