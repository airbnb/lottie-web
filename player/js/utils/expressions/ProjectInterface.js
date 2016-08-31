var ProjectInterface = (function (){

    function registerComposition(comp){
        this.compositions.push(comp);
    }

    return function(){
        function _thisProjectFunction(name){
            console.log(this.compositions);
        }

        _thisProjectFunction.compositions = [];

        _thisProjectFunction.registerComposition = registerComposition;



        return _thisProjectFunction;
    }
}());