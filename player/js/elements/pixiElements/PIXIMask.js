function PIXIMaskElement(data,element,globalData) {
    this.dynamicProperties = [];
    this.data = data;
    this.element = element;
    this.globalData = globalData;
    this.paths = [];
    this.storedData = [];
    this.masksProperties = this.data.masksProperties;
    this.viewData = new Array(this.masksProperties.length);
    this.maskElement = null;
    this.PMaskElement = null;
    this.firstFrame = true;
    var defs = this.globalData.defs;
    var i, len = this.masksProperties.length;


    var path,PPath, properties = this.masksProperties;
    var count = 0;
    var currentMasks = [],currentPMasks = [];
    var j, jLen;
    var layerId = randomString(10);
    var rect, expansor, feMorph,x;
    var maskType = 'clipPath', maskRef = 'clip-path';
    for (i = 0; i < len; i++) {

        if((properties[i].mode !== 'a' && properties[i].mode !== 'n')|| properties[i].inv){
            maskType = 'mask';
            maskRef = 'mask';
        }

        if((properties[i].mode == 's' || properties[i].mode == 'i') && count == 0){
            rect = document.createElementNS(svgNS, 'rect');
            rect.setAttribute('fill', '#ffffff');
            rect.setAttribute('width', this.element.comp.data ? this.element.comp.data.w : this.element.globalData.compSize.w);
            rect.setAttribute('height', this.element.comp.data ? this.element.comp.data.h : this.element.globalData.compSize.h);
            currentMasks.push(rect);
        } else {
            rect = null;
        }

        path = document.createElementNS(svgNS, 'path');
        PPath = new PIXI.Graphics;
        if(properties[i].mode == 'n' || properties[i].cl === false) {
            this.viewData[i] = {
                prop: ShapePropertyFactory.getShapeProp(this.element,properties[i],3,this.dynamicProperties,null),
                elem: path
            };
            defs.appendChild(path);
            continue;
        }
        count += 1;
        if (properties[i].cl) {
            if(properties[i].mode == 's'){
                path.setAttribute('fill', '#000000');
            }else{
                path.setAttribute('fill', '#ffffff');
            }
        } else {
            path.setAttribute('fill', 'none');
            if(properties[i].mode == 's'){
                path.setAttribute('fill', '#000000');
            }else{
                path.setAttribute('fill', '#ffffff');
            }
            path.setAttribute('stroke-width', '1');
            path.setAttribute('stroke-miterlimit', '10');
        }
        path.setAttribute('clip-rule','nonzero');

        if(properties[i].x.k !== 0){
            maskType = 'mask';
            maskRef = 'mask';
            x = PropertyFactory.getProp(this.element,properties[i].x,0,null,this.dynamicProperties);
            var filterID = 'fi_'+randomString(10);
            expansor = document.createElementNS(svgNS,'filter');
            expansor.setAttribute('id',filterID);
            feMorph = document.createElementNS(svgNS,'feMorphology');
            feMorph.setAttribute('operator','dilate');
            feMorph.setAttribute('in','SourceGraphic');
            feMorph.setAttribute('radius','0');
            expansor.appendChild(feMorph);
            defs.appendChild(expansor);
            if(properties[i].mode == 's'){
                path.setAttribute('stroke', '#000000');
            }else{
                path.setAttribute('stroke', '#ffffff');
            }
        }else{
            feMorph = null;
            x = null;
        }


        this.storedData[i] = {
             elem: path,
             PElem: PPath,
             x: x,
             expan: feMorph,
            lastPath: '',
            lastOperator:'',
            filterId:filterID,
            lastRadius:0
        };
        if(properties[i].mode == 'i'){
            jLen = currentMasks.length;
            var g = document.createElementNS(svgNS,'g');
            for(j=0;j<jLen;j+=1){
                g.appendChild(currentMasks[j]);
            }
            var mask = document.createElementNS(svgNS,'mask');
            mask.setAttribute('mask-type','alpha');
            mask.setAttribute('id',layerId+'_'+count);
            mask.appendChild(path);
            defs.appendChild(mask);
            g.setAttribute('mask','url(#'+layerId+'_'+count+')');

            currentMasks.length = 0;
            currentMasks.push(g);
        }else{
            currentMasks.push(path);
            currentPMasks.push(PPath);
        }
        if(properties[i].inv && !this.solidPath){
            this.solidPath = this.createLayerSolidPath();
        }
        this.viewData[i] = {
            elem: path,
            PElem: PPath,
            lastPath: '',
            prop:ShapePropertyFactory.getShapeProp(this.element,properties[i],3,this.dynamicProperties,null)
        };
        if(rect){
            this.viewData[i].invRect = rect;
        }
        if(!this.viewData[i].prop.k){
            this.drawPath(properties[i],this.viewData[i].prop.v,this.viewData[i]);
        }
    }

    this.maskElement = document.createElementNS(svgNS, maskType);
    this.PMaskElement = new PIXI.DisplayObjectContainer();

    len = currentMasks.length;
    for(i=0;i<len;i+=1){
        this.maskElement.appendChild(currentMasks[i]);
        //this.PMaskElement.addChild(currentPMasks[i]);
    }

    this.maskElement.setAttribute('id', layerId);
    if(count > 0){
        this.element.maskedElement.setAttribute(maskRef, "url(#" + layerId + ")");
        this.element.PMaskedElement.mask = currentPMasks[0];
        this.element.PMaskedElement.addChild(currentPMasks[0]);
    }

    defs.appendChild(this.maskElement);
};

PIXIMaskElement.prototype.getMaskProperty = function(pos){
    return this.viewData[pos].prop;
};

