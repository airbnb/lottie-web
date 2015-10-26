function ShapeItemElement(data,parentElement,parentContainer,placeholder,dynamicProperties,globalData){
    this.lcEnum = {
        '1': 'butt',
        '2': 'round',
        '3': 'butt'
    };
    this.ljEnum = {
        '1': 'miter',
        '2': 'round',
        '3': 'bevel'
    };
    this.stylesList = [];
    this.viewData = [];
    this.shape = parentElement;
    this.parentContainer = parentContainer;
    this.placeholder = placeholder;
    this.elemData = data;
    this.data = data.shapes;
    this.globalData = globalData;
    this.firstFrame = true;
    this.searchShapes(this.data,this.viewData,dynamicProperties);
    styleUnselectableDiv(this.shape);
    if(!window.namer){
        window.namer = 1;
    }else{
        window.namer +=1;
    }
    this.testId = 'id_' + window.namer;
}

ShapeItemElement.prototype.appendNodeToParent = BaseElement.prototype.appendNodeToParent;

ShapeItemElement.prototype.searchShapes = function(arr,data,dynamicProperties){
    var i, len = arr.length - 1;
    var j, jLen;
    //c: PropertyFactory.getProp()
    var ownArrays = [];
    for(i=len;i>=0;i-=1){
        if(arr[i].ty == 'fl' || arr[i].ty == 'st'){
            data[i] = {};
            var pathElement;
            data[i].c = PropertyFactory.getProp(this.elemData,arr[i].c,1,null,dynamicProperties);
            data[i].o = PropertyFactory.getProp(this.elemData,arr[i].o,0,0.01,dynamicProperties);
            if(arr[i].ty == 'st') {
                pathElement = document.createElementNS(svgNS, "g");
                pathElement.setAttribute('stroke-linecap', this.lcEnum[arr[i].lc] || 'round');
                pathElement.setAttribute('stroke-linejoin',this.ljEnum[arr[i].lj] || 'round');
                pathElement.setAttribute('fill-opacity','0');
                if(arr[i].lj == 1) {
                    pathElement.setAttribute('stroke-miterlimit',arr[i].ml);
                }
                if(!data[i].c.k) {
                    pathElement.setAttribute('stroke','rgb('+data[i].c.v[0]+','+data[i].c.v[1]+','+data[i].c.v[2]+')');
                }
                if(!data[i].o.k) {
                    pathElement.setAttribute('stroke-opacity',data[i].o.v);
                }
                data[i].w = PropertyFactory.getProp(this.elemData,arr[i].w,0,null,dynamicProperties);
                if(!data[i].w.k) {
                    pathElement.setAttribute('stroke-width',data[i].w.v);
                }
            }else{
                pathElement = document.createElementNS(svgNS, "path");
                if(!data[i].c.k) {
                    pathElement.setAttribute('fill','rgb('+data[i].c.v[0]+','+data[i].c.v[1]+','+data[i].c.v[2]+')');
                }
                if(!data[i].o.k) {
                    pathElement.setAttribute('fill-opacity',data[i].o.v);
                }
            }
            if(this.shape === this.parentContainer){
                this.appendNodeToParent(pathElement);
            }else{
                this.shape.appendChild(pathElement);
            }
            this.stylesList.push({
                pathElement: pathElement,
                type: arr[i].ty,
                d: '',
                ld: '',
                mdf: false
            });
            data[i].style = this.stylesList[this.stylesList.length - 1];
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
                    op: PropertyFactory.getProp(this.elemData,arr[i].o,0,0.01,dynamicProperties),
                    mProps: PropertyFactory.getProp(this.elemData,arr[i],2,null,dynamicProperties)
                },
                elements: []
            };
        }else if(arr[i].ty == 'sh' || arr[i].ty == 'rc' || arr[i].ty == 'el'){
            data[i] = {
                elements : [],
                styles : [],
                lStr: ''
            };
            var ty = 4;
            if(arr[i].ty == 'rc'){
                ty = 5;
            }
            data[i].sh = PropertyFactory.getProp(this.elemData,arr[i],ty,null,dynamicProperties);
            jLen = this.stylesList.length;
            var element, hasStrokes = false, hasFills = false;
            for(j=0;j<jLen;j+=1){
                if(!this.stylesList[j].closed){
                    if(this.stylesList[j].type === 'st'){
                        hasStrokes = true;
                        element = document.createElementNS(svgNS, "path");
                        this.stylesList[j].pathElement.appendChild(element);
                        data[i].elements.push({
                            ty:this.stylesList[j].type,
                            el:element
                        });
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
        }
    }
    len = ownArrays.length;
    for(i=0;i<len;i+=1){
        ownArrays[i].closed = true;
    }
};

ShapeItemElement.prototype.getElement = function(){
    return this.shape;
};

ShapeItemElement.prototype.hideShape = function(){
    var i, len = this.stylesList.length;
    for(i=len-1;i>=0;i-=1){
        if(this.stylesList[i].ld !== '0'){
            this.stylesList[i].ld = '0';
            this.stylesList[i].pathElement.style.display = 'none';
            if(this.stylesList[i].pathElement.parentNode){
                this.stylesList[i].parent = this.stylesList[i].pathElement.parentNode;
                //this.stylesList[i].pathElement.parentNode.removeChild(this.stylesList[i].pathElement);
            }
        }
    }
};

ShapeItemElement.prototype.renderShape = function(num,parentTransform,items,data,isMain){
    var i, len;
    if(!items){
        items = this.data;
        len = this.stylesList.length;
        for(i=0;i<len;i+=1){
            this.stylesList[i].d = '';
            this.stylesList[i].mdf = false;
        }
    }
    if(!data){
        data = this.viewData;
    }
    this.frameNum = num;
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
            groupMatrix.reset();
            if(parentTransform){
                var props = parentTransform.mat.props;
                groupTransform.opacity = parentTransform.opacity;
                groupTransform.opacity *= data[i].transform.op.v;
                groupTransform.matMdf = parentTransform.matMdf ? true : groupTransform.matMdf;
                groupTransform.opMdf = parentTransform.opMdf ? true : groupTransform.opMdf;
                groupMatrix.transform(props[0],props[1],props[2],props[3],props[4],props[5]);
            }else{
                groupTransform.opacity = groupTransform.op.o;
            }
            groupMatrix.transform(mtArr[0],mtArr[1],mtArr[2],mtArr[3],mtArr[4],mtArr[5]);
        }else if(items[i].ty == 'sh'){
            this.renderPath(items[i],data[i],num,groupTransform);
        }else if(items[i].ty == 'el'){
            this.renderPath(items[i],data[i],num,groupTransform);
            //this.renderEllipse(items[i],data[i],num,groupTransform);
        }else if(items[i].ty == 'rc'){
            this.renderPath(items[i],data[i],num,groupTransform);
        }else if(items[i].ty == 'fl'){
            this.renderFill(items[i],data[i],num,groupTransform);
        }else if(items[i].ty == 'st'){
            this.renderStroke(items[i],data[i],num,groupTransform);
        }else if(items[i].ty == 'gr'){
            this.renderShape(num,groupTransform,items[i].it,data[i].it);
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
            this.stylesList[i].pathElement.style.display = 'block';
            //this.stylesList[i].parent.appendChild(this.stylesList[i].pathElement);
        }
        if(this.stylesList[i].type === 'fl'){
            if(this.stylesList[i].mdf){
                this.stylesList[i].pathElement.setAttribute('d',this.stylesList[i].d);
            }
        }
    }
    if(this.firstFrame){
        this.firstFrame = false;
    }

};

