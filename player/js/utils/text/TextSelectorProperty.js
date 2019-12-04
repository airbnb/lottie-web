var TextSelectorProp = (function(){
    var max = Math.max;
    var min = Math.min;
    var floor = Math.floor;

    function TextSelectorProp(elem,data){
        this._currentTextLength = -1;
        this.k = false;
        this.data = data;
        this.elem = elem;
        this.comp = elem.comp;
        this.finalS = 0;
        this.finalE = 0;
        this.initDynamicPropertyContainer(elem);
        this.s = PropertyFactory.getProp(elem,data.s || {k:0},0,0,this);
        if('e' in data){
            this.e = PropertyFactory.getProp(elem,data.e,0,0,this);
        }else{
            this.e = {v:100};
        }
        this.o = PropertyFactory.getProp(elem,data.o || {k:0},0,0,this);
        this.xe = PropertyFactory.getProp(elem,data.xe || {k:0},0,0,this);
        this.ne = PropertyFactory.getProp(elem,data.ne || {k:0},0,0,this);
        this.a = PropertyFactory.getProp(elem,data.a,0,0.01,this);
        if(!this.dynamicProperties.length){
            this.getValue();
        }
    }

    TextSelectorProp.prototype = {
        getMult: function(ind) {
            if(this._currentTextLength !== this.elem.textProperty.currentData.l.length) {
                this.getValue();
            }
            //var easer = bez.getEasingCurve(this.ne.v/100,0,1-this.xe.v/100,1);
            var x1 = 0;
            var y1 = 0;
            var x2 = 1;
            var y2 = 1;
            if(this.ne.v > 0) {
                x1 = this.ne.v / 100.0;
            }
            else {
                y1 = -this.ne.v / 100.0;
            }
            if(this.xe.v > 0) {
                x2 = 1.0 - this.xe.v / 100.0;
            }
            else {
                y2 = 1.0 + this.xe.v / 100.0;
            }
            var easer = BezierFactory.getBezierEasing(x1, y1, x2, y2).get;

            var mult = 0;
            var s = this.finalS;
            var e = this.finalE;
            var type = this.data.sh;
            if (type === 2){
                if (e === s) {
                    mult = ind >= e ? 1 : 0;
                } else {
                    mult = max(0, min(0.5 / (e - s) + (ind - s) / (e - s), 1));
                }
                mult = easer(mult);
            } else if(type === 3) {
                if (e === s) {
                    mult = ind >= e ? 0 : 1;
                }else{
                    mult = 1 - max(0, min(0.5 / (e - s) + (ind - s) / (e - s),1));
                }

                mult = easer(mult);
            } else if (type === 4) {
                if (e === s) {
                    mult = 0;
                } else {
                    mult = max(0, min(0.5 / (e - s) + (ind - s) / (e - s), 1));
                    if (mult < 0.5) {
                        mult *= 2;
                    } else {
                        mult = 1 - 2 * (mult - 0.5);
                    }
                }
                mult = easer(mult);
            } else if (type === 5) {
                if (e === s){
                    mult = 0;
                } else {
                    var tot = e - s;
                    /*ind += 0.5;
                    mult = -4/(tot*tot)*(ind*ind)+(4/tot)*ind;*/
                    ind = min(max(0, ind + 0.5 - s), e - s);
                    var x = -tot/2+ind;
                    var a = tot/2;
                    mult = Math.sqrt(1 - (x * x) / (a * a));
                }
                mult = easer(mult);
            } else if (type === 6) {
                if (e === s){
                    mult = 0;
                } else {
                    ind = min(max(0, ind + 0.5 - s), e - s);
                    mult = (1 + (Math.cos((Math.PI + Math.PI * 2 * (ind) / (e - s))))) / 2;
                }
                mult = easer(mult);
            } else {
                if (ind >= floor(s)) {
                    if (ind - s < 0) {
                        mult = max(0, min(min(e, 1) - (s - ind), 1));
                    } else {
                        mult = max(0, min(e - ind, 1));
                    }
                }
                mult = easer(mult);
            }
            return mult*this.a.v;
        },
        getValue: function(newCharsFlag) {
            this.iterateDynamicProperties();
            this._mdf = newCharsFlag || this._mdf;
            this._currentTextLength = this.elem.textProperty.currentData.l.length || 0;
            if(newCharsFlag && this.data.r === 2) {
                this.e.v = this._currentTextLength;
            }
            var divisor = this.data.r === 2 ? 1 : 100 / this.data.totalChars;
            var o = this.o.v/divisor;
            var s = this.s.v/divisor + o;
            var e = (this.e.v/divisor) + o;
            if(s>e){
                var _s = s;
                s = e;
                e = _s;
            }
            this.finalS = s;
            this.finalE = e;
        }
    }
    extendPrototype([DynamicPropertyContainer], TextSelectorProp);

    function getTextSelectorProp(elem, data,arr) {
        return new TextSelectorProp(elem, data, arr);
    }

    return {
        getTextSelectorProp: getTextSelectorProp
    };
}());

    