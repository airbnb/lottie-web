function IShapeElement(data,parentContainer,globalData,comp, placeholder){
    this.shapes = [];
    this.shapesData = data.shapes;
    this.stylesList = [];
    this.itemsData = [];
    this.prevViewData = [];
    this.shapeModifiers = [];
    this.processedElements = [];
    this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
}
createElement(SVGBaseElement, IShapeElement);

IShapeElement.prototype.identityMatrix = new Matrix();

IShapeElement.prototype.lcEnum = {
    '1': 'butt',
    '2': 'round',
    '3': 'square'
}

IShapeElement.prototype.ljEnum = {
    '1': 'miter',
    '2': 'round',
    '3': 'butt'
}

IShapeElement.prototype.searchProcessedElement = function(elem){
    var i = this.processedElements.length;
    while(i){
        i -= 1;
        if(this.processedElements[i].elem === elem){
            return this.processedElements[i].pos;
        }
    }
    return 0;
};

IShapeElement.prototype.addProcessedElement = function(elem, pos){
    var i = this.processedElements.length;
    while(i){
        i -= 1;
        if(this.processedElements[i].elem === elem){
            this.processedElements[i].pos = pos;
            break;
        }
    }
    if(i === 0){
        this.processedElements.push({
            elem: elem,
            pos: pos
        })
    }
};

IShapeElement.prototype.buildExpressionInterface = function(){};

