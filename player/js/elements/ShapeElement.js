function IShapeElement(data,parentContainer,globalData,comp, placeholder){
    this.shapes = [];
    this.shapesData = data.shapes;
    this.stylesList = [];
    this.viewData = [];
    this.shapeModifiers = [];
    this.shapesContainer = document.createElementNS(svgNS,'g');
    this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
}
createElement(SVGBaseElement, IShapeElement);

IShapeElement.prototype.lcEnum = {
    '1': 'butt',
    '2': 'round',
    '3': 'butt'
}

IShapeElement.prototype.ljEnum = {
    '1': 'miter',
    '2': 'round',
    '3': 'butt'
}

IShapeElement.prototype.buildExpressionInterface = function(){};

IShapeElement.prototype.transformHelper = {opacity:1,mat:new Matrix(),matMdf:false,opMdf:false};

IShapeElement.prototype.createElements = function(){
    //TODO check if I can use symbol so i can set its viewBox
    this._parent.createElements.call(this);
    this.searchShapes(this.shapesData,this.viewData,this.dynamicProperties);
    if(!this.data.hd){
        this.layerElement.appendChild(this.shapesContainer);
        styleUnselectableDiv(this.layerElement);
        styleUnselectableDiv(this.shapesContainer);
    }
    //this.elemInterface.registerShapeExpressionInterface(ShapeExpressionInterface.createShapeInterface(this.shapesData,this.viewData,this.elemInterface));
};

IShapeElement.prototype.setGradientData = function(pathElement,arr,data){

    var gradientId = 'gr_'+randomString(10);
    var gfill;
    if(arr.t === 1){
        gfill = document.createElementNS(svgNS,'linearGradient');
    } else {
        gfill = document.createElementNS(svgNS,'radialGradient');
    }
    gfill.setAttribute('id',gradientId);
    gfill.setAttribute('spreadMethod','pad');
    gfill.setAttribute('gradientUnits','userSpaceOnUse');
    var stop, j, jLen;
    jLen = arr.c.length;
    for(j=0;j<jLen;j+=1){
        stop = document.createElementNS(svgNS,'stop');
        stop.setAttribute('offset',Math.round(arr.c[j][0]*100)+'%');
        stop.setAttribute('style','stop-color:rgb('+Math.round(arr.c[j][1]*255)+','+Math.round(arr.c[j][2]*255)+','+Math.round(arr.c[j][3]*255)+')');
        gfill.appendChild(stop);
    }
    pathElement.setAttribute( arr.ty === 'gf' ? 'fill':'stroke','url(#'+gradientId+')');
    this.globalData.defs.appendChild(gfill);
    data.gf = gfill;
}

IShapeElement.prototype.setGradientOpacity = function(arr, data,styleOb){
    if(arr.y.length){
        var opFill;
        var stop, j, jLen;
        var mask = document.createElementNS(svgNS,"mask");
        var maskElement = document.createElementNS(svgNS, arr.ty === 'gf' ? 'path':'g');
        mask.appendChild(maskElement);
        var opacityId = 'op_'+randomString(10);
        var maskId = 'mk_'+randomString(10);
        mask.setAttribute('id',maskId);
        if(arr.t === 1){
            opFill = document.createElementNS(svgNS,'linearGradient');
        } else {
            opFill = document.createElementNS(svgNS,'radialGradient');
        }
        opFill.setAttribute('id',opacityId);
        opFill.setAttribute('spreadMethod','pad');
        opFill.setAttribute('gradientUnits','userSpaceOnUse');
        jLen = arr.y.length;
        for(j=0;j<jLen;j+=1){
            stop = document.createElementNS(svgNS,'stop');
            stop.setAttribute('offset',Math.round(arr.y[j][0]*100)+'%');
            stop.setAttribute('style','stop-color:rgb(255,255,255);stop-opacity:'+arr.y[j][1]);
            opFill.appendChild(stop);
        }
        maskElement.setAttribute( arr.ty === 'gf' ? 'fill':'stroke','url(#'+opacityId+')');
        this.globalData.defs.appendChild(opFill);
        this.globalData.defs.appendChild(mask);
        data.of = opFill;
        styleOb.mElem = maskElement;
        return maskId;
    }
}

