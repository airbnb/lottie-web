function BaseElement(){
};
BaseElement.prototype.checkMasks = function(){
    if(!this.data.hasMask){
        return false;
    }
    var i = 0, len = this.data.masksProperties.length;
    while(i<len) {
        if((this.data.masksProperties[i].mode !== 'n' && this.data.masksProperties[i].cl !== false)) {
            return true;
        }
        i += 1;
    }
    return false;
}

BaseElement.prototype.initExpressions = function(){
    this.layerInterface = LayerExpressionInterface(this);
    if(this.data.hasMask){
        this.layerInterface.registerMaskInterface(this.maskManager);
    }
    var effectsInterface = EffectsExpressionInterface.createEffectsInterface(this,this.layerInterface);
    this.layerInterface.registerEffectsInterface(effectsInterface);

    if(this.data.ty === 0 || this.data.xt){
        this.compInterface = CompExpressionInterface(this);
    } else if(this.data.ty === 4){
        this.layerInterface.shapeInterface = ShapeExpressionInterface.createShapeInterface(this.shapesData,this.itemsData,this.layerInterface);
        this.layerInterface.content = this.layerInterface.shapeInterface;
    } else if(this.data.ty === 5){
        this.layerInterface.textInterface = TextExpressionInterface(this);
        this.layerInterface.text = this.layerInterface.textInterface;
    }
}

BaseElement.prototype.getBlendMode = function(){
    var blendModeValue = '';
    switch(this.data.bm){
        case 1:
            blendModeValue = 'multiply';
            break;
        case 2:
            blendModeValue = 'screen';
            break;
        case 3:
            blendModeValue = 'overlay';
            break;
        case 4:
            blendModeValue = 'darken';
            break;
        case 5:
            blendModeValue = 'lighten';
            break;
        case 6:
            blendModeValue = 'color-dodge';
            break;
        case 7:
            blendModeValue = 'color-burn';
            break;
        case 8:
            blendModeValue = 'hard-light';
            break;
        case 9:
            blendModeValue = 'soft-light';
            break;
        case 10:
            blendModeValue = 'difference';
            break;
        case 11:
            blendModeValue = 'exclusion';
            break;
        case 12:
            blendModeValue = 'hue';
            break;
        case 13:
            blendModeValue = 'saturation';
            break;
        case 14:
            blendModeValue = 'color';
            break;
        case 15:
            blendModeValue = 'luminosity';
            break;
    }
    return blendModeValue;
}

BaseElement.prototype.setBlendMode = function(){
    var blendModeValue = this.getBlendMode();
    var elem = this.baseElement || this.layerElement;

    elem.style['mix-blend-mode'] = blendModeValue;
}

BaseElement.prototype.initBaseData = function(data, globalData, comp){
    this.globalData = globalData;
    this.comp = comp;
    this.data = data;
    this.layerId = 'ly_'+randomString(10);
    
    //Stretch factor for old animations missing this property.
    if(!this.data.sr){
        this.data.sr = 1;
    }
    // effects manager
    this.effects = new EffectsManager(this.data,this,this.dynamicProperties);
    
};

BaseElement.prototype.getType = function(){
    return this.type;
};
