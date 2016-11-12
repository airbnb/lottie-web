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
    var i, len = path.v.length;
    var vValues = [],oValues = [],iValues = [];
    var currentV,currentI,currentO,closerV, newV,newO,newI,distance,newPosPerc;
    for(i=0;i<len;i+=1){
        currentV = path.v[i];
        currentO = path.o[i];
        currentI = path.i[i];
        if(currentV[0]===currentO[0] && currentV[1]===currentO[1] && currentV[0]===currentI[0] && currentV[1]===currentI[1]){
            if((i===0 || i === len - 1) && !path.c){
                vValues.push(currentV);
                oValues.push(currentO);
                iValues.push(currentI);
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
                vValues.push(newV);
                oValues.push(newO);
                iValues.push(newI);

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
                vValues.push(newV);
                oValues.push(newO);
                iValues.push(newI);
            }
        } else {
            vValues.push(path.v[i]);
            oValues.push(path.o[i]);
            iValues.push(path.i[i]);
        }
    }
    return {
        v:vValues,
        o:oValues,
        i:iValues,
        c:path.c
    };
}

RoundCornersModifier.prototype.processShapes = function(){
    var shapePaths;
    var i, len = this.shapes.length;
    var j, jLen;
    var rd = this.rd.v;

    if(rd !== 0){
        var shapeData, newPaths;
        for(i=0;i<len;i+=1){
            newPaths = [];
            shapeData = this.shapes[i];
            if(!shapeData.shape.mdf && !this.mdf){
                shapeData.shape.paths = shapeData.last;
            } else {
                shapeData.shape.mdf = true;
                shapePaths = shapeData.shape.paths;
                jLen = shapePaths.length;
                for(j=0;j<jLen;j+=1){
                    newPaths.push(this.processPath(shapePaths[j],rd));
                }
                shapeData.shape.paths = newPaths;
                shapeData.last = newPaths;
            }
        }

    }
    if(!this.dynamicProperties.length){
        this.mdf = false;
    }
}


ShapeModifiers.registerModifier('rd',RoundCornersModifier);