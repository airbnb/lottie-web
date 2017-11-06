function CVShapeElement(data, comp,globalData){
    this.shapes = [];
    this.shapesData = data.shapes;
    this.stylesList = [];
    this.itemsData = [];
    this.prevViewData = [];
    this.shapeModifiers = [];
    this.processedElements = [];
    this._parent.constructor.call(this,data, comp,globalData);
}
createElement(CVBaseElement, CVShapeElement);

CVShapeElement.prototype.transformHelper = {opacity:1,mat:new Matrix(),matMdf:false,opMdf:false};

CVShapeElement.prototype.dashResetter = [];

CVShapeElement.prototype.createElements = function(){

    this._parent.createElements.call(this);
    this.searchShapes(this.shapesData,this.itemsData,this.prevViewData,this.dynamicProperties, true);
};

CVShapeElement.prototype.createStyleElement = function(data, dynamicProperties){
    var styleElem = {
        data: data,
        type: data.ty,
        elements: []
    };
    var elementData = {};
    if(data.ty == 'fl' || data.ty == 'st'){
        elementData.c = PropertyFactory.getProp(this,data.c,1,255,dynamicProperties);
        if(!elementData.c.k){
            styleElem.co = 'rgb('+bm_floor(elementData.c.v[0])+','+bm_floor(elementData.c.v[1])+','+bm_floor(elementData.c.v[2])+')';
        }
    }
    elementData.o = PropertyFactory.getProp(this,data.o,0,0.01,dynamicProperties);
    if(data.ty == 'st') {
        styleElem.lc = this.lcEnum[data.lc] || 'round';
        styleElem.lj = this.ljEnum[data.lj] || 'round';
        if(data.lj == 1) {
            styleElem.ml = data.ml;
        }
        elementData.w = PropertyFactory.getProp(this,data.w,0,null,dynamicProperties);
        if(!elementData.w.k){
            styleElem.wi = elementData.w.v;
        }
        if(data.d){
            var d = PropertyFactory.getDashProp(this,data.d,'canvas',dynamicProperties);
            elementData.d = d;
            if(!elementData.d.k){
                styleElem.da = elementData.d.dasharray;
                styleElem.do = elementData.d.dashoffset;
            }
        }

    } else {

        styleElem.r = data.r === 2 ? 'evenodd' : 'nonzero';
    }
    this.stylesList.push(styleElem);
    elementData.style = styleElem;
    return elementData;
}

CVShapeElement.prototype.createGroupElement = function(data) {
    var elementData = {
        it: [],
        prevViewData: []
    };
    return elementData;
}

CVShapeElement.prototype.createTransformElement = function(data, dynamicProperties) {
    var elementData = {
        transform : {
            mat: new Matrix(),
            opacity: 1,
            matMdf:false,
            opMdf:false,
            op: PropertyFactory.getProp(this,data.o,0,0.01,dynamicProperties),
            mProps: PropertyFactory.getProp(this,data,2,null,dynamicProperties)
        },
        elements: []
    };
    return elementData;
}

CVShapeElement.prototype.createShapeElement = function(data, dynamicProperties) {
    var elementData = {
        nodes:[],
        trNodes:[],
        tr:[0,0,0,0,0,0]
    };
    var ty = 4;
    if(data.ty == 'rc'){
        ty = 5;
    }else if(data.ty == 'el'){
        ty = 6;
    }else if(data.ty == 'sr'){
        ty = 7;
    }
    elementData.sh = ShapePropertyFactory.getShapeProp(this,data,ty,dynamicProperties);
    this.shapes.push(elementData.sh);
    this.addShapeToModifiers(elementData);
    jLen = this.stylesList.length;
    var hasStrokes = false, hasFills = false;
    for(j=0;j<jLen;j+=1){
        if(!this.stylesList[j].closed){
            this.stylesList[j].elements.push(elementData);
            if(this.stylesList[j].type === 'st'){
                hasStrokes = true;
            }else{
                hasFills = true;
            }
        }
    }
    elementData.st = hasStrokes;
    elementData.fl = hasFills;
    return elementData;
}

