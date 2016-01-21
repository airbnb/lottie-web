/****** INIT Assets Manager ******/
(function(){
    var ob = {};
    var sourceAssets = [];
    var sourceExportData = [];

    function reset(){
        sourceAssets = [];
        sourceExportData = [];
    }

    function associateLayerToSource(layer, source){
        var i=0, len = sourceAssets.length;
        while(i<len){
            if(sourceAssets[i].s === source){
                sourceAssets[i].l.push(layer);
                break;
            }
            i+=1;
        }
    }

    function exportFileFromLayer(layer, filesDirectory){
        var i = 0, len = sourceAssets.length;
        var j, jLen, found = false;
        while(i<len){
            j = 0;
            jLen = sourceAssets[i].l.length;
            while(j<jLen){
                if(sourceAssets[i].l[j] === layer){
                    found = true;
                    if(sourceAssets[i].exported === false){
                        var imageName = 'imagen_'+i;
                        var imageExtension = 'png';
                        var destinationFile = new File(filesDirectory.fullName+'/'+imageName+'.'+imageExtension);
                        sourceAssets[i].f.copy(destinationFile);
                        sourceAssets[i].exported = true;
                        sourceAssets[i].path = 'files/'+imageName+'.'+imageExtension;
                    }
                }
                j+=1;
            }
            if(found === true){
                return i;
            }
            i+=1;
        }
    }

    function createAssetsDataForExport(){
        sourceAssets.forEach(function(item){
            if(item.exported === true){
                sourceExportData.push({path:item.path});
            }
        })
    }

    function createLayerSource(file, layer, source){
        sourceAssets.push({s:source,f:file,l:[layer], exported:false});
    }

    function getAssetsData(){
        return sourceExportData;
    }
    ob.getAssetsData = getAssetsData;
    ob.reset = reset;
    ob.associateLayerToSource = associateLayerToSource;
    ob.createLayerSource = createLayerSource;
    ob.createAssetsDataForExport = createAssetsDataForExport;
    ob.exportFileFromLayer = exportFileFromLayer;
    AssetsManager = ob;

}());
/****** END Assets Manager ******/