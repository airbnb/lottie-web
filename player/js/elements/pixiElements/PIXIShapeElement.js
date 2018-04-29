function PIXIShapeElement(data, globalData, comp){
    this.shapes = [];
    this.shapesData = data.shapes;
    this.stylesList = [];
    this.itemsData = [];
    this.prevViewData = [];
    this.animatedContents = [];
    this.shapeModifiers = [];
    this.processedElements = [];
    this.initElement(data, globalData, comp);
}
extendPrototype([BaseElement,TransformElement,PIXIBaseElement,IShapeElement,HierarchyElement,FrameElement,RenderableElement], PIXIShapeElement);

PIXIShapeElement.prototype.lcEnum = {
    '1': 'butt',
    '2': 'round',
    '3': 'butt'
}

PIXIShapeElement.prototype.ljEnum = {
    '1': 'miter',
    '2': 'round',
    '3': 'butt'
}

PIXIShapeElement.prototype.initElement = function(data,globalData,comp) {
    this.initFrame();
    this.initBaseData(data, globalData, comp);
    this.initTransform(data, globalData, comp);
    this.initHierarchy();
    this.initRenderable();
    this.initRendererElement();
    this.createContainerElements();
    this.addMasks();
    this.createContent();
    this.hide();
}

PIXIShapeElement.prototype.initSecondaryElement = function() {
};

PIXIShapeElement.prototype.identityMatrix = new Matrix();

PIXIShapeElement.prototype.buildExpressionInterface = function(){};

PIXIShapeElement.prototype.createContent = function(){
    this.searchShapes(this.shapesData,this.itemsData,this.prevViewData,this.PLayerElement, 0, [], true);
    this.filterUniqueShapes();
};

/*
This method searches for multiple shapes that affect a single element and one of them is animated
*/
PIXIShapeElement.prototype.filterUniqueShapes = function(){
    var i, len = this.shapes.length, shape;
    var j, jLen = this.stylesList.length;
    var style, count = 0;
    var tempShapes = [];
    var areAnimated = false;
    for(j = 0; j < jLen; j += 1) {
        style = this.stylesList[j];
        areAnimated = false;
        tempShapes.length = 0;
        for(i = 0; i < len; i += 1) {
            shape = this.shapes[i];
            if(shape.styles.indexOf(style) !== -1) {
                tempShapes.push(shape);
                areAnimated = shape._isAnimated || areAnimated;
            }
        }
        if(tempShapes.length > 1 && areAnimated) {
            this.setShapesAsAnimated(tempShapes);
        }
    }
}

PIXIShapeElement.prototype.setShapesAsAnimated = function(shapes){
    var i, len = shapes.length;
    for(i = 0; i < len; i += 1) {
        shapes[i].setAsAnimated();
    }
}

PIXIShapeElement.prototype.createStyleElement = function(data, level){
    //TODO: prevent drawing of hidden styles
    var elementData;
    var styleOb = new SVGStyleData(data, level);

    var pathElement = styleOb.pElem;
    if(data.ty === 'st') {
        elementData = new SVGStrokeStyleData(this, data, styleOb);
    } else if(data.ty === 'fl') {
        elementData = new SVGFillStyleData(this, data, styleOb);
    } else if(data.ty === 'gf' || data.ty === 'gs') {
        var gradientConstructor = data.ty === 'gf' ? SVGGradientFillStyleData : SVGGradientStrokeStyleData;
        elementData = new gradientConstructor(this, data, styleOb);
        this.globalData.defs.appendChild(elementData.gf);
        if (elementData.maskId) {
            this.globalData.defs.appendChild(elementData.ms);
            this.globalData.defs.appendChild(elementData.of);
            pathElement.setAttribute('mask','url(#' + elementData.maskId + ')');
        }
    }
    
    if(data.ty === 'st' || data.ty === 'gs') {
        pathElement.setAttribute('stroke-linecap', this.lcEnum[data.lc] || 'round');
        pathElement.setAttribute('stroke-linejoin',this.ljEnum[data.lj] || 'round');
        pathElement.setAttribute('fill-opacity','0');
        if(data.lj === 1) {
            pathElement.setAttribute('stroke-miterlimit',data.ml);
        }
    }

    if(data.r === 2) {
        pathElement.setAttribute('fill-rule', 'evenodd');
    }

    this.stylesList.push(styleOb);
    this.addToAnimatedContents(data, elementData);
    return elementData;
};

PIXIShapeElement.prototype.createGroupElement = function(data) {
    var elementData = {
        it: [],
        prevViewData: [],
        gr: new PIXI.DisplayObjectContainer()
    }
    return elementData;
};

PIXIShapeElement.prototype.createTransformElement = function(data, container) {
    var transformProperty = TransformPropertyFactory.getTransformProperty(this,data,this);
    var elementData = new SVGTransformData(transformProperty, transformProperty.o, container);
    this.addToAnimatedContents(data, elementData);
    return elementData;
};

