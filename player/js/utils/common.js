var subframeEnabled = false;
var svgElement = document.createElementNS(svgNS,'svg');
var shapeHelper = document.createElementNS(svgNS,'path');
var body;

svgElement.appendChild(shapeHelper);

function styleDiv(element){
    element.style.position = "absolute";
    element.style.top = 0;
    element.style.left = 0;
    element.style.display = "block";
    element.style.verticalAlign = "top";
    element.style.backfaceVisibility  = element.style.webkitBackfaceVisibility = "hidden";
    //element.style.transformStyle = element.style.webkitTransformStyle = "preserve-3d";
    styleUnselectableDiv(element);
}

function styleUnselectableDiv(element){
    element.style.userSelect = 'none';
    element.style.MozUserSelect = 'none';
    element.style.webkitUserSelect = 'none';
    element.style.oUserSelect = 'none';

}

function randomString(length, chars){
    if(chars === undefined){
        chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    }
    var i;
    var result = '';
    for (i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function getPathSize(path){
    if(!body){
        body = document.getElementsByTagName('body')[0];
        body.appendChild(svgElement);
    }
    shapeHelper.setAttribute('d',path);
    return svgElement.getBBox();
}
