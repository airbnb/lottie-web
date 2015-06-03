function ShapeItemElement(data,parentElement,globalData){
    this.stylesList = [];
    this.currentMatrix = new Matrix();
    this.shape = parentElement;
    this.data = data;
    this.globalData = globalData;
    this.searchShapes(this.data);
    styleUnselectableDiv(this.shape);
    this.currentTrim = {
        s:0,
        e:100,
        o:0,
        active : false
    }
}

ShapeItemElement.prototype.searchShapes = function(arr){
    var i, len = arr.length - 1;
    var j, jLen;
    var k, kLen;
    var pathNode;
    var ownArrays = [];
    for(i=len;i>=0;i-=1){
        if(arr[i].ty == 'fl' || arr[i].ty == 'st'){
            arr[i].renderedFrames = [];
            arr[i].lastData = {
                c: '',
                o:'',
                w: ''
            };
            this.stylesList.push({
                elements: [],
                type: arr[i].ty,
                d: ''
            });
            arr[i].style = this.stylesList[this.stylesList.length - 1];
            ownArrays.push(arr[i].style);
        }else if(arr[i].ty == 'gr'){
            this.searchShapes(arr[i].it);
        }else if(arr[i].ty == 'tr'){
            arr[i].transform = {
                mat: new Matrix(),
                opacity: 1
            };
        }else if(arr[i].ty == 'sh'){
            arr[i].elements = [];
            arr[i].renderedFrames = [];
            arr[i].lastData = {
                d: '',
                o:'',
                tr:''
            };
            jLen = this.stylesList.length;
            kLen = arr[i].ks.v ? arr[i].ks.v.length :  arr[i].ks[0].s[0].v.length;
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
                    arr[i].elements.push(pathNode);
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
            arr[i].elements = [];
            arr[i].renderedFrames = [];
            arr[i].lastData = {
                roundness: '',
                w: '',
                h: '',
                x: '',
                y:'',
                o:'',
                tr:''
            };
            arr[i].renderedFrames = [];
            jLen = this.stylesList.length;
            for(j=0;j<jLen;j+=1){
                if(!this.stylesList[j].closed){
                    if(arr[i].trimmed){
                        pathNode = document.createElementNS(svgNS, "path");
                    }else{
                        pathNode = document.createElementNS(svgNS, "rect");
                    }
                    arr[i].elements.push(pathNode);
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
            arr[i].elements = [];
            arr[i].renderedFrames = [];
            arr[i].lastData = {
                cx: '',
                cy: '',
                rx: '',
                ry: '',
                o:'',
                tr:''
            };
            jLen = this.stylesList.length;
            for(j=0;j<jLen;j+=1){
                if(!this.stylesList[j].closed){
                    pathNode = document.createElementNS(svgNS, "ellipse");
                    arr[i].elements.push(pathNode);
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

ShapeItemElement.prototype.hideShape = function(items){
    if(!items){
        items = this.data;
    }
    var i, len = this.stylesList.length;
    var j, jLen;
    var elements;
    len = items.length - 1;
    for(i=len;i>=0;i-=1){
        if(items[i].ty == 'sh' || items[i].ty == 'el' || items[i].ty == 'rc'){
            items[i].lastData.o = '';
            elements = items[i].elements;
            jLen = elements.length;
            for(j=0;j<jLen;j+=1){
                elements[j].setAttribute('opacity','0');
                /*elements[i].setAttribute('fill-opacity','0');
                 elements[i].setAttribute('stroke-opacity','0');*/
            }

        }else if(items[i].ty == 'gr'){
            this.hideShape(items[i].it);
        }
    }
};

ShapeItemElement.prototype.renderShape = function(num,parentTransform,items){
    if(!items){
        items = this.data;
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
            groupTransform = items[i].transform;
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
            this.renderPath(items[i],num,groupTransform);
        }else if(items[i].ty == 'el'){
            this.renderEllipse(items[i],num,groupTransform);
        }else if(items[i].ty == 'rc'){
            if(items[i].trimmed){
                this.renderPath(items[i],num,groupTransform);
            }else{
                this.renderRect(items[i],num,groupTransform);
            }
        }else if(items[i].ty == 'fl'){
            this.renderFill(items[i],num);
        }else if(items[i].ty == 'st'){
            this.renderStroke(items[i],num);
        }else if(items[i].ty == 'gr'){
            this.renderShape(num,groupTransform,items[i].it);
        }else if(items[i].ty == 'tm'){
            //
        }
    }
};

ShapeItemElement.prototype.renderPath = function(pathData,num,transform){
    if(!pathData.renderedFrames[this.globalData.frameNum]){
        pathData.renderedFrames[this.globalData.frameNum] = {
            d: pathData.renderedData[num].path.pathString,
            tr: 'matrix('+transform.mat.props.join(',')+')',
            o: transform.opacity
        };
    }
    var renderedFrameData = pathData.renderedFrames[this.globalData.frameNum];
    var pathString = renderedFrameData.d;
    var transformString = renderedFrameData.tr;
    var opacity = renderedFrameData.o;
    var elements = pathData.elements;
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
        if(pathData.lastData.d != pathString){
            elements[i].setAttribute('d',pathString);
        }
        if(pathData.lastData.tr != transformString){
            elements[i].setAttribute('transform',transformString);
        }
        if(pathData.lastData.o != opacity){
            elements[i].setAttribute('opacity',opacity);
        }
    }
    pathData.lastData.d = pathString;
    pathData.lastData.tr = transformString;
    pathData.lastData.o = opacity;
};


ShapeItemElement.prototype.renderEllipse = function(ellipseData,num,transform){
    var ellipseAttrs = ellipseData.renderedData[num];
    if(!ellipseData.renderedFrames[this.globalData.frameNum]){
        ellipseData.renderedFrames[this.globalData.frameNum] = {
            cx: ellipseAttrs.p[0],
            cy: ellipseAttrs.p[1],
            rx: ellipseAttrs.size[0]/2,
            ry: ellipseAttrs.size[1]/2,
            tr: 'matrix('+transform.mat.props.join(',')+')',
            o: transform.opacity
        };
    }
    var renderedFrameData = ellipseData.renderedFrames[this.globalData.frameNum];
    var cx = renderedFrameData.cx;
    var cy = renderedFrameData.cy;
    var rx = renderedFrameData.rx;
    var ry = renderedFrameData.ry;
    var tr = renderedFrameData.tr;
    var o = renderedFrameData.o;

    var elements = ellipseData.elements;
    var i, len = elements.length;
    for(i=0;i<len;i+=1){
        if(ellipseData.lastData.cx != cx){
            elements[i].setAttribute('cx',cx);
        }
        if(ellipseData.lastData.cy != cy){
            elements[i].setAttribute('cy',cy);
        }
        if(ellipseData.lastData.rx != rx){
            elements[i].setAttribute('rx',rx);
        }
        if(ellipseData.lastData.ry != ry){
            elements[i].setAttribute('ry',ry);
        }
        if(ellipseData.lastData.tr != tr){
            elements[i].setAttribute('transform',tr);
        }
        if(ellipseData.lastData.o != o){
            elements[i].setAttribute('opacity',o);
        }
    }
    ellipseData.lastData.cx = cx;
    ellipseData.lastData.cy = cy;
    ellipseData.lastData.rx = rx;
    ellipseData.lastData.ry = ry;
    ellipseData.lastData.tr = tr;
    ellipseData.lastData.o = o;
};

ShapeItemElement.prototype.renderRect = function(rectData,num,transform){
    var elements = rectData.elements;
    var rectAttrs = rectData.renderedData[num];
    var roundness;
    if(!rectData.renderedFrames[this.globalData.frameNum]){
        roundness = rectAttrs.roundness;

        if(roundness > rectAttrs.size[0]/2){
            roundness = rectAttrs.size[0]/2;
        }
        if(roundness > rectAttrs.size[1]/2){
            roundness = rectAttrs.size[1]/2;
        }
        rectData.renderedFrames[this.globalData.frameNum] = {
            round: roundness,
            w: rectAttrs.size[0],
            h: rectAttrs.size[1],
            x: rectAttrs.position[0] - rectAttrs.size[0]/2,
            y: rectAttrs.position[1] - rectAttrs.size[1]/2,
            tr: 'matrix('+transform.mat.props.join(',')+')',
            o: transform.opacity
        };
    }
    var renderedFrameData = rectData.renderedFrames[this.globalData.frameNum];
    roundness = renderedFrameData.round;
    var w = renderedFrameData.w;
    var h = renderedFrameData.h;
    var x = renderedFrameData.x;
    var y = renderedFrameData.y;
    var tr = renderedFrameData.tr;
    var o = renderedFrameData.o;
    var i, len = elements.length;
    for(i=0;i<len;i+=1){
        if(rectData.lastData.roundness != roundness){
            elements[i].setAttribute('rx',roundness);
            elements[i].setAttribute('ry',roundness);
        }
        if(rectData.lastData.w != w){
            elements[i].setAttribute('width',w);
        }
        if(rectData.lastData.h != h){
            elements[i].setAttribute('height',h);
        }
        if(rectData.lastData.x != x){
            elements[i].setAttribute('x',x);
        }
        if(rectData.lastData.y != y){
            elements[i].setAttribute('y',y);
        }
        if(rectData.lastData.tr != tr){
            elements[i].setAttribute('transform',tr);
        }
        if(rectData.lastData.o != o){
            elements[i].setAttribute('opacity',o);
        }
    }
    rectData.lastData.roundness = roundness;
    rectData.lastData.w = w;
    rectData.lastData.h = h;
    rectData.lastData.x = x;
    rectData.lastData.y = y;
    rectData.lastData.o = o;
};

ShapeItemElement.prototype.renderFill = function(styleData,num){
    var fillData = styleData.renderedData[num];
    var styleElem = styleData.style;
    if(!styleData.renderedFrames[this.globalData.frameNum]){
        styleData.renderedFrames[this.globalData.frameNum] = {
            c: fillData.color,
            o: fillData.opacity
        }
    }

    var renderedFrameData = styleData.renderedFrames[this.globalData.frameNum];
    var c = renderedFrameData.c;
    var o = renderedFrameData.o;

    var elements = styleElem.elements;
    var i, len = elements.length;
    for(i=0;i<len;i+=1){
        if(styleData.lastData.c != c){
            elements[i].setAttribute('fill',c);
        }
        if(styleData.lastData.o != o){
            elements[i].setAttribute('fill-opacity',o);
        }
    }
    styleData.lastData.c = c;
    styleData.lastData.o = o;
};

ShapeItemElement.prototype.renderStroke = function(styleData,num){
    /*stroke-dasharray: 10 10 20;
     stroke-dashoffset: 276;*/
    var fillData = styleData.renderedData[num];
    var styleElem = styleData.style;
    if(!styleData.renderedFrames[this.globalData.frameNum]){
        styleData.renderedFrames[this.globalData.frameNum] = {
            c: fillData.color,
            o: fillData.opacity,
            w: fillData.width
        };
        if(fillData.dashes){
            styleData.renderedFrames[this.globalData.frameNum].d = fillData.dashes;
        }
    }

    var renderedFrameData = styleData.renderedFrames[this.globalData.frameNum];
    var c = renderedFrameData.c;
    var o = renderedFrameData.o;
    var w = renderedFrameData.w;

    var elements = styleElem.elements;
    var i, len = elements.length;
    for(i=0;i<len;i+=1){
        if(styleData.lastData.c != c){
            elements[i].setAttribute('stroke',c);
        }
        if(styleData.lastData.o != o){
            elements[i].setAttribute('stroke-opacity',o);
        }
        if(styleData.lastData.w != w){
            elements[i].setAttribute('stroke-width',w);
        }
    }
    styleData.lastData.c = c;
    styleData.lastData.o = o;
    styleData.lastData.w = w;
};