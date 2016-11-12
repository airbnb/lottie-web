function CVShapeElement(data, comp,globalData){
    this.shapes = [];
    this.stylesList = [];
    this.viewData = [];
    this.shapeModifiers = [];
    this.shapesData = data.shapes;
    this.firstFrame = true;
    this._parent.constructor.call(this,data, comp,globalData);
}
createElement(CVBaseElement, CVShapeElement);

CVShapeElement.prototype.lcEnum = {
    '1': 'butt',
    '2': 'round',
    '3': 'butt'
}

CVShapeElement.prototype.ljEnum = {
    '1': 'miter',
    '2': 'round',
    '3': 'butt'
};
CVShapeElement.prototype.transformHelper = {opacity:1,mat:new Matrix(),matMdf:false,opMdf:false};

CVShapeElement.prototype.dashResetter = [];

CVShapeElement.prototype.createElements = function(){

    this._parent.createElements.call(this);
    this.searchShapes(this.shapesData,this.viewData,this.dynamicProperties);
};
CVShapeElement.prototype.searchShapes = function(arr,data,dynamicProperties){
    var i, len = arr.length - 1;
    var j, jLen;
    var ownArrays = [], ownModifiers = [], styleElem;
    for(i=len;i>=0;i-=1){
        if(arr[i].ty == 'fl' || arr[i].ty == 'st'){
            styleElem = {
                type: arr[i].ty,
                elements: []
            };
            data[i] = {};
            if(arr[i].ty == 'fl' || arr[i].ty == 'st'){
                data[i].c = PropertyFactory.getProp(this,arr[i].c,1,255,dynamicProperties);
                if(!data[i].c.k){
                    styleElem.co = 'rgb('+bm_floor(data[i].c.v[0])+','+bm_floor(data[i].c.v[1])+','+bm_floor(data[i].c.v[2])+')';
                }
            }
            data[i].o = PropertyFactory.getProp(this,arr[i].o,0,0.01,dynamicProperties);
            if(arr[i].ty == 'st') {
                styleElem.lc = this.lcEnum[arr[i].lc] || 'round';
                styleElem.lj = this.ljEnum[arr[i].lj] || 'round';
                if(arr[i].lj == 1) {
                    styleElem.ml = arr[i].ml;
                }
                data[i].w = PropertyFactory.getProp(this,arr[i].w,0,null,dynamicProperties);
                if(!data[i].w.k){
                    styleElem.wi = data[i].w.v;
                }
                if(arr[i].d){
                    var d = PropertyFactory.getDashProp(this,arr[i].d,'canvas',dynamicProperties);
                    data[i].d = d;
                    if(!data[i].d.k){
                        styleElem.da = data[i].d.dasharray;
                        styleElem.do = data[i].d.dashoffset;
                    }
                }

            }
            this.stylesList.push(styleElem);
            data[i].style = styleElem;
            ownArrays.push(data[i].style);
        }else if(arr[i].ty == 'gr'){
            data[i] = {
                it: []
            };
            this.searchShapes(arr[i].it,data[i].it,dynamicProperties);
        }else if(arr[i].ty == 'tr'){
            data[i] = {
                transform : {
                    mat: new Matrix(),
                    opacity: 1,
                    matMdf:false,
                    opMdf:false,
                    op: PropertyFactory.getProp(this,arr[i].o,0,0.01,dynamicProperties),
                    mProps: PropertyFactory.getProp(this,arr[i],2,null,dynamicProperties)
                },
                elements: []
            };
        }else if(arr[i].ty == 'sh' || arr[i].ty == 'rc' || arr[i].ty == 'el' || arr[i].ty == 'sr'){
            data[i] = {
                nodes:[],
                trNodes:[],
                tr:[0,0,0,0,0,0]
            };
            var ty = 4;
            if(arr[i].ty == 'rc'){
                ty = 5;
            }else if(arr[i].ty == 'el'){
                ty = 6;
            }else if(arr[i].ty == 'sr'){
                ty = 7;
            }
            data[i].sh = ShapePropertyFactory.getShapeProp(this,arr[i],ty,dynamicProperties);
            this.shapes.push(data[i].sh);
            this.addShapeToModifiers(data[i].sh);
            jLen = this.stylesList.length;
            var hasStrokes = false, hasFills = false;
            for(j=0;j<jLen;j+=1){
                if(!this.stylesList[j].closed){
                    this.stylesList[j].elements.push(data[i]);
                    if(this.stylesList[j].type === 'st'){
                        hasStrokes = true;
                    }else{
                        hasFills = true;
                    }
                }
            }
            data[i].st = hasStrokes;
            data[i].fl = hasFills;
        }else if(arr[i].ty == 'tm' || arr[i].ty == 'rd'){
            var modifier = ShapeModifiers.getModifier(arr[i].ty);
            modifier.init(this,arr[i],dynamicProperties);
            this.shapeModifiers.push(modifier);
            ownModifiers.push(modifier);
            data[i] = modifier;
        }
    }
    len = ownArrays.length;
    for(i=0;i<len;i+=1){
        ownArrays[i].closed = true;
    }
    len = ownModifiers.length;
    for(i=0;i<len;i+=1){
        ownModifiers[i].closed = true;
    }
};

