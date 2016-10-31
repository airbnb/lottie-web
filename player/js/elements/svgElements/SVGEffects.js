function SVGEffects(elem){
    var i, len = elem.data.ef.length;
    var fil = document.createElementNS(svgNS,'filter');
    var count = 0;
    this.filters = [];
    var filterManager;
    for(i=0;i<len;i+=1){
        if(elem.data.ef[i].ty === 20){
            count += 1;
            filterManager = new SVGTintFilter(fil, elem.effects.effectElements[i]);
            this.filters.push(filterManager);
        }else if(elem.data.ef[i].ty === 21){
            count += 1;
            filterManager = new SVGFillFilter(fil, elem.effects.effectElements[i]);
            this.filters.push(filterManager);
        }else if(elem.data.ef[i].ty === 22){
            filterManager = new SVGStrokeEffect(elem, elem.effects.effectElements[i]);
            this.filters.push(filterManager);
        }
    }
    if(count){
        var filId = randomString(10);
        fil.setAttribute('id',filId);
        fil.setAttribute('filterUnits','objectBoundingBox');
        fil.setAttribute('x','0%');
        fil.setAttribute('y','0%');
        fil.setAttribute('width','100%');
        fil.setAttribute('height','100%');
        elem.globalData.defs.appendChild(fil);
        elem.layerElement.setAttribute('filter','url(#'+filId+')');
    }
}

SVGEffects.prototype.renderFrame = function(firstFrame){
    var i, len = this.filters.length;
    for(i=0;i<len;i+=1){
        this.filters[i].renderFrame(firstFrame);
    }
};

function SVGTintFilter(filter, filterManager){
    this.filterManager = filterManager;
    var feColorMatrix = document.createElementNS(svgNS,'feColorMatrix');
    feColorMatrix.setAttribute('type','matrix');
    feColorMatrix.setAttribute('color-interpolation-filters','linearRGB');
    feColorMatrix.setAttribute('values','0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0');
    feColorMatrix.setAttribute('result','f1');
    filter.appendChild(feColorMatrix);
    feColorMatrix = document.createElementNS(svgNS,'feColorMatrix');
    feColorMatrix.setAttribute('type','matrix');
    feColorMatrix.setAttribute('color-interpolation-filters','sRGB');
    feColorMatrix.setAttribute('values','1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0');
    feColorMatrix.setAttribute('result','f2');
    filter.appendChild(feColorMatrix);
    this.matrixFilter = feColorMatrix;
    if(filterManager.effectElements[2].p.v !== 100 || filterManager.effectElements[2].p.k){
        var feMerge = document.createElementNS(svgNS,'feMerge');
        filter.appendChild(feMerge);
        var feMergeNode;
        feMergeNode = document.createElementNS(svgNS,'feMergeNode');
        feMergeNode.setAttribute('in','SourceGraphic');
        feMerge.appendChild(feMergeNode);
        feMergeNode = document.createElementNS(svgNS,'feMergeNode');
        feMergeNode.setAttribute('in','f2');
        feMerge.appendChild(feMergeNode);
    }
}

SVGTintFilter.prototype.renderFrame = function(forceRender){
    if(forceRender || this.filterManager.mdf){
        var colorBlack = this.filterManager.effectElements[0].p.v;
        var colorWhite = this.filterManager.effectElements[1].p.v;
        var opacity = this.filterManager.effectElements[2].p.v/100;
        this.matrixFilter.setAttribute('values',(colorWhite[0]- colorBlack[0])+' 0 0 0 '+ colorBlack[0] +' '+ (colorWhite[1]- colorBlack[1]) +' 0 0 0 '+ colorBlack[1] +' '+ (colorWhite[2]- colorBlack[2]) +' 0 0 0 '+ colorBlack[2] +' 0 0 0 ' + opacity + ' 0');
    }
};

