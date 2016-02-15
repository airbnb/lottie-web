var ImageManager = (function(){

    var images = [];
    var ob = {};

    function getImage(path){
        var i = 0, len = images.length;
        while(i<len) {
            if(images[i].path === path){
                images[i].count += 1;
                return images[i];
            }
            i += 1;
        }

        function imageLoaded(){
            imageOb.loaded = true;
        }

        var img = document.createElement('img');
        img.addEventListener('load', imageLoaded, false);
        img.addEventListener('error', imageLoaded, false);

        var imageOb = {
            elem: img,
            path: path,
            loaded: false,
            count: 1
        };
        img.src = path;
        images.push(imageOb);
        return imageOb;
    }

    function unregisterImage(ob){
        ob.count -= 1;
        if(ob.count === 0) {
            var ind = images.indexOf(ob);
            images.splice(ind, 1);
            ob.elem = null;
        }
    }

    ob.getImage = getImage;
    ob.unregisterImage = unregisterImage;

    return ob;
}());