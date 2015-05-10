function ShapeItemElement(data,parentElement){
    this.stylesList = [];
    this.currentMatrix = new Matrix();
    this.shape = parentElement;
    this.data = data;
    this.searchShapes(this.data);
    styleUnselectableDiv(this.shape);
}

ShapeItemElement.prototype.searchShapes = function(arr){
    var i, len = arr.length - 1;
    var j, jLen;
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
            for(j=0;j<jLen;j+=1){
                if(!this.stylesList[j].closed){
                    pathNode = document.createElementNS(svgNS, "path");
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
                    pathNode = document.createElementNS(svgNS, "rect");
                    arr[i].elements.push(pathNode);
                    this.shape.appendChild(pathNode);
                    this.stylesList[j].elements.push(pathNode);
                    if(this.stylesList[j].type == 'st'){
                        pathNode.setAttribute('fill-opacity',0);
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

ShapeItemElement.prototype.hideShape = function(){
    var i, len = this.stylesList.length;
    var j, jLen;
    var elements;
    for(i=0;i<len;i+=1){
        elements = this.stylesList[i].elements;
        jLen = elements.length;
        for(j=0;j<jLen;j+=1){
            elements[j].setAttribute('opacity','0');
        }
    }
};

ShapeItemElement.prototype.renderShape = function(num,parentTransform,items){
    if(!items){
        items = this.data;
    }
    this.posCount = 0;
    this.frameNum = num;
    var i, len;
    len = items.length - 1;
    var groupTransform,groupMatrix;
    for(i=len;i>=0;i-=1){
        if(items[i].ty == 'tr'){
            var props = parentTransform.mat.props;
            var mtArr = items[i].renderedData[num].mtArr;
            groupTransform = items[i].transform;
            groupTransform.opacity = parentTransform.opacity;
            groupTransform.opacity *= items[i].renderedData[num].o;
            groupMatrix = groupTransform.mat;
            groupMatrix.reset().transform(props[0],props[1],props[2],props[3],props[4],props[5]).transform(mtArr[0],mtArr[1],mtArr[2],mtArr[3],mtArr[4],mtArr[5]).translate(-items[i].renderedData[num].a[0],-items[i].renderedData[num].a[1]);
        }else if(items[i].ty == 'sh'){
            this.renderPath(items[i],num,groupTransform);
        }else if(items[i].ty == 'el'){
            this.renderEllipse(items[i],num,groupTransform);
        }else if(items[i].ty == 'rc'){
            this.renderRect(items[i],num,groupTransform);
        }else if(items[i].ty == 'fl'){
            this.renderFill(items[i],num);
        }else if(items[i].ty == 'st'){
            this.renderStroke(items[i],num);
        }else if(items[i].ty == 'gr'){
            this.renderShape(num,groupTransform,items[i].it);
        }
    }
};

ShapeItemElement.prototype.renderPath = function(pathData,num,transform){
    if(!pathData.renderedFrames[num]){
        pathData.renderedFrames[num] = {
            d: pathData.renderedData[num].path.pathString,
            tr: 'matrix('+transform.mat.props.join(',')+')',
            o: transform.opacity
        };
    }
    var pathString = pathData.renderedFrames[num].d;
    var transformString = pathData.renderedFrames[num].tr;
    var opacity = pathData.renderedFrames[num].o;
    var elements = pathData.elements;
    var i, len = elements.length;
    for(i=0;i<len;i+=1){
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
    if(!ellipseData.renderedFrames[num]){
        ellipseData.renderedFrames[num] = {
            cx: ellipseAttrs.p[0],
            cy: ellipseAttrs.p[1],
            rx: ellipseAttrs.size[0]/2,
            ry: ellipseAttrs.size[1]/2,
            tr: 'matrix('+transform.mat.props.join(',')+')',
            o: transform.opacity
        };
    }
    var cx = ellipseData.renderedFrames[num].cx;
    var cy = ellipseData.renderedFrames[num].cy;
    var rx = ellipseData.renderedFrames[num].rx;
    var ry = ellipseData.renderedFrames[num].ry;
    var tr = ellipseData.renderedFrames[num].tr;
    var o = ellipseData.renderedFrames[num].o;

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
    if(!rectData.renderedFrames[num]){
        roundness = rectAttrs.roundness;

        if(roundness > rectAttrs.size[0]/2){
            roundness = rectAttrs.size[0]/2;
        }
        if(roundness > rectAttrs.size[1]/2){
            roundness = rectAttrs.size[1]/2;
        }
        rectData.renderedFrames[num] = {
            round: roundness,
            w: rectAttrs.size[0],
            h: rectAttrs.size[1],
            x: rectAttrs.position[0] - rectAttrs.size[0]/2,
            y: rectAttrs.position[1] - rectAttrs.size[1]/2,
            tr: 'matrix('+transform.mat.props.join(',')+')',
            o: transform.opacity
        };
    }
    roundness = rectData.renderedFrames[num].round;
    var w = rectData.renderedFrames[num].w;
    var h = rectData.renderedFrames[num].h;
    var x = rectData.renderedFrames[num].x;
    var y = rectData.renderedFrames[num].y;
    var tr = rectData.renderedFrames[num].tr;
    var o = rectData.renderedFrames[num].o;
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
    if(!styleData.renderedFrames[num]){
        styleData.renderedFrames[num] = {
            c: fillData.color,
            o: fillData.opacity
        }
    }

    var c = styleData.renderedFrames[num].c;
    var o = styleData.renderedFrames[num].o;

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
    var fillData = styleData.renderedData[num];
    var styleElem = styleData.style;
    if(!styleData.renderedFrames[num]){
        styleData.renderedFrames[num] = {
            c: fillData.color,
            o: fillData.opacity,
            w: fillData.width
        }
    }

    var c = styleData.renderedFrames[num].c;
    var o = styleData.renderedFrames[num].o;
    var w = styleData.renderedFrames[num].w;

    var elements = styleElem.elements;
    var i, len = elements.length;
    for(i=0;i<len;i+=1){
        if(styleData.lastData.c != c){
            elements[i].setAttribute('stroke',c);
        }
        if(styleData.lastData.o != o){
            elements[i].setAttribute('stroke-opacity',o);
        }
        if(styleData.lastData.o != o){
            elements[i].setAttribute('stroke-width',w);
        }
    }
    styleData.lastData.c = c;
    styleData.lastData.o = o;
    styleData.lastData.w = w;
};

ShapeItemElement.prototype.renderTransform = function(num){
    var animData = this.currentData;
    if(animData.tr){
        var tr = animData.tr;
        if(this.renderedFrame.tr.o !== tr.o){
            this.renderedFrame.tr.o = tr.o;
            this.shapeG.setAttribute('opacity',tr.o);
        }
        if(this.renderedFrame.tr.mt !== tr.mt){
            this.renderedFrame.tr.mt = tr.mt;
            this.shapeG.setAttribute('transform',tr.mt);
        }
        if(this.renderedFrame.tr.a[0] !== tr.a[0] || this.renderedFrame.tr.a[1] !== tr.a[1]){
            this.renderedFrame.tr.a[0] = tr.a[0];
            this.renderedFrame.tr.a[1] = tr.a[1];
            this.shape.setAttribute('transform', 'translate('+(-tr.a[0])+', '+(-tr.a[1])+')');
        }
    }
};

ShapeItemElement.prototype.adjustTrim = function(){
    var trimData = this.data.trim;
    var i, len = trimData.length;
    for(i=0;i<len;i+=1){
        if(trimData[i].o){
            trimData[i].o -= 90;
        }
    }
};

ShapeItemElement.prototype.renderTrim = function(num){
    var trimData = this.currentData.trim;
    if(this.pathLength === 0){
        this.shape.setAttribute('stroke-opacity',0);
    }else{
        if(this.renderedFrame.trim.e == trimData.e && this.renderedFrame.trim.s == trimData.s && this.renderedFrame.trim.o == trimData.o){
            //return;
        }
        this.renderedFrame.trim.e = trimData.e;
        this.renderedFrame.trim.s = trimData.s;
        this.renderedFrame.trim.o = trimData.o;

        var dashLength = this.pathLength*(trimData.e - trimData.s)/100;
        var dashSpace = this.pathLength - dashLength;
        var dashOffset = this.pathLength*(trimData.s)/100+(this.pathLength*(trimData.o))/360;
        var strokeDashArray = dashLength+" , "+dashSpace;
        this.shape.setAttribute('stroke-dasharray',strokeDashArray);
        this.shape.setAttribute('stroke-dashoffset',this.pathLength - dashOffset);
        if(trimData.e == trimData.s){
            this.shape.setAttribute('stroke-opacity',0);
        }else{
            if(this.currentData.stroke){
                if(this.data.strokeEnabled!==false){
                    this.shape.setAttribute('stroke-opacity',this.currentData.stroke.opacity);
                }else{
                    this.shape.setAttribute('stroke-opacity',0);
                }
            }
        }
    }
};