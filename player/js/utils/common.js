var subframeEnabled = false;
var animType = '';

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

