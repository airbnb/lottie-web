function BaseRenderer(){}
BaseRenderer.prototype.checkLayer = function(pos, num, container){
    var data = this.layers[pos];
    if(data.ip - data.st <= num && data.op - data.st > num)
    {
        this.buildItem(pos, container);
    }
};
BaseRenderer.prototype.buildAllItems = function(){
    var i, len = this.layers.length;
    for(i=0;i<len;i+=1){
        this.buildItem(i, this.layerElement);
    }
};

BaseRenderer.prototype.buildItem = function(pos, container){
    var elements = this.elements;
    if(elements[pos]){
        return;
    }
    var element = this.createItem(this.layers[pos],container,this);
    elements[pos] = element;
    element.initExpressions();
    this.appendElementInPos(element,pos);
    if(this.layers[pos].tt){
        this.buildItem(pos - 1, container);
        element.setMatte(elements[pos - 1].layerId);
    }
};


BaseRenderer.prototype.includeLayers = function(newLayers,parentContainer,elements){
    var i, len = newLayers.length;
    var j, jLen = this.layers.length;
    for(i=0;i<len;i+=1){
        j = 0;
        while(j<jLen){
            if(this.layers[j].id == newLayers[i].id){
                this.layers[j] = newLayers[i];
                break;
            }
            j += 1;
        }
    }
};

BaseRenderer.prototype.setProjectInterface = function(pInterface){
    this.globalData.projectInterface = pInterface;
};

BaseRenderer.prototype.initItems = function(){
    if(!this.globalData.progressiveLoad){
        this.buildAllItems();
    }
};