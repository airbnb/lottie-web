function SVGEffects(elem){
    var i, len = elem.data.ef.length;
    var fil = document.createElementNS(svgNS,'filter');
    var count = 0;
    this.filters = [];
    this.firstFrame = true;
    var filterManager;
    for(i=0;i<len;i+=1){
        if(elem.data.ef[i].ty === 20){
            count += 1;
            filterManager = new SVGTintFilter(fil, elem.effects.effectElements[i]);
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

SVGEffects.prototype.renderFrame = function(){
    var i, len = this.filters.length;
    for(i=0;i<len;i+=1){
        this.filters[i].renderFrame(this.firstFrame);
    }
    this.firstFrame = false;
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
        /*feMergeNode = document.createElementNS(svgNS,'feMergeNode');
        feMergeNode.setAttribute('in','f1');
        feMerge.appendChild(feMergeNode);*/
        feMergeNode = document.createElementNS(svgNS,'feMergeNode');
        feMergeNode.setAttribute('in','f2');
        feMerge.appendChild(feMergeNode);
    }
}

SVGTintFilter.prototype.renderFrame = function(forceRender){
    if(forceRender || this.filterManager.mdf){
        var colorBlack = this.filterManager.effectElements[0].p.v;
        var colorWhite = this.filterManager.effectElements[1].p.v;
        this.matrixFilter.setAttribute('values',(colorWhite[0]- colorBlack[0])+' 0 0 0 '+ colorBlack[0] +' '+ (colorWhite[1]- colorBlack[1]) +' 0 0 0 '+ colorBlack[1] +' '+ (colorWhite[2]- colorBlack[2]) +' 0 0 0 '+ colorBlack[2] +' 0 0 0 ' + this.filterManager.effectElements[2].p.v/100 + ' 0');
    }
}