ShapeItemElement.prototype.renderPath = function(pathData,viewData,num,groupTransform){
    var len, i;
    var pathNodes = viewData.sh.v;
    var t = '';
    var pathStringTransformed = '';
    var pathStringNonTransformed = '';
    if(pathNodes.v){
        len = pathNodes.v.length;
        var redraw = groupTransform.matMdf || viewData.sh.mdf;
        if(redraw) {
            var stops = pathNodes.s ? pathNodes.s : [];
            for (i = 1; i < len; i += 1) {
                if (stops[i - 1]) {
                    if (viewData.st) {
                        pathStringNonTransformed += " M" + bm_rnd(stops[i - 1][0]) + ',' + bm_rnd(stops[i - 1][1]);
                    }
                    if (viewData.fl) {
                        pathStringTransformed += " M" + groupTransform.mat.applyToPointStringified(stops[i - 1][0], stops[i - 1][1]);
                    }
                } else if (i == 1) {
                    if (viewData.st) {
                        pathStringNonTransformed += " M" + bm_rnd(pathNodes.v[0][0]) + ',' + bm_rnd(pathNodes.v[0][1]);
                    }

                    if (viewData.fl) {
                        pathStringTransformed += " M" + groupTransform.mat.applyToPointStringified(pathNodes.v[0][0], pathNodes.v[0][1]);
                    }
                }
                if (viewData.st) {
                    pathStringNonTransformed += " C" + bm_rnd(pathNodes.o[i - 1][0]) + ',' + bm_rnd(pathNodes.o[i - 1][1]) + " " + bm_rnd(pathNodes.i[i][0]) + ',' + bm_rnd(pathNodes.i[i][1]) + " " + bm_rnd(pathNodes.v[i][0]) + ',' + bm_rnd(pathNodes.v[i][1]);
                }

                if (viewData.fl) {
                    pathStringTransformed += " C" + groupTransform.mat.applyToPointStringified(pathNodes.o[i - 1][0], pathNodes.o[i - 1][1]) + " " + groupTransform.mat.applyToPointStringified(pathNodes.i[i][0], pathNodes.i[i][1]) + " " + groupTransform.mat.applyToPointStringified(pathNodes.v[i][0], pathNodes.v[i][1]);
                }
            }
            if (len == 1) {
                if (stops[0]) {
                    if (viewData.st) {
                        pathStringNonTransformed += " M" + bm_rnd(stops[0][0]) + ',' + bm_rnd(stops[0][1]);
                    }

                    if (viewData.fl) {
                        pathStringTransformed += " M" + groupTransform.mat.applyToPointStringified(stops[0][0], stops[0][1]);
                    }
                } else {

                    if (viewData.st) {
                        pathStringNonTransformed += " M" + bm_rnd(pathNodes.v[0][0]) + ',' + bm_rnd(pathNodes.v[0][1]);
                    }

                    if (viewData.fl) {
                        pathStringTransformed += " M" + groupTransform.mat.applyToPointStringified(pathNodes.v[0][0], pathNodes.v[0][1]);
                    }
                }
            }
            if (pathData.closed && !(pathData.trimmed && !pathNodes.c)) {
                if (viewData.st) {
                    pathStringNonTransformed += " C" + bm_rnd(pathNodes.o[i - 1][0]) + ',' + bm_rnd(pathNodes.o[i - 1][1]) + " " + bm_rnd(pathNodes.i[0][0]) + ',' + bm_rnd(pathNodes.i[0][1]) + " " + bm_rnd(pathNodes.v[0][0]) + ',' + bm_rnd(pathNodes.v[0][1]);
                }

                if (viewData.fl) {
                    pathStringTransformed += " C" + groupTransform.mat.applyToPointStringified(pathNodes.o[i - 1][0], pathNodes.o[i - 1][1]) + " " + groupTransform.mat.applyToPointStringified(pathNodes.i[0][0], pathNodes.i[0][1]) + " " + groupTransform.mat.applyToPointStringified(pathNodes.v[0][0], pathNodes.v[0][1]);
                }
            }
            if (viewData.st) {
                t = 'matrix(' + groupTransform.mat.props.join(',') + ')';
            }
            viewData.lStr = pathStringTransformed;
        }else{
            pathStringTransformed = viewData.lStr;
        }
        len = viewData.elements.length;
        for(i=0;i<len;i+=1){
            if(viewData.elements[i].ty === 'st'){
                if(viewData.sh.mdf || this.firstFrame){
                    viewData.elements[i].el.setAttribute('d', pathStringNonTransformed);
                }
                if(groupTransform.matMdf) {
                    viewData.elements[i].el.setAttribute('transform',t);
                }
            }else{
                viewData.elements[i].st.mdf = redraw ? true : viewData.elements[i].st.mdf;
                viewData.elements[i].st.d += pathStringTransformed;
            }
        }
    }
};