PIXIShapeElement.prototype.createShapeElement = function(data, ownTransformers, level) {
    var ty = 4;
    if(data.ty === 'rc'){
        ty = 5;
    }else if(data.ty === 'el'){
        ty = 6;
    }else if(data.ty === 'sr'){
        ty = 7;
    }
    var shapeProperty = ShapePropertyFactory.getShapeProp(this,data,ty,this);
    var elementData = new SVGShapeData(ownTransformers, level, shapeProperty);
    this.shapes.push(elementData);
    this.addShapeToModifiers(elementData);
    this.addToAnimatedContents(data, elementData);
    return elementData;
};

PIXIShapeElement.prototype.addToAnimatedContents = function(data, element) {
    var i = 0, len = this.animatedContents.length;
    while(i < len) {
        if(this.animatedContents[i].element === element) {
            return;
        }
        i += 1;
    }
    this.animatedContents.push({
        fn: PIXIElementsRenderer.createRenderFunction(data),
        element: element,
        data: data
    });
};

PIXIShapeElement.prototype.setElementStyles = function(elementData){
    var arr = elementData.styles;
    var j, jLen = this.stylesList.length;
    for (j = 0; j < jLen; j += 1) {
        if (!this.stylesList[j].closed) {
            arr.push(this.stylesList[j]);
        }
    }
};

PIXIShapeElement.prototype.reloadShapes = function(){
    this._isFirstFrame = true;
    var i, len = this.itemsData.length;
    for( i = 0; i < len; i += 1) {
        this.prevViewData[i] = this.itemsData[i];
    }
    this.searchShapes(this.shapesData,this.itemsData,this.prevViewData,this.layerElement, 0, [], true);
    this.filterUniqueShapes();
    len = this.dynamicProperties.length;
    for(i = 0; i < len; i += 1) {
        this.dynamicProperties[i].getValue();
    }
    this.renderModifiers();
};

PIXIShapeElement.prototype.searchShapes = function(arr,itemsData,prevViewData,container, level, transformers, render){
    var ownTransformers = [].concat(transformers);
    var i, len = arr.length - 1;
    var j, jLen;
    var ownStyles = [], ownModifiers = [], styleOb, currentTransform, modifier, processedPos;
    for(i=len;i>=0;i-=1){
        processedPos = this.searchProcessedElement(arr[i]);
        if(!processedPos){
            arr[i]._render = render;
        } else {
            itemsData[i] = prevViewData[processedPos - 1];
        }
        if(arr[i].ty == 'fl' || arr[i].ty == 'st' || arr[i].ty == 'gf' || arr[i].ty == 'gs'){
            if(!processedPos){
                itemsData[i] = this.createStyleElement(arr[i], level);
            } else {
                itemsData[i].style.closed = false;
            }
            if(arr[i]._render){
                container.addChild(itemsData[i].style.PpElem);
            }
            ownStyles.push(itemsData[i].style);
        }else if(arr[i].ty == 'gr'){
            if(!processedPos){
                itemsData[i] = this.createGroupElement(arr[i]);
            } else {
                jLen = itemsData[i].it.length;
                for(j=0;j<jLen;j+=1){
                    itemsData[i].prevViewData[j] = itemsData[i].it[j];
                }
            }
            this.searchShapes(arr[i].it,itemsData[i].it,itemsData[i].prevViewData,itemsData[i].gr, level + 1, ownTransformers, render);
            if(arr[i]._render){
                container.addChild(itemsData[i].gr);
            }
        }else if(arr[i].ty == 'tr'){
            if(!processedPos){
                itemsData[i] = this.createTransformElement(arr[i], container);
            }
            currentTransform = itemsData[i].transform;
            ownTransformers.push(currentTransform);
        }else if(arr[i].ty == 'sh' || arr[i].ty == 'rc' || arr[i].ty == 'el' || arr[i].ty == 'sr'){
            if(!processedPos){
                itemsData[i] = this.createShapeElement(arr[i], ownTransformers, level);
            }
            this.setElementStyles(itemsData[i]);

        }else if(arr[i].ty == 'tm' || arr[i].ty == 'rd' || arr[i].ty == 'ms'){
            if(!processedPos){
                modifier = ShapeModifiers.getModifier(arr[i].ty);
                modifier.init(this,arr[i]);
                itemsData[i] = modifier;
                this.shapeModifiers.push(modifier);
            } else {
                modifier = itemsData[i];
                modifier.closed = false;
            }
            ownModifiers.push(modifier);
        }else if(arr[i].ty == 'rp'){
            if(!processedPos){
                modifier = ShapeModifiers.getModifier(arr[i].ty);
                itemsData[i] = modifier;
                modifier.init(this,arr,i,itemsData);
                this.shapeModifiers.push(modifier);
                render = false;
            }else{
                modifier = itemsData[i];
                modifier.closed = true;
            }
            ownModifiers.push(modifier);
        }
        this.addProcessedElement(arr[i], i + 1);
    }
    len = ownStyles.length;
    for(i=0;i<len;i+=1){
        ownStyles[i].closed = true;
    }
    len = ownModifiers.length;
    for(i=0;i<len;i+=1){
        ownModifiers[i].closed = true;
    }
};

