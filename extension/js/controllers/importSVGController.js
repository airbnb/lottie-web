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
    
    function exportG(elem){
        var ob = {};
        ob.ty = 'g';
        ob.elems = iterateElems(elem);
        return ob;
    }
    
    function exportMoveToSegment(elem){
        return {
            ty: elem.pathSegType,
            x: elem.x,
            y: elem.y
        }
    }
    
    function exportCubicToSegment(elem){
        console.log(elem);
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
    
    function exportCloseSegment(elem){
        return {
            ty: elem.pathSegType
        }
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
            case 6:
            case 7:
                return exportCubicToSegment(elem);
                break;
        }
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
        return ob;
    }
    
    function iterateElems(elem) {
        var arr = [];
        var children = elem.childNodes;
        var i, len = children.length, child, elemData;
        console.log('iterateElems', elem);
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