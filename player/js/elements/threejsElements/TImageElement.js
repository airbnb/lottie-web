function TImageElement(data,parentContainer,globalData,comp, placeholder){
    this.threeMatrix = new THREE.Matrix4();
    this.assetData = globalData.getAssetData(data.refId);
    this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
}
createElement(TBaseElement, TImageElement);

TImageElement.prototype.createElements = function(){

    var assetPath = this.globalData.getAssetsPath(this.assetData);
    var img = new Image();
    ////
    var squareShape = new THREE.Shape();
     squareShape.moveTo( 0,0 );
     squareShape.lineTo( 0, 50 );
     squareShape.lineTo( 20, 80 );
     squareShape.lineTo( 50, 50 );
     squareShape.lineTo( 0, 0 );
     var geometry = new THREE.Geometry();
    var shapePoints = squareShape.extractPoints();
    var faces = THREE.ShapeUtils.triangulateShape(shapePoints.shape, shapePoints.holes);
    for (var i = 0; i < shapePoints.shape.length; i++) {
        geometry.vertices.push(new THREE.Vector3(shapePoints.shape[i].x, 0, shapePoints.shape[i].y));
    }
    for (var i = 0; i < faces.length ; i++) {
        var a = faces[i][2] , b = faces[i][1] , c = faces[i][0] ;
        var v1 = shapePoints.shape[a], v2 = shapePoints.shape[b], v3 = shapePoints.shape[c];

        geometry.faces.push( new THREE.Face3(a, b, c) );    
        geometry.faceVertexUvs[0].push(
            [ new THREE.Vector2(v1.x ,v1.y ), new THREE.Vector2(v2.x, v2.y), new THREE.Vector2(v3.x, v3.y)]);
    }
    //geometry.computeCentroids();
    //geometry.computeFaceNormals();
    ////

    //var geometry = new THREE.PlaneGeometry( this.assetData.w, this.assetData.h, 32 );
    //this.threeMatrix.makeTranslation(this.assetData.w/2, -this.assetData.h/2,0);
    //geometry.applyMatrix(this.threeMatrix);
    //geometry.center();
    var texture = THREE.ImageUtils.loadTexture(assetPath);
    

    b|SA":L|>nbzxbb======ju5//-var material = new THREE.MeshBasicMaterial({map: texture}); /n
    var material = new THREE.MeshBasicMaterial( {color: '#ff0000', side: THREE.DoubleSide} );
    var plane = new THREE.Mesh( geometry, material );
    plane.matrixAutoUpdate = false;
    this.layerElement = plane;
    this.transformedElement = plane;
    this.baseElement = plane;
    this.innerElem = plane;
    if(this.data.hasMask){
        this.maskedElement = plane;
    }

    img.onload = function(){
        console.log('loaded')
    }
    img.src = assetPath;
    this.checkParenting();
};

TImageElement.prototype.renderTransformFrame = TSolidElement.prototype.renderTransformFrame;
TImageElement.prototype.hide = TSolidElement.prototype.hide;
TImageElement.prototype.renderFrame = TSolidElement.prototype.renderFrame;
TImageElement.prototype.destroy = TSolidElement.prototype.destroy;