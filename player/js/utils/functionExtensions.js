function createElement(parent,child,params){
    if(child){
        child.prototype = Object.create(parent.prototype);
        child.prototype.constructor = child;
        child.prototype._parent = parent.prototype;
    }else{
        var instance = Object.create(parent.prototype,params);
        var getType = {};
        if(instance && getType.toString.call(instance.init) === '[object Function]'){
            instance.init();
        }
        return instance;
    }
}

function extendPrototype(source,destination){
    for (var attr in source.prototype) {
        if (source.prototype.hasOwnProperty(attr)) destination.prototype[attr] = source.prototype[attr];
    }
}