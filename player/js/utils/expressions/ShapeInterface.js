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
        createRepatearInterface:createRepatearInterface,
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
    function createRepatearInterface(shape,view,propertyGroup){
        return repeaterInterfaceFactory(shape,view,propertyGroup);
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
            } else if(shapes[i].ty == 'rp'){
                arr.push(ShapeExpressionInterface.createRepatearInterface(shapes[i],view[i],propertyGroup));
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
               var i = 0, len = interfaces.length;
                while(i<len){
                    if(interfaces[i]._name === value || interfaces[i].mn === value || interfaces[i].propertyIndex === value || interfaces[i].ix === value || interfaces[i].ind === value){
                       return interfaces[i];
                    }
                    i+=1;
                }
                if(typeof value === 'number'){
                   return interfaces[value-1];
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
           interfaceFunction.numProperties = interfaces.length;
           interfaceFunction.propertyIndex = shape.cix;

           return interfaceFunction;
       }
    }());

    var groupInterfaceFactory = (function(){
        return function(shape,view, propertyGroup){
            var interfaceFunction = function _interfaceFunction(value){
                switch(value){
                    case 'ADBE Vectors Group':
                    case 'Contents':
                    case 2:
                        return interfaceFunction.content;
                    case 'ADBE Vector Transform Group':
                    case 3:
                    default:
                        return interfaceFunction.transform;
                }
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
            interfaceFunction.numProperties = shape.np;
            interfaceFunction.propertyIndex = shape.ix;
            interfaceFunction.nm = shape.nm;
            interfaceFunction.mn = shape.mn;
            return interfaceFunction;
        }
    }());

    var fillInterfaceFactory = (function(){
        return function(shape,view,propertyGroup){

            function interfaceFunction(val){
                if(val === 'Color' || val === 'color'){
                    return interfaceFunction.color;
                } else if(val === 'Opacity' || val === 'opacity'){
                    return interfaceFunction.opacity;
                }
            }
            Object.defineProperty(interfaceFunction, 'color', {
                get: function(){
                    return ExpressionValue(view.c, 1 / view.c.mult, 'color');
                }
            });
            Object.defineProperty(interfaceFunction, 'opacity', {
                get: function(){
                    return ExpressionValue(view.o, 100);
                }
            });
            Object.defineProperty(interfaceFunction, '_name', { value: shape.nm });
            Object.defineProperty(interfaceFunction, 'mn', { value: shape.mn });

            view.c.setGroupProperty(propertyGroup);
            view.o.setGroupProperty(propertyGroup);
            return interfaceFunction;
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
            function _dashPropertyGroup(val){
                if(val === 1){
                    return dashOb;
                } else{
                    return _propertyGroup(val-1);
                }
            };
            function addPropertyToDashOb(i) {
                Object.defineProperty(dashOb, shape.d[i].nm, {
                    get: function(){
                        return ExpressionValue(view.d.dataProps[i].p)
                    }
                });
            }
            var i, len = shape.d ? shape.d.length : 0;
            var dashOb = {}
            for (i = 0; i < len; i += 1) {
                addPropertyToDashOb(i);
                view.d.dataProps[i].p.setGroupProperty(_dashPropertyGroup);
            }

            function interfaceFunction(val){
                if(val === 'Color' || val === 'color'){
                    return interfaceFunction.color;
                } else if(val === 'Opacity' || val === 'opacity'){
                    return interfaceFunction.opacity;
                } else if(val === 'Stroke Width' || val === 'stroke width'){
                    return interfaceFunction.strokeWidth;
                }
            }
            Object.defineProperty(interfaceFunction, 'color', {
                get: function(){
                    return ExpressionValue(view.c, 1 / view.c.mult, 'color');
                }
            });
            Object.defineProperty(interfaceFunction, 'opacity', {
                get: function(){
                    return ExpressionValue(view.o, 100);
                }
            });
            Object.defineProperty(interfaceFunction, 'strokeWidth', {
                get: function(){
                    return ExpressionValue(view.w);
                }
            });
            Object.defineProperty(interfaceFunction, 'dash', {
                get: function(){
                    return dashOb;
                }
            });
            Object.defineProperty(interfaceFunction, '_name', { value: shape.nm });
            Object.defineProperty(interfaceFunction, 'mn', { value: shape.mn });

            view.c.setGroupProperty(_propertyGroup);
            view.o.setGroupProperty(_propertyGroup);
            view.w.setGroupProperty(_propertyGroup);
            return interfaceFunction;
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
                if(val === shape.e.ix || val === 'End' || val === 'end'){
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
                    return ExpressionValue(view.s, 1 / view.s.mult);
                }
            });
            Object.defineProperty(interfaceFunction, 'end', {
                get: function(){
                    return ExpressionValue(view.e, 1 / view.e.mult);
                }
            });
            Object.defineProperty(interfaceFunction, 'offset', {
                get: function(){
                    return ExpressionValue(view.o);
                }
            });
            Object.defineProperty(interfaceFunction, '_name', {
                get: function(){
                    return shape.nm;
                }
            });
            interfaceFunction.mn = shape.mn;
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
                if(value === 'Opacity') {
                    return interfaceFunction.opacity;
                }
                if(value === 'Position') {
                    return interfaceFunction.position;
                }
                if(value === 'Anchor Point') {
                    return interfaceFunction.anchorPoint;
                }
                if(value === 'Scale') {
                    return interfaceFunction.scale;
                }
                if(value === 'Rotation' || value === 'ADBE Vector Rotation') {
                    return interfaceFunction.rotation;
                }
                if(value === 'Skew') {
                    return interfaceFunction.skew;
                }
                if(value === 'Skew Axis') {
                    return interfaceFunction.skewAxis;
                }

            }
            Object.defineProperty(interfaceFunction, 'opacity', {
                get: function(){
                    return ExpressionValue(view.transform.mProps.o, 1/view.transform.mProps.o.mult);
                }
            });
            Object.defineProperty(interfaceFunction, 'position', {
                get: function(){
                    return ExpressionValue(view.transform.mProps.p);
                }
            });
            Object.defineProperty(interfaceFunction, 'anchorPoint', {
                get: function(){
                    return ExpressionValue(view.transform.mProps.a);
                }
            });
            var scaleArray = [];
            Object.defineProperty(interfaceFunction, 'scale', {
                get: function(){
                    return ExpressionValue(view.transform.mProps.s, 1 / view.transform.mProps.s.mult);
                }
            });
            Object.defineProperty(interfaceFunction, 'rotation', {
                get: function(){
                    return ExpressionValue(view.transform.mProps.r, 1 / view.transform.mProps.r.mult);
                }
            });
            Object.defineProperty(interfaceFunction, 'skew', {
                get: function(){
                    return ExpressionValue(view.transform.mProps.sk);
                }
            });
            Object.defineProperty(interfaceFunction, 'skewAxis', {
                get: function(){
                    return ExpressionValue(view.transform.mProps.sa);
                }
            });
            Object.defineProperty(interfaceFunction, '_name', {
                get: function(){
                    return shape.nm;
                }
            });
            interfaceFunction.ty = 'tr';
            interfaceFunction.mn = shape.mn;
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
                    return ExpressionValue(prop.s);
                }
            });
            Object.defineProperty(interfaceFunction, 'position', {
                get: function(){
                    return ExpressionValue(prop.p);
                }
            });
            Object.defineProperty(interfaceFunction, '_name', {
                get: function(){
                    return shape.nm;
                }
            });
            interfaceFunction.mn = shape.mn;
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
                    return ExpressionValue(prop.p);
                }
            });
            Object.defineProperty(interfaceFunction, 'rotation', {
                get: function(){
                    return ExpressionValue(prop.r, 1 / prop.r.mult);
                }
            });
            Object.defineProperty(interfaceFunction, 'points', {
                get: function(){
                    return ExpressionValue(prop.pt);
                }
            });
            Object.defineProperty(interfaceFunction, 'outerRadius', {
                get: function(){
                    return ExpressionValue(prop.or);
                }
            });
            Object.defineProperty(interfaceFunction, 'outerRoundness', {
                get: function(){
                    return ExpressionValue(prop.os);
                }
            });
            Object.defineProperty(interfaceFunction, 'innerRadius', {
                get: function(){
                    if(!prop.ir){
                        return 0;
                    }
                    return ExpressionValue(prop.ir);
                }
            });
            Object.defineProperty(interfaceFunction, 'innerRoundness', {
                get: function(){
                    if(!prop.is){
                        return 0;
                    }
                    return ExpressionValue(prop.is, 1 / prop.is.mult);
                }
            });
            Object.defineProperty(interfaceFunction, '_name', {
                get: function(){
                    return shape.nm;
                }
            });
            interfaceFunction.mn = shape.mn;
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
                    return interfaceFunction.roundness;
                }
                if(shape.s.ix === value || value === 'Size'){
                    return interfaceFunction.size;
                }

            }
            Object.defineProperty(interfaceFunction, 'position', {
                get: function(){
                    return ExpressionValue(prop.p);
                }
            });
            Object.defineProperty(interfaceFunction, 'roundness', {
                get: function(){
                    return ExpressionValue(prop.r);
                }
            });
            Object.defineProperty(interfaceFunction, 'size', {
                get: function(){
                    return ExpressionValue(prop.s);
                }
            });

            Object.defineProperty(interfaceFunction, '_name', {
                get: function(){
                    return shape.nm;
                }
            });
            interfaceFunction.mn = shape.mn;
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
                    return ExpressionValue(prop.rd);
                }
            });

            Object.defineProperty(interfaceFunction, '_name', {
                get: function(){
                    return shape.nm;
                }
            });
            interfaceFunction.mn = shape.mn;
            return interfaceFunction;
        }
    }());

    var repeaterInterfaceFactory = (function(){
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
            prop.c.setGroupProperty(_propertyGroup);
            prop.o.setGroupProperty(_propertyGroup);

            function interfaceFunction(value){
                if(shape.c.ix === value || 'Copies' === value){
                    return interfaceFunction.copies;
                } else if(shape.o.ix === value || 'Offset' === value){
                    return interfaceFunction.offset;
                }

            }
            Object.defineProperty(interfaceFunction, 'copies', {
                get: function(){
                    return ExpressionValue(prop.c);
                }
            });

            Object.defineProperty(interfaceFunction, 'offset', {
                get: function(){
                    return ExpressionValue(prop.o);
                }
            });

            Object.defineProperty(interfaceFunction, '_name', {
                get: function(){
                    return shape.nm;
                }
            });
            interfaceFunction.mn = shape.mn;
            return interfaceFunction;
        }
    }());

    var pathInterfaceFactory = (function(){
        return function(shape,view,propertyGroup){
            var prop = view.sh;
            function _propertyGroup(val){
                if(val == 1){
                    return interfaceFunction;
                } else {
                    return propertyGroup(--val);
                }
            }
            prop.setGroupProperty(_propertyGroup);

            function interfaceFunction(val){
                if(val === 'Shape' || val === 'shape' || val === 'Path' || val === 'path' || val === 'ADBE Vector Shape' || val === 2){
                    return interfaceFunction.path;
                }
            }

            Object.defineProperty(interfaceFunction, 'path', {
                get: function(){
                    if(prop.k){
                        prop.getValue();
                    }
                    return prop;
                    //return shape_pool.clone(prop.v);
                }
            });
            Object.defineProperty(interfaceFunction, 'shape', {
                get: function(){
                    if(prop.k){
                        prop.getValue();
                    }
                    return prop;
                    //return shape_pool.clone(prop.v);
                }
            });
            Object.defineProperty(interfaceFunction, '_name', { value: shape.nm });
            Object.defineProperty(interfaceFunction, 'ix', { value: shape.ix });
            Object.defineProperty(interfaceFunction, 'mn', { value: shape.mn });
            return interfaceFunction;
        }
    }());


    return ob;
}())
