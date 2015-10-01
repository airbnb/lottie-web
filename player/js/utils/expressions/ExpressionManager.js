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
        console.log(compData);
        var time = 0;

        ob.layer = layer;

        function EvalContext(item){
            var ob = {};
            var wiggler = [];
            var effect = getEffects(item.ef);
            var transform = getTransform(item);
            var inPoint = item.inPoint;
            var value;

            function evaluate(val){
                val = 'var fn = function(t,v){time=t;value=v;'+val+';return $bm_rt;}';
                eval(val);
                return new ExpressionObject(fn);
            }
            ob.evaluate = evaluate;
            return ob;
        }

        function SliderEffect(data){
            return function(value){
                var n = new Number(data.renderedData[time][0]);
                n.value = data.renderedData[time][0];
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

        var width = compData.compWidth || compData.width;
        var height = compData.compHeight || compData.height;
        ob.frameDuration = 1/compData.frameRate;
        var thisComp = ob;
        var layers = compData.layers;
        var i, len = layers.length, item;
        for(i=0;i<len;i+=1){
            item = layers[i];
            if(item.ks.r.x){
                item.ks.r.x = new EvalContext(item).evaluate(item.ks.r.x);
                registeredExpressions.push(item.ks.r.x);
            }
            if(item.ks.s.x){
                item.ks.s.x = new EvalContext(item).evaluate(item.ks.s.x);
                registeredExpressions.push(item.ks.s.x);
            }
            if(item.ks.p.s){
                if(item.ks.p.x.x){
                    item.ks.p.x.x = new EvalContext(item).evaluate(item.ks.p.x.x);
                    registeredExpressions.push(item.ks.p.x.x);
                }
                if(item.ks.p.y.x){
                    item.ks.p.y.x = new EvalContext(item).evaluate(item.ks.p.y.x);
                    registeredExpressions.push(item.ks.p.y.x);
                }
            }else if(item.ks.p.x){
                item.ks.p.x = new EvalContext(item).evaluate(item.ks.p.x);
                registeredExpressions.push(item.ks.p.x);
            }
        }

        ob.registerExpression = registerExpression;
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
                mt[0] = item.ks.r.x.fn(frameNum, mt[0]/degToRads)*degToRads;
            }
            if(item.ks.s.x){
                result = item.ks.s.x.fn(frameNum, [mt[1]*100, mt[2]*100]);
                mt[1] = result[0]/100;
                mt[2] = result[1]/100;
            }
            if(item.ks.p.s){
                if(item.ks.p.x.x){
                    mt[3] = item.ks.s.x.fn(frameNum, mt[3]);
                }
                if(item.ks.p.y.x){
                    mt[4] = item.ks.s.x.fn(frameNum,mt[4]);
                }
            }else if(item.ks.p.x){
                result = item.ks.s.x.fn(frameNum, [mt[3], mt[4]]);
                mt[3] = result[0];
                mt[4] = result[1];

            }
            if(((item.ks.p.s && (item.ks.p.x.x || item.ks.p.y.x)) || item.ks.p.x || item.ks.r.x || item.ks.s.x)){
                renderedData.an.matrixArray = matrixInstance.getMatrixArrayFromParams(mt[0],mt[1],mt[2],mt[3],mt[4]);
            }
        }
    }

    function registerExpression(layers,item, keys, fRate){
        //keys._x = new EvalContext(layers,item, fRate).evaluate(keys.x);
        //registeredExpressions.push(keys._x);
    }

    function searchExpressions(compData){
        if(compData.frameRate){
            frameRate = compData.frameRate;
        }
        var comp = new Composition(compData);
        comp.registerExpression();
    }

    ob.iterateExpressions = iterateExpressions;
    ob.registerExpression = registerExpression;
    ob.searchExpressions = searchExpressions;
    return ob;
}());