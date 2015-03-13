function CVCompElement(data, animationItem){
    this.parent.constructor.call(this,data, animationItem);
    this.layers = data.layers;
}
createElement(CVBaseElement, CVCompElement);

CVCompElement.prototype.prepareFrame = function(num){
    this.parent.prepareFrame.call(this,num);

    var i,len = this.layers.length;
    var timeRemapped = this.data.tm ? this.data.tm[num] < 0 ? 0 : this.data.tm[num] : num;
    for( i = 0; i < len; i+=1 ){
        this.layers[i].element.prepareFrame(timeRemapped - this.layers[i].startTime);
    }
};

CVCompElement.prototype.draw = function(){
    this.parent.draw.call(this);
    var i,len = this.layers.length;
    for( i = len - 1; i >= 0; i -= 1 ){
        this.layers[i].element.draw();
    }
};