CVShapeElement.prototype.addShapeToModifiers = IShapeElement.prototype.addShapeToModifiers;
CVShapeElement.prototype.renderModifiers = IShapeElement.prototype.renderModifiers;

CVShapeElement.prototype.renderFrame = function(parentMatrix){
    if(this._parent.renderFrame.call(this, parentMatrix)===false){
        return;
    }
    this.transformHelper.mat.reset();
    this.transformHelper.opacity = this.finalTransform.opacity;
    this.transformHelper.matMdf = false;
    this.transformHelper.opMdf = this.finalTransform.opMdf;
    this.renderModifiers();
    this.renderShape(this.transformHelper,null,null,true);
    if(this.data.hasMask){
        this.globalData.renderer.restore(true);
    }
};

CVShapeElement.prototype.renderShape = function(parentTransform,items,data,isMain){
    var i, len;
    if(!items){
        items = this.shapesData;
        len = this.stylesList.length;
        for(i=0;i<len;i+=1){
            this.stylesList[i].d = '';
            this.stylesList[i].mdf = false;
        }
    }
    if(!data){
        data = this.viewData;
    }
    ///
    ///
    len = items.length - 1;
    var groupTransform,groupMatrix;
    groupTransform = parentTransform;
    for(i=len;i>=0;i-=1){
        if(items[i].ty == 'tr'){
            groupTransform = data[i].transform;
            var mtArr = data[i].transform.mProps.v.props;
            groupTransform.matMdf = groupTransform.mProps.mdf;
            groupTransform.opMdf = groupTransform.op.mdf;
            groupMatrix = groupTransform.mat;
            groupMatrix.cloneFromProps(mtArr);
            if(parentTransform){
                var props = parentTransform.mat.props;
                groupTransform.opacity = parentTransform.opacity;
                groupTransform.opacity *= data[i].transform.op.v;
                groupTransform.matMdf = parentTransform.matMdf ? true : groupTransform.matMdf;
                groupTransform.opMdf = parentTransform.opMdf ? true : groupTransform.opMdf;
                groupMatrix.transform(props[0],props[1],props[2],props[3],props[4],props[5],props[6],props[7],props[8],props[9],props[10],props[11],props[12],props[13],props[14],props[15]);
            }else{
                groupTransform.opacity = groupTransform.op.o;
            }
        }else if(items[i].ty == 'sh' || items[i].ty == 'el' || items[i].ty == 'rc' || items[i].ty == 'sr'){
            this.renderPath(items[i],data[i],groupTransform);
        }else if(items[i].ty == 'fl'){
            this.renderFill(items[i],data[i],groupTransform);
        }else if(items[i].ty == 'st'){
            this.renderStroke(items[i],data[i],groupTransform);
        }else if(items[i].ty == 'gr'){
            this.renderShape(groupTransform,items[i].it,data[i].it);
        }else if(items[i].ty == 'tm'){
            //
        }
    }
    if(!isMain){
        return;
    }
    len = this.stylesList.length;
    var j, jLen, k, kLen,elems,nodes, renderer = this.globalData.renderer, ctx = this.globalData.canvasContext, type;
    renderer.save();
    renderer.ctxTransform(this.finalTransform.mat.props);
    for(i=0;i<len;i+=1){
        type = this.stylesList[i].type;
        if(type === 'st' && this.stylesList[i].wi === 0){
            continue;
        }
        renderer.save();
        elems = this.stylesList[i].elements;
        if(type === 'st'){
            ctx.strokeStyle = this.stylesList[i].co;
            ctx.lineWidth = this.stylesList[i].wi;
            ctx.lineCap = this.stylesList[i].lc;
            ctx.lineJoin = this.stylesList[i].lj;
            ctx.miterLimit = this.stylesList[i].ml || 0;
        }else{
            ctx.fillStyle = this.stylesList[i].co;
        }
        renderer.ctxOpacity(this.stylesList[i].coOp);
        if(type !== 'st'){
            ctx.beginPath();
        }
        jLen = elems.length;
        for(j=0;j<jLen;j+=1){
            if(type === 'st'){
                ctx.beginPath();
                if(this.stylesList[i].da){
                    ctx.setLineDash(this.stylesList[i].da);
                    ctx.lineDashOffset = this.stylesList[i].do;
                    this.globalData.isDashed = true;
                }else if(this.globalData.isDashed){
                    ctx.setLineDash(this.dashResetter);
                    this.globalData.isDashed = false;
                }
            }
            nodes = elems[j].trNodes;
            kLen = nodes.length;

            for(k=0;k<kLen;k+=1){
                if(nodes[k].t == 'm'){
                    ctx.moveTo(nodes[k].p[0],nodes[k].p[1]);
                }else if(nodes[k].t == 'c'){
                    ctx.bezierCurveTo(nodes[k].p1[0],nodes[k].p1[1],nodes[k].p2[0],nodes[k].p2[1],nodes[k].p3[0],nodes[k].p3[1]);
                }else{
                    ctx.closePath();
                }
            }
            if(type === 'st'){
                ctx.stroke();
            }
        }
        if(type !== 'st'){
            ctx.fill();
        }
        renderer.restore();
    }
    renderer.restore();
    if(this.firstFrame){
        this.firstFrame = false;
    }
};
CVShapeElement.prototype.renderPath = function(pathData,viewData,groupTransform){
    var len, i, j,jLen;
    var redraw = groupTransform.matMdf || viewData.sh.mdf || this.firstFrame;
    if(redraw) {
        var paths = viewData.sh.paths;
        jLen = paths.length;
        var pathStringTransformed = viewData.trNodes;
        pathStringTransformed.length = 0;
        for(j=0;j<jLen;j+=1){
            var pathNodes = paths[j];
            if(pathNodes && pathNodes.v){
                len = pathNodes.v.length;
                for (i = 1; i < len; i += 1) {
                    if (i == 1) {
                        pathStringTransformed.push({
                            t: 'm',
                            p: groupTransform.mat.applyToPointArray(pathNodes.v[0][0], pathNodes.v[0][1], 0)
                        });
                    }
                    pathStringTransformed.push({
                        t: 'c',
                        p1: groupTransform.mat.applyToPointArray(pathNodes.o[i - 1][0], pathNodes.o[i - 1][1], 0),
                        p2: groupTransform.mat.applyToPointArray(pathNodes.i[i][0], pathNodes.i[i][1], 0),
                        p3: groupTransform.mat.applyToPointArray(pathNodes.v[i][0], pathNodes.v[i][1], 0)
                    });
                }
                if (len == 1) {
                    pathStringTransformed.push({
                        t: 'm',
                        p: groupTransform.mat.applyToPointArray(pathNodes.v[0][0], pathNodes.v[0][1], 0)
                    });
                }
                if (pathNodes.c && len) {
                    pathStringTransformed.push({
                        t: 'c',
                        p1: groupTransform.mat.applyToPointArray(pathNodes.o[i - 1][0], pathNodes.o[i - 1][1], 0),
                        p2: groupTransform.mat.applyToPointArray(pathNodes.i[0][0], pathNodes.i[0][1], 0),
                        p3: groupTransform.mat.applyToPointArray(pathNodes.v[0][0], pathNodes.v[0][1], 0)
                    });
                    pathStringTransformed.push({
                        t: 'z'
                    });
                }
                viewData.lStr = pathStringTransformed;
            }

        }

        if (viewData.st) {
            for (i = 0; i < 16; i += 1) {
                viewData.tr[i] = groupTransform.mat.props[i];
            }
        }
        viewData.trNodes = pathStringTransformed;

    }
};



