function MouseModifier(){};
extendPrototype(ShapeModifier,MouseModifier);
MouseModifier.prototype.processKeys = function(forceRender){
    if(this.elem.globalData.frameId === this.frameId && !forceRender){
        return;
    }
    this.mdf = true;

};

MouseModifier.prototype.addShapeToModifier = function(){
    this.positions.push([]);
};

MouseModifier.prototype.processPath = function(path, mouseCoords, transformers, positions){
    var cloned_path = shape_pool.newShape();
    cloned_path.c = path.c;
    var i, len = path._length;
    var dist;
    //console.log(mouseCoords);
    var theta, x,y,globalPt;
    //// OPTION A
    /*for(i=0;i<len;i+=1){
        if(!positions.v[i]){
            positions.v[i] = [path.v[i][0],path.v[i][1]];
            positions.o[i] = [path.o[i][0],path.o[i][1]];
            positions.i[i] = [path.i[i][0],path.i[i][1]];
            positions.distV[i] = 0;
            positions.distO[i] = 0;
            positions.distI[i] = 0;

        }

        globalPt = this.elem.localToGlobal(path.v[i],transformers);
        theta = Math.atan2(
            globalPt[1] - mouseCoords[1],
            globalPt[0] - mouseCoords[0]
        );

        globalPt = this.elem.localToGlobal(positions.v[i],transformers);
        x = mouseCoords[0] - globalPt[0];
        y = mouseCoords[1] - globalPt[1];
        var distance = Math.sqrt( (x * x) + (y * y) );
        positions.distV[i] += (distance - positions.distV[i]) * this.data.dc;

        positions.v[i][0] = Math.cos(theta) * Math.max(0,this.data.maxDist-positions.distV[i])/2 + (path.v[i][0]);
        positions.v[i][1] = Math.sin(theta) * Math.max(0,this.data.maxDist-positions.distV[i])/2 + (path.v[i][1]);


        globalPt = this.elem.localToGlobal(path.o[i],transformers);
        theta = Math.atan2(
            globalPt[1] - mouseCoords[1],
            globalPt[0] - mouseCoords[0]
        );

        globalPt = this.elem.localToGlobal(positions.o[i],transformers);
        x = mouseCoords[0] - globalPt[0];
        y = mouseCoords[1] - globalPt[1];
        var distance = Math.sqrt( (x * x) + (y * y) );
        positions.distO[i] += (distance - positions.distO[i]) * this.data.dc;

        positions.o[i][0] = Math.cos(theta) * Math.max(0,this.data.maxDist-positions.distO[i])/2 + (path.o[i][0]);
        positions.o[i][1] = Math.sin(theta) * Math.max(0,this.data.maxDist-positions.distO[i])/2 + (path.o[i][1]);


        globalPt = this.elem.localToGlobal(path.i[i],transformers);
        theta = Math.atan2(
            globalPt[1] - mouseCoords[1],
            globalPt[0] - mouseCoords[0]
        );

        globalPt = this.elem.localToGlobal(positions.i[i],transformers);
        x = mouseCoords[0] - globalPt[0];
        y = mouseCoords[1] - globalPt[1];
        var distance = Math.sqrt( (x * x) + (y * y) );
        positions.distI[i] += (distance - positions.distI[i]) * this.data.dc;

        positions.i[i][0] = Math.cos(theta) * Math.max(0,this.data.maxDist-positions.distI[i])/2 + (path.i[i][0]);
        positions.i[i][1] = Math.sin(theta) * Math.max(0,this.data.maxDist-positions.distI[i])/2 + (path.i[i][1]);

        /////OPTION 1
        // cloned_path.setTripleAt(positions.v[i][0],positions.v[i][1]
        //     ,positions.o[i][0],positions.o[i][1]
        //     ,positions.i[i][0],positions.i[i][1], i);



        /////OPTION 2
        // cloned_path.setTripleAt(positions.v[i][0],positions.v[i][1]
        //     ,path.o[i][0]+(positions.v[i][0]-path.v[i][0]),path.o[i][1]+(positions.v[i][1]-path.v[i][1])
        //     ,path.i[i][0]+(positions.v[i][0]-path.v[i][0]),path.i[i][1]+(positions.v[i][1]-path.v[i][1]), i);



        /////OPTION 3
        // cloned_path.setTripleAt(positions.v[i][0],positions.v[i][1]
        //     ,path.o[i][0],path.o[i][1]
        //     ,path.i[i][0],path.i[i][1], i);


        /////OPTION 4
        // cloned_path.setTripleAt(path.v[i][0],path.v[i][1]
        //      ,positions.o[i][0],positions.o[i][1]
        //      ,positions.i[i][0],positions.i[i][1], i);
    }*/



    //// OPTION B
    /*for(i=0;i<len;i+=1){
        if(!positions.v[i]){
            positions.v[i] = [path.v[i][0],path.v[i][1]];
            positions.o[i] = [path.o[i][0],path.o[i][1]];
            positions.i[i] = [path.i[i][0],path.i[i][1]];
            positions.distV[i] = 0;

        }
        globalPt = this.elem.localToGlobal(path.v[i],transformers);
        theta = Math.atan2(
            globalPt[1] - mouseCoords[1],
            globalPt[0] - mouseCoords[0]
        );
        globalPt = this.elem.localToGlobal(positions.v[i],transformers);
        x = mouseCoords[0] - globalPt[0];
        y = mouseCoords[1] - globalPt[1];
        var distance = this.data.ss * this.data.mx / Math.sqrt( (x * x) + (y * y) );

        positions.v[i][0] += Math.cos(theta) * distance + (path.v[i][0] - positions.v[i][0]) * this.data.dc;
        positions.v[i][1] += Math.sin(theta) * distance + (path.v[i][1] - positions.v[i][1]) * this.data.dc;


        globalPt = this.elem.localToGlobal(path.o[i],transformers);
        theta = Math.atan2(
            globalPt[1] - mouseCoords[1],
            globalPt[0] - mouseCoords[0]
        );
        globalPt = this.elem.localToGlobal(positions.o[i],transformers);
        x = mouseCoords[0] - globalPt[0];
        y = mouseCoords[1] - globalPt[1];
        var distance =  this.data.ss * this.data.mx / Math.sqrt( (x * x) + (y * y) );

        positions.o[i][0] += Math.cos(theta) * distance + (path.o[i][0] - positions.o[i][0]) * this.data.dc;
        positions.o[i][1] += Math.sin(theta) * distance + (path.o[i][1] - positions.o[i][1]) * this.data.dc;


        globalPt = this.elem.localToGlobal(path.i[i],transformers);
        theta = Math.atan2(
            globalPt[1] - mouseCoords[1],
            globalPt[0] - mouseCoords[0]
        );
        globalPt = this.elem.localToGlobal(positions.i[i],transformers);
        x = mouseCoords[0] - globalPt[0];
        y = mouseCoords[1] - globalPt[1];
        var distance =  this.data.ss * this.data.mx / Math.sqrt( (x * x) + (y * y) );

        positions.i[i][0] += Math.cos(theta) * distance + (path.i[i][0] - positions.i[i][0]) * this.data.dc;
        positions.i[i][1] += Math.sin(theta) * distance + (path.i[i][1] - positions.i[i][1]) * this.data.dc;

        /////OPTION 1
        cloned_path.setTripleAt(positions.v[i][0],positions.v[i][1]
            ,positions.o[i][0],positions.o[i][1]
            ,positions.i[i][0],positions.i[i][1], i);



        /////OPTION 2
        //vValues.push(positions.v[i]);
        // iValues.push([path.i[i][0]+(positions.v[i][0]-path.v[i][0]),path.i[i][1]+(positions.v[i][1]-path.v[i][1])]);
        // oValues.push([path.o[i][0]+(positions.v[i][0]-path.v[i][0]),path.o[i][1]+(positions.v[i][1]-path.v[i][1])]);



        /////OPTION 3
        //vValues.push(positions.v[i]);
        //iValues.push(path.i[i]);
        //oValues.push(path.o[i]);


        /////OPTION 4
        //vValues.push(path.v[i]);
        // oValues.push(positions.o[i]);
        // iValues.push(positions.i[i]);
    }*/

    ////OPTION C

    /*var maxDist = this.data.maxDist;
    var perc, distance, globalPt;
    for(i=0;i<len;i+=1){

        globalPt = this.elem.localToGlobal(path.v[i],transformers);

        x = mouseCoords[0] - globalPt[0];
        y = mouseCoords[1] - globalPt[1];
        distance = Math.sqrt( (x * x) + (y * y) );
        perc = Math.min(1,distance/maxDist);

        //// OPTION 1
        if(distance < maxDist){
            cloned_path.setTripleAt(path.v[i][0],path.v[i][1]
            ,path.v[i][0]+(path.o[i][0] - path.v[i][0])*perc,path.v[i][1]+(path.o[i][1] - path.v[i][1])*perc
            ,path.v[i][0]+(path.i[i][0] - path.v[i][0])*perc,path.v[i][1]+(path.i[i][1] - path.v[i][1])*perc, i);
        } else {
            cloned_path.setTripleAt(path.v[i][0],path.v[i][1]
            ,path.o[i][0],path.o[i][1]
            ,path.i[i][0],path.i[i][1], i);
        }

        //// OPTION 2
        // perc = 1 - perc*5;
        // if(distance < maxDist){
        //     cloned_path.setTripleAt(path.v[i][0] * perc,path.v[i][1] * perc
        //     ,path.o[i][0] * perc,path.o[i][1] * perc
        //     ,path.i[i][0] * perc,path.i[i][1] * perc, i);
        // } else {
        //     cloned_path.setTripleAt(path.v[i][0],path.v[i][1]
        //     ,path.o[i][0],path.o[i][1]
        //     ,path.i[i][0],path.i[i][1], i);
        // }

        //// OPTION 3
        // perc = 1 - perc;
        // if(distance < maxDist){
        //     cloned_path.setTripleAt(path.v[i][0],path.v[i][1]
        //     ,path.o[i][0] + (path.i[i][0] - path.o[i][0]) * perc, path.o[i][1] + (path.i[i][1] - path.o[i][1]) * perc
        //     ,path.i[i][0] + (path.o[i][0] - path.i[i][0]) * perc, path.i[i][1] + (path.o[i][1] - path.i[i][1]) * perc, i);
        // } else {
        //     cloned_path.setTripleAt(path.v[i][0],path.v[i][1]
        //     ,path.o[i][0],path.o[i][1]
        //     ,path.i[i][0],path.i[i][1], i);
        // }

    }*/

    ////OPTION D
    var localMouseCoords = this.elem.globalToLocal(mouseCoords, transformers);

    var maxDist = this.data.maxDist;
    var perc, distance;
    for(i=0;i<len;i+=1){

        //globalPt = this.elem.localToGlobal(path.v[i],transformers);

        x = path.v[i][0] - localMouseCoords[0];
        y =path.v[i][1] - localMouseCoords[1];
        distance = Math.sqrt( (x * x) + (y * y) );
        var mult = -0.15*(distance/200);
        //var mult = -.55*(Math.exp(distance/300)-1);
        //var mult = -.55*(Math.log(distance/250));
        //mult = -0.55*Math.cos(distance*Math.PI/180);

        //// OPTION 1
        cloned_path.setTripleAt(path.v[i][0] + (localMouseCoords[0] - path.v[i][0]) * mult, path.v[i][1] + (localMouseCoords[1] - path.v[i][1]) * mult
            ,path.o[i][0],path.o[i][1]
            ,path.i[i][0],path.i[i][1], i);

        //// OPTION 2
        // cloned_path.setTripleAt(path.v[i][0] + (localMouseCoords[0] - path.v[i][0]) * mult, path.v[i][1] + (localMouseCoords[1] - path.v[i][1]) * mult
        //     ,path.o[i][0] + (localMouseCoords[0] - path.o[i][0]) * mult, path.o[i][1] + (localMouseCoords[1] - path.o[i][1]) * mult
        //     ,path.i[i][0] + (localMouseCoords[0] - path.i[i][0]) * mult, path.i[i][1] + (localMouseCoords[1] - path.i[i][1]) * mult, i);

    }


    //return shape_pool.clone(path);
    return cloned_path;
}

