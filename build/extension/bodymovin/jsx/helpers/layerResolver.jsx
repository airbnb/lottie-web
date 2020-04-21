$.__bodymovin.getLayerType = (function () {

    var layerTypes = $.__bodymovin.layerTypes;
    
    function avLayerType(lObj) {
        var lSource = lObj.source;
        if (lSource instanceof CompItem) {
            return layerTypes.precomp;
        }
        var lMainSource = lSource.mainSource;
        var lFile = lMainSource.file;
        if (!lObj.hasVideo) {
            return layerTypes.audio;
        } else if (lSource instanceof CompItem) {
            return layerTypes.precomp;
        } else if (lSource.frameDuration < 1) {
            if (lMainSource instanceof PlaceholderSource) {
                return layerTypes.pholderVideo;
            } else if (lSource.name.toString().indexOf("].") !== -1) {
                return layerTypes.imageSeq;
            } else {
                if(lMainSource.isStill) {
                    return layerTypes.still;
                } else {
                    return layerTypes.video;
                }
            }
        } else if (lSource.frameDuration === 1) {
            if (lMainSource instanceof PlaceholderSource) {
                return layerTypes.pholderStill;
            } else if (lMainSource.color) {
                return layerTypes.solid;
            } else {
                return layerTypes.still;
            }
        }
    }
    return function (layerOb) {
        try {
            var curLayer, instanceOfArray, instanceOfArrayLength, result;
            curLayer = layerOb;
            instanceOfArray = [AVLayer, CameraLayer, LightLayer, ShapeLayer, TextLayer];
            instanceOfArrayLength = instanceOfArray.length;
            /*if (curLayer.guideLayer) {
                return layerTypes.guide;
            } else */if (curLayer.adjustmentLayer) {
                return layerTypes.adjustment;
            } else if (curLayer.nullLayer) {
                return layerTypes.nullLayer;
            }
            var i;
            for (i = 0; i < instanceOfArrayLength; i++) {
                if (curLayer instanceof instanceOfArray[i]) {
                    result = instanceOfArray[i].name;
                    break;
                }
            }
            if (result === "AVLayer") {
                result = avLayerType(curLayer);
            } else if (result === "CameraLayer") {
                result = layerTypes.camera;
            } else if (result === "LightLayer") {
                result = layerTypes.light;
            } else if (result === "ShapeLayer") {
                result = layerTypes.shape;
            } else if (result === "TextLayer") {
                result = layerTypes.text;
            }
            return result;
        } catch (err) {alert(err.line.toString + " " + err.toString()); }
    };
}());