ShapeItemElement.prototype.renderFill = function(styleData,viewData,num, groupTransform){
    var styleElem = viewData.style;

    if(viewData.c.mdf){
        styleElem.pathElement.setAttribute('fill','rgb('+bm_floor(viewData.c.v[0])+','+bm_floor(viewData.c.v[1])+','+bm_floor(viewData.c.v[2])+')');
    }
    if(viewData.o.mdf || groupTransform.opMdf){
        styleElem.pathElement.setAttribute('fill-opacity',viewData.o.v*groupTransform.opacity);
    }
};

ShapeItemElement.prototype.renderStroke = function(styleData,viewData,num, groupTransform){
    var styleElem = viewData.style;
    //TODO fix dashes
    var d = viewData.d;
    var dasharray,dashoffset;
    if(d){
        var j, jLen = d.length;
        dasharray = '';
        dashoffset = '';
        for(j=0;j<jLen;j+=1){
            if(d[j].n != 'o'){
                dasharray += ' ' + d[j].v;
            }else{
                dashoffset += d[j].v;
            }
        }
        if(viewData.lastData.da != dasharray){
            styleElem.pathElement.setAttribute('stroke-dasharray',dasharray);
            viewData.lastData.da = dasharray;
        }
        if(viewData.lastData.do != dashoffset){
            styleElem.pathElement.setAttribute('stroke-dashoffset',dashoffset);
            viewData.lastData.do = dashoffset;
        }
    }
    if(viewData.c.mdf){
        styleElem.pathElement.setAttribute('stroke','rgb('+bm_floor(viewData.c.v[0])+','+bm_floor(viewData.c.v[1])+','+bm_floor(viewData.c.v[2])+')');
    }
    if(viewData.o.mdf || groupTransform.opMdf){
        styleElem.pathElement.setAttribute('stroke-opacity',viewData.o.v*groupTransform.opacity);
    }
    if(viewData.w.mdf){
        styleElem.pathElement.setAttribute('stroke-width',viewData.w.v);
    }
};

