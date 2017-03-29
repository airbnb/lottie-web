function RoundCornersModifier(){};
extendPrototype(ShapeModifier,RoundCornersModifier);
RoundCornersModifier.prototype.processKeys = function(forceRender){
    if(this.elem.globalData.frameId === this.frameId && !forceRender){
        return;
    }
    this.mdf = forceRender ? true : false;
    this.frameId = this.elem.globalData.frameId;
    var i, len = this.dynamicProperties.length;

    for(i=0;i<len;i+=1){
        this.dynamicProperties[i].getValue();
        if(this.dynamicProperties[i].mdf){
            this.mdf = true;
        }
    }
}
RoundCornersModifier.prototype.initModifierProperties = function(elem,data){
    this.getValue = this.processKeys;
    this.rd = PropertyFactory.getProp(elem,data.r,0,null,this.dynamicProperties);
    if(!this.dynamicProperties.length){
        this.getValue(true);
    }
};

RoundCornersModifier.prototype.processPath = function(path, round){
    var cloned_path = shape_helper.clone(path);
    var i, len = path.v.length;
    var currentV,currentI,currentO,closerV, newV,newO,newI,distance,newPosPerc,index = 0;
    for(i=0;i<len;i+=1){
        currentV = path.v[i];
        currentO = path.o[i];
        currentI = path.i[i];
        if(currentV[0]===currentO[0] && currentV[1]===currentO[1] && currentV[0]===currentI[0] && currentV[1]===currentI[1]){
            if((i===0 || i === len - 1) && !path.c){
                cloned_path.v[index] = currentV;
                cloned_path.o[index] = currentO;
                cloned_path.i[index] = currentI;
                index += 1;
            } else {
                if(i===0){
                    closerV = path.v[len-1];
                } else {
                    closerV = path.v[i-1];
                }
                distance = Math.sqrt(Math.pow(currentV[0]-closerV[0],2)+Math.pow(currentV[1]-closerV[1],2));
                newPosPerc = distance ? Math.min(distance/2,round)/distance : 0;
                newV = [currentV[0]+(closerV[0]-currentV[0])*newPosPerc,currentV[1]-(currentV[1]-closerV[1])*newPosPerc];
                newI = newV;
                newO = [newV[0]-(newV[0]-currentV[0])*roundCorner,newV[1]-(newV[1]-currentV[1])*roundCorner];
                cloned_path.v[index] = newV;
                cloned_path.i[index] = newI;
                cloned_path.o[index] = newO;
                index += 1;

                if(i === len - 1){
                    closerV = path.v[0];
                } else {
                    closerV = path.v[i+1];
                }
                distance = Math.sqrt(Math.pow(currentV[0]-closerV[0],2)+Math.pow(currentV[1]-closerV[1],2));
                newPosPerc = distance ? Math.min(distance/2,round)/distance : 0;
                newV = [currentV[0]+(closerV[0]-currentV[0])*newPosPerc,currentV[1]+(closerV[1]-currentV[1])*newPosPerc];
                newI = [newV[0]-(newV[0]-currentV[0])*roundCorner,newV[1]-(newV[1]-currentV[1])*roundCorner];
                newO = newV;
                cloned_path.v[index] = newV;
                cloned_path.i[index] = newI;
                cloned_path.o[index] = newO;
                index += 1;
            }
        } else {
            cloned_path.v[index] = path.v[i];
            cloned_path.o[index] = path.o[i];
            cloned_path.i[index] = path.i[i];
            index += 1;
        }
    }
    return cloned_path;
}

RoundCornersModifier.prototype.processShapes = function(){
    var shapePaths;
    var i, len = this.shapes.length;
    var j, jLen;
    var rd = this.rd.v;

    if(rd !== 0){
        var shapeData, newPaths;
        for(i=0;i<len;i+=1){
            shapeData = this.shapes[i];
            newPaths = shapeData.shape.paths;
            if(!shapeData.shape.mdf && !this.mdf){
                shapeData.shape.paths = shapeData.last;
            } else {
                shapeData.shape.mdf = true;
                shapePaths = shapeData.shape.paths;
                jLen = shapeData.shape._pathsLength;
                for(j=0;j<jLen;j+=1){
                    newPaths[j] = this.processPath(shapePaths[j],rd);
                }
                shapeData.last = newPaths;
            }
        }

    }
    if(!this.dynamicProperties.length){
        this.mdf = false;
    }
}


ShapeModifiers.registerModifier('rd',RoundCornersModifier);