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
            arr[i].matrix = new Matrix();
        }else if(arr[i].ty == 'sh'){
            arr[i].elements = [];
            jLen = this.stylesList.length;
            for(j=0;j<jLen;j+=1){
                if(!this.stylesList[j].closed){
                    pathNode = document.createElementNS(svgNS, "path");
                    arr[i].elements.push(pathNode);
                    this.shape.appendChild(pathNode);
                    this.stylesList[j].elements.push(pathNode);
                }
            }

        }else if(arr[i].ty == 'rc'){
            arr[i].elements = [];
            jLen = this.stylesList.length;
            for(j=0;j<jLen;j+=1){
                if(!this.stylesList[j].closed){
                    pathNode = document.createElementNS(svgNS, "rect");
                    arr[i].elements.push(pathNode);
                    this.shape.appendChild(pathNode);
                    this.stylesList[j].elements.push(pathNode);
                }
            }

        }else if(arr[i].ty == 'el'){
            arr[i].elements = [];
            jLen = this.stylesList.length;
            for(j=0;j<jLen;j+=1){
                if(!this.stylesList[j].closed){
                    pathNode = document.createElementNS(svgNS, "ellipse");
                    arr[i].elements.push(pathNode);
                    this.shape.appendChild(pathNode);
                    this.stylesList[j].elements.push(pathNode);
                }
            }

        }
    }
    len = ownArrays.length;
    for(i=0;i<len;i+=1){
        ownArrays[i].closed = true;
        console.log('ownArrays[i]: ',ownArrays[i]);
    }
};

ShapeItemElement.prototype.getElement = function(){
    return this.shape;
};

ShapeItemElement.prototype.renderShape = function(num,matrix,items){
    if(!items){
        items = this.data;
    }
    this.posCount = 0;
    this.frameNum = num;
    var i, len;
    var j, jLen;
    var styleElem;
    len = items.length - 1;
    var groupMatrix;
    for(i=len;i>=0;i-=1){
        if(items[i].ty == 'tr'){
            var props = matrix.props;
            var mtArr = items[i].renderedData[num].mtArr;
            groupMatrix = items[i].matrix;
            groupMatrix.reset().transform(props[0],props[1],props[2],props[3],props[4],props[5]).transform(mtArr[0],mtArr[1],mtArr[2],mtArr[3],mtArr[4],mtArr[5]).translate(-items[i].renderedData[num].a[0],-items[i].renderedData[num].a[1]);
        }else if(items[i].ty == 'sh'){
            this.renderPath(items[i],num,groupMatrix);
        }else if(items[i].ty == 'el'){
            this.renderEllipse(items[i],num,groupMatrix);
        }else if(items[i].ty == 'rc'){
            this.renderRect(items[i],num,groupMatrix);
        }else if(items[i].ty == 'fl'){
            styleElem = items[i].style;
            jLen = styleElem.elements.length;
            for(j=0;j<jLen;j+=1){
                styleElem.elements[j].setAttribute('fill',items[i].renderedData[num].color);
                styleElem.elements[j].setAttribute('fill-opacity',items[i].renderedData[num].opacity);
            }
        }else if(items[i].ty == 'st'){
            styleElem = items[i].style;
            jLen = styleElem.elements.length;
            for(j=0;j<jLen;j+=1){
                styleElem.elements[j].setAttribute('stroke-width',items[i].renderedData[num].width);
                styleElem.elements[j].setAttribute('stroke',items[i].renderedData[num].color);
                styleElem.elements[j].setAttribute('stroke-opacity',items[i].renderedData[num].opacity);
                styleElem.elements[j].setAttribute('fill-opacity',0);
            }
        }else if(items[i].ty == 'gr'){
            this.renderShape(num,this.currentMatrix,items[i].it);
        }
    }
};

