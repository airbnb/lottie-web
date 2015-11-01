function dataFunctionManager(){

    function completeLayers(layers, comps, fontManager){
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
                completeLayers(layerData.layers, comps, fontManager);
            }else if(layerData.ty === 4){
                completeShapes(layerData.shapes);
            }else if(layerData.ty == 5){
                TextData_Helper.completeText(layerData, fontManager);
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

    function completeData(animationData, fontManager){
        completeLayers(animationData.layers, animationData.assets, fontManager);
    }




    function iterateLayers(layers, frameNum,renderType){

        var offsettedFrameNum;
        var j, jLen = layers.length, item;
        for(j=0;j<jLen;j+=1){
            item = layers[j];
            if(!('ks' in layers[j])) {
                continue;
            }
            offsettedFrameNum = frameNum - item.st;
            if(item.ty === 5) {
                iterateText(item, offsettedFrameNum, renderType);
            }
        }
    }

    function iterateText(item,offsettedFrameNum,renderType){
        var renderedData = item.renderedData[offsettedFrameNum];
        renderedData.t = {
        };
        if(item.t.p && 'm' in item.t.p) {
            renderedData.t.p = [];
            getInterpolatedValue(item.t.p.f,offsettedFrameNum, item.st,renderedData.t.p,0,1);
        }
        renderedData.t.m = {
            a: getInterpolatedValue(item.t.m.a,offsettedFrameNum, item.st)
        };

        var animators = item.t.a;
        var i, len = animators.length, animatorProps;
        renderedData.t.a = new Array(len);
        for(i = 0; i < len; i += 1) {
            animatorProps = animators[i];
            renderedData.t.a[i] = {
                a: {},
                s: {}
            };
            if('r' in animatorProps.a) {
                renderedData.t.a[i].a.r = getInterpolatedValue(animatorProps.a.r,offsettedFrameNum, item.st);
            }
            if('s' in animatorProps.a) {
                renderedData.t.a[i].a.s = getInterpolatedValue(animatorProps.a.s,offsettedFrameNum, item.st);
            }
            if('a' in animatorProps.a) {
                renderedData.t.a[i].a.a = getInterpolatedValue(animatorProps.a.a,offsettedFrameNum, item.st);
            }
            if('o' in animatorProps.a) {
                renderedData.t.a[i].a.o = getInterpolatedValue(animatorProps.a.o,offsettedFrameNum, item.st);
            }
            if('p' in animatorProps.a) {
                renderedData.t.a[i].a.p = getInterpolatedValue(animatorProps.a.p,offsettedFrameNum, item.st);
            }
            if('sw' in animatorProps.a) {
                renderedData.t.a[i].a.sw = getInterpolatedValue(animatorProps.a.sw,offsettedFrameNum, item.st);
            }
            if('sc' in animatorProps.a) {
                renderedData.t.a[i].a.sc = getInterpolatedValue(animatorProps.a.sc,offsettedFrameNum, item.st);
            }
            if('fc' in animatorProps.a) {
                renderedData.t.a[i].a.fc = getInterpolatedValue(animatorProps.a.fc,offsettedFrameNum, item.st);
            }
            if('t' in animatorProps.a) {
                renderedData.t.a[i].a.t = getInterpolatedValue(animatorProps.a.t,offsettedFrameNum, item.st);
            }
            if('s' in animatorProps.s) {
                renderedData.t.a[i].s.s = getInterpolatedValue(animatorProps.s.s,offsettedFrameNum, item.st);
            }else{
                renderedData.t.a[i].s.s = 0;
            }
            if('e' in animatorProps.s) {
                renderedData.t.a[i].s.e = getInterpolatedValue(animatorProps.s.e,offsettedFrameNum, item.st);
            }
            if('o' in animatorProps.s) {
                renderedData.t.a[i].s.o = getInterpolatedValue(animatorProps.s.o,offsettedFrameNum, item.st);
            }else{
                renderedData.t.a[i].s.o = 0;
            }
            if('xe' in animatorProps.s) {
                renderedData.t.a[i].s.xe = getInterpolatedValue(animatorProps.s.xe,offsettedFrameNum, item.st);
            }else{
                renderedData.t.a[i].s.xe = 0;
            }
            if('ne' in animatorProps.s) {
                renderedData.t.a[i].s.ne = getInterpolatedValue(animatorProps.s.ne,offsettedFrameNum, item.st);
            }else{
                renderedData.t.a[i].s.ne = 0;
            }
        }
        TextData_Helper.getMeasures(item, offsettedFrameNum,renderType);

        //console.log(item.t);
    }

    var moduleOb = {};
    moduleOb.completeData = completeData;

    return moduleOb;
}

var dataManager = dataFunctionManager();