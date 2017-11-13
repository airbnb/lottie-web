function HierarchyElement(){}
HierarchyElement.prototype.resetHierarchy = function(){
    if(!this.hierarchy){
        this.hierarchy = [];
    }else{
        this.hierarchy.length = 0;
    }
};

HierarchyElement.prototype.getHierarchy = function(){
    if(!this.hierarchy){
        this.hierarchy = [];
    }
    return this.hierarchy;
};

HierarchyElement.prototype.setHierarchy = function(hierarchy){
    this.hierarchy = hierarchy;
};