CVShapeElement.prototype.reloadShapes = function(){
    this.firstFrame = true;
    var i, len = this.itemsData.length;
    for(i=0;i<len;i+=1){
        this.prevViewData[i] = this.itemsData[i];
    }
    this.searchShapes(this.shapesData,this.itemsData,this.prevViewData,this.dynamicProperties, true);
    var i, len = this.dynamicProperties.length;
    for(i=0;i<len;i+=1){
        this.dynamicProperties[i].getValue();
    }
    this.renderModifiers();
}

CVShapeElement.prototype.searchShapes = function(arr,itemsData, prevViewData,dynamicProperties, render){
    var i, len = arr.length - 1;
    var j, jLen;
    var ownArrays = [], ownModifiers = [], processedPos;
    for(i=len;i>=0;i-=1){
        processedPos = this.searchProcessedElement(arr[i]);
        if(!processedPos){
            arr[i]._render = render;
        } else {
            itemsData[i] = prevViewData[processedPos - 1];
        }
        if(arr[i].ty == 'fl' || arr[i].ty == 'st'){
            if(!processedPos){
                itemsData[i] = this.createStyleElement(arr[i], dynamicProperties);
            } else {
                itemsData[i].style.closed = false;
            }
            
            ownArrays.push(itemsData[i].style);
        }else if(arr[i].ty == 'gr'){
            if(!processedPos){
                itemsData[i] = this.createGroupElement(arr[i]);
            } else {
                jLen = itemsData[i].it.length;
                for(j=0;j<jLen;j+=1){
                    itemsData[i].prevViewData[j] = itemsData[i].it[j];
                }
            }
            this.searchShapes(arr[i].it,itemsData[i].it,itemsData[i].prevViewData,dynamicProperties, render);
        }else if(arr[i].ty == 'tr'){
            if(!processedPos){
                itemsData[i] = this.createTransformElement(arr[i], dynamicProperties);
            }
        }else if(arr[i].ty == 'sh' || arr[i].ty == 'rc' || arr[i].ty == 'el' || arr[i].ty == 'sr'){
            if(!processedPos){
                itemsData[i] = this.createShapeElement(arr[i], dynamicProperties);
            }
            
        }else if(arr[i].ty == 'tm' || arr[i].ty == 'rd'){
            if(!processedPos){
                var modifier = ShapeModifiers.getModifier(arr[i].ty);
                modifier.init(this,arr[i],dynamicProperties);
                itemsData[i] = modifier;
                this.shapeModifiers.push(modifier);
            } else {
                modifier = itemsData[i];
                modifier.closed = false;
            }
            ownModifiers.push(modifier);
        } else if(arr[i].ty == 'rp'){
            if(!processedPos){
                modifier = ShapeModifiers.getModifier(arr[i].ty);
                itemsData[i] = modifier;
                modifier.init(this,arr,i,itemsData,dynamicProperties);
                this.shapeModifiers.push(modifier);
                render = false;
            }else{
                modifier = itemsData[i];
                modifier.closed = true;
            }
            ownModifiers.push(modifier);
        }
        this.addProcessedElement(arr[i], i + 1);
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
CVShapeElement.prototype.lcEnum = IShapeElement.prototype.lcEnum;
CVShapeElement.prototype.ljEnum = IShapeElement.prototype.ljEnum;
CVShapeElement.prototype.searchProcessedElement = IShapeElement.prototype.searchProcessedElement;
CVShapeElement.prototype.addProcessedElement = IShapeElement.prototype.addProcessedElement;

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
        data = this.itemsData;
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
        if((type === 'st' && this.stylesList[i].wi === 0) || !this.stylesList[i].data._render){
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
            ctx.fill(this.stylesList[i].r);
        }
        renderer.restore();
    }
    renderer.restore();
    if(this.firstFrame){
        this.firstFrame = false;
    }
};
CVShapeElement.prototype.renderPath = function(pathData,itemData,groupTransform){
    var len, i, j,jLen;
    var redraw = groupTransform.matMdf || itemData.sh.mdf || this.firstFrame;
    if(redraw) {
        var paths = itemData.sh.paths, groupTransformMat = groupTransform.mat;
        jLen = paths._length;
        var pathStringTransformed = itemData.trNodes;
        pathStringTransformed.length = 0;
        for(j=0;j<jLen;j+=1){
            var pathNodes = paths.shapes[j];
            if(pathNodes && pathNodes.v){
                len = pathNodes._length;
                for (i = 1; i < len; i += 1) {
                    if (i == 1) {
                        pathStringTransformed.push({
                            t: 'm',
                            p: groupTransformMat.applyToPointArray(pathNodes.v[0][0], pathNodes.v[0][1], 0)
                        });
                    }
                    pathStringTransformed.push({
                        t: 'c',
                        p1: groupTransformMat.applyToPointArray(pathNodes.o[i - 1][0], pathNodes.o[i - 1][1], 0),
                        p2: groupTransformMat.applyToPointArray(pathNodes.i[i][0], pathNodes.i[i][1], 0),
                        p3: groupTransformMat.applyToPointArray(pathNodes.v[i][0], pathNodes.v[i][1], 0)
                    });
                }
                if (len == 1) {
                    pathStringTransformed.push({
                        t: 'm',
                        p: groupTransformMat.applyToPointArray(pathNodes.v[0][0], pathNodes.v[0][1], 0)
                    });
                }
                if (pathNodes.c && len) {
                    pathStringTransformed.push({
                        t: 'c',
                        p1: groupTransformMat.applyToPointArray(pathNodes.o[i - 1][0], pathNodes.o[i - 1][1], 0),
                        p2: groupTransformMat.applyToPointArray(pathNodes.i[0][0], pathNodes.i[0][1], 0),
                        p3: groupTransformMat.applyToPointArray(pathNodes.v[0][0], pathNodes.v[0][1], 0)
                    });
                    pathStringTransformed.push({
                        t: 'z'
                    });
                }
                itemData.lStr = pathStringTransformed;
            }

        }

        if (itemData.st) {
            for (i = 0; i < 16; i += 1) {
                itemData.tr[i] = groupTransform.mat.props[i];
            }
        }
        itemData.trNodes = pathStringTransformed;

    }
};



