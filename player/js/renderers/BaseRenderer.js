function BaseRenderer(){}
BaseRenderer.prototype.checkLayer = function(pos, num){
    var data = this.layers[pos];
    if(data.ip - data.st <= num && data.op - data.st > num)
    {
        this.buildItem(pos);
    }
};
BaseRenderer.prototype.buildAllItems = function(){
    var i, len = this.layers.length;
    for(i=0;i<len;i+=1){
        this.buildItem(i);
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
BaseRenderer.prototype.buildElementParenting = function(element, parentName){
    var elements = this.elements;
    var layers = this.layers;
    var i=0, len = layers.length;
    while(i<len){
        if(layers[i].ind == parentName){
            if(!elements[i]){
                this.buildItem(i);
            }
            element.getHierarchy().push(elements[i]);
            if(layers[i].parent !== undefined){
                this.buildElementParenting(element,layers[i].parent);
            }
        }
        i += 1;
    }
};