PIXIShapeElement.prototype.drawShapeCommands = function(styleData) {
    var shapeCommands = styleData.PD, PIXIElem = styleData.PpElem;
    PIXIElem.clear();
    if(styleData._styleType === 'fill') {
        PIXIElem.beginFill(styleData._styleColor);
    } else if(styleData._styleType === 'stroke') {
        PIXIElem.lineStyle(styleData._styleWidth,styleData._styleColor);
    }
    var i, len = shapeCommands.length;
    for(i = 0; i < len; i += 1) {
        if(shapeCommands[i].t === 'm'){
            PIXIElem.moveTo(shapeCommands[i].c[0],shapeCommands[i].c[1]);
        } else {
            PIXIElem.bezierCurveTo(shapeCommands[i].c[0],shapeCommands[i].c[1],shapeCommands[i].c[3],shapeCommands[i].c[4],shapeCommands[i].c[6],shapeCommands[i].c[7]);
        }
    }
    if(styleData._styleType === 'fill') {
        PIXIElem.endFill();
    } else if(styleData._styleType === 'stroke') {
        //TODO: search iff stroke needs to be ended
    }
}

PIXIShapeElement.prototype.renderInnerContent = function() {
    this.renderModifiers();
    var i, len = this.stylesList.length;
    for(i=0;i<len;i+=1){
        this.stylesList[i].reset();
    }
    this.renderShape();

    for (i = 0; i < len; i += 1) {
        if (this.stylesList[i]._mdf || this._isFirstFrame) {
            if(this.stylesList[i].msElem){
                this.stylesList[i].msElem.setAttribute('d', this.stylesList[i].d);
                //Adding M0 0 fixes same mask bug on all browsers
                this.stylesList[i].d = 'M0 0' + this.stylesList[i].d;
            }
            this.drawShapeCommands(this.stylesList[i]);
            this.stylesList[i].pElem.setAttribute('d', this.stylesList[i].d || 'M0 0');
        }
    }
};

PIXIShapeElement.prototype.renderShape = function() {
    var i, len = this.animatedContents.length;
    var animatedContent;
    for(i = 0; i < len; i += 1) {
        animatedContent = this.animatedContents[i];
        if(this._isFirstFrame || animatedContent.element._isAnimated) {
            animatedContent.fn(animatedContent.data, animatedContent.element, this._isFirstFrame);
        }
    }
}

PIXIShapeElement.prototype.destroy = function(){
    this.destroyBaseElement();
    this.shapeData = null;
    this.itemsData = null;
};






