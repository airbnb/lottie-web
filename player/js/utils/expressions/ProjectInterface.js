var ProjectInterface = (function (){

    function registerComposition(comp){
        this.compositions.push(comp);
    }

    return function(){
        function _thisProjectFunction(name){
            var i = 0, len = this.compositions.length;
            while(i<len){
                if(this.compositions[i].data && this.compositions[i].data.nm === name){
                    return this.compositions[i].compInterface;
                }
                i+=1;
            }
            console.log(this.compositions);
        }

        _thisProjectFunction.compositions = [];

        _thisProjectFunction.registerComposition = registerComposition;



        return _thisProjectFunction;
    }
}());