PIXIMaskElement.prototype.prepareFrame = function(){
    var i, len = this.dynamicProperties.length;
    for(i=0;i<len;i+=1){
        this.dynamicProperties[i].getValue();

    }
};

PIXIMaskElement.prototype.renderFrame = function (finalMat) {
    var i, len = this.masksProperties.length;
    for (i = 0; i < len; i++) {
        if(this.viewData[i].prop.mdf || this.firstFrame){
            this.drawPath(this.masksProperties[i],this.viewData[i].prop.v,this.viewData[i]);
        }
        if(this.masksProperties[i].mode !== 'n' && this.masksProperties[i].cl !== false){
            if(this.viewData[i].invRect && (this.element.finalTransform.mProp.mdf || this.firstFrame)){
                this.viewData[i].invRect.setAttribute('x', -finalMat.props[12]);
                this.viewData[i].invRect.setAttribute('y', -finalMat.props[13]);
            }
            if(this.storedData[i].x && (this.storedData[i].x.mdf || this.firstFrame)){
                var feMorph = this.storedData[i].expan;
                if(this.storedData[i].x.v < 0){
                    if(this.storedData[i].lastOperator !== 'erode'){
                        this.storedData[i].lastOperator = 'erode';
                        this.storedData[i].elem.setAttribute('filter','url(#'+this.storedData[i].filterId+')');
                    }
                    feMorph.setAttribute('radius',-this.storedData[i].x.v);
                }else{
                    if(this.storedData[i].lastOperator !== 'dilate'){
                        this.storedData[i].lastOperator = 'dilate';
                        this.storedData[i].elem.setAttribute('filter',null);
                    }
                    this.storedData[i].elem.setAttribute('stroke-width', this.storedData[i].x.v*2);

                }
            }
        }
    }
    this.firstFrame = false;
};

PIXIMaskElement.prototype.getMaskelement = function () {
    return this.maskElement;
};

PIXIMaskElement.prototype.createLayerSolidPath = function(){
    var path = 'M0,0 ';
    path += ' h' + this.globalData.compSize.w ;
    path += ' v' + this.globalData.compSize.h ;
    path += ' h-' + this.globalData.compSize.w ;
    path += ' v-' + this.globalData.compSize.h + ' ';
    return path;
};

PIXIMaskElement.prototype.drawPath = function(pathData,pathNodes,viewData){
    var pathString = '';
    var i, len;
    len = pathNodes.v.length;
    viewData.PElem.clear();
    viewData.PElem.beginFill(0xffffff);
    for(i=1;i<len;i+=1){
        if(i==1){
            //pathString += " M"+pathNodes.v[0][0]+','+pathNodes.v[0][1];
            pathString += " M"+bm_rnd(pathNodes.v[0][0])+','+bm_rnd(pathNodes.v[0][1]);
            viewData.PElem.moveTo(pathNodes.v[0][0],pathNodes.v[0][1]);
        }
        //pathString += " C"+pathNodes.o[i-1][0]+','+pathNodes.o[i-1][1] + " "+pathNodes.i[i][0]+','+pathNodes.i[i][1] + " "+pathNodes.v[i][0]+','+pathNodes.v[i][1];
        pathString += " C"+bm_rnd(pathNodes.o[i-1][0])+','+bm_rnd(pathNodes.o[i-1][1]) + " "+bm_rnd(pathNodes.i[i][0])+','+bm_rnd(pathNodes.i[i][1]) + " "+bm_rnd(pathNodes.v[i][0])+','+bm_rnd(pathNodes.v[i][1]);
        viewData.PElem.bezierCurveTo(pathNodes.o[i-1][0],pathNodes.o[i-1][1],pathNodes.i[i][0],pathNodes.i[i][1],pathNodes.v[i][0],pathNodes.v[i][1]);
    }
    if(pathData.cl){
        //pathString += " C"+pathNodes.o[i-1][0]+','+pathNodes.o[i-1][1] + " "+pathNodes.i[0][0]+','+pathNodes.i[0][1] + " "+pathNodes.v[0][0]+','+pathNodes.v[0][1];
        pathString += " C"+bm_rnd(pathNodes.o[i-1][0])+','+bm_rnd(pathNodes.o[i-1][1]) + " "+bm_rnd(pathNodes.i[0][0])+','+bm_rnd(pathNodes.i[0][1]) + " "+bm_rnd(pathNodes.v[0][0])+','+bm_rnd(pathNodes.v[0][1]);
        viewData.PElem.bezierCurveTo(pathNodes.o[i-1][0],pathNodes.o[i-1][1],pathNodes.i[0][0],pathNodes.i[0][1],pathNodes.v[0][0],pathNodes.v[0][1]);
    }
    viewData.PElem.endFill();
    //pathNodes.__renderedString = pathString;


    if(viewData.lastPath !== pathString){
        if(viewData.elem){
            if(pathData.inv){
                viewData.elem.setAttribute('d',this.solidPath + pathString);
            }else{
                viewData.elem.setAttribute('d',pathString);
            }
        }
        viewData.lastPath = pathString;
    }
};

PIXIMaskElement.prototype.getMask = function(nm){
    var i = 0, len = this.masksProperties.length;
    while(i<len){
        if(this.masksProperties[i].nm === nm){
            return {
                maskPath: this.viewData[i].prop.pv
            }
        }
        i += 1;
    }
};

PIXIMaskElement.prototype.destroy = function(){
    this.element = null;
    this.globalData = null;
    this.maskElement = null;
    this.data = null;
    this.paths = null;
    this.masksProperties = null;
};