PIXIShapeElement.prototype.searchShapess = function(arr,itemsData,prevViewData,container, level, transformers, render){
    var i, len = arr.length - 1;
    var j, jLen;
    var ownArrays = [], ownModifiers = [], styleOb, currentTransform;
    for(i=len;i>=0;i-=1){
        if(arr[i].ty == 'fl' || arr[i].ty == 'st' || arr[i].ty == 'gf' || arr[i].ty == 'gs'){
            data[i] = {};
            styleOb = {
                type: arr[i].ty,
                d: '',
                PD:[],
                ld: '',
                lvl: level,
                transformers:[],
                mdf: false
            };
            var pathElement = document.createElementNS(svgNS, "path");
            var PPathElement =  new PIXI.Graphics();

            data[i].o = PropertyFactory.getProp(this,arr[i].o,0,0.01,dynamicProperties);
            if(arr[i].ty == 'st' || arr[i].ty == 'gs') {
                pathElement.setAttribute('stroke-linecap', this.lcEnum[arr[i].lc] || 'round');
                ////pathElement.style.strokeLinecap = this.lcEnum[arr[i].lc] || 'round';
                pathElement.setAttribute('stroke-linejoin',this.ljEnum[arr[i].lj] || 'round');
                ////pathElement.style.strokeLinejoin = this.ljEnum[arr[i].lj] || 'round';
                pathElement.setAttribute('fill-opacity','0');
                ////pathElement.style.fillOpacity = 0;
                if(arr[i].lj == 1) {
                    pathElement.setAttribute('stroke-miterlimit',arr[i].ml);
                    ////pathElement.style.strokeMiterlimit = arr[i].ml;
                }

                data[i].w = PropertyFactory.getProp(this,arr[i].w,0,null,dynamicProperties);
                if(arr[i].d){
                    var d = PropertyFactory.getDashProp(this,arr[i].d,'svg',dynamicProperties);
                    if(!d.k){
                        pathElement.setAttribute('stroke-dasharray', d.dasharray);
                        ////pathElement.style.strokeDasharray = d.dasharray;
                        pathElement.setAttribute('stroke-dashoffset', d.dashoffset);
                        ////pathElement.style.strokeDashoffset = d.dashoffset;
                    }
                    data[i].d = d;
                }

            }
            if(arr[i].ty == 'fl' || arr[i].ty == 'st'){
                data[i].c = PropertyFactory.getProp(this,arr[i].c,1,255,dynamicProperties);
                container.appendChild(pathElement);
                PContainer.addChild(PPathElement);
            } else {
                data[i].g = PropertyFactory.getGradientProp(this,arr[i].g,dynamicProperties);
                if(arr[i].t == 2){
                    data[i].h = PropertyFactory.getProp(this,arr[i].h,1,0.01,dynamicProperties);
                    data[i].a = PropertyFactory.getProp(this,arr[i].a,1,degToRads,dynamicProperties);
                }
                data[i].s = PropertyFactory.getProp(this,arr[i].s,1,null,dynamicProperties);
                data[i].e = PropertyFactory.getProp(this,arr[i].e,1,null,dynamicProperties);
                this.setGradientData(pathElement,arr[i],data[i], styleOb);
                var maskId = this.setGradientOpacity(arr[i],data[i], styleOb);
                if(maskId){
                    pathElement.setAttribute('mask','url(#'+maskId+')');
                }
                data[i].elem = pathElement;
                container.appendChild(pathElement);
                PContainer.addChild(PPathElement);

            }

            if(arr[i].ln){
                pathElement.setAttribute('id',arr[i].ln);
            }
            if(arr[i].cl){
                pathElement.setAttribute('class',arr[i].cl);
            }
            styleOb.pElem = pathElement;
            styleOb.PPElem = PPathElement;
            this.stylesList.push(styleOb);
            data[i].style = styleOb;
            ownArrays.push(styleOb);
        }else if(arr[i].ty == 'gr'){
            data[i] = {
                it: []
            };
            var g = document.createElementNS(svgNS,'g');
            container.appendChild(g);
            var PGroup = new PIXI.DisplayObjectContainer();
            PContainer.addChild(PGroup);
            data[i].PGr = PGroup;
            data[i].gr = g;
            this.searchShapes(arr[i].it,data[i].it,g,PGroup,dynamicProperties, level + 1);
        }else if(arr[i].ty == 'tr'){
            data[i] = {
                transform : {
                    op: PropertyFactory.getProp(this,arr[i].o,0,0.01,dynamicProperties),
                    mProps: PropertyFactory.getProp(this,arr[i],2,null,dynamicProperties)
                },
                elements: []
            };
            currentTransform = data[i].transform;
            jLen = this.stylesList.length;
            for(j=0;j<jLen;j+=1){
                if(!this.stylesList[j].closed){
                    this.stylesList[j].transformers.push(currentTransform);
                }
            }
        }else if(arr[i].ty == 'sh' || arr[i].ty == 'rc' || arr[i].ty == 'el' || arr[i].ty == 'sr'){
            data[i] = {
                elements : [],
                caches:[],
                PCaches:[],
                styles : [],
                lStr: ''
            };
            var ty = 4;
            if(arr[i].ty == 'rc'){
                ty = 5;
            }else if(arr[i].ty == 'el'){
                ty = 6;
            }else if(arr[i].ty == 'sr'){
                ty = 7;
            }
            data[i].sh = ShapePropertyFactory.getShapeProp(this,arr[i],ty,dynamicProperties);
            data[i].lvl = level;
            this.shapes.push(data[i].sh);
            this.addShapeToModifiers(data[i]);
            jLen = this.stylesList.length;
            for(j=0;j<jLen;j+=1){
                if(!this.stylesList[j].closed){
                    data[i].elements.push({
                        ty:this.stylesList[j].type,
                        st: this.stylesList[j]
                    });
                }
            }
        }else if(arr[i].ty == 'tm' || arr[i].ty == 'rd' || arr[i].ty == 'ms'){
            var modifier = ShapeModifiers.getModifier(arr[i].ty);
            modifier.init(this,arr[i],dynamicProperties);
            this.shapeModifiers.push(modifier);
            ownModifiers.push(modifier);
            data[i] = modifier;
        }
    }
    len = ownArrays.length;
    for(i=0;i<len;i+=1){
        ownArrays[i].closed = true;
    }
    len = ownModifiers.length;
    for(i=0;i<len;i+=1){
        ownModifiers[i].closed = true;
    }
};
