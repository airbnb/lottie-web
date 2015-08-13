/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global app, $, PropertyValueType, bm_eventDispatcher*/
var bm_generalUtils = (function () {
    'use strict';
    var ob = {};
    ob.Gtlym = {};
    ob.Gtlym.CALL = {};
    
    function random(len) {
        var sequence = 'abcdefghijklmnoqrstuvwxyz1234567890', returnString = '', i;
        for (i = 0; i < len; i += 1) {
            returnString += sequence.charAt(Math.floor(Math.random() * sequence.length));
        }
        return returnString;
    }
    
    function setTimeout(func, millis) {
        var guid = random(10);
        ob.Gtlym.CALL["interval_" + guid] = func;
        return app.scheduleTask('generalUtils.Gtlym.CALL["interval_' + guid + '"]();', millis, false);
    }

    function roundArray(arr, decimals) {
        var i, len = arr.length;
        var retArray = [];
        for (i = 0; i < len; i += 1) {
            if (typeof arr[i] === 'number') {
                retArray.push(roundNumber(arr[i], decimals));
            } else {
                retArray.push(roundArray(arr[i], decimals));
            }
        }
        return retArray;
    }
    
    function roundNumber(num, decimals) {
        if (typeof num === 'number') {
            return parseFloat(num.toFixed(decimals));
        } else {
            return roundArray(num, decimals);
        }
    }
    
    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    
    function arrayRgbToHex(values) {
        return rgbToHex(Math.round(values[0] * 255), Math.round(values[1] * 255), Math.round(values[2] * 255));
    }
    
    var iterateProperty = (function () {
        
        var response;
        
        function iterateProperties(property, ob) {
            ob.name = property.name;
            ob.matchName = property.matchName;
            if (property.numProperties) {
                ob.properties = [];
                var i = 0, len = property.numProperties;
                while (i < len) {
                    var propertyOb = {};
                    ob.properties.push(propertyOb);
                    iterateProperties(property(i + 1), propertyOb);
                    i++;
                }
            } else {
                if (property.propertyValueType !== PropertyValueType.NO_VALUE && property.value !== undefined) {
                    ob.value = property.value.toString();
                } else {
                    ob.value = '--- No Value:' + ' ---';
                }
            }
        }
        
        return function (property) {
            response = {};
            iterateProperties(property, response);
            bm_eventDispatcher.sendEvent('console:log', response);
        };
    }());
    
    ob.random = random;
    ob.roundNumber = roundNumber;
    ob.setTimeout = setTimeout;
    ob.arrayRgbToHex = arrayRgbToHex;
    ob.iterateProperty = iterateProperty;
    
    return ob;
    
}());