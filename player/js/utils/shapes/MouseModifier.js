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

MouseModifier.prototype.processPath = function(path, mouseCoords, positions){
    var cloned_path = shape_pool.newShape();
    cloned_path.c = path.c;
    var i, len = path._length;
    var dist;
    //console.log(mouseCoords);
    var theta, x,y;
    //// OPTION A
    for(i=0;i<len;i+=1){
        if(!positions.v[i]){
            positions.v[i] = [path.v[i][0],path.v[i][1]];
            positions.o[i] = [path.o[i][0],path.o[i][1]];
            positions.i[i] = [path.i[i][0],path.i[i][1]];
            positions.distV[i] = 0;
            positions.distO[i] = 0;
            positions.distI[i] = 0;

        }
        theta = Math.atan2(
            path.v[i][1] - mouseCoords[1],
            path.v[i][0] - mouseCoords[0]
        );

        x = mouseCoords[0] - positions.v[i][0];
        y = mouseCoords[1] - positions.v[i][1];
        var distance = Math.sqrt( (x * x) + (y * y) );
        positions.distV[i] += (distance - positions.distV[i]) * this.data.dc;

        positions.v[i][0] = Math.cos(theta) * Math.max(0,this.data.maxDist-positions.distV[i])/2 + (path.v[i][0]);
        positions.v[i][1] = Math.sin(theta) * Math.max(0,this.data.maxDist-positions.distV[i])/2 + (path.v[i][1]);


        theta = Math.atan2(
            path.o[i][1] - mouseCoords[1],
            path.o[i][0] - mouseCoords[0]
        );

        x = mouseCoords[0] - positions.o[i][0];
        y = mouseCoords[1] - positions.o[i][1];
        var distance = Math.sqrt( (x * x) + (y * y) );
        positions.distO[i] += (distance - positions.distO[i]) * this.data.dc;

        positions.o[i][0] = Math.cos(theta) * Math.max(0,this.data.maxDist-positions.distO[i])/2 + (path.o[i][0]);
        positions.o[i][1] = Math.sin(theta) * Math.max(0,this.data.maxDist-positions.distO[i])/2 + (path.o[i][1]);


        theta = Math.atan2(
            path.i[i][1] - mouseCoords[1],
            path.i[i][0] - mouseCoords[0]
        );

        x = mouseCoords[0] - positions.i[i][0];
        y = mouseCoords[1] - positions.i[i][1];
        var distance = Math.sqrt( (x * x) + (y * y) );
        positions.distI[i] += (distance - positions.distI[i]) * this.data.dc;

        positions.i[i][0] = Math.cos(theta) * Math.max(0,this.data.maxDist-positions.distI[i])/2 + (path.i[i][0]);
        positions.i[i][1] = Math.sin(theta) * Math.max(0,this.data.maxDist-positions.distI[i])/2 + (path.i[i][1]);

        /////OPTION 1
        cloned_path.setTripleAt(positions.v[i][0],positions.v[i][1],positions.o[i][0],positions.o[i][1],positions.i[i][0],positions.i[i][1], i)



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
         //oValues.push(positions.o[i]);
         //iValues.push(positions.i[i]);
    }



    //// OPTION B
    /*for(i=0;i<len;i+=1){
        if(!positions.v[i]){
            positions.v[i] = [path.v[i][0],path.v[i][1]];
            positions.o[i] = [path.o[i][0],path.o[i][1]];
            positions.i[i] = [path.i[i][0],path.i[i][1]];
            positions.distV[i] = 0;

        }
        theta = Math.atan2(
            positions.v[i][1] - mouseCoords[1],
            positions.v[i][0] - mouseCoords[0]
        );
        x = mouseCoords[0] - positions.v[i][0];
        y = mouseCoords[1] - positions.v[i][1];
        var distance = this.data.ss * this.data.mx / Math.sqrt( (x * x) + (y * y) );

        positions.v[i][0] += Math.cos(theta) * distance + (path.v[i][0] - positions.v[i][0]) * this.data.dc;
        positions.v[i][1] += Math.sin(theta) * distance + (path.v[i][1] - positions.v[i][1]) * this.data.dc;


        theta = Math.atan2(
            positions.o[i][1] - mouseCoords[1],
            positions.o[i][0] - mouseCoords[0]
        );
        x = mouseCoords[0] - positions.o[i][0];
        y = mouseCoords[1] - positions.o[i][1];
        var distance =  this.data.ss * this.data.mx / Math.sqrt( (x * x) + (y * y) );

        positions.o[i][0] += Math.cos(theta) * distance + (path.o[i][0] - positions.o[i][0]) * this.data.dc;
        positions.o[i][1] += Math.sin(theta) * distance + (path.o[i][1] - positions.o[i][1]) * this.data.dc;


        theta = Math.atan2(
            positions.i[i][1] - mouseCoords[1],
            positions.i[i][0] - mouseCoords[0]
        );
        x = mouseCoords[0] - positions.i[i][0];
        y = mouseCoords[1] - positions.i[i][1];
        var distance =  this.data.ss * this.data.mx / Math.sqrt( (x * x) + (y * y) );

        positions.i[i][0] += Math.cos(theta) * distance + (path.i[i][0] - positions.i[i][0]) * this.data.dc;
        positions.i[i][1] += Math.sin(theta) * distance + (path.i[i][1] - positions.i[i][1]) * this.data.dc;

        /////OPTION 1
        //vValues.push(positions.v[i]);
        // oValues.push(positions.o[i]);
        // iValues.push(positions.i[i]);



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


    return cloned_path;
}

MouseModifier.prototype.processShapes = function(){
    var mouseX = this.elem.globalData.mouseX || 200;
    var mouseY = this.elem.globalData.mouseY || 200;
    var shapePaths;
    var i, len = this.shapes.length;
    var j, jLen;

    if(mouseX){
        var localMouseCoords = this.elem.globalToLocal([mouseX,mouseY,0]);

        var shapeData, newPaths, localShapeCollection;
        for(i=0;i<len;i+=1){
            shapeData = this.shapes[i];
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
                    localShapeCollection.addShape(this.processPath(shapePaths.shapes[j],localMouseCoords, this.positions[i][j]));
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
};



ShapeModifiers.registerModifier('ms',MouseModifier);