function StrokeEffectManager(){}

StrokeEffectManager.prototype.init = function(){
    this.element.maskManager.registerEffect(this);
    this.layerSize = this.element.getLayerSize();
    this.svgElement = document.createElementNS(svgNS,'svg');
    this.svgElement.setAttribute('width',this.layerSize.w);
    this.svgElement.setAttribute('height',this.layerSize.h);
    this.pathGroup = document.createElementNS(svgNS,'g');
    this.path = document.createElementNS(svgNS,'path');
    this.path.setAttribute('stroke-linecap','round');
    this.path.setAttribute('fill','none');
    this.svgElement.appendChild(this.path);
    this.setStaticAttributes();
    var maskElement = this.element.maskManager.getMaskelement();
    maskElement.appendChild(this.pathGroup);
    this.pathGroup.appendChild(this.path);
    //this.svgElement.appendChild(this.path);
};

StrokeEffectManager.prototype.renderMask = function(num,masks){
    var pathString = masks[this.data.path-1].pathString;
    this.path.setAttribute('d', pathString);
    var length = this.path.getTotalLength();
    var startValue = this.data.animated.Start[num];
    var endValue = this.data.animated.End[num];
    var dashArrayString = "0 ";
    dashArrayString +=startValue*length/100+" ";
    dashArrayString +=(endValue-startValue)*length/100+" ";
    dashArrayString +=(100-endValue)*length/100+" ";
    this.path.style['stroke-dasharray'] = dashArrayString;
    //this.path.style['stroke-dashoffset'] = -10;
    //document.getElementById('stage').appendChild(this.svgElement);
};

StrokeEffectManager.prototype.setStaticAttributes = function(){
    var staticData = this.data.static;
    if(staticData['Brush Size']){
        this.path.setAttribute('stroke-width',staticData['Brush Size']*2);
    }
    if(staticData.Color){
        this.path.setAttribute('stroke',staticData.Color);
    }
};

StrokeEffectManager.prototype.renderFrame = function(){

};