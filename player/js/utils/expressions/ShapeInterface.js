var ShapeExpressionInterface = (function(){
    var ob = {
        createShapeInterface:createShapeInterface,
        createGroupInterface:createGroupInterface,
        createTrimInterface:createTrimInterface,
        createStrokeInterface:createStrokeInterface,
        createTransformInterface:createTransformInterface,
        createEllipseInterface:createEllipseInterface,
        createStarInterface:createStarInterface,
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
    function createPathInterface(shape,view,propertyGroup){
        return pathInterfaceFactory(shape,view,propertyGroup);
    }

    function iterateElements(shapes,view, propertyGroup){
        var arr = [];
        var i, len = shapes.length;
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
                arr.push(ShapeExpressionInterface.createTransformInterface(shapes[i],view[i],propertyGroup));
            }else if(shapes[i].ty == 'el'){
                arr.push(ShapeExpressionInterface.createEllipseInterface(shapes[i],view[i],propertyGroup));
            }else if(shapes[i].ty == 'sr'){
                arr.push(ShapeExpressionInterface.createStarInterface(shapes[i],view[i],propertyGroup));
            } else if(shapes[i].ty == 'sh'){
                arr.push(ShapeExpressionInterface.createPathInterface(shapes[i],view[i],propertyGroup));
            } else{
                //console.log(shapes[i].ty);
            }
        }
        return arr;
    }

    var shapeInterfaceFactory = (function(){
        return function(shapes,view,propertyGroup){
            //console.log('shapes',shapes);
            // console.log('view',view);
            var interfaces;
            function _interfaceFunction(value){
                //console.log('shapeInterfaceFactory::value: ',value);
                if(typeof value === 'number'){
                    return interfaces[value-1];
                } else {
                    var i = 0, len = interfaces.length;
                    while(i<len){
                        if(interfaces[i].name === value){
                            //console.log('interfaces[i]: ',interfaces[i]);
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

    var groupInterfaceFactory = (function(){
        return function(shape,view, propertyGroup){
            var interfaces;
            var interfaceFunction = function _interfaceFunction(value){
                if(value === 'ADBE Vectors Group'){
                    return interfaceFunction;
                } else if(value === 'ADBE Vector Transform Group'){
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
                        if(interfaces[i].name === value){
                            return interfaces[i];
                        }
                        i+=1;
                    }
                }
                console.log('returning null', value);
            }
            interfaceFunction.propertyGroup = function(val){
                if(val === 1){
                    return interfaceFunction;
                } else{
                    return propertyGroup(val-1);
                }
            };
            interfaces = iterateElements(shape.it, view.it, interfaceFunction.propertyGroup);
            Object.defineProperty(interfaceFunction, 'name', {
                get: function(){
                    return shape.nm;
                }
            });
            //interfaceFunction.name = shape.nm;
            interfaceFunction.content = interfaceFunction;
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
                name: shape.nm
            };
            return ob;
        }
    }());

    var strokeInterfaceFactory = (function(){
        return function(shape,view,propertyGroup){
            view.c.setGroupProperty(propertyGroup);
            view.o.setGroupProperty(propertyGroup);
            view.w.setGroupProperty(propertyGroup);
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
                name: shape.nm
            };
            return ob;
        }
    }());

    var trimInterfaceFactory = (function(){
        return function(shape,view,propertyGroup){
            function _propertyGroup(val){
                if(val == 1){
                    return _propertyGroup;
                } else {
                    return propertyGroup(--val);
                }
            }
            _propertyGroup.propertyIndex = shape.ix;

            view.tr.s.setGroupProperty(_propertyGroup);
            view.tr.e.setGroupProperty(_propertyGroup);
            view.tr.o.setGroupProperty(_propertyGroup);

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
            Object.defineProperty(interfaceFunction, 'start', {
                get: function(){
                    if(view.tr.s.k){
                        view.tr.s.getValue();
                    }
                    return view.tr.s.v/view.tr.s.mult;
                }
            });
            Object.defineProperty(interfaceFunction, 'end', {
                get: function(){
                    if(view.tr.e.k){
                        view.tr.e.getValue();
                    }
                    return view.tr.e.v/view.tr.e.mult;
                }
            });
            Object.defineProperty(interfaceFunction, 'offset', {
                get: function(){
                    if(view.tr.o.k){
                        view.tr.o.getValue();
                    }
                    return view.tr.o.v;
                }
            });
            Object.defineProperty(interfaceFunction, 'name', {
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
                    return _propertyGroup;
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
                    return view.transform.mProps.o.v;
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
            Object.defineProperty(interfaceFunction, 'name', {
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
                    return _propertyGroup;
                } else {
                    return propertyGroup(--val);
                }
            }
            _propertyGroup.propertyIndex = shape.ix;
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
            Object.defineProperty(interfaceFunction, 'name', {
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
                    return _propertyGroup;
                } else {
                    return propertyGroup(--val);
                }
            }
            var prop = view.sh.ty === 'tm' ? view.sh.prop : view.sh;
            _propertyGroup.propertyIndex = shape.ix;
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
                console.log('value: ',value);
                //ADBE Vector Star Outer Radius

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
            Object.defineProperty(interfaceFunction, 'name', {
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
                name: shape.nm
            }
            return ob;
        }
    }());


    return ob;
}())