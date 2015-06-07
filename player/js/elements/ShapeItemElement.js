function ShapeItemElement(data,parentElement,globalData){
    this.stylesList = [];
    this.viewData = [];
    this.currentMatrix = new Matrix();
    this.shape = parentElement;
    this.data = data;
    this.globalData = globalData;
    this.searchShapes(this.data,this.viewData);
    styleUnselectableDiv(this.shape);
    this.currentTrim = {
        s:0,
        e:100,
        o:0,
        active : false
    }
}

ShapeItemElement.prototype.searchShapes = function(arr,data){
    var i, len = arr.length - 1;
    var j, jLen;
    var k, kLen;
    var pathNode;
    var ownArrays = [];
    for(i=len;i>=0;i-=1){
        if(arr[i].ty == 'fl' || arr[i].ty == 'st'){
            data[i] = {
                renderedFrames : [],
                lastData : {
                    c: '',
                    o:'',
                    w: ''
                }
            };
            this.stylesList.push({
                elements: [],
                type: arr[i].ty,
                d: ''
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
        }else if(arr[i].ty == 'sh'){
            data[i] = {
                elements : [],
                renderedFrames : [],
                lastData : {
                    d: '',
                    o:'',
                    tr:''
                }
            };
            jLen = this.stylesList.length;
            //kLen = arr[i].ks.v ? arr[i].ks.v.length :  arr[i].ks[0].s[0].v.length;
            for(j=0;j<jLen;j+=1){
                if(!this.stylesList[j].closed){
                    pathNode = document.createElementNS(svgNS, "path");
                    /*pathNode.__items = [];
                    pathNode.__items.push(pathNode.createSVGPathSegMovetoAbs(0,0));
                    pathNode.pathSegList.appendItem(pathNode.__items[0]);
                    if(arr[i].closed){
                        kLen += 1;
                    }
                    for(k=1;k<kLen;k+=1){
                        pathNode.__items.push(pathNode.createSVGPathSegCurvetoCubicAbs(0,0,0,0,0,0));
                        pathNode.pathSegList.appendItem(pathNode.__items[k]);
                    }*/
                    data[i].elements.push(pathNode);
                    this.shape.appendChild(pathNode);
                    this.stylesList[j].elements.push(pathNode);
                    if(this.stylesList[j].type == 'st'){
                        pathNode.setAttribute('fill-opacity',0);
                        pathNode.setAttribute('stroke-linejoin','round');
                        pathNode.setAttribute('stroke-linecap','round');
                    }
                }
            }

        }else if(arr[i].ty == 'rc'){
            data[i] = {
                elements : [],
                renderedFrames : [],
                lastData : {
                    roundness: '',
                    w: '',
                    h: '',
                    x: '',
                    y:'',
                    o:'',
                    tr:''
                }
            }
            jLen = this.stylesList.length;
            for(j=0;j<jLen;j+=1){
                if(!this.stylesList[j].closed){
                    if(arr[i].trimmed){
                        pathNode = document.createElementNS(svgNS, "path");
                    }else{
                        pathNode = document.createElementNS(svgNS, "rect");
                    }
                    data[i].elements.push(pathNode);
                    this.shape.appendChild(pathNode);
                    this.stylesList[j].elements.push(pathNode);
                    if(this.stylesList[j].type == 'st'){
                        pathNode.setAttribute('fill-opacity',0);
                        if(arr[i].trimmed){
                            pathNode.setAttribute('stroke-linejoin','round');
                            pathNode.setAttribute('stroke-linecap','round');
                        }
                    }
                }
            }

        }else if(arr[i].ty == 'el'){
            data[i] = {
                elements : [],
                renderedFrames : [],
                lastData : {
                    cx: '',
                    cy: '',
                    rx: '',
                    ry: '',
                    o:'',
                    tr:''
                }
            };
            jLen = this.stylesList.length;
            for(j=0;j<jLen;j+=1){
                if(!this.stylesList[j].closed){
                    pathNode = document.createElementNS(svgNS, "ellipse");
                    data[i].elements.push(pathNode);
                    this.shape.appendChild(pathNode);
                    this.stylesList[j].elements.push(pathNode);
                    if(this.stylesList[j].type == 'st'){
                        pathNode.setAttribute('fill-opacity',0);
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

ShapeItemElement.prototype.hideShape = function(items,data){
    if(!items){
        items = this.data;
    }
    if(!data){
        data = this.viewData;
    }
    var i, len = this.stylesList.length;
    var j, jLen;
    var elements;
    len = items.length - 1;
    for(i=len;i>=0;i-=1){
        if(items[i].ty == 'sh' || items[i].ty == 'el' || items[i].ty == 'rc'){
            data[i].lastData.o = '';
            elements = data[i].elements;
            jLen = elements.length;
            for(j=0;j<jLen;j+=1){
                elements[j].setAttribute('opacity','0');
                /*elements[i].setAttribute('fill-opacity','0');
                 elements[i].setAttribute('stroke-opacity','0');*/
            }

        }else if(items[i].ty == 'gr'){
            this.hideShape(items[i].it,data[i].it);
        }
    }
};

ShapeItemElement.prototype.renderShape = function(num,parentTransform,items,data){
    if(!items){
        items = this.data;
    }
    if(!data){
        data = this.viewData;
    }
    if(this.currentTrim.active){
        this.currentTrim.active = false;
    }
    this.posCount = 0;
    this.frameNum = num;
    var i, len;
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
            this.renderEllipse(items[i],data[i],num,groupTransform);
        }else if(items[i].ty == 'rc'){
            if(items[i].trimmed){
                this.renderPath(items[i],data[i],num,groupTransform);
            }else{
                this.renderRect(items[i],data[i],num,groupTransform);
            }
        }else if(items[i].ty == 'fl'){
            this.renderFill(items[i],data[i],num);
        }else if(items[i].ty == 'st'){
            this.renderStroke(items[i],data[i],num);
        }else if(items[i].ty == 'gr'){
            this.renderShape(num,groupTransform,items[i].it,data[i].it);
        }else if(items[i].ty == 'tm'){
            //
        }
    }
};

ShapeItemElement.prototype.renderPath = function(pathData,viewData,num,transform){
    if(!viewData.renderedFrames[this.globalData.frameNum]){
        viewData.renderedFrames[this.globalData.frameNum] = {
            d: pathData.renderedData[num].path.pathString,
            tr: 'matrix('+transform.mat.props.join(',')+')',
            o: transform.opacity
        };
    }
    var renderedFrameData = viewData.renderedFrames[this.globalData.frameNum];
    var pathString = renderedFrameData.d;
    var transformString = renderedFrameData.tr;
    var opacity = renderedFrameData.o;
    var elements = viewData.elements;
    var i, len = elements.length;
    var pathNodes = pathData.renderedData[num].path.pathNodes;
    //var j, jLen = pathNodes.v.length;
    var elem, item;
    for(i=0;i<len;i+=1){
        elem = elements[i];
        /*item = elem.__items[0];
        if(item.x != pathNodes.v[0][0]){
            item.x = pathNodes.v[0][0];
        }
        if(item.y != pathNodes.v[0][1]){
            item.y = pathNodes.v[0][1];
        }
        for(j = 1; j < jLen ; j +=1){
            item = elem.__items[j];
            if(item.x != pathNodes.v[j][0]){
                item.x = pathNodes.v[j][0];
            }
            if(item.y != pathNodes.v[j][1]){
                item.y = pathNodes.v[j][1];
            }
            if(item.x1 != pathNodes.o[j-1][0]){
                item.x1 = pathNodes.o[j-1][0];
            }
            if(item.y1 != pathNodes.o[j-1][1]){
                item.y1 = pathNodes.o[j-1][1];
            }
            if(item.x2 != pathNodes.i[j][0]){
                item.x2 = pathNodes.i[j][0];
            }
            if(item.y2 != pathNodes.i[j][1]){
                item.y2 = pathNodes.i[j][1];
            }
        }
        if(pathData.closed){
            item = elem.__items[j];
            if(item.x != pathNodes.v[0][0]){
                item.x = pathNodes.v[0][0];
            }
            if(item.y != pathNodes.v[0][1]){
                item.y = pathNodes.v[0][1];
            }
            if(item.x1 != pathNodes.o[j-1][0]){
                item.x1 = pathNodes.o[j-1][0];
            }
            if(item.y1 != pathNodes.o[j-1][1]){
                item.y1 = pathNodes.o[j-1][1];
            }
            if(item.x2 != pathNodes.i[0][0]){
                item.x2 = pathNodes.i[0][0];
            }
            if(item.y2 != pathNodes.i[0][1]){
                item.y2 = pathNodes.i[0][1];
            }
        }*/
        if(viewData.lastData.d != pathString){
            elements[i].setAttribute('d',pathString);
        }
        if(viewData.lastData.tr != transformString){
            elements[i].setAttribute('transform',transformString);
        }
        if(viewData.lastData.o != opacity){
            elements[i].setAttribute('opacity',opacity);
        }
    }
    viewData.lastData.d = pathString;
    viewData.lastData.tr = transformString;
    viewData.lastData.o = opacity;
};


ShapeItemElement.prototype.renderEllipse = function(ellipseData,viewData,num,transform){
    var ellipseAttrs = ellipseData.renderedData[num];
    if(!viewData.renderedFrames[this.globalData.frameNum]){
        viewData.renderedFrames[this.globalData.frameNum] = {
            cx: ellipseAttrs.p[0],
            cy: ellipseAttrs.p[1],
            rx: ellipseAttrs.size[0]/2,
            ry: ellipseAttrs.size[1]/2,
            tr: 'matrix('+transform.mat.props.join(',')+')',
            o: transform.opacity
        };
    }
    var renderedFrameData = viewData.renderedFrames[this.globalData.frameNum];
    var cx = renderedFrameData.cx;
    var cy = renderedFrameData.cy;
    var rx = renderedFrameData.rx;
    var ry = renderedFrameData.ry;
    var tr = renderedFrameData.tr;
    var o = renderedFrameData.o;

    var elements = viewData.elements;
    var i, len = elements.length;
    for(i=0;i<len;i+=1){
        if(viewData.lastData.cx != cx){
            elements[i].setAttribute('cx',cx);
        }
        if(viewData.lastData.cy != cy){
            elements[i].setAttribute('cy',cy);
        }
        if(viewData.lastData.rx != rx){
            elements[i].setAttribute('rx',rx);
        }
        if(viewData.lastData.ry != ry){
            elements[i].setAttribute('ry',ry);
        }
        if(viewData.lastData.tr != tr){
            elements[i].setAttribute('transform',tr);
        }
        if(viewData.lastData.o != o){
            elements[i].setAttribute('opacity',o);
        }
    }
    viewData.lastData.cx = cx;
    viewData.lastData.cy = cy;
    viewData.lastData.rx = rx;
    viewData.lastData.ry = ry;
    viewData.lastData.tr = tr;
    viewData.lastData.o = o;
};

ShapeItemElement.prototype.renderRect = function(rectData,viewData,num,transform){
    var elements = viewData.elements;
    var rectAttrs = rectData.renderedData[num];
    var roundness;
    if(!viewData.renderedFrames[this.globalData.frameNum]){
        roundness = rectAttrs.roundness;

        if(roundness > rectAttrs.size[0]/2){
            roundness = rectAttrs.size[0]/2;
        }
        if(roundness > rectAttrs.size[1]/2){
            roundness = rectAttrs.size[1]/2;
        }
        viewData.renderedFrames[this.globalData.frameNum] = {
            round: roundness,
            w: rectAttrs.size[0],
            h: rectAttrs.size[1],
            x: rectAttrs.position[0] - rectAttrs.size[0]/2,
            y: rectAttrs.position[1] - rectAttrs.size[1]/2,
            tr: 'matrix('+transform.mat.props.join(',')+')',
            o: transform.opacity
        };
    }
    var renderedFrameData = viewData.renderedFrames[this.globalData.frameNum];
    roundness = renderedFrameData.round;
    var w = renderedFrameData.w;
    var h = renderedFrameData.h;
    var x = renderedFrameData.x;
    var y = renderedFrameData.y;
    var tr = renderedFrameData.tr;
    var o = renderedFrameData.o;
    var i, len = elements.length;
    for(i=0;i<len;i+=1){
        if(viewData.lastData.roundness != roundness){
            elements[i].setAttribute('rx',roundness);
            elements[i].setAttribute('ry',roundness);
        }
        if(viewData.lastData.w != w){
            elements[i].setAttribute('width',w);
        }
        if(viewData.lastData.h != h){
            elements[i].setAttribute('height',h);
        }
        if(viewData.lastData.x != x){
            elements[i].setAttribute('x',x);
        }
        if(viewData.lastData.y != y){
            elements[i].setAttribute('y',y);
        }
        if(viewData.lastData.tr != tr){
            elements[i].setAttribute('transform',tr);
        }
        if(viewData.lastData.o != o){
            elements[i].setAttribute('opacity',o);
        }
    }
    viewData.lastData.roundness = roundness;
    viewData.lastData.w = w;
    viewData.lastData.h = h;
    viewData.lastData.x = x;
    viewData.lastData.y = y;
    viewData.lastData.o = o;
};

ShapeItemElement.prototype.renderFill = function(styleData,viewData,num){
    var fillData = styleData.renderedData[num];
    var styleElem = viewData.style;
    if(!viewData.renderedFrames[this.globalData.frameNum]){
        viewData.renderedFrames[this.globalData.frameNum] = {
            c: fillData.color,
            o: fillData.opacity
        }
    }

    var renderedFrameData = viewData.renderedFrames[this.globalData.frameNum];
    var c = renderedFrameData.c;
    var o = renderedFrameData.o;

    var elements = styleElem.elements;
    var i, len = elements.length;
    for(i=0;i<len;i+=1){
        if(viewData.lastData.c != c){
            elements[i].setAttribute('fill',c);
        }
        if(viewData.lastData.o != o){
            elements[i].setAttribute('fill-opacity',o);
        }
    }
    viewData.lastData.c = c;
    viewData.lastData.o = o;
};

ShapeItemElement.prototype.renderStroke = function(styleData,viewData,num){
    var fillData = styleData.renderedData[num];
    var styleElem = viewData.style;
    if(!viewData.renderedFrames[this.globalData.frameNum]){
        viewData.renderedFrames[this.globalData.frameNum] = {
            c: fillData.color,
            o: fillData.opacity,
            w: fillData.width
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
    if(d){
        var j, jLen = d.length;
        var dasharray = '';
        var dashoffset = '';
        for(j=0;j<jLen;j+=1){
            if(d[j].n != 'o'){
                dasharray += ' ' + d[j].v;
            }else{
                dashoffset += d[j].v;
            }
        }
    }

    var elements = styleElem.elements;
    var i, len = elements.length;
    for(i=0;i<len;i+=1){
        if(viewData.lastData.c != c){
            elements[i].setAttribute('stroke',c);
        }
        if(viewData.lastData.o != o){
            elements[i].setAttribute('stroke-opacity',o);
        }
        if(viewData.lastData.w != w){
            elements[i].setAttribute('stroke-width',w);
        }
        if(d){
            if(viewData.lastData.da != dasharray){
                elements[i].setAttribute('stroke-dasharray',dasharray);
            }
            if(viewData.lastData.do != dashoffset){
                elements[i].setAttribute('stroke-dashoffset',dashoffset);
            }
        }
    }
    viewData.lastData.c = c;
    viewData.lastData.o = o;
    viewData.lastData.w = w;
    if(d){
        viewData.lastData.da = dasharray;
        viewData.lastData.do = dashoffset;
    }
};