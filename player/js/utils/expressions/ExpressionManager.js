var ExpressionManager = (function(){
   var ob = {};
    var matrixInstance =  new MatrixManager();
    var degToRads = Math.PI/180;
    var frameRate;
    var registeredExpressions = [];




    function ExpressionObject(fn){
        this.pending = false;
        this.fn = fn;
    }



    function sum(a,b) {
        if(typeof a === 'number' && typeof b === 'number') {
            return a + b;
        }
        if(typeof a === 'object' && typeof b === 'number'){
            a[0] = a[0] + b;
            return a;
        }
        if(typeof a === 'number' && typeof b === 'object'){
            b[0] = a + b[0];
            return b;
        }
        if(typeof a === 'object' && typeof b === 'object'){
            var i = 0, lenA = a.length, lenB = b.length;
            var retArr = [];
            while(i<lenA || i < lenB){
                if(a[i] && b[i]){
                    retArr[i] = a[i] + b[i];
                }else{
                    retArr[i] = a[i] || b[i];
                }
                i += 1;
            }
            return retArr;
        }
        return 0;
    }

    function sub(a,b) {
        if(typeof a === 'number' && typeof b === 'number') {
            return a - b;
        }
        if(typeof a === 'object' && typeof b === 'number'){
            a[0] = a[0] - b;
            return a;
        }
        if(typeof a === 'number' && typeof b === 'object'){
            b[0] = a - b[0];
            return b;
        }
        if(typeof a === 'object' && typeof b === 'object'){
            var i = 0, lenA = a.length, lenB = b.length;
            var retArr = [];
            while(i<lenA || i < lenB){
                if(a[i] && b[i]){
                    retArr[i] = a[i] - b[i];
                }else{
                    retArr[i] = a[i] || b[i];
                }
                i += 1;
            }
            return retArr;
        }
        return 0;
    }

    function mul(a,b) {
        if(typeof a === 'number' && typeof b === 'number') {
            return a * b;
        }
        var i, len;
        if(typeof a === 'object' && typeof b === 'number'){
            len = a.length;
            for(i=0;i<len;i+=1){
                a[i] = a[i] * b;
            }
            return a;
        }
        if(typeof a === 'number' && typeof b === 'object'){
            len = b.length;
            for(i=0;i<len;i+=1){
                b[i] = a * b[i];
            }
            return b;
        }
        return 0;
    }

    function div(a,b) {
        if(typeof a === 'number' && typeof b === 'number') {
            return a / b;
        }
        var i, len;
        if(typeof a === 'object' && typeof b === 'number'){
            len = a.length;
            for(i=0;i<len;i+=1){
                a[i] = a[i] / b;
            }
            return a;
        }
        if(typeof a === 'number' && typeof b === 'object'){
            len = b.length;
            for(i=0;i<len;i+=1){
                b[i] = a / b[i];
            }
            return b;
        }
        return 0;
    }

    function clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    }
    function random(min,max){
        if(!max){
            max = 0;
        }
        if(min > max){
            var _m = max;
            max = min;
            min = _m;
        }
        return min + (Math.random()*(max-min));
    }

    function Composition(compData){
        var ob = {};
        var compExpressions = [];
        //console.log(compData);
        var time = 0;
        var frameN = 0;

        ob.layer = layer;

        function EvalContext(item){
            var ob = {};
            var wiggler = [];
            var effect = getEffects(item.ef);
            var transform = getTransform(item);
            var inPoint = item.ip;
            var value;

            function evaluate(val){
                val = 'var fn = function(t,v){time=t;value=v;frameN = Math.round(time*frameRate);'+val+';return $bm_rt;}';
                eval(val);
                return new ExpressionObject(fn);
            }
            ob.evaluate = evaluate;
            return ob;
        }

        function SliderEffect(data){
            return function(value){
                var n = new Number(data.renderedData[frameN][0]);
                n.value = data.renderedData[frameN][0];
                return n;
            }
        }

        function getEffects(ef){
            if(!ef){
                return;
            }
            var i,len = ef.length;
            return function(name){
                i = 0;
                while(i<len){
                    if(ef[i].nm == name){
                        if(ef[i].ty === 0){
                            return new SliderEffect(ef[i]);
                        }
                    }
                }
            }
        }

        function TransformConstructor(item,ty){
            var renderedData = item.renderedData;
            var ob = {
                get position (){
                    if(ty === 0){
                        return [renderedData[frameN].mt[4],renderedData[frameN].mt[5]];
                    }
                    return [renderedData[frameN].mtArr[4],renderedData[frameN].mtArr[5]];
                },
                get scale (){
                    if(ty === 0){
                        return [renderedData[frameN].mt[0],renderedData[frameN].mt[3]];
                    }
                    return [renderedData[frameN].mtArr[0],renderedData[frameN].mtArr[3]];
                }
            };

            return ob;
        }

        function getTransform(item){
            return new TransformConstructor(item);
        }

        function getContent(data){
            return function(name){
                var i = 0, len = data.shapes.length;
                while(i<len){
                    if(data.shapes[i].nm === name){
                        return getShapeProperties(data.shapes[i]);
                    }
                    i += 1;
                }
            }
        }

        function MaskData(data){
            var ob = {
                get maskPath (){
                    return data.paths[frameN];
                }
            };

            return ob;
        }

        function getMask(masksProperties){
            return function(name){
                var i = 0, len = masksProperties.length;
                while(i<len){
                    if(masksProperties[i].nm === name){
                        return new MaskData(masksProperties[i]);
                    }
                    i += 1;
                }
            }
        }

        function getProperties(data){
            var ob = {};
            ob.effect = getEffects(data.ef);
            ob.transform = getTransform(data,0);
            ob.content = getContent(data);
            if(data.hasMask){
                ob.mask = getMask(data.masksProperties);
            }
            return ob;
        }

        function getShapeProperties(data){
            var ob = {};
            ob.transform = getTransform(data.it[data.it.length - 1],1);
            ob.content = getContent(data);
            return ob;
        }

        function layer(name){
            var i = 0, len = layers.length;
            while(i<len){
                if(layers[i].nm == name){
                    return getProperties(layers[i]);
                }
                i += 1;
            }
        }

        var width = compData.w;
        var height = compData.h;
        ob.frameDuration = 1/frameRate;
        var thisComp = ob;
        var layers = compData.layers;
        var i, len = layers.length, item;
        for(i=0;i<len;i+=1){
            item = layers[i];
            if(!item.ks){
                continue;
            }
            if(typeof item.ks.r.x === 'string'){
                item.ks.r.x = new EvalContext(item).evaluate(item.ks.r.x);
                registeredExpressions.push(item.ks.r.x);
            }
            if(typeof item.ks.s.x === 'string'){
                item.ks.s.x = new EvalContext(item).evaluate(item.ks.s.x);
                registeredExpressions.push(item.ks.s.x);
            }
            if(item.ks.p.s){
                if(typeof item.ks.p.x.x === 'string'){
                    item.ks.p.x.x = new EvalContext(item).evaluate(item.ks.p.x.x);
                    registeredExpressions.push(item.ks.p.x.x);
                }
                if(typeof item.ks.p.y.x === 'string'){
                    item.ks.p.y.x = new EvalContext(item).evaluate(item.ks.p.y.x);
                    registeredExpressions.push(item.ks.p.y.x);
                }
            }else if(typeof item.ks.p.x === 'string'){
                item.ks.p.x = new EvalContext(item).evaluate(item.ks.p.x);
                registeredExpressions.push(item.ks.p.x);
            }
            if(typeof item.ks.o.x === 'string'){
                item.ks.o.x = new EvalContext(item).evaluate(item.ks.o.x);
            }

            if(item.hasMask){
                var j, jLen;
                var maskProps = item.masksProperties;
                jLen = maskProps.length;
                for(j=0;j<jLen;j+=1){
                    if(typeof maskProps[j].pt.x === 'string'){
                        maskProps[j].pt.x = new EvalContext(item).evaluate(maskProps[j].pt.x);
                    }
                }
            }
        }
        return ob;
    }

    function iterateExpressions(layers, frameNum,renderType){
        var offsettedFrameNum, i, len, renderedData;
        var j, jLen = layers.length, item;
        var mt, result, timeRemapped;
        for(j=0;j<jLen;j+=1) {
            item = layers[j];
            if(!item.ks){
                continue;
            }
            offsettedFrameNum = frameNum - item.st;
            renderedData = item.renderedData[offsettedFrameNum];
            renderedData.mt;
            if(item.ks.r.x){
                mt[0] = item.ks.r.x.fn(frameNum/frameRate, mt[0]/degToRads)*degToRads;
            }
            if(item.ks.s.x){
                result = item.ks.s.x.fn(frameNum/frameRate, [mt[1]*100, mt[2]*100]);
                mt[1] = result[0]/100;
                mt[2] = result[1]/100;
            }
            if(item.ks.p.s){
                if(item.ks.p.x.x){
                    mt[3] = item.ks.s.x.fn(frameNum/frameRate, mt[3]);
                }
                if(item.ks.p.y.x){
                    mt[4] = item.ks.s.x.fn(frameNum/frameRate,mt[4]);
                }
            }else if(item.ks.p.x){
                result = item.ks.p.x.fn(frameNum/frameRate, [mt[3], mt[4]]);
                mt[3] = result[0];
                mt[4] = result[1];

            }
            if(item.ks.o.x){
                renderedData.an.tr.o = item.ks.o.x.fn(frameNum/frameRate, renderedData.an.tr.o*100)/100;
            }
            if(((item.ks.p.s && (item.ks.p.x.x || item.ks.p.y.x)) || item.ks.p.x || item.ks.r.x || item.ks.s.x)){
                renderedData.an.matrixArray = matrixInstance.getMatrixArrayFromParams(mt[0],mt[1],mt[2],mt[3],mt[4]);
            }
            if(item.ty === 'PreCompLayer'){
                timeRemapped = item.tm ? item.tm[offsettedFrameNum] < 0 ? 0 : offsettedFrameNum >= item.tm.length ? item.tm[item.tm.length - 1] :  item.tm[offsettedFrameNum] : offsettedFrameNum;
                iterateExpressions(item.layers,timeRemapped,renderType);
            }

            if(item.hasMask){
                var maskProps = item.masksProperties;
                len = maskProps.length;
                for(i=0;i<len;i+=1){
                    if(maskProps[i].pt.x){
                        result = maskProps[i].pt.x.fn(frameNum/frameRate);
                        maskProps[i].paths[frameNum] = result;
                    }
                }
            }
        }
    }

    function searchExpressions(compData){
        if(compData.fr){
            frameRate = compData.fr;
        }
        var comp = new Composition(compData);
    }

    ob.iterateExpressions = iterateExpressions;
    ob.searchExpressions = searchExpressions;
    return ob;
}());