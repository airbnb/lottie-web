function getIndiShapes( json, objString )
{
    //var indiShape = findNodesJSON( json, "shapes", "", []);
    var indiShape = findNodesJSON( json, "name", "", [],json);
    return "var individeoRoadMap ="+JSON.stringify(indiShape)+";\nvar bmsmd ="+JSON.stringify(json)+";";
}

function findAssetPath(root,refId){
    var assets = root.assets || [],
        i=0,
        len = assets.length,
        asset;
    for(;i<len;i++){
        asset = assets[i]||{};
        if(asset.id === refId){
            return "assets."+i + ".p";
        }
    }
    return false;
}

function findNodesJSON( json, node, path, exportArray, root )
{
    if(!json){
        return exportArray;
    }
    var exportPath = exportArray;
    var count = 0;
    var index = 0;
    var oldPath = path,
        i;
    for(var key in json){
        ++count;
        var attrName = key;
        var attrValue = json[key];
        var newPath = (oldPath !== "" ? oldPath + "." : "");

        if ( attrName === node )
        {
            //if the name exist
            //if ( undefined !== json["name"] )
            //{
            var name = json.name,
                shapes = json.shapes,
                refId = json.refId,
                newElement;

            if ( name.lastIndexOf("indi_",0) === 0 )
            {

                name = name.substring(5,name.length);

                var ty = json.ty;//layer type
                ///work
                if(ty === 2){//still -> assets type
                    var aPath = findAssetPath(root,refId);
                    if(aPath){
                        newElement = {};
                        newElement.key = name;
                        newElement.value = aPath;
                        newElement.type = "image";
                        exportPath.push(newElement);
                    }

                }
                //else if ( typeof attrValue === "object" && attrValue.length !== undefined )
                else if ( typeof shapes === "object" && shapes.length !== undefined )
                {

                    newPath = newPath + "shapes";

                    for (i=0 ; i<shapes.length ; ++i )
                    {
                        if ( shapes[i].ty === "gr" )
                        {
                            newElement = {};
                            newElement.key = name;
                            newElement.value = [];

                            var firstItType = shapes[i].it[0].ty;
                            /* If the first it is a rectangle */
                            if(firstItType === "rc"){
                                newElement.type = "boxTransform";
                                newElement.value.push(newPath+"."+i+".it.0");
                            }
                            /* If the first it is a shape */
                            else if(firstItType === "sh"){
                                var ks = shapes[i].it[0].ks;
                                /* if there is a morph */
                                if(ks.length){
                                    var start = ks[0].s;
                                    var end = ks[0].e;
                                    if(start&&start[0]&&end&&end[0]){
                                        newElement.value.push(newPath+"."+i+".it.0.ks.0.s.0");
                                        newElement.value.push(newPath+"."+i+".it.0.ks.0.e.0");
                                    }
                                }
                                /* if there is only one shape */
                                else{
                                    newElement.value.push(newPath+"."+i+".it.0");
                                }
                                newElement.type = "tracking";
                            }
                            exportPath.push(newElement);
                        }
                    }

                }

                json.name = undefined;

            }
            //}
        }
        else if ( attrValue !== null && typeof attrValue === "object" && attrValue.length !== undefined )
        {
            newPath = newPath + key;
            for (i=0 ; i<attrValue.length ; ++i )
                findNodesJSON(attrValue[i], node, newPath+"."+i, exportArray,root);
        }
        else if ( attrValue !== null && typeof attrValue === "object" )
        {
            newPath = newPath + key;
            findNodesJSON(attrValue, node, newPath, exportArray,root);
        }


    }
    return exportPath;
}