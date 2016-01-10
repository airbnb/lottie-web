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

    var tempAssetDict = {};

    for(var key in json){
        ++count;
        var attrValue = json[key],
            newPath = (oldPath !== "" ? oldPath + "." : ""),
            name = json.nm||"",
            shapes = json.shapes,
            refId = json.refId,
            newElement,
            isIndi = name.lastIndexOf("indi_",0) === 0,
            ty = json.ty,//layer type
            isImg = ty === 2,
            newPathStart,
            newPathEnd,
            alreadyExist = false;

        //if ( attrName === node )
        //if ( isIndi || isImg ){
        if ( isIndi ){
            //if the name exist
            //if ( undefined !== json["name"] )
            //{

            name = name.substring(5,name.length);
            ///work
            //if(ty === 2){//still -> assets type
            if(isImg){//still -> assets type
                var aPath = findAssetPath(root,refId);
                alreadyExist = tempAssetDict[aPath];
                if(aPath&&!alreadyExist){
                    newElement = {};
                    newElement.key = name;
                    newElement.value = aPath;
                    newElement.type = "image";
                    exportPath.push(newElement);
                    tempAssetDict[aPath] = true;
                }

            }

            //if ( name.lastIndexOf("indi_",0) === 0 )
            if ( isIndi ){


                //else if ( typeof attrValue === "object" && attrValue.length !== undefined )
                if ( typeof shapes === "object" && shapes.length !== undefined )
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
                                newPath = newPath+"."+i+".it.0";
                                alreadyExist = tempAssetDict[newPath];
                                newElement.value.push(newPath);
                                tempAssetDict[newPath] = true;
                            }
                            /* If the first it is a shape */
                            else if(firstItType === "sh"){
                                var ks = shapes[i].it[0].ks;
                                /* if there is a morph */
                                if(ks.length){
                                    var start = ks[0].s;
                                    var end = ks[0].e;
                                    if(start&&start[0]&&end&&end[0]){
                                        newPathStart = newPath+"."+i+".it.0.ks.0.s.0";
                                        newPathEnd = newPath+"."+i+".it.0.ks.0.e.0";

                                        newElement.value.push(newPathStart);
                                        newElement.value.push(newPathEnd);

                                        alreadyExist = tempAssetDict[newPathStart] || tempAssetDict[newPathEnd];

                                        tempAssetDict[newPathStart] = true;
                                        tempAssetDict[newPathEnd] = true;
                                    }
                                }
                                /* if there is only one shape */
                                else{
                                    newPath = newPath+"."+i+".it.0";
                                    alreadyExist = tempAssetDict[newPath];
                                    newElement.value.push(newPath);
                                    tempAssetDict[newPath] = true;
                                }
                                newElement.type = "tracking";

                            }
                            newElement.shapeLength = shapes.length;
                            if(!alreadyExist){
                                exportPath.push(newElement);
                            }

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