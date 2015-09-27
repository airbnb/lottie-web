var ExpressionManager = (function(){
   var ob = {};
    var matrixInstance =  new MatrixManager();
    var degToRads = Math.PI/180;
    var registeredExpressions = [];

    function clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    }

    function EvalContext(layers, item){
        var ob = {};

        var thisComp = ob;
        var effect = getEffects(item.ef);
        var transform = getTransform(item);
        var time = 0;

        function evaluate(val){
            val = 'var fn = function(t){time=t;'+val+';return $bm_rt;}';
            eval(val);
            return fn;
            /*console.log('val: ',val);
            return function(t){
                time = t;
                eval(val);
                return retorno;
            }*/
        }

        function SliderEffect(data){
            return function(value){
                var n = new Number(data.renderedData[time][0]);
                n.value = data.renderedData[time][0];
                return n;
            }
        }

        function getEffects(ef){
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

        function TransformConstructor(item){
            var ob = {
                get position (){
                    return [item.renderedData[time].mt[3],item.renderedData[time].mt[4]];
                }
            };

            return ob;
        }

        function getTransform(item){
            return new TransformConstructor(item);
        }

        function getProperties(data){
            var ob = {};
            ob.effect = getEffects(data.ef);
            ob.transform = getTransform(data);
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

        ob.layer = layer;
        ob.evaluate = evaluate;
        return ob;
    }

    function iterateExpressions(layers, frameNum,renderType){
        var offsettedFrameNum, i, len, renderedData;
        var j, jLen = layers.length, item;
        var mt, result;
        for(j=0;j<jLen;j+=1) {
            item = layers[j];
            offsettedFrameNum = frameNum - item.startTime;
            renderedData = item.renderedData[offsettedFrameNum];
            //console.log(renderedData);
            var mt = renderedData.mt;
            if(item.ks.r.x){
                mt[0] = item.ks.r._x(frameNum)*degToRads;
            }
            if(item.ks.s.x){
                result = item.ks.s._x(frameNum);
                mt[1] = result[0]/100;
                mt[2] = result[1]/100;
            }
            if(item.ks.p.s){
                if(item.ks.p.x.x){
                    mt[3] = item.ks.s._x(frameNum);
                }
                if(item.ks.p.y.x){
                    mt[4] = item.ks.s._x(frameNum);
                }
            }else if(item.ks.p.x){
                result = item.ks.s._x(frameNum);
                mt[3] = result[0];
                mt[4] = result[1];

            }
            if(((item.ks.p.s && (item.ks.p.x.x || item.ks.p.y.x)) || item.ks.p.x || item.ks.r.x || item.ks.s.x)){
                renderedData.an.matrixArray = matrixInstance.getMatrixArrayFromParams(mt[0],mt[1],mt[2],mt[3],mt[4]);
            }
        }
    }

    function registerExpression(layers,item, keys){
        keys._x = new EvalContext(layers,item).evaluate(keys.x);
        registeredExpressions.push(keys._x);
    }

    ob.iterateExpressions = iterateExpressions;
    ob.registerExpression = registerExpression;
    return ob;
}());