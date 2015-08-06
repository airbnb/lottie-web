/**
* Provides requestAnimationFrame in a cross browser way.
* http://paulirish.com/2011/requestanimationframe-for-smart-animating/
*/
if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = (function (id) {
    	return window.cancelAnimationFrame ||
    	window.webkitCancelRequestAnimationFrame ||
    	window.mozCancelRequestAnimationFrame ||
    	window.oCancelRequestAnimationFrame ||
    	window.msCancelRequestAnimationFrame ||
    	clearTimeout(id);
    })();
}

if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (function (callback, element, time) {
    	return window.webkitRequestAnimationFrame ||
    	window.mozRequestAnimationFrame ||
    	window.oRequestAnimationFrame ||
    	window.msRequestAnimationFrame ||
    	function (/* function */callback, /* DOMElement */element) {
    		return window.setTimeout(callback, 1000 / 60);
    	};
    })();
}
