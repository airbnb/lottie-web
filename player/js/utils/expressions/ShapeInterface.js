var ShapeExpressionInterface = (function(){
    var ob = {
        createShapeInterface:createShapeInterface,
        createGroupInterface:createGroupInterface,
        createTrimInterface:createTrimInterface,
        createStrokeInterface:createStrokeInterface,
        createTransformInterface:createTransformInterface,
        createEllipseInterface:createEllipseInterface,
        createStarInterface:createStarInterface,
        createRectInterface:createRectInterface,
        createRoundedInterface:createRoundedInterface,
        createPathInterface:createPathInterface,
        createFillInterface:createFillInterface
    };
    function createShapeInterface(shapes,view,propertyGroup){
        return shapeInterfaceFactory(shapes,view,propertyGroup);
    }
    function createGroupInterface(shapes,view,propertyGroup){
        return groupInterfaceFactory(shapes,view,propertyGroup);
    }
    function createFillInterface(shape,view,propertyGroup){
        return fillInterfaceFactory(shape,view,propertyGroup);
    }
    function createStrokeInterface(shape,view,propertyGroup){
        return strokeInterfaceFactory(shape,view,propertyGroup);
    }
    function createTrimInterface(shape,view,propertyGroup){
        return trimInterfaceFactory(shape,view,propertyGroup);
    }
    function createTransformInterface(shape,view,propertyGroup){
        return transformInterfaceFactory(shape,view,propertyGroup);
    }
    function createEllipseInterface(shape,view,propertyGroup){
        return ellipseInterfaceFactory(shape,view,propertyGroup);
    }
    function createStarInterface(shape,view,propertyGroup){
        return starInterfaceFactory(shape,view,propertyGroup);
    }
    function createRectInterface(shape,view,propertyGroup){
        return rectInterfaceFactory(shape,view,propertyGroup);
    }
    function createRoundedInterface(shape,view,propertyGroup){
        return roundedInterfaceFactory(shape,view,propertyGroup);
    }
    function createPathInterface(shape,view,propertyGroup){
        return pathInterfaceFactory(shape,view,propertyGroup);
    }

    function iterateElements(shapes,view, propertyGroup){
        var arr = [];
        var i, len = shapes ? shapes.length : 0;
        for(i=0;i<len;i+=1){
            if(shapes[i].ty == 'gr'){
                arr.push(ShapeExpressionInterface.createGroupInterface(shapes[i],view[i],propertyGroup));
            }else if(shapes[i].ty == 'fl'){
                arr.push(ShapeExpressionInterface.createFillInterface(shapes[i],view[i],propertyGroup));
            }else if(shapes[i].ty == 'st'){
                arr.push(ShapeExpressionInterface.createStrokeInterface(shapes[i],view[i],propertyGroup));
            }else if(shapes[i].ty == 'tm'){
                arr.push(ShapeExpressionInterface.createTrimInterface(shapes[i],view[i],propertyGroup));
            }else if(shapes[i].ty == 'tr'){
                //arr.push(ShapeExpressionInterface.createTransformInterface(shapes[i],view[i],propertyGroup));
            }else if(shapes[i].ty == 'el'){
                arr.push(ShapeExpressionInterface.createEllipseInterface(shapes[i],view[i],propertyGroup));
            }else if(shapes[i].ty == 'sr'){
                arr.push(ShapeExpressionInterface.createStarInterface(shapes[i],view[i],propertyGroup));
            } else if(shapes[i].ty == 'sh'){
                arr.push(ShapeExpressionInterface.createPathInterface(shapes[i],view[i],propertyGroup));
            } else if(shapes[i].ty == 'rc'){
                arr.push(ShapeExpressionInterface.createRectInterface(shapes[i],view[i],propertyGroup));
            } else if(shapes[i].ty == 'rd'){
                arr.push(ShapeExpressionInterface.createRoundedInterface(shapes[i],view[i],propertyGroup));
            } else{
                //console.log(shapes[i].ty);
            }
        }
        return arr;
    }

    var shapeInterfaceFactory = (function(){
        return function(shapes,view,propertyGroup){
            var interfaces;
            function _interfaceFunction(value){
                if(typeof value === 'number'){
                    return interfaces[value-1];
                } else {
                    var i = 0, len = interfaces.length;
                    while(i<len){
                        if(interfaces[i]._name === value){
                            return interfaces[i];
                        }
                        i+=1;
                    }
                }
            }
            _interfaceFunction.propertyGroup = propertyGroup;
            interfaces = iterateElements(shapes, view, _interfaceFunction);
            return _interfaceFunction;
        }
    }());

    var contentsInterfaceFactory = (function(){
       return function(shape,view, propertyGroup){
           var interfaces;
           var interfaceFunction = function _interfaceFunction(value){
               if(typeof value === 'number'){
                   return interfaces[value-1];
               }
               var i = 0, len = interfaces.length;
               while(i<len){
                   if(interfaces[i]._name === value){
                       return interfaces[i];
                   }
                   i+=1;
               }
           };
           interfaceFunction.propertyGroup = function(val){
               if(val === 1){
                   return interfaceFunction;
               } else{
                   return propertyGroup(val-1);
               }
           };

           interfaces = iterateElements(shape.it, view.it, interfaceFunction.propertyGroup);

           return interfaceFunction;
       }
    }());

    var groupInterfaceFactory = (function(){
        return function(shape,view, propertyGroup){
            var interfaceFunction = function _interfaceFunction(value){
                switch(value){
                    case 'ADBE Vectors Group':
                    case 2:
                        return interfaceFunction.content;
                    case 'ADBE Vector Transform Group':
                    case 3:
                    default:
                        return interfaceFunction.transform;
                }
                /*if(value === 'ADBE Vector Transform Group'){
                    return interfaceFunction.transform;
                    var i = 0, len = interfaces.length;
                    while(i<len){
                        if(interfaces[i].ty === 'tr'){
                            return interfaces[i];
                        }
                        i+=1;
                    }
                    return null;
                }
                if(typeof value === 'number'){
                    return interfaces[value-1];
                } else {
                    var i = 0, len = interfaces.length;
                    while(i<len){
                        if(interfaces[i]._name === value){
                            return interfaces[i];
                        }
                        i+=1;
                    }
                }*/
            }
            interfaceFunction.propertyGroup = function(val){
                if(val === 1){
                    return interfaceFunction;
                } else{
                    return propertyGroup(val-1);
                }
            };
            var content = contentsInterfaceFactory(shape,view,interfaceFunction.propertyGroup);
            var transformInterface = ShapeExpressionInterface.createTransformInterface(shape.it[shape.it.length - 1],view.it[view.it.length - 1],interfaceFunction.propertyGroup);
            interfaceFunction.content = content;
            interfaceFunction.transform = transformInterface;
            Object.defineProperty(interfaceFunction, '_name', {
                get: function(){
                    return shape.nm;
                }
            });
            //interfaceFunction.content = interfaceFunction;
            interfaceFunction.nm = shape.nm;
            return interfaceFunction;
        }
    }());

    var fillInterfaceFactory = (function(){
        return function(shape,view,propertyGroup){

            view.c.setGroupProperty(propertyGroup);
            view.o.setGroupProperty(propertyGroup);
            var ob = {
                get color(){
                    if(view.c.k){
                        view.c.getValue();
                    }
                    return [view.c.v[0]/view.c.mult,view.c.v[1]/view.c.mult,view.c.v[2]/view.c.mult,1];
                },
                get opacity(){
                    if(view.o.k){
                        view.o.getValue();
                    }
                    return view.o.v;
                },
                _name: shape.nm
            };
            return ob;
        }
    }());

    var strokeInterfaceFactory = (function(){
        return function(shape,view,propertyGroup){
            function _propertyGroup(val){
                if(val === 1){
                    return ob;
                } else{
                    return propertyGroup(val-1);
                }
            };
            view.c.setGroupProperty(_propertyGroup);
            view.o.setGroupProperty(_propertyGroup);
            view.w.setGroupProperty(_propertyGroup);
            var ob = {
                get color(){
                    if(view.c.k){
                        view.c.getValue();
                    }
                    return [view.c.v[0]/view.c.mult,view.c.v[1]/view.c.mult,view.c.v[2]/view.c.mult,1];
                },
                get opacity(){
                    if(view.o.k){
                        view.o.getValue();
                    }
                    return view.o.v;
                },
                get strokeWidth(){
                    if(view.w.k){
                        view.w.getValue();
                    }
                    return view.w.v;
                },
                dashOb: {},
                get dash(){
                    var d = view.d;
                    var dModels = shape.d;
                    var i, len = dModels.length;
                    for(i=0;i<len;i+=1){
                        if(d.dataProps[i].p.k){
                            d.dataProps[i].p.getValue();
                        }
                        d.dataProps[i].p.setGroupProperty(propertyGroup);
                        this.dashOb[dModels[i].nm] = d.dataProps[i].p.v;
                    }
                    return this.dashOb;
                },
                _name: shape.nm
            };
            return ob;
        }
    }());

    var trimInterfaceFactory = (function(){
        return function(shape,view,propertyGroup){
            function _propertyGroup(val){
                if(val == 1){
                    return interfaceFunction;
                } else {
                    return propertyGroup(--val);
                }
            }
            interfaceFunction.propertyIndex = shape.ix;

            view.s.setGroupProperty(_propertyGroup);
            view.e.setGroupProperty(_propertyGroup);
            view.o.setGroupProperty(_propertyGroup);

            function interfaceFunction(val){
                if(val === shape.e.ix){
                    return interfaceFunction.end;
                }
                if(val === shape.s.ix){
                    return interfaceFunction.start;
                }
                if(val === shape.o.ix){
                    return interfaceFunction.offset;
                }
            }
            interfaceFunction.propertyIndex = shape.ix;
            Object.defineProperty(interfaceFunction, 'start', {
                get: function(){
                    if(view.s.k){
                        view.s.getValue();
                    }
                    return view.s.v/view.s.mult;
                }
            });
            Object.defineProperty(interfaceFunction, 'end', {
                get: function(){
                    if(view.e.k){
                        view.e.getValue();
                    }
                    return view.e.v/view.e.mult;
                }
            });
            Object.defineProperty(interfaceFunction, 'offset', {
                get: function(){
                    if(view.o.k){
                        view.o.getValue();
                    }
                    return view.o.v;
                }
            });
            Object.defineProperty(interfaceFunction, '_name', {
                get: function(){
                    return shape.nm;
                }
            });
            return interfaceFunction;
        }
    }());

    var transformInterfaceFactory = (function(){
        return function(shape,view,propertyGroup){
            function _propertyGroup(val){
                if(val == 1){
                    return interfaceFunction;
                } else {
                    return propertyGroup(--val);
                }
            }
            view.transform.mProps.o.setGroupProperty(_propertyGroup);
            view.transform.mProps.p.setGroupProperty(_propertyGroup);
            view.transform.mProps.a.setGroupProperty(_propertyGroup);
            view.transform.mProps.s.setGroupProperty(_propertyGroup);
            view.transform.mProps.r.setGroupProperty(_propertyGroup);
            if(view.transform.mProps.sk){
                view.transform.mProps.sk.setGroupProperty(_propertyGroup);
                view.transform.mProps.sa.setGroupProperty(_propertyGroup);
            }
            view.transform.op.setGroupProperty(_propertyGroup);

            function interfaceFunction(value){
                if(shape.a.ix === value){
                    return interfaceFunction.anchorPoint;
                }
                if(shape.o.ix === value){
                    return interfaceFunction.opacity;
                }
                if(shape.p.ix === value){
                    return interfaceFunction.position;
                }
                if(shape.r.ix === value){
                    return interfaceFunction.rotation;
                }
                if(shape.s.ix === value){
                    return interfaceFunction.scale;
                }
                if(shape.sk && shape.sk.ix === value){
                    return interfaceFunction.skew;
                }
                if(shape.sa && shape.sa.ix === value){
                    return interfaceFunction.skewAxis;
                }

            }
            Object.defineProperty(interfaceFunction, 'opacity', {
                get: function(){
                    if(view.transform.mProps.o.k){
                        view.transform.mProps.o.getValue();
                    }
                    return view.transform.mProps.o.v/view.transform.mProps.o.mult;
                }
            });
            Object.defineProperty(interfaceFunction, 'position', {
                get: function(){
                    if(view.transform.mProps.p.k){
                        view.transform.mProps.p.getValue();
                    }
                    return [view.transform.mProps.p.v[0],view.transform.mProps.p.v[1]];
                }
            });
            Object.defineProperty(interfaceFunction, 'anchorPoint', {
                get: function(){
                    if(view.transform.mProps.a.k){
                        view.transform.mProps.a.getValue();
                    }
                    return [view.transform.mProps.a.v[0],view.transform.mProps.a.v[1]];
                }
            });
            var scaleArray = [];
            Object.defineProperty(interfaceFunction, 'scale', {
                get: function(){
                    if(view.transform.mProps.s.k){
                        view.transform.mProps.s.getValue();
                    }
                    scaleArray[0] = view.transform.mProps.s.v[0]/view.transform.mProps.s.mult;
                    scaleArray[1] = view.transform.mProps.s.v[1]/view.transform.mProps.s.mult;
                    return scaleArray;
                }
            });
            Object.defineProperty(interfaceFunction, 'rotation', {
                get: function(){
                    if(view.transform.mProps.r.k){
                        view.transform.mProps.r.getValue();
                    }
                    return view.transform.mProps.r.v/view.transform.mProps.r.mult;
                }
            });
            Object.defineProperty(interfaceFunction, 'skew', {
                get: function(){
                    if(view.transform.mProps.sk.k){
                        view.transform.mProps.sk.getValue();
                    }
                    return view.transform.mProps.sk.v;
                }
            });
            Object.defineProperty(interfaceFunction, 'skewAxis', {
                get: function(){
                    if(view.transform.mProps.sa.k){
                        view.transform.mProps.sa.getValue();
                    }
                    return view.transform.mProps.sa.v;
                }
            });
            Object.defineProperty(interfaceFunction, '_name', {
                get: function(){
                    return shape.nm;
                }
            });
            interfaceFunction.ty = 'tr';
            return interfaceFunction;
        }
    }());

    var ellipseInterfaceFactory = (function(){
        return function(shape,view,propertyGroup){
            function _propertyGroup(val){
                if(val == 1){
                    return interfaceFunction;
                } else {
                    return propertyGroup(--val);
                }
            }
            interfaceFunction.propertyIndex = shape.ix;
            var prop = view.sh.ty === 'tm' ? view.sh.prop : view.sh;
            prop.s.setGroupProperty(_propertyGroup);
            prop.p.setGroupProperty(_propertyGroup);
            function interfaceFunction(value){
                if(shape.p.ix === value){
                    return interfaceFunction.position;
                }
                if(shape.s.ix === value){
                    return interfaceFunction.size;
                }
            }
            Object.defineProperty(interfaceFunction, 'size', {
                get: function(){
                    if(prop.s.k){
                        prop.s.getValue();
                    }
                    return [prop.s.v[0],prop.s.v[1]];
                }
            });
            Object.defineProperty(interfaceFunction, 'position', {
                get: function(){
                    if(prop.p.k){
                        prop.p.getValue();
                    }
                    return [prop.p.v[0],prop.p.v[1]];
                }
            });
            Object.defineProperty(interfaceFunction, '_name', {
                get: function(){
                    return shape.nm;
                }
            });
            return interfaceFunction;
        }
    }());

    var starInterfaceFactory = (function(){
        return function(shape,view,propertyGroup){
            function _propertyGroup(val){
                if(val == 1){
                    return interfaceFunction;
                } else {
                    return propertyGroup(--val);
                }
            }
            var prop = view.sh.ty === 'tm' ? view.sh.prop : view.sh;
            interfaceFunction.propertyIndex = shape.ix;
            prop.or.setGroupProperty(_propertyGroup);
            prop.os.setGroupProperty(_propertyGroup);
            prop.pt.setGroupProperty(_propertyGroup);
            prop.p.setGroupProperty(_propertyGroup);
            prop.r.setGroupProperty(_propertyGroup);
            if(shape.ir){
                prop.ir.setGroupProperty(_propertyGroup);
                prop.is.setGroupProperty(_propertyGroup);
            }

            function interfaceFunction(value){
                if(shape.p.ix === value){
                    return interfaceFunction.position;
                }
                if(shape.r.ix === value){
                    return interfaceFunction.rotation;
                }
                if(shape.pt.ix === value){
                    return interfaceFunction.points;
                }
                if(shape.or.ix === value || 'ADBE Vector Star Outer Radius' === value){
                    return interfaceFunction.outerRadius;
                }
                if(shape.os.ix === value){
                    return interfaceFunction.outerRoundness;
                }
                if(shape.ir && (shape.ir.ix === value || 'ADBE Vector Star Inner Radius' === value)){
                    return interfaceFunction.innerRadius;
                }
                if(shape.is && shape.is.ix === value){
                    return interfaceFunction.innerRoundness;
                }

            }
            Object.defineProperty(interfaceFunction, 'position', {
                get: function(){
                    if(prop.p.k){
                        prop.p.getValue();
                    }
                    return prop.p.v;
                }
            });
            Object.defineProperty(interfaceFunction, 'rotation', {
                get: function(){
                    if(prop.r.k){
                        prop.r.getValue();
                    }
                    return prop.r.v/prop.r.mult;
                }
            });
            Object.defineProperty(interfaceFunction, 'points', {
                get: function(){
                    if(prop.pt.k){
                        prop.pt.getValue();
                    }
                    return prop.pt.v;
                }
            });
            Object.defineProperty(interfaceFunction, 'outerRadius', {
                get: function(){
                    if(prop.or.k){
                        prop.or.getValue();
                    }
                    return prop.or.v;
                }
            });
            Object.defineProperty(interfaceFunction, 'outerRoundness', {
                get: function(){
                    if(prop.os.k){
                        prop.os.getValue();
                    }
                    return prop.os.v/prop.os.mult;
                }
            });
            Object.defineProperty(interfaceFunction, 'innerRadius', {
                get: function(){
                    if(!prop.ir){
                        return 0;
                    }
                    if(prop.ir.k){
                        prop.ir.getValue();
                    }
                    return prop.ir.v;
                }
            });
            Object.defineProperty(interfaceFunction, 'innerRoundness', {
                get: function(){
                    if(!prop.is){
                        return 0;
                    }
                    if(prop.is.k){
                        prop.is.getValue();
                    }
                    return prop.is.v/prop.is.mult;
                }
            });
            Object.defineProperty(interfaceFunction, '_name', {
                get: function(){
                    return shape.nm;
                }
            });
            return interfaceFunction;
        }
    }());

    var rectInterfaceFactory = (function(){
        return function(shape,view,propertyGroup){
            function _propertyGroup(val){
                if(val == 1){
                    return interfaceFunction;
                } else {
                    return propertyGroup(--val);
                }
            }
            var prop = view.sh.ty === 'tm' ? view.sh.prop : view.sh;
            interfaceFunction.propertyIndex = shape.ix;
            prop.p.setGroupProperty(_propertyGroup);
            prop.s.setGroupProperty(_propertyGroup);
            prop.r.setGroupProperty(_propertyGroup);

            function interfaceFunction(value){
                if(shape.p.ix === value){
                    return interfaceFunction.position;
                }
                if(shape.r.ix === value){
                    return interfaceFunction.rotation;
                }
                if(shape.pt.ix === value){
                    return interfaceFunction.points;
                }
                if(shape.or.ix === value || 'ADBE Vector Star Outer Radius' === value){
                    return interfaceFunction.outerRadius;
                }
                if(shape.os.ix === value){
                    return interfaceFunction.outerRoundness;
                }
                if(shape.ir && (shape.ir.ix === value || 'ADBE Vector Star Inner Radius' === value)){
                    return interfaceFunction.innerRadius;
                }
                if(shape.is && shape.is.ix === value){
                    return interfaceFunction.innerRoundness;
                }

            }
            Object.defineProperty(interfaceFunction, 'position', {
                get: function(){
                    if(prop.p.k){
                        prop.p.getValue();
                    }
                    return prop.p.v;
                }
            });
            Object.defineProperty(interfaceFunction, 'roundness', {
                get: function(){
                    if(prop.r.k){
                        prop.r.getValue();
                    }
                    return prop.r.v;
                }
            });
            Object.defineProperty(interfaceFunction, 'size', {
                get: function(){
                    if(prop.s.k){
                        prop.s.getValue();
                    }
                    return prop.s.v;
                }
            });

            Object.defineProperty(interfaceFunction, '_name', {
                get: function(){
                    return shape.nm;
                }
            });
            return interfaceFunction;
        }
    }());

    var roundedInterfaceFactory = (function(){
        return function(shape,view,propertyGroup){
            function _propertyGroup(val){
                if(val == 1){
                    return interfaceFunction;
                } else {
                    return propertyGroup(--val);
                }
            }
            var prop = view;
            interfaceFunction.propertyIndex = shape.ix;
            prop.rd.setGroupProperty(_propertyGroup);

            function interfaceFunction(value){
                if(shape.r.ix === value || 'Round Corners 1' === value){
                    return interfaceFunction.radius;
                }

            }
            Object.defineProperty(interfaceFunction, 'radius', {
                get: function(){
                    if(prop.rd.k){
                        prop.rd.getValue();
                    }
                    return prop.rd.v;
                }
            });

            Object.defineProperty(interfaceFunction, '_name', {
                get: function(){
                    return shape.nm;
                }
            });
            return interfaceFunction;
        }
    }());

    var pathInterfaceFactory = (function(){
        return function(shape,view,propertyGroup){
            var prop = view.sh.ty === 'tm' ? view.sh.prop : view.sh;
            prop.setGroupProperty(propertyGroup);
            var ob = {
                get shape(){
                    if(prop.k){
                        prop.getValue();
                    }
                    return prop.v;
                },
                get path(){
                    if(prop.k){
                        prop.getValue();
                    }
                    return prop.v;
                },
                _name: shape.nm
            }
            return ob;
        }
    }());


    return ob;
}())
