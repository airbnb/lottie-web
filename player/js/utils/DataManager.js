function dataFunctionManager(){

    function completeLayers(layers, comps){
        var layerData;
        var animArray, lastFrame;
        var i, len = layers.length;
        var j, jLen, k, kLen;
        for(i=0;i<len;i+=1){
            layerData = layers[i];
            if(!('ks' in layerData) || layerData.completed){
                continue;
            }
            layerData.completed = true;
            if(layerData.tt){
                layers[i-1].td = layerData.tt;
            }
            animArray = [];
            lastFrame = -1;
            if(layerData.hasMask){
                var maskProps = layerData.masksProperties;
                jLen = maskProps.length;
                for(j=0;j<jLen;j+=1){
                    if(maskProps[j].pt.i){
                        convertPathsToAbsoluteValues(maskProps[j].pt);
                    }else{
                        kLen = maskProps[j].pt.length;
                        for(k=0;k<kLen;k+=1){
                            if(maskProps[j].pt[k].s){
                                convertPathsToAbsoluteValues(maskProps[j].pt[k].s[0]);
                            }
                            if(maskProps[j].pt[k].e){
                                convertPathsToAbsoluteValues(maskProps[j].pt[k].e[0]);
                            }
                        }
                    }
                }
            }
            if(layerData.ty===0){
                layerData.layers = findCompLayers(layerData.refId, comps);
                completeLayers(layerData.layers, comps);
            }else if(layerData.ty === 4){
                completeShapes(layerData.shapes);
            }
        }
    }

    function findCompLayers(id,comps){
        var i = 0, len = comps.length;
        while(i<len){
            if(comps[i].id === id){
                return JSON.parse(JSON.stringify(comps[i].layers));
            }
            i += 1;
        }
    }

    function completeShapes(arr,trimmedFlag){
        var i, len = arr.length;
        var j, jLen;
        var isTrimmed = trimmedFlag ? trimmedFlag : false;
        for(i=len-1;i>=0;i-=1){
            if(arr[i].ty == 'tm'){
                isTrimmed = true;
            }
            if(arr[i].ty == 'sh'){
                arr[i].trimmed = isTrimmed;
                if(arr[i].ks.i){
                    convertPathsToAbsoluteValues(arr[i].ks);
                }else{
                    jLen = arr[i].ks.length;
                    for(j=0;j<jLen;j+=1){
                        if(arr[i].ks[j].s){
                            convertPathsToAbsoluteValues(arr[i].ks[j].s[0]);
                        }
                        if(arr[i].ks[j].e){
                            convertPathsToAbsoluteValues(arr[i].ks[j].e[0]);
                        }
                    }
                }
            }else if(arr[i].ty == 'gr'){
                completeShapes(arr[i].it,isTrimmed);
            }
        }
    }

    function convertPathsToAbsoluteValues(path){
        var i, len = path.i.length;
        for(i=0;i<len;i+=1){
            path.i[i][0] += path.v[i][0];
            path.i[i][1] += path.v[i][1];
            path.o[i][0] += path.v[i][0];
            path.o[i][1] += path.v[i][1];
        }
    }

    function completeData(animationData){
        completeLayers(animationData.layers, animationData.assets);
    }

    var moduleOb = {};
    moduleOb.completeData = completeData;

    return moduleOb;
}

var dataManager = dataFunctionManager();