CVShapeElement.prototype.renderFill = function(styleData,viewData, groupTransform){
    var styleElem = viewData.style;

    if(viewData.c.mdf || this.firstFrame){
        styleElem.co = 'rgb('+bm_floor(viewData.c.v[0])+','+bm_floor(viewData.c.v[1])+','+bm_floor(viewData.c.v[2])+')';
    }
    if(viewData.o.mdf || groupTransform.opMdf || this.firstFrame){
        styleElem.coOp = viewData.o.v*groupTransform.opacity;
    }
};

CVShapeElement.prototype.renderStroke = function(styleData,viewData, groupTransform){
    var styleElem = viewData.style;
    //TODO fix dashes
    var d = viewData.d;
    var dasharray,dashoffset;
    if(d && (d.mdf  || this.firstFrame)){
        styleElem.da = d.dasharray;
        styleElem.do = d.dashoffset;
    }
    if(viewData.c.mdf || this.firstFrame){
        styleElem.co = 'rgb('+bm_floor(viewData.c.v[0])+','+bm_floor(viewData.c.v[1])+','+bm_floor(viewData.c.v[2])+')';
    }
    if(viewData.o.mdf || groupTransform.opMdf || this.firstFrame){
        styleElem.coOp = viewData.o.v*groupTransform.opacity;
    }
    if(viewData.w.mdf || this.firstFrame){
        styleElem.wi = viewData.w.v;
    }
};


CVShapeElement.prototype.destroy = function(){
    this.shapesData = null;
    this.globalData = null;
    this.canvasContext = null;
    this.stylesList.length = 0;
    this.viewData.length = 0;
    this._parent.destroy.call();
};

