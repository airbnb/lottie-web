function IShapeElement(data,parentContainer,globalData,comp, placeholder){
    this.shapes = [];
    this.shapesData = data.shapes;
    this.stylesList = [];
    this.viewData = [];
    this.shapeModifiers = [];
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

IShapeElement.prototype.createElements = function(){
    //TODO check if I can use symbol so i can set its viewBox
    this._parent.createElements.call(this);
    this.searchShapes(this.shapesData,this.viewData,this.layerElement,this.dynamicProperties, 0);
    if(!this.data.hd || this.data.td){
        styleUnselectableDiv(this.layerElement);
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
    var stops = [];
    var stop, j, jLen;
    jLen = arr.g.p*4;
    for(j=0;j<jLen;j+=4){
        stop = document.createElementNS(svgNS,'stop');
        gfill.appendChild(stop);
        stops.push(stop);
    }
    pathElement.setAttribute( arr.ty === 'gf' ? 'fill':'stroke','url(#'+gradientId+')');
    this.globalData.defs.appendChild(gfill);
    data.gf = gfill;
    data.cst = stops;
}

IShapeElement.prototype.setGradientOpacity = function(arr, data, styleOb){
    if((arr.g.k.k[0].s && arr.g.k.k[0].s.length > arr.g.p*4) || arr.g.k.k.length > arr.g.p*4){
        var opFill;
        var stop, j, jLen;
        var mask = document.createElementNS(svgNS,"mask");
        var maskElement = document.createElementNS(svgNS, 'path');
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
        jLen = arr.g.k.k[0].s ? arr.g.k.k[0].s.length : arr.g.k.k.length;
        var stops = [];
        for(j=arr.g.p*4;j<jLen;j+=2){
            stop = document.createElementNS(svgNS,'stop');
            stop.setAttribute('stop-color','rgb(255,255,255)');
            //stop.setAttribute('offset',Math.round(arr.y[j][0]*100)+'%');
            //stop.setAttribute('style','stop-color:rgb(255,255,255);stop-opacity:'+arr.y[j][1]);
            opFill.appendChild(stop);
            stops.push(stop);
        }
        maskElement.setAttribute( arr.ty === 'gf' ? 'fill':'stroke','url(#'+opacityId+')');
        this.globalData.defs.appendChild(opFill);
        this.globalData.defs.appendChild(mask);
        data.of = opFill;
        data.ost = stops;
        styleOb.msElem = maskElement;
        return maskId;
    }
};

IShapeElement.prototype.createStyleElement = function(data, ownStyles, level, dynamicProperties, container){
    var elementData = {};
    styleOb = {
        type: data.ty,
        d: '',
        ld: '',
        lvl: level,
        mdf: false
    };
    var pathElement = document.createElementNS(svgNS, "path");
    elementData.o = PropertyFactory.getProp(this,data.o,0,0.01,dynamicProperties);
    if(data.ty == 'st' || data.ty == 'gs') {
        pathElement.setAttribute('stroke-linecap', this.lcEnum[data.lc] || 'round');
        ////pathElement.style.strokeLinecap = this.lcEnum[data.lc] || 'round';
        pathElement.setAttribute('stroke-linejoin',this.ljEnum[data.lj] || 'round');
        ////pathElement.style.strokeLinejoin = this.ljEnum[data.lj] || 'round';
        pathElement.setAttribute('fill-opacity','0');
        ////pathElement.style.fillOpacity = 0;
        if(data.lj == 1) {
            pathElement.setAttribute('stroke-miterlimit',data.ml);
            ////pathElement.style.strokeMiterlimit = data.ml;
        }

        elementData.w = PropertyFactory.getProp(this,data.w,0,null,dynamicProperties);
        if(data.d){
            var d = PropertyFactory.getDashProp(this,data.d,'svg',dynamicProperties);
            if(!d.k){
                pathElement.setAttribute('stroke-dasharray', d.dasharray);
                ////pathElement.style.strokeDasharray = d.dasharray;
                pathElement.setAttribute('stroke-dashoffset', d.dashoffset);
                ////pathElement.style.strokeDashoffset = d.dashoffset;
            }
            elementData.d = d;
        }

    }
    if(data.ty == 'fl' || data.ty == 'st'){
        elementData.c = PropertyFactory.getProp(this,data.c,1,255,dynamicProperties);
        container.appendChild(pathElement);
    } else {
        elementData.g = PropertyFactory.getGradientProp(this,data.g,dynamicProperties);
        if(data.t == 2){
            elementData.h = PropertyFactory.getProp(this,data.h,1,0.01,dynamicProperties);
            elementData.a = PropertyFactory.getProp(this,data.a,1,degToRads,dynamicProperties);
        }
        elementData.s = PropertyFactory.getProp(this,data.s,1,null,dynamicProperties);
        elementData.e = PropertyFactory.getProp(this,data.e,1,null,dynamicProperties);
        this.setGradientData(pathElement,data,elementData, styleOb);
        var maskId = this.setGradientOpacity(data,elementData, styleOb);
        if(maskId){
            pathElement.setAttribute('mask','url(#'+maskId+')');
        }
        elementData.elem = pathElement;
        container.appendChild(pathElement);
    }
    if(data.r === 2) {
        pathElement.setAttribute('fill-rule', 'evenodd');
    }

    if(data.ln){
        pathElement.setAttribute('id',data.ln);
    }
    if(data.cl){
        pathElement.setAttribute('class',data.cl);
    }
    styleOb.pElem = pathElement;
    this.stylesList.push(styleOb);
    elementData.style = styleOb;
    ownStyles.push(styleOb);
    return elementData;
}

IShapeElement.prototype.createGroupElement = function(data, container) {
    var elementData = {
        it: []
    };
    var g = document.createElementNS(svgNS,'g');
    container.appendChild(g);
    elementData.gr = g;
    return elementData;
}

IShapeElement.prototype.createTransformElement = function(data, dynamicProperties) {
    var elementData = {
        transform : {
            op: PropertyFactory.getProp(this,data.o,0,0.01,dynamicProperties),
            mProps: PropertyFactory.getProp(this,data,2,null,dynamicProperties)
        },
        elements: []
    };
    return elementData;
}

IShapeElement.prototype.createShapeElement = function(data, ownTransformers, level, dynamicProperties) {
    var elementData = {
        elements : [],
        caches:[],
        styles : [],
        transformers: ownTransformers,
        lStr: ''
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
    elementData.lvl = level;
    this.shapes.push(elementData.sh);
    this.addShapeToModifiers(elementData);
    jLen = this.stylesList.length;
    for(j=0;j<jLen;j+=1){
        if(!this.stylesList[j].closed){
            elementData.elements.push({
                ty:this.stylesList[j].type,
                st: this.stylesList[j]
            });
        }
    }
    return elementData;
}

IShapeElement.prototype.searchShapes = function(arr,data,container,dynamicProperties, level, transformers){
    transformers = transformers || [];
    var ownTransformers = [].concat(transformers);
    var i, len = arr.length - 1;
    var j, jLen;
    var ownStyles = [], ownModifiers = [], styleOb, currentTransform;
    for(i=len;i>=0;i-=1){
        if(arr[i].ty == 'fl' || arr[i].ty == 'st' || arr[i].ty == 'gf' || arr[i].ty == 'gs'){
            data[i] = this.createStyleElement(arr[i], ownStyles, level, dynamicProperties, container);
        }else if(arr[i].ty == 'gr'){
            data[i] = this.createGroupElement(arr[i], container);
            this.searchShapes(arr[i].it,data[i].it,data[i].gr,dynamicProperties, level + 1, ownTransformers);
        }else if(arr[i].ty == 'tr'){
            data[i] = this.createTransformElement(arr[i], dynamicProperties);
            currentTransform = data[i].transform;
            ownTransformers.push(currentTransform);
        }else if(arr[i].ty == 'sh' || arr[i].ty == 'rc' || arr[i].ty == 'el' || arr[i].ty == 'sr'){
            data[i] = this.createShapeElement(arr[i], ownTransformers, level, dynamicProperties)
        }else if(arr[i].ty == 'tm' || arr[i].ty == 'rd' || arr[i].ty == 'ms' || arr[i].ty == 'rp'){
            var modifier = ShapeModifiers.getModifier(arr[i].ty);
            modifier.init(this,arr[i],dynamicProperties);
            this.shapeModifiers.push(modifier);
            ownModifiers.push(modifier);
            data[i] = modifier;
        }else if(arr[i].ty == 'rp'){
            var modifier = ShapeModifiers.getModifier(arr[i].ty);
            modifier.init(this,arr[i],dynamicProperties, container);
            this.shapeModifiers.push(modifier);
            ownModifiers.push(modifier);
            data[i] = modifier;
        }
    }
    len = ownStyles.length;
    for(i=0;i<len;i+=1){
        ownStyles[i].closed = true;
    }
    len = ownModifiers.length;
    for(i=0;i<len;i+=1){
        ownModifiers[i].closed = true;
    }
};

IShapeElement.prototype.addShapeToModifiers = function(data) {
    var i, len = this.shapeModifiers.length;
    for(i=0;i<len;i+=1){
        this.shapeModifiers[i].addShape(data);
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
        this.shapeModifiers[i].processShapes(this.firstFrame);
    }
};

IShapeElement.prototype.renderFrame = function(parentMatrix){
    var renderParent = this._parent.renderFrame.call(this,parentMatrix);
    if(renderParent===false){
        this.hide();
        return;
    }
    this.globalToLocal([0,0,0]);
    if(this.hidden){
        this.layerElement.style.display = 'block';
        this.hidden = false;
    }
    this.renderModifiers();
    this.renderShape(null,null,true, null);
};

IShapeElement.prototype.hide = function(){
    if(!this.hidden){
        this.layerElement.style.display = 'none';
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

IShapeElement.prototype.renderShape = function(items,data,isMain, container){
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
    var ty;
    for(i=len;i>=0;i-=1){
        ty = items[i].ty;
        if(ty == 'tr'){
            if(this.firstFrame || data[i].transform.op.mdf && container){
                container.setAttribute('opacity',data[i].transform.op.v);
            }
            if(this.firstFrame || data[i].transform.mProps.mdf && container){
                container.setAttribute('transform',data[i].transform.mProps.v.to2dCSS());
            }
        }else if(ty == 'sh' || ty == 'el' || ty == 'rc' || ty == 'sr'){
            this.renderPath(items[i],data[i]);
        }else if(ty == 'fl'){
            this.renderFill(items[i],data[i]);
        }else if(ty == 'gf'){
            this.renderGradient(items[i],data[i]);
        }else if(ty == 'gs'){
            this.renderGradient(items[i],data[i]);
            this.renderStroke(items[i],data[i]);
        }else if(ty == 'st'){
            this.renderStroke(items[i],data[i]);
        }else if(ty == 'gr'){
            this.renderShape(items[i].it,data[i].it,false, data[i].gr);
        }else if(ty == 'tm'){
            //
        }
    }
    if(isMain) {
        len = this.stylesList.length;
        for (i = 0; i < len; i += 1) {
            if (this.stylesList[i].ld === '0') {
                this.stylesList[i].ld = '1';
                this.stylesList[i].pElem.style.display = 'block';
                //this.stylesList[i].parent.appendChild(this.stylesList[i].pElem);
            }
            if (this.stylesList[i].mdf || this.firstFrame) {
                this.stylesList[i].pElem.setAttribute('d', this.stylesList[i].d);
                if(this.stylesList[i].msElem){
                    this.stylesList[i].msElem.setAttribute('d', this.stylesList[i].d);
                }
            }
        }
        if (this.firstFrame) {
            this.firstFrame = false;
        }
    }

};

IShapeElement.prototype.renderPath = function(pathData,viewData){
    var len, i, j, jLen,pathStringTransformed,redraw,pathNodes,l, lLen = viewData.elements.length;
    var lvl = viewData.lvl;
    for(l=0;l<lLen;l+=1){
        redraw = viewData.sh.mdf || this.firstFrame;
        pathStringTransformed = 'M0 0';
        var paths = viewData.sh.paths;
        jLen = paths._length;
        if(viewData.elements[l].st.lvl < lvl){
            var mat = this.mHelper.reset(), props;
            var iterations = lvl - viewData.elements[l].st.lvl;
            var k = viewData.transformers.length-1;
            while(iterations > 0) {
                redraw = viewData.transformers[k].mProps.mdf || redraw;
                props = viewData.transformers[k].mProps.v.props;
                mat.transform(props[0],props[1],props[2],props[3],props[4],props[5],props[6],props[7],props[8],props[9],props[10],props[11],props[12],props[13],props[14],props[15]);
                iterations --;
                k --;
            }
            if(redraw){
                for(j=0;j<jLen;j+=1){
                    pathNodes = paths.shapes[j];
                    if(pathNodes && pathNodes._length){
                        len = pathNodes._length;
                        for (i = 1; i < len; i += 1) {
                            if (i == 1) {
                                pathStringTransformed += " M" + mat.applyToPointStringified(pathNodes.v[0][0], pathNodes.v[0][1]);
                            }
                            pathStringTransformed += " C" + mat.applyToPointStringified(pathNodes.o[i - 1][0], pathNodes.o[i - 1][1]) + " " + mat.applyToPointStringified(pathNodes.i[i][0], pathNodes.i[i][1]) + " " + mat.applyToPointStringified(pathNodes.v[i][0], pathNodes.v[i][1]);
                        }
                        if (len == 1) {
                            pathStringTransformed += " M" + mat.applyToPointStringified(pathNodes.v[0][0], pathNodes.v[0][1]);
                        }
                        if (pathNodes.c) {
                            pathStringTransformed += " C" + mat.applyToPointStringified(pathNodes.o[i - 1][0], pathNodes.o[i - 1][1]) + " " + mat.applyToPointStringified(pathNodes.i[0][0], pathNodes.i[0][1]) + " " + mat.applyToPointStringified(pathNodes.v[0][0], pathNodes.v[0][1]);
                            pathStringTransformed += 'z';
                        }
                    }
                }
                viewData.caches[l] = pathStringTransformed;
            } else {
                pathStringTransformed = viewData.caches[l];
            }
        } else {
            if(redraw){
                for(j=0;j<jLen;j+=1){
                    pathNodes = paths.shapes[j];
                    if(pathNodes && pathNodes._length){
                        len = pathNodes._length;
                        for (i = 1; i < len; i += 1) {
                            if (i == 1) {
                                //pathStringTransformed += " M" + groupTransform.mat.applyToPointStringified(pathNodes.v[0][0], pathNodes.v[0][1]);
                                pathStringTransformed += " M" + pathNodes.v[0].join(',');
                            }
                            //pathStringTransformed += " C" + groupTransform.mat.applyToPointStringified(pathNodes.o[i - 1][0], pathNodes.o[i - 1][1]) + " " + groupTransform.mat.applyToPointStringified(pathNodes.i[i][0], pathNodes.i[i][1]) + " " + groupTransform.mat.applyToPointStringified(pathNodes.v[i][0], pathNodes.v[i][1]);
                            pathStringTransformed += " C" + pathNodes.o[i - 1].join(',') + " " + pathNodes.i[i].join(',') + " " + pathNodes.v[i].join(',');
                        }
                        if (len == 1) {
                            //pathStringTransformed += " M" + groupTransform.mat.applyToPointStringified(pathNodes.v[0][0], pathNodes.v[0][1]);
                            pathStringTransformed += " M" + pathNodes.v[0].join(',');
                        }
                        if (pathNodes.c && len) {
                            //pathStringTransformed += " C" + groupTransform.mat.applyToPointStringified(pathNodes.o[i - 1][0], pathNodes.o[i - 1][1]) + " " + groupTransform.mat.applyToPointStringified(pathNodes.i[0][0], pathNodes.i[0][1]) + " " + groupTransform.mat.applyToPointStringified(pathNodes.v[0][0], pathNodes.v[0][1]);
                            pathStringTransformed += " C" + pathNodes.o[i - 1].join(',') + " " + pathNodes.i[0].join(',') + " " + pathNodes.v[0].join(',');
                            pathStringTransformed += 'z';
                        }
                    }
                }
                viewData.caches[l] = pathStringTransformed;
            } else {
                pathStringTransformed = viewData.caches[l];
            }
        }
        viewData.elements[l].st.d += pathStringTransformed;
        viewData.elements[l].st.mdf = redraw || viewData.elements[l].st.mdf;
    }

};

IShapeElement.prototype.renderFill = function(styleData,viewData){
    var styleElem = viewData.style;

    if(viewData.c.mdf || this.firstFrame){
        styleElem.pElem.setAttribute('fill','rgb('+bm_floor(viewData.c.v[0])+','+bm_floor(viewData.c.v[1])+','+bm_floor(viewData.c.v[2])+')');
        ////styleElem.pElem.style.fill = 'rgb('+bm_floor(viewData.c.v[0])+','+bm_floor(viewData.c.v[1])+','+bm_floor(viewData.c.v[2])+')';
    }
    if(viewData.o.mdf || this.firstFrame){
        styleElem.pElem.setAttribute('fill-opacity',viewData.o.v);
    }
};

IShapeElement.prototype.renderGradient = function(styleData,viewData){
    var gfill = viewData.gf;
    var opFill = viewData.of;
    var pt1 = viewData.s.v,pt2 = viewData.e.v;

    if(viewData.o.mdf || this.firstFrame){
        var attr = styleData.ty === 'gf' ? 'fill-opacity':'stroke-opacity';
        viewData.elem.setAttribute(attr,viewData.o.v);
    }
    //clippedElement.setAttribute('transform','matrix(1,0,0,1,-100,0)');
    if(viewData.s.mdf || this.firstFrame){
        var attr1 = styleData.t === 1 ? 'x1':'cx';
        var attr2 = attr1 === 'x1' ? 'y1':'cy';
        gfill.setAttribute(attr1,pt1[0]);
        gfill.setAttribute(attr2,pt1[1]);
        if(opFill){
            opFill.setAttribute(attr1,pt1[0]);
            opFill.setAttribute(attr2,pt1[1]);
        }
    }
    var stops, i, len, stop;
    if(viewData.g.cmdf || this.firstFrame){
        stops = viewData.cst;
        var cValues = viewData.g.c;
        len = stops.length;
        for(i=0;i<len;i+=1){
            stop = stops[i];
            stop.setAttribute('offset',cValues[i*4]+'%');
            stop.setAttribute('stop-color','rgb('+cValues[i*4+1]+','+cValues[i*4+2]+','+cValues[i*4+3]+')');
        }
    }
    if(opFill && (viewData.g.omdf || this.firstFrame)){
        stops = viewData.ost;
        var oValues = viewData.g.o;
        len = stops.length;
        for(i=0;i<len;i+=1){
            stop = stops[i];
            stop.setAttribute('offset',oValues[i*2]+'%');
            stop.setAttribute('stop-opacity',oValues[i*2+1]);
        }
    }
    if(styleData.t === 1){
        if(viewData.e.mdf  || this.firstFrame){
            gfill.setAttribute('x2',pt2[0]);
            gfill.setAttribute('y2',pt2[1]);
            if(opFill){
                opFill.setAttribute('x2',pt2[0]);
                opFill.setAttribute('y2',pt2[1]);
            }
        }
    } else {
        var rad;
        if(viewData.s.mdf || viewData.e.mdf || this.firstFrame){
            rad = Math.sqrt(Math.pow(pt1[0]-pt2[0],2)+Math.pow(pt1[1]-pt2[1],2));
            gfill.setAttribute('r',rad);
            if(opFill){
                opFill.setAttribute('r',rad);
            }
        }
        if(viewData.e.mdf || viewData.h.mdf || viewData.a.mdf || this.firstFrame){
            if(!rad){
                rad = Math.sqrt(Math.pow(pt1[0]-pt2[0],2)+Math.pow(pt1[1]-pt2[1],2));
            }
            var ang = Math.atan2(pt2[1]-pt1[1], pt2[0]-pt1[0]);

            var percent = viewData.h.v >= 1 ? 0.99 : viewData.h.v <= -1 ? -0.99:viewData.h.v;
            var dist = rad*percent;
            var x = Math.cos(ang + viewData.a.v)*dist + pt1[0];
            var y = Math.sin(ang + viewData.a.v)*dist + pt1[1];
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

IShapeElement.prototype.renderStroke = function(styleData,viewData){
    var styleElem = viewData.style;
    //TODO fix dashes
    var d = viewData.d;
    var dasharray,dashoffset;
    if(d && d.k && (d.mdf || this.firstFrame)){
        styleElem.pElem.setAttribute('stroke-dasharray', d.dasharray);
        ////styleElem.pElem.style.strokeDasharray = d.dasharray;
        styleElem.pElem.setAttribute('stroke-dashoffset', d.dashoffset);
        ////styleElem.pElem.style.strokeDashoffset = d.dashoffset;
    }
    if(viewData.c && (viewData.c.mdf || this.firstFrame)){
        styleElem.pElem.setAttribute('stroke','rgb('+bm_floor(viewData.c.v[0])+','+bm_floor(viewData.c.v[1])+','+bm_floor(viewData.c.v[2])+')');
        ////styleElem.pElem.style.stroke = 'rgb('+bm_floor(viewData.c.v[0])+','+bm_floor(viewData.c.v[1])+','+bm_floor(viewData.c.v[2])+')';
    }
    if(viewData.o.mdf || this.firstFrame){
        styleElem.pElem.setAttribute('stroke-opacity',viewData.o.v);
    }
    if(viewData.w.mdf || this.firstFrame){
        styleElem.pElem.setAttribute('stroke-width',viewData.w.v);
        if(styleElem.msElem){
            styleElem.msElem.setAttribute('stroke-width',viewData.w.v);
        }
        ////styleElem.pElem.style.strokeWidth = viewData.w.v;
    }
};

IShapeElement.prototype.destroy = function(){
    this._parent.destroy.call(this._parent);
    this.shapeData = null;
    this.viewData = null;
    this.parentContainer = null;
    this.placeholder = null;
};
