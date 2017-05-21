function ThreejsRenderer(animationItem, config){
    this.animationItem = animationItem;
    this.layers = null;
    this.renderedFrame = -1;
    this.globalData = {
        frameNum: -1
    };
    this.pendingElements = [];
    this.elements = [];
    this.threeDElements = [];
    this.destroyed = false;
    this.camera = null;
    this.supports3d = true;
}

extendPrototype(BaseRenderer,ThreejsRenderer);
ThreejsRenderer.prototype.buildItem = SVGRenderer.prototype.buildItem;

ThreejsRenderer.prototype.checkPendingElements  = function(){
    while(this.pendingElements.length){
        var element = this.pendingElements.pop();
        element.checkParenting();
    }
};

ThreejsRenderer.prototype.appendElementInPos = function(element, pos){
    var newElement = element.getBaseElement();
    if(!newElement){
        return;
    }
    var layer = this.layers[pos];
    if(!layer.ddd || !this.supports3d){
        var i = 0;
        var nextElement;
        while(i<pos){
            if(this.elements[i] && this.elements[i]!== true && this.elements[i].getBaseElement){
                nextElement = this.elements[i].getBaseElement();
            }
            i += 1;
        }
        if(nextElement){
            if(!layer.ddd || !this.supports3d){
                this.layerElement.insertBefore(newElement, nextElement);
            }
        } else {
            if(!layer.ddd || !this.supports3d){
                this.layerElement.appendChild(newElement);
            }
        }
    } else {
        this.scene.add( newElement );
    }
};

ThreejsRenderer.prototype.createSolid = function (data) {
    return new TSolidElement(data, this.layerElement,this.globalData,this);
};

ThreejsRenderer.prototype.createImage = function (data) {
    return new TImageElement(data, this.layerElement,this.globalData,this);
};

ThreejsRenderer.prototype.createCamera = function (data) {
    this.camera = new TCameraElement(data, this.layerElement,this.globalData,this);
    return this.camera;
};

ThreejsRenderer.prototype.configAnimation = function(animData){
    var wrapper = this.animationItem.wrapper;
    var scene = new THREE.Scene();
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( animData.w, animData.h );
    wrapper.appendChild( renderer.domElement );

    var svg = document.createElementNS(svgNS,'svg');
    svg.setAttribute('width','1');
    svg.setAttribute('height','1');
    styleDiv(svg);
    wrapper.appendChild(svg);
    var defs = document.createElementNS(svgNS,'defs');
    svg.appendChild(defs);
    this.globalData.defs = defs;
    this.data = animData;
    //Mask animation
    this.globalData.getAssetData = this.animationItem.getAssetData.bind(this.animationItem);
    this.globalData.getAssetsPath = this.animationItem.getAssetsPath.bind(this.animationItem);
    this.globalData.elementLoaded = this.animationItem.elementLoaded.bind(this.animationItem);
    this.globalData.frameId = 0;
    this.globalData.compSize = {
        w: animData.w,
        h: animData.h
    };
    this.globalData.frameRate = animData.fr;
    this.layers = animData.layers;
    this.globalData.fontManager = new FontManager();
    this.globalData.fontManager.addChars(animData.chars);
    this.globalData.fontManager.addFonts(animData.fonts,svg);
    this.scene = scene;
    this.renderer = renderer;
};

ThreejsRenderer.prototype._renderLayersFrame = SVGRenderer.prototype.renderFrame;
ThreejsRenderer.prototype.renderFrame = function(num) {
    this._renderLayersFrame(num);
    //this.scene.updateMatrixWorld( true );
    this.renderer.render(this.scene, this.camera.threeCamera);
}

ThreejsRenderer.prototype.searchExtraCompositions = function(assets){
    var i, len = assets.length;
    var floatingContainer = document.createElement('div');
    for(i=0;i<len;i+=1){
        if(assets[i].xt){
            var comp = this.createComp(assets[i],floatingContainer,this.globalData.comp,null);
            comp.initExpressions();
            this.globalData.projectInterface.registerComposition(comp);
        }
    }
};