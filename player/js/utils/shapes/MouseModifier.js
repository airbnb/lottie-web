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
    var i, len = path.v.length;
    var vValues = [],oValues = [],iValues = [];
    var dist;
    //console.log(mouseCoords);
    var theta, x,y;
    for(i=0;i<len;i+=1){
        if(!positions.v[i]){
            positions.v[i] = [path.v[i][0],path.v[i][1]];
            positions.o[i] = [path.o[i][0],path.o[i][1]];
            positions.i[i] = [path.i[i][0],path.i[i][1]];
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
        var distance = this.data.ss * this.data.mx / Math.sqrt( (x * x) + (y * y) );

        positions.o[i][0] += Math.cos(theta) * distance + (path.o[i][0] - positions.o[i][0]) * this.data.dc;
        positions.o[i][1] += Math.sin(theta) * distance + (path.o[i][1] - positions.o[i][1]) * this.data.dc;


        theta = Math.atan2(
            positions.i[i][1] - mouseCoords[1],
            positions.i[i][0] - mouseCoords[0]
        );
        x = mouseCoords[0] - positions.i[i][0];
        y = mouseCoords[1] - positions.i[i][1];
        var distance = this.data.ss * this.data.mx / Math.sqrt( (x * x) + (y * y) );

        positions.i[i][0] += Math.cos(theta) * distance + (path.i[i][0] - positions.i[i][0]) * this.data.dc;
        positions.i[i][1] += Math.sin(theta) * distance + (path.i[i][1] - positions.i[i][1]) * this.data.dc;

        vValues.push(positions.v[i]);
        oValues.push(positions.o[i]);
        iValues.push(positions.i[i]);
        /*iValues.push([path.i[i][0]+(positions.v[i][0]-path.v[i][0]),path.i[i][1]+(positions.v[i][1]-path.v[i][1])]);
        oValues.push([path.o[i][0]+(positions.v[i][0]-path.v[i][0]),path.o[i][1]+(positions.v[i][1]-path.v[i][1])]);*/
        /*iValues.push(path.i[i]);
        oValues.push(path.o[i]);*/


        /*dist = Math.sqrt(Math.pow(path.v[i][0]-mouseCoords[0],2)+Math.pow(path.v[i][1]-mouseCoords[1],2));
        if(dist>this.data.mx){
            vValues.push(path.v[i]);
            iValues.push(path.i[i]);
            oValues.push(path.o[i]);
        } else {
            //vValues.push(path.v[i]);
            vValues.push([path.v[i][0]+((mouseCoords[0]-path.v[i][0])/(this.data.mx-dist))*this.data.mx,path.v[i][1]+((mouseCoords[1]-path.v[i][1])/(this.data.mx-dist))*this.data.mx]);
            iValues.push([path.i[i][0]+((mouseCoords[0]-path.v[i][0])/(this.data.mx-dist))*this.data.mx,path.i[i][1]+((mouseCoords[1]-path.v[i][1])/(this.data.mx-dist))*this.data.mx]);
            oValues.push([path.o[i][0]+((mouseCoords[0]-path.v[i][0])/(this.data.mx-dist))*this.data.mx,path.o[i][1]+((mouseCoords[1]-path.v[i][1])/(this.data.mx-dist))*this.data.mx]);
        }*/
        /*dist = Math.sqrt(Math.pow(path.i[i][0]-mouseCoords[0],2)+Math.pow(path.i[i][1]-mouseCoords[1],2));
        if(dist>this.data.mx){
            iValues.push(path.i[i]);
        } else {
            iValues.push(path.i[i]);
            //iValues.push([path.i[i][0]+((mouseCoords[0]-path.i[i][0])/(this.data.mx-dist))*this.data.mx,path.i[i][1]+((mouseCoords[1]-path.i[i][1])/(this.data.mx-dist))*this.data.mx]);
            //iValues.push(path.i[i]);
        }
        dist = Math.sqrt(Math.pow(path.o[i][0]-mouseCoords[0],2)+Math.pow(path.o[i][1]-mouseCoords[1],2));
        if(dist>this.data.mx){
            oValues.push(path.o[i]);
        } else {
            oValues.push([mouseCoords[0],mouseCoords[1]]);
            //oValues.push([path.o[i][0]+((mouseCoords[0]-path.o[i][0])/(this.data.mx-dist))*this.data.mx,path.o[i][1]+((mouseCoords[1]-path.o[i][1])/(this.data.mx-dist))*this.data.mx]);
            //oValues.push(path.o[i]);
        }*/
    }
    return {
        v:vValues,
        o:oValues,
        i:iValues,
        c:path.c
    };
}

MouseModifier.prototype.processShapes = function(){
    var mouseX = this.elem.globalData.mouseX;
    var mouseY = this.elem.globalData.mouseY;
    var shapePaths;
    var i, len = this.shapes.length;
    var j, jLen;

    if(mouseX){
        var localMouseCoords = this.elem.globalToLocal([mouseX,mouseY,0]);

        var shapeData, newPaths = [];
        for(i=0;i<len;i+=1){
            shapeData = this.shapes[i];
            if(!shapeData.shape.mdf && !this.mdf){
                shapeData.shape.paths = shapeData.last;
            } else {
                shapeData.shape.mdf = true;
                shapePaths = shapeData.shape.paths;
                jLen = shapePaths.length;
                for(j=0;j<jLen;j+=1){
                    if(!this.positions[i][j]){
                        this.positions[i][j] = {
                            v:[],
                            o:[],
                            i:[]
                        };
                    }
                    newPaths.push(this.processPath(shapePaths[j],localMouseCoords, this.positions[i][j]));
                }
                shapeData.shape.paths = newPaths;
                shapeData.last = newPaths;
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