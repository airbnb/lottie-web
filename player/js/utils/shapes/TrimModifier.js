function TrimModifier(){};
extendPrototype(ShapeModifier,TrimModifier);
TrimModifier.prototype.processKeys = function(forceRender){
    if(this.elem.globalData.frameId === this.frameId && !forceRender){
        return;
    }
    this.mdf = false;
    this.frameId = this.elem.globalData.frameId;
    var i, len = this.dynamicProperties.length;

    for(i=0;i<len;i+=1){
        this.dynamicProperties[i].getValue();
        if(this.dynamicProperties[i].mdf){
            this.mdf = true;
        }
    }
    if(this.mdf || forceRender){
        var o = (this.o.v%360)/360;
        if(o === 0 && this.s.v === 0 && this.e.v == 1){
            this.isTrimming = false;
            return;
        }
        this.isTrimming = true;
        if(o < 0){
            o += 1;
        }
        var s = this.s.v + o;
        var e = this.e.v + o;
        if(s == e){

        }
        if(s>e){
            var _s = s;
            s = e;
            e = _s;
        }
        this.sValue = s;
        this.eValue = e;
        this.oValue = o;
    }
}
TrimModifier.prototype.initModifierProperties = function(elem,data){
    this.sValue = 0;
    this.eValue = 0;
    this.oValue = 0;
    this.getValue = this.processKeys;
    this.s = PropertyFactory.getProp(elem,data.s,0,0.01,this.dynamicProperties);
    this.e = PropertyFactory.getProp(elem,data.e,0,0.01,this.dynamicProperties);
    this.o = PropertyFactory.getProp(elem,data.o,0,0,this.dynamicProperties);
};

TrimModifier.prototype.getSegmentsLength = function(shape){
    var keyframes = shape.path;
    var closed = shape.closed;
    var pathV = keyframes.v;
    var pathO = keyframes.o;
    var pathI = keyframes.i;
    var i, len = pathV.length;
    var lengths = [];
    var totalLength = 0;
    for(i=0;i<len-1;i+=1){
        lengths[i] = bez.getBezierLength(pathV[i],pathV[i+1],pathO[i],pathI[i+1]);
        totalLength += lengths[i].addedLength;
    }
    if(closed){
        lengths[i] = bez.getBezierLength(pathV[i],pathV[0],pathO[i],pathI[0]);
        totalLength += lengths[i].addedLength;
    }
    return {lengths:lengths,totalLength:totalLength};
}

TrimModifier.prototype.processShapes = function(){
    var shapePaths;
    var i, len = this.shapes.length;
    var j, jLen;
    var s = this.sValue;
    var e = this.eValue;
    var o = this.oValue;
    var pathsData,pathData, totalShapeLength, totalModifierLength = 0;

    if(e === s){
        for(i=0;i<len;i+=1){
            this.shapes[i].shape.paths = [];
        }
    } else {
        var segments = [], shapeData, newShapes = [];
        for(i=0;i<len;i+=1){
            shapeData = this.shapes[i];
            shapePaths = shapeData.shape.paths;
            jLen = shapePaths.length;
            pathsData = [];
            totalShapeLength = 0;
            for(j=0;j<jLen;j+=1){
                pathData = this.getSegmentsLength(shapePaths[j]);
                pathsData.push(pathData);
                totalShapeLength += pathData.totalLength;
            }
            shapeData.totalShapeLength = totalShapeLength;
            shapeData.pathsData = pathsData;
            totalModifierLength += totalShapeLength;
        }
        for(i=0;i<len;i+=1){
            segments.length = 0;
            shapeData = this.shapes[i];
            if(e <= 1){
                segments.push({
                    s:shapeData.totalShapeLength*s,
                    e:shapeData.totalShapeLength*e
                })
            }else if(s >= 1){
                segments.push({
                    s:shapeData.totalShapeLength*(s-1),
                    e:shapeData.totalShapeLength*(e-1)
                })
            }else{
                segments.push({
                    s:shapeData.totalShapeLength*s,
                    e:shapeData.totalShapeLength
                })
                segments.push({
                    s:0,
                    e:shapeData.totalShapeLength*(e-1)
                })
            }
            jLen = segments.length;
            for(j=0;j<jLen;j+=1){
                this.addShapes(newShapes,shapeData,segments[j]);
            }
            shapeData.shape.paths = newShapes;
        }
    }
}

TrimModifier.prototype.addSegment = function(pt1,pt2,pt3,pt4,shapePath,pos) {
    console.log(pt1,pt2,pt3,pt4,pos);
    shapePath.o[pos] = pt2;
    shapePath.i[pos+1] = pt3;
    shapePath.v[pos+1] = pt4;
    shapePath.v[pos] = pt1;
}

TrimModifier.prototype.addShapes = function(arr, shapeData, shapeSegment){
    console.log(shapeSegment);
    var pathsData = shapeData.pathsData;
    var shapePaths = shapeData.shape.paths;
    var i, len = shapePaths.length, j, jLen;
    var addedLength = 0;
    var currentLengthData,segmentCount;
    var lengths;
    var shapePath;
    var segment;
    for(i=0;i<len;i+=1){
        lengths = pathsData[i].lengths;
        jLen = lengths.length;
        shapePath = {
            c: false,
            v:[],
            i:[],
            o:[]
        }
        segmentCount = 0;
        for(j=1;j<jLen;j+=1){
            currentLengthData = lengths[j-1];
            if(addedLength + currentLengthData.addedLength < shapeSegment.s){
                addedLength += currentLengthData.addedLength;
            } else if(addedLength > shapeSegment.e){
                break;
            } else {
                if(shapeSegment.s <= addedLength && shapeSegment.e >= addedLength + currentLengthData.addedLength){
                    this.addSegment(shapePaths[i].path.v[j-1],shapePaths[i].path.o[j-1],shapePaths[i].path.i[j],shapePaths[i].path.v[j],shapePath,segmentCount);

                } else {
                    segment = bez.getNewSegment(shapePaths[i].path.v[j-1],shapePaths[i].path.v[j],shapePaths[i].path.o[j-1],shapePaths[i].path.i[j], (shapeSegment.s - addedLength)/currentLengthData.addedLength,(shapeSegment.e - addedLength)/currentLengthData.addedLength, lengths[j-1]);
                    this.addSegment(segment.pt1,segment.pt3,segment.pt4,segment.pt2,shapePath,segmentCount);
                }
                addedLength += currentLengthData.addedLength;
                segmentCount += 1;
            }
        }
        if(shapePaths[i].closed){
            if(addedLength <= shapeSegment.e){
                var segmentLength = lengths[j-1].addedLength;
                if(shapeSegment.s <= addedLength && shapeSegment.e >= addedLength + segmentLength){
                    this.addSegment(shapePaths[i].path.v[j-1],shapePaths[i].path.o[j-1],shapePaths[i].path.i[0],shapePaths[i].path.v[0],shapePath,segmentCount);
                }else{
                    segment = bez.getNewSegment(shapePaths[i].path.v[j-1],shapePaths[i].path.v[0],shapePaths[i].path.o[j-1],shapePaths[i].path.i[0], (shapeSegment.s - addedLength)/segmentLength,(shapeSegment.e - addedLength)/segmentLength, lengths[j-1]);
                    this.addSegment(segment.pt1,segment.pt3,segment.pt4,segment.pt2,shapePath,segmentCount);
                }
            }
        }
        arr.push(shapePath);
    }

}


ShapeModifiers.registerModifier('tm',TrimModifier);