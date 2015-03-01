function ShapeItemElement(data){
    this.data = data;
    this.shapeG = document.createElementNS(svgNS, "g");
    this.pathLength = 0;
    this.cachedData = [];
    if(this.data.type === 'pathShape'){
        this.shape = document.createElementNS(svgNS, "path");
    }else if(this.data.type === 'rectShape'){
        this.shape = document.createElementNS(svgNS, "rect");
    }else if(this.data.type === 'ellipseShape'){
        this.shape = document.createElementNS(svgNS, "ellipse");
        if(this.data.trim){
            this.adjustTrim();
        }
    }else{
        this.shape = document.createElementNS(svgNS, "path");
    }
    if(this.data.trim){
        this.shape.setAttribute('stroke-linecap','butt');
    }else{
        this.shape.setAttribute('stroke-linejoin','round');
        this.shape.setAttribute('stroke-linecap','round');
    }
    if(!this.data.renderedData){
        this.data.renderedData = {};
    }
    this.shape.setAttribute('name',this.data.name);
    styleUnselectableDiv(this.shapeG);
    styleUnselectableDiv(this.shape);
    this.shapeG.appendChild(this.shape);
}

ShapeItemElement.prototype.adjustTrim = function(){
    var trimData = this.data.trim;
    var i, len = trimData.length;
    for(i=0;i<len;i+=1){
        if(trimData[i].o){
            trimData[i].o -= 90;
        }
    }
};

ShapeItemElement.prototype.getElement = function(){
    return this.shapeG;
};

ShapeItemElement.prototype.renderShape = function(num){
    if(this.data.type=="pathShape"){
        this.pathLength = this.renderPath(num);
    }else if(this.data.type=="rectShape"){
        this.renderRect(num);
    }else if(this.data.type=="ellipseShape"){
        this.pathLength = this.renderEllipse(num);
    }
    if(this.data.trim){
        this.renderTrim(num);
    }
    this.renderFill(num);
    this.renderStroke(num);
    this.renderTransform(num);
};

ShapeItemElement.prototype.renderPath = function(num){
    var animData = this.data.an;
    if(!animData.path[num]){
        console.log('num: ',num);
        console.log('animData.path: ',animData.path);
    }
    if(animData.path[num].forwardFrame == animData.renderedFrame.path){
        if(this.data.trim){
            return this.cachedData.pathLengths[animData.path[animData.path[num].forwardFrame].pathString];
        }
        return;
    }
    var path = animData.path[animData.path[num].forwardFrame];
    animData.renderedFrame.path = path.forwardFrame;

    this.shape.setAttribute('d',path.pathString);
    if(this.data.trim){
        if(this.cachedData.pathLengths == null){
            this.cachedData.pathLengths = {};
        }
        if(this.cachedData.pathLengths[path.pathString] == null){
            this.cachedData.pathLengths[path.pathString] = this.shape.getTotalLength();
        }
        return this.cachedData.pathLengths[path.pathString];
    }
};

ShapeItemElement.prototype.renderEllipse = function(num){
    var animData = this.data.an;
    if(animData.ell[num].forwardFrame == animData.renderedFrame.ell){
        if(this.data.trim){
            return this.cachedData.pathLengths['ellipse_'+animData.ell[num].forwardFrame];
        }
        return 0;
    }
    var ell = animData.ell[animData.ell[num].forwardFrame];
    animData.renderedFrame.ell = ell.forwardFrame;

    this.shape.setAttribute('rx',ell.size[0]/2);
    this.shape.setAttribute('ry',ell.size[1]/2);
    this.shape.setAttribute('cx',ell.p[0]);
    this.shape.setAttribute('cy',ell.p[1]);
    if(this.data.trim){
        if(this.cachedData.pathLengths == null){
            this.cachedData.pathLengths = {};
        }
        if(this.cachedData.pathLengths['ellipse_'+num] == null){
            if(ell.size[0] == ell.size[1]){
                this.cachedData.pathLengths['ellipse_'+num] = Math.PI*ell.size[0];
            }else{
                var major = Math.max(ell.size[0],ell.size[1])/2;
                var minor = Math.max(ell.size[0],ell.size[1])/2;
                var h = (major-minor)/(major+minor);
                var perim = (major+minor)*Math.PI*(1+(1/4)*h+(1/64)*Math.pow(h,2)+(1/256)*Math.pow(h,3));
                this.cachedData.pathLengths['ellipse_'+num] = perim;
            }
        }
        return this.cachedData.pathLengths['ellipse_'+num];
    }
};