CVShapeElement.prototype.renderFill = function(styleData,itemData, groupTransform){
    var styleElem = itemData.style;

    if(itemData.c.mdf || this.firstFrame){
        styleElem.co = 'rgb('+bm_floor(itemData.c.v[0])+','+bm_floor(itemData.c.v[1])+','+bm_floor(itemData.c.v[2])+')';
    }
    if(itemData.o.mdf || groupTransform.opMdf || this.firstFrame){
        styleElem.coOp = itemData.o.v*groupTransform.opacity;
    }
};

CVShapeElement.prototype.renderStroke = function(styleData,itemData, groupTransform){
    var styleElem = itemData.style;
    //TODO fix dashes
    var d = itemData.d;
    var dasharray,dashoffset;
    if(d && (d.mdf  || this.firstFrame)){
        styleElem.da = d.dasharray;
        styleElem.do = d.dashoffset;
    }
    if(itemData.c.mdf || this.firstFrame){
        styleElem.co = 'rgb('+bm_floor(itemData.c.v[0])+','+bm_floor(itemData.c.v[1])+','+bm_floor(itemData.c.v[2])+')';
    }
    if(itemData.o.mdf || groupTransform.opMdf || this.firstFrame){
        styleElem.coOp = itemData.o.v*groupTransform.opacity;
    }
    if(itemData.w.mdf || this.firstFrame){
        styleElem.wi = itemData.w.v;
    }
};


CVShapeElement.prototype.destroy = function(){
    this.shapesData = null;
    this.globalData = null;
    this.canvasContext = null;
    this.stylesList.length = 0;
    this.itemData.length = 0;
    this._parent.destroy.call(this._parent);
};