ShapeItemElement.prototype.destroy = function(items, data){
    this.shape = null;
    this.data = null;
    this.viewData = null;
    this.parentContainer = null;
    this.placeholder = null;
    /*if(!items){
     items = this.data;
     }
     if(!data){
     data = this.viewData;
     }
     var i, len = items.length;
     var groupTransform,groupMatrix;
     groupTransform = parentTransform;
     for(i = 0; i < len; i += 1){
     if(items[i].ty == 'tr'){
     }else if(items[i].ty == 'sh'){
     this.renderPath(items[i],data[i],num,groupTransform);
     }else if(items[i].ty == 'el'){
     this.renderPath(items[i],data[i],num,groupTransform);
     //this.renderEllipse(items[i],data[i],num,groupTransform);
     }else if(items[i].ty == 'rc'){
     if(items[i].trimmed){
     this.renderPath(items[i],data[i],num,groupTransform);
     }else{
     this.renderRect(items[i],data[i],num,groupTransform);
     }
     }else if(items[i].ty == 'fl'){
     this.renderFill(items[i],data[i],num,groupTransform);
     }else if(items[i].ty == 'st'){
     this.renderStroke(items[i],data[i],num,groupTransform);
     }else if(items[i].ty == 'gr'){
     this.renderShape(num,groupTransform,items[i].it,data[i].it);
     }else if(items[i].ty == 'tm'){
     //
     }
     }*/
};