ShapeItemElement.prototype.renderRect = function(num){
    var animData = this.data.an;
    if(animData.rect[num].forwardFrame == animData.renderedFrame.rect){
        return;
    }
    var rect = animData.rect[animData.rect[num].forwardFrame];
    animData.renderedFrame.rect = rect.forwardFrame;

    this.shape.setAttribute('width',rect.size[0]);
    this.shape.setAttribute('height',rect.size[1]);
    this.shape.setAttribute('rx',rect.roundness);
    this.shape.setAttribute('ry',rect.roundness);
    this.shape.setAttribute('x',(rect.position[0] - rect.size[0]/2));
    this.shape.setAttribute('y',(rect.position[1] - rect.size[1]/2));
};

ShapeItemElement.prototype.renderFill = function(num){
    var animData = this.data.an;
    if(animData.fill){
        if(animData.fill[num].forwardFrame == animData.renderedFrame.fill){
            return;
        }
        var fill = animData.fill[animData.fill[num].forwardFrame];
        animData.renderedFrame.fill = fill.forwardFrame;
        this.shape.setAttribute('fill',fill.color);
        if(this.data.fillEnabled!==false){
            this.shape.setAttribute('fill-opacity',fill.opacity);
        }else{
            this.shape.setAttribute('fill-opacity',0);
        }
    }else{
        this.shape.setAttribute('fill-opacity',0);
    }
};

ShapeItemElement.prototype.renderStroke = function(num){
    var animData = this.data.an;
    if(animData.stroke){
        if(animData.stroke[num].forwardFrame == animData.renderedFrame.stroke){
            return;
        }
        var stroke = animData.stroke[animData.stroke[num].forwardFrame];
        animData.renderedFrame.stroke = stroke.forwardFrame;
        this.shape.setAttribute('stroke',stroke.color);
        this.shape.setAttribute('stroke-width',stroke.width);
        if(this.data.strokeEnabled!==false){
            this.shape.setAttribute('stroke-opacity',stroke.opacity);
        }else{
            this.shape.setAttribute('stroke-opacity',0);
        }
    }
};

ShapeItemElement.prototype.renderTransform = function(num){
    var animData = this.data.an;
    if(animData.tr){
        if(animData.tr[num].forwardFrame == animData.renderedFrame.tr){
            return;
        }
        var tr = animData.tr[animData.tr[num].forwardFrame];
        animData.renderedFrame.tr = tr.forwardFrame;
        var matrixValue = tr.mt;

        this.shapeG.setAttribute('transform',matrixValue);//**//
        this.shape.setAttribute('transform', 'translate('+(-tr.a[0])+', '+(-tr.a[1])+')');//**//
    }
};

ShapeItemElement.prototype.renderTrim = function(num){
    if(this.data.trim.an[num].forwardFrame == this.data.renderedData.trim){
        return;
    }
    var trimData = this.data.trim.an[this.data.trim.an[num].forwardFrame];
    this.data.renderedData.trim = trimData.forwardFrame;
    if(this.pathLength == 0){
        this.shape.setAttribute('stroke-opacity',0);
    }else{
        var dashLength = this.pathLength*(trimData.e - trimData.s)/100;
        var dashSpace = this.pathLength - dashLength;
        var dashOffset = this.pathLength*(trimData.s)/100+(this.pathLength*(trimData.o))/360;
        var strokeDashArray = dashLength+" , "+dashSpace;
        this.shape.setAttribute('stroke-dasharray',strokeDashArray);
        this.shape.setAttribute('stroke-dashoffset',-dashOffset);
        if(trimData.e == trimData.s){
            this.shape.setAttribute('stroke-opacity',0);
        }else{
            if(this.data.an.stroke){
                var stroke = this.data.an.stroke[this.data.an.stroke[num].forwardFrame];
                if(this.data.strokeEnabled!==false){
                    this.shape.setAttribute('stroke-opacity',stroke.opacity/100);
                }else{
                    this.shape.setAttribute('stroke-opacity',0);
                }
            }
        }
    }
};