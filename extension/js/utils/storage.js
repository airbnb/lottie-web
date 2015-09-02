var LocalStorageManager = (function () {
    'use strict';
    var ob = {};
    
    function getItem(name) {
        var item = localStorage.getItem(name);
        if (item === null) {
            return item;
        }
        if (item.substr(0, 1) === '{' || item.substr(0, 1) === '[') {
            return JSON.parse(item);
        }
        return item;
    }
    
    function setItem(name, value) {
        if (typeof value === 'string') {
            localStorage.setItem(name, value);
        } else {
            localStorage.setItem(name, JSON.stringify(value));
        }
    }
    
    ob.getItem = getItem;
    ob.setItem = setItem;
    
    return ob;
}());