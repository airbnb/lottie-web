function TSolidElement(data,parentContainer,globalData,comp, placeholder){
    this.threeMatrix = new THREE.Matrix4();
    this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
}
createElement(TBaseElement, TSolidElement);

TSolidElement.prototype.createElements = function(){

    var geometry = new THREE.PlaneGeometry( this.data.sw, this.data.sh, 32 );
    this.threeMatrix.makeTranslation(this.data.sw/2, -this.data.sh/2,0);
    geometry.applyMatrix(this.threeMatrix);
    //geometry.center();
    var material = new THREE.MeshBasicMaterial( {color: this.data.sc, side: THREE.DoubleSide} );
    var plane = new THREE.Mesh( geometry, material );
    plane.matrixAutoUpdate = false;
    
    this.layerElement = plane;
    this.transformedElement = plane;
    //this.appendNodeToParent(parent);
    this.baseElement = plane;
    this.innerElem = plane;
    if(this.data.bm !== 0){
        this.setBlendMode();
    }
    if(this.data.hasMask){
        this.maskedElement = plane;
    }
    this.checkParenting();
};

TSolidElement.prototype.renderTransformFrame = TBaseElement.prototype.renderFrame;

TSolidElement.prototype.renderFrame = function() {
    this.renderTransformFrame();
    //console.log(this.finalMat);
    //console.log(this.layerElement.geometry);
    var props = this.finalMat.props;
    //console.log(props);
    /*this.threeMatrix.set(props[0],props[1],props[2],props[3],
        props[4],props[5],props[6],props[7],
        props[8],props[9],props[10],props[11],
        0.1,0,0,props[15])*/
    //this.threeMatrix.identity();
    this.layerElement.matrix.set(props[0],props[4],props[8],props[12],
                        props[1],props[5],props[9],props[13],
                        props[2],props[6],props[10],props[14],
                        props[3],props[7],props[11],props[15]);

    this.layerElement.updateMatrixWorld( true );
}



TSolidElement.prototype.hide = IImageElement.prototype.hide;
TSolidElement.prototype.destroy = IImageElement.prototype.destroy;