MouseModifier.prototype.processShapes = function(){
    var mouseX = this.elem.globalData.mouseCoords.x;
    var mouseY = this.elem.globalData.mouseCoords.y;
    var shapePaths;
    var i, len = this.shapes.length;
    var j, jLen;

    if(mouseX){

        var shapeData, newPaths, localShapeCollection, localMouseCoords;
        for(i=0;i<len;i+=1){
            shapeData = this.shapes[i];
            //localMouseCoords = this.elem.localToGlobal([mouseX,mouseY], shapeData.transformers);
            localMouseCoords = [mouseX,mouseY];
            newPaths = shapeData.shape.paths;
            localShapeCollection = shapeData.localShapeCollection;
            if(!(!shapeData.shape.mdf && !this.mdf)){
                localShapeCollection.releaseShapes();
                shapeData.shape.mdf = true;
                shapePaths = shapeData.shape.paths;
                jLen = shapePaths._length;
                for(j=0;j<jLen;j+=1){
                    if(!this.positions[i][j]){
                        this.positions[i][j] = {
                            v:[],
                            o:[],
                            i:[],
                            distV:[],
                            distO:[],
                            distI:[]
                        };
                    }
                    localShapeCollection.addShape(this.processPath(shapePaths.shapes[j],localMouseCoords,shapeData.transformers, this.positions[i][j]));
                }
                for(j=0;j<jLen;j+=1){
                }
                shapeData.shape.paths = shapeData.localShapeCollection;
            }
        }

    }

}

MouseModifier.prototype.initModifierProperties = function(elem,data){
    this.getValue = this.processKeys;
    this.data = data;
    this.positions = [];
    this.dynamicProperties.push({});
};



ShapeModifiers.registerModifier('ms',MouseModifier);