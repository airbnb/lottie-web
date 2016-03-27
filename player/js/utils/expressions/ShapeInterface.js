function ShapeInterface(){}

ShapeInterface.prototype.fillInterface = function(view) {
    var ob = {
        get color(){
            if(view.c.k){
                view.c.getValue();
            }
            return [view.c.pv[0],view.c.pv[1],view.c.pv[2]];
        },
        get opacity(){
            if(view.o.k){
                view.o.getValue();
            }
            return view.o.pv;
        }
    }
    return ob;
};

ShapeInterface.prototype.strokeInterface = function(shape,view) {
    var ob = {
        get color(){
            if(view.c.k){
                view.c.getValue();
            }
            return [view.c.pv[0],view.c.pv[1],view.c.pv[2]];
        },
        get opacity(){
            if(view.o.k){
                view.o.getValue();
            }
            return view.o.pv;
        },
        get strokeWidth(){
            if(view.w.k){
                view.w.getValue();
            }
            return view.w.pv;
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
                this.dashOb[dModels[i].nm] = d.dataProps[i].p.v;
            }
            return this.dashOb;
        }
    }
    return ob;
};

ShapeInterface.prototype.shapeInterface = function(view) {
    var ob = {
        get shape(){
            if(view.sh.k){
                view.sh.getValue();
            }
            return view.sh.pv;
        }
    }
    return ob;
};

ShapeInterface.prototype.ellipseInterface = function(view) {
    var ob = {
        get size(){
            if(view.sh.s.k){
                view.sh.s.getValue();
            }
            return [view.sh.s.pv[0],view.sh.s.pv[1]];
        },
        get position(){
            if(view.sh.p.k){
                view.sh.p.getValue();
            }
            return [view.sh.p.pv[0],view.sh.p.pv[1]];
        }
    };
    return ob;
};

ShapeInterface.prototype.rectangleInterface = function(view) {
    var prop = view.sh.ty === 'tm' ? view.sh.prop : view.sh;
    var ob = {
        get size(){
            if(prop.s.k){
                prop.s.getValue();
            }
            return [prop.s.pv[0],prop.s.pv[1]];
        },
        get position(){
            if(prop.p.k){
                prop.p.getValue();
            }
            return [prop.p.pv[0],prop.p.pv[1]];
        },
        get roundness(){
            if(prop.r.k){
                prop.r.getValue();
            }
            return prop.r.pv;
        }
    };
    return ob;
};

ShapeInterface.prototype.trimInterface = function(view) {
    var ob = {
        get start(){
            if(view.tr.s.k){
                view.tr.s.getValue();
            }
            return view.tr.s.pv;
        },
        get end(){
            if(view.tr.e.k){
                view.tr.e.getValue();
            }
            return view.tr.e.pv;
        },
        get offset(){
            if(view.tr.o.k){
                view.tr.o.getValue();
            }
            return view.tr.o.pv;
        }
    };
    return ob;
};

ShapeInterface.prototype.transformInterface = function(view) {
    var ob = {
        get opacity(){
            if(view.transform.mProps.o.k){
                view.transform.mProps.o.getValue();
            }
            return view.transform.mProps.o.pv;
        },
        get position(){
            if(view.transform.mProps.p.k){
                view.transform.mProps.p.getValue();
            }
            return [view.transform.mProps.p.pv[0],view.transform.mProps.p.pv[1]];
        },
        get anchorPoint(){
            if(view.transform.mProps.a.k){
                view.transform.mProps.a.getValue();
            }
            return [view.transform.mProps.a.pv[0],view.transform.mProps.a.pv[1]];
        },
        get scale(){
            if(view.transform.mProps.s.k){
                view.transform.mProps.s.getValue();
            }
            return [view.transform.mProps.s.pv[0],view.transform.mProps.s.pv[1]];
        },
        get rotation(){
            if(view.transform.mProps.r.k){
                view.transform.mProps.r.getValue();
            }
            return view.transform.mProps.r.pv;
        },
        get skew(){
            if(view.transform.mProps.sk.k){
                view.transform.mProps.sk.getValue();
            }
            return view.transform.mProps.sk.pv;
        },
        get skewAxis(){
            if(view.transform.mProps.sa.k){
                view.transform.mProps.sa.getValue();
            }
            return view.transform.mProps.sa.pv;
        }
    }
    return ob;
};

ShapeInterface.prototype.groupInterface = function(shapes,view,container){
    var interfaceArr = [];
    var i, len = shapes.length,interfaceOb;
    for(i=0;i<len;i+=1){
        if(shapes[i].ty === 'gr'){
            interfaceOb = {};
            this.groupInterface(shapes[i].it,view[i].it,interfaceOb);
            interfaceArr.push(interfaceOb);
        }else if(shapes[i].ty === 'sh'){
            interfaceOb = this.shapeInterface(view[i]);
            interfaceArr.push(interfaceOb);
        }else if(shapes[i].ty === 'fl'){
            interfaceOb = this.fillInterface(view[i]);
            interfaceArr.push(interfaceOb);
        }else if(shapes[i].ty === 'st'){
            interfaceOb = this.strokeInterface(shapes[i],view[i]);
            interfaceArr.push(interfaceOb);
        }else if(shapes[i].ty === 'el'){
            interfaceOb = this.ellipseInterface(view[i]);
            interfaceArr.push(interfaceOb);
        }else if(shapes[i].ty === 'rc'){
            interfaceOb = this.rectangleInterface(view[i]);
            interfaceArr.push(interfaceOb);
        }else if(shapes[i].ty === 'tr'){
            container.transform = this.transformInterface(view[i]);
        }else if(shapes[i].ty === 'tm'){
            interfaceOb = this.trimInterface(view[i]);
            interfaceArr.push(interfaceOb);
        }else{
            //console.log(shapes[i].ty);
            interfaceArr.push('');
        }
    }
    container.content = function(nm){
        var i, len = shapes.length;
        for(i=0;i<len;i+=1){
            if(shapes[i].nm === nm){
                return interfaceArr[i];
            }
        }
    }
};

ShapeInterface.prototype.buildExpressionInterface = function(){
    this.groupInterface(this.shapesData,this.viewData,this);
}
extendPrototype(ShapeInterface,IShapeElement);
extendPrototype(ShapeInterface,CVShapeElement);