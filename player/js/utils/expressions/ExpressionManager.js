var ExpressionManager = (function(){
   var ob = {};
    var matrixInstance =  new MatrixManager();
    var degToRads = Math.PI/180;
    var registeredExpressions = [];

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

    function EvalContext(layers, item, fRate){
        var ob = {};
        var wiggler = [];
        var frameRate = fRate;

        var thisComp = ob;
        var effect = getEffects(item.ef);
        var transform = getTransform(item);
        var inPoint = item.inPoint;
        var time = 0;
        var value;

        function evaluate(val){
            val = 'var fn = function(t,v){time=t;value=v;'+val+';return $bm_rt;}';
            eval(val);
            return fn;
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
                mt[0] = item.ks.r._x(frameNum, mt[0]/degToRads)*degToRads;
            }
            if(item.ks.s.x){
                result = item.ks.s._x(frameNum, [mt[1]*100, mt[2]*100]);
                mt[1] = result[0]/100;
                mt[2] = result[1]/100;
            }
            if(item.ks.p.s){
                if(item.ks.p.x.x){
                    mt[3] = item.ks.s._x(frameNum, mt[3]);
                }
                if(item.ks.p.y.x){
                    mt[4] = item.ks.s._x(frameNum,mt[4]);
                }
            }else if(item.ks.p.x){
                result = item.ks.s._x(frameNum, [mt[3], mt[4]]);
                mt[3] = result[0];
                mt[4] = result[1];

            }
            if(((item.ks.p.s && (item.ks.p.x.x || item.ks.p.y.x)) || item.ks.p.x || item.ks.r.x || item.ks.s.x)){
                renderedData.an.matrixArray = matrixInstance.getMatrixArrayFromParams(mt[0],mt[1],mt[2],mt[3],mt[4]);
            }
        }
    }

    function registerExpression(layers,item, keys, fRate){
        keys._x = new EvalContext(layers,item, fRate).evaluate(keys.x);
        registeredExpressions.push(keys._x);
    }

    ob.iterateExpressions = iterateExpressions;
    ob.registerExpression = registerExpression;
    return ob;
}());