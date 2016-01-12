var ExpressionManager = (function(){
    var ob = {};

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


    function initiateExpression(elem,data){
        var val = data.x;
        var transform,content,effect;
        var thisComp = elem.comp;
        var fnStr = 'var fn = function(){'+val+';this.v = $bm_rt;}';
        eval(fnStr);
        var bindedFn = fn.bind(this);
        var numKeys = data.k ? data.k.length : 0;

        function effect(nm){
            return elem.effectsManager.getEffect(nm);
        }

        function nearestKey(time){
            var i = 0, len = data.k.length, ob = {};
            for(i=0;i<len;i+=1){
                if(time === data.k[i].t){
                    ob.index = i;
                    break;
                }else if(time<data.k[i].t){
                    ob.index = i;
                    break;
                }else if(time>data.k[i].t && i === len - 1){
                    ob.index = len - 1;
                    break;
                }
            }
            return ob;
        }
        function key(ind){
            ind -= 1;
            var ob = {
                time: data.k[ind].t/thisComp.globalData.frameRate
            };
            var arr;
            if(ind === data.k.length - 1){
                arr = data.k[ind-1].e;
            }else{
                arr = data.k[ind].s;
            }
            var i, len = arr.length;
            for(i=0;i<len;i+=1){
                ob[i] = arr[i];
            }
            return ob;
        }
        var time, value,textIndex,textTotal,selectorValue;
        function execute(){
            if(this.type === 'textSelector'){
                textIndex = this.textIndex;
                textTotal = this.textTotal;
                selectorValue = this.selectorValue;
            }
            if(!transform){
                transform = elem.transform;
            }
            if(!content && elem.content){
                content = elem.content.bind(elem);
            }
            if(this.getPreValue){
                this.getPreValue();
            }
            value = this.pv;
            time = this.comp.renderedFrame/this.comp.globalData.frameRate;
            bindedFn();
            var i,len;
            if(this.mult){
                if(typeof this.v === 'number'){
                    this.v *= this.mult;
                }else{
                    len = this.v.length;
                    if(value === this.v){
                        this.v = len === 2 ? [value[0],value[1]] : [value[0],value[1],value[2]];
                    }
                    for(i = 0; i < len; i += 1){
                        this.v[i] *= this.mult;
                    }
                }
            }
            if(typeof this.v === 'number'){
                if(this.lastValue !== this.v){
                    this.lastValue = this.v;
                    this.mdf = true;
                }
            }else if(this.v.i){
                // Todo Improve validation for masks and shapes
                this.mdf = true;
            }else{
                if(!this.lastValue){

                }
                len = this.v.length;
                for(i = 0; i < len; i += 1){
                    if(this.v[i] !== this.lastValue[i]){
                        this.lastValue[i] = this.v[i];
                        this.mdf = true;
                    }
                }
            }
        }
        return execute;
    }

    ob.initiateExpression = initiateExpression;
    return ob;
}());