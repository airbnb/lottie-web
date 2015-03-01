function createElement(parent,child,params){
    if(child){
        child.prototype = Object.create(parent.prototype);
        child.prototype.constructor = child;
        child.prototype.parent = parent.prototype;
    }else{
        var instance = Object.create(parent.prototype,params);
        var getType = {};
        if(instance && getType.toString.call(instance.init) === '[object Function]'){
            instance.init();
        }
        return instance;
    }
}

function defineDescriptor(o, propertyName, value, params){
    var descriptor = {
        writable : false,
        configurable : false,
        enumerable : false,
        value : value
    };
    if(params){
        for( var s in params){
            descriptor[s] = params[s];
        }
    }
    var getType = {};
    if(o && getType.toString.call(o) === '[object Function]'){
        o = o.prototype;
    }
    Object.defineProperty(o, propertyName, descriptor);
}

function defineAccessor(o, propertyName, params){
    var value;
    var accessor = {
        enumerable : false,
        configurable : false,
        get: function(){return value},
        set: function(val){value = val}
    };
    if(params){
        for( var s in params){
            accessor[s] = params[s];
        }
    }
    var getType = {};
    if(o && getType.toString.call(o) === '[object Function]'){
        o = o.prototype;
    }
    Object.defineProperty(o, propertyName, accessor);
}
