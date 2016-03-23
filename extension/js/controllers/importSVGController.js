/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, alertData, successData, bodymovin */
var importSVGController = (function () {
    'use strict';
    var ob = {};
    var csInterface, svgContainer;
    ob.importSVG = importSVG;
    ob.init = init;
    ob.show = show;
    ob.hide = hide;
    
    
    function importSVG() {
        var eScript = 'bm_main.browseFile()';
        csInterface.evalScript(eScript);
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
        var color = elem.getAttribute('fill');
        if(color){
            color = convertToHex(color);
            return color;
        }
        return null;
    }
    
    function getStrokeColor(elem){
        var color = elem.getAttribute('stroke');
        if(color){
            color = convertToHex(color);
            return color;
        }
        return null;
    }
    
    function getStrokeWidth(elem){
        var width = elem.getAttribute('stroke-width');
        if(width){
            return width;
        }
        return null;
    }
    
    function getOpacity(elem){
        var opacity = elem.getAttribute('fill-opacity');
        if(opacity){
            return opacity;
        }
        return null;
    }
    
    function getStrokeOpacity(elem){
        var opacity = elem.getAttribute('stroke-opacity');
        if(opacity){
            return opacity;
        }
        return null;
    }
    
    function exportStyleAttributes(elem, ob){
        ob.co = getColor(elem);
        ob.op = getOpacity(elem);
        ob.stOp = getStrokeOpacity(elem);
        ob.stCo = getStrokeColor(elem);
        ob.stW = getStrokeWidth(elem);
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
    
    function exportQuadraticToSegment(elem){
        return {
            ty: elem.pathSegType,
            x: elem.x,
            y: elem.y,
            x1: elem.x1,
            y1: elem.y1
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
    
    function exportRect(elem){
        var ob = {};
        ob.ty = 'rect';
        ob.x = elem.getAttribute('x') || 0;
        ob.y = elem.getAttribute('y') || 0;
        ob.width = elem.getAttribute('width');
        ob.height = elem.getAttribute('height');
        ob.rx = elem.getAttribute('rx') || elem.getAttribute('ry');
        return ob;
    }
    
    function getSegmentData(elem){
        var ob = {};
        console.log(elem.pathSegType);
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
            case 8:
            case 9:
                return exportQuadraticToSegment(elem);
                break;
        }
        return ob;
    }
    
    function iterateElems(elem) {
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
                case 'rect':
                    elemData = exportRect(child);
                    break;
            }
            if(elemData){
                arr.push(elemData);   
            }
        }
        return arr;
    }
    
    function addToDOM(data) {
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
            elems: []
        };
        svgData.elems = iterateElems(svgElem);
        console.log(svgData);
        var eScript = 'bm_svgImporter.createSvg(' + JSON.stringify(svgData) + ')';
        csInterface.evalScript(eScript);
    }
    
    function loadSVG(path) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', path, true);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    addToDOM(xhr.responseText);
                } else {
                    try {
                        addToDOM(xhr.responseText);
                    } catch (err) {
                    }
                }
            }
        };
    }
    
    function handleFileUri(ev) {
        loadSVG(ev.data);
    }
    
    function show(){
        csInterface.addEventListener('bm:file:uri', handleFileUri);
        importSVG();
    }
    
    function hide(){
        csInterface.removeEventListener('bm:file:uri', handleFileUri);
    }
    
    function init(csI) {
        csInterface = csI;
        svgContainer = $('#svgContainer');
        /*var button = $('#compsSelection .buttons .import');
        button.on('click', importSVG);*/
    }
    
    return ob;
}
());