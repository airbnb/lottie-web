function ShapeInterface(){}

ShapeInterface.prototype.fillInterface = function(shape,view) {
    var ob = {
        get color(){
            if(view.c.k){
                view.c.getValue();
            }
            return view.c.pv;
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
            return view.c.pv;
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

ShapeInterface.prototype.shapeInterface = function(shape,view) {
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

ShapeInterface.prototype.groupInterface = function(shapes,view,container){
    var interfaceArr = [];
    var i, len = shapes.length,interfaceOb;
    for(i=0;i<len;i+=1){
        interfaceOb = {};
        if(shapes[i].ty === 'gr'){
            this.groupInterface(shapes[i].it,view[i].it,interfaceOb);
            interfaceArr.push(interfaceOb);
        }else if(shapes[i].ty === 'sh'){
            interfaceOb = this.shapeInterface(shapes[i],view[i]);
            interfaceArr.push(interfaceOb);
        }else if(shapes[i].ty === 'fl'){
            interfaceOb = this.fillInterface(shapes[i],view[i]);
            interfaceArr.push(interfaceOb);
        }else if(shapes[i].ty === 'st'){
            interfaceOb = this.strokeInterface(shapes[i],view[i]);
            interfaceArr.push(interfaceOb);
        }else{
            interfaceArr.push(interfaceOb);
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