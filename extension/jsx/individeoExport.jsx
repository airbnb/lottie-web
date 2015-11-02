function getIndiShapes( json, objString )
{
    var indiShape = findNodesJSON( json, "shapes", "", []);
    return "var individeoRoadMap ="+JSON.stringify(indiShape)+";\nvar bmsmd ="+objString+";";
}

function findNodesJSON( json, node, path, exportArray )
{
    if(!json){
        return exportArray;
    }
    var exportPath = exportArray;
    var count = 0;
    var index = 0;
    var oldPath = path;
    var curPath = "";
    for(var key in json){
        ++count;
        var attrName = key;
        var attrValue = json[key];
        curPath = key;
        var newPath = (oldPath !== "" ? oldPath + "." : "") + curPath;

        if ( attrName === node )
        {
            if ( undefined !== json["name"] )
            {
                var name = json["name"];
                if ( name.lastIndexOf("indi_",0) === 0 )
                {
                    name = name.substring(5,name.length);
                    if ( typeof attrValue === "object" && attrValue.length !== undefined )
                    {
                        for ( var i=0 ; i<attrValue.length ; ++i )
                        {
                            if ( attrValue[i].ty === "gr" )
                            {
                                var newElement = {};
                                newElement["key"] = name;
                                newElement["value"] = newPath+"."+i+".it";
                                exportPath.push(newElement);
                            }
                        }
                        delete json["name"];
                    }
                }
            }
        }
        else if ( attrValue !== null && typeof attrValue === "object" && attrValue.length !== undefined )
        {
            for ( var i=0 ; i<attrValue.length ; ++i )
                findNodesJSON(attrValue[i], node, newPath+"."+i, exportArray);
        }
        else if ( attrValue !== null && typeof attrValue === "object" )
        {
            findNodesJSON(attrValue, node, newPath, exportArray);
        }
    }
    return exportPath;
}