function SVGProLevelsFilter(filter, filterManager){
    this.filterManager = filterManager;
    var effectElements = this.filterManager.effectElements;
    var feComponentTransfer = document.createElementNS(svgNS,'feComponentTransfer');
    var feFuncR, feFuncG, feFuncB;
    
    if(effectElements[9].p.k || effectElements[9].p.v !== 0 
        || effectElements[10].p.k || effectElements[10].p.v !== 1
        || effectElements[11].p.k || effectElements[11].p.v !== 1
        || effectElements[12].p.k || effectElements[12].p.v !== 0
        || effectElements[13].p.k || effectElements[13].p.v !== 1){
        feFuncR = document.createElementNS(svgNS,'feFuncR');
        feFuncR.setAttribute('type','table');
        feComponentTransfer.appendChild(feFuncR);
        this.feFuncR = feFuncR;
    }
    if(effectElements[16].p.k || effectElements[16].p.v !== 0 
        || effectElements[17].p.k || effectElements[17].p.v !== 1
        || effectElements[18].p.k || effectElements[18].p.v !== 1
        || effectElements[19].p.k || effectElements[19].p.v !== 0
        || effectElements[20].p.k || effectElements[20].p.v !== 1){
        feFuncG = document.createElementNS(svgNS,'feFuncG');
        feFuncG.setAttribute('type','table');
        feComponentTransfer.appendChild(feFuncG);
        this.feFuncG = feFuncG;
    }
    if(effectElements[23].p.k || effectElements[23].p.v !== 0 
        || effectElements[24].p.k || effectElements[24].p.v !== 1
        || effectElements[25].p.k || effectElements[25].p.v !== 1
        || effectElements[26].p.k || effectElements[26].p.v !== 0
        || effectElements[27].p.k || effectElements[27].p.v !== 1){
        var feFuncB = document.createElementNS(svgNS,'feFuncB');
        feFuncB.setAttribute('type','table');
        feComponentTransfer.appendChild(feFuncB);
        this.feFuncB = feFuncB;
    }
    if(effectElements[30].p.k || effectElements[30].p.v !== 0 
        || effectElements[31].p.k || effectElements[31].p.v !== 1
        || effectElements[32].p.k || effectElements[32].p.v !== 1
        || effectElements[33].p.k || effectElements[33].p.v !== 0
        || effectElements[34].p.k || effectElements[34].p.v !== 1){
        var feFuncA = document.createElementNS(svgNS,'feFuncA');
        feFuncA.setAttribute('type','table');
        feComponentTransfer.appendChild(feFuncA);
        this.feFuncA = feFuncA;
    }
    
    if(this.feFuncR || this.feFuncG || this.feFuncB || this.feFuncA){
        feComponentTransfer.setAttribute('color-interpolation-filters','sRGB');
        filter.appendChild(feComponentTransfer);
        feComponentTransfer = document.createElementNS(svgNS,'feComponentTransfer');
    }

    if(effectElements[2].p.k || effectElements[2].p.v !== 0 
        || effectElements[3].p.k || effectElements[3].p.v !== 1
        || effectElements[4].p.k || effectElements[4].p.v !== 1
        || effectElements[5].p.k || effectElements[5].p.v !== 0
        || effectElements[6].p.k || effectElements[6].p.v !== 1){

        feComponentTransfer.setAttribute('color-interpolation-filters','sRGB');
        filter.appendChild(feComponentTransfer);
        feFuncR = document.createElementNS(svgNS,'feFuncR');
        feFuncR.setAttribute('type','table');
        feComponentTransfer.appendChild(feFuncR);
        this.feFuncRComposed = feFuncR;
        feFuncG = document.createElementNS(svgNS,'feFuncG');
        feFuncG.setAttribute('type','table');
        feComponentTransfer.appendChild(feFuncG);
        this.feFuncGComposed = feFuncG;
        feFuncB = document.createElementNS(svgNS,'feFuncB');
        feFuncB.setAttribute('type','table');
        feComponentTransfer.appendChild(feFuncB);
        this.feFuncBComposed = feFuncB;
    }
}

