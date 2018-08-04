var ImagePreloader = (function(){

    function imageLoaded(){
        this.pendingImages -= 1;
        if(this.pendingImages === 0){
            if(this.imagesLoadedCb) {
                this.imagesLoadedCb(null);
            }
        }
    }

    function getAssetsPath(assetData){
        var path = '';
        if(assetData.e) {
            path = assetData.p;
        }else if(this.assetsPath){
            var imagePath = assetData.p;
            if(imagePath.indexOf('images/') !== -1){
                imagePath = imagePath.split('/')[1];
            }
            path = this.assetsPath + imagePath;
        } else {
            path = this.path;
            path += assetData.u ? assetData.u : '';
            path += assetData.p;
        }
        return path;
    }

    function loadImage(path){
        var img = createTag('img');
        img.crossOrigin = 'anonymous';
        img.addEventListener('load', imageLoaded.bind(this), false);
        img.addEventListener('error', imageLoaded.bind(this), false);
        img.src = path;
        return img;
    }
    function loadAssets(assets, cb){
        this.imagesLoadedCb = cb;
        this.totalAssets = assets.length;
        var i, image;
        for (i = 0; i < this.totalAssets; i +=1) {
            if (!assets[i].layers) {
                image = loadImage.bind(this)(getAssetsPath.bind(this)(assets[i]));
                this.imagesData.push({
                    img: image,
                    data: assets[i]
                })
                this.pendingImages += 1;
            }
        }
    }

    function setPath(path){
        this.path = path || '';
    }

    function setAssetsPath(path){
        this.assetsPath = path || '';
    }

    function destroy() {
        this.imagesLoadedCb = null;
        this.imagesData = null;
    }

    function getImageById(id) {
        var i = 0, len = this.imagesData.length;
        while(i < len) {
            if(this.imagesData[i].data.id === id) {
                return this.imagesData[i].img;
            }
            i += 1;
        }
        return null;
    }

    return function ImagePreloader(){
        this.loadAssets = loadAssets;
        this.setAssetsPath = setAssetsPath;
        this.setPath = setPath;
        this.destroy = destroy;
        this.getImageById = getImageById;
        this.assetsPath = '';
        this.path = '';
        this.totalAssets = 0;
        this.pendingImages = 0;
        this.imagesLoadedCb = null;
        this.imagesData = [];
    };
}());