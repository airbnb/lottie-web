function EffectsManager(){}
EffectsManager.prototype.init = function(){
    this.effectElements = [];
    var i,len = this.effects.length;
    for(i=0;i<len;i++){
        switch(this.effects[i].type){
            case "Stroke":
                this.addStrokeEffect(this.effects[i]);
        }
    }
};

EffectsManager.prototype.addStrokeEffect = function(effectData){
    var params = {
        'data':{value:effectData},
        'element':{value:this.element}
    };
    this.effectElements.push(createElement(StrokeEffectManager, null, params));
};

EffectsManager.prototype.renderFrame = function(num){

};
