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

IShapeElement.prototype.transformHelper = {opacity:1,mat:new Matrix(),matMdf:false,opMdf:false};

IShapeElement.prototype.createElements = function(){
    //TODO check if I can use symbol so i can set its viewBox
    this._parent.createElements.call(this);
    this.searchShapes(this.shapesData,this.viewData,this.dynamicProperties);
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

IShapeElement.prototype.setGradientOpacity = function(arr, data){
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
        data.msElem = maskElement;
        return maskId;
    }
};

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
            var pathElement = document.createElementNS(svgNS, "path");
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

                data[i].w = PropertyFactory.getProp(this,arr[i].w,0,null,dynamicProperties);
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

            }
            if(arr[i].ty == 'fl' || arr[i].ty == 'st'){
                data[i].c = PropertyFactory.getProp(this,arr[i].c,1,255,dynamicProperties);
                this.layerElement.appendChild(pathElement);
            } else {
                data[i].g = PropertyFactory.getGradientProp(this,arr[i].g,dynamicProperties);
                if(arr[i].t == 2){
                    data[i].h = PropertyFactory.getProp(this,arr[i].h,1,0.01,dynamicProperties);
                    data[i].a = PropertyFactory.getProp(this,arr[i].a,1,degToRads,dynamicProperties);
                }
                data[i].s = PropertyFactory.getProp(this,arr[i].s,1,null,dynamicProperties);
                data[i].e = PropertyFactory.getProp(this,arr[i].e,1,null,dynamicProperties);
                var clippedElement = document.createElementNS(svgNS,'path');
                data[i].cElem = clippedElement;
                var compSize = this.comp.globalData.compSize;
                var clippedG = document.createElementNS(svgNS,'g');
                clippedElement.setAttribute('d','M0,0 h'+compSize.w+' v'+compSize.h+' h-'+compSize.w + 'v-'+compSize.h+'z');
                clippedG.appendChild(clippedElement);
                this.setGradientData(clippedG,arr[i],data[i], styleOb);
                var clipId = 'cp_'+randomString(10);
                clippedG.setAttribute('clip-path','url(#'+clipId+')');
                var maskId = this.setGradientOpacity(arr[i],data[i]);
                if(maskId){
                    clippedElement.setAttribute('mask','url(#'+maskId+')');
                }
                var clippingElement = document.createElementNS(svgNS,'clipPath');
                clippingElement.setAttribute('id',clipId);
                clippingElement.appendChild(pathElement);
                this.globalData.defs.appendChild(clippingElement);
                this.layerElement.appendChild(clippedG);
            }

            if(arr[i].ln){
                pathElement.setAttribute('id',arr[i].ln);
            }
            if(arr[i].cl){
                pathElement.setAttribute('class',arr[i].cl);
            }
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
            for(j=0;j<jLen;j+=1){
                if(!this.stylesList[j].closed){
                    data[i].elements.push({
                        ty:this.stylesList[j].type,
                        st: this.stylesList[j]
                    });
                }
            }
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
    var ty;
    for(i=len;i>=0;i-=1){
        ty = items[i].ty;
        if(ty == 'tr'){
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
        }else if(ty == 'sh' || ty == 'el' || ty == 'rc' || ty == 'sr'){
            this.renderPath(items[i],data[i],groupTransform);
        }else if(ty == 'fl'){
            this.renderFill(items[i],data[i],groupTransform);
        }else if(ty == 'gf'){
            this.renderGradient(items[i],data[i],groupTransform);
        }else if(ty == 'gs'){
            this.renderGradient(items[i],data[i],groupTransform);
            this.renderStroke(items[i],data[i],groupTransform);
        }else if(ty == 'st'){
            this.renderStroke(items[i],data[i],groupTransform);
        }else if(ty == 'gr'){
            this.renderShape(groupTransform,items[i].it,data[i].it);
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
            }
        }
        if (this.firstFrame) {
            this.firstFrame = false;
        }
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
        viewData.elements[i].st.mdf = redraw ? true : viewData.elements[i].st.mdf;
        viewData.elements[i].st.d += pathStringTransformed;
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
    var gfill = viewData.gf;
    var opFill = viewData.of;
    var pt1 = viewData.s.v,pt2 = viewData.e.v;
    if(groupTransform.matMdf || this.finalTransform.matMdf || this.firstFrame){
        viewData.cElem.setAttribute('transform',groupTransform.mat.to2dCSS());
        var compSize = this.comp.globalData.compSize;
        var pts = groupTransform.mat.inversePoints([[0,0],[compSize.w,0],[compSize.w,compSize.h],[0,compSize.h]]);
        pts = this.finalTransform.mat.inversePoints(pts);
        var newPoints = 'M'+ (pts[0][0])+','+ (pts[0][1]);
        newPoints += ' L'+pts[1][0]+','+pts[1][1];
        newPoints += ' L'+pts[2][0]+','+pts[2][1];
        newPoints += ' L'+pts[3][0]+','+pts[3][1];
        newPoints += 'z';
        viewData.cElem.setAttribute('d',newPoints);
        if(viewData.msElem){
            viewData.msElem.setAttribute('d',newPoints);
        }
        //viewData.cElem.setAttribute();
        //console.log(groupTransform.mat.props);
        /*var mtt = new Matrix();
        mtt.translate(100,100);
        var compPt = mtt.inversePoint(0,0,0);*/
    }

    if(viewData.o.mdf || groupTransform.opMdf || this.firstFrame){
        var attr = styleData.ty === 'gf' ? 'fill-opacity':'stroke-opacity';
        viewData.cElem.setAttribute(attr,viewData.o.v*groupTransform.opacity);
        ////styleElem.pElem.style.fillOpacity = viewData.o.v*groupTransform.opacity;
    }
    //clippedElement.setAttribute('transform','matrix(1,0,0,1,-100,0)');
    if(viewData.s.mdf || groupTransform.matMdf || this.firstFrame){
        var attr1 = styleData.t === 1 ? 'x1':'cx';
        var attr2 = attr1 === 'x1' ? 'y1':'cy';
        //pt1 =  groupTransform.mat.applyToPointArray(viewData.s.v[0],viewData.s.v[1],0);
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
        if(viewData.e.mdf || groupTransform.matMdf  || this.firstFrame){
            //pt2 =  groupTransform.mat.applyToPointArray(viewData.e.v[0],viewData.e.v[1],0);
            gfill.setAttribute('x2',pt2[0]);
            gfill.setAttribute('y2',pt2[1]);
            if(opFill){
                opFill.setAttribute('x2',pt2[0]);
                opFill.setAttribute('y2',pt2[1]);
            }
        }
    } else {
        var rad;
        if(viewData.s.mdf || viewData.e.mdf || groupTransform.matMdf || this.firstFrame){
            //pt1 =  pt1 || groupTransform.mat.applyToPointArray(viewData.s.v[0],viewData.s.v[1],0);
            //pt2 =  pt2 || groupTransform.mat.applyToPointArray(viewData.e.v[0],viewData.e.v[1],0);
            rad = Math.sqrt(Math.pow(pt1[0]-pt2[0],2)+Math.pow(pt1[1]-pt2[1],2));
            gfill.setAttribute('r',rad);
            if(opFill){
                opFill.setAttribute('r',rad);
            }
        }
        if(viewData.e.mdf || viewData.h.mdf || viewData.a.mdf || groupTransform.matMdf || this.firstFrame){
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

IShapeElement.prototype.renderStroke = function(styleData,viewData, groupTransform){
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