IShapeElement.prototype.createElements = function(){
    //TODO check if I can use symbol so i can set its viewBox
    this._parent.createElements.call(this);
    this.searchShapes(this.shapesData,this.itemsData,this.prevViewData,this.layerElement,this.dynamicProperties, 0, [], true);
    if(!this.data.hd || this.data.td){
        styleUnselectableDiv(this.layerElement);
    }
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

IShapeElement.prototype.createStyleElement = function(data, level, dynamicProperties){
    var elementData = {
    };
    var styleOb = {
        data: data,
        type: data.ty,
        d: '',
        ld: '',
        lvl: level,
        mdf: false,
        closed: false
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
    } else {
        elementData.g = PropertyFactory.getGradientProp(this,data.g,dynamicProperties);
        if(data.t == 2){
            elementData.h = PropertyFactory.getProp(this,data.h,0,0.01,dynamicProperties);
            elementData.a = PropertyFactory.getProp(this,data.a,0,degToRads,dynamicProperties);
        }
        elementData.s = PropertyFactory.getProp(this,data.s,1,null,dynamicProperties);
        elementData.e = PropertyFactory.getProp(this,data.e,1,null,dynamicProperties);
        this.setGradientData(pathElement,data,elementData, styleOb);
        var maskId = this.setGradientOpacity(data,elementData, styleOb);
        if(maskId){
            pathElement.setAttribute('mask','url(#'+maskId+')');
        }
    }
    elementData.elem = pathElement;
    //container.appendChild(pathElement);
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
    return elementData;
}

IShapeElement.prototype.createGroupElement = function(data) {
    var elementData = {
        it: [],
        prevViewData: []
    };
    var g = document.createElementNS(svgNS,'g');
    elementData.gr = g;
    if(data.ln){
        elementData.gr.setAttribute('id',data.ln);
    }
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
    return elementData;
}

var cont = 0;

IShapeElement.prototype.setElementStyles = function(){
    var j, jLen = this.stylesList.length;
    var arr = [];
    for(j=0;j<jLen;j+=1){
        if(!this.stylesList[j].closed){
            arr.push(this.stylesList[j]);
        }
    }
    return arr;
}

IShapeElement.prototype.reloadShapes = function(){
    this.firstFrame = true;
    var i, len = this.itemsData.length;
    for(i=0;i<len;i+=1){
        this.prevViewData[i] = this.itemsData[i];
    }
    this.searchShapes(this.shapesData,this.itemsData,this.prevViewData,this.layerElement,this.dynamicProperties, 0, [], true);
    var i, len = this.dynamicProperties.length;
    for(i=0;i<len;i+=1){
        this.dynamicProperties[i].getValue();
    }
    this.renderModifiers();
}

IShapeElement.prototype.searchShapes = function(arr,itemsData,prevViewData,container,dynamicProperties, level, transformers, render){
    var ownTransformers = [].concat(transformers);
    var i, len = arr.length - 1;
    var j, jLen;
    var ownStyles = [], ownModifiers = [], styleOb, currentTransform, modifier, processedPos;
    for(i=len;i>=0;i-=1){
        processedPos = this.searchProcessedElement(arr[i]);
        if(!processedPos){
            arr[i]._render = render;
        } else {
            itemsData[i] = prevViewData[processedPos - 1];
        }
        if(arr[i].ty == 'fl' || arr[i].ty == 'st' || arr[i].ty == 'gf' || arr[i].ty == 'gs'){
            if(!processedPos){
                itemsData[i] = this.createStyleElement(arr[i], level, dynamicProperties);
            } else {
                itemsData[i].style.closed = false;
            }
            if(arr[i]._render){
                container.appendChild(itemsData[i].elem);
            }
            ownStyles.push(itemsData[i].style);
        }else if(arr[i].ty == 'gr'){
            if(!processedPos){
                itemsData[i] = this.createGroupElement(arr[i]);
            } else {
                jLen = itemsData[i].it.length;
                for(j=0;j<jLen;j+=1){
                    itemsData[i].prevViewData[j] = itemsData[i].it[j];
                }
            }
            this.searchShapes(arr[i].it,itemsData[i].it,itemsData[i].prevViewData,itemsData[i].gr,dynamicProperties, level + 1, ownTransformers, render);
            if(arr[i]._render){
                container.appendChild(itemsData[i].gr);
            }
        }else if(arr[i].ty == 'tr'){
            if(!processedPos){
                itemsData[i] = this.createTransformElement(arr[i], dynamicProperties);
            }
            currentTransform = itemsData[i].transform;
            ownTransformers.push(currentTransform);
        }else if(arr[i].ty == 'sh' || arr[i].ty == 'rc' || arr[i].ty == 'el' || arr[i].ty == 'sr'){
            if(!processedPos){
                itemsData[i] = this.createShapeElement(arr[i], ownTransformers, level, dynamicProperties);
            }
            itemsData[i].elements = this.setElementStyles();

        }else if(arr[i].ty == 'tm' || arr[i].ty == 'rd' || arr[i].ty == 'ms'){
            if(!processedPos){
                modifier = ShapeModifiers.getModifier(arr[i].ty);
                modifier.init(this,arr[i],dynamicProperties);
                itemsData[i] = modifier;
                this.shapeModifiers.push(modifier);
            } else {
                modifier = itemsData[i];
                modifier.closed = false;
            }
            ownModifiers.push(modifier);
        }else if(arr[i].ty == 'rp'){
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
    //this.reloadShapes();
    var renderParent = this._parent.renderFrame.call(this,parentMatrix);
    if(renderParent===false){
        this.hide();
        return;
    }
    if(this.hidden){
        this.layerElement.style.display = 'block';
        this.hidden = false;
    }
    this.renderModifiers();
    var i, len = this.stylesList.length;
    for(i=0;i<len;i+=1){
        this.stylesList[i].d = '';
        this.stylesList[i].mdf = false;
    }
    this.renderShape(this.shapesData,this.itemsData, null);

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

IShapeElement.prototype.renderShape = function(items,data, container){
    var i, len = items.length - 1;
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
            this.renderShape(items[i].it,data[i].it, data[i].gr);
        }else if(ty == 'tm'){
            //
        }
    }

};

IShapeElement.prototype.buildShapeString = function(pathNodes, length, closed, mat) {
    var i, shapeString = '';
    for(i = 1; i < length; i += 1) {
        if (i === 1) {
            shapeString += " M" + mat.applyToPointStringified(pathNodes.v[0][0], pathNodes.v[0][1]);
        }
        shapeString += " C" + mat.applyToPointStringified(pathNodes.o[i - 1][0], pathNodes.o[i - 1][1]) + " " + mat.applyToPointStringified(pathNodes.i[i][0], pathNodes.i[i][1]) + " " + mat.applyToPointStringified(pathNodes.v[i][0], pathNodes.v[i][1]);
    }
    if (length === 1) {
        shapeString += " M" + mat.applyToPointStringified(pathNodes.v[0][0], pathNodes.v[0][1]);
    }
    if (closed && length) {
        shapeString += " C" + mat.applyToPointStringified(pathNodes.o[i - 1][0], pathNodes.o[i - 1][1]) + " " + mat.applyToPointStringified(pathNodes.i[0][0], pathNodes.i[0][1]) + " " + mat.applyToPointStringified(pathNodes.v[0][0], pathNodes.v[0][1]);
        shapeString += 'z';
    }
    return shapeString;
};

IShapeElement.prototype.renderPath = function(pathData,itemData){
    var len, i, j, jLen,pathStringTransformed,redraw,pathNodes,l, lLen = itemData.elements.length;
    var lvl = itemData.lvl;
    if(!pathData._render){
        return;
    }
    for(l=0;l<lLen;l+=1){
        if(itemData.elements[l].data._render){
            redraw = itemData.sh.mdf || this.firstFrame;
            pathStringTransformed = 'M0 0';
            var paths = itemData.sh.paths;
            jLen = paths._length;
            if(itemData.elements[l].lvl < lvl){
                var mat = this.mHelper.reset(), props;
                var iterations = lvl - itemData.elements[l].lvl;
                var k = itemData.transformers.length-1;
                while(iterations > 0) {
                    redraw = itemData.transformers[k].mProps.mdf || redraw;
                    props = itemData.transformers[k].mProps.v.props;
                    mat.transform(props[0],props[1],props[2],props[3],props[4],props[5],props[6],props[7],props[8],props[9],props[10],props[11],props[12],props[13],props[14],props[15]);
                    iterations --;
                    k --;
                }
                if(redraw){
                    for(j=0;j<jLen;j+=1){
                        pathNodes = paths.shapes[j];
                        if(pathNodes && pathNodes._length){
                            pathStringTransformed += this.buildShapeString(pathNodes, pathNodes._length, pathNodes.c, mat);
                        }
                    }
                    itemData.caches[l] = pathStringTransformed;
                } else {
                    pathStringTransformed = itemData.caches[l];
                }
            } else {
                if(redraw){
                    for(j=0;j<jLen;j+=1){
                        pathNodes = paths.shapes[j];
                        if(pathNodes && pathNodes._length){
                            pathStringTransformed += this.buildShapeString(pathNodes, pathNodes._length, pathNodes.c, this.identityMatrix);
                        }
                    }
                    itemData.caches[l] = pathStringTransformed;
                } else {
                    pathStringTransformed = itemData.caches[l];
                }
            }
            itemData.elements[l].d += pathStringTransformed;
            itemData.elements[l].mdf = redraw || itemData.elements[l].mdf;
        } else {
            itemData.elements[l].mdf = true;
        }
    }
};

IShapeElement.prototype.renderFill = function(styleData,itemData){
    var styleElem = itemData.style;

    if(itemData.c.mdf || this.firstFrame){
        styleElem.pElem.setAttribute('fill','rgb('+bm_floor(itemData.c.v[0])+','+bm_floor(itemData.c.v[1])+','+bm_floor(itemData.c.v[2])+')');
        ////styleElem.pElem.style.fill = 'rgb('+bm_floor(itemData.c.v[0])+','+bm_floor(itemData.c.v[1])+','+bm_floor(itemData.c.v[2])+')';
    }
    if(itemData.o.mdf || this.firstFrame){
        styleElem.pElem.setAttribute('fill-opacity',itemData.o.v);
    }
};

IShapeElement.prototype.renderGradient = function(styleData,itemData){
    var gfill = itemData.gf;
    var opFill = itemData.of;
    var pt1 = itemData.s.v,pt2 = itemData.e.v;

    if(itemData.o.mdf || this.firstFrame){
        var attr = styleData.ty === 'gf' ? 'fill-opacity':'stroke-opacity';
        itemData.elem.setAttribute(attr,itemData.o.v);
    }
    //clippedElement.setAttribute('transform','matrix(1,0,0,1,-100,0)');
    if(itemData.s.mdf || this.firstFrame){
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
    if(itemData.g.cmdf || this.firstFrame){
        stops = itemData.cst;
        var cValues = itemData.g.c;
        len = stops.length;
        for(i=0;i<len;i+=1){
            stop = stops[i];
            stop.setAttribute('offset',cValues[i*4]+'%');
            stop.setAttribute('stop-color','rgb('+cValues[i*4+1]+','+cValues[i*4+2]+','+cValues[i*4+3]+')');
        }
    }
    if(opFill && (itemData.g.omdf || this.firstFrame)){
        stops = itemData.ost;
        var oValues = itemData.g.o;
        len = stops.length;
        for(i=0;i<len;i+=1){
            stop = stops[i];
            stop.setAttribute('offset',oValues[i*2]+'%');
            stop.setAttribute('stop-opacity',oValues[i*2+1]);
        }
    }
    if(styleData.t === 1){
        if(itemData.e.mdf  || this.firstFrame){
            gfill.setAttribute('x2',pt2[0]);
            gfill.setAttribute('y2',pt2[1]);
            if(opFill){
                opFill.setAttribute('x2',pt2[0]);
                opFill.setAttribute('y2',pt2[1]);
            }
        }
    } else {
        var rad;
        if(itemData.s.mdf || itemData.e.mdf || this.firstFrame){
            rad = Math.sqrt(Math.pow(pt1[0]-pt2[0],2)+Math.pow(pt1[1]-pt2[1],2));
            gfill.setAttribute('r',rad);
            if(opFill){
                opFill.setAttribute('r',rad);
            }
        }
        if(itemData.e.mdf || itemData.h.mdf || itemData.a.mdf || this.firstFrame){
            if(!rad){
                rad = Math.sqrt(Math.pow(pt1[0]-pt2[0],2)+Math.pow(pt1[1]-pt2[1],2));
            }
            var ang = Math.atan2(pt2[1]-pt1[1], pt2[0]-pt1[0]);

            var percent = itemData.h.v >= 1 ? 0.99 : itemData.h.v <= -1 ? -0.99:itemData.h.v;
            var dist = rad*percent;
            var x = Math.cos(ang + itemData.a.v)*dist + pt1[0];
            var y = Math.sin(ang + itemData.a.v)*dist + pt1[1];
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

IShapeElement.prototype.renderStroke = function(styleData,itemData){
    var styleElem = itemData.style;
    //TODO fix dashes
    var d = itemData.d;
    var dasharray,dashoffset;
    if(d && d.k && (d.mdf || this.firstFrame)){
        styleElem.pElem.setAttribute('stroke-dasharray', d.dasharray);
        ////styleElem.pElem.style.strokeDasharray = d.dasharray;
        styleElem.pElem.setAttribute('stroke-dashoffset', d.dashoffset);
        ////styleElem.pElem.style.strokeDashoffset = d.dashoffset;
    }
    if(itemData.c && (itemData.c.mdf || this.firstFrame)){
        styleElem.pElem.setAttribute('stroke','rgb('+bm_floor(itemData.c.v[0])+','+bm_floor(itemData.c.v[1])+','+bm_floor(itemData.c.v[2])+')');
        ////styleElem.pElem.style.stroke = 'rgb('+bm_floor(itemData.c.v[0])+','+bm_floor(itemData.c.v[1])+','+bm_floor(itemData.c.v[2])+')';
    }
    if(itemData.o.mdf || this.firstFrame){
        styleElem.pElem.setAttribute('stroke-opacity',itemData.o.v);
    }
    if(itemData.w.mdf || this.firstFrame){
        styleElem.pElem.setAttribute('stroke-width',itemData.w.v);
        if(styleElem.msElem){
            styleElem.msElem.setAttribute('stroke-width',itemData.w.v);
        }
        ////styleElem.pElem.style.strokeWidth = itemData.w.v;
    }
};

IShapeElement.prototype.destroy = function(){
    this._parent.destroy.call(this._parent);
    this.shapeData = null;
    this.itemsData = null;
    this.parentContainer = null;
    this.placeholder = null;
};
