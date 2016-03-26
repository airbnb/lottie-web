/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, alertData, successData, bodymovin, mainController */
var importSVGController = (function () {
    'use strict';
    var ob = {};
    var csInterface, svgContainer, view;
    ob.importSVG = importSVG;
    ob.init = init;
    ob.show = show;
    ob.hide = hide;
    
    
    function importSVG() {
        var eScript = 'bm_main.browseFile()';
        csInterface.evalScript(eScript);
    }
    
    function deltaTransformPoint(matrix, point)  {

        var dx = point.x * matrix.a + point.y * matrix.c + 0;
        var dy = point.x * matrix.b + point.y * matrix.d + 0;
        return { x: dx, y: dy };
    }


    function decomposeMatrix(matrix) {

        // @see https://gist.github.com/2052247

        // calculate delta transform point
        var px = deltaTransformPoint(matrix, { x: 0, y: 1 });
        var py = deltaTransformPoint(matrix, { x: 1, y: 0 });

        // calculate skew
        var skewX = ((180 / Math.PI) * Math.atan2(px.y, px.x) - 90);
        var skewY = ((180 / Math.PI) * Math.atan2(py.y, py.x));

        return {

            translateX: matrix.e,
            translateY: matrix.f,
            scaleX: Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b),
            scaleY: Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d),
            skewX: skewX,
            skewY: skewY,
            rotation: skewX // rotation is the same as skew x
        };        
    }
    
    
    var hexDigits = new Array("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"); 

    //Function to convert hex format to a rgb color
    function rgb2hex(rgb) {
     rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
     return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }

    function hex(x) {
      return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
     }
    
    function convertToHex(color){
        var hexRegex = /^#(?:[0-9a-f]{3}){1,2}$/i;
        if(hexRegex.test(color)){
            if(color.length === 4){
                var col1 = color.substr(1,1);
                var col2 = color.substr(2,1);
                var col3 = color.substr(3,1);
                color = '#';
                color += col1 + col1;
                color += col2 + col2;
                color += col3 + col3;
            }   
        } else{
            if(color.indexOf('(') === -1){
                svgContainer.css('color',color);
                color = getComputedStyle(svgContainer[0], null).color;
            }
            color = rgb2hex(color);
        }
        return color;
    }
    
    function getColor(elem){
        //var color = elem.getAttribute('fill');
        var color = getComputedStyle(elem, null).fill;
        if(color){
            color = convertToHex(color);
            return color;
        }
        return null;
    }
    
    function getStrokeColor(elem){
        //var color = elem.getAttribute('stroke');
        var color = getComputedStyle(elem, null).stroke;
        if(color){
            color = convertToHex(color);
            return color;
        }
        return null;
    }
    
    function getStrokeWidth(elem){
        //var width = elem.getAttribute('stroke-width');
        var width = getComputedStyle(elem, null).strokeWidth;
        if(width){
            width = parseFloat(width);
            return width;
        }
        return null;
    }
    
    function getFillOpacity(elem){
        //var opacity = elem.getAttribute('fill-opacity');
        var opacity = getComputedStyle(elem, null).fillOpacity;
        if(opacity){
            return opacity;
        }
        return null;
    }
    
    function getOpacity(elem){
        //var opacity = elem.getAttribute('opacity');
        var opacity = getComputedStyle(elem, null).opacity;
        if(opacity){
            return opacity;
        }
        return null;
    }
    
    function getStrokeOpacity(elem){
        //var opacity = elem.getAttribute('stroke-opacity');
        var opacity = getComputedStyle(elem, null).strokeOpacity;
        if(opacity){
            return opacity;
        }
        return null;
    }
    
    function getTransformationMatrix(elem, matr){
        var transform = getComputedStyle(elem, null).transform;
        var transformAttr = elem.getAttribute('transform');
        console.log('transformtransform: ',transform);
        console.log('transformAttrtransformAttr: ',transformAttr);
    }
    
    function exportStyleAttributes(elem, ob){
        ob.co = getColor(elem);
        ob.fop = getFillOpacity(elem);
        ob.op = getOpacity(elem);
        ob.stOp = getStrokeOpacity(elem);
        ob.stCo = getStrokeColor(elem);
        ob.stW = getStrokeWidth(elem);
        ob.id = elem.getAttribute('id');
        if(ob.stCo !== "#876678"){
            if(ob.stOp === 0) {
                //ob.stOp = 1;
            }
            ob.st = true;
        }
    }
    
    function exportMoveToSegment(elem){
        return {
            ty: elem.pathSegType,
            x: elem.x,
            y: elem.y
        }
    }
    
    function exportCubicToSegment(elem){
        return {
            ty: elem.pathSegType,
            x: elem.x,
            y: elem.y,
            x1: elem.x1,
            y1: elem.y1,
            x2: elem.x2,
            y2: elem.y2
        }
    }
    
    function exportCubicSmoothSegment(elem){
        return {
            ty: elem.pathSegType,
            x: elem.x,
            y: elem.y,
            x2: elem.x2,
            y2: elem.y2
        }
    }
    
    function exportQuadraticToSegment(elem){
        return {
            ty: elem.pathSegType,
            x: elem.x,
            y: elem.y,
            x1: elem.x1,
            y1: elem.y1
        }
    }
    
    function exportQuadraticSmoothSegment(elem){
        return {
            ty: elem.pathSegType,
            x: elem.x,
            y: elem.y,
        }
    }
    
    function exportLinetoVertical(elem){
        return {
            ty: elem.pathSegType,
            y: elem.y
        }
    }
    
    function exportLinetoHorizontal(elem){
        return {
            ty: elem.pathSegType,
            x: elem.x
        }
    }
    
    function exportLineToSegment(elem){
        return {
            ty: elem.pathSegType,
            x: elem.x,
            y: elem.y
        }
    }
    
    function exportCloseSegment(elem){
        return {
            ty: elem.pathSegType
        }
    }
    
    function exportG(elem){
        var ob = {};
        ob.ty = 'g';
        exportStyleAttributes(elem,ob);
        var m = new Matrix();
        var transform = getComputedStyle(elem, null).transform;
        var transformAttr = elem.getAttribute('transform');
        console.log('transform: ',transform);
        console.log('transformAttr: ',transformAttr);
        ob.elems = iterateElems(elem);
        
        return ob;
    }
    
    function exportPath(elem){
        var ob = {};
        ob.ty = 'path';
        var segments = elem.pathSegList ;
        var i, len = segments.length;
        var segmentsData = [];
        for (i = 0; i < len; i += 1) {
            segmentsData.push(getSegmentData(segments[i]));
        }
        ob.segments = segmentsData;
        exportStyleAttributes(elem,ob);
        return ob;
    }
    
    function exportPolygon(elem){
        var ob = {};
        ob.ty = 'polygon';
        var points = elem.getAttribute('points').trim();
        var arr = points.split(' ');
        var pointsArr = [];
        var i, len = arr.length;
        for (i = 0; i < len; i += 1) {
            var pair = arr[i].split(',');
            pointsArr.push(pair);
        }
        ob.points = pointsArr;
        exportStyleAttributes(elem,ob);
        return ob;
    }
    
    function exportPolyline(elem){
        var ob = {};
        ob.ty = 'polyline';
        var points = elem.getAttribute('points').trim();
        var arr = points.split(' ');
        var pointsArr = [];
        var i, len = arr.length;
        for (i = 0; i < len; i += 1) {
            var pair = arr[i].split(',');
            pointsArr.push(pair);
        }
        ob.points = pointsArr;
        exportStyleAttributes(elem,ob);
        return ob;
    }
    
    function exportLine(elem){
        var ob = {};
        ob.ty = 'polyline';
        var x1 = elem.getAttribute('x1');
        var x2 = elem.getAttribute('x2');
        var y1 = elem.getAttribute('y1');
        var y2 = elem.getAttribute('y2');
        ob.points = [[x1,y1],[x2,y2]];
        exportStyleAttributes(elem,ob);
        return ob;
    }
    
    function exportRect(elem){
        var ob = {};
        ob.ty = 'rect';
        ob.x = elem.getAttribute('x') || 0;
        ob.y = elem.getAttribute('y') || 0;
        ob.width = elem.getAttribute('width');
        ob.height = elem.getAttribute('height');
        ob.rx = elem.getAttribute('rx') || elem.getAttribute('ry');
        exportStyleAttributes(elem,ob);
        return ob;
    }
    
    function exportEllipse(elem){
        var ob = {};
        ob.ty = 'ellipse';
        ob.cx = elem.getAttribute('cx') || 0;
        ob.cy = elem.getAttribute('cy') || 0;
        ob.rx = elem.getAttribute('rx');
        ob.ry = elem.getAttribute('ry');
        exportStyleAttributes(elem,ob);
        return ob;
    }
    
    function exportCircle(elem){
        var ob = {};
        ob.ty = 'ellipse';
        ob.cx = elem.getAttribute('cx') || 0;
        ob.cy = elem.getAttribute('cy') || 0;
        ob.rx = elem.getAttribute('r');
        ob.ry = ob.rx;
        exportStyleAttributes(elem,ob);
        return ob;
    }
    
    function getSegmentData(elem){
        var ob = {};
        switch(elem.pathSegType) {
            case 1:
                return exportCloseSegment(elem);
                break;
            case 2:
                return exportMoveToSegment(elem);
                break;
            case 4:
            case 5:
                return exportLineToSegment(elem);
                break;
            case 6:
            case 7:
                return exportCubicToSegment(elem);
                break;
            case 12:
            case 13:
                return exportLinetoHorizontal(elem);
                break;
            case 14:
            case 15:
                return exportLinetoVertical(elem);
                break;
            case 16:
            case 17:
                return exportCubicSmoothSegment(elem);
                break;
            case 18:
            case 19:
                return exportQuadraticSmoothSegment(elem);
                break;
            case 8:
            case 9:
                return exportQuadraticToSegment(elem);
                break;
        }
        return ob;
    }
    
    function iterateElems(elem,m) {
        var arr = [];
        var children = elem.childNodes;
        var i, len = children.length, child, elemData;
        for( i = 0; i < len; i += 1) {
            child = children[i];
            elemData = null;
            var ty = child.nodeName;
            switch(ty) {
                case 'g':
                    elemData = exportG(child);
                    break;
                case 'path':
                    elemData = exportPath(child);
                    break;
                case 'polygon':
                    elemData = exportPolygon(child);
                    break;
                case 'polyline':
                    elemData = exportPolyline(child);
                    break;
                case 'line':
                    elemData = exportLine(child);
                    break;
                case 'rect':
                    elemData = exportRect(child);
                    break;
                case 'ellipse':
                    elemData = exportEllipse(child);
                    break;
                case 'circle':
                    elemData = exportCircle(child);
                    break;
            }
            if(elemData){
                elemData.tr = getTransformationMatrix(elem, m);
                arr.push(elemData);   
            }
        }
        return arr;
    }
    
    function addToDOM(data, name) {
        //data  = '<style type="text/css">*{opacity:0.91232123}</style>' + data;
        svgContainer.html(data);
        var svgSelector = svgContainer.find('svg');
        if (!svgSelector.length) {
            return;
        }
        var svgElem = svgSelector[0];
        var w, h;
        var viewBox = svgElem.getAttribute('viewBox');
        if (!viewBox) {
            w = parseInt(svgElem.getAttribute('width'), 10);
            h = parseInt(svgElem.getAttribute('height'), 10);
        } else {
            var viewboxSizes = viewBox.split(' ');
            w = parseInt(viewboxSizes[2], 10);
            h = parseInt(viewboxSizes[3], 10);
        }
        var svgData = {
            w: w,
            h: h,
            name: name,
            elems: []
        };
        var mat = new Matrix();
        svgData.elems = iterateElems(svgElem, mat);
        var eScript = 'bm_svgImporter.createSvg(' + JSON.stringify(svgData) + ')';
        csInterface.evalScript(eScript);
    }
    
    function loadSVG(path, name) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', path, true);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    addToDOM(xhr.responseText, name);
                } else {
                    try {
                        addToDOM(xhr.responseText, name);
                    } catch (err) {
                    }
                }
            }
        };
    }
    
    function handleFileUri(ev) {
        console.log(ev.data);
        loadSVG(ev.data.path, ev.data.name);
    }
    
    function show(){
        csInterface.addEventListener('bm:file:uri', handleFileUri);
        view.show();
    }
    
    function hide(){
        csInterface.removeEventListener('bm:file:uri', handleFileUri);
        view.hide();
    }
    
    function showSelection() {
        mainController.showView('selection');
    }
    
    function init(csI) {
        view = $("#svgImporter");
        view.hide();
        csInterface = csI;
        svgContainer = $('#svgContainer');
        svgContainer.on('click', function(){
            svgContainer.html('');
        })
        var button = $('#svgImporter .buttons .import');
        button.on('click', importSVG);
        var backButton = $('#svgImporter .buttons .return');
        backButton.on('click', showSelection);
    }
    
    return ob;
}
());