SVGProLevelsFilter.prototype.createFeFunc = function(type, feComponentTransfoer) {
    var feFunc = document.createElementNS(svgNS,type);
    feFunc.setAttribute('type','table');
    feComponentTransfer.appendChild(feFunc);
    return feFunc;
}

SVGProLevelsFilter.prototype.getTableValue = function(redInputBlack, redInputWhite, gamma, redOutputBlack, redOutputWhite) {
    var cnt = 0;
    var val = redOutputBlack;
    if(gamma > 1){
        perc = (gamma - 1)/4;
        bezier = BezierFactory.getBezierEasing(0, perc, 1 - perc, 1);
    } else if(gamma < 1){
        perc = gamma/1;
        bezier = BezierFactory.getBezierEasing(1 - perc, 0, 1, perc);
    }
    var min = Math.min(redInputBlack, redInputWhite);
    var max = Math.max(redInputBlack, redInputWhite);
    while(cnt<1){
        perc = gamma === 1 ? cnt : bezier.get(cnt);
        if(perc <= min){
            val += ' '+redOutputBlack
        } else if(perc > min && perc < max){
            val += ' '+(redOutputBlack + (redOutputWhite - redOutputBlack)*((perc-redInputBlack)/(redInputWhite-redInputBlack)))
        }else {
            val += ' '+redOutputWhite
        }
        cnt += 1/255;
    }
    return val;
}

SVGProLevelsFilter.prototype.renderFrame = function(forceRender){
    if(forceRender || this.filterManager.mdf){
        var redInputBlack, redInputWhite, redOutputBlack, redOutputWhite;
        var val, cnt, perc, bezier;
        var effectElements = this.filterManager.effectElements;
        if(this.feFuncRComposed && (forceRender || effectElements[2].p.mdf || effectElements[3].p.mdf || effectElements[4].p.mdf || effectElements[5].p.mdf || effectElements[6].p.mdf)){
            val = this.getTableValue(effectElements[2].p.v,effectElements[3].p.v,effectElements[4].p.v,effectElements[5].p.v,effectElements[6].p.v)
            this.feFuncRComposed.setAttribute('tableValues',val)
            this.feFuncGComposed.setAttribute('tableValues',val)
            this.feFuncBComposed.setAttribute('tableValues',val)
        }

        if(this.feFuncR && (forceRender || effectElements[9].p.mdf || effectElements[10].p.mdf || effectElements[11].p.mdf || effectElements[12].p.mdf || effectElements[13].p.mdf)){
            val = this.getTableValue(effectElements[9].p.v,effectElements[10].p.v,effectElements[11].p.v,effectElements[12].p.v,effectElements[13].p.v)
            this.feFuncR.setAttribute('tableValues',val)
        }

        if(this.feFuncG && (forceRender || effectElements[16].p.mdf || effectElements[17].p.mdf || effectElements[18].p.mdf || effectElements[19].p.mdf || effectElements[20].p.mdf)){
            val = this.getTableValue(effectElements[16].p.v,effectElements[17].p.v,effectElements[18].p.v,effectElements[19].p.v,effectElements[20].p.v)
            this.feFuncG.setAttribute('tableValues',val)
        }

        if(this.feFuncB && (forceRender || effectElements[23].p.mdf || effectElements[24].p.mdf || effectElements[25].p.mdf || effectElements[26].p.mdf || effectElements[27].p.mdf)){
            val = this.getTableValue(effectElements[23].p.v,effectElements[24].p.v,effectElements[25].p.v,effectElements[26].p.v,effectElements[27].p.v)
            this.feFuncB.setAttribute('tableValues',val)
        }

        if(this.feFuncA && (forceRender || effectElements[30].p.mdf || effectElements[31].p.mdf || effectElements[32].p.mdf || effectElements[33].p.mdf || effectElements[34].p.mdf)){
            val = this.getTableValue(effectElements[30].p.v,effectElements[31].p.v,effectElements[32].p.v,effectElements[33].p.v,effectElements[34].p.v)
            this.feFuncA.setAttribute('tableValues',val)
        }
        
    }
};