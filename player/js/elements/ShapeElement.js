function IShapeElement(){
}

IShapeElement.prototype = {
    addShapeToModifiers: function(data) {
        var i, len = this.shapeModifiers.length;
        for(i=0;i<len;i+=1){
            this.shapeModifiers[i].addShape(data);
        }
    },
    isShapeInAnimatedModifiers: function(data) {
        var i = 0, len = this.shapeModifiers.length;
        while(i < len) {
            if(this.shapeModifiers[i].isAnimatedWithShape(data)) {
                return true;
            }
        }
        return false;
    },
    renderModifiers: function() {
        if(!this.shapeModifiers.length){
            return;
        }
        var i, len = this.shapes.length;
        for(i=0;i<len;i+=1){
            this.shapes[i].reset();
        }

        len = this.shapeModifiers.length;
        for(i=len-1;i>=0;i-=1){
            this.shapeModifiers[i].processShapes(this._isFirstFrame);
        }
    },
    lcEnum: {
        '1': 'butt',
        '2': 'round',
        '3': 'square'
    },
    ljEnum: {
        '1': 'miter',
        '2': 'round',
        '3': 'butt'
    },
    searchProcessedElement: function(elem){
        var i = 0, len = this.processedElements.length;
        while(i < len){
            if(this.processedElements[i].elem === elem){
                return this.processedElements[i].pos;
            }
            i += 1;
        }
        return 0;
    },
    addProcessedElement: function(elem, pos){
        var i = this.processedElements.length, found = false;
        while(i){
            i -= 1;
            if(this.processedElements[i].elem === elem){
                this.processedElements[i].pos = pos;
                found = true;
                break;
            }
        }
        if(!found){
            this.processedElements.push(new ProcessedElement(elem, pos));
        }
    },
    prepareFrame: function(num) {
        this.prepareRenderableFrame(num);
        this.prepareProperties(num, this.isInRange);
    }
};