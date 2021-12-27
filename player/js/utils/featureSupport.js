const featureSupport = (function () {
  var ob = {
    maskType: true,
  };
  if (/MSIE 10/i.test(navigator.userAgent) || /MSIE 9/i.test(navigator.userAgent) || /rv:11.0/i.test(navigator.userAgent) || /Edge\/\d./i.test(navigator.userAgent)) {
    ob.maskType = false;
  }
  return ob;
}());

export default featureSupport;
