function ShapeItemElement(data){
    this.data = data;
    this.shapeG = document.createElementNS(svgNS, "g");
    this.pathLength = 0;
    this.cachedData = [];
    this.renderedFrame = {
        path: '',
        stroke: {},
        fill: {},
        tr: {
            a: []
        },
        trim:{},
        ellipse:{},
        rect:{}
    };
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
        this.shape.setAttribute('stroke-linecap','round');
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
    this.currentData = this.data.renderedData[num];
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
    var animData = this.currentData;
    var path = animData.path;

    if(path.pathString == this.renderedFrame.path){
        if(this.data.trim){
            return this.cachedData.pathLengths[path.pathString];
        }
        return;
    }
    this.renderedFrame.path = path.pathString;

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

    var ell = this.currentData.ell;

    if(this.renderedFrame.ellipse.rx != ell.size[0]){
        this.shape.setAttribute('rx',ell.size[0]/2);
        this.renderedFrame.ellipse.rx = ell.size[0];
    }
    if(this.renderedFrame.ellipse.ry != ell.size[1]){
        this.shape.setAttribute('ry',ell.size[1]/2);
        this.renderedFrame.ellipse.ry = ell.size[1];
    }
    if(this.renderedFrame.ellipse.cx != ell.p[0]){
        this.shape.setAttribute('cx',ell.p[0]);
        this.renderedFrame.ellipse.ry = ell.p[0];
    }
    if(this.renderedFrame.ellipse.cy != ell.p[1]){
        this.shape.setAttribute('cy',ell.p[1]);
        this.renderedFrame.ellipse.ry = ell.p[1];
    }
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
    var animData = this.currentData;
    if(animData.rect){
        var rect = animData.rect;

        if(this.renderedFrame.rect.rx != rect.roundness){
            this.shape.setAttribute('rx',rect.roundness);
            this.shape.setAttribute('ry',rect.roundness);
            this.renderedFrame.rect.rx = rect.roundness;
        }
        if(this.renderedFrame.rect.width != rect.size[0]){
            this.shape.setAttribute('width',rect.size[0]);
            this.renderedFrame.rect.width = rect.size[0];
        }
        if(this.renderedFrame.rect.height != rect.size[1]){
            this.shape.setAttribute('height',rect.size[1]);
            this.renderedFrame.rect.height = rect.size[1];
        }
        if(this.renderedFrame.rect.x != rect.position[0] - rect.size[0]){
            this.shape.setAttribute('x',rect.position[0] - rect.size[0]/2);
            this.renderedFrame.rect.x = rect.position[0] - rect.size[0];
        }
        if(this.renderedFrame.rect.y != rect.position[1] - rect.size[1]){
            this.shape.setAttribute('y',rect.position[1] - rect.size[1]/2);
            this.renderedFrame.rect.y = rect.position[1] - rect.size[1];
        }
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

ShapeItemElement.prototype.renderTrim = function(num){
    var trimData = this.currentData.trim;
    if(this.pathLength == 0){
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