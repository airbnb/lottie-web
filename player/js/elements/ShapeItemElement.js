function ShapeItemElement(data,parentElement,globalData){
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
    this.data = data;
    this.globalData = globalData;
    this.searchShapes(this.data,this.viewData);
    styleUnselectableDiv(this.shape);
}

ShapeItemElement.prototype.searchShapes = function(arr,data){
    var i, len = arr.length - 1;
    var j, jLen;
    var ownArrays = [];
    for(i=len;i>=0;i-=1){
        if(arr[i].ty == 'fl' || arr[i].ty == 'st'){
            data[i] = {
                renderedFrames : [],
                lastData : {
                    c: '',
                    o:-1,
                    w: ''
                }
            };
            var pathElement = document.createElementNS(svgNS, "path");
            if(arr[i].ty == 'st') {
                pathElement.setAttribute('stroke-linecap', this.lcEnum[arr[i].lc] || 'round');
                pathElement.setAttribute('stroke-linejoin',this.ljEnum[arr[i].lj] || 'round');
                if(arr[i].lj == 1) {
                    pathElement.setAttribute('stroke-miterlimit',arr[i].ml);
                }
            }
            this.shape.appendChild(pathElement);
            this.stylesList.push({
                pathElement: pathElement,
                type: arr[i].ty,
                d: '',
                ld: 'a'
            });
            data[i].style = this.stylesList[this.stylesList.length - 1];
            ownArrays.push(data[i].style);
        }else if(arr[i].ty == 'gr'){
            data[i] = {
                it: []
            };
            this.searchShapes(arr[i].it,data[i].it);
        }else if(arr[i].ty == 'tr'){
            data[i] = {
                transform : {
                    mat: new Matrix(),
                    opacity: 1
                }
            };
        }else if(arr[i].ty == 'sh' || arr[i].ty == 'rc' || arr[i].ty == 'el'){
            data[i] = {
                elements : [],
                renderedFrames : [],
                styles : [],
                lastData : {
                    d: '',
                    o:'',
                    tr:''
                }
            };
            jLen = this.stylesList.length;
            for(j=0;j<jLen;j+=1){
                if(!this.stylesList[j].closed){
                    data[i].styles.push(this.stylesList[j]);
                    if(this.stylesList[j].type == 'st'){
                        this.stylesList[j].pathElement.setAttribute('fill-opacity',0);
                    }
                }
            }
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
        this.stylesList[i].pathElement.setAttribute('d','M 0,0');
        this.stylesList[i].ld = 'M 0,0';
    }
};

ShapeItemElement.prototype.renderShape = function(num,parentTransform,items,data){
    var i, len;
    if(!items){
        items = this.data;
        len = this.stylesList.length;
        for(i=0;i<len;i+=1){
            this.stylesList[i].d = '';
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
            var mtArr = items[i].renderedData[num].mtArr;
            groupTransform = data[i].transform;
            groupMatrix = groupTransform.mat;
            groupMatrix.reset();
            if(parentTransform){
                var props = parentTransform.mat.props;
                groupTransform.opacity = parentTransform.opacity;
                groupTransform.opacity *= items[i].renderedData[num].o;
                groupMatrix.transform(props[0],props[1],props[2],props[3],props[4],props[5]);
            }else{
                groupTransform.opacity = items[i].renderedData[num].o;
            }
            groupMatrix.transform(mtArr[0],mtArr[1],mtArr[2],mtArr[3],mtArr[4],mtArr[5]).translate(-items[i].renderedData[num].a[0],-items[i].renderedData[num].a[1]);
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
    }
    len = this.stylesList.length;
    for(i=0;i<len;i+=1){
        if(this.stylesList[i].d == '' && this.stylesList[i].ld !== ''){
            this.stylesList[i].pathElement.setAttribute('d','M 0,0');
            this.stylesList[i].ld = this.stylesList[i].d;
        }else if(this.stylesList[i].ld !== this.stylesList[i].d){
            this.stylesList[i].pathElement.setAttribute('d',this.stylesList[i].d);
            this.stylesList[i].ld = this.stylesList[i].d;
        }
    }

};

ShapeItemElement.prototype.renderPath = function(pathData,viewData,num,transform){
    var len,i;
    if(!viewData.renderedFrames[this.globalData.frameNum]){

        var pathNodes = pathData.renderedData[num].path.pathNodes;
        if(!pathNodes.v){
            return;
        }
        len = pathNodes.v.length;
        var stops = pathNodes.s ? pathNodes.s : [];
        var pathStringTransformed = '';
        for(i=1;i<len;i+=1){
            if(stops[i-1]){
                //pathStringTransformed += " M"+transform.mat.applyToPointStringified(stops[i-1][0],stops[i-1][1]);
                pathStringTransformed += " M"+stops[i-1][0]+','+stops[i-1][1];
            }else if(i==1){
                //pathStringTransformed += " M"+transform.mat.applyToPointStringified(pathNodes.v[0][0],pathNodes.v[0][1]);
                pathStringTransformed += " M"+pathNodes.v[0][0]+','+pathNodes.v[0][1];
            }
            //pathStringTransformed += " C"+transform.mat.applyToPointStringified(pathNodes.o[i-1][0],pathNodes.o[i-1][1]) + " "+transform.mat.applyToPointStringified(pathNodes.i[i][0],pathNodes.i[i][1]) + " "+transform.mat.applyToPointStringified(pathNodes.v[i][0],pathNodes.v[i][1]);
            pathStringTransformed += " C"+pathNodes.o[i-1][0]+','+pathNodes.o[i-1][1] + " "+pathNodes.i[i][0]+','+pathNodes.i[i][1] + " "+pathNodes.v[i][0]+','+pathNodes.v[i][1];
        }
        if(len == 1){
            if(stops[0]){
                //pathStringTransformed += " M"+transform.mat.applyToPointStringified(stops[i-1][0],stops[0][1]);
                pathStringTransformed += " M"+stops[0][0]+','+stops[0][1];
            }else{
                //pathStringTransformed += " M"+transform.mat.applyToPointStringified(pathNodes.v[0][0],pathNodes.v[0][1]);
                pathStringTransformed += " M"+pathNodes.v[0][0]+','+pathNodes.v[0][1];
            }
        }
        if(pathData.closed && !(pathData.trimmed && !pathNodes.c)){
            //pathStringTransformed += " C"+transform.mat.applyToPointStringified(pathNodes.o[i-1][0],pathNodes.o[i-1][1]) + " "+transform.mat.applyToPointStringified(pathNodes.i[0][0],pathNodes.i[0][1]) + " "+transform.mat.applyToPointStringified(pathNodes.v[0][0],pathNodes.v[0][1]);
            pathStringTransformed += " C"+pathNodes.o[i-1][0]+','+pathNodes.o[i-1][1] + " "+pathNodes.i[0][0]+','+pathNodes.i[0][1] + " "+pathNodes.v[0][0]+','+pathNodes.v[0][1];
        }

        viewData.renderedFrames[this.globalData.frameNum] = {
            dTr: pathStringTransformed
        };
    }
    var renderedFrameData = viewData.renderedFrames[this.globalData.frameNum];

    len = viewData.styles.length;
    for(i=0;i<len;i+=1){
        viewData.styles[i].d += renderedFrameData.dTr;
    }
};

ShapeItemElement.prototype.renderFill = function(styleData,viewData,num,groupTransform){
    var fillData = styleData.renderedData[num];
    var styleElem = viewData.style;
    if(!viewData.renderedFrames[this.globalData.frameNum]){
        viewData.renderedFrames[this.globalData.frameNum] = {
            c: fillData.color,
            o: fillData.opacity*groupTransform.opacity,
            t: 'matrix('+groupTransform.mat.props.join(',')+')'
        };
    }

    var renderedFrameData = viewData.renderedFrames[this.globalData.frameNum];
    if(viewData.lastData.c != renderedFrameData.c){
        styleElem.pathElement.setAttribute('fill',renderedFrameData.c);
        viewData.lastData.c = renderedFrameData.c;
    }
    if(viewData.lastData.o != renderedFrameData.o){
        styleElem.pathElement.setAttribute('fill-opacity',renderedFrameData.o);
        viewData.lastData.o = renderedFrameData.o;
    }
    if(viewData.lastData.t != renderedFrameData.t){
        styleElem.pathElement.setAttribute('transform',renderedFrameData.t);
        viewData.lastData.t = renderedFrameData.t;
    }
};

ShapeItemElement.prototype.renderStroke = function(styleData,viewData,num,groupTransform){
    var fillData = styleData.renderedData[num];
    var styleElem = viewData.style;
    if(!viewData.renderedFrames[this.globalData.frameNum]){
        viewData.renderedFrames[this.globalData.frameNum] = {
            c: fillData.color,
            o: fillData.opacity*groupTransform.opacity,
            w: fillData.width,
            t: 'matrix('+groupTransform.mat.props.join(',')+')'
        };
        if(fillData.dashes){
            viewData.renderedFrames[this.globalData.frameNum].d = fillData.dashes;
        }
    }

    var renderedFrameData = viewData.renderedFrames[this.globalData.frameNum];
    var c = renderedFrameData.c;
    var o = renderedFrameData.o;
    var w = renderedFrameData.w;
    var d = renderedFrameData.d;
    var t = renderedFrameData.t;
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
    if(viewData.lastData.c != c){
        styleElem.pathElement.setAttribute('stroke',c);
        viewData.lastData.c = c;
    }
    if(viewData.lastData.o != o){
        styleElem.pathElement.setAttribute('stroke-opacity',o);
        viewData.lastData.o = o;
    }
    if(viewData.lastData.w !== w){
        styleElem.pathElement.setAttribute('stroke-width',w);
        viewData.lastData.w = w;
    }
    if(viewData.lastData.t !== t){
        styleElem.pathElement.setAttribute('transform',t);
        viewData.lastData.t = t;
    }
};

ShapeItemElement.prototype.destroy = function(items, data){
    this.shape = null;
    this.data = null;
    this.viewData = null;
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