function SVGFillFilter(filter, filterManager){
    this.filterManager = filterManager;
    var feColorMatrix = document.createElementNS(svgNS,'feColorMatrix');
    feColorMatrix.setAttribute('type','matrix');
    feColorMatrix.setAttribute('color-interpolation-filters','sRGB');
    feColorMatrix.setAttribute('values','1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0');
    filter.appendChild(feColorMatrix);
    this.matrixFilter = feColorMatrix;
}
SVGFillFilter.prototype.renderFrame = function(forceRender){
    if(forceRender || this.filterManager.mdf){
        var color = this.filterManager.effectElements[2].p.v;
        var opacity = this.filterManager.effectElements[6].p.v;
        this.matrixFilter.setAttribute('values','0 0 0 0 '+color[0]+' 0 0 0 0 '+color[1]+' 0 0 0 0 '+color[2]+' 0 0 0 '+opacity+' 0');
    }
};

function SVGStrokeEffect(elem, filterManager){
    this.initialized = false;
    this.filterManager = filterManager;
    this.elem = elem;
}

SVGStrokeEffect.prototype.initialize = function(){

    var elemChildren = this.elem.layerElement.children || this.elem.layerElement.childNodes;
    var mask = document.createElementNS(svgNS,'mask');
    var id = 'stms_' + randomString(10);
    mask.setAttribute('id',id);
    mask.setAttribute('mask-type','alpha');
    var path = document.createElementNS(svgNS,'path');
    path.setAttribute('fill','none');
    path.setAttribute('stroke-linecap','round');
    path.setAttribute('stroke-dashoffset',1);
    mask.appendChild(path);
    this.elem.globalData.defs.appendChild(mask);
    var g = document.createElementNS(svgNS,'g');
    g.setAttribute('mask','url(#'+id+')');
    g.appendChild(elemChildren[0]);
    this.elem.layerElement.appendChild(g);
    this.initialized = true;
    this.masker = mask;
    this.pathMasker = path;
    path.setAttribute('stroke','#fff');
}

SVGStrokeEffect.prototype.renderFrame = function(forceRender){
    if(!this.initialized){
        this.initialize();
    }
    var mask = this.elem.maskManager.viewData[Math.max(this.filterManager.effectElements[0].p.v,1) - 1];

    if(forceRender || this.filterManager.mdf || mask.prop.mdf){
        this.pathMasker.setAttribute('d',mask.lastPath);
    }
    if(forceRender || this.filterManager.effectElements[9].p.mdf || this.filterManager.effectElements[4].p.mdf || this.filterManager.effectElements[7].p.mdf || this.filterManager.effectElements[8].p.mdf || mask.prop.mdf){
        var dasharrayValue;
        if(this.filterManager.effectElements[7].p.v !== 0 || this.filterManager.effectElements[8].p.v !== 100){
            var s = Math.min(this.filterManager.effectElements[7].p.v,this.filterManager.effectElements[8].p.v)/100;
            var e = Math.max(this.filterManager.effectElements[7].p.v,this.filterManager.effectElements[8].p.v)/100;
            var l = this.pathMasker.getTotalLength();
            dasharrayValue = '0 0 0 ' + l*s + ' ';
            var lineLength = l*(e-s);
            var segment = 1+this.filterManager.effectElements[4].p.v*2*this.filterManager.effectElements[9].p.v/100;
            var units = Math.floor(lineLength/segment);
            var i;
            for(i=0;i<units;i+=1){
                dasharrayValue += '1 ' + this.filterManager.effectElements[4].p.v*2*this.filterManager.effectElements[9].p.v/100 + ' ';
            }
            dasharrayValue += '0 ' + l*10 + ' 0 0';
        } else {
            dasharrayValue = '1 ' + this.filterManager.effectElements[4].p.v*2*this.filterManager.effectElements[9].p.v/100;
        }
        this.pathMasker.setAttribute('stroke-width',this.filterManager.effectElements[4].p.v*2);
        this.pathMasker.setAttribute('stroke-dasharray',dasharrayValue);
    }
    if(forceRender || this.filterManager.effectElements[6].p.mdf){
        this.pathMasker.setAttribute('opacity',this.filterManager.effectElements[6].p.v);
    }
};