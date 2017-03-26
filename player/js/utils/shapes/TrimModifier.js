function TrimModifier(){};
extendPrototype(ShapeModifier,TrimModifier);
TrimModifier.prototype.processKeys = function(forceRender){
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
    if(this.mdf || forceRender){
        var o = (this.o.v%360)/360;
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
    this.m = data.m;
    if(!this.dynamicProperties.length){
        this.getValue(true);
    }
};

TrimModifier.prototype.getSegmentsLength = function(keyframes){
    var closed = keyframes.c;
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

TrimModifier.prototype.calculateShapeEdges = function(s, e, shapeLength, addedLength, totalModifierLength) {
    var segments = []
    if(e <= 1){
        segments.push({
            s: s,
            e: e
        })
    }else if(s >= 1){
        segments.push({
            s: s - 1,
            e: e - 1
        })
    }else{
        segments.push({
            s: s,
            e: 1
        })
        segments.push({
            s: 0,
            e: e - 1
        })
    }
    var shapeSegments = [];
    var i, len = segments.length, segmentOb;
    for(i = 0; i < len; i += 1) {
        segmentOb = segments[i];
        if (segmentOb.e * totalModifierLength < addedLength || segmentOb.s * totalModifierLength > addedLength + shapeLength) {
            
        } else {
            var shapeS, shapeE;
            if(segmentOb.s * totalModifierLength <= addedLength) {
                shapeS = 0;
            } else {
                shapeS = (segmentOb.s * totalModifierLength - addedLength) / shapeLength;
            }
            if(segmentOb.e * totalModifierLength >= addedLength + shapeLength) {
                shapeE = 1;
            } else {
                shapeE = ((segmentOb.e * totalModifierLength - addedLength) / shapeLength);
            }
            shapeSegments.push([shapeS, shapeE]);
        }
    }
    //console.log(shapeSegments);
    if(!shapeSegments.length){
        shapeSegments.push([0,0]);
    }
    return shapeSegments;
}

TrimModifier.prototype.processShapes = function(firstFrame){
    var shapePaths;
    var i, len = this.shapes.length;
    var j, jLen;
    var s = this.sValue;
    var e = this.eValue;
    var pathsData,pathData, totalShapeLength, totalModifierLength = 0;


    if(e === s){
        for(i=0;i<len;i+=1){
            this.shapes[i].shape.paths = [];
            this.shapes[i].shape.mdf = true;
        }
    } else if((e === 1 && s === 0) || (e===0 && s === 1)){
        for(i=0;i<len;i+=1){
            shapeData = this.shapes[i];
            if(shapeData.shape.paths !== shapeData.last){
                shapeData.shape.mdf = true;
                shapeData.last = shapeData.shape.paths;
            }
        }
    } else {
        var segments = [], shapeData, newShapes;
        for(i=0;i<len;i+=1){
            shapeData = this.shapes[i];
            if(!shapeData.shape.mdf && !this.mdf && !firstFrame && this.m !== 2){
                shapeData.shape.paths = shapeData.last;
            } else {
                shapePaths = shapeData.shape.paths;
                jLen = shapePaths.length;
                totalShapeLength = 0;
                if(!shapeData.shape.mdf && shapeData.pathsData){
                    totalShapeLength = shapeData.totalShapeLength;
                } else {
                    pathsData = [];
                    for(j=0;j<jLen;j+=1){
                        pathData = this.getSegmentsLength(shapePaths[j]);
                        pathsData.push(pathData);
                        totalShapeLength += pathData.totalLength;
                    }
                    shapeData.totalShapeLength = totalShapeLength;
                    shapeData.pathsData = pathsData;
                }

                totalModifierLength += totalShapeLength;
                shapeData.shape.mdf = true;
            }
        }
        var shapeS = s, shapeE = e, addedLength = 0;
        var j, jLen;
        for(i = len - 1; i >= 0; i -= 1){
            newShapes = [];
            shapeData = this.shapes[i];
            if (shapeData.shape.mdf) {
                if(this.m === 2 && len > 1) {
                    var edges = this.calculateShapeEdges(s, e, shapeData.totalShapeLength, addedLength, totalModifierLength);
                    addedLength += shapeData.totalShapeLength;
                } else {
                    edges = [[shapeS, shapeE]]
                }
                jLen = edges.length;
                for (j = 0; j < jLen; j += 1) {
                    shapeS = edges[j][0];
                    shapeE = edges[j][1];
                    segments.length = 0;
                    if(shapeE <= 1){
                        segments.push({
                            s:shapeData.totalShapeLength * shapeS,
                            e:shapeData.totalShapeLength * shapeE
                        })
                    }else if(shapeS >= 1){
                        segments.push({
                            s:shapeData.totalShapeLength * (shapeS - 1),
                            e:shapeData.totalShapeLength * (shapeE - 1)
                        })
                    }else{
                        segments.push({
                            s:shapeData.totalShapeLength * shapeS,
                            e:shapeData.totalShapeLength
                        })
                        segments.push({
                            s:0,
                            e:shapeData.totalShapeLength*(shapeE - 1)
                        })
                    }
                    var newShapesData = this.addShapes(shapeData,segments[0]);
                    if (segments[0].s !== segments[0].e) {
                        var lastPos;
                        newShapes = newShapes.concat(newShapesData);
                        if(segments.length > 1){
                            if(shapeData.shape.v.c){
                                this.addShapes(shapeData,segments[1], newShapesData[newShapesData.length - 1]);
                            } else {
                                newShapesData = this.addShapes(shapeData,segments[1]);
                                newShapes = newShapes.concat(newShapesData);
                            }
                        }
                    }
                    
                }
                shapeData.last = newShapes;
                shapeData.shape.paths = newShapes;
            }
        }
    }
    if(!this.dynamicProperties.length){
        this.mdf = false;
    }
}

TrimModifier.prototype.addSegment = function(pt1,pt2,pt3,pt4,shapePath,pos) {
    shapePath.o[pos] = pt2;
    shapePath.i[pos+1] = pt3;
    shapePath.v[pos+1] = pt4;
    shapePath.v[pos] = pt1;
}

TrimModifier.prototype.addShapes = function(shapeData, shapeSegment, shapePath){
    var pathsData = shapeData.pathsData;
    var shapePaths = shapeData.shape.paths;
    var i, len = shapePaths.length, j, jLen;
    var addedLength = 0;
    var currentLengthData,segmentCount;
    var lengths;
    var segment;
    var shapes = [];
    if(!shapePath){
        shapePath = {
            c: true,
            v:[],
            i:[],
            o:[]
        };
        segmentCount = 0;
    } else {
        segmentCount = shapePath.v.length - 1;
    }
    shapes.push(shapePath);
    for(i=0;i<len;i+=1){
        lengths = pathsData[i].lengths;
        shapePath.c = shapePaths[i].c;
        jLen = shapePaths[i].c ? lengths.length : lengths.length + 1;
        for(j=1;j<jLen;j+=1){
            currentLengthData = lengths[j-1];
            if(addedLength + currentLengthData.addedLength < shapeSegment.s){
                addedLength += currentLengthData.addedLength;
                shapePath.c = false;
            } else if(addedLength > shapeSegment.e){
                shapePath.c = false;
                break;
            } else {
                if(shapeSegment.s <= addedLength && shapeSegment.e >= addedLength + currentLengthData.addedLength){
                    this.addSegment(shapePaths[i].v[j-1],shapePaths[i].o[j-1],shapePaths[i].i[j],shapePaths[i].v[j],shapePath,segmentCount);

                } else {
                    segment = bez.getNewSegment(shapePaths[i].v[j-1],shapePaths[i].v[j],shapePaths[i].o[j-1],shapePaths[i].i[j], (shapeSegment.s - addedLength)/currentLengthData.addedLength,(shapeSegment.e - addedLength)/currentLengthData.addedLength, lengths[j-1]);
                    this.addSegment(segment.pt1,segment.pt3,segment.pt4,segment.pt2,shapePath,segmentCount);
                    shapePath.c = false;
                }
                addedLength += currentLengthData.addedLength;
                segmentCount += 1;
            }
        }
        if(shapePaths[i].c){
            currentLengthData = lengths[j-1];
            if(addedLength <= shapeSegment.e){
                var segmentLength = lengths[j-1].addedLength;
                if(shapeSegment.s <= addedLength && shapeSegment.e >= addedLength + segmentLength){
                    this.addSegment(shapePaths[i].v[j-1],shapePaths[i].o[j-1],shapePaths[i].i[0],shapePaths[i].v[0],shapePath,segmentCount);
                }else{
                    segment = bez.getNewSegment(shapePaths[i].v[j-1],shapePaths[i].v[0],shapePaths[i].o[j-1],shapePaths[i].i[0], (shapeSegment.s - addedLength)/segmentLength,(shapeSegment.e - addedLength)/segmentLength, lengths[j-1]);
                    this.addSegment(segment.pt1,segment.pt3,segment.pt4,segment.pt2,shapePath,segmentCount);
                    shapePath.c = false;
                }
            } else {
                shapePath.c = false;
            }
            addedLength += currentLengthData.addedLength;
            segmentCount += 1;
        }
        ////
        shapePath.i[0] = [shapePath.v[0][0],shapePath.v[0][1]];
        shapePath.o[shapePath.v.length - 1] = [shapePath.v[shapePath.v.length - 1][0],shapePath.v[shapePath.v.length - 1][1]];
        if(addedLength > shapeSegment.e){
            break;
        }
        if(i<len-1){
            shapePath = {
                c: true,
                v:[],
                i:[],
                o:[]
            };
            shapes.push(shapePath);
            segmentCount = 0;
        }

        

    }
    return shapes;

}


ShapeModifiers.registerModifier('tm',TrimModifier);