ShapeItemElement.prototype.renderPath = function(pathData,num,matrix){
    if(!pathData.renderedFrames){
        pathData.renderedFrames = [];
    }
    var pathString = '';
    if(pathData.renderedFrames[num]){
        pathString = pathData.renderedFrames[num];
    }else{
        pathString = pathData.renderedData[num].path.pathString;
        pathData.renderedFrames[num] = pathString;
    }
    var elements = pathData.elements;
    var i, len = elements.length;
    for(i=0;i<len;i+=1){
        //this.stylesList[i].d += pathData.path.pathString;
        elements[i].setAttribute('d',pathString);
        elements[i].setAttribute('transform','matrix('+matrix.props.join(',')+')');
    }
};


ShapeItemElement.prototype.renderEllipse = function(ellipseData,num,matrix){
    // cx="40" cy="40" rx="30" ry="15"


    var elements = ellipseData.elements;
    var ellipseAttrs = ellipseData.renderedData[num];
    console.log(ellipseAttrs);
    var i, len = elements.length;
    for(i=0;i<len;i+=1){
        elements[i].setAttribute('cx',ellipseAttrs.p[0]);
        elements[i].setAttribute('cy',ellipseAttrs.p[1]);
        elements[i].setAttribute('rx',ellipseAttrs.size[0]/2);
        elements[i].setAttribute('ry',ellipseAttrs.size[1]/2);
        //elements[i].setAttribute('transform','matrix('+matrix.props.join(',')+')');
    }
};

ShapeItemElement.prototype.renderRect = function(rectData,num,matrix){
    var elements = rectData.elements;
    var ellipseAttrs = rectData.renderedData[num];
    var animData = this.currentData;
    var i, len = elements.length;
    for(i=0;i<len;i+=1){
        elements[i].setAttribute('rx',ellipseAttrs.roundness);
        elements[i].setAttribute('ry',ellipseAttrs.roundness);
        elements[i].setAttribute('width',ellipseAttrs.size[0]);
        elements[i].setAttribute('height',ellipseAttrs.size[1]);
        elements[i].setAttribute('x',ellipseAttrs.position[0] - ellipseAttrs.size[0]/2);
        elements[i].setAttribute('y',ellipseAttrs.position[1] - ellipseAttrs.size[1]/2);
        //elements[i].setAttribute('transform','matrix('+matrix.props.join(',')+')');
    }
};

ShapeItemElement.prototype.renderFill = function(num){
    var animData = this.currentData;
    if(animData.fill){
        var fill = animData.fill;
        if(this.renderedFrame.fill.color !== fill.color){
            this.shape.setAttribute('fill',fill.color);
            this.renderedFrame.fill.color = fill.color;
        }
        if(this.data.fillEnabled!==false){
            if(this.renderedFrame.fill.opacity !== fill.opacity){
                this.shape.setAttribute('fill-opacity',fill.opacity);
                this.renderedFrame.fill.opacity = fill.opacity;
            }
        }else{
            if(this.renderedFrame.fill.opacity !== 0){
                this.shape.setAttribute('fill-opacity',0);
                this.renderedFrame.fill.opacity = 0;
            }
        }
    }else{
        if(this.renderedFrame.fill.opacity !== 0){
            this.shape.setAttribute('fill-opacity',0);
            this.renderedFrame.fill.opacity = 0;
        }
    }
};

ShapeItemElement.prototype.renderStroke = function(num){
    var animData = this.currentData;
    if(animData.stroke){
        var stroke = animData.stroke;
        if(this.renderedFrame.stroke.color !== stroke.color){
            this.renderedFrame.stroke.color = stroke.color;
            this.shape.setAttribute('stroke',stroke.color);
        }
        if(this.renderedFrame.stroke.width !== stroke.width){
            this.renderedFrame.stroke.width = stroke.width;
            this.shape.setAttribute('stroke-width',stroke.width);
        }
        if(this.data.strokeEnabled!==false){
            if(this.renderedFrame.stroke.opacity !== stroke.opacity){
                this.renderedFrame.stroke.opacity = stroke.opacity;
                this.shape.setAttribute('stroke-opacity',stroke.opacity);
            }
        }else{
            if(this.renderedFrame.stroke.opacity !== 0){
                this.renderedFrame.stroke.opacity = 0;
                this.shape.setAttribute('stroke-opacity',0);
            }
        }
    }
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