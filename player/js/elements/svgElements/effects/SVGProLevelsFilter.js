function SVGProLevelsFilter(filter, filterManager){
    this.filterManager = filterManager;
    var effectElements = this.filterManager.effectElements;
    var feComponentTransfer = document.createElementNS(svgNS,'feComponentTransfer');
    var feFuncR, feFuncG, feFuncB;
    
    if(effectElements[9].p.k || effectElements[9].p.v !== 0 || effectElements[10].p.k || effectElements[10].p.v !== 1 || effectElements[11].p.k || effectElements[11].p.v !== 1 || effectElements[12].p.k || effectElements[12].p.v !== 0 || effectElements[13].p.k || effectElements[13].p.v !== 1){
        this.feFuncR = this.createFeFunc('feFuncR', feComponentTransfer);
    }
    if(effectElements[16].p.k || effectElements[16].p.v !== 0 || effectElements[17].p.k || effectElements[17].p.v !== 1 || effectElements[18].p.k || effectElements[18].p.v !== 1 || effectElements[19].p.k || effectElements[19].p.v !== 0 || effectElements[20].p.k || effectElements[20].p.v !== 1){
        this.feFuncG = this.createFeFunc('feFuncG', feComponentTransfer);
    }
    if(effectElements[23].p.k || effectElements[23].p.v !== 0 || effectElements[24].p.k || effectElements[24].p.v !== 1 || effectElements[25].p.k || effectElements[25].p.v !== 1 || effectElements[26].p.k || effectElements[26].p.v !== 0 || effectElements[27].p.k || effectElements[27].p.v !== 1){
        this.feFuncB = this.createFeFunc('feFuncB', feComponentTransfer);
    }
    if(effectElements[30].p.k || effectElements[30].p.v !== 0 || effectElements[31].p.k || effectElements[31].p.v !== 1 || effectElements[32].p.k || effectElements[32].p.v !== 1 || effectElements[33].p.k || effectElements[33].p.v !== 0 || effectElements[34].p.k || effectElements[34].p.v !== 1){
        this.feFuncA = this.createFeFunc('feFuncA', feComponentTransfer);
    }
    
    if(this.feFuncR || this.feFuncG || this.feFuncB || this.feFuncA){
        feComponentTransfer.setAttribute('color-interpolation-filters','sRGB');
        filter.appendChild(feComponentTransfer);
        feComponentTransfer = document.createElementNS(svgNS,'feComponentTransfer');
    }

    if(effectElements[2].p.k || effectElements[2].p.v !== 0 || effectElements[3].p.k || effectElements[3].p.v !== 1 || effectElements[4].p.k || effectElements[4].p.v !== 1 || effectElements[5].p.k || effectElements[5].p.v !== 0 || effectElements[6].p.k || effectElements[6].p.v !== 1){

        feComponentTransfer.setAttribute('color-interpolation-filters','sRGB');
        filter.appendChild(feComponentTransfer);
        this.feFuncRComposed = this.createFeFunc('feFuncR', feComponentTransfer);
        this.feFuncGComposed = this.createFeFunc('feFuncG', feComponentTransfer);
        this.feFuncBComposed = this.createFeFunc('feFuncB', feComponentTransfer);
    }
}

SVGProLevelsFilter.prototype.createFeFunc = function(type, feComponentTransfer) {
    var feFunc = document.createElementNS(svgNS,type);
    feFunc.setAttribute('type','table');
    feComponentTransfer.appendChild(feFunc);
    return feFunc;
};

SVGProLevelsFilter.prototype.getTableValue = function(inputBlack, inputWhite, gamma, outputBlack, outputWhite) {
    var cnt = 0;
    var segments = 256;
    var perc;
    var min = Math.min(inputBlack, inputWhite);
    var max = Math.max(inputBlack, inputWhite);
    var table = Array.call(null,{length:segments});
    var colorValue;
    var pos = 0;
    var outputDelta = outputWhite - outputBlack; 
    var inputDelta = inputWhite - inputBlack; 
    while(cnt <= 256) {
        perc = cnt/256;
        if(perc <= min){
            colorValue = inputDelta < 0 ? outputWhite : outputBlack;
        } else if(perc >= max){
            colorValue = inputDelta < 0 ? outputBlack : outputWhite;
        } else {
            colorValue = (outputBlack + outputDelta * Math.pow((perc - inputBlack) / inputDelta, 1 / gamma));
        }
        table[pos++] = colorValue;
        cnt += 256/(segments-1);
    }
    return table.join(' ');
};

SVGProLevelsFilter.prototype.renderFrame = function(forceRender){
    if(forceRender || this.filterManager.mdf){
        var val, cnt, perc, bezier;
        var effectElements = this.filterManager.effectElements;
        if(this.feFuncRComposed && (forceRender || effectElements[2].p.mdf || effectElements[3].p.mdf || effectElements[4].p.mdf || effectElements[5].p.mdf || effectElements[6].p.mdf)){
            val = this.getTableValue(effectElements[2].p.v,effectElements[3].p.v,effectElements[4].p.v,effectElements[5].p.v,effectElements[6].p.v);
            this.feFuncRComposed.setAttribute('tableValues',val);
            this.feFuncGComposed.setAttribute('tableValues',val);
            this.feFuncBComposed.setAttribute('tableValues',val);
        }

        if(this.feFuncR && (forceRender || effectElements[9].p.mdf || effectElements[10].p.mdf || effectElements[11].p.mdf || effectElements[12].p.mdf || effectElements[13].p.mdf)){
            val = this.getTableValue(effectElements[9].p.v,effectElements[10].p.v,effectElements[11].p.v,effectElements[12].p.v,effectElements[13].p.v);
            this.feFuncR.setAttribute('tableValues',val);
        }

        if(this.feFuncG && (forceRender || effectElements[16].p.mdf || effectElements[17].p.mdf || effectElements[18].p.mdf || effectElements[19].p.mdf || effectElements[20].p.mdf)){
            val = this.getTableValue(effectElements[16].p.v,effectElements[17].p.v,effectElements[18].p.v,effectElements[19].p.v,effectElements[20].p.v);
            this.feFuncG.setAttribute('tableValues',val);
        }

        if(this.feFuncB && (forceRender || effectElements[23].p.mdf || effectElements[24].p.mdf || effectElements[25].p.mdf || effectElements[26].p.mdf || effectElements[27].p.mdf)){
            val = this.getTableValue(effectElements[23].p.v,effectElements[24].p.v,effectElements[25].p.v,effectElements[26].p.v,effectElements[27].p.v);
            this.feFuncB.setAttribute('tableValues',val);
        }

        if(this.feFuncA && (forceRender || effectElements[30].p.mdf || effectElements[31].p.mdf || effectElements[32].p.mdf || effectElements[33].p.mdf || effectElements[34].p.mdf)){
            val = this.getTableValue(effectElements[30].p.v,effectElements[31].p.v,effectElements[32].p.v,effectElements[33].p.v,effectElements[34].p.v);
            this.feFuncA.setAttribute('tableValues',val);
        }
        
    }
};