IShapeElement.prototype.searchShapes = function(arr,data,dynamicProperties){
    var i, len = arr.length - 1;
    var j, jLen;
    var ownArrays = [], ownModifiers = [], styleOb;
    for(i=len;i>=0;i-=1){
        if(arr[i].ty == 'fl' || arr[i].ty == 'st' || arr[i].ty == 'gf' || arr[i].ty == 'gs'){
            data[i] = {};
            styleOb = {
                type: arr[i].ty,
                d: '',
                ld: '',
                mdf: false
            };
            var pathElement;

            if(arr[i].ty == 'st' || arr[i].ty == 'gs') {
                pathElement = document.createElementNS(svgNS, "g");
            } else {
                pathElement = document.createElementNS(svgNS, "path");
            }
            if(arr[i].ty == 'fl' || arr[i].ty == 'st'){
                data[i].c = PropertyFactory.getProp(this,arr[i].c,1,255,dynamicProperties);
            }
            data[i].o = PropertyFactory.getProp(this,arr[i].o,0,0.01,dynamicProperties);
            if(arr[i].ty == 'st' || arr[i].ty == 'gs') {
                pathElement.setAttribute('stroke-linecap', this.lcEnum[arr[i].lc] || 'round');
                ////pathElement.style.strokeLinecap = this.lcEnum[arr[i].lc] || 'round';
                pathElement.setAttribute('stroke-linejoin',this.ljEnum[arr[i].lj] || 'round');
                ////pathElement.style.strokeLinejoin = this.ljEnum[arr[i].lj] || 'round';
                pathElement.setAttribute('fill-opacity','0');
                ////pathElement.style.fillOpacity = 0;
                if(arr[i].lj == 1) {
                    pathElement.setAttribute('stroke-miterlimit',arr[i].ml);
                    ////pathElement.style.strokeMiterlimit = arr[i].ml;
                }
                if(arr[i].ty == 'st' && !data[i].c.k) {
                    ////pathElement.style.stroke = 'rgb('+data[i].c.v[0]+','+data[i].c.v[1]+','+data[i].c.v[2]+')';
                    pathElement.setAttribute('stroke','rgb('+data[i].c.v[0]+','+data[i].c.v[1]+','+data[i].c.v[2]+')');
                }
                if(!data[i].o.k) {
                    pathElement.setAttribute('stroke-opacity',data[i].o.v);
                    ////pathElement.style.strokeOpacity = data[i].o.v;
                }
                data[i].w = PropertyFactory.getProp(this,arr[i].w,0,null,dynamicProperties);
                if(!data[i].w.k) {
                    pathElement.setAttribute('stroke-width',data[i].w.v);
                    ////pathElement.style.strokeWidth = data[i].w.v;
                }
                if(arr[i].d){
                    var d = PropertyFactory.getDashProp(this,arr[i].d,'svg',dynamicProperties);
                    if(!d.k){
                        pathElement.setAttribute('stroke-dasharray', d.dasharray);
                        ////pathElement.style.strokeDasharray = d.dasharray;
                        pathElement.setAttribute('stroke-dashoffset', d.dashoffset);
                        ////pathElement.style.strokeDashoffset = d.dashoffset;
                    }
                    data[i].d = d;
                }

            }else if(arr[i].ty == 'fl'){
                pathElement = document.createElementNS(svgNS, "path");
                if(!data[i].c.k) {
                    pathElement.setAttribute('fill','rgb('+data[i].c.v[0]+','+data[i].c.v[1]+','+data[i].c.v[2]+')');
                    ////pathElement.style.fill = 'rgb('+data[i].c.v[0]+','+data[i].c.v[1]+','+data[i].c.v[2]+')';
                }
                if(!data[i].o.k) {
                    pathElement.setAttribute('fill-opacity',data[i].o.v);
                    ////pathElement.style.fillOpacity = data[i].o.v;
                };
            }
            if(arr[i].ty == 'gf' || arr[i].ty == 'gs'){
                data[i].h = PropertyFactory.getProp(this,arr[i].h,1,0.01,dynamicProperties);
                data[i].a = PropertyFactory.getProp(this,arr[i].a,1,degToRads,dynamicProperties);
                data[i].s = PropertyFactory.getProp(this,arr[i].s,1,null,dynamicProperties);
                data[i].e = PropertyFactory.getProp(this,arr[i].e,1,null,dynamicProperties);
                this.setGradientData(pathElement,arr[i],data[i], styleOb);
                var maskId = this.setGradientOpacity(arr[i],data[i], styleOb);
                if(maskId){
                    pathElement.setAttribute('mask','url(#'+maskId+')');
                    if(arr[i].ty == 'gs' && !data[i].w.k){
                        styleOb.mElem.setAttribute('stroke-width',data[i].w.v);
                    }
                }
            }

            if(arr[i].ln){
                pathElement.setAttribute('id',arr[i].ln);
            }
            if(arr[i].cl){
                pathElement.setAttribute('class',arr[i].cl);
            }
            this.shapesContainer.appendChild(pathElement);
            styleOb.pElem = pathElement;
            this.stylesList.push(styleOb);
            data[i].style = styleOb;
            ownArrays.push(styleOb);
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
                elements : [],
                styles : [],
                lStr: ''
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
            var element, hasStrokes = false, hasFills = false;
            for(j=0;j<jLen;j+=1){
                if(!this.stylesList[j].closed){
                    if(this.stylesList[j].type === 'st' || this.stylesList[j].type === 'gs'){
                        hasStrokes = true;
                        element = document.createElementNS(svgNS, "path");
                        this.stylesList[j].pElem.appendChild(element);
                        data[i].elements.push({
                            ty:this.stylesList[j].type,
                            el:element
                        });
                        if(this.stylesList[j].mElem){
                            var mElem = document.createElementNS(svgNS, "path");
                            this.stylesList[j].mElem.appendChild(mElem);
                            data[i].elements[data[i].elements.length - 1].ms = mElem;
                        }
                    }else{
                        hasFills = true;
                        data[i].elements.push({
                            ty:this.stylesList[j].type,
                            st: this.stylesList[j]
                        });
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

IShapeElement.prototype.addShapeToModifiers = function(shape) {
    var i, len = this.shapeModifiers.length;
    for(i=0;i<len;i+=1){
        this.shapeModifiers[i].addShape(shape);
    }
};

IShapeElement.prototype.renderModifiers = function() {
    if(!this.shapeModifiers.length){
        return;
    }
    var i, len = this.shapes.length;
    for(i=0;i<len;i+=1){
        this.shapes[i].reset();
    }


    len = this.shapeModifiers.length;

    for(i=len-1;i>=0;i-=1){
        this.shapeModifiers[i].processShapes();
    }
};

IShapeElement.prototype.renderFrame = function(parentMatrix){
    var renderParent = this._parent.renderFrame.call(this,parentMatrix);
    if(renderParent===false){
        this.hide();
        return;
    }

    this.hidden = false;
    if(this.finalTransform.matMdf && !this.data.hasMask){
        this.shapesContainer.setAttribute('transform',this.finalTransform.mat.to2dCSS());
    }
    this.transformHelper.opacity = this.finalTransform.opacity;
    this.transformHelper.matMdf = false;
    this.transformHelper.opMdf = this.finalTransform.opMdf;
    this.renderModifiers();
    this.renderShape(this.transformHelper,null,null,true);
};

IShapeElement.prototype.hide = function(){
    if(!this.hidden){
        var i, len = this.stylesList.length;
        for(i=len-1;i>=0;i-=1){
            if(this.stylesList[i].ld !== '0'){
                this.stylesList[i].ld = '0';
                this.stylesList[i].pElem.style.display = 'none';
                if(this.stylesList[i].pElem.parentNode){
                    this.stylesList[i].parent = this.stylesList[i].pElem.parentNode;
                    //this.stylesList[i].pElem.parentNode.removeChild(this.stylesList[i].pElem);
                }
            }
        }
        this.hidden = true;
    }
};

IShapeElement.prototype.renderShape = function(parentTransform,items,data,isMain){
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
        }else if(items[i].ty == 'gf'){
            this.renderGradient(items[i],data[i],groupTransform);
        }else if(items[i].ty == 'gs'){
            this.renderGradient(items[i],data[i],groupTransform);
            this.renderStroke(items[i],data[i],groupTransform);
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
    for(i=0;i<len;i+=1){
        if(this.stylesList[i].ld === '0') {
            this.stylesList[i].ld = '1';
            this.stylesList[i].pElem.style.display = 'block';
            //this.stylesList[i].parent.appendChild(this.stylesList[i].pElem);
        }
        if(this.stylesList[i].type === 'fl' || this.stylesList[i].type === 'gf'){
            if(this.stylesList[i].mdf || this.firstFrame){
                this.stylesList[i].pElem.setAttribute('d',this.stylesList[i].d);
                if(this.stylesList[i].mElem){
                    this.stylesList[i].mElem.setAttribute('d',this.stylesList[i].d);
                }
            }
        }
    }
    if(this.firstFrame){
        this.firstFrame = false;
    }

};

IShapeElement.prototype.renderPath = function(pathData,viewData,groupTransform){
    var len, i, j, jLen;
    var pathStringTransformed = '';
    var redraw = groupTransform.matMdf || viewData.sh.mdf || this.firstFrame;
    if(redraw){
        var paths = viewData.sh.paths;
        jLen = paths.length;
        for(j=0;j<jLen;j+=1){
            var pathNodes = paths[j];
            if(pathNodes && pathNodes.v){
                len = pathNodes.v.length;
                for (i = 1; i < len; i += 1) {
                    if (i == 1) {
                        pathStringTransformed += " M" + groupTransform.mat.applyToPointStringified(pathNodes.v[0][0], pathNodes.v[0][1]);
                    }
                    pathStringTransformed += " C" + groupTransform.mat.applyToPointStringified(pathNodes.o[i - 1][0], pathNodes.o[i - 1][1]) + " " + groupTransform.mat.applyToPointStringified(pathNodes.i[i][0], pathNodes.i[i][1]) + " " + groupTransform.mat.applyToPointStringified(pathNodes.v[i][0], pathNodes.v[i][1]);
                }
                if (len == 1) {
                    pathStringTransformed += " M" + groupTransform.mat.applyToPointStringified(pathNodes.v[0][0], pathNodes.v[0][1]);
                }
                if (pathNodes.c) {
                    pathStringTransformed += " C" + groupTransform.mat.applyToPointStringified(pathNodes.o[i - 1][0], pathNodes.o[i - 1][1]) + " " + groupTransform.mat.applyToPointStringified(pathNodes.i[0][0], pathNodes.i[0][1]) + " " + groupTransform.mat.applyToPointStringified(pathNodes.v[0][0], pathNodes.v[0][1]);
                    pathStringTransformed += 'z';
                }
                viewData.lStr = pathStringTransformed;
            }
        }
    } else {
        pathStringTransformed = viewData.lStr;
    }
    len = viewData.elements.length;
    for(i=0;i<len;i+=1){
        if(viewData.elements[i].ty === 'st' || viewData.elements[i].ty === 'gs'){
            if(groupTransform.matMdf || viewData.sh.mdf || this.firstFrame){
                viewData.elements[i].el.setAttribute('d', pathStringTransformed);
                if(viewData.elements[i].ms){
                    viewData.elements[i].ms.setAttribute('d', pathStringTransformed);
                }
            }
        }else{
            viewData.elements[i].st.mdf = redraw ? true : viewData.elements[i].st.mdf;
            viewData.elements[i].st.d += pathStringTransformed;
        }
    }

};

IShapeElement.prototype.renderFill = function(styleData,viewData, groupTransform){
    var styleElem = viewData.style;

    if(viewData.c.mdf || this.firstFrame){
        styleElem.pElem.setAttribute('fill','rgb('+bm_floor(viewData.c.v[0])+','+bm_floor(viewData.c.v[1])+','+bm_floor(viewData.c.v[2])+')');
        ////styleElem.pElem.style.fill = 'rgb('+bm_floor(viewData.c.v[0])+','+bm_floor(viewData.c.v[1])+','+bm_floor(viewData.c.v[2])+')';
    }
    if(viewData.o.mdf || groupTransform.opMdf || this.firstFrame){
        styleElem.pElem.setAttribute('fill-opacity',viewData.o.v*groupTransform.opacity);
        ////styleElem.pElem.style.fillOpacity = viewData.o.v*groupTransform.opacity;
    }
};

IShapeElement.prototype.renderGradient = function(styleData,viewData, groupTransform){
    var styleElem = viewData.style;

    if(viewData.o.mdf || groupTransform.opMdf || this.firstFrame){
        var attr = styleData.ty === 'gf' ? 'fill-opacity':'stroke-opacity';
        styleElem.pElem.setAttribute(attr,viewData.o.v*groupTransform.opacity);
        ////styleElem.pElem.style.fillOpacity = viewData.o.v*groupTransform.opacity;
    }
    var gfill = viewData.gf;
    var opFill = viewData.of;
    if(styleData.t === 1){
        if(viewData.s.mdf || this.firstFrame){
            gfill.setAttribute('x1',viewData.s.v[0]);
            gfill.setAttribute('y1',viewData.s.v[1]);
            if(opFill){
                opFill.setAttribute('x1',viewData.s.v[0]);
                opFill.setAttribute('y1',viewData.s.v[1]);
            }
        }
        if(viewData.e.mdf || this.firstFrame){
            gfill.setAttribute('x2',viewData.e.v[0]);
            gfill.setAttribute('y2',viewData.e.v[1]);
            if(opFill){
                opFill.setAttribute('x2',viewData.e.v[0]);
                opFill.setAttribute('y2',viewData.e.v[1]);
            }
        }
    } else {
        if(viewData.s.mdf || this.firstFrame){
            gfill.setAttribute('cx',viewData.s.v[0]);
            gfill.setAttribute('cy',viewData.s.v[1]);
            if(opFill){
                opFill.setAttribute('cx',viewData.s.v[0]);
                opFill.setAttribute('cy',viewData.s.v[1]);
            }
        }
        var rad;
        if(viewData.s.mdf || viewData.e.mdf || this.firstFrame){
            rad = Math.sqrt(Math.pow(viewData.s.v[0]-viewData.e.v[0],2)+Math.pow(viewData.s.v[1]-viewData.e.v[1],2));
            gfill.setAttribute('r',rad);
            if(opFill){
                opFill.setAttribute('r',rad);
            }
        }
        if(viewData.e.mdf || viewData.h.mdf || viewData.a.mdf || this.firstFrame){
            if(!rad){
                rad = Math.sqrt(Math.pow(viewData.s.v[0]-viewData.e.v[0],2)+Math.pow(viewData.s.v[1]-viewData.e.v[1],2));
            }
            var ang = Math.atan2(viewData.e.v[1]-viewData.s.v[1], viewData.e.v[0]-viewData.s.v[0]);

            var percent = viewData.h.v >= 1 ? 0.99 : viewData.h.v;
            var dist = rad*percent;
            var x = Math.cos(ang + viewData.a.v)*dist + viewData.s.v[0];
            var y = Math.sin(ang + viewData.a.v)*dist + viewData.s.v[1];
            gfill.setAttribute('fx',x);
            gfill.setAttribute('fy',y);
            if(opFill){
                opFill.setAttribute('fx',x);
                opFill.setAttribute('fy',y);
            }
        }
        //gfill.setAttribute('fy','200');
    }
};

IShapeElement.prototype.renderStroke = function(styleData,viewData, groupTransform){
    var styleElem = viewData.style;
    //TODO fix dashes
    var d = viewData.d;
    var dasharray,dashoffset;
    if(d && d.k){
        if(d.mdf || this.firstFrame){
            styleElem.pElem.setAttribute('stroke-dasharray', d.dasharray);
            ////styleElem.pElem.style.strokeDasharray = d.dasharray;
            styleElem.pElem.setAttribute('stroke-dashoffset', d.dashoffset);
            ////styleElem.pElem.style.strokeDashoffset = d.dashoffset;
        }
    }
    if(viewData.c && (viewData.c.mdf || this.firstFrame)){
        styleElem.pElem.setAttribute('stroke','rgb('+bm_floor(viewData.c.v[0])+','+bm_floor(viewData.c.v[1])+','+bm_floor(viewData.c.v[2])+')');
        ////styleElem.pElem.style.stroke = 'rgb('+bm_floor(viewData.c.v[0])+','+bm_floor(viewData.c.v[1])+','+bm_floor(viewData.c.v[2])+')';
    }
    if(viewData.o.mdf || groupTransform.opMdf || this.firstFrame){
        styleElem.pElem.setAttribute('stroke-opacity',viewData.o.v*groupTransform.opacity);
        ////styleElem.pElem.style.strokeOpacity =viewData.o.v*groupTransform.opacity;
    }
    if(viewData.w.mdf || this.firstFrame){
        styleElem.pElem.setAttribute('stroke-width',viewData.w.v);
        if(styleElem.mElem){
            styleElem.mElem.setAttribute('stroke-width',viewData.w.v);
        }
        ////styleElem.pElem.style.strokeWidth = viewData.w.v;
    }
};

IShapeElement.prototype.destroy = function(){
    this._parent.destroy.call();
    this.shapeData = null;
    this.viewData = null;
    this.parentContainer = null;